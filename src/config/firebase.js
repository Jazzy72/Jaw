
import { initializeApp } from "firebase/app";
import { createUserWithEmailAndPassword, getAuth, sendPasswordResetEmail, signInWithEmailAndPassword, signOut} from "firebase/auth";
import { collection, doc, getDocs, getFirestore, query, setDoc, where } from "firebase/firestore";
import { toast } from "react-toastify";

//
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCxMbz-aPNisELA5ziNbB1vYIzle-lrsqE",
  authDomain: "chat-app-c895d.firebaseapp.com",
  projectId: "chat-app-c895d",
  storageBucket: "chat-app-c895d.appspot.com",
  messagingSenderId: "126133751986",
  appId: "1:126133751986:web:438d4478deae64c27ff9ab"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

//
const storage = getStorage(app); 

const signup = async (username,email,password) => {
    try{
        const res = await createUserWithEmailAndPassword(auth,email,password);
        const user = res.user;
        await setDoc(doc(db,"users",user.uid),{
            id:user.uid,
            username:username.toLowerCase(),
            email,
            name:"",
            avatar:"",
            bio:"Hey, There I am using chat app",
            lastSeen:Date.now()
        })
        await setDoc(doc(db,"chats",user.uid),{
            chatsData:[]
        })
    } catch (error) {
        console.error(error)
        toast.error(error.code.split('/')[1].split('-').join(" "));
    }
}

const login = async (email,password) => {
    try{
        await signInWithEmailAndPassword(auth,email,password);
    } catch (error) {
        console.error(error);
        toast.error(error.code.split('/')[1].split('-').join(" "));
    }
} 

const logout = async () => {
    try {
        await signOut(auth); 
    } catch (error) {
        console.error(error);
        toast.error(error.code.split('/')[1].split('-').join(" ")); 
    }
}

// export {signup,login,logout,auth,db}

const resetPass = async (email) => {
    if (!email) {
        toast.error("Enter your email");
        return null;
    }
    try {
        const userRef = collection(db,'users');
        const q = query(userRef,where("email","==",email));
        const querySnap = await  getDocs(q);
        if (!querySnap.empty) {
            await sendPasswordResetEmail(auth,email);
            toast.success("Reset Email Sent");
        }
        else{
            toast.error("Email not found");
        }
    } catch (error) {
        console.error(error);
        toast.error(error.message)
    }
}

//
export {signup,login,logout,auth,db,storage,resetPass}