import React, { useContext, useEffect, useState } from 'react'
import CommentBox from './CommentBox';
import { UserContext } from './AppProvider';
import { timeDifference } from '../utils/timeDifference';
import axios from 'axios';
import {io} from 'socket.io-client';
export default function Comment(props) {
const {comments,message, setComments, parentIdString, pageName, pageNo, username, date} = props;
const [liked, setLiked] = useState(false);
const [unliked, setUnliked] = useState(false)
const [showCommentBox, setShowCommentBox] = useState(false);
const [yposition, setYposition] = useState(0);
const {user} = useContext(UserContext);


    const handleClick = (event) => {
        setYposition(window.scrollY)
        setShowCommentBox(!showCommentBox);
    };


  return (
    <div className='bbg'>
    {showCommentBox ?  <CommentBox showCommentBox = {showCommentBox}
       setShowCommentBox = {setShowCommentBox} yposition = {yposition}
       parentIdString = {parentIdString} setComments = {setComments} pageName = {pageName} pageNo = {pageNo}/>
      : ''}
    <div className='comment'>
        
        <div className="comment-header">
            <div className="comment-header-profile">
                <div className="profile">
                    <img src= "https://static.lightnovelworld.co/content/img/default-avatar.jpg" alt="user" />
                </div>
                <div className="user">
                    <p> {username} </p>
                </div>
            </div>
            <div className="comment-date">
                <p> {timeDifference(date)} </p>
            </div>
        </div>
        <div className="comment-body">
            <p>{message}</p>
        </div>
        <div className="comment-btns">
            <div className="comment-btn">
                <div className="reply-btn" onClick={(event)=>{
                    handleClick(event);
                }}>
                    <div className="icon">
                        <i class="fa-brands fa-rocketchat"></i>
                    </div>
                    <div className="text">
                        Reply
                    </div>
                    
                </div>
                <div className="more-btn">
                    <div className="icon">
                        <i class="fa-solid fa-ellipsis"></i>
                    </div>
                </div>
            </div>
            <div className="comment-btn">
                <div className="thumps-up-btn" onClick={()=>{
                    setLiked(!liked)
                    setUnliked(false)
                    }
                    }>
                    <div className="icon">
                        <i className={`fa-${liked ? 'solid' : 'regular' } fa-thumbs-up`}></i> 
                    </div>
                    <div className="text">
                        <p> 0 </p>
                    </div>
                </div>
                <div className="thumps-down-btn" onClick={()=>{
                    setUnliked(!unliked)
                    setLiked(false)
                }
                }>
                    <div className="icon">
                    <i class={`fa-${unliked ? 'solid' : 'regular' } fa-thumbs-down`}></i>                </div>
                    </div>
                    <div className="text">
                        <p> 0 </p>
                    </div>
            </div>
        </div>
        
        
        <div style={{paddingLeft: '20px'}}>
            {comments ? comments.map((comment, index)=>{
        return (<Comment key = {comment._id} message={comment.message} comments = {comment.childId} parentIdString = {comment._id} username = {comment.userName ? comment.userName : 'None Provided'} pageName = {pageName} pageNo = {pageNo} date = {comment.date} />)
})
            : ''}
            
        </div>
        
    </div>
    </div>
    
  )
}
