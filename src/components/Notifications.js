import { useEffect, useState } from "react";
import { Dropdown } from "react-bootstrap";
import { FaBell, FaCheck, FaTimes } from "react-icons/fa";

export default function Banner(props) {
  const [color, setColor] = useState("white");

  useEffect(() => {
    let notification = false;
    Object.entries(props.challenges).forEach((challenge, index) => {
      if (challenge[1].status === 'pending' && challenge[1].handshake === 0) {
        setColor('warning')
        notification = true;
      }
    })
    if (!notification) setColor('white');
  }, [props.challenges])

  return (
    <>
      <Dropdown>
        <Dropdown.Toggle variant={color} id="notification-dropdown">
          <FaBell size={16} color="white" className="mb-1" />
        </Dropdown.Toggle>

        <Dropdown.Menu 
  align="left" 
  className="notification-dropdown-menu"
>
  <Dropdown.Header className="notification-header">Notifications</Dropdown.Header>
  {Object.entries(props.challenges).map((challenge, index) => (
    challenge[1].status === 'pending' && challenge[1].handshake === 0 && (
      <Dropdown.Item key={index} className="notification-item">
        <div className="notification-content">
          <div className="challenger-name">{challenge[0]}</div>
          <div className="challenge-time">{challenge[1].time}m</div>
          <div className="action-buttons">
            <button 
              className="action-button accept"
              onClick={(e) => {
                e.stopPropagation();
                props.startGame(challenge[0])
              }}
              title="Accept challenge"
            >
              <FaCheck size={16} />
            </button>
            <button 
              className="action-button reject"
              onClick={(e) => {
                e.stopPropagation();
                props.reject(challenge[0])
              }}
              title="Decline challenge"
            >
              <FaTimes size={16} />
            </button>
          </div>
        </div>
      </Dropdown.Item>
    )
  ))}
  {!Object.entries(props.challenges).some(challenge => 
    challenge[1].status === 'pending' && challenge[1].handshake === 0) && (
    <div className="no-notifications">No pending challenges</div>
  )}
</Dropdown.Menu>
      </Dropdown>

    </>
  );
}
