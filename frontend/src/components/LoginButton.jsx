import React, { useContext } from 'react'
import { GoogleOAuthProvider, GoogleLogin, useGoogleLogin } from '@react-oauth/google'
import '../css/sign-up.css'
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { LoginContext, UserContext } from './AppProvider';
export default function LoginButton() {
    const {setLogin} = useContext(LoginContext);
    const {setUser} = useContext(UserContext);
    const navigate = useNavigate();
    const baseUrl = 'http://localhost:5000';
    const login = useGoogleLogin({
        onSuccess : async (response) => {
            await axios.post(`${baseUrl}/googleLogin`, {accessToken : response.access_token})
            .then(res => {
                if(res.status === 200){
                    navigate('/');
                    setLogin(true);
                    setUser(res.data);
                    console.log(res.data);
                }
                else{
                    navigate('/sign-up');
                }
            })
        },
        onError : (error) => {
            response.log(error);
        }
    })
    
    return (
            <button className='google-login-btn' onClick = {login}>
                <i className="fa-brands fa-google"></i> Sign in with Google
            </button>
    )
}