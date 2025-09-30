# Web Novel Reader

Web Novel Reader is a full-stack web application for browsing and reading online novels. It integrates automated web scraping of novel data with a MongoDB database backend and a React frontend. Users can sign up, browse a library of novels (with cover images, descriptions, and chapter lists), read chapters, bookmark favorites, and leave comments. The app also supports real-time live comments on chapters using web sockets. Administrators can add new chapters. This project was developed as a learning exercise to practice full-stack development (learning technologies like web sockets, Mongoose schemas, etc.) and can serve as a portfolio piece.

## Features

- **Web Scraping & Data Import**: Uses Puppeteer (a headless Chrome library) to scrape novel titles, authors, images, and chapter links from a target site. Scraped data is saved as CSV and then imported into the MongoDB database ([zenrows.com](https://zenrows.com)).
- **User Authentication**: Supports user sign-up and sign-in (with Google OAuth on the frontend), as well as a separate admin account. Passwords (for admin) are hashed with Bcrypt.
- **Novel Library**: Displays a paginated list of novels with cover images and genres. Clicking a novel shows its detailed info and chapter list (table of contents).
- **Chapter Reading**: Users can read chapter content page-by-page. Each chapter page shows the text content of that chapter.
- **Real-Time Comments**: Visitors can leave comments on each chapter. Comments update in real time via Socket.IO, which enables bidirectional, live updates between the client and server ([knock.app](https://knock.app)).
- **User Library (Bookmarks)**: Logged-in users can bookmark novels. A personal library page shows all novels the user has saved.
- **Search and Ranking**: Users can search novels by title or genre. Novels are ranked by popularity (using a formula like rating * totalRaters) so top novels appear first.
- **Admin Functions**: An admin panel allows adding new chapters to existing novels. The code includes backend routes to regenerate the database from CSV (e.g., `/createNovelDb`, `/createChapterDb`) and recalculate rankings.
- **Tech Learning**: Throughout development, new skills were gained (e.g., implementing web sockets for chat-style comments, learning Mongoose schema design, etc.), making this project both functional and educational.

## Technology Stack

- **Node.js + Express (Backend)**: The server is built on Node.js using Express, a popular, unopinionated web framework for Node.js ([developer.mozilla.org](https://developer.mozilla.org)). It handles routing (API endpoints) and middleware (e.g., CORS, JSON parsing).
- **MongoDB & Mongoose (Database)**: Data is stored in MongoDB, accessed via Mongoose ODM. Mongoose allows defining schemas and models (e.g., `userSchema` or `novelDataSchema`) with typed fields and validation ([mongodb.com](https://mongodb.com)). For example:
  ```javascript
  const userSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true }
  });
  ```
- **Web Scraping – Puppeteer**: Automated scraping of novel information is done with Puppeteer, a Node library that controls a headless Chrome/Chromium browser via DevTools Protocol. It’s commonly used for scraping dynamic content ([zenrows.com](https://zenrows.com)). Scripts in `webnovels__scraping/` launch Puppeteer instances, navigate to novel pages, and extract data into CSV files.
- **React + Vite (Frontend)**: The client UI is built with React, a JavaScript library for building user interfaces in a declarative, component-based way ([opensource.fb.com](https://opensource.fb.com)). The frontend is scaffolded with Vite, a fast build tool and dev server with instant hot-reload (HMR) and optimized bundling ([vite.dev](https://vite.dev)). The React app communicates with the backend API using Axios.
- **Real-Time Communication – Socket.IO**: For live comments, the app uses Socket.IO, enabling real-time bidirectional web communication. It sends and receives events (e.g., new comment posted) between clients and server ([knock.app](https://knock.app)).
- **Additional Libraries**: Axios for HTTP requests, Bcrypt for password hashing, Google OAuth (via `@react-oauth/google`) for user login, and Dotenv for configuration variables (e.g., database URL, OAuth client ID).

## Installation and Setup

1. **Clone the Repository**:
   ```bash
   git clone <repository-url>
   cd <repository-name>
   ```

2. **Backend Setup**:
   - Navigate to the backend directory: `cd backend`
   - Install dependencies: `npm install`
   - Create a `.env` file based on `.env.example` with your MongoDB connection string:
     ```bash
     MONGOOSE_URL=mongodb+srv://<username>:<password>@cluster0.mongodb.net/webnovel?retryWrites=true&w=majority
     ```
   - Start the server: `npm start` (listens on port 5000 by default; ensure `.env` connection string is correct).

3. **Frontend Setup**:
   - In a new terminal, navigate to the frontend directory: `cd frontend`
   - Install dependencies: `npm install`
   - Create a `.env` file with your Google OAuth Client ID:
     ```bash
     VITE_CLIENT_ID=YOUR_GOOGLE_OAUTH_CLIENT_ID
     ```
     (Register an OAuth client at [Google Cloud Console](https://console.cloud.google.com) to get this ID.)
   - Run the frontend dev server: `npm run dev` (starts Vite on port 5173 by default; open the local address, e.g., `http://localhost:5173`).

4. **Initial Data Population (Optional)**:
   - In `webnovels__scraping/`, Node scripts scrape novel data and save it as CSV files (`NovelData.csv`, `ChapterData.csv`). Running these requires Node and Puppeteer:
     ```bash
     cd webnovels__scraping
     npm install          # install Puppeteer and other libs
     node novelList.js   # scrape list of novels into "Novels List.txt"
     node a.js           # scrape novel details and chapters into CSV
     ```
   - Copy generated CSV files to `backend/csv/` if not already there.
   - Send GET requests to backend endpoints:
     - `http://localhost:5000/createNovelDb` – clears the novels collection and imports from `NovelData.csv`.
     - `http://localhost:5000/createChapterDb` – clears the chapters collection and imports from `ChapterData.csv`.
     - (Optional) `http://localhost:5000/rankDb` – recalculates and stores a ranking value for each novel.

5. **Database Utilities (Advanced)**: The backend includes routes like `/deleteDb` (to drop collections), `/dbRanking`, `/dbBrowse` (to search), etc., which can be used or removed as needed.

After setup, navigate to the frontend in your browser to browse novels, sign up or log in, and read chapters. Comments on chapters will load in real time via Socket.IO.

## Project Structure

- **backend/** – Node.js + Express server
  - `server.js`: Main application file (defines routes and socket logic).
  - `models/models.js`: Mongoose schema definitions for Users, Novels, Chapters, Comments, etc.
  - `csv/`: Initial CSV data files (if any).
  - `createdb.js`: (Optional) script for database import (unused in current code).
- **frontend/** – React application created with Vite
  - `src/`: React components (e.g., `Navbar`, `NovelList`, `Chapter`, `CommentSection`).
  - `index.html` & `vite.config.js`: Vite configuration.
  - `.env`: Frontend environment variables (Google OAuth).
- **webnovels__scraping/** – Scraping scripts (Node + Puppeteer)
  - `novelList.js`: Script to scrape the list of latest novels.
  - `a.js`: Main scraper for novel details and chapters.
  - `csv/`: Output `NovelData.csv` and `ChapterData.csv`.
  - `images/`: (Optional) scraped cover images.
- `.gitignore` and other config files.

## Additional Notes

- **Data Sources**: The scraper is configured for a specific novel website (e.g., novelfull.net). Adapt scraping logic (selectors, URL patterns) for other sites if needed.
- **Real-Time Comments**: The comment system uses Socket.IO to broadcast new comments to all connected clients for a given chapter ([knock.app](https://knock.app)). Users must be on the chapter page to see real-time updates.
- **Security**: Do not commit `.env` files (especially database credentials) to a public repository. Ensure secure handling of credentials in production.
- **Learning Outcome**: This project demonstrates a full-stack workflow: data ingestion (web scraping), storage (MongoDB), API/backend logic (Node/Express), and interactive frontend (React) with real-time features. It can be extended with features like user profiles, ratings, or additional admin tools.

## References

- [Express.js](https://developer.mozilla.org) – A popular Node.js web framework for handling HTTP routes and middleware.
- [Mongoose](https://mongodb.com) – Simplifies MongoDB usage by defining schemas and models.
- [React](https://opensource.fb.com) – A JavaScript library for building user interfaces.
- [Vite](https://vite.dev) – A modern build tool for fast development and optimized builds.
- [Puppeteer](https://zenrows.com) – Controls a headless browser for scraping dynamic pages.
- [Socket.IO](https://knock.app) – Enables real-time bidirectional communication for live comment updates.
