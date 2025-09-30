import React, { useEffect, useState } from 'react'
import '../css/noveldescription.css'
import axios from 'axios';
import { Link, Outlet } from 'react-router-dom'

export default function NovelDescription(props) {
    const {id, novel, chapterData} = props;
    const chapter = novel.chapters
    const review = novel.totalRaters
    const rating = novel.rating


    
  return (
    <div className="novel-description container">
        <div className="links">
            <Link to={`/novel/${id}/table-of-contents`} className="link" style={{textDecoration: 'none', color: '#000'}}>
                <div className="content">
                    <h3>NOVEL CHAPTERS</h3>
                    <p>{`Chapter ${chapter}: ${chapterData[chapterData.length - 1].chapterTitle}`}</p>
                    <p>Updated one month ago</p>
                </div>
                <div className="icon">
                </div>
            </Link>
            <div className="link">
                <div className="content">
                    <h3>USER REVIEWS</h3>
                    <p>Reviews from {`${review}`} readers</p>
                    <p>Average Score is {`${rating}`}</p>
                </div>
                <div className="icon">
                </div>
            </div>
        </div>
        <div className="description">
            <p>{novel.novelName} (Web Novel) novel is a popular light novel covering Action, Adventure, and Fantasy genres. Written by the Author Cuttlefish That Loves Diving. 1432 chapters have been translated and translation of all chapters was completed.</p>
        </div>
        <div className="summary">
        <h2>Summary</h2>
        <p style={{lineHeight : '1.5rem'}}>{novel.description
            .split('\n')
            .map((line, index)=>(
                <React.Fragment key={index}>
                    {line}
                    <br />
                    <span style={{fontSize : '2rem'}}></span>
                </React.Fragment>
            ))
            }</p>
        </div>
    </div>
  )
}
