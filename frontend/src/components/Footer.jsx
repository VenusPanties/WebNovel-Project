import React from 'react'
import '../css/footer.css'
import logo from '../assets/logo.png'
import { Link } from 'react-router-dom'
export default function Footer() {
  return (
    <div className='footer'>
        <div className="footer_logo">
            <img src={logo} alt="logo" />
        </div>
        <div className="footer_links">
            <Link to="ranking">&gt;  Novel Ranking</Link>
            <Link to="browse">&gt;  Novel Browse</Link>
            <Link to="/user/info">&gt;  Profile</Link>
            <Link to="/">&gt;  Terms of Service</Link>
        </div>
    </div>
  )
}
