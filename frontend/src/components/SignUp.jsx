import React, { useState } from 'react'
import '../css/sign-up.css'
import axios from 'axios'
import { Link, useNavigate } from 'react-router-dom';
export default function SignUp() {
    const [email, setEmail] = useState('');
    const [userName, setUserName] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errors, setErros] = useState({})
    const [isError, setIsError] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
    
        setIsError(false); // Initialize the error to false
        setErros({}); // Initialize errors
    
        const tempErrors = {}; // Create a temporary errors object
    
        // Validation logic
        if(!email || !userName || !password || !confirmPassword){
            tempErrors.headError = '*All fields need to be filled';
            setIsError(true);
            setErros(tempErrors);
            return;
        }
        if (!email.includes('@')) {
            tempErrors.email = "*Set valid email";
        }
        if (userName.length < 5) {
            tempErrors.username = "*Username must be at least 5 characters long";
        }
        if (password !== confirmPassword) {
            tempErrors.password = "*Passwords do not match";
        }
        if (password.length < 8) {
            tempErrors.password = '*Password cannot be shorter than 8';
            tempErrors.confirmpassword = '*Password cannot be shorter than 8';
        }
    
        // If there are validation errors, update state and exit
        if (Object.keys(tempErrors).length > 0) {
            setIsError(true);
            setErros(tempErrors);
            return;
        }
    
        // If no errors, proceed with API call
        axios.post(`http://localhost:5000/user/signup`, { username : userName, email, password })
            .then(response => {
                if (response.status === 201) { // Success
                    console.log(response.data.message);
                    console.log('navigating');
                    navigate('/sign-in');
                }  
            })
            .catch(err=>{
                if(err.response && err.response.status == 400){
                    setErros({headError : `*${err.response.data.message}`})
                }
                else if (err.response.status == 500){
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
                    Sign up with Email
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
                        USER NAME
                    </p>
                    <input type="text" id='username' value={userName} onChange={(e)=>{
                           setUserName(e.target.value)
                    }}/>
                    {isError ? <p className="error">
                        {errors.username}
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
                <div className="input-field">
                    <p className="name">
                        CONFIRM PASSWORD
                    </p>
                    <input type="password" id='confirm-password' value={confirmPassword} onChange={(e)=>{
                           setConfirmPassword(e.target.value)
                    }}/>
                    {isError ? <p className="error">
                        {errors.confirmpassword}
                        </p> : ''}
                </div>
                <button className='sign-up-btn'>
                    SIGN UP
                </button>
                
            </div>
            <div className="footer">
                <Link to='/sign-in' className="sign-in-link" style={{textDecoration: 'none'}}>
                    ALREADY HAVE AN ACCOUNT? SIGN IN!
                </Link>
                <p>
                By signing up to lightnovelworld.co, you agree to our
                <br /> <span>Terms of Service</span> and <span>Privacy Policy</span>
                </p>
            </div>
        </form>
    </div>
  )
}
