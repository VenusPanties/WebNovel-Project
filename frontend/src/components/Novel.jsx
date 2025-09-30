import React, { useState, useEffect, useContext }  from 'react'
import axios from 'axios';
import { useParams } from 'react-router-dom';
import NovelDetails from './NovelDetails';
import NovelDescription from './NovelDescription';
import CommentSection from './CommentSection';
import { Outlet } from 'react-router-dom';
import { UserContext } from './AppProvider';
export default function Novel() {
  const user = useContext(UserContext);
  const userId = user._id;
    const {id} = useParams();
    const baseUrl = 'http://localhost:5000';
    const [novel, setNovel] = useState(null);
    const [isBookmarked, setBookmarked] = useState(false);
    const [chapterData, setChapterData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const handleGetNovel = async () =>{
        setIsLoading(true);
        axios.get(`${baseUrl}/novel/${id}`)
        .then(response=>{
          const book = response.data;
          setNovel(book);
        })
      }
      const handleGetChapter = async () =>{
        await axios.get(`http://localhost:5000/novel/${id}/chapters`)
        .then(response=>{
            const chapters = response.data;
            setChapterData(chapters);
            setIsLoading(false);
        })
    }
    const handleVerifyBookmark = async()=>{
      setBookmarked(false);
      await axios.get(`${baseUrl}/verifyBookmark/${userId}/${id}`)
      .then(response =>{
        if(response.status === 200){
          setBookmarked(true);
          console.log('bookmarked');
        }
        if(response.status === 201){
          console.log('not bookmarked');
        }
      })
      .catch(error =>{
        console.error('Error:', error.message);
      })

    }
      useEffect(()=>{
        async function fetchData(){
            await handleGetNovel();
            await handleGetChapter();
            await handleVerifyBookmark();
        }
        fetchData();
        
      }, [id])
  return (
    isLoading ? <div>Loading...</div> :
    <div>
        <NovelDetails novel={novel} isBookmarked={isBookmarked} setBookmarked={setBookmarked}/>
        <NovelDescription novel={novel} id={id} chapterData={chapterData}/>
        <CommentSection novel={novel} pageNo={0}/>
    </div>
  )
}
