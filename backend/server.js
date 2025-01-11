const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const fs = require('fs')
const dotenv = require('dotenv');
const {Schema} = require('mongoose')
const bcrypt  = require('bcrypt');
const csv = require('csv-parser');
const axios = require('axios');
const http = require('http');
const { Server } = require('socket.io');
const {userModel, commentModel, novelDataModel, chapterDataModel, libraryModel, adminModel} = require('./models/models.js')
dotenv.config();
const { exec } = require('child_process');
const { emit } = require('process');


const app = express();

const port = 5000;
const connection_string = process.env.MONGOOSE_URL;

const server = http.createServer(app);
const io = new Server(server, {
    cors : {
        origin : ['http://localhost:5173', 'http://127.0.0.1:5173'],
        methods : ['GET', 'POST']
    }
});



app.use(cors({
    origin: '*'
}));
app.use(express.json())
mongoose.connect(connection_string, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    retryWrites: true,
    retryReads: true
}).then(()=>{
    console.log("Database connected successfully")
}).catch(err =>{
    console.log(`Error ${err}`)
})




app.post('/user/signup', async(req, res) => {
    const {username, email, password} = req.body;
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Check if email already exists
    const isEmailAlreadyExist = await userModel.findOne({ email });
    if (isEmailAlreadyExist) {
        return res.status(400).send({ message: 'Email already exists, try logging in' });
    }
    // Check if username already exists
    const isUserAlreadyExist = await userModel.findOne({ username });
    if (isUserAlreadyExist) {
        return res.status(400).send({ message: 'Username already exists' });
    }
    
    try{
        await userModel.create({username, email, password : hashedPassword})
        res.status(201).send({message : 'New User Added'})
    }
    catch(err){
        console.error('Something went wrong:', err);
        res.status(500).send({ message: 'Internal Server Error', error: err.message });
    }
    
})
app.post('/user/signin', async(req, res) => {
    const {email, password} = req.body;
    try {
        const user = await userModel.findOne({email: email});
        if (!user) {
            return res.status(401).json({message: 'Invalid email or password'});
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if(!isPasswordValid){
            return res.status(401).json({message: 'Invalid email or password'});
        };
        return res.status(200).send(user)

    } catch (err) {
        return res.status(500).json({message: 'Internal server error', error: err.message});
    }
});
app.post('/admin/signup', async(req, res) => {
    const {username, email, password} = req.body;
    console.log(username, email, password)

    
    // Validate required fields
    if (!username || !email || !password) {
        return res.status(400).send({ message: 'All fields are required' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 12);
        
        const newAdmin = new adminModel({
            username: username,  // explicitly specify field names
            email: email,
            password: hashedPassword
        });
        
        await newAdmin.save();
        res.status(201).send({message: 'New Admin Added'});
    } catch(err) {
        console.error('Something went wrong:', err);
        res.status(500).send({ message: 'Internal Server Error', error: err.message });
    }
});


app.get('/get/comment/:pageName/:pageNo', async(req, res)=>{
    const {pageName, pageNo} = req.params;

    try {
        // First check if any comments exist
        const commentCount = await commentModel.countDocuments({
            pageName: pageName,
            pageNo: parseInt(pageNo)
        });

        const data = await commentModel.find({
            pageName: pageName,
            pageNo: parseInt(pageNo)
        })
        .populate({
            path: 'childId',
            populate: {
                path: 'childId'
            }
        })
        .sort({ date: -1 })
        .lean() // Convert to plain JavaScript objects
        .exec();
        
        
        if (data.length === 0) {
            return res.status(200).send([]); // Return empty array if no comments found
        }
        
        res.status(200).send(data);
    } catch (err) {
        console.error('Error fetching comments:', err);
        res.status(500).send({ message: 'Error fetching comments', error: err.message });
    }
});
io.on('connection', (socket)=>{
    console.log('a user connected');
    socket.on('sendComment', async(comment) =>{
        const { userName, message, parentIdString, pageName, pageNo } = comment;
        try {
            let parentId = null;
            if (parentIdString) {
                if (!mongoose.Types.ObjectId.isValid(parentIdString)) {
                    return res.status(400).send({ message: 'Invalid parentId format' });
                }
                parentId = new mongoose.Types.ObjectId(parentIdString);
            }
    
            // Create and save the new comment
            const comment = new commentModel({ userName, message, parentId, pageName, pageNo });
            await comment.save();
    
            // If the comment has a parent, update the parent's childId array
            if (parentId) {
    
                const parent = await commentModel.findById(parentId);
                // Push the new comment's _id to the parent's childId array
                parent.childId.push(comment._id);
                (await parent.save()).populate('childId');
                console.log('New reply has been saved');
                const allComments = await commentModel.find({parentId : null, pageName : pageName, pageNo : pageNo})
                return io.emit('comment', allComments);
            }
    
            console.log('New comment has been saved');
        } catch (error) {
            console.error('Error:', error.message);
        }

    })
    socket.on('commentNotification', async(data)=>{
        const user = data;
        const comments = await commentModel.find({userName : user}).sort({date : -1});
        const chapters = [];
        const repliedComments = [];
        
        for(const comment of comments){
            if(comment.childId && comment.childId.length > 0){
                for(const childId of comment.childId) {
                    const repliedComment = await commentModel.findById(childId);
                    if(repliedComment) {
                        repliedComments.push(repliedComment);
                        if (repliedComment.pageNo !== 0) {
                            // For chapter comments
                            const chapter = await chapterDataModel.findOne(
                                {novelTitle: repliedComment.pageName},
                                {_id: 1, novelTitle: 1, chapterTitle: 1}
                            );
                            // Get novel ID for the chapter
                            const novel = await novelDataModel.findOne(
                                {novelName: chapter.novelTitle},
                                {_id: 1}
                            );
                            chapters.push({
                                ...chapter.toObject(),
                                novelId: novel._id
                            });
                        } else {
                            // For novel comments
                            const novel = await novelDataModel.findOne(
                                {novelName: repliedComment.pageName}
                            );
                            chapters.push(novel);
                        }
                    }
                }
            }
        }
        return io.emit('commentNotification', {repliedComments, chapters});
    })
    socket.on('disconnect', ()=>{
        console.log('a user disconnected');

    })
})
// app.post('/comment/send', async (req, res) => {
//     const { userName, message, parentIdString, pageName, pageNo } = req.body;

//     try {
//         let parentId = null;
//         if (parentIdString) {
//             if (!mongoose.Types.ObjectId.isValid(parentIdString)) {
//                 return res.status(400).send({ message: 'Invalid parentId format' });
//             }
//             parentId = new mongoose.Types.ObjectId(parentIdString);
//         }

//         // Create and save the new comment
//         const comment = new commentModel({ userName, message, parentId, pageName, pageNo });
//         await comment.save();

//         // If the comment has a parent, update the parent's childId array
//         if (parentId) {

//             const parent = await commentModel.findById(parentId);
//             if (!parent) {
//                 return res.status(404).send({ message: 'Parent comment not found' });
//             }

//             // Push the new comment's _id to the parent's childId array
//             parent.childId.push(comment._id);
//             (await parent.save()).populate('childId');
//             console.log('New reply has been saved');
//             return res.send(parent);
//         }

//         console.log('New comment has been saved');
//         return res.send(comment);
//     } catch (error) {
//         console.error('Error:', error.message);
//         res.status(500).send({ message: 'Internal server error', error: error.message });
//     }
// });

app.get('/createNovelDb', async(req, res) => {
    try {
        // First, clear existing data
        await novelDataModel.deleteMany({});
        
        // Create a promise to handle the CSV processing
        const processCSV = new Promise((resolve, reject) => {
            const results = [];
            
            fs.createReadStream('../webnovels__scraping/csv/NovelData.csv')
                .pipe(csv({
                    headers: ['novelName', 'rating', 'totalRaters', 'description', 'authorName', 'categories', 'source', 'status']
                }))
                .on('data', (row) => {
                    try {
                        row.categories = JSON.parse(row.categories)
                        row.authorName = JSON.parse(row.authorName)
                        row.status = JSON.parse(row.status)

                        results.push(row);
                    } catch(err) {
                        console.error(`Error processing row: ${err}`);
                    }
                })
                .on('end', () => resolve(results))
                .on('error', (error) => reject(error));
        });

        // Wait for CSV processing to complete
        const data = await processCSV;
        
        // Bulk insert all documents
        await novelDataModel.insertMany(data);

        // Update rankings in a separate operation
 

        res.send('Database created  successfully');
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Error creating database: ' + error.message);
    }
});
app.get('/createChapterDb', async(req, res)=>{
    try{
        await chapterDataModel.deleteMany({});
        const processCsv = new Promise((resolve, reject) =>{
            const results = [];
            fs.createReadStream('../webnovels__scraping/csv/ChapterData.csv')
            .pipe(csv({
                headers : ['novelTitle', 'chapterTitle','chapterNumber', 'chapterContent']
            }))
            .on('data', (data) => {
                try{
                    data.chapterContent = JSON.parse(data.chapterContent);
                    results.push(data);
                } catch(err) {
                    console.error(`Error processing row: ${err}`);
                }
            })
            .on('end', () => resolve(results))
            .on('error', (error) => reject(error))
        });
        data = await processCsv;
        await chapterDataModel.insertMany(data);
        res.send('Database created successfully')
    }
    catch(err){
        console.error('Error:', err);
        res.status(500).send('Error creating database: ' + err.message);
    }
});
app.get('/getChapterDb', async(req, res)=>{
    const data = await chapterDataModel.find({}, {_id : 1, novelTitle : 1, chapterTitle : 1});
    res.send(data);
})
app.get('/addChapter', async(req, res)=>{
    try {
        const aggregatedData = await chapterDataModel.aggregate([
            {
                $group : {
                    _id : '$novelTitle',
                    count : {$sum : 1}
                }
            },
        ])
        for(const docs of aggregatedData){
            const result = await novelDataModel.updateOne(
                {novelName : docs._id}, 
                {$set : {chapters : docs.count}}
            )
        }
        const data = await novelDataModel.find({});
        res.status(200).send(data);
    } catch (err) {
        console.error('Error:', err);
        res.status(500).send('Error updating chapter counts: ' + err.message);
    }
})
app.get('/rankDb', async(req, res)=>{
    const updateRankings = await novelDataModel.aggregate([
        {
            $addFields: {
                ranking: {
                    $multiply: [
                        { $toDouble: "$rating" },
                        { $toDouble: "$totalRaters" }
                    ]
                }
            }
        },
        {
            $sort: {
                ranking: -1
            }
        },
        {
            $setWindowFields: {
                sortBy: { ranking: -1 },
                output: {
                    rank: { $documentNumber: {} }
                }
            }
        },
        {
            $merge: {
                into : 'novelDataModel',
                whenMatched : 'merge',
                whenNotMatched : 'insert'
            }
        }
    ])
    res.send('Database created  successfully');
})
app.get('/deleteDb', async(req, res)=>{
    novelDataModel.collection.drop();
    res.send('deleted')
})


app.get('/dbRanking', async (req, res) => {
    try {
        const aggregate = await novelDataModel.aggregate([
            {
                $addFields: {
                    ranking: {
                        $multiply: [
                            { $toDouble: "$rating" },
                            { $toDouble: "$totalRaters" }
                        ]
                    }
                }
            },
            {
                $project: {
                    _id: 1,
                    rank : 1,
                    novelName: 1,
                    image: 1,
                    categories: 1,
                    status: 1,
                    ranking: 1 // Include the ranking field explicitly
                }
            },
            {
                $sort: {
                    ranking: -1 // Sort by the computed ranking field in descending order
                }
            }
        ]);
        res.send(aggregate);
    } catch (err) {
        console.error("Error in aggregation pipeline:", err);
        res.status(500).send({ message: "Internal Server Error", error: err.message });
    }
});

app.get('/dbBrowse', async(req, res)=>{
    const ratingBrowse = await novelDataModel.aggregate([
        {
            $sort:{
                rating : -1
            }
        }
    ])
    const uniqueCategories = new Set();
    for(const item of ratingBrowse){
        for(const category of item.categories){
            uniqueCategories.add(category)
        }
    }
    res.send({books : ratingBrowse, uniqueCategories : Array.from(uniqueCategories)})
})
app.post('/dbBrowse', async(req, res) => {
    const {selectedCategories, selectedStatus, selectedOrder, selectedSort} = req.body;
    
    // Build query conditions dynamically
    let query = {};
    
    // Only add categories filter if there are selected categories
    if (selectedCategories && selectedCategories.length > 0) {
        query.categories = { $all: selectedCategories };
    }
    
    // Only add status filter if it's not 'All'
    if (selectedStatus && selectedStatus !== 'All') {
        query.status = {$in : selectedStatus};
    }

    // Convert order field to lowercase to match your database fields
    let sortField = selectedOrder.toLowerCase();
    // Map frontend order names to database field names if needed
    const orderMapping = {
        'rating': 'rating',
        'ranking': 'rank',
        'chapter': 'chapters',
        'total rated': 'totalRaters'
    };
    sortField = orderMapping[sortField];

    try {
        const books = await novelDataModel.find(query)
            .sort({ [sortField]: selectedSort === 'Ascending' ? 1 : -1 });
        res.send(books);
    } catch (err) {
        console.error('Browse error:', err);
        res.status(500).send({ message: 'Error while browsing', error: err.message });
    }
});

app.get('/novel/:id', async(req, res) => {
    const { id } = req.params;
    console.log('Received request for novel ID:', id);
    
    if (!id) {
        return res.status(400).send({ message: 'No ID provided' });
    }

    try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).send({ message: 'Invalid ID format' });
        }

        const novel = await novelDataModel.findById(id);
        console.log('Found novel:');

        if (!novel) {
            return res.status(404).send({ message: 'Novel not found' });
        }

        res.status(200).json(novel);
    } catch (err) {
        console.error('Error fetching novel:', err);
        res.status(500).send({ message: 'Error fetching novel', error: err.message });
    }
});
app.get('/novel/:id/chapters', async(req, res)=>{
    const {id} = req.params;
    const novel = await novelDataModel.findById(id);
    const chapters = await chapterDataModel.find({novelTitle : novel.novelName}, {_id: 1, chapterTitle: 1});
    res.send(chapters);
})
app.get('/chapter/:id', async(req, res)=>{
    const {id} = req.params;
    const chapter = await chapterDataModel.findById(id);
    res.send(chapter);
})
app.get('/chapters', async(req, res)=>{
    const chapters = await chapterDataModel.find({});
    res.send(chapters);
})
app.get('/chapter/:name/delete', async(req, res)=>{
    const {name} = req.params;
    await chapterDataModel.deleteOne({chapterTitle : {$regex : new RegExp(`%${name}%`, 'i')}});
    res.send('deleted')
})
app.get('/chapter/:id/previous', async(req, res) => {
    const {id} = req.params;
    try {
        const chapter = await chapterDataModel.findById(id);
        const previousChapter = await chapterDataModel.findOne({
            novelTitle: chapter.novelTitle,
            chapterNumber: chapter.chapterNumber - 1
        });
        res.send(previousChapter);
    } catch (err) {
        console.error('Error:', err);
        res.status(500).send({ message: 'Error fetching previous chapter', error: err.message });
    }
});

