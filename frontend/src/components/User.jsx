import React, { useContext, useEffect, useState } from 'react'
import '../css/user.css'
import { Outlet, useNavigate} from 'react-router-dom'
import { UserContext } from './AppProvider';
export default function User() {
    const {user} = useContext(UserContext);
    const user_pages = [{name : 'Info', link : 'info'}, {name : 'Library', link : 'library'}, {name : 'Inbox', link : 'inbox'}]
    const navigate = useNavigate();
    const [isSelected, setIsSelected] = useState('Info');
    useEffect(()=>{
        navigate('/user/info');
    }, [])
  return (
    <div className='user container'>
        <div className="user__profile">
            <div className="user__profile__avatar">
                <i className="fa-solid fa-user"></i>
            </div>
            <div className="user__profile__info">
                <div className="user__name">
                    {user.username}
                </div>
                <div className="user__status">
                    <div className="icon">
                        <i className="fa-solid fa-book-open-reader"></i>
                    </div>
                    <p className="text">
                        Reader
                    </p>
                </div>
                <div className="user__email">
                    <div className="icon">
                        <i className="fa-regular fa-envelope"></i>
                    </div> 
                    <div className="text">
                        {user.email}
                    </div>                   
                </div>
            </div>
        </div>
        <div className="user__navigations">
            {user_pages.map((page, index)=>{
                return(

                    <div className={`user__page ${isSelected === page.name ? 'active' : ''}`}
                     onClick={()=>{
                        navigate(page.link);
                      setIsSelected(page.name)}}
                      key={index}>
                        {page.name}
                    </div>
                )
            })}
        </div>
        <div className="user__page__content">
            <Outlet/>
        </div>
    </div>
  )
}
