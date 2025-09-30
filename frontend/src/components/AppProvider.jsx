import React, { createContext, useEffect, useState } from 'react'
export const LoginContext = createContext();
export const UserContext = createContext();
export default function AppProvider({children}) {
    const [login, setLogin] = useState(()=>
      localStorage.getItem('login') || null
    );
    const [user, setUser] = useState(()=>{
      const userString =localStorage.getItem('user') || null;
      return userString ? JSON.parse(userString) : null;
    });

    useEffect(()=>{
      login !== null || login !== undefined ? localStorage.setItem('login', login) : '';
      user !== null || user !== undefined ? localStorage.setItem('user', JSON.stringify(user)) : '';
      console.log('login', localStorage.getItem('login'));
      console.log('user', localStorage.getItem('user'));
    },[login, user])
    
  return (
        <LoginContext.Provider value = {{login, setLogin}}>
            <UserContext.Provider value = {{user, setUser}}>
            {children}
            </UserContext.Provider>
        </LoginContext.Provider>
  )
}
