import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button, Modal } from 'react-bootstrap';
import FeedbackForm from './FeedbackForm';
import './Dashboard.css';
import mcdonaldsLogo from '../assets/logos/mcdonalds.svg';
import kfcLogo from '../assets/logos/kfc.svg';
import dominosLogo from '../assets/logos/dominos.svg';
import pizzaHutLogo from '../assets/logos/pizza-hut.svg';
import burgerKingLogo from '../assets/logos/burger-king.svg';
import subwayLogo from '../assets/logos/subway.svg';
import starbucksLogo from '../assets/logos/starbucks.svg';
import tacoBellLogo from '../assets/logos/taco-bell.svg';
import dunkinLogo from '../assets/logos/dunkin.svg';
import popeyesLogo from '../assets/logos/popeyes.svg';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showLogout, setShowLogout] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState(null);

  const brands = [
    {
      id: 'mcdonalds',
      name: "McDonald's",
      logo: mcdonaldsLogo,
      accent: '#ffbc0d'
    },
    {
      id: 'kfc',
      name: 'KFC',
      logo: kfcLogo,
      accent: '#e4002b'
    },
    {
      id: 'dominos',
      name: "Domino's Pizza",
      logo: dominosLogo,
      accent: '#006491'
    },
    {
      id: 'pizza-hut',
      name: 'Pizza Hut',
      logo: pizzaHutLogo,
      accent: '#ee3124'
    },
    {
      id: 'burger-king',
      name: 'Burger King',
      logo: burgerKingLogo,
      accent: '#f5a623'
    },
    {
      id: 'subway',
      name: 'Subway',
      logo: subwayLogo,
      accent: '#0b8f51'
    },
    {
      id: 'starbucks',
      name: 'Starbucks',
      logo: starbucksLogo,
      accent: '#00704a'
    },
    {
      id: 'taco-bell',
      name: 'Taco Bell',
      logo: tacoBellLogo,
      accent: '#68217a'
    },
    {
      id: 'dunkin',
      name: 'Dunkin',
      logo: dunkinLogo,
      accent: '#ec008c'
    },
    {
      id: 'popeyes',
      name: 'Popeyes',
      logo: popeyesLogo,
      accent: '#f58220'
    }
  ];

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

      {!showFeedback && (
        <div className="brand-selection-shell">
          <div className="brand-selection-header">
            <h3 className="brand-selection-title">Choose a restaurant and give feedback</h3>
            <p className="brand-selection-subtitle">
              Any one logo click pannunga, appuram feedback form open aagum.
            </p>
          </div>

          <div className="brand-grid">
            {brands.map((brand) => (
              <button
                key={brand.id}
                type="button"
                className="brand-card"
                style={{ '--brand-accent': brand.accent }}
                onClick={() => {
                  setSelectedBrand(brand);
                  setShowFeedback(true);
                }}
              >
                <div className="brand-logo-wrap">
                  <img src={brand.logo} alt={brand.name} className="brand-logo" />
                </div>
                <span className="brand-name">{brand.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {showFeedback && selectedBrand && (
        <div className="mb-5 feedback-stage">
          <FeedbackForm
            selectedBrand={selectedBrand}
            onBack={() => {
              setShowFeedback(false);
              setSelectedBrand(null);
            }}
            onComplete={() => setShowFeedback(false)}
          />
        </div>
      )}

      {showFeedback === false && selectedBrand && (
        <div className="text-center mt-5">
          <h3>No more tasks for now!</h3>
          <p className="text-muted">Thank you for your feedback.</p>
          <Button
            variant="dark"
            className="mt-3"
            onClick={() => setSelectedBrand(null)}
          >
            Choose Another Logo
          </Button>
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

