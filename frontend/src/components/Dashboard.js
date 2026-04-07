import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Tabs, Tab, Row, Col, Button, Table, Modal, Form, Alert } from 'react-bootstrap';
import api from '../api';
import ClientList from './ClientList';
import UserList from './UserList';
import FeedbackForm from './FeedbackForm';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeKey, setActiveKey] = useState('clients');
  const [showLogout, setShowLogout] = useState(false);
  const [showFeedback, setShowFeedback] = useState(true);

  useEffect(() => {
    if (user?.role === 'admin') {
      navigate('/admin-dashboard');
    }
  }, [user, navigate]);

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>{user.role === 'admin' ? 'Admin Dashboard' : 'User Dashboard'}</h2>
        <Button variant="outline-danger" onClick={() => setShowLogout(true)}>
          Logout
        </Button>
      </div>

      {showFeedback && (
        <div className="mb-5">
          <FeedbackForm onComplete={() => setShowFeedback(false)} />
        </div>
      )}

      {!showFeedback && (
        <div className="text-center mt-5">
          <h3>No more tasks for now!</h3>
          <p className="text-muted">Thank you for your feedback.</p>
        </div>
      )}

      <Modal show={showLogout} onHide={() => setShowLogout(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Logout</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to logout?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowLogout(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={logout}>
            Logout
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

