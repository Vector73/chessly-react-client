import { useEffect, useState } from "react";
import "./App.css";
import { Container, Card } from 'react-bootstrap';
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { socket } from "./socket";
import { useDispatch, useSelector } from "react-redux";
import { setOnlineUsers } from "./features/onlineUsersSlice";
import { setGame } from './features/gameSlice';
import { addChallenge, removeChallenge } from "./features/challengeSlice";
import StyledLink from "./components/StyledLink";
import Loading from "./components/Loading";
import { addMessage, clearChat } from "./features/messagesSlice";
import Login from "./screens/Login";
import { useSession, useUser } from "@descope/react-sdk";
import ProtectedRoute from "./components/ProtectedRoute";


function App() {
  const [userData, setUserData] = useState({ authenticated: -1 });
  const user = useSelector((state) => state.users);
  const game = useSelector((state) => state.game);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();

  useEffect(() => {
    socket.on("onlineUsers", (onlineUsers) => {
      dispatch(setOnlineUsers(parseUsers(onlineUsers.online)))
    })

    const apiUrl = process.env.REACT_APP_API_URL;
    fetch(`${apiUrl}/home`, { method: "POST" })
      .then((res) => res.json())
      .then((res) => {
        setUserData(res);
      });

    socket.on("pushChallenge", ({ challenger, handshake, time }) => {
      if (!handshake) {
        socket.emit("challenge", { challenger: user.username, player: challenger, handshake: 1, time })
      }
      dispatch(addChallenge({
        opponent: challenger,
        status: "pending",
        handshake: handshake,
        time,
      }))
    })

    socket.on("joinGame", ({ opponent, gameId, color, time }) => {
      dispatch(removeChallenge({ opponent }))
      dispatch(clearChat());
      dispatch(setGame({
        opponent,
        gameId,
        color: color,
        status: "pending",
        time,
      }))
      navigate(`/chess/${gameId}`);
    })

    socket.on("sendMessage", ({ sender, content, key }) => {
      dispatch(addMessage({
        key,
        sender,
        content,
      }))
    })

    socket.on("clearChat", () => { dispatch(clearChat()); });

    socket.on("gameOver", ({ winner, reason, draw }) => {
      dispatch(setGame({ color: game.color }));
    })
    function parseUsers(users) {
    if (!user) return [];
    console.log(users)
    return users
      .filter((username) => username !== user.username);
  }

    return () => {
      socket.off("sendMessage");
      socket.off("clearChat");
    };
    
  }, [user]);

  return (
    <div id="app">
      {location.pathname === "/" ? <Login />
      : <Outlet />}
    </div>
  );
}

export default App;
