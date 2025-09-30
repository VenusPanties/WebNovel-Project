import React, { useContext, useEffect, useState } from 'react'
import { io } from 'socket.io-client';
import { UserContext } from './AppProvider';
import { timeDifference } from '../utils/timeDifference';
import { useNavigate } from 'react-router-dom';
export default function UserInbox() {
  const navigate = useNavigate();
  const [comments, setComments] = useState([]);
  const [chapterNames, setChapterNames] = useState([]);
  const {user} = useContext(UserContext);
  const [loading, setLoading] = useState(false);
  const handleGetComment = () =>{
    setLoading(true);
    const socket = io('http://localhost:5000')
    socket.emit('commentNotification', user.username)
    socket.on('commentNotification', (data)=>{
      const {repliedComments, chapters} = data
      console.log(data)
      setComments(repliedComments)
      setChapterNames(chapters);
    })
    setLoading(false);
    
  }
  useEffect(()=>{
    handleGetComment();
  }, [])
  return (
    loading ? (
      <div className='loading-container'>
        <div className='loading-spinner'></div>
      </div>
    ) : (
      <div className='user-inbox'>
            {console.log('comments', comments)}

            <h3 className='user-inbox-header'> Your Message Inbox</h3>
            <p className='user-inbox-body'>Notifications of transactions such as likes and replies to your comments.</p>

            {comments.map((comment, index) => {
              const timeDiff = timeDifference(comment.date)
        return (
           <div className="notification">
           <div className="notification-icon">
           <i className="fa-regular fa-comment-dots"></i>          
           </div>

           <div className="notification-content">
             <h3 className="notification-header">Your Comment has been replied by</h3>
             <div className="notification-user">
               <div className="user-icon">
               <i className="fa-regular fa-user"></i>
               </div>
               <div className="user-name">
                 {comment.userName} ({timeDiff})
               </div>
             </div>
             <div className="notification-reply">
               <h3 className="reply-header">
                 The reply for your comment
               </h3>
               <p className="reply-content">
                 {comment.message}
               </p>
             </div>
           <div className="notification-chapter">
             {comment.pageNo !== 0 ?
             <>
             <h3 className="chapter-name">
                {chapterNames[index].chapterTitle}
             </h3> 
             <p className='novel-name'>
               {comment.pageName}
             </p>
             </> :
             <>
                {(() => {
                  const novel = chapterNames[index];
                  return (
                    <div className = 'notification-novel'>
                      <div className="novel-image-container">
                        <img 
                          src={`../../../images/${novel.novelName.replace(/[^a-zA-Z0-9]/g, '_')}.png`} 
                          alt="novel cover image" 
                        />
                      </div>
                      <div className="novel-content-container">
                        <p className="novel-name">
                          {comment.pageName}
                        </p>
                        <div className="novel-infos">
                          <div className="novel-info-ranking">
                            <i className='fa-solid fa-trophy'></i>
                            <p>{novel.rank}</p>
                          </div>
                          <div className="novel-info-rating">
                            <i className='fa-solid fa-star'></i>
                            <p>{novel.rating}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </>
             }
            
           </div>
           <div className="view-comment-btn" onClick={() => {
             if (comment.pageNo !== 0) {
               // For chapter comments
               navigate(`/novel/${chapterNames[index].novelId}/chapters/${chapterNames[index]._id}`, {
                 state: { scrollToComments: true }
               });
             } else {
               // For novel comments
               navigate(`/novel/${chapterNames[index]._id}`, {
                 state: { scrollToComments: true }
               });
             }
           }}>
             View Your Comment
           </div>
           </div>
           
           
         </div>
        );
      })}
           
          </div>
      
    )
  );
}

