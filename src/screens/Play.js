import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { socket } from "../socket";
import { Outlet } from "react-router-dom";
import { Badge, Button, Card, Col, Container, Dropdown, DropdownButton, Form, Row } from "react-bootstrap";
import {
  FaBolt, FaCheck, FaClock, FaFire, FaHandPaper,
  FaPencilRuler, FaTimes, FaUserSlash, FaChessKnight
} from "react-icons/fa";
import styles from "../public/Home.module.css";
import Select from 'react-select';
import "../public/Login.css";
import { SideMenu } from "../components/Navbar";
import { setGame } from "../features/gameSlice";
import Chat from "../components/Chat";
import { useUser } from "@descope/react-sdk";

export default function Play() {
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [abortTime, setAbortTime] = useState(20);
  const user = useSelector((state) => state.users);
  const game = useSelector((state) => state.game);
  const [drawRequested, setDrawRequested] = useState(false);
  const [requestDraw, setRequestDraw] = useState(false);
  const onlineUsers = useSelector((state) => state.onlineUsers);
  const [opponent, setOpponent] = useState(onlineUsers && onlineUsers.length ? onlineUsers[0] : "");
  const [timeLabel, setTimeLabel] = useState("Select time control...");
  const dispatch = useDispatch();
  const audioRef = useRef(null);

  const playSound = () => {
    try {
      audioRef.current.play();
    } catch (e) { }
  };

  useEffect(() => {
    socket.on("drawRequested", ({ color }) => {
      if (color === game.color) {
        setRequestDraw("Draw Requested");
      } else {
        setDrawRequested(true);
        playSound();
      }
    });

    socket.on("gameState", ({ abortTime }) => {
      setAbortTime(abortTime);
    });

    socket.on("drawRejected", () => {
      setRequestDraw("Draw Rejected");
      setTimeout(() => { setRequestDraw(false) }, 2000);
    });

    fetchGame();

    return () => {
      socket.off("drawRequested");
      socket.off("gameState");
      socket.off("drawRejected");
    };
  }, [game]);

  function play() {
    if (!game.opponent && opponent && time) {
      socket.emit("challenge", { challenger: user.username, player: opponent, time: time, handshake: 0 });
    }
  }

  const timeOptions = [
    { value: 1, label: '1 minute', icon: <FaFire className="text-danger" /> },
    { value: 3, label: '3 minutes', icon: <FaBolt className="text-warning" /> },
    { value: 5, label: '5 minutes', icon: <FaBolt className="text-warning" /> },
    { value: 10, label: '10 minutes', icon: <FaClock className="text-info" /> },
  ];


  function handleResign() {
    socket.emit("resign", { color: game.color, gameId: game.gameId });
  }

  function handleDraw() {
    socket.emit("requestDraw", { gameId: game.gameId, color: game.color });
  }

  function onAccept() {
    setDrawRequested(false);
    socket.emit("draw", { gameId: game.gameId });
  }

  function onReject() {
    setDrawRequested(false);
    socket.emit("rejectDraw", { gameId: game.gameId, color: game.color });
  }

  const fetchGame = async () => {
    const apiUrl = process.env.REACT_APP_API_URL;
    const response = await fetch(`${apiUrl}/game/games`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username: user.username, gameId: game.gameId }),
    });

    const activeGame = await response.json();
    if (activeGame.found) {
      setPlaying(true);
    }
    else {
      setPlaying(false);
      dispatch(setGame({}));
    }
  };

  return (
    <Container fluid className="d-flex flex-column game-screen">
      <SideMenu playing={playing} />

      <Row className="flex-grow-1 m-0">
        {/* Chess Board Outlet (on the left side for larger screens, top for small screens) */}
        <Col xs={12} md={7} lg={7} className="d-flex align-items-center justify-content-center order-1 py-3 mt-1 order-md-1">
          <div className="chess-board-container w-100">
            <Outlet />
          </div>
        </Col>

        <Col xs={12} md={5} lg={5} className="d-flex flex-column py-3 order-2 order-md-2 mt-1">
          <Card bg="dark" text="white" className="shadow-lg mb-3 border-0">
            <Card.Header className="bg-dark border-secondary d-flex align-items-center">
              <FaChessKnight className="me-2 text-primary" />
              <span className="fw-bold">Game Controls</span>
              {abortTime <= 10 && (
                <Badge
                  bg="warning"
                  text="dark"
                  className="ms-auto px-2 py-1"
                >
                  Aborting in {abortTime}s
                </Badge>
              )}
            </Card.Header>
            <Card.Body className="p-3">
              {onlineUsers.length ? (
                <Form>
                  <Row>
                    <Col xs={12} className="mb-3">
                      <Form.Group>
                        <Form.Label className="fw-bold text-light">Select Opponent</Form.Label>
                        <DropdownButton
                          variant="dark"
                          title={opponent || "Select opponent"}
                          className="custom-dropdown text-light border-secondary"
                        >
                          {onlineUsers && onlineUsers.map((name, index) => (
                            <Dropdown.Item
                              key={index}
                              onClick={() => {
                                setOpponent(name);
                              }}
                              className="dropdown-item-dark d-flex align-items-center text-light"
                              active={opponent === name}
                            >
                              {name}
                            </Dropdown.Item>
                          ))}
                        </DropdownButton>
                      </Form.Group>
                    </Col>

                    <Col xs={12} className="mb-3">
                      <Form.Group>
                        <Form.Label className="fw-bold text-light">Time Control</Form.Label>

                        <DropdownButton
                          variant="dark"
                          title={timeLabel}
                          className="custom-dropdown text-light border-secondary"
                        >
                          {timeOptions.map((option, index) => (
                            <Dropdown.Item
                              key={index}
                              onClick={() => {
                                setTime(option.value);
                                setTimeLabel(<><span className="me-2">{option.icon}</span>{option.label}</>);
                              }}
                              className="dropdown-item-dark d-flex align-items-center text-light"
                            >
                              <span className="me-2">{option.icon}</span>
                              {option.label}
                            </Dropdown.Item>
                          ))}
                        </DropdownButton>

                      </Form.Group>
                    </Col>
                  </Row>

                  {!game.opponent &&
                    <div className="d-grid gap-2">
                      <Button
                        variant="success"
                        className="fw-bold"
                        onClick={play}
                        disabled={((playing && game.opponent) || time === 0)}
                      >
                        <FaChessKnight className="me-2" />
                        {(playing && game.opponent) ? "Game in Progress" : "Start Game"}
                      </Button>
                    </div>
                  }

                  {game.opponent && (
                    <div className="d-flex justify-content-between mt-3 flex-wrap">
                      <Button
                        variant="outline-danger"
                        size="sm"
                        className="mb-2"
                        onClick={handleResign}
                        disabled={!(playing || game.opponent)}
                      >
                        <FaHandPaper className="me-1" /> Resign
                      </Button>

                      {drawRequested ? (
                        <div className="d-flex ms-auto">
                          <Button
                            variant="outline-success"
                            size="sm"
                            className="mb-2 me-2"
                            onClick={onAccept}
                          >
                            <FaCheck className="me-1" /> Accept Draw
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            className="mb-2"
                            onClick={onReject}
                          >
                            <FaTimes className="me-1" /> Reject
                          </Button>
                        </div>
                      ) : requestDraw ? (
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          className="mb-2 ms-auto"
                          disabled={true}
                        >
                          <FaPencilRuler className="me-1" /> {requestDraw}
                        </Button>
                      ) : (
                        <Button
                          variant="outline-warning"
                          size="sm"
                          className="mb-2 ms-auto"
                          onClick={handleDraw}
                          disabled={!(playing || game.opponent)}
                        >
                          <FaPencilRuler className="me-1" /> Request Draw
                        </Button>
                      )}
                    </div>
                  )}
                </Form>
              ) : (
                <div className="text-center py-4">
                  <FaUserSlash size={32} className="mb-3 text-secondary" />
                  <p className="mb-0 text-secondary fw-bold">No players online</p>
                  <p className="text-muted small">Wait for other players to join or invite friends</p>
                </div>
              )}
            </Card.Body>
          </Card>

          {/* Chat Component */}
          <Card bg="dark" text="white" className="shadow-lg pb-3 p-0 border-0 flex-grow-1">
            <Chat playing={game.opponent} />
          </Card>
        </Col>
      </Row>
      <audio ref={audioRef} src={require("../public/message.mp3")} />
    </Container>
  );
}