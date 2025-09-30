import React, { useContext, useState } from 'react'
import '../css/sign-up.css'
import axios from 'axios'
import { Link, useNavigate } from 'react-router-dom';
import LoginButton from './LoginButton';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { LoginContext, UserContext } from './AppProvider';
export default function SignUp() {
    const {setLogin} = useContext(LoginContext);
    const {setUser} = useContext(UserContext);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErros] = useState({})
    const [isError, setIsError] = useState(false);
    const navigate = useNavigate();
    const clientId = import.meta.env.VITE_CLIENT_ID;


    const handleSubmit = (e) => {
        e.preventDefault();
    
        setIsError(false); // Initialize the error to false
        setErros({}); // Initialize errors
    
        const tempErrors = {}; // Create a temporary errors object
    
        // Validation logic
        if(!email || !password ){
            tempErrors.headError = '*All fields need to be filled';
            setIsError(true);
            setErros(tempErrors);
            return;
        }
        if (!email.includes('@')) {
            tempErrors.email = "*Set valid email";
        }
        if (password.length < 8) {
            tempErrors.password = '*Password cannot be shorter than 8';
        }
    
        // If there are validation errors, update state and exit
        if (Object.keys(tempErrors).length > 0) {
            setIsError(true);
            setErros(tempErrors);
            return;
        }
        const baseUrl = 'http://localhost:5000'
        axios.post(`${baseUrl}/user/signin`, {email, password})
        .then(response=>{
            if(response.status === 200){
                setUser(response.data)
                setLogin(true)
                navigate('/')
            }
            
        })
        .catch(err =>{
            console.log(err)
            if(err.response.status === 401){
                let errs = errors;
                errs.headError = err.response.data.message;
                setErros(errs)
            }
        })
    };
    
  return (
    <div className='sign-up'>
        <form className='sign-up-form' onSubmit={(e)=>{
            handleSubmit(e);
        }}>
            <div className="header">
                <div className="icon">
                    <i className="fa-solid fa-arrow-left"></i>
                </div>
                <h3 className="title">
                    Sign In with Email
                </h3>
            </div>
            <div className="body">
                <p className='head-error'> {errors.headError} </p>
                <div className="input-field">
                    <p className="name">
                        Email
                    </p>
                    <input type="text" id='email' value={email} onChange={(e)=>{
                           setEmail(e.target.value)
                    }}/>
                    {isError ? <p className="error">
                        {errors.email}
                    </p> : ''}
                </div>
                
                <div className="input-field">
                    <p className="name">
                        PASSWORD
                    </p>
                    <input type="password" id='password' value={password} onChange={(e)=>{
                           setPassword(e.target.value)
                    }}/>
                    {isError ? <p className="error">
                        {errors.password}
                    </p> : ''}
                </div>
                
                <button className='sign-in-btn'>
                    SIGN IN
                </button>
                <GoogleOAuthProvider clientId={clientId}>
                    <LoginButton/>
                </GoogleOAuthProvider>
            <div className="sign-in-links">
                <Link to='/sign-up' className="sign-in-link" style={{textDecoration: 'none'}}>
                    DON'T HAVE AN ACCOUNT? SIGN UP!
                </Link>
                
                <h3 className="sign-in-link">
                    FORGOT PASSWORD?
                </h3>
            </div>
            </div>
            
            <div className="footer">
                
                <p>
                By signing up to lightnovelworld.co, you agree to our
                <br /> <span>Terms of Service</span> and <span>Privacy Policy</span>
                </p>
            </div>
        </form>
    </div>
  )
}
