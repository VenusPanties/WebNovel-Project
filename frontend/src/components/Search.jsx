import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../css/search.css';

export default function Search() {
    const [searchTerm, setSearchTerm] = useState('');
    const [popularNovels, setPopularNovels] = useState([]);
    const [searchResults, setSearchResults] = useState([]);
    const navigate = useNavigate();
    const baseUrl = 'http://localhost:5000';

    useEffect(() => {
        fetchPopularNovels();
    }, []);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (searchTerm) {
                handleSearch();
            } else {
                setSearchResults([]);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    const fetchPopularNovels = async () => {
        try {
            const response = await axios.get(`${baseUrl}/dbRanking`);
            setPopularNovels(response.data.slice(0, 10));
            console.log('popularNovels', popularNovels)
        } catch (err) {
            console.error('Error fetching popular novels:', err);
        }
    };

    const handleSearch = async () => {
        try {
            const response = await axios.get(`${baseUrl}/search?term=${searchTerm}`);
            setSearchResults(response.data);
            console.log('searchResults', searchResults)
        } catch (err) {
            console.error('Error searching novels:', err);
        }
    };

    const renderNovelGrid = (novels) => {
        return novels.map((novel, index) => (
            <div 
                className="search__image-container" 
                key={novel._id} 
                onClick={() => navigate(`/novel/${novel._id}`)}
            >
                <div className="search__novel-image">
                    <img 
                        src={`/images/${novel.novelName.replace(/[^a-zA-Z0-9]/g, '_')}.png`} 
                        alt={novel.novelName} 
                    />
                    <div className="search__novel-status">
                        <div className="search__ranking">
                            <div className="search__icon">
                                <i className="fa-solid fa-trophy"></i>
                            </div>
                            <div className="search__text">
                                {novel.rank}
                            </div>
                        </div>
                        
                    </div>
                    <div className="search__bg-wrap"></div>
                </div>
                <div className="search__novel-details">
                    <h3 className="search__novel-title">
                        {novel.novelName}
                    </h3>
                </div>
            </div>
        ));
    };

    return (
        <div className="search__page container">
            <div className="search__header">
                <input
                    type="text"
                    placeholder="Search Light Novels by Title"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search__input"
                />
            </div>

            {searchTerm ? (
                <div className="search__results">
                    <h2>Search Results</h2>
                    <div className="search__novels-container">
                        {renderNovelGrid(searchResults)}
                    </div>
                </div>
            ) : (
                <div className="search__popular">
                    <h2>Popular Novels</h2>
                    <div className="search__novels-container">
                        {renderNovelGrid(popularNovels)}
                    </div>
                </div>
            )}
        </div>
    );
}
