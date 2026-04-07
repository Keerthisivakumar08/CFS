import React, { useState, useEffect } from 'react';
import { Button, Table, Form, Modal, Alert, Card } from 'react-bootstrap';
import api from '../api';
import ClientForm from './ClientForm';

export default function ClientList() {
  const [clients, setClients] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [error, setError] = useState('');
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    fetchClients();
  }, [refresh]);

  const fetchClients = async () => {
    try {
      const res = await api.get('/clients');
      setClients(res.data);
      setError('');
    } catch (err) {
      setError('Failed to load clients');
    }
  };

  const handleRefresh = () => setRefresh(prev => prev + 1);

  return (
    <div>
      {error && <Alert variant="danger">{error}</Alert>}
      
      <div className="d-flex justify-content-between mb-3">
        <h4>Clients ({clients.length})</h4>
        <Button onClick={() => { setEditingClient(null); setShowForm(true); }}>
          Add Client
        </Button>
      </div>

      <Card>
        <Card.Body>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {clients.map(client => (
                <tr key={client.id}>
                  <td>{client.name}</td>
                  <td>{client.email || '-'}</td>
                  <td>{client.phone || '-'}</td>
                  <td>
                    <span className={`badge ${client.status === 'active' ? 'bg-success' : 'bg-secondary'}`}>
                      {client.status}
                    </span>
                  </td>
                  <td>
                    <Button 
                      size="sm" 
                      variant="outline-primary" 
                      className="me-1"
                      onClick={() => setEditingClient(client)}
                    >
                      Edit
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline-danger"
                      onClick={async () => {
                        if (confirm('Delete this client?')) {
                          try {
                            await api.delete(`/clients/${client.id}`);
                            handleRefresh();
                          } catch (err) {
                            alert('Delete failed');
                          }
                        }
                      }}
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

      {showForm && (
        <ClientForm 
          client={editingClient} 
          onClose={() => {
            setShowForm(false);
            setEditingClient(null);
            handleRefresh();
          }}
          onError={setError}
        />
      )}
    </div>
  );
}

