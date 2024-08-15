import React, { useContext, useEffect, useState } from 'react';
import './RightSidebar.css';
import assets from '../../assets/assets';
import { logout } from '../../config/firebase';
import { AppContext } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';

const RightSidebar = () => {
  const { chatUser, messages, userData } = useContext(AppContext);
  const [msgImages, setMsgImages] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    let tempVar = [];
    messages.forEach((msg) => {
      if (msg.image) {
        tempVar.push(msg.image);
      }
    });
    setMsgImages(tempVar);
  }, [messages]);

  const handleEditProfile = () => {
    navigate('/profile'); // Assuming /profile-update is the route for editing the profile
  };

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
      {chatUser ? (
        <div className="rs-media">
          <p>Media</p>
          <div>
            {msgImages.map((url, index) => (
              <img onClick={() => window.open(url)} key={index} src={url} alt='' />
            ))}
          </div>
        </div>
      ) : (
        <button onClick={handleEditProfile} className='edit-profile-btn'>
          Edit Profile
        </button>
      )}
      <button onClick={() => logout()}>Logout</button>
    </div>
  );
};

export default RightSidebar;
