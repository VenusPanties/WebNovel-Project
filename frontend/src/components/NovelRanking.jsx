import React, { useEffect, useRef, useState } from 'react'
import '../css/novelranking.css'
import axios from 'axios'
import { Link } from 'react-router-dom';

export default function NovelRanking() {
    const [novels, setNovels] = useState([]);
    const scrollRight = (categoriesElement) => {
        if (categoriesElement) {
            categoriesElement.scrollBy({
                left: 100,
                behavior: 'smooth'
            });
        }
    };

    const scrollLeft = (categoriesElement) => {
        if (categoriesElement) {
            categoriesElement.scrollBy({
                left: -100,
                behavior: 'smooth'
            });
        }
    };

    const handleGetNovels = () =>{
        axios.get('http://localhost:5000/dbRanking')
        .then(response=>{
        
            const books = response.data;
            setNovels([...books])
            console.log(novels)
        })
        .catch(err=>{
            console.log('data retrieval error', err)
        })
    }
    useEffect(handleGetNovels,[])
  return (
    <div className="novelRanking container" >
        <div className="ranking-header">
            <h3> Novel Ranking </h3>
            <p> The ranking is based on the combination of increasing reads of a book and the average user rating score. </p>
        </div>
        <div className="novels-container">
        { 
       novels.map((novel, index)=>{
        const {_id, novelName, categories, status, ranking} = novel;

        return  (
                <Link to={`/novel/${novel._id}`} className="image-container" key={index}>
                    <div className="novel-image">
                        <img src={
                            `../../../images/${novelName.replace(/[^a-zA-Z0-9]/g, '_')}.png`
                        } alt="novel cover image" />
                    </div>
                    <div className="bg-wrap"></div>
                    <div className="novel-contents">
                        <div className="novel-status">
                            <h2 className="ranking">
                                {index < 9 ? `0${index + 1}` : index + 1}
                            </h2>
                            <h3 className="status">
                                {status.toString()}
                            </h3>
                        </div>
                        <h3 className="novel-title">
                            {novelName}
                        </h3>
                        <div className="categories-container">
                            <button 
                                className="scroll-btn scroll-left" 
                                onClick={(e) => {
                                    const categoriesEl = e.target.closest('.categories-container').querySelector('.categories');
                                    scrollLeft(categoriesEl);
                                }}
                            >
                                <i className="fa-solid fa-chevron-left"></i>
                            </button>
                            <ul className="categories">
                                {categories.map((category, index) => (
                                    <li key={index}>{category}</li>
                                ))}   
                            </ul>
                            <button 
                                className="scroll-btn scroll-right" 
                                onClick={(e) => {
                                    const categoriesEl = e.target.closest('.categories-container').querySelector('.categories');
                                    scrollRight(categoriesEl);
                                }}
                            >
                                <i className="fa-solid fa-chevron-right"></i>
                            </button>
                        </div>
                    </div>
                </Link>
                )
       })
       }
        </div>

       
</div>
  )
}
