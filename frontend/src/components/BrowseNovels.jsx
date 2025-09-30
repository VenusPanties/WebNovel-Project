import axios from 'axios';
import React, { useEffect, useState } from 'react'
import '../css/browsenovels.css'
import { useNavigate, useLocation } from 'react-router-dom';

export default function BrowseNovels() {
    const navigate = useNavigate();
    const location = useLocation();
    const initialCategory = location.state?.initialCategory;
    const [novels, setNovels] = useState([]);
    const [categories, setCategories] = useState(['Drama', 'Fantasy', 'Romance', 'Action', 'Adventure'])
    const [selectedCategories, setSelectedCategories] = useState(
        initialCategory ? [initialCategory] : []
    );
    const [selectedStatus, setSelectedStatus] = useState('All');
    const [selectedOrder, setSelectedOrder] = useState('Rating');
    const [selectedSort, setSelectedSort] = useState('Descending');
    const availableStatus = ['All', 'Completed', 'Ongoing'];
    const availableOrder = ['Rating', 'Ranking', 'Chapter', 'Total Rated']
    const availableSort = ['Ascending', 'Descending']
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
    const baseUrl = 'http://localhost:5000'
    const handleGetNovels = () =>{
        axios.get(`${baseUrl}/dbBrowse`)
        .then(response=>{
        
            const {books, uniqueCategories} = response.data;
            setNovels([...books])
            setCategories([...uniqueCategories])
            console.log(novels)
        })
        .catch(err=>{
            console.log('data retrieval error', err)
        })
    }
    const handleBrowse = () => {
        console.log('Sending request with:', {
            selectedCategories,
            selectedStatus,
            selectedOrder,
            selectedSort
        });
        
        axios.post(`${baseUrl}/dbBrowse`, {
            selectedCategories,
            selectedStatus,
            selectedOrder,
            selectedSort
        })
        .then(response => {
            console.log('Response data:', response.data);
            setNovels(response.data);
        }).catch(err => {
            console.log('browse error', err);
        });
    };
  
    useEffect(() => {
        handleGetNovels();
        if (initialCategory) {
            handleBrowse();
        }
    }, [initialCategory]);
  return (
    <div className="browse-novels container" >
        <div className="browse-functions">
            <div className="browse-categories">
                <h3 className="browse-categories-title">
                    Genre / Category
                </h3>
                <div className="browse-categories-container browse-btn-container">
                    {categories.map((category, index)=>{
                        return(
                            <div className={`browse-category browse-btn ${selectedCategories.includes(category) ? 'active' : ''} `}
                             key={index} onClick={()=> selectedCategories.includes(category) 
                                ? setSelectedCategories(selectedCategories.filter(c=> c !== category)) 
                                : setSelectedCategories([...selectedCategories, category])
                            }>
                                {category}
                            </div>
                        )
                    })}
                </div>
                
            </div>
            <div className="browse-orderby">
                <h3 className="browse-orderby-title">
                    Order By
                </h3>
                <div className="browse-orderby-container browse-btn-container">
                    {availableOrder.map((order, index)=>{
                    return(
                        <div className={`browse-each-order browse-btn ${selectedOrder === order.toLowerCase() ? 'active' : ''}`} 
                        key={index} onClick={()=> {
                            setSelectedOrder(order.toLowerCase());
                            handleBrowse();
                        }}>
                            {order}
                        </div>
                    )
                })}
                </div>
                
            </div>
            <div className="browse-status">
                <h3 className="browse-status-title">
                    Status
                </h3>
                <div className="browse-status-container browse-btn-container">
                {availableStatus.map((status, index)=>{
                    return(
                        <div className={`browse-each-status browse-btn ${selectedStatus === status ? 'active' : ''}`} 
                        key={index} onClick={()=> selectedStatus === status ? setSelectedStatus('') : setSelectedStatus(status)}>
                            {status}
                        </div>
                    )
               })}
                </div>
               
            </div>
            <div className="browse-sort">
                <h3 className="browse-sort-title">
                    Sort By
                </h3>
                <div className="browse-sort-container browse-btn-container">
                {availableSort.map((sort, index)=>{
                    return(
                        <div className={`browse-each-sort browse-btn ${selectedSort === sort ? 'active' : ''}`} 
                        key={index} onClick={()=> selectedSort === sort ? setSelectedSort('') : setSelectedSort(sort)}>
                            {sort}
                        </div>
                    )
                })}
                </div>
                
            </div>
            <button className="apply-btn" onClick = {handleBrowse}>
                Browse 
            </button>
        </div>
        <div className="browse-header">
            <h3> Explore All Amazing Novels</h3>
            <p> Discover and readpopular novels across all categories.

        </p>
        </div>
        <div className="browse-container">
        { 
       novels.map((novel, index)=>{
        const {_id, novelName, categories, status, ranking} = novel;

        return  (
                <div className="browse-image-container" key={index} onClick={()=>{
                    navigate(`/novel/${novel._id}`)
                }}>
                    <div className="browse-novel-image">
                        <img src={
                            `/images/${novelName.replace(/[^a-zA-Z0-9]/g, '_')}.png`
                        } alt="novel cover image" />
                        <div className="browse-novel-status">
                            <div className="browse-ranking">
                                <div className="icon">
                                    <i class="fa-solid fa-trophy"></i>
                                </div>
                                <div className="text">
                                    {novel.rank}
                                </div>
                            </div>
                            <div className="browse-rating">
                                <div className="icon">
                                    <i className='fa-solid fa-star'></i>
                                </div>
                                <div className="browse-text">
                                    {novel.rating}
                                </div>
                            </div>
                        </div>
                        <div className="browse-bg-wrap"></div>
                    </div>
                    <div className="browse-novel-details">
                        
                        <h3 className="browse-novel-title">
                            {novelName}
                        </h3>
                        
                    </div>
                </div>
                )
       })
       }
        </div>

       
</div>
  )
}
