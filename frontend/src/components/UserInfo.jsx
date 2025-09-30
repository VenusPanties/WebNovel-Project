import React, { useContext } from 'react'
import { LoginContext, UserContext } from './AppProvider';
import { useNavigate } from 'react-router-dom';
export default function UserInfo() {
    const navigate = useNavigate();
    const {setLogin} = useContext(LoginContext);
    const {user, setUser} = useContext(UserContext);
    const infos = [{name : 'User Name', value : user.username}, {name : 'E-mail', value : user.email}, {name : 'About', value : 'I am a user of this website'}, {name : 'Rank', value : 'Reader'}, {name : 'Re', value : '1990-01-01'}, {name : 'Location', value : 'New York, USA'}, {name : 'Joined', value : '2024-01-01'}]
    const handleSignOut = () => {
        setLogin(false);
        setUser(null);
        navigate('/')
    }
    return (
    <div>
        <div className="user__info">
            <div className="user__info__header">
                Profile Info 
            </div>
            <div className="user__info__content">
                {infos.map((info, index)=>{
                    return(
                        <div className="user__info__item" key={index}>
                            <div className="user__info__item__name">{info.name}</div>
                            <div className="user__info__item__value">{info.value}</div>
                        </div>
                    )
                })}
            </div>
            </div>
            <div className="user__info__buttons">
            <div className="user__btn sign-out" onClick={handleSignOut}>
                SIGN OUT
            </div>
            <div className="user__btn update-profile">
                UPDATE PROFILE
            </div>
        </div>
        <div className="user__activity">
            <div className="user__activity__header">
                Activity Stats
            </div>
            <div className="user__activity__stats">
                <div className="stats comment__stats">
                    <div className="header">
                        Comment Stats
                    </div>
                    <div className="item">
                        <div className="text">
                            Comments
                        </div>
                        <div className="number">
                            195
                        </div>
                    </div>
                    <div className="item">
                        <div className="text">
                            Likes
                        </div>
                        <div className="number">
                            115
                        </div>
                    </div><div className="item">
                        <div className="text">
                            Dislikes
                        </div>
                        <div className="number">
                            13
                        </div>
                    </div>
                </div>
                <div className="stats novel__stats">
                    <div className="header">
                        Novel Stats
                    </div>
                    <div className="item">
                        <div className="text">
                            Bookmarked
                        </div>
                        <div className="number">
                            0
                        </div>
                    </div>
                    <div className="item">
                        <div className="text">
                            Novels Read
                        </div>
                        <div className="number">
                            57
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div className="user__warning">
            <h3 className="user__warning__header">
                Recieved Restriction Warning : None
            </h3>
            <p className="user__warning__content">
                Once you reach the 5 warning limit, your account will be automatically banned. Please consider the rules when writing comments and reviews. Check your inbox page to follow warning notifications.
            </p>
        </div>
    </div>
  )
}
