import React from 'react';
import { Card } from 'react-bootstrap';
import { FaUser } from 'react-icons/fa';

const PlayerInfoCard = ({
  responsiveWidth,
  name,
  isPlaying,
  isWhite,
  isOpponent = false,
  captures,
  opponentCaptures,
  pieces,
  pieceIcons,
  getPoints,
  timeRemaining,
  msToTimer,
}) => {
  const pointDiff = getPoints(captures) - getPoints(opponentCaptures);
  const scorePositive = pointDiff > 0;
  const scoreNegative = pointDiff < 0;

  const timerBg = isOpponent
    ? 'rgba(25, 135, 84, 0.2)' // greenish
    : 'rgba(13, 110, 253, 0.2)'; // bluish

  const userColor = isOpponent ? '#dc3545' : '#79ff8e';

  return (
    <div
      className={`player-info w-100 ${isOpponent ? 'mb-1' : 'mt-1'}`}
      style={{ maxWidth: responsiveWidth }}
    >
      <Card className="bg-dark border-secondary shadow-sm">
        <Card.Body className="p-2 d-flex justify-content-between align-items-center">
          <div
            className="d-flex align-items-center"
            style={{ color: userColor, flexGrow: 1 }}
          >
            <div className="position-relative me-2">
              <FaUser style={{ color: isWhite ? 'white' : '#6c757d' }} />
              <div
                className="position-absolute"
                style={{
                  bottom: -3,
                  right: -3,
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: isPlaying ? '#10b981' : '#6c757d',
                }}
              />
            </div>
            <span className="player-name me-2 fw-bold">{name}</span>

            <div className="captured-pieces d-flex flex-wrap align-items-center">
              {scorePositive && (
                <span
                  className="badge rounded-pill bg-success text-white me-2"
                  style={{ fontSize: '10px' }}
                >
                  +{pointDiff}
                </span>
              )}
              {pieces.map((piece) => (
                <React.Fragment key={piece}>
                  {Array.from({ length: captures[piece] || 0 }, (_, i) => (
                    <span key={`${piece}-${i}`} style={{ opacity: 0.8 }}>
                      {pieceIcons[piece]}
                    </span>
                  ))}
                </React.Fragment>
              ))}
            </div>
          </div>

          <div className="timer-container d-flex align-items-center">
            <div
              className="timer text-white fw-bold py-1 px-2 rounded"
              style={{ backgroundColor: timerBg, fontSize: '14px' }}
            >
              {msToTimer(timeRemaining)}
            </div>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default PlayerInfoCard;
