import { Chess } from 'chess.js';
import React from 'react';
import { Chessboard } from 'react-chessboard';
import { useEffect, useRef, useState } from 'react';
import { socket } from '../socket';
import { useDispatch, useSelector } from 'react-redux';
import { setGame } from '../features/gameSlice';
import { Card, Col, Row } from 'react-bootstrap';
import '../public/Login.css';
import { FaChessBishop, FaChessKing, FaChessKnight, FaChessPawn, FaChessQueen, FaChessRook, FaUser } from 'react-icons/fa';
import GameOver from '../components/GameOver';
import PlayerInfoCard from '../components/PlayerInfoCard';
import { useUser } from '@descope/react-sdk';

export default function Game() {
  const offset = 60
  const [fen, setFen] = useState('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
  const [boardWidth, setBoardWidth] = useState(window.innerWidth > 576 ? 470 : window.innerWidth - offset);
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [boardStyle, setBoardStyle] = useState({});
  const [gameOver, setGameOver] = useState(false);
  const [key, setKey] = useState(Date.now());
  const [moveState, setMoveState] = useState({});
  const [playing, setPlaying] = useState(false);
  const [gameOverModal, setGameOverModal] = useState(false);
  const [gameState, setGameState] = useState({});
  const [pieces] = useState(['p', 'n', 'b', 'r', 'q', 'P', 'N', 'B', 'R', 'Q']);
  const dispatch = useDispatch();
  const game = useSelector(state => state.game);
  const user = useSelector((state) => state.users);
  const [blackTime, setBlackTime] = useState(game.time);
  const [whiteTime, setWhiteTime] = useState(game.time);
  const [yourCaptures, setYourCaptures] = useState({});
  const [pieceIcons] = useState({
    'P': <FaChessPawn size={10} color="white" />,
    'N': <FaChessKnight size={10} color="white" />,
    'B': <FaChessBishop size={10} color="white" />,
    'R': <FaChessRook size={10} color="white" />,
    'Q': <FaChessQueen size={10} color="white" />,
    'K': <FaChessKing size={10} color="white" />,
    'p': <FaChessPawn size={10} color="gray" />,
    'n': <FaChessKnight size={10} color="gray" />,
    'b': <FaChessBishop size={10} color="gray" />,
    'r': <FaChessRook size={10} color="gray" />,
    'q': <FaChessQueen size={10} color="gray" />,
    'k': <FaChessKing size={10} color="gray" />,
  });
  const [opponentCaptures, setOpponentCaptures] = useState({});
  const audioRef = useRef(null);

  const handleResize = () => {
    setBoardWidth(window.innerWidth > 576 ? 470 : window.innerWidth - offset);
  };

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    socket.emit("username", { username: user.username, reconnect: true });
    socket.emit("joinRoom", { gameId: game.gameId });

    fetchGame();
    socket.on("pushMove", ({ fen, gameId, move }) => {
      setSelectedSquare(null);
      setFen(fen);
      try {
        audioRef.current.play();
      } catch (e) {}
      let highlightStyle = {};
      highlightStyle[move.from] = {
        backgroundColor: 'rgba(255, 223, 77, 0.5)',
      };
      highlightStyle[move.to] = {
        backgroundColor: 'rgba(255, 223, 77, 0.5)',
      };
      setBoardStyle(highlightStyle)
      setYourCaptures(getCapturedPieces(fen, !game.color));
      setOpponentCaptures(getCapturedPieces(fen, game.color));
    })

    socket.on("gameState", (gameState) => {
      setWhiteTime(gameState.time.white);
      setBlackTime(gameState.time.black);
    })

    socket.on('gameOver', ({ winner, reason, draw, abort }) => {
      setGameOver(true);
      setGameOverModal(true);
      dispatch(setGame({
        opponent: "",
        gameId: "",
      }))

      if (!draw && !abort) {
        setGameState({
          winner,
          reason: reason,
          win: user.username === winner,
        })
      } else if (abort) {
        setGameState({ abort });
      } else {
        setGameState({
          draw: true,
          reason: reason,
        })
      }
    })

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [game, user])

  function getPoints(missingPieces) {
    const piecePoints = { 'p': 1, 'n': 3, 'b': 3, 'r': 5, 'q': 9 };
    let points = 0;
    Object.keys(missingPieces).forEach((piece) => {
      if (missingPieces[piece]) {
        points += piecePoints[piece.toLowerCase()] * missingPieces[piece];
      }
    })
    return points;
  }

  function getCapturedPieces(fen, color) {
    const allPieces = { 'P': 8, 'N': 2, 'B': 2, 'R': 2, 'Q': 1, 'K': 1, 'p': 8, 'n': 2, 'b': 2, 'r': 2, 'q': 1, 'k': 1 };
    const boardPieces = {};
    const pos = fen.split(" ")[0];
    for (let i = 0; i < pos.length; i++) {
      const fenChar = fen[i];
      if ('PNBRQKpnbrqk'.includes(fenChar)) {
        boardPieces[fenChar] ? boardPieces[fenChar]++ : boardPieces[fenChar] = 1;
      }
    }
    const missingPieces = {}
    Object.keys(allPieces).forEach((piece) => {
      if (
        (color && piece.toUpperCase() === piece)
        || (!color && piece.toLowerCase() === piece)
      ) {
        if (!boardPieces[piece]) {
          missingPieces[piece] = allPieces[piece];
        } else {
          missingPieces[piece] = allPieces[piece] - boardPieces[piece];
        }
      }
    })
    return missingPieces;
  }

  function handleSquareClick(square) {
    if (!game.opponent) return;
    const board = new Chess(fen);
    let piece = board.get(square);
    let color = -1;

    if (square === selectedSquare) {
      setBoardStyle({});
      setSelectedSquare(null);
      return;
    }
    if (piece) {
      color = piece.color === 'w' ? 1 : 0;
    }
    if (selectedSquare && color !== game.color) {
      try {
        setBoardStyle({});
        movePiece(board, selectedSquare, square);
        setSelectedSquare(null);
      } catch (e) {
        console.log(e)
      }

    } else {
      if (piece && piece.color === board.turn() && game.color === color) {
        setSelectedSquare(square);

        const legalMoves = board.moves({ square: square, verbose: true });
        let highlightStyles = {};
        legalMoves.forEach((move) => {
          highlightStyles[move.to] = {
            backgroundColor: 'rgba(50, 223, 150, 0.4)',
          };
        });
        setBoardStyle(highlightStyles);
      }
    }
  };

  function onDrop(sourceSquare, targetSquare) {
    if (!game.opponent) return;
    const board = new Chess(fen);
    try {
      movePiece(board, sourceSquare, targetSquare);
    } catch (e) { console.log(e) }
  };

  function movePiece(board, from, to, promotion) {
    const move = board.move({ from: from, to: to, promotion: promotion });
    const isWhiteMove = move.color === 'w';
    if ((game.color && isWhiteMove) || (!game.color && !isWhiteMove)) {
      setFen(board.fen());
      socket.emit("move", { fen: board.fen(), opponent: game.opponent, gameId: game.gameId, move });

      let highlightStyle = {};
      highlightStyle[move.from] = {
        backgroundColor: 'rgba(255, 223, 77, 0.5)',
      };
      highlightStyle[move.to] = {
        backgroundColor: 'rgba(255, 223, 77, 0.5)',
      };
      setBoardStyle(highlightStyle)
      setYourCaptures(getCapturedPieces(board.fen(), !game.color));
      setOpponentCaptures(getCapturedPieces(board.fen(), game.color));
      audioRef.current.play();
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
      setFen(activeGame.fen);
      setYourCaptures(getCapturedPieces(activeGame.fen, !game.color));
      setOpponentCaptures(getCapturedPieces(activeGame.fen, game.color));
      setKey(Date.now());
      dispatch(setGame({
        opponent: activeGame.opponent,
        gameId: activeGame.gameId,
        color: activeGame.color,
        status: "pending",
      }))
      setPlaying(true);
    }
    else {
      setFen('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
      setPlaying(false);
    }
  }

  function msToTimer(ms) {
    var seconds = ms ? Math.floor((ms / 1000) % 60).toString().padStart(2, '0') : '00';
    var minutes = ms ? Math.floor((ms / 60000)).toString().padStart(2, '0') : '00';
    return minutes + ' : ' + seconds;
  }

  function checkPromotion(from, to, piece) {
    if (piece && piece[1].toLowerCase() === 'p') {
      const color = piece[0];
      if (color === 'w' && from[1] === '7' && to[1] === '8') {
        setMoveState({ from: from, to: to });
        return true;
      }
      else if (color === 'b' && from[1] === '2' && to[1] === '1') {
        setMoveState({ from: from, to: to });
        return true;
      }
      return false;
    }
    return false;
  }

  function promote(piece) {
    if (!piece) return;
    movePiece(new Chess(fen), moveState.from, moveState.to, piece[1].toLowerCase())
    return true;
  }

  const calculateBoardWidth = () => {
    if (window.innerWidth < 576) return Math.min(window.innerWidth - 32, 350);
    if (window.innerWidth < 768) return 400;
    if (window.innerWidth < 992) return 450;
    return 500;
  };

  const responsiveBoardWidth = boardWidth || calculateBoardWidth();

  return (
    <div className="chess-game-container d-flex flex-column align-items-center w-100">
      {/* Opponent Info */}
      <PlayerInfoCard
        responsiveWidth={responsiveBoardWidth}
        name={game.opponent}
        isPlaying={playing}
        isWhite={!game.color}
        isOpponent={true}
        captures={opponentCaptures}
        opponentCaptures={yourCaptures}
        pieces={pieces}
        pieceIcons={pieceIcons}
        getPoints={getPoints}
        timeRemaining={!game.color ? whiteTime : blackTime}
        msToTimer={msToTimer}
      />

      {/* Chess Board */}
      <div className="chess-board-container my-1 d-flex justify-content-center w-100">
        <div style={{ width: 'fit-content' }}>
          <Chessboard
            id="chessBoard"
            key={key}
            position={fen}
            boardWidth={responsiveBoardWidth}
            onPieceDrop={onDrop}
            onSquareClick={handleSquareClick}
            onPromotionCheck={checkPromotion}
            onPromotionPieceSelect={promote}
            customSquareStyles={boardStyle}
            boardOrientation={game.color ? 'white' : 'black'}
            animationDuration={200}
            lightSquareStyle={{ backgroundColor: "#f0d9b5" }}
            darkSquareStyle={{ backgroundColor: "#b58863" }}
            dropSquareStyle={{ boxShadow: "inset 0 0 1px 4px rgba(255, 255, 0, 0.5)" }}
          />
        </div>
      </div>

      {/* Player Info */}
      <PlayerInfoCard
        responsiveWidth={responsiveBoardWidth}
        name={user.username}
        isPlaying={playing}
        isWhite={game.color}
        isOpponent={false}
        captures={yourCaptures}
        opponentCaptures={opponentCaptures}
        pieces={pieces}
        pieceIcons={pieceIcons}
        getPoints={getPoints}
        timeRemaining={game.color ? whiteTime : blackTime}
        msToTimer={msToTimer}
      />


      <audio ref={audioRef} src={require("../public/move.mp3")} />
      {gameOverModal && <GameOver show={gameOver} close={() => setGameOverModal(false)} gameState={gameState} />}
    </div>
  );
}