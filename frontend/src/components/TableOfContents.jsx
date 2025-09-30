import React, { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios';
import { useState } from 'react';
import '../css/tableofcontents.css';
import { Link } from 'react-router-dom';

export default function TableOfContents() {

    const [chapters, setChapters] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [novel, setNovel] = useState(null);
    const {id} = useParams();
    const baseUrl = 'http://localhost:5000';
    const navigate = useNavigate();
    const [searchChapter, setSearchChapter] = useState('');

    const handleGetNovel = async()=>{
        setIsLoading(true);
        axios.get(`${baseUrl}/novel/${id}`)
        .then(response=>{
            const book = response.data;
            setNovel(book);
        })
    }
    const handleGetChapters = async()=>{
        axios.get(`${baseUrl}/novel/${id}/chapters`)
        .then(response=>{
            const chapters_data = response.data;
            setChapters(chapters_data);
            setIsLoading(false);
        })
    }
    useEffect(()=>{
        async function fetchData(){
            await handleGetNovel();
            await handleGetChapters();
        }
        fetchData();
    }, [])

    const handleChapterSearch = () => {
        const chapterNumber = parseInt(searchChapter);
        if (chapterNumber && chapterNumber > 0 && chapterNumber <= chapters.length) {
            const targetChapter = chapters[chapterNumber - 1];
            navigate(`/novel/${id}/chapters/${targetChapter._id}`);
        } else {
            alert('Invalid chapter number');
        }
    };

  return (
    isLoading ?
    
    <div>Loading...</div> :
    <div className="table-of-contents container">
        <div className="tbc-header">
            <div className="tbc-novel-item">
                <Link to={`/novel/${id}`} className="tbc-novel-img">
                    <img src={`/images/${novel.novelName.replace(/[^a-zA-Z0-9]/g, '_')}.png`} alt="novel-img" />
                </Link>
                <div className="tbc-novel-info">
                    <Link to={`/novel/${id}`} className="tbc-novel-info-header">
                        {novel.novelName}
                    </Link>
                    <div className="tbc-novel-info-rating">
                        <p className="tbc-novel-info-rating-text">Rating : {novel.rating}</p>
                        <i className="fa-solid fa-star"></i>
                    </div>
                    <p className="tbc-novel-info-status" style={{color: novel.status === 'Completed' ? 'green' : 'red'}}>
                        {novel.status}
                    </p>
                </div>
            </div>
            <div className="tbc-novel-description">
                <h3 className="tbc-description-header">
                    {novel.novelName} Novel Chapters
                </h3>
                <p className="tbc-description-body">
                    List of most recent chapters published for the {novel.novelName} novel. A total of {novel.chapters} chapters have been translated.
                </p>
                <div className="tbc-latest-chapter">
                    <p className="tbc-latest-chapter-header">
                        Latest Release {chapters.chapterTitle}
                    </p>
                    <Link to={`/novel/${id}/chapters/${chapters[chapters.length - 1]._id}`}className="tbc-latest-chapter-link">
                        {chapters[chapters.length - 1].chapterTitle}
                    </Link>
                </div>
            </div>
        </div>
        <div className="tbc-body">
            <div className="tbc-chapter-search">
                <input 
                    type="number" 
                    placeholder='Enter Chapter Number'
                    value={searchChapter}
                    onChange={(e) => setSearchChapter(e.target.value)}
                />
                <button 
                    className='tbc-chapter-search-btn'
                    onClick={handleChapterSearch}
                > 
                    Go 
                </button>
            </div>
            <div className="tbc-chapters-container">
                {chapters.map((chapter, index)=>{
                    return(
                        <Link to={`/novel/${id}/chapters/${chapter._id}`} className="tbc-chapter" key={index}>
                            <p className="tbc-chapter-no">
                                {index + 1}
                            </p>
                            <h3 className="tbc-chapter-title">
                                {chapter.chapterTitle}
                            </h3>
                        </Link>
                    )
                })}
            </div>
        </div>
    </div> 
  )
}
