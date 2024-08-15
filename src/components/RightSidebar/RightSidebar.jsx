// import React, { useContext, useEffect, useState } from 'react'
// import './RightSidebar.css'
// import assets from '../../assets/assets'
// import { logout } from '../../config/firebase'
// import { AppContext } from '../../context/AppContext'

// const RightSidebar = () => {

//   const {chatUser,messages} = useContext(AppContext);
//   const [msgImages,setMsgImages] = useState([]);

//   useEffect(()=>{
//     let tempVar = [];
//     messages.map((msg)=>{
//       if (msg.image) {
//         tempVar.push(msg.image)
//       }
//     })
//     setMsgImages(tempVar);
//   },[messages])

//   return chatUser ? (
//     <div className='rs'>
//       <div className="rs-profile">
//         <img src={chatUser.userData.avatar} alt="" />
//         <h3>{Date.now() - chatUser.userData.lastSeen <= 70000 ? <img src={assets.green_dot} className='dot' alt="" /> : null} {chatUser.userData.name}</h3>
//         <p>{chatUser.userData.bio}</p>
//       </div>
//       <hr />
//       <div className="rs-media">
//         <p>Media</p>
//         <div>
//           {msgImages.map((url,index)=>(<img onClick={()=>window.open(url)} key={index} src={url} alt='' />))}

//           {/* <img src={assets.pic1} alt="" />
//           <img src={assets.pic2} alt="" />
//           <img src={assets.pic3} alt="" />
//           <img src={assets.pic4} alt="" />
//           <img src={assets.pic1} alt="" />
//           <img src={assets.pic2} alt="" /> */}
//         </div>
//       </div>
//       <button onClick={()=>logout()}>Logout</button>
//     </div>
//   )
//   : (
//     <div className='rs'>
//       <button onClick={()=>logout()} >Logout</button>
//     </div>
//   )
// }

// export default RightSidebar






import React, { useContext, useEffect, useState } from 'react';
import './RightSidebar.css';
import assets from '../../assets/assets';
import { logout } from '../../config/firebase';
import { AppContext } from '../../context/AppContext';

const RightSidebar = () => {
  const { chatUser, messages, userData } = useContext(AppContext);
  const [msgImages, setMsgImages] = useState([]);

  useEffect(() => {
    let tempVar = [];
    messages.forEach((msg) => {
      if (msg.image) {
        tempVar.push(msg.image);
      }
    });
    setMsgImages(tempVar);
  }, [messages]);

  return (
    <div className='rs'>
      <div className="rs-profile">
        <img src={chatUser ? chatUser.userData.avatar : userData.avatar} alt="" />
        <h3>
          {chatUser && Date.now() - chatUser.userData.lastSeen <= 70000 ? (
            <img src={assets.green_dot} className='dot' alt="" />
          ) : null}{' '}
          {chatUser ? chatUser.userData.name : userData.name}
        </h3>
        <p>{chatUser ? chatUser.userData.bio : userData.bio}</p>
      </div>
      <hr />
      <div className="rs-media">
        <p>Media</p>
        <div>
          {msgImages.map((url, index) => (
            <img onClick={() => window.open(url)} key={index} src={url} alt='' />
          ))}
        </div>
      </div>
      <button onClick={() => logout()}>Logout</button>
    </div>
  );
};

export default RightSidebar;



