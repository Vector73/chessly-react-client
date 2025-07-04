import React, { useEffect, useState } from 'react';
import { Modal, Button, Form, Alert, Container, Row, Col } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { Eye, EyeOff, User, Mail, Lock, Save, X } from 'lucide-react';
import { useUser } from "@descope/react-sdk";

export default function Profile({ show, handleClose }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [validationErrors, setValidationErrors] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const user = useSelector((state) => state.users);

  useEffect(() => {
    if (show) {
      fetchUserProfile();
    }
  }, [show]);

  const fetchUserProfile = async () => {
    setIsLoading(true);

    try {
      const apiUrl = process.env.REACT_APP_API_URL;
      const response = await fetch(`${apiUrl}/home/profile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: user.userId })
      });

      const data = await response.json();

      if (data.success && data.profile) {
        console.log(data)
        setUsername(data.profile.username);
        setEmail(data.profile.email);
        // Don't store password in state for security reasons
        resetForm();
      } else {
        setError("Failed to load user profile");
      }
    } catch (err) {
      setError("An error occurred while loading your profile.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    setSuccess('');
    setValidationErrors({
      oldPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  };

  const validateForm = () => {
    const errors = {
      oldPassword: '',
      newPassword: '',
      confirmPassword: ''
    };

    if (!oldPassword) {
      errors.oldPassword = 'Please enter your current password';
    }

    if (!newPassword) {
      errors.newPassword = 'Please enter a new password';
    } else if (newPassword.length < 8) {
      errors.newPassword = 'Password must be at least 8 characters';
    }

    if (newPassword !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setValidationErrors(errors);
    return !Object.values(errors ?? {}).some(error => error);
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const apiUrl = process.env.REACT_APP_API_URL;
      const response = await fetch(`${apiUrl}/home/changePassword`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          oldPassword,
          newPassword
        })
      });

      const data = await response.json();

      if (data.success) {
        setSuccess("Password updated successfully");
        // Reset password fields after successful update
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setValidationErrors({
          oldPassword: '',
          newPassword: '',
          confirmPassword: ''
        });

        // Close the modal after a short delay
        setTimeout(() => {
          handleClose();
        }, 2000);
      } else {
        setError(data.message || "Failed to update password");
      }
    } catch (err) {
      setError("An error occurred while updating your password");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleModalClose = () => {
    resetForm();
    handleClose();
  };

  return (
    <Modal
      show={show}
      onHide={handleModalClose}
      centered
      backdrop="static"
      size="lg"
      contentClassName="border-0 shadow bg-dark"
    >
      <Modal.Header className="text-white border-0 px-4 py-3" style={{backgroundColor: "#393939"}}>
        <Container fluid className="p-0">
          <Row className="align-items-center">
            <Col>
              <Modal.Title className="h4 mb-0">Account Profile</Modal.Title>
            </Col>
            <Col xs="auto">
              <Button
                variant="link"
                className="p-0 text-white"
                onClick={handleModalClose}
              >
                <X size={24} />
              </Button>
            </Col>
          </Row>
        </Container>
      </Modal.Header>

      <Modal.Body className="bg-dark text-white px-4 py-4">
        {error && (
          <Alert variant="danger" className="bg-danger bg-opacity-25 text-danger border-danger" onClose={() => setError('')} dismissible>
            {error}
          </Alert>
        )}

        {success && (
          <Alert variant="success" className="bg-success bg-opacity-25 text-success border-success" onClose={() => setSuccess('')} dismissible>
            {success}
          </Alert>
        )}

        <Form>
          <Container fluid className="p-0">
            <Row className="mb-4">
              <Col md={6}>
                <Form.Group controlId="formUsername">
                  <Form.Label className="fw-bold text-light">Username</Form.Label>
                  <div className="input-group">
                    <span className="input-group-text bg-dark text-light border-secondary">
                      <User size={18} />
                    </span>
                    <Form.Control
                      type="text"
                      value={username}
                      disabled
                      className="bg-dark text-light border-secondary"
                    />
                  </div>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group controlId="formEmail">
                  <Form.Label className="fw-bold text-light">Email</Form.Label>
                  <div className="input-group">
                    <span className="input-group-text bg-dark text-light border-secondary">
                      <Mail size={18} />
                    </span>
                    <Form.Control
                      type="email"
                      value={email}
                      disabled
                      className="bg-dark text-light border-secondary"
                    />
                  </div> {/* ✅ This is the correct closing tag for the input-group div */}
                </Form.Group>
              </Col>

            </Row>

            <hr className="my-4 border-secondary" />

            <h5 className="mb-3 text-light">Update Password</h5>

            <Form.Group controlId="formOldPassword" className="mb-3">
              <Form.Label className="fw-bold text-light">Current Password</Form.Label>
              <div className="input-group">
                <span className="input-group-text bg-dark text-light border-secondary">
                  <Lock size={18} />
                </span>
                <Form.Control
                  type={showOldPassword ? "text" : "password"}
                  placeholder="Enter your current password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  isInvalid={!!validationErrors.oldPassword}
                  className="bg-dark text-light border-secondary"
                />
                <Button
                  variant="outline-secondary"
                  onClick={() => setShowOldPassword(!showOldPassword)}
                  className="bg-dark text-light"
                >
                  {showOldPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </Button>
                <Form.Control.Feedback type="invalid">
                  {validationErrors.oldPassword}
                </Form.Control.Feedback>
              </div>
            </Form.Group>

            <Form.Group controlId="formNewPassword" className="mb-3">
              <Form.Label className="fw-bold text-light">New Password</Form.Label>
              <div className="input-group">
                <span className="input-group-text bg-dark text-light border-secondary">
                  <Lock size={18} />
                </span>
                <Form.Control
                  type={showNewPassword ? "text" : "password"}
                  placeholder="Create a new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  isInvalid={!!validationErrors.newPassword}
                  className="bg-dark text-light border-secondary"
                />
                <Button
                  variant="outline-secondary"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="bg-dark text-light"
                >
                  {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </Button>
                <Form.Control.Feedback type="invalid">
                  {validationErrors.newPassword}
                </Form.Control.Feedback>
              </div>
              <Form.Text className="text-muted">
                Password must be at least 8 characters long
              </Form.Text>
            </Form.Group>

            <Form.Group controlId="formConfirmPassword" className="mb-3">
              <Form.Label className="fw-bold text-light">Confirm New Password</Form.Label>
              <div className="input-group">
                <span className="input-group-text bg-dark text-light border-secondary">
                  <Lock size={18} />
                </span>
                <Form.Control
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  isInvalid={!!validationErrors.confirmPassword}
                  className="bg-dark text-light border-secondary"
                />
                <Button
                  variant="outline-secondary"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="bg-dark text-light"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </Button>
                <Form.Control.Feedback type="invalid">
                  {validationErrors.confirmPassword}
                </Form.Control.Feedback>
              </div>
            </Form.Group>
          </Container>
        </Form>
      </Modal.Body>

      <Modal.Footer className="bg-dark px-4 py-3 border-0">
        <Button
          variant="outline-light"
          onClick={handleModalClose}
          className="px-4"
        >
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleSave}
          disabled={isLoading || !oldPassword || !newPassword || !confirmPassword}
          className="px-4 d-flex align-items-center"
        >
          {isLoading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Updating...
            </>
          ) : (
            <>
              <Save size={18} className="me-2" />
              Save Changes
            </>
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}