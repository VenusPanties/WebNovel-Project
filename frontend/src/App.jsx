import { createContext, useContext } from "react"
import CommentBox from "./components/CommentBox"
import CommentSection from "./components/CommentSection"
import LoginButton from "./components/LoginButton"
import Navbar from "./components/navbar"
import NovelDescription from "./components/NovelDescription"
import NovelDetails from "./components/NovelDetails"
import SignIn from "./components/SignIn"
import NovelRanking from "./components/NovelRanking"
import {BrowserRouter, Routes, Route} from "react-router-dom"
import BrowseNovels from "./components/BrowseNovels"
import Novel from "./components/Novel"
import TableOfContents from "./components/TableOfContents"
import Chapter from "./components/Chapter"
import SignUp from "./components/SignUp"
import User from "./components/User"
import UserInbox from "./components/UserInbox"
import UserLibrary from "./components/UserLibrary"
import UserInfo from "./components/UserInfo"
import axios from 'axios';
import Admin from "./components/Admin"
import MainPage from "./components/MainPage"
import Search from "./components/Search"
import AdminSignIn from "./components/AdminSignIn"
import Comments from "./components/Comment"

function App() {
  return (
    <div className="page">
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navbar/>}>
          <Route path="/" element={<MainPage/>}/>
          <Route path="/novel/:id" element={<Novel/>}></Route>
          <Route path="/novel/:id/table-of-contents" element={<TableOfContents/>}/>
          <Route path="/novel/:id/chapters/:chapterId" element={<Chapter/>}/>

          <Route path="ranking" element={<NovelRanking/>}/>
          <Route path="browse" element={<BrowseNovels/>} />
          <Route path="search" element={<Search/>}></Route>

          <Route path="/user" element={<User/>}>
            <Route path="info" element={<UserInfo/>}/>
            <Route path="library" element={<UserLibrary/>}/>
            <Route path="inbox" element={<UserInbox/>}/>
          </Route>
        <Route path="/admin" element={<Admin/>}/>

        </Route>
        <Route path="/sign-up" element={<SignUp/>}/>
        <Route path="/sign-in" element={<SignIn/>}/>
        <Route path="/admin/sign-in" element={<AdminSignIn/>}/>
        <Route path="/novel/:id/comments" element={<Comment/>}/>
      </Routes>
    </BrowserRouter>
    
    </div >
  )
}

export default App
