import React, { useEffect, useState } from 'react'
import '../css/admin.css'
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

export default function Admin() {
  const navigate = useNavigate();
  const [selectedDb, setSelectedDb] = useState('Novel');
  const [headers, setHeaders] = useState([]);
  const [data, setData] = useState([[]]);
  const baseUrl = 'http://localhost:5000';
  const [descriptionShow, setDescriptionShow] = useState(false);
  const [activeCell, setActiveCell] = useState('');
  const [loading, setLoading] = useState(false);
  const [addRow, setAddRow] = useState(false);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isError, setIsError] = useState(false);
  const [errors, setErros] = useState({});
  const [viewType, setViewType] = useState('main');
  const [selectedNovel, setSelectedNovel] = useState(null);
  const [novelId, setNovelId] = useState();
  const [numChpaters, setNumChapter] = useState();
  const [numNovels, setNumNovels] = useState();
    const [searchTerm, setSearchTerm] = useState('');
      const [searchResults, setSearchResults] = useState([]);
  

  useEffect(() => {
    console.log(viewType)
    const adminToken = localStorage.getItem('adminToken');
    if (!adminToken) {
      navigate('/admin/sign-in');
      return;
    }
   
  }, []);

  const handleSelectInput = (e) => {
    setSelectedDb(e.target.value);
  }
  const handleGetData = async()=>{
    console.log('selectedDb', selectedDb)
    setLoading(true);
    await axios.get(`${baseUrl}/get/${selectedDb}`)
    .then(response =>{
      console.log(response.data)
      console.log(response.data.headers)
      setHeaders(response.data.headers);
      setData(response.data.data);
    })
    setLoading(false);
  }
  const handleDeleteData = async(id)=>{
    setLoading(true);
    if(viewType === 'chapters' || viewType === 'comments'){
      console.log('deleting chapters or comments')
      await axios.get(`${baseUrl}/delete/${viewType}/${id}`)
      .then(response => console.log(response.data))
  
    }
    else{
      await axios.get(`${baseUrl}/delete/${selectedDb}/${id}`)
      console.log('deleting novels, users or admin')
      .then(response =>{
        console.log(response.data)
      })
    }
   
    setLoading(false);
  }
  const handleSubmit = (e) => {

    setIsError(false);
    setErros({});
    const tempErrors = {};

    // Validation logic
    if(!email || !username || !password){
        tempErrors.headError = '*All fields need to be filled';
        setIsError(true);
        setErros(tempErrors);
        return;
    }
    if (!email.includes('@')) {
        tempErrors.email = "*Set valid email";
    }
    if (username.length < 5) {
        tempErrors.username = "*Username must be at least 5 characters long";
    }
    if (password.length < 8) {
        tempErrors.password = '*Password cannot be shorter than 8';
    }

    if (Object.keys(tempErrors).length > 0) {
        setIsError(true);
        setErros(tempErrors);
        return;
    }

    // Determine endpoint based on selected database
    const endpoint = selectedDb === 'Admin' ? 'admin/signup' : 'user/signup';

    // Make API call
    axios.post(`${baseUrl}/${endpoint}`, { username, email, password })
        .then(response => {
            if (response.status === 201) {
                console.log(response.data.message);
                setAddRow(false);
                // Clear form fields
                setEmail('');
                setUsername('');
                setPassword('');
                // Refresh the data
                handleGetData();
            }  
        })
        .catch(err => {
            if(err.response?.status === 400){
                setErros({headError : `*${err.response.data.message}`})
            }
            console.error('Signup error:', err);
        });
};
    const handleSearch = async () => {
        try {
          const response = await axios.get(`${baseUrl}/search?term=${searchTerm}&db=${selectedDb}`);
          setSearchResults(response.data);
          setData(response.data)
            console.log('searchResults', searchResults)
        } catch (err) {
            console.error('Error searching novels:', err);
        }
    };

