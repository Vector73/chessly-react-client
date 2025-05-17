import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { Trophy, XCircle, MinusCircle, AlertTriangle } from 'lucide-react';

const GameOver = ({ show, close, gameState }) => {
  // Helper functions to determine styling and content
  const getIcon = () => {
    if (gameState.abort) return <XCircle size={48} className="text-secondary mb-2" />;
    if (gameState.draw) return <MinusCircle size={48} className="text-info mb-2" />;
    if (gameState.win) return <Trophy size={48} className="text-success mb-2" />;
    return <AlertTriangle size={48} className="text-warning mb-2" />;
  };

  const getBackgroundClass = () => {
    if (gameState.abort) return "bg-dark";
    if (gameState.draw) return "bg-dark bg-opacity-90";
    if (gameState.win) return "bg-dark bg-opacity-90";
    return "bg-dark bg-opacity-90";
  };

  const getTitle = () => {
    if (gameState.abort) return "Game Aborted";
    if (gameState.draw) return "It's a Draw";
    if (gameState.win) return "Victory!";
    return "Defeat";
  };

  const getMessage = () => {
    if (gameState.abort) return "Game was abandoned";
    if (gameState.draw) return `Draw by ${gameState.reason}`;
    return `${gameState.winner} won by ${gameState.reason}`;
  };

  const getTitleColorClass = () => {
    if (gameState.abort) return "text-secondary";
    if (gameState.draw) return "text-info";
    if (gameState.win) return "text-success";
    return "text-warning";
  };

  const getButtonVariant = () => {
    if (gameState.abort) return "outline-secondary";
    if (gameState.draw) return "outline-info";
    if (gameState.win) return "outline-success";
    return "outline-warning";
  };

  return (
    <Modal 
      show={show} 
      onHide={close} 
      centered 
      dialogClassName="border-0 shadow"
      contentClassName="bg-transparent"
    >
      <div className={`${getBackgroundClass()} text-light`}>
        <Modal.Header closeButton className="border-0 pb-0 text-light">
          {/* Empty header just for the close button */}
        </Modal.Header>
        
        <Modal.Body className="text-center pt-0 pb-4">
          <div className="d-flex flex-column align-items-center justify-content-center py-3">
            {getIcon()}
            
            <h3 className={`fw-bold mb-2 ${getTitleColorClass()}`}>
              {getTitle()}
            </h3>
            
            <p className="mb-4 text-light">
              {getMessage()}
            </p>
            
            <Button 
              variant={getButtonVariant()}
              className="px-4 rounded-pill" 
              onClick={close}
            >
              Close
            </Button>
          </div>
        </Modal.Body>
      </div>
    </Modal>
  );
};

export default GameOver;