app.post('/addBookmark', async(req, res)=>{
    const {userId, novelId} = req.body;
    await libraryModel.create({userId, novelId});
    res.send('added')
})
app.get('/getBookmark/:userId', async(req, res)=>{
    const {userId} = req.params;
    const data = await libraryModel.find({userId}).populate('novelId');
    res.send(data);
})
app.get('/verifyBookmark/:userId/:novelId', async(req, res)=>{
    const {userId, novelId} = req.params;
    try{
        const data = await libraryModel.findOne({userId, novelId});
        console.log('data', data)
        if(data){
        res.status(200).send('bookmarked');
        }
        else{
            res.status(201).send('not bookmarked');
        }
    }
    catch(err){
        console.error('Error:', err);
    }
})

app.post('/googleLogin', async(req, res) => {
    const {accessToken} = req.body;
    const gapi_response = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers : {
            Authorization : `Bearer ${accessToken}`
        }
    })
    const email = gapi_response.data.email;
    const user = await userModel.findOne({email}, {_password : 0});
    if(!user){
        res.status(201).send({message : 'User not found, please sign up'});
    }
    else{
        res.status(200).send(user);
    }
})
app.get('/deleteUser', async(req, res) =>{
    await userModel.deleteMany({});
    res.send('deleted');
})
app.get('/deleteChapter', async(req, res) =>{
    await chapterDataModel.collection.drop().then(
        res.send('deleted')
    );
})
app.get('/get/:db', async(req, res)=>{
    const dbMapping = {Novel : novelDataModel, User : userModel, Admin : adminModel};
    const {db} = req.params;
    const dbName = dbMapping[db]
    const sampleDoc = await dbName.findOne().select(' -__v -password').lean();
    const headers = Object.keys(sampleDoc);

    db === 'User' || db === 'Admin' ? 
    data = await dbName.find({}).select('-__v') : 
    data = await dbName.find({}, { __v : 0});

    data ? console.log('db successfully retrieved') : console.log('db not retrieved');
    res.send({headers, data})
})
app.get('/delete/:db/:id', async(req, res)=>{
    const {db, id} = req.params;
    console.log('db', db, 'id', id)
    const dbMapping = {Novel : novelDataModel, User : userModel, Admin : adminModel, chapters : chapterDataModel, comments : commentModel};
    const dbName = dbMapping[db];
    try{
        if(db === 'Novel'){
            const novel = await novelDataModel.findById(id);
            await chapterDataModel.deleteMany({novelTitle : novel.novelName})
            await libraryModel.deleteMany({novelId : id})
            await commentModel.deleteMany({pageName : novel.novelName})
            const imgPath = `C:/Users/DELL/Desktop/Some Web Tutorial/webnovel/frontend/public/images`
            const imgFilePath = `${imgPath}/${novel.novelName.replace(/[^a-zA-Z0-9]/g, '_')}.png`
            fs.existsSync(imgFilePath) ?
            fs.unlink(imgFilePath, (err)=>{
                if(err){
                    console.error('Error deleting image file', err);
                }
            }) : console.log('image not found');
    
        }
        await dbName.deleteOne({_id : id});

        res.status(200).send('deleted');
    }
    catch(err){
        console.error(`Error deleting data from ${dbName}`, err);
        res.status(500).send('Error deleting data');
    }
    

})
// Add these new routes

