import React, { useEffect } from 'react'
import {useState} from 'react'
import Comment from './Comment'
import CommentBox from './CommentBox';
import '../css/comment.css'
import axios from 'axios';
import { createContext } from 'react';

export default function CommentSection(props) {

  const {novel, pageNo} = props;
  const pageName = novel.novelName;

  const [comments, setComments] = useState([]);
  
  const commentLogs = [
    '(an hour ago): 7 comments on Chapter 713: Three Questions',
    '(an hour ago): 6 comments on Chapter 739: The Encountered and the Yet-To-Be-Encountered',
    '(an hour ago): 2 comments on Chapter 168: Clown Potion',
    '(an hour ago): 6 comments on Chapter 900: Self-Recommendation',
    '(an hour ago): 5 comments on Chapter 74: Ray Bieber'
  ]
  const [showCommentBox, setShowCommentBox] = useState(false);

  
  const handleGetComments = () =>{
    axios.get(`http://localhost:5000/get/comment/${pageName}/${pageNo}`)
    .then(response=>{
      setComments(response.data);
    })
    .catch(err=>{
      console.error(err)
    })
  }
  
  useEffect(()=>{
    handleGetComments()
  }, [comments])
  return (
    <div className='comment-section container'>
      <div className="comment-section-header">
        <h3 >
          User Comments
        </h3>
        <button className="write-comment-btn" onClick={()=>{
          setShowCommentBox(!showCommentBox)
        }}>
          Write Comment
        </button>
      </div>
      {showCommentBox ?  <CommentBox showCommentBox = {showCommentBox}
       setShowCommentBox = {setShowCommentBox} yposition = {window.scrollY} pageName = {pageName} pageNo = {pageNo}/>
      : ''}
      <div className="comment-rules">
        <div className="rules-link">
          <p>Please read and apply the rules before posting a comment</p>
        </div>
        <p>By sharing your comment, you agree to all the relevant terms.</p>

      </div>
      <div className="comment-log">
        <h3 className="log-title">
        Comments on the novel chapters for the last week.
        </h3>
        <div className="logs">
          {commentLogs.map((log,index)=>(
           <p className="log" key={index}>
             {log}
           </p>
          ))}
        </div>
      </div>
    {
      comments.map((comment)=>{
        return <Comment key={comment._id} 
        parentIdString = {comment._id}
         message = {comment.message} 
         comments = {comment.childId}
         username = {comment.userName}
         date = {comment.date}
         showCommentBox = {showCommentBox} 
         setShowCommentBox = {setShowCommentBox}
         setComments = {setComments}
         pageName = {pageName}
         pageNo = {pageNo}
         />
      }
    )
    }
    </div>
  )
}
