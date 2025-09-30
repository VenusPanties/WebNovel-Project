import React from 'react'
import { Link } from 'react-router-dom';

export default function NavbarItem(props) {
    const {item} = props;
  return (
    <>
    <div className="icon">
    <i className={item.icon}></i>
    </div>
    <p className="m-txt">{item.name}</p>
    </>
  )
}