// Get chapters for a specific novel
app.get('/chapters/:novelName', async (req, res) => {
    const { novelName } = req.params;
    try {
        const chapters = await chapterDataModel.find(
            { novelTitle: novelName },
            { chapterNumber: 1, chapterTitle: 1, novelTitle: 1, _id: 1 }
        ).sort({ chapterNumber: 1 });
        res.status(200).send(chapters);
    } catch (err) {
        console.error('Error fetching chapters:', err);
        res.status(500).send({ message: 'Error fetching chapters', error: err.message });
    }
});

// The comment route already exists in your code, but make sure it's properly populated:
app.get('/get/comment/:pageName/:pageNo', async(req, res)=>{
    const {pageName, pageNo} = req.params;
    try {
        const data = await commentModel.find({
            pageName: pageName,
            pageNo: parseInt(pageNo)
        })
        .populate({
            path: 'childId',
            populate: {
                path: 'childId'
            }
        })
        .sort({ date: -1 })
        .exec();
        
        res.status(200).send(data);
    } catch (err) {
        console.error('Error fetching comments:', err);
        res.status(500).send({ message: 'Error fetching comments', error: err.message });
    }
});

// Add this new route for next chapter
app.get('/chapter/:id/next', async(req, res) => {
    const {id} = req.params;
    try {
        const chapter = await chapterDataModel.findById(id);
        const nextChapter = await chapterDataModel.findOne({
            novelTitle: chapter.novelTitle,
            chapterNumber: chapter.chapterNumber + 1
        });
        res.send(nextChapter);
    } catch (err) {
        console.error('Error:', err);
        res.status(500).send({ message: 'Error fetching next chapter', error: err.message });
    }
});

