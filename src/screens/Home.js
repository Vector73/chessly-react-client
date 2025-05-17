import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Card, Col, Container, Row } from "react-bootstrap";
import { FaChessKnight, FaHistory, FaArrowRight, FaTrophy, FaChessBoard } from 'react-icons/fa';
import { SideMenu } from "../components/Navbar";
import GameItem from "../components/GameItem";
import SimpleBar from 'simplebar-react';
import 'simplebar/dist/simplebar.min.css';
import { setGame } from "../features/gameSlice";
import { socket } from "../socket";
import { useUser } from "@descope/react-sdk";

export default function Home() {
  const [games, setGames] = useState([]);
  const user = useSelector((state) => state.users);
  const [playing, setPlaying] = useState(false);
  const dispatch = useDispatch();
  const game = useSelector(state => state.game);

  useEffect(() => {
    socket.emit("username", { username: user.username });
    fetchGame();
    fetchCompletedGames();
  }, [user]);


  async function fetchCompletedGames() {
    const apiUrl = process.env.REACT_APP_API_URL;
    const response = await fetch(`${apiUrl}/game/completedGames`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username: user.username }),
    });
    const completedGames = await response.json();

    if (!completedGames.failed) {
      completedGames.map(game => {
        if (game.status === 'w') {
          game.loser = game.players.black.username;
        } else if (game.status === 'b') {
          game.loser = game.players.white.username;
        }
        return game;
      })
      setGames(completedGames.reverse());
    }
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
  }

  return (
    <>
      <Container fluid className="p-0 min-vh-100" style={{ background: '#1a1e21' }}>
        <SideMenu playing={playing} />

        <div className="pt-5">
          <Row className="justify-content-center mx-2 mx-md-4 mx-lg-5 pt-4 mt-3">
            <Col lg={6} md={12} className="mb-4">
              <Card className="shadow-lg border-0 rounded-lg overflow-hidden h-100">
                <div className="text-white p-4"
                  style={{ background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)' }}>
                  <h2 className="mb-0 d-flex align-items-center">
                    <FaChessKnight className="me-3" size={28} />
                    Play Chess
                  </h2>
                  <p className="text-light mb-0 mt-2 opacity-75">Challenge friends to a game of chess</p>
                </div>

                <Card.Body className="d-flex flex-column align-items-center justify-content-center p-4">
                  <div className="text-center mb-4">
                    <div className="mb-4 d-flex justify-content-center">
                      <FaChessBoard size={100} style={{ color: '#2E7D32', opacity: 0.9 }} />
                    </div>
                    <p className="text-secondary">
                      {playing
                        ? "You have an active game in progress"
                        : "Start a new game or join an existing one"}
                    </p>
                  </div>

                  <Link
                    to={{ pathname: '/chess/play', state: playing }}
                    className="w-100 d-flex justify-content-center"
                  >
                    <button
                      className="btn btn-lg px-5 py-3 d-flex align-items-center justify-content-center"
                      style={{
                        background: 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        width: '80%',
                        maxWidth: '320px',
                        fontWeight: '600',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      {playing ? (
                        <>Continue Game <FaArrowRight className="ms-2" /></>
                      ) : (
                        <>Play Now <FaChessKnight className="ms-2" /></>
                      )}
                    </button>
                  </Link>
                </Card.Body>
              </Card>
            </Col>

            <Col lg={6} md={12} className="mb-4">
              <Card className="shadow-lg border-0 rounded-lg overflow-hidden h-100">
                <div className="text-white p-4"
                  style={{ background: 'linear-gradient(135deg, #283c86 0%, #45a247 100%)' }}>
                  <h2 className="mb-0 d-flex align-items-center">
                    <FaTrophy className="me-3" size={24} />
                    Game History
                  </h2>
                  <p className="text-light mb-0 mt-2 opacity-75">
                    Your previous matches and results
                  </p>
                </div>

                <Card.Body className="p-0">
                  <SimpleBar style={{ maxHeight: '440px' }}>
                    <div className="p-3">
                      {games.length ? (
                        games.map(game => (
                          <GameItem
                            key={game.timestamp}
                            game={game}
                            username={user.username}
                          />
                        ))
                      ) : (
                        <div className="text-center py-5">
                          <div className="mb-3 text-secondary">
                            <i className="fa fa-chess-board fa-3x opacity-50"></i>
                          </div>
                          <h5 className="text-secondary">No games played yet</h5>
                          <p className="text-secondary small">
                            Your completed games will appear here
                          </p>
                        </div>
                      )}
                    </div>
                  </SimpleBar>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <footer className="mt-auto py-4 text-center" style={{ color: 'rgba(255,255,255,0.5)' }}>
            <small>Chessly &copy; {new Date().getFullYear()}</small>
          </footer>
        </div>
      </Container>
    </>
  );
}