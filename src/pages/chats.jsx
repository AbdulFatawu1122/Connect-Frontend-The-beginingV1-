import { useEffect, useState, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { useParams, useLocation } from "react-router-dom";
import NavBar from "../components/navbar";
import FeedCard from "../components/feed-card";
import styles from "../css/chats.module.css";
import { format, parseISO } from "date-fns";
import InfiniteScroll from "react-infinite-scroll-component";

import { BASE_URL, WEB_SOC_BASE_URL } from "../apis/apis";
import { useNavigate } from "react-router-dom";

function Chats() {
  const [currentUser, setCurrentUser] = useState({});
  const [friends, setFriends] = useState([]);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [friendProfile, setFriendProfile] = useState({});

  const scrollRef = useRef(null);
  const messageRecievedSoundURL = "/messageRecieved.mp3";
  const messageSentSoundURL = "/messagesent2.mp3";
  const playSound = (soundURL) => {
    new Audio(soundURL).play().catch((e) => {
      console.log("Falied to play Sound");
    });
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]); // This triggers every time a new message is added

  const navigate = useNavigate();

  const { reciever_id } = useParams();
  //console.log(reciever_id);

  //Requesting notification access
  // Notification.requestPermission();

  const verify_token = async () => {
    const token = sessionStorage.getItem("token");
    try {
      const response = await fetch(`${BASE_URL}/auth/verify-token/${token}`, {
        method: "Post",
        headers: {
          accept: "application/json",
        },
      });

      if (response.ok) {
        // console.log("Login");
        // fetchProfileelatedData();
      } else {
        navigate("/login");
        sessionStorage.removeItem("token");
      }
    } catch (error) {
      console.log("Something went wrong");
    }
  };

  const get_current_user = async () => {
    try {
      const token = sessionStorage.getItem("token");
      const current_user = await fetch(`${BASE_URL}/user/me`, {
        method: "Get",
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await current_user.json();
      // console.log(data);
      setCurrentUser(data);
    } catch (eeror) {
      console.log("Fail to get Current User");
    }
  };

  const LoadPreviousMessages = async (friends_id) => {
    const token = sessionStorage.getItem("token");
    try {
      const response = await fetch(
        `${BASE_URL}/chat/loadChats?friend_id=${friends_id}`,
        {
          method: "Get",
          headers: {
            accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();
      // console.log(data);
      setMessages(data);
    } catch (eeror) {
      console.log("Fail to Load Messages");
    }
  };

  const fetch_friends_profile = async (user_id) => {
    const token = sessionStorage.getItem("token");
    try {
      const user_profile = await fetch(
        `${BASE_URL}/user/user-to-get?user_id=${user_id}`,
        {
          method: "Get",
          headers: {
            accept: "application/json",
          },
        },
      );

      const data = await user_profile.json();
      //console.log(data);
      setFriendProfile(data);
    } catch (eeror) {
      console.log("Fail to Load Profile");
    }
  };

  const ws = useRef(null);

  const handleSendMessage = async (reciever_id) => {
    if (!inputValue.trim()) return;
    try {
      const token = sessionStorage.getItem("token");
      const res = await fetch(
        `${BASE_URL}/chat/sendMessage?receiver_id=${reciever_id}&message=${inputValue}`,
        {
          method: "Post",
          headers: {
            accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (res.ok) {
        const data = await res.json();
        //console.log(data);

        setMessages((prevMessage) => [...prevMessage, data]);
        playSound(messageSentSoundURL);
      }
    } catch (eeror) {
      console.log("Fail to get Current User");
    }
  };

  useEffect(() => {
    verify_token();
    get_current_user();
    fetch_friends_profile(reciever_id);
    LoadPreviousMessages(reciever_id);
  }, [navigate]);

  useEffect(() => {
    //After
    ws.current = new WebSocket(
      `${WEB_SOC_BASE_URL}/chat/chats/${currentUser.user?.id}`,
    );

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.sender_id == reciever_id) {
        setMessages((prevMessage) => [...prevMessage, data]);

        Notification.requestPermission();
        playSound(messageRecievedSoundURL);
        if (Notification.permission == "granted") {
          new Notification(`${currentUser.user.firstname} Texted You`, {
            body: `MESSAGE: ${data.message}`,
          });
        }
      } else {
        console.log("Data from another friend");
      }
    };

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [currentUser.user?.id, reciever_id]);

  const ChatBubble = (messageObj) => {
    if (messageObj.sender_id == currentUser.user?.id) {
      return (
        <div className={styles.currentUser}>
          <div className={styles.currentUserName}></div>
          <div className={styles.currentUserMessage}>
            <p>{messageObj.message}</p>
          </div>
        </div>
      );
    } else {
      return (
        <div className={styles.otherUser}>
          <div className={styles.otherUserMessage}>
            <p>{messageObj.message}</p>
          </div>
        </div>
      );
    }
  };
  return (
    <div className={styles.ChatHome}>
      <div className={styles.messageTop}>
        <div className={styles.profileImage}>
          {friendProfile.profile?.status ? (
            <img
              src={`${friendProfile.profile.media?.filename}`}
              alt={`${friendProfile.user?.firstname} profile picture`}
            />
          ) : (
            <img
              src="https://vggbohfgmxodbzvbbrad.supabase.co/storage/v1/object/public/CoonectStorage/Asserts/no_profile.jpg"
              alt={`${friendProfile.user?.firstname} profile picture`}
            />
          )}
        </div>
        <div className={styles.userInfo}>
          <h1>
            {friendProfile.user?.firstname} {friendProfile.user?.lastname}
          </h1>
          <h2>{friendProfile.user?.email}</h2>
        </div>
      </div>
      <div className={styles.messagesBody}>
        <div className={styles.ecryptionMessage}>
          <p>
            Messages are end-to-end ecrptypted. No one can have access to your
            messages not even Connect. learn more..
          </p>
        </div>
        {messages.map((ms) => (
          <div key={ms.id} className={styles.message}>
            {ChatBubble(ms)}
          </div>
        ))}
        <div ref={scrollRef} />
      </div>
      <div className={styles.TextBox}>
        <textarea
          onKeyDown={(e) => {
            if (e.key == "Enter") {
              e.preventDefault();
              setInputValue("");
              handleSendMessage(reciever_id);
            }
          }}
          type="text"
          value={inputValue}
          onSubmit={() => {
            setInputValue("");
          }}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Type Message"
          style={{ width: "300px" }}
        />
        <button
          onClick={() => {
            handleSendMessage(reciever_id);
            setInputValue("");
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
}
export default Chats;