// Add this new route for search functionality
app.get('/search', async (req, res) => {
    const { term, db } = req.query;
    console.log('term', term, 'selectedDb', db)

    const dbMapping = {
        Novel: novelDataModel,
        User: userModel,
        Admin: adminModel,
        chapters: chapterDataModel,
        comments: commentModel
    };
    const queryMapping = {
        Novel: 'novelName',
        User: 'username',
        Admin: 'username'
    };

    const model = dbMapping[db];
    const queryField = queryMapping[db];

    if (!model || !queryField) {
        return res.status(400).json({ error: 'Invalid selectedDb or query field' });
    }

    try {
        const searchResults = await model.find({
            [queryField]: { $regex: `.*${term}.*`, $options: 'i' } // Dynamic field
        });

        res.status(200).json(searchResults); // Send the results back to the client
        console.log(searchResults);
    } catch (error) {
        console.error('Error fetching search results:', error);
        res.status(500).json({ error: 'Error fetching search results' });
    }
});


app.post('/admin/signin', async(req, res) => {
    const {email, password} = req.body;
    try {
        const admin = await adminModel.findOne({email: email});
        if (!admin) {
            return res.status(401).json({message: 'Invalid email or password'});
        }
        const isPasswordValid = await bcrypt.compare(password, admin.password);
        if(!isPasswordValid){
            return res.status(401).json({message: 'Invalid email or password'});
        };
        return res.status(200).send(admin)

    } catch (err) {
        return res.status(500).json({message: 'Internal server error', error: err.message});
    }
});

