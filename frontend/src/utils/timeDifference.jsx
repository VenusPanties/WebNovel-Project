export  const timeDifference = (date)=>{
    date = new Date(date);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const time =(diffTime < 1000 * 60) ? 'Just now' :
    (diffTime < 1000 * 60 * 60) ? `${Math.ceil(diffTime / (1000 * 60))} minutes ago` :
    (diffTime < 1000 * 60 * 60 * 24) ? `${Math.ceil(diffTime / (1000 * 60 * 60))} hours ago` :
    (diffTime < 1000 * 60 * 60 * 24 * 30) ? `${Math.ceil(diffTime / (1000 * 60 * 60 * 24))} days ago` :
    (diffTime < 1000 * 60 * 60 * 24 * 30 * 12) ? `${Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30))} months ago` :
    `${Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30 * 12))} years ago`;
    return time;
  }