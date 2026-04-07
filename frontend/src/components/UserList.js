import React, { useState, useEffect } from 'react';
import { Table, Button, Alert, Card } from 'react-bootstrap';
import api from '../api';

export default function UserList() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    fetchUsers();
  }, [refresh]);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      setUsers(res.data);
      setError('');
    } catch (err) {
      setError('Failed to load users');
    }
  };

  const handleDelete = async (userId) => {
    if (!confirm(`Delete user ${userId}? This removes their clients too.`)) return;
    
    try {
      await api.delete(`/users/${userId}`);
      setRefresh(prev => prev + 1);
    } catch (err) {
      alert('Delete failed');
    }
  };

  return (
    <div>
      {error && <Alert variant="danger">{error}</Alert>}
      
      <h4>Users ({users.length})</h4>
      
      <Card>
        <Card.Body>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>ID</th>
                <th>Email</th>
                <th>Role</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td>{u.email}</td>
                  <td>
                    <span className={`badge ${u.role === 'admin' ? 'bg-warning' : 'bg-info'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td>{new Date(u.created_at).toLocaleDateString()}</td>
                  <td>
                    <Button 
                      size="sm" 
                      variant="outline-danger"
                      onClick={() => handleDelete(u.id)}
                      disabled={u.id === 1} // Protect default admin
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </div>
  );
}

