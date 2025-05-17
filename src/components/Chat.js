import React, { useEffect, useRef, useState } from 'react';
import { Container, Col, Card, Form, Button } from 'react-bootstrap';
import styles from '../public/Home.module.css';
import SimpleBar from 'simplebar-react';
import { useDispatch, useSelector } from 'react-redux';
import { addMessage } from '../features/messagesSlice';
import { socket } from '../socket';
import { FaArrowRight, FaPaperPlane } from 'react-icons/fa';
import { BsChatDots } from 'react-icons/bs';
import { useUser } from "@descope/react-sdk";
import 'simplebar-react/dist/simplebar.min.css';

export default function Chat(props) {
  const [message, setMessage] = useState('');
  const messages = useSelector(state => state.messages)
  const dispatch = useDispatch();
  const {user, isUserLoading} = useUser();
  const game = useSelector(state => state.game);
  const chatBodyRef = useRef(null);
  const audioRef = useRef(null);
  const inputRef = useRef(null);

  const playSound = () => {
    console.log(audioRef.current)
    if (audioRef.current) audioRef.current.play();
  };

  useEffect(() => {
    socket.on("sendMessage", () => {
      playSound();
      setTimeout(() => scrollToBottom(), 1);
    });
    scrollToBottom();
  }, [chatBodyRef]);

  const scrollToBottom = () => {
    if (chatBodyRef.current) {
      chatBodyRef.current.getScrollElement().scrollTop = chatBodyRef.current.getScrollElement().scrollHeight;
    }
  };

  const handleSendMessage = () => {
    if (props.playing && message.trim()) {
      const msg = {
        sender: user.loginIds[2],
        content: message,
      };
      dispatch(addMessage(msg));
      socket.emit("message", {
        gameId: game.gameId,
        ...msg,
      });
      setMessage('');
      setTimeout(() => scrollToBottom(), 1);
      // Focus the input after sending
      inputRef.current.focus();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
    <Container fluid className='w-100 h-100 p-0'>
      <Card className={` text-white chat-card`} style={{ borderRadius: '12px', overflow: 'hidden', width: "100% !important" }}>
        <Card.Header className="bg-dark d-flex align-items-center" style={{ padding: '0.75rem 1rem' }}>
          <BsChatDots className="me-2" />
          <span className="fw-bold">Game Chat</span>
          <div className="ms-auto badge bg-secondary rounded-pill">
            {messages.length}
          </div>
        </Card.Header>

        <Card.Body className="bg-dark bg-opacity-75 p-0" style={{ maxHeight: '100%', overflow: 'hidden' }}>
          <SimpleBar
            ref={chatBodyRef}
            style={{
              maxHeight: '150px',
              overflowY: 'auto',
              padding: '1rem'
            }}
            autoHide={false}
          >
            {messages.length ? messages.map((message, index) => (
              <div
                key={index}
                className={`mb-1 d-flex ${message.sender === user.loginIds[2] ? 'justify-content-end' : 'justify-content-start'}`}
              >
                <div
                  className={`px-3 py-2 rounded-3 ${message.sender === user.loginIds[2]
                      ? 'bg-primary text-white'
                      : 'bg-secondary text-light'
                    }`}
                  style={{
                    maxWidth: '70%',
                    fontSize: '0.9rem',
                    lineHeight: '1.4',
                    wordBreak: 'break-word',
                    backgroundColor: message.sender === user.loginIds[2] ? undefined : '#2c2f33', // optional custom color
                  }}
                >
                  <div
                    className="mb-1"
                    style={{
                      fontSize: '0.75rem',
                      opacity: 0.65,
                      fontWeight: 500,
                    }}
                  >
                    {message.sender}
                  </div>
                  <div>{message.content}</div>
                </div>
              </div>

            )) : (
              <div className='text-center pt-5 text-secondary'>
                <em>No messages yet</em>
                <div className="mt-2 small">
                  Send a message to your opponent
                </div>
              </div>
            )}
          </SimpleBar>
        </Card.Body>

        <Card.Footer className="bg-dark p-2 messagebox">
          <Form className="d-flex align-items-center">
            <Form.Control
              ref={inputRef}
              type="text"
              placeholder={props.playing ? "Type your message..." : "Game not started..."}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              disabled={!props.playing}
              className="border-0 rounded-pill me-2 mx-2"
              style={{ background: 'white', color: 'black' }}
            />
            <Button
              variant="primary"
              onClick={handleSendMessage}
              disabled={!props.playing || !message.trim()}
              className="rounded-circle d-flex justify-content-center align-items-center mx-2"
              style={{ width: '38px', height: '38px', padding: 0 }}
            >
              <FaPaperPlane size={14} />
            </Button>
          </Form>
        </Card.Footer>
      </Card>
    </Container>
      <audio ref={audioRef} src={require("../public/message.mp3")} />
      </>
  );
}