const handleScrapeNovel = async (e) =>{
  axios.get(`${baseUrl}/ScrapeNovels/${numNovels}/${numChpaters}`)
  .then(response => {
    console.log('Scraping completed')
  })
}
  useEffect(()=>{
    handleGetData();
    setViewType('main');
    
  }, [selectedDb])

  const handleViewChapters = async (novel) => {
    let novelName = novel.novelName
    setNovelId(novel._id)
    setLoading(true);
    try {
      const response = await axios.get(`${baseUrl}/chapters/${novelName}`);
      setHeaders(['_id', 'novelTitle', 'chapterTitle', 'chapterNumber', '']);
      setData(response.data);
      setViewType('chapters');
      setSelectedNovel(novelName);
    } catch (err) {
      console.error('Error fetching chapters:', err);
    }
    setLoading(false);
  };

  const handleBack = () => {
    setViewType('main');
    setSelectedNovel(null);
    handleGetData();
  };

  const handleViewComments = async (novel) => {
    setNovelId(novel._id)
    setLoading(true);
    try {
      const response = await axios.get(`${baseUrl}/get/comment/${novel.novelName}/0`);
      setHeaders(['_id', 'userName', 'message', 'date', 'pageNo']);
      setData(response.data);
      setViewType('comments');
      setSelectedNovel(novel.novelName);
      console.log('comment data', data)
    } catch (err) {
      console.error('Error fetching comments:', err);
    }
    setLoading(false);
  };

  return (
    loading ? <div className='loading'>
      <div className="loading-spinner"></div>
    </div> :
    <div className='admin'>
      <div className="user__profile">
            <div className="user__profile__avatar">
                <i className="fa-solid fa-user"></i>
            </div>
            <div className="user__profile__info">
                <div className="user__name">
                    VenusPanties
                </div>
                <div className="user__status">
                    <div className="icon">
                        <i className="fa-solid fa-book-open-reader"></i>
                    </div>
                    <p className="text">
                        Admin
                    </p>
                </div>
                <div className="user__email">
                    <div className="icon">
                        <i className="fa-regular fa-envelope"></i>
                    </div> 
                    <p className="text">
                        moekyalsin258@gmail.com
                    </p>                   
                </div>
            </div>
        </div>
        <div className="admin-view">
          {viewType !== 'main' && (
            <button className="back-button" onClick={handleBack}>
              <i className="fa-solid fa-arrow-left"></i> Back to Novels
            </button>
          )}
          <div className="admin-view-header">
            <label htmlFor='options' className='db-name'>
              Viewing {selectedDb} Database
            </label>
            <select name="options" id="options" className="select-box" value={selectedDb} onChange={(e)=>handleSelectInput(e)}>
              <option value="Novel" className="value">Novels</option>
              <option value="User" className="value">Users</option>
              <option value="Admin" className="value">Admins</option>
            </select>
          </div>
          <div className="admin-add-new">
            <button className="add-new-row" onClick={()=>{
              setAddRow(true)
            }}>
              <i className="fa-solid fa-plus"></i>
            </button>
          </div>
          {addRow ? 
          <div className="add-row-wrapper">
            <div className="add-row-bg-wrapper" onClick={()=>setAddRow(false)}></div>
            <form className="add-row-form" onSubmit={(e)=>{
              selectedDb === 'Novel'  ?
              handleScrapeNovel(e) :
              handleSubmit(e);
            }}>
              <div className="add-row-header">
                <h3>
                  Add a New {selectedDb}
                </h3>
                <i className="fa-solid fa-x" onClick={()=>setAddRow(false)}></i>
              </div>
              {selectedDb !== 'Novel' ? (
<>
  <div className="headError error"> {errors.headError} </div>
  <div className="input-fields">
    <div className="input-field">
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="add-row-input"
      />
      <p className="error">{errors.username}</p>
    </div>
    <div className="input-field">
      <input
        type="text"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="add-row-input"
      />
      <p className="error">{errors.email}</p>
    </div>
    <div className="input-field">
      <input
        type="text"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="add-row-input"
      />
      <p className="error">{errors.password}</p>
    </div>
  </div>
</>
) : (
<div className="inputfields">
  <div className="input-field">
    <input
      type="number"
      placeholder="Number of novels to add"
      className="add-row-input"
      value={'1, can only add one for now, it might takes a few second to add'}
      disabled
    />
  </div>
  <div className="input-field">
    <input
      type="number"
      placeholder="1, can only add one for now, it might takes a few second to add"
      className="add-row-input"
      value={1}
      disabled
    />
  </div>
</div>
)}

  <button className="add-row-button">Add {selectedDb}</button>


            </form>
          </div>
        : null}

      {viewType === 'main' ?
      <div className='admin-search-input'>
      <input type="text" 
      placeholder ={`Search ${selectedDb} by ${selectedDb} Name`}
      value={searchTerm} 
      className='admin-search'
      onChange={(e)=>{
        setSearchTerm(e.target.value)
  

      }}/>
      <button className='admin-search-btn'
      onClick={()=>{
        handleSearch();
      }}>
          Search
      </button>
      </div>
    : ''}
        </div>
        <div className="table">
         <div className='table-header'>
           <div className="table-row">
              <div className={`table-data index-header`}>Index</div>
               {headers && headers.map((header, index) => {
                  return(
                    <div className={`table-data ${header}-header`} key={index}>{header}</div>
                  )
               })}
               {selectedDb === 'Novel' ? <div className="table-data view-header"></div> : null}
               <div className="table-data delete-header"></div>
           </div>
         </div>
         <div className='table-body'>
         {data && data.map((row, index) => (
                 <div className={`table-row `}  key={index}>
                                  <div className={`table-data index-body ${activeCell === `${index}` && descriptionShow ? 'active':''}`} key={`${index}-}`}>{index+1}</div>

                     {headers.map((header, cellIndex) => {
                      // Skip pageNo field for comments
                      if (viewType === 'comments' && header === 'pageNo') {
                        return null;
                      }

                      // Get the value for this header from the row
                      const value = row[header];
                      
                      // Handle different types of values
                      let displayValue = value;
                      
                      if (Array.isArray(value)) {
                        displayValue = value.join(', ');
                      } else if (header === 'date') {
                        // Format date as YYYY.MM.DD
                        const date = new Date(value);
                        displayValue = date.toISOString().split('T')[0].replace(/-/g, '.');
                      } else if (typeof value === 'object' && value !== null) {
                        // For nested objects like childId, you might want to show a count or specific property
                        displayValue = Array.isArray(value) ? value.length : JSON.stringify(value);
                      }

                      return (
                        <div 
                          className={`table-data ${header}-body ${activeCell === `${index}` && descriptionShow ? 'active':''}`} 
                          key={`${index}-${cellIndex}`}
                          onClick={() => {
                            if(header === 'description'){
                              setActiveCell(`${index}`);
                              setDescriptionShow(!descriptionShow);
                            }
                          }}
                        >
                          {displayValue}
                        </div>
                      );
                    })}
                      {selectedDb === 'Novel' && viewType === 'main' && (
                        <>
                          <div className="table-data view-body">
                            <button onClick={() => handleViewChapters(row)}>
                              <p>View Chapters</p>
                            </button>
                          </div>
                          <div className="table-data view-body">
                            <button onClick={() => handleViewComments(row)}>
                              <p>View Comments</p>
                            </button>
                          </div>
                        </>
                      )}
                      {selectedDb === 'Novel' && viewType === 'chapters' && (
                        <div className="table-data view-body">
                          <button onClick={()=>{navigate(`/novel/${novelId}/chapters/${row._id}`)}}  >
                            <p>View</p>
                          </button>
                        </div>
                      )}
                      {selectedDb === 'Novel' && viewType === 'comments' && (
                        <div className="table-data view-body">
                          <button onClick={() => window.open(`/novel/${novelId}`, '_blank')}>
                            <p>View Novel</p>
                          </button>
                        </div>
                      )}
                      <div className="table-data delete-body" onClick={()=>handleDeleteData(row._id)}>
                        <p>Delete</p>
                        </div>
                 </div>
             ))}
         </div>
       </div>
    </div>
    
  )
}