app.get('/ScrapeNovels/:numNovels/:numChapters', async (req, res) => {
    const { numNovels, numChapters } = req.params;

    try {
        console.log('Scraping started');

        // Wait for the scraping script to complete
        await new Promise((resolve, reject) => {
            exec(`node ../webnovels__scraping/a.js`, (error, stdout, stderr) => {
                if (error) {
                    console.error(`Error: ${error.message}`);
                    return reject('Error running web scraping script');
                }
                if (stderr) {
                    console.error(`Stderr: ${stderr}`);
                    return reject('Error in web scraping script');
                }
                console.log(`Output: ${stdout}`);
                console.log('Scraping completed');
                resolve();
            });
        });

        // Create the novel database
        await createNovelDb();
        await craeteChapterDb();

        // Update rankings
        await rankDb();

        res.send('Scraping and database setup completed successfully');
    } catch (err) {
        console.error(err);
        res.status(500).send(err);
    }
});

server.listen(port, ()=>{
    console.log(`App listening on port ${port}`);
})

async function createNovelDb(){
    try {
        // First, clear existing data
        await novelDataModel.deleteMany({});
        
        // Create a promise to handle the CSV processing
        const processCSV = new Promise((resolve, reject) => {
            const results = [];
            
            fs.createReadStream('../webnovels__scraping/csv/NovelData.csv')
                .pipe(csv({
                    headers: ['novelName', 'rating', 'totalRaters', 'description', 'authorName', 'categories', 'source', 'status']
                }))
                .on('data', (row) => {
                    try {
                        row.categories = JSON.parse(row.categories)
                        row.authorName = JSON.parse(row.authorName)
                        row.status = JSON.parse(row.status)

                        results.push(row);
                    } catch(err) {
                        console.error(`Error processing row: ${err}`);
                    }
                })
                .on('end', () => resolve(results))
                .on('error', (error) => reject(error));
        });

        // Wait for CSV processing to complete
        const data = await processCSV;
        console.log('Database created  successfully');

        // Bulk insert all documents
        await novelDataModel.insertMany(data);
        console.log('Chapter created  successfully');


        // Update rankings in a separate operation
 

    }
    catch(err){
        console.error('Error creating database', err);
    }
}
async function craeteChapterDb(){
    try{
        await chapterDataModel.deleteMany({});
        const processCsv = new Promise((resolve, reject) =>{
            const results = [];
            fs.createReadStream('../webnovels__scraping/csv/ChapterData.csv')
            .pipe(csv({
                headers : ['novelTitle', 'chapterTitle','chapterNumber', 'chapterContent']
            }))
            .on('data', (data) => {
                try{
                    data.chapterContent = JSON.parse(data.chapterContent);
                    results.push(data);
                } catch(err) {
                    console.error(`Error processing row: ${err}`);
                }
            })
            .on('end', () => resolve(results))
            .on('error', (error) => reject(error))
        });
        data = await processCsv;
        await chapterDataModel.insertMany(data);
        console.log('Database created successfully')
    }
    catch(err){
        console.error('Error:', err);
        console.log('Error creating database: ' + err.message);
    }
}
async function rankDb(){
    const updateRankings = await novelDataModel.aggregate([
        {
            $addFields: {
                ranking: {
                    $multiply: [
                        { $toDouble: "$rating" },
                        { $toDouble: "$totalRaters" }
                    ]
                }
            }
        },
        {
            $sort: {
                ranking: -1
            }
        },
        {
            $setWindowFields: {
                sortBy: { ranking: -1 },
                output: {
                    rank: { $documentNumber: {} }
                }
            }
        },
        {
            $merge: {
                into : 'novelDataModel',
                whenMatched : 'merge',
                whenNotMatched : 'insert'
            }
        }
    ])
    console.log('Ranking completed')
}

