import React, { useState } from 'react'
import '../css/sign-up.css'
import axios from 'axios'
import { useNavigate } from 'react-router-dom';

export default function AdminSignIn() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState({})
    const [isError, setIsError] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
    
        setIsError(false);
        setErrors({});
    
        const tempErrors = {};
    
        // Validation logic
        if(!email || !password ){
            tempErrors.headError = '*All fields need to be filled';
            setIsError(true);
            setErrors(tempErrors);
            return;
        }
        if (!email.includes('@')) {
            tempErrors.email = "*Set valid email";
        }
        if (password.length < 8) {
            tempErrors.password = '*Password cannot be shorter than 8';
        }
    
        if (Object.keys(tempErrors).length > 0) {
            setIsError(true);
            setErrors(tempErrors);
            return;
        }

        const baseUrl = 'http://localhost:5000'
        axios.post(`${baseUrl}/admin/signin`, {email, password})
        .then(response => {
            if(response.status === 200){
                localStorage.setItem('adminToken', response.data.token);
                console.log('Login successful, navigating to /admin');
                navigate('/admin', { replace: true });
            }
        })
        .catch(err => {
            console.log('Login error:', err);
            if(err.response?.status === 401){
                let errs = {};
                errs.headError = err.response.data.message;
                setErrors(errs);
            }
        });
    };
    
    return (
        <div className='sign-up'>
            <form className='sign-up-form' onSubmit={handleSubmit}>
                <div className="header">
                    <div className="icon" onClick={() => navigate('/')}>
                        <i className="fa-solid fa-arrow-left"></i>
                    </div>
                    <h3 className="title">
                        Admin Sign In
                    </h3>
                </div>
                <div className="body">
                    <p className='head-error'> {errors.headError} </p>
                    <div className="input-field">
                        <p className="name">
                            Email
                        </p>
                        <input 
                            type="text" 
                            id='email' 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        {isError && <p className="error">{errors.email}</p>}
                    </div>
                    
                    <div className="input-field">
                        <p className="name">
                            PASSWORD
                        </p>
                        <input 
                            type="password" 
                            id='password' 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        {isError && <p className="error">{errors.password}</p>}
                    </div>
                    
                    <button className='sign-in-btn'>
                        SIGN IN AS ADMIN
                    </button>
                </div>
                
                <div className="footer">
                    <p>
                        This login page is restricted to administrators only.
                        <br />
                        Unauthorized access attempts will be logged.
                    </p>
                </div>
            </form>
        </div>
    )
} 