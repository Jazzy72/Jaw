import React, { useContext, useState } from 'react';
import './LeftSidebar.css';
import assets from '../../assets/assets';
import { useNavigate } from 'react-router-dom';
import { arrayUnion, collection, doc, getDoc, getDocs, query, serverTimestamp, setDoc, updateDoc, where } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { AppContext } from '../../context/AppContext';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsisVertical, faMagnifyingGlass, faSpinner } from '@fortawesome/free-solid-svg-icons';


const LeftSidebar = () => {
    const navigate = useNavigate();
    const { userData, chatData, chatUser, setChatUser, setMessagesId, messagesId } = useContext(AppContext);
    const [user, setUser] = useState(null);
    const [showSearch, setShowSearch] = useState(false);

    const inputHandler = async (e) => {
        try {
            const input = e.target.value;
            if (input) {
                setShowSearch(true);
                const userRef = collection(db, 'users');
                const q = query(userRef, where("username", "==", input.toLowerCase()));
                const querySnap = await getDocs(q);
                if (!querySnap.empty && querySnap.docs[0].data().id !== userData.id) {
                    let userExist = false;
                    chatData.forEach((chat) => {
                        if (chat.rId === querySnap.docs[0].data().id) {
                            userExist = true;
                        }
                    });
                    if (!userExist) {
                        setUser(querySnap.docs[0].data());
                    }
                } else {
                    setUser(null);
                }
            } else {
                setShowSearch(false);
            }
        } catch (error) {
            console.error("Error in inputHandler:", error);
        }
    };

    const addChat = async () => {
        const messagesRef = collection(db, "messages");
        const chatsRef = collection(db, "chats");
        try {
            const newMessageRef = doc(messagesRef);
            await setDoc(newMessageRef, {
                createdAt: serverTimestamp(),
                messages: []
            });

            const chatDataForNewUser = {
                messageId: newMessageRef.id,
                lastMessage: "",
                rId: userData.id,
                updatedAt: Date.now(),
                messageSeen: true
            };

            await updateDoc(doc(chatsRef, user.id), {
                chatsData: arrayUnion(chatDataForNewUser)
            });

            const chatDataForCurrentUser = {
                messageId: newMessageRef.id,
                lastMessage: "",
                rId: user.id,
                updatedAt: Date.now(),
                messageSeen: true
            };

            await updateDoc(doc(chatsRef, userData.id), {
                chatsData: arrayUnion(chatDataForCurrentUser)
            });

            // Refresh the chat data after adding a chat
            setUser(null);
            setShowSearch(false);

        } catch (error) {
            toast.error(error.message);
            console.error("Error in addChat:", error);
        }
    };

    const setChat = async (item) => {
        setMessagesId(item.messageId);
        setChatUser(item);
        const userChatsRef = doc(db,'chats',userData.id);
        const userChatsSnapShot = await getDoc(userChatsRef);
        const userChatsData = userChatsSnapShot.data();
        const chatIndex = userChatsData.chatsData.findIndex((c)=>c.messageId === item.messageId);
        userChatsData.chatsData[chatIndex].messageSeen = true;
        await updateDoc(userChatsRef,{
            chatsData:userChatsData.chatsData
        })
        // setChatVisible(true);
    };

    return (
        <div className='ls'>
            <div className="ls-top">
                <div className="ls-nav">
                    <img src={assets.lg_side1} className='logo' alt="" />
                    <div className="menu">
                        {/* <img src={assets.menu_icon} alt="" /> */}
                        <FontAwesomeIcon icon={faEllipsisVertical} />
                        <div className="sub-menu">
                            <p onClick={() => navigate('/profile')}>Edit Profile</p>
                            <hr />
                            <p>Logout</p>
                        </div>
                    </div>
                </div>
                <div className="ls-search">
                    {/* <img src={assets.search_icon} alt="" /> */}
                    <FontAwesomeIcon icon={faMagnifyingGlass} />
                    <input onChange={inputHandler} type="text" placeholder='Search here..' />
                </div>
            </div>
            <div className="ls-list">
                {showSearch && user
                    ? <div onClick={addChat} className='friends add-user'>
                        <img src={user.avatar} alt="" />
                        <p>{user.name}</p>
                    </div>
                    : chatData && chatData.length > 0 ? chatData.map((item, index) => (
                        <div onClick={() => setChat(item)} key={index} className={`friends ${item.messageSeen || item.messageId === messagesId ? "" :"border"}`}>
                            <img src={item.userData.avatar} alt="" />
                            <div>
                                <p>{item.userData.name}</p>
                                <span>{item.lastMessage}</span>
                            </div>
                        </div>
                    )) : <p></p>
                }
            </div>
        </div>
    );
};

export default LeftSidebar;






