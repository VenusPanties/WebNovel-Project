import axios from 'axios';
import React, { useEffect } from 'react'
import { useParams } from 'react-router-dom';
import { useState } from 'react';
import '../css/chapter.css';
import CommentSection from './CommentSection';
import { useNavigate } from 'react-router-dom';
export default function Chapter() {
    const navigate = useNavigate();
    const {id, chapterId} = useParams();
    const [loading, setLoading] = useState(true);
    const [settingActive, setSettingActive] = useState(false);
    const [previousChapter, setPreviousChapter] = useState();
    const [novel, setNovel] = useState();
    const [chapter, setChapter] = useState();
    const [currentFontSize, setCurrentFontSize] = useState(18);
    const baseUrl = 'http://localhost:5000';
    const fontSizes = [14, 16, 18, 20, 22, 24, 26, 28];
    const [rangeSliderColor, setRangeSliderColor] = useState(0);
    const [fontFamily, setFontFamily] = useState('Nunito Sans');
    const [hasPrevious, setHasPrevious] = useState(false);
    const [hasNext, setHasNext] = useState(false);


    const handleGetNovel = async () =>{
        setLoading(true);
        await axios.get(`${baseUrl}/novel/${id}`)
        .then(response =>{
            const novel_data = response.data;
            setNovel(novel_data);
        })
    }
    const handleGetChapter = async()=>{
        await axios.get(`${baseUrl}/chapter/${chapterId}`)
        .then(response=>{
            const chapter_data = response.data;
            console.log('chapter_data', chapter_data)
            setChapter(chapter_data);
            setLoading(false);
        })
    }
    const checkAvailableChapters = async () => {
        try {
            const prevResponse = await axios.get(`${baseUrl}/chapter/${chapterId}/previous`);
            setHasPrevious(!!prevResponse.data);

            const nextResponse = await axios.get(`${baseUrl}/chapter/${chapterId}/next`);
            setHasNext(!!nextResponse.data);
        } catch (err) {
            console.error('Error checking available chapters:', err);
        }
    };
    useEffect(()=>{
        async function fetchData(){
            await handleGetNovel();
            await handleGetChapter();
            await checkAvailableChapters();
        }
        fetchData();
        
        
    }, [chapterId])

    const handlePreviousChapter = async () => {
        try {
            const response = await axios.get(`${baseUrl}/chapter/${chapterId}/previous`);
            if (response.data) {
                navigate(`/novel/${id}/chapters/${response.data._id}`);
            }
        } catch (err) {
            console.error('Error fetching previous chapter:', err);
        }
    };

    const handleNextChapter = async () => {
        try {
            const response = await axios.get(`${baseUrl}/chapter/${chapterId}/next`);
            if (response.data) {
                navigate(`/novel/${id}/chapters/${response.data._id}`);
            }
        } catch (err) {
            console.error('Error fetching next chapter:', err);
        }
    };

  return (
    loading ? 
    <div className="loading">Loading...</div>
    :
    
    <div className="chapter container">
        {console.log('chapter', chapter)}
        <div className="chapter_header">
            <div className="chapter_header_content">
                <h3 className="chapter_novel_name" onClick={()=>navigate(`/novel/${novel._id}`)}>
                    {novel.novelName}
                </h3>
                <p className="chapter_title">
                    {chapter.chapterTitle}
                </p>
            </div>
            <button className="chapter_setting_btn" onClick={()=>{
                setSettingActive(!settingActive);
            }}>
                <i className="fa-solid fa-gear"></i>
            </button>
        </div>
        <div className="chapter_body">
            {chapter.chapterContent.map((content, index)=>(
                <p className="chapter_content" style={{fontSize: `${currentFontSize}px`, fontFamily: `${fontFamily}`, lineHeight: `${currentFontSize * 1.5}px`}} key={index}>
                    {content}
                </p>
            ))}
        </div>
        <div className="chapter_navigation">
            <div 
                className={`navigate_previous navigate_button ${!hasPrevious ? 'disabled' : ''}`} 
                onClick={() => hasPrevious && handlePreviousChapter()}
            >
                <i className="fa-solid fa-arrow-left"></i>
                <p>PREV</p>
            </div>
            <div className="navigate_tbc navigate_button" onClick={() => navigate(`/novel/${id}/chapters`)}>
                <i className="fa-solid fa-house"></i>
                <p>INDEX</p>
            </div>
            <div 
                className={`navigate_next navigate_button ${!hasNext ? 'disabled' : ''}`}
                onClick={() => hasNext && handleNextChapter()}
            >
                <i className="fa-solid fa-arrow-right"></i>
                <p>NEXT</p>
            </div>
        </div>
        <CommentSection novel = {novel} pageNo = {chapter.chapterNumber}/>



        
        <div className={`chapter_setting ${settingActive ? 'active' : ''}`}>
        <h3 className="chapter_title">
            {chapter.chapterTitle}
        </h3>
        <div className="chapter_buttons">
            <div className="chapter_previous_icon chapter_button">
                <i className="fa-solid fa-arrow-left"></i>
            </div>
            <div className="chapter_tbc_icon chapter_button">
                <i className="fa-solid fa-house"></i>
            </div>
            <div className="chapter_dm_icon chapter_button">
                <i className="fa-regular fa-moon"></i>
            </div>
            <div className="chapter_next_icon chapter_button">
                <i className="fa-solid fa-arrow-right"></i>
            </div>
        </div>
        <div className="chapter_fonts">
            <div className={`default font ${fontFamily === 'Nunito Sans' ? 'active' : ''}`} onClick={()=>{
                setFontFamily('Nunito Sans');
            }}>
                Default
            </div>
            <div className={`Montserrat font ${fontFamily === 'Montserrat' ? 'active' : ''}`} onClick={()=>{
                setFontFamily('Montserrat');
            }}>
            Montserrat
            </div>
            <div className={`Roboto font ${fontFamily === 'Roboto' ? 'active' : ''}`} onClick={()=>{
                setFontFamily('Roboto');
            }}>
                Roboto
            </div>
            <div className={`Lora font ${fontFamily === 'Lora' ? 'active' : ''}`} onClick={()=>{
                setFontFamily('Lora');
            }}>
                Lora
            </div>
        </div>
        <div className="chapter-font-size range-slider">
            <div className="decrease-font-size" onClick={()=>{
                if(currentFontSize > 14){
                    setCurrentFontSize(currentFontSize - 2);
                    setRangeSliderColor(((currentFontSize - 14 - 2)/2) * 13.7);

                }
            }}>A <sup>-</sup></div>
            <div className="increase-font-size" onClick={()=>{
                if(currentFontSize < 28){
                    setCurrentFontSize(currentFontSize + 2);
                    setRangeSliderColor(((currentFontSize - 14 + 2)/2) * 13.7);
                }
            }}>A <sup>+</sup></div>
            <div className="range-slider-bar" style={{background : `linear-gradient(to right, var(--btn-primary-blue) ${(rangeSliderColor + 4)}%, #ccc 0%)`}}></div>
            {fontSizes.map((fontSize, index)=>(
                <div className="range-point">
                    <button className={`font-size-button ${currentFontSize >= fontSize ? 'active' : ''}`} key={index} 
                    onClick={()=>{
                        setCurrentFontSize(fontSize);
                        setRangeSliderColor(((fontSize - 14)/2) * 13.7);
                    }}></button>
                    <p className="font-size-text">{fontSize}</p>
                </div>
            )
            )}
        </div>
    </div>
    </div>
    
  )
}
