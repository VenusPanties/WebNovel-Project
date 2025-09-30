import React, { useEffect, useState } from 'react';
import NbSidebar from './NbSidebar';
import logo from '../assets/logo.png';
import '../css/navbar.css'
import {Outlet, Link} from 'react-router-dom'
import Footer from './Footer';

export default function Navbar() {
  const [openSidebar, setOpenSidebar] = useState(false);
  const [isRotating, setIsRotating] = useState(false); // New state for rotation
  const [isWideScreen, setIsWideScreen] = useState(window.matchMedia('(min-width:900px)').matches);

  function handleToggleSidebar() {
    setIsRotating(true);
    setOpenSidebar(!openSidebar); // Immediate toggle
    console.log(openSidebar)
    setTimeout(() => setIsRotating(false), 300); // Delay only for rotation reset
  }
  

  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 900px)');
    const handleSizeChanges = () => {
      console.log('Screen size changed:', mediaQuery.matches);
      setIsWideScreen(mediaQuery.matches);
    };
  
    mediaQuery.addEventListener('change', handleSizeChanges);
  
    return () => {
      mediaQuery.removeEventListener('change', handleSizeChanges);
    };
  }, []);
  
  return (
    <>
      <div className="navbar">
        <div className="sidebar container">
          {/* Logo */}
          <div className="logo">
            <img src={logo} alt="page-logo" />
          </div>

          {/* Toggle Button */}
          {!isWideScreen && (
            <button className="icon mid-screen" onClick={handleToggleSidebar} >
              <i
                className={`fa-solid ${
                  openSidebar ? 'fa-xmark' : 'fa-bars'
                } ${isRotating ? 'rotate' : ''}`}
              ></i>
            </button>
          )}

          {/* Sidebar */}
          {openSidebar || isWideScreen ? <NbSidebar /> : ''}
        </div>
      </div>
      <Outlet />
      <Footer/>
    </>
  );
}
