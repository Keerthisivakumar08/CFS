import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Button, Card, Alert, Container } from 'react-bootstrap';
import api from '../api';

export default function Register() {
const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [venue, setVenue] = useState('');
  const [role, setRole] = useState('user');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('/auth/register', { email, password, venue, role });
      alert('Registration successful! Please login.');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.errors?.[0]?.msg || 'Registration failed');
    }
    setLoading(false);
  };

  return (
    <Container className="d-flex justify-content-center align-items-center min-vh-100">
      <Card style={{ maxWidth: '400px', width: '100%' }}>
        <Card.Header className="text-center">
          <h3>Register</h3>
        </Card.Header>
        <Card.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Form.Group>
<Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Venue (optional)</Form.Label>
              <Form.Control
                type="text"
                placeholder="e.g., Wedding Hall, Office"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Register As</Form.Label>
              <div className="d-flex gap-2">
                <Button
                  type="button"
                  variant={role === 'admin' ? 'success' : 'outline-secondary'}
                  className="w-50"
                  onClick={() => setRole('admin')}
                >
                  Admin
                </Button>
                <Button
                  type="button"
                  variant={role === 'user' ? 'success' : 'outline-secondary'}
                  className="w-50"
                  onClick={() => setRole('user')}
                >
                  User
                </Button>
              </div>
            </Form.Group>
            <Button variant="success" type="submit" className="w-100" disabled={loading}>
              {loading ? 'Registering...' : 'Register'}
            </Button>
          </Form>
          <div className="text-center mt-3">
            <Link to="/login">Have an account? Login</Link>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
}

