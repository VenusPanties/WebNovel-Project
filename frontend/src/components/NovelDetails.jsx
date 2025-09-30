import React, { useContext, useEffect, useState } from 'react';
import NovelDetailItem from './NovelDetailItem';
import '../css/noveldetails.css'
import axios from 'axios';
import { UserContext } from './AppProvider';
import { useNavigate } from 'react-router-dom';

export default function NovelDetails(props) {
  const {user} = useContext(UserContext);
  const userId = user ? user._id : null;
  const [isBookmarking, setIsBookmarking] = useState(false);
  const {novel, isBookmarked, setBookmarked} = props;
  console.log('novel', novel)
  const details = [
    { name: 'Chapters', icon: 'fa-solid fa-book', value : novel.chapters},
    { name: 'Views', icon: 'fa-regular fa-eye' ,value : '123'},
    { name: 'Bookmarked', icon: 'fa-solid fa-bookmark' ,value : '123'},
    {name: 'Status', status : novel.status}
  ];
  const baseUrl = 'http://localhost:5000';
  const rating = novel.rating
  const categories = novel.categories
  const fullstars = Math.floor(rating);
  const halfstar = rating % 1 >= 0.2 && rating % 1 <= 0.8;
  const emptystar = 5 - (fullstars + (halfstar ? 1 : 0));
  const navigate = useNavigate();

  const handleBookmark = async()=>{
    setIsBookmarking(true);
    await axios.post(`${baseUrl}/addBookmark`, {userId : userId, novelId : novel._id})
    .then(respone => {
      setBookmarked(true);
      setIsBookmarking(false);
      console.log('response', respone);
    })
    .catch(error => {
      console.error('Error:', error.message);
    })
  }
  
  const handleCategoryClick = (category) => {
    navigate('/browse', { state: { initialCategory: category } });
  };

  return (
    <div className="novel-details ">

      <div className="novel-cover-container container">
        <div className="img-container">
        <img
          src={`../../../images/${novel.novelName.replace(/[^a-zA-Z0-9]/g, '_')}.png`}
          alt="novel cover photo"
          className="novel-cover"
        />
        </div>
        <div className="novel-content">
          <div className="glass-background">
            <h2 className="novel-name">{novel.novelName}</h2>
            <p className="author-name">Author: {novel.authorName}</p>
            <div className="rating">
              {Array.from({ length: fullstars }, (_, index) => (
                <div className="star full" key={index}>
                  <i className="fa-solid fa-star"></i>
                </div>
              ))}
              {halfstar && (
                <div className="star half">
                  <i className="fa-solid fa-star-half-stroke"></i>
                </div>
              )}
              {Array.from({ length: emptystar }, (_, index) => (
                <div className="star empty" key={index}>
                  <i className="fa-regular fa-star"></i>
                </div>
              ))}
            </div>
          </div>
          <div className="novel-info">
            <div className="details">
              {details.map((item, index) => (
                <div className="item" key={index}>
                  <NovelDetailItem item={item} status={status}/>
                </div>
              ))}
              
            </div>
            <div className="categories-content">
            <p className="categories-title">Categories</p>
              <div className="categories">
                {categories.map((category, index) => (
                  <div 
                    className="category btn-primary" 
                    key={index}
                    onClick={() => handleCategoryClick(category)}
                    style={{ cursor: 'pointer' }}
                  >
                    {category}
                  </div>
                ))}
              </div>
            </div>
              
            <div className="novel-actions">
              <div className="gt-1st-chapter btn-primary">
                <p>Read</p>
                <p>Chapter 1</p>
              </div>
              <div className="bookmark btn-primary" onClick={()=>{
                isBookmarked ? console.log('already bookmarked') : 
                userId ? handleBookmark() :  '';
              }} style={{cursor : isBookmarking ? 'not-allowed' : 'pointer', minWidth : '150px', placeContent : 'center'}}>
                {isBookmarking ? <i className="fa-solid fa-spinner"></i> :
                <><i className={isBookmarked ? `fa-solid fa-check` : `fa-regular fa-bell`}></i>
                <p>{isBookmarked ? 'In Library' : 'Add to Library'}</p></>
                }
                
              </div>
            </div>
          </div>
        </div>
        
      </div>

    </div>
  );
}
