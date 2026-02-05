import { Route, Routes } from "react-router-dom";

import Login from "./pages/login";
import Home from "./pages/home";
import SignUp from "./pages/signup";
import Profile from "./pages/profile";
import Protected from "./pages/protected";
import FriendsPage from "./pages/friends";
import User from "./pages/user";
import Settings from "./pages/settings";
import Testing from "./pages/testInfinteScroll";
import Chat from "./pages/websockets";
import Chats from "./pages/chats";
function App() {
  return (
    <div>
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/user/:user_id" element={<User />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/friends" element={<FriendsPage />} />
          <Route path="/settings/:user_id" element={<Settings />}/>
          <Route path="/chat" element={<Chat />} />
          <Route path="/chats/:reciever_id" element={<Chats />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
