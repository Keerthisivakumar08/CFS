import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar as BSNavbar, Nav, Container, Button } from 'react-bootstrap';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <BSNavbar bg="dark" variant="dark" expand="lg" sticky="top">
      <Container>
        <BSNavbar.Brand as={Link} to="/dashboard">Client System</BSNavbar.Brand>
        <BSNavbar.Toggle />
        <BSNavbar.Collapse>
          <Nav className="me-auto">
            {!user && (
              <>
                <Nav.Link as={Link} to="/login">Login</Nav.Link>
                <Nav.Link as={Link} to="/register">Register</Nav.Link>
              </>
            )}
          </Nav>
          {user && (
            <Nav>
              {user.role === 'admin' && (
                <Nav.Link as={Link} to="/admin/feedback">
                  Feedback
                </Nav.Link>
              )}
              <span className="navbar-text me-3">
                {user.email} ({user.role})
              </span>
              <Button variant="outline-light" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            </Nav>
          )}
        </BSNavbar.Collapse>
      </Container>
    </BSNavbar>
  );
}

