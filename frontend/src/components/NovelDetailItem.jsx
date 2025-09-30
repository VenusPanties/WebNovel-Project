import React from 'react'

export default function NovelDetailItem(props) {
    const {item} = props;
  return (
    <>
        <p>{item.name}</p>
        {'status' in item ? <p className={`status ${item.status == 'Completed' ? 'green' : 'red'}`}>{item.status}</p>
        :
        <div className="icon" style={{display : 'flex', gap : '.5rem'}}>
        <i className={item.icon}></i>
        <p className="item-text">{item.value}</p>
        </div>
        }
    </>
  )
}
