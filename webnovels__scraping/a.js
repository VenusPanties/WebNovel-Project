const fs = require('fs');
const puppeteer = require('puppeteer');
const { Cluster } = require('puppeteer-cluster');
const { convertArrayToCSV } = require('convert-array-to-csv');
const path = require('path');
// Access command-line arguments



async function AddNovels(numNovels, numChapters) {
    let novelLists = [];

fs.readFile(path.join(__dirname, 'Novels List.txt'), async (err, data) => {
    if (err) {
        console.error("Error Reading File");
    } else {
        novelLists = JSON.parse(data);
        console.log(`File Read Success`);
        
        // Loop through the first 10 novels or the length of the novel list
        for (let i = 0; i < Math.min(numNovels, novelLists.length); i++) {
            await new Promise(resolve => setTimeout(resolve, 100)); // Wait 100ms before scraping each novel
            await WebScrape(novelLists[0]);
            novelLists.shift();
        }

        // update the novel lists
        fs.writeFileSync(path.join(__dirname, 'Novels List.txt'), JSON.stringify(novelLists));
    }
});



async function WebScrape(url){
    // open browser
    const browser = await puppeteer.launch( {headless:'new', timeout: 600000}) // make it visible and longer timeout
    // open new page
    const page = await browser.newPage();

    // setRequestInterprector for faster load by limiting image, font etc
    await page.setRequestInterception(true)

    await page.on('request', (request)=>{
        if(['font', 'stylesheet'].includes(request.resourceType())){
            request.abort();
        }
        else{
            request.continue();
        }
    })
    await page.setViewport({
        width: 1920,
        height: 1080,
        deviceScaleFactor: 4, // High pixel density
    });

    // go to novelfull page
    await page.goto(url);
   
    // get title, image, rating, info and description

    const novelData = await page.evaluate(async() => {
        const novelData = {};
    
        // Get the novel title
        const titleElement = document.querySelector('.title');
        if (titleElement) {
            novelData.title = titleElement.textContent.trim();
        }
    
    
        
        // Get the novel rating
        const ratingElements = document.querySelectorAll('.small strong span');
        ratingElements.forEach((element, index)=>{
            const ratingName = index == 0 ? 'rating' : 'totalRaters';
            novelData[ratingName] = element.textContent.trim();
        })
    
        // Get the novel description
        const descriptionElements = document.querySelectorAll('.desc-text p');
        novelData.description = Array.from(descriptionElements)
            .map((desc) => desc.textContent.trim())
            .join('\n');
    
    
        const infoEvents = document.querySelectorAll('.info div');
        try {
            infoEvents.forEach((event) => {
                const headerEvent = event.querySelector('h3');
                const bodyEvents = event.querySelectorAll('a');
                
                if (headerEvent) {
                    const key = headerEvent.textContent.trim(); // Use the header as the key
                    if (bodyEvents.length > 0) {
                        // If there are multiple links, join their text content
                        const values = Array.from(bodyEvents).map((event) => event.textContent.trim());
                        novelData[key] = values; // Join values with a comma
                    } else {
                        // If no links, fallback to plain text content
                        const plainText = event.textContent.replace(headerEvent.textContent, '').trim();
                        novelData[key] = plainText || 'N/A'; // Handle missing text gracefully
                    }
                }
            });
        } catch (err) {
            console.log(`Error parsing .info section: ${err}`);
        }
        return novelData;

    });
    // Get the novel cover image URL
        // Wait for the image element to be visible
        const imageElement = await page.waitForSelector('.books .book img');

        // Get the bounding box of the element
        const boundingBox = await imageElement.boundingBox();
        if (!boundingBox) {
            throw new Error("Bounding box not found, ensure the selector is correct.");
        }

        const sanitizedTitle = novelData.title.replace(/[^a-zA-Z0-9]/g, '_');
        const ssPath = path.join(__dirname, '../frontend/public/images', `${sanitizedTitle}.png`);


        // Ensure the directory exists
        // Take a screenshot of the specific element
        await page.screenshot({
            path: ssPath,
            type: 'png',
            clip: {
                x: boundingBox.x + 10,
                y: boundingBox.y,
                width: boundingBox.width - 15,
                height: boundingBox.height - 10
            }
        });
        novelData.image = ssPath;


    // call Scrape function and
    // if there is next Page open next Page and call Scrape again
    // else exist the loop

    let nextPageExist = true;
    let data = [];
    let count = 0; // page count
    while(nextPageExist){
        count += 1
        const pageData = await Scrape(page);
        data = data.concat(pageData[0]);
        const nextPageLink = pageData[1];

        nextPageExist = nextPageLink && count < 3;
        if(nextPageExist){
            await page.goto(nextPageLink);
        }
    }

    // open each individual chapter link and
    // get content of each chapter
    // for faster result, use concurrent execution

    const { Cluster } = require('puppeteer-cluster');
    
    const logFilePath = path.join(__dirname, 'log/successLog.txt');
    const errorFilePath = path.join(__dirname, 'log/errorLog.txt');
    
    let totalTimeTaken = 0; // In minutes

        const cluster = await Cluster.launch({
            concurrency: Cluster.CONCURRENCY_CONTEXT,
            maxConcurrency: 5,
            retryLimit: 3,
            puppeteerOptions: {
                headless: 'new',
                timeout: 0,
            },
        });
        
        const contents = new Array(data.length).fill(null);
        // Define the task for the cluster
        await cluster.task(async ({ page, data: { link, index } }) => {
            const startTime = process.hrtime(); // Start timer
    
            try {
                await page.goto(link, {waitUntil: "domcontentloaded", timeout: 0 });
                // Extract chapter content
                const content = await page.evaluate(() => {
                    // Get all paragraph elements and convert to array of text
                    let content = Array.from(document.querySelectorAll('.chapter-c p'))
                        .map(event => event.textContent.trim());

                    return content;
                });
    
                // Calculate time taken
                const endTime = process.hrtime(startTime);
                const timeTaken = endTime[0] + endTime[1] / 1e9; // Convert to seconds
                totalTimeTaken += timeTaken / 60 // convert to minute
    
                // Log success
                const logMessage = `Chapter ${index + 1} finished ... time taken ${timeTaken}s\n`;
                fs.appendFileSync(logFilePath, logMessage);
                console.log(logMessage);
    
                contents[index] = content;
            } catch (error) {
                // Log error
                const errorLogMessage = `Error processing chapter ${link}: ${error.message}\n`;
                fs.appendFileSync(errorFilePath, errorLogMessage);
                console.error(errorLogMessage);
                contents[index] = [];

            }
        });
    
        // Queue tasks
        const totalChapters = (data.length < numChapters) ? data.length : numChapters
        data.slice(0, totalChapters).forEach((chapter, index) => {
            cluster.queue({ link: chapter.link, index });
        });

        
    
        // Wait for all tasks to complete
        await cluster.idle();
        await cluster.close();
    
    await browser.close();
    console.log(novelData)
    console.log(`Total Time Taken ${totalTimeTaken} ms`)

    // change these data into csv format and
    // add them to .csv file respectively
    
    const novelDataArray = [
        Object.values(novelData).map(value => 
            Array.isArray(value) ? JSON.stringify(value) : value
        )
    ];    const novelDataCsv = convertArrayToCSV(novelDataArray, { header : false});

    const chapterData = [];
    data.forEach((item, index)=>{
        chapterData.push([
            novelData.title,
            item.title,
            index + 1,
            JSON.stringify(contents[index])
        ])
    })

    const chapterDataCsv = convertArrayToCSV(chapterData.slice(0, totalChapters), {header : false});

        // Write the CSV files
    try {
        fs.appendFileSync(path.join(__dirname, 'csv/NovelData.csv'), novelDataCsv);
        console.log(`${novelData.Title} Novel data saved successfully.`)
        const message = `${novelData.Title} Novel Data Success | Time Taken : ${totalTimeTaken}ms`;
        fs.appendFileSync(path.join(__dirname, 'log/NovelLog.txt'), message + "\n")
    } catch (err) {
        console.error("Failed to save novel data:", err);
    }

    try {
        fs.appendFileSync(path.join(__dirname, 'csv/ChapterData.csv'), chapterDataCsv);
        console.log("Chapter data saved successfully.");
        const message = `${novelData.Title} Chapter Data Success | Time Taken : ${totalTimeTaken}ms`;
    fs.appendFileSync(path.join(__dirname, 'log/NovelLog.txt'), message + "\n")
    } catch (err) {
        console.error("Failed to save chapter data:", err);
    }
}
}


// function to get chapter name and chapter link from the page as well as next page link
async function Scrape(page) {
    return await page.evaluate(()=>{
        const events = document.querySelectorAll(".list-chapter li a");
        const data = Array.from(events).map((event) => ({title : event.textContent.trim(), link: event.href}))

        const nextEvent = document.querySelector(".next a");
        const nextPageLink = nextEvent ? nextEvent.href : null;

        return [data, nextPageLink]
    })
}

AddNovels(1, 1);