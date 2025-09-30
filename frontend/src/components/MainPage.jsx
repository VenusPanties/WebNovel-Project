import React from 'react'
import '../css/mainpage.css'
import { useNavigate } from 'react-router-dom';

export default function MainPage() {
    const navigate = useNavigate();
  return (
    <div className='main-page container'>
        <div className="main-page-header">
            <div className="background-image">
                <img src="https://static.lightnovelworld.co/content/img/lnw-slider-banner-bg6.jpg" alt="image" />
            </div>
            <div className="main-page-header-text">
                <h3>Read the best light novels and web novels translation for free</h3>
                <p>Your Fictional Stroy Hub</p>
            </div>
        </div>
        <div className="main-page-browse">
            <h3>
            Looking for a great place to read Light Novels?
            </h3>
            <p>
            Light Novel World is a very special platform where you can read the translated versions of world famous Japanese, Chinese and Korean light novels in English. Every new chapters published by the author is updated instantly on the Light Novel World and notification service is provided to the readers.
            </p>
            <p>
            Start reading now to explore this mysterious fantasy world.
            </p>
            <button onClick={() => navigate('browse')} className='browse-novels-btn'>
                Browse Novels
            </button>
        </div>
        <div className="main-page-offers">
            <h3>
            What we offer?
            </h3>
            <p>
            The aim of the platform is to bring together the genres of light novel and web novel and allow you to read and follow them through a single source. In the meantime, there are many features that will maximize your reading quality.
            </p>
            <ul>
                <li><p>With the member system, you can add the novel you follow to your library and see your progress.</p>
                </li>
                <li><p>You will be notified when a reply or a like is applied to your comment, indicating which comment it has been applied to.</p>
                </li>
                <li><p>You can share your thoughts about the novel with all users by writing a review. You can also support the ranking of the novel with a review score.</p>
                </li>
                <li><p>You can join the community and discuss with your comments within the novel and on each chapter page.</p>
                </li>
                <li><p>You can like and dislike other users' comments in the comment system.</p>
                </li>
                <li><p>You can report inappropriate comments and chapters.</p>
                </li>
            </ul>
        </div>
    </div>
  )
}
