import React, { useState } from 'react';
import '../css/comment.css';
import ReactDOM from 'react-dom';
import axios from 'axios';
import { useContext } from 'react';
import { UserContext } from './AppProvider';
import io from 'socket.io-client';

export default function CommentBox(props) {
  const { showCommentBox, setShowCommentBox, yposition, parentIdString, setComments, pageName, pageNo} = props;
  const [message, setMessage] = useState('');
  const [messageCount, setMessageCount] = useState(0);
  const {user} = useContext(UserContext);
  console.log('user' , user.username)

  // this is axios handle comment 
  // const handleComment = (e) => {
  //   e.preventDefault();
  //   axios.post('http://localhost:5000/comment/send', {userName : user.username, message, parentIdString, pageName, pageNo}, )
  //   .then((response)=>{
  //     setShowCommentBox(false)
  //   }
  //   )
  // }

  const handleCommentIo = (e) =>{
    e.preventDefault();
    const socket = io('http://localhost:5000')
    socket.emit('sendComment', {userName : user.username, message, parentIdString, pageName, pageNo})
    socket.on('comment', (data)=>{
      setComments(data)
    })
    setShowCommentBox(!showCommentBox)
  }

  if (!showCommentBox) return null;

  return ReactDOM.createPortal(
    <>
      <div
        className="background-wrapper"
        onClick={() => setShowCommentBox(false)}
      ></div>

      <div className={`comment-box ${showCommentBox ? 'show' : ''}`} style={{top : `${yposition}px`}} >
        <form className="comment-box-form">
          <div className="comment-box-header">
            <h3 className="title">Write a New Comment</h3>
            <div className="icon" onClick={() => setShowCommentBox(false)}>
              <i className="fa-solid fa-x"></i>
            </div>
          </div>
          <div className="input-box">
            <textarea
              name="message"
              rows="10"
              minLength="3"
              maxLength="1000"
              placeholder="Join the discussion with your comment... Make sure you understand the comment rules before posting..."
              className="input-box"
              value={message}
              onChange={(e) => {
                const message = e.target.value;
                setMessage(message);
                setMessageCount(message.length);
              }}
            ></textarea>
            <h3 className="message-count">{messageCount} &lt; 1000</h3>
          </div>
          <div className="comment-box-footer">
            <label className="switch-container">
              <input type="checkbox" />
              <span className="switch"></span>
            </label>
            <p className="spoiler-text">
              Contains <div className="next-line">Spoiler</div>
            </p>
            <button className="post-comment-btn" onClick={(e)=>{
              handleCommentIo(e)
            }}>POST COMMENT</button>
          </div>
        </form>
      </div>
    </>,
    document.getElementById('root') // Assuming 'portal-root' is your portal container
  );
}
