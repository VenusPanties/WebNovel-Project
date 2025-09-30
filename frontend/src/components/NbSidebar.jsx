import React, { useState } from 'react';
import NavbarItem from './NavbarItem';
import { Link, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { LoginContext, UserContext } from './AppProvider';

export default function NbSidebar() {
    const [isDarkMode, setIsDarkMode] = useState(false);

    const {user} = useContext(UserContext);
    const {login} = useContext(LoginContext);
    
    const navigate = useNavigate();
  const items = [
    { name: 'Search', icon: 'fa-solid fa-magnifying-glass', link: '/search'},
    { name: 'Browse', icon: 'fa-solid fa-grip' ,link: '/browse'},
    { name: 'Ranking', icon: 'fa-solid fa-trophy' ,link: '/ranking'},
    
  ];
  const themes = [
    { name: 'DarkTheme', icon: 'fa-regular fa-moon' },
    { name: 'LightTheme', icon: 'fa-solid fa-sun' },
  ]

  const userItems = [
    {name : 'Profile', icon: 'fa-solid fa-circle-user', link: '/user/info'},
    {name : 'library', icon: 'fa-solid fa-book', link: '/user/library'},
    {name : 'inbox', icon: 'fa-regular fa-envelope', link: '/user/inbox'}
  ]

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark-mode');
  };

  return (
      
      <div className="sidebar__contents ">
        <div className="novel-related">
            
            <p className='sm-txt lg-screen'>
                Your fictional stories hub.
            </p>
            <ul className='novel-functions'>
                
                {items.map((item, index) => (
                <Link className="item btn" to={item.link} key={index}>
                    <NavbarItem item = {item}/>
                </Link>
                ))}

                <div className="theme-icon btn" onClick={toggleDarkMode}>
                    <i className={isDarkMode ? 'fa-solid fa-sun' : 'fa-regular fa-moon'}></i>
                </div>
            </ul>
        </div>
        <div className="line"></div>
        {login === 'true' ?
        <div className="user-related">
        <p className='sm-txt lg-screen'>
            Hello, <span className='username'>{user ? user.username : ''}</span>
        </p>
        <ul className="user-functions">
            {userItems.map((item, index)=>
                (<Link to={item.link} className="item btn" key={index}>
                    <NavbarItem item = {item}/>
                </Link>)
                )
            }
        </ul>
    </div> 
    : <button className='nav-sign-up-btn' onClick={
        () => {
            navigate('/sign-up')
        }
    }>
        SIGN UP
      </button>}
      </div>
  );
}
