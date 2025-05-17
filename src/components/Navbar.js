import { Nav, Navbar, Container, Badge } from "react-bootstrap";
import {
  FaChess,
  FaChessKnight,
  FaCogs,
  FaDoorOpen,
  FaUserCog,
  FaBell
} from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import React, { useState, useEffect } from 'react';
import Banner from "./Notifications";
import { useDispatch, useSelector } from "react-redux";
import { socket } from "../socket";
import { removeChallenge } from "../features/challengeSlice";
import { setUser } from "../features/userSlice";
import Profile from "./Profile";
import { Descope, useDescope, useSession, useUser } from "@descope/react-sdk";
import DescopeSdk from '@descope/web-js-sdk';

export function SideMenu({ playing }) {
  const challenges = useSelector(state => state.challenges);
  const user = useSelector((state) => state.users);
  const game = useSelector(state => state.game);

  const [show, setShow] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const challengeCount = Object.keys(challenges).length;
  const { logout } = useDescope()

  function startGame(opponent) {
    if (playing && game.opponent) return;
    socket.emit("acceptChallenge",
      {
        opponent: opponent,
        user: user.username,
        time: challenges[opponent]?.time,
      })
    setExpanded(false)
  }

  function reject(opponent) {
    dispatch(removeChallenge({ opponent }));
  }

  async function handleLogout() {
    try {
      await logout();
      navigate("/")
    } catch (err) {
      console.error('Logout failed', err);
    }
  }

  // Close expanded navbar when clicking a link on mobile
  const handleNavItemClick = () => {
    setExpanded(false);
  };

  return (
    <>
      <Navbar
        bg="dark"
        variant="dark"
        expand="lg"
        fixed="top"
        expanded={expanded}
        onToggle={setExpanded}
        className="shadow-lg navbar-glass"
        style={{
          background: 'linear-gradient(to right, #1a1e21, #242930)',
          borderBottom: '1px solid rgba(255,255,255,0.1)'
        }}
      >
        <Container fluid>
          <Navbar.Brand as={Link} to="/home" className="d-flex align-items-center">
            <div className="d-flex align-items-center">
              <div className="brand-logo-container me-2 d-flex justify-content-center align-items-center"
                style={{
                  background: 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)',
                  width: '38px',
                  height: '38px',
                  borderRadius: '8px',
                  boxShadow: '0 2px 4px rgba(46, 125, 50, 0.3)'
                }}>
                <FaChessKnight size={22} color="white" />
              </div>
              <span className="fw-bold" style={{
                fontSize: '1.3rem',
                color: '#fff',
                letterSpacing: '0.5px',
                background: 'linear-gradient(to right, #fff, #ccc)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                Chessly
              </span>
            </div>
          </Navbar.Brand>

          <Navbar.Toggle
            aria-controls="navbar-content"
            className="border-0 focus-ring focus-ring-light"
            style={{ boxShadow: 'none' }}
          />

          <Navbar.Collapse id="navbar-content">
            <Nav className="ms-auto align-items-center">
              <Nav.Item className="position-relative">
                <Nav.Link
                  className="text-light d-flex align-items-center py-2 px-3"
                >
                  <div className="position-relative">
                    <Banner
                      challenges={challenges}
                      startGame={startGame}
                      reject={reject}
                    />
                    {challengeCount > 0 && (
                      <Badge
                        bg="danger"
                        pill
                        className="position-absolute top-0 start-100 translate-middle"
                        style={{ fontSize: '0.65rem' }}
                      >
                        {challengeCount}
                      </Badge>
                    )}
                  </div>
                </Nav.Link>
              </Nav.Item>

              <Nav.Item>
                <Nav.Link
                  as={Link}
                  to="/chess/play"
                  className="text-light d-flex align-items-center py-2 px-3 nav-link-hover"
                  onClick={handleNavItemClick}
                >
                  <FaChess className="me-2" />
                  <span>Play</span>
                </Nav.Link>
              </Nav.Item>

              <Nav.Item>
                <Nav.Link
                  className="text-light d-flex align-items-center py-2 px-3 nav-link-hover"
                  onClick={() => {
                    setShow(true);
                    handleNavItemClick();
                  }}
                >
                  <FaUserCog className="me-2" />
                  <span>Profile</span>
                </Nav.Link>
              </Nav.Item>

              <Nav.Item>
                <Nav.Link
                  as={Link}
                  to="/settings"
                  className="text-light d-flex align-items-center py-2 px-3 nav-link-hover"
                  onClick={handleNavItemClick}
                >
                  <FaCogs className="me-2" />
                  <span>Settings</span>
                </Nav.Link>
              </Nav.Item>

              <div className="d-flex align-items-center ms-lg-3">
                <button
                  onClick={handleLogout}
                  className="btn d-flex align-items-center justify-content-center py-2 px-3"
                  style={{
                    background: 'rgba(255,255,255,0.1)',
                    color: '#fff',
                    borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.2)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <FaDoorOpen className="me-2" />
                  <span>Logout</span>
                </button>
              </div>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <Profile show={show} handleClose={() => setShow(false)} />
    </>
  );
};