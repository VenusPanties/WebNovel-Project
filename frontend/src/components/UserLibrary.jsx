import React, { useContext, useEffect, useState } from 'react'
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { UserContext } from './AppProvider';
import { timeDifference } from '../utils/timeDifference';
  
export default function UserLibrary() {
  const {user} = useContext(UserContext);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [bookmarkedNovels, setBookmarkedNovels] = useState([]);
  const baseUrl = 'http://localhost:5000';

  const handleGetBookmarkedNovels = async() => {
    if (!user?._id) {
      console.log('No user ID found');
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.get(`${baseUrl}/getBookmark/${user._id}`);
      setBookmarkedNovels(response.data);
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    handleGetBookmarkedNovels();
  }, [user]);

  return (
    <div>
      <div className="bookmark__header">
        <h3 className="bookmark__header__title">
          Your Bookmarked Novel Library
        </h3>
        <p className="bookmark__header__description">
          The list of novels you subscribe to follow.
          You can organize your library and discover the latest updates of your favorite novels.    
        </p>
      </div>
      <div className="bookmark__infos">
        <div className="bookmark__info">
          <div className="icon">
            <i className="fa-solid fa-star"></i>
          </div>
          <p className="text">Bookmark your favorite novels in your library.</p>
        </div>
        <div className="bookmark__info">
          <div className="icon">
            <i className="fa-solid fa-book"></i>
          </div>
          <p className="text">A maximum of 20 favorites can be selected. You will only receive notifications for the books you selected as favorites.</p>

        </div>
      </div>
      <ul className="bookmark__list">
        <h3 className="list__tile">
          Bookmarked Novels
        </h3>
        {bookmarkedNovels.map(novel=>{
          return(
            <li className="bookmarked__novel" key={novel.novelId._id} onClick={()=>navigate(`/novel/${novel.novelId._id}`)}>
              <div className="bookmarked__novel__image">
                <img src={`../../../images/${novel.novelId.novelName.replace(/[^a-zA-Z0-9]/g, '_')}.png`} alt={novel.novelId.novelName} />
              </div>
              <div className="bookmarked__novel__info">
                <h3 className="bookmarked__novel__title">{novel.novelId.novelName}</h3>
                <p className="bookmarked__novel__time">{timeDifference(novel.date)}</p>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
