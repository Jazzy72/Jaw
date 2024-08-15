import React, { useContext, useEffect, useState } from 'react';
import './ChatBox.css';
import assets from '../../assets/assets';
import { AppContext } from '../../context/AppContext';
import { arrayUnion, doc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db, storage } from '../../config/firebase';  // Import storage
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';  // Import Firebase Storage functions
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAnglesRight } from '@fortawesome/free-solid-svg-icons';


const ChatBox = () => {
    const { userData, messagesId, chatUser, messages, setMessages } = useContext(AppContext);
    const [input, setInput] = useState("");

    // Function to handle image upload
    const upload = async (file) => {
        const storageRef = ref(storage, `chatImages/${new Date().getTime()}_${file.name}`);
        await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(storageRef);
        return downloadURL;
    }

    const sendMessage = async () => {
        try {
            if (input && messagesId) {
                await updateDoc(doc(db, 'messages', messagesId), {
                    messages: arrayUnion({
                        sId: userData.id,
                        text: input,
                        createdAt: new Date()
                    })
                });

                const userIDs = [chatUser.rId, userData.id];

                userIDs.forEach(async (id) => {
                    const userChatsRef = doc(db, 'chats', id);
                    const userChatsSnapShot = await getDoc(userChatsRef);

                    if (userChatsSnapShot.exists()) {
                        const userChatData = userChatsSnapShot.data();
                        const chatIndex = userChatData.chatsData.findIndex((c) => c.messageId === messagesId);
                        if (chatIndex !== -1) {
                            userChatData.chatsData[chatIndex].lastMessage = input.slice(0, 30);
                            userChatData.chatsData[chatIndex].updatedAt = Date.now();
                            if (userChatData.chatsData[chatIndex].rId === userData.id) {
                                userChatData.chatsData[chatIndex].messageSeen = false;
                            }
                            await updateDoc(userChatsRef, {
                                chatsData: userChatData.chatsData
                            });
                        }
                    }
                });
                setInput(""); // Clear input after sending
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    const sendImage = async (e) => {
        try {
            const fileUrl = await upload(e.target.files[0]); // Upload the image

            if (fileUrl && messagesId) {
                await updateDoc(doc(db, 'messages', messagesId), {
                    messages: arrayUnion({
                        sId: userData.id,
                        image: fileUrl,
                        createdAt: new Date()
                    })
                })

                const userIDs = [chatUser.rId, userData.id];

                userIDs.forEach(async (id) => {
                    const userChatsRef = doc(db, 'chats', id);
                    const userChatsSnapShot = await getDoc(userChatsRef);

                    if (userChatsSnapShot.exists()) {
                        const userChatData = userChatsSnapShot.data();
                        const chatIndex = userChatData.chatsData.findIndex((c) => c.messageId === messagesId);
                        if (chatIndex !== -1) {
                            userChatData.chatsData[chatIndex].lastMessage = "Image";
                            userChatData.chatsData[chatIndex].updatedAt = Date.now();
                            if (userChatData.chatsData[chatIndex].rId === userData.id) {
                                userChatData.chatsData[chatIndex].messageSeen = false;
                            }
                            await updateDoc(userChatsRef, {
                                chatsData: userChatData.chatsData
                            })
                        }
                    }
                })

            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    useEffect(() => {
        if (messagesId) {
            const unSub = onSnapshot(doc(db, 'messages', messagesId), (res) => {
                setMessages(res.data().messages.reverse());
            });
            return () => {
                unSub();
            };
        }
    }, [messagesId, setMessages]);

    return chatUser ? (
        <div className='chat-box'>
            {chatUser.userData && (
                <div className="chat-user">
                    <img src={chatUser.userData.avatar} alt="" />
                    <p>{chatUser.userData.name} {Date.now()-chatUser.userData.lastSeen <= 70000 ? <img className='dot' src={assets.green_dot} alt="" /> : null}</p>
                    <img src={assets.help_icon} className='help' alt="" />
                </div>
            )}

            <div className="chat-msg">
                {messages.map((msg, index) => (
                    <div key={index} className={msg.sId === userData.id ? "s-msg" : "r-msg"}>
                        {msg["image"]
                            ? <img className='msg-img' src={msg.image} alt="" />
                            : <p className="msg">{msg.text}</p>
                        }
                        <div>
                            <img src={msg.sId === userData.id ? userData.avatar : chatUser.userData.avatar} alt="" />
                            <p>{new Date(msg.createdAt.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="chat-input">
                <input onChange={(e) => setInput(e.target.value)} value={input} type="text" placeholder="Send a message..." />
                <input onChange={sendImage} type="file" id='image' accept='image/png, image/jpeg' hidden />
                <label htmlFor="image">
                    <img src={assets.gallery_icon} alt="" />
                </label>
                <img onClick={sendMessage} src={assets.send_button} alt="" />
                {/* <FontAwesomeIcon icon={faAnglesRight} /> */}
            </div>
        </div>
    ) : (
        <div className='chat-welcome'>
            <img src={assets.lg} alt="" />
            <p>Bringing conversations to life !!!</p>
        </div>
    );
}

export default ChatBox;
