import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import { Bar } from 'react-chartjs-2';
import './AdminFeedbackDashboard.css';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import {
  Card,
  Col,
  Container,
  Form,
  InputGroup,
  Nav,
  Row,
  Spinner,
} from 'react-bootstrap';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const SAMPLE_FEEDBACK = [
  {
    id: 1,
    userName: 'Thomas Smith',
    userEmail: 'thomas.smith@example.com',
    avatarUrl: 'https://i.pravatar.cc/150?img=32',
    category: 'Product Quality',
    rating: 5,
    comment: 'Really enjoyed using the platform – the new features are fantastic.',
    created_at: '2024-03-05T10:15:00Z',
  },

    userName: 'Eleanor Pena',
    userEmail: 'eleanor.pena@example.com',
    avatarUrl: 'https://i.pravatar.cc/150?img=47',
    category: 'Customer Service',
    rating: 4,
    comment: 'Support team was quick and solved my issue in minutes.',
    created_at: '2024-03-04T14:20:00Z',
  },
  {
    id: 3,
    userName: 'Albert Flores',
    userEmail: 'albert.flores@example.com',
    avatarUrl: 'https://i.pravatar.cc/150?img=12',
    category: 'User Experience',
    rating: 5,
    comment: 'The interface is intuitive and easy to navigate.',
    created_at: '2024-03-03T08:40:00Z',
  },
  {
    id: 4,
    userName: 'Kristin Watson',
    userEmail: 'kristin.watson@example.com',
    avatarUrl: 'https://i.pravatar.cc/150?img=45',
    category: 'Product Quality',
    rating: 5,
    comment: 'Excellent quality and fast delivery. Highly recommended!',
    created_at: '2024-03-02T09:10:00Z',
  },
  {
    id: 5,
    userName: 'Jerome Bell',
    userEmail: 'jerome.bell@example.com',
    avatarUrl: 'https://i.pravatar.cc/150?img=33',
    category: 'Customer Service',
    rating: 4,
    comment: 'Great customer support, very helpful and responsive.',
    created_at: '2024-03-01T16:25:00Z',
  },
  {
    id: 6,
    userName: 'Leslie Alexander',
    userEmail: 'leslie.alexander@example.com',
    avatarUrl: 'https://i.pravatar.cc/150?img=28',
    category: 'Delivery Speed',
    rating: 2,
    comment: 'Delivery took longer than expected, but product is good.',
    created_at: '2024-02-29T11:30:00Z',
  },
  {
    id: 7,
    userName: 'Theresa Webb',  
    userEmail: 'theresa.webb@example.com',
    avatarUrl: 'https://i.pravatar.cc/150?img=49',
    category: 'Product Quality',
    rating: 1,
    comment: 'Product did not match description, very disappointed.',
    created_at: '2024-02-28T13:45:00Z',
  },
  {
    id: 8,
    userName: 'Jacob Jones',
    userEmail: 'jacob.jones@example.com',
    avatarUrl: 'https://i.pravatar.cc/150?img=15',
    category: 'User Experience',
    rating: 5,
    comment: 'Amazing experience from start to finish!',
    created_at: '2026-03-27T10:20:00Z',
  }
];


function Sidebar({ activeKey, onNavigate }) {
  const items = [
    { key: 'home', label: '🏠 Home', icon: '🏠' },
    { key: 'orders', label: '📦 Orders', icon: '📦' },
    { key: 'feedback', label: '💬 Feedback', icon: '💬' },
    { key: 'notifications', label: '🔔 Notifications', icon: '🔔' },
    { key: 'settings', label: '⚙️ Settings', icon: '⚙️' },
  ];

  return (
    <div className="sidebar-container">
      <div className="sidebar-logo">🎯 Shopify</div>
      <Nav className="flex-column sidebar-nav" variant="pills" activeKey={activeKey} onSelect={onNavigate}>
        {items.map((item) => (
          <Nav.Link key={item.key} eventKey={item.key} className="sidebar-nav-item">
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label.replace(/[🏠📦💬🔔⚙️]/g, '').trim()}</span>
          </Nav.Link>
        ))}
      </Nav>
      
      <div className="sidebar-promo">
        <img src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=200&h=150&fit=crop" alt="Promo" className="promo-image" />
        <h6 className="promo-title">What deal with Shopify today?</h6>
        <button className="btn btn-success btn-sm w-100 promo-button">Learn more</button>
      </div>
    </div>
  );
}

function AnalyticsChart({ title, labels, data, color }) {
  const chartData = useMemo(() => ({
    labels,
    datasets: [
      {
        label: title,
        data,
        backgroundColor: color,
        borderRadius: 8,
        maxBarThickness: 28,
      },
    ],
  }), [labels, data, title, color]);

  const options = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { 
          mode: 'index', 
          intersect: false,
          backgroundColor: 'rgba(0,0,0,0.8)',
          padding: 12,
          cornerRadius: 8,
        },
      },
      scales: {
        x: { 
          grid: { display: false },
          ticks: { font: { size: 11 } }
        },
        y: { 
          grid: { color: '#f0f0f0', drawBorder: false }, 
          beginAtZero: true, 
          ticks: { stepSize: 2, font: { size: 11 } },
        },
      },
    }),
    []
  );

  return <Bar data={chartData} options={options} height={200} />;
}

function FeedbackCard({ item }) {
  const bgColor = item.rating >= 4 ? '#e8f5e9' : item.rating === 3 ? '#fff3e0' : '#ffebee';
  const categoryColor = item.rating >= 4 ? '#4caf50' : item.rating === 3 ? '#ff9800' : '#f44336';
  
  return (
    <div className="feedback-card" style={{ backgroundColor: bgColor }}>
      <div className="d-flex align-items-start mb-2">
        <img
          src={item.avatarUrl}
          alt={item.userName}
          className="feedback-avatar"
        />
        <div className="ms-3 flex-grow-1">
          <div className="feedback-user-name">{item.userName}</div>
          <div className="feedback-meta">
            {new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </div>
        </div>
      </div>

      <div className="feedback-comment mb-2">
        {item.comment}
      </div>
      
      <div className="d-flex justify-content-between align-items-center">
        <span className="feedback-category" style={{ color: categoryColor, fontSize: '0.85rem', fontWeight: '500' }}>
          📁 {item.category}
        </span>
        <div className="feedback-rating">
          {[...Array(5)].map((_, i) => (
            <span key={i} style={{ color: i < item.rating ? '#ffc107' : '#e0e0e0', fontSize: '0.9rem' }}>
              ⭐
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function AdminFeedbackDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeNav, setActiveNav] = useState('feedback');
  const [feedback, setFeedback] = useState(SAMPLE_FEEDBACK);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role !== 'admin') {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  useEffect(() => {
    const loadFeedback = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await api.get('/feedback');
        const mapped = (res.data || []).map((item) => ({
          id: item.id,
          userName: item.user_email?.split('@')[0] || 'User',
          userEmail: item.user_email,
          avatarUrl: `https://i.pravatar.cc/150?u=${encodeURIComponent(item.user_email)}`,
          category: item.category_name || 'General',
          rating: item.rating,
          comment: item.comment || 'No comment provided.',
          created_at: item.created_at,
        }));
        setFeedback(mapped.length ? mapped : SAMPLE_FEEDBACK);
      } catch (err) {
        // keep sample data on error
        setFeedback(SAMPLE_FEEDBACK);
        setError(err?.response?.data?.error || 'Unable to load feedback');
      } finally {
        setLoading(false);
      }
    };

    loadFeedback();
  }, []);

  const filteredFeedback = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return feedback;
    return feedback.filter((item) => {
      const combined = `${item.userName} ${item.userEmail} ${item.category} ${item.comment}`.toLowerCase();
      return combined.includes(q);
    });
  }, [feedback, search]);

// Fixed: 12 months labels, data up to March only (0 for Apr-Dec)
  const monthData = useMemo(() => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const totals = new Array(12).fill(null);
    
    filteredFeedback.forEach((item) => {
      const date = new Date(item.created_at);
      const monthIndex = date.getMonth(); // 0=Jan, 2=Mar
      if (monthIndex <= 2) { // Keep Jan-Mar
        totals[monthIndex] = (totals[monthIndex] || 0) + 1;
      }
      // Apr-Dec stay null (no bars)
    });

    return {
      labels: monthNames,
      totals: totals
    };
  }, [filteredFeedback]);

  const stats = useMemo(() => ({
    total: filteredFeedback.length
  }), [filteredFeedback]);

  const profileInitial = user?.email?.charAt(0).toUpperCase() || 'A';

  return (
    <Container fluid className="p-0 admin-dashboard-container">
      <Row className="g-0">
        <Col
          xs={12}
          md={2}
          lg={2}
          className="bg-white border-end vh-100 sticky-top"
          style={{ minHeight: '100vh' }}
        >
          <Sidebar
            activeKey={activeNav}
            onNavigate={(key) => {
              setActiveNav(key);
              if (key === 'home') navigate('/dashboard');
            }}
          />
        </Col>

        <Col xs={12} md={10} lg={10} className="p-4">
          <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between mb-4 gap-3">
            <div>
              <h2 className="section-title">Feedback 📊</h2>
              <p className="section-subtitle mb-0">Overview of all client feedback across all months.</p>
            </div>
            <div className="d-flex flex-column flex-sm-row align-items-center gap-3 w-100 w-sm-auto">
              <Form.Control
                className="search-input"
                placeholder="🔍 Search feedback"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Search feedback"
                style={{ maxWidth: 300 }}
              />
              <div
                className="profile-circle"
                title={user?.email}
              >
                <span>{profileInitial}</span>
              </div>
            </div>
          </div>

          <Row className="g-3 mb-4">
            <Col xs={12} md={4}>
              <div className="stats-card">
                <h5 className="chart-title mb-3">Analytics (All Time)</h5>
                <div className="mt-4">
                  <div className="d-flex justify-content-between mb-3 pb-2 border-bottom">
                    <div className="text-muted">Total Feedback</div>
                    <div className="fw-bold fs-5">{stats.total}</div>
                  </div>
                  <p className="text-muted small mb-0">Showing data across all months</p>
                </div>
              </div>
            </Col>

            <Col xs={12} md={8}>
              <div className="chart-container">
                <div className="chart-header">
                  <h5 className="chart-title mb-0">Total Feedback per Month</h5>
                  <span className="chart-badge bg-primary-subtle text-primary">{stats.total}</span>
                </div>
                <AnalyticsChart
                  title="Total Feedback"
                  labels={monthData.labels}
                  data={monthData.totals}
                  color="rgba(75, 192, 192, 0.75)"
                />
              </div>
            </Col>
          </Row>

          <div className="chart-container">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h5 className="chart-title mb-0">Recent Feedback</h5>
              {loading && (
                <span className="text-muted">
                  <Spinner animation="border" size="sm" className="me-2" /> Loading
                </span>
              )}
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            {filteredFeedback.length === 0 && !loading ? (
              <div className="text-center py-5 text-muted">📭 No feedback found.</div>
            ) : (
              <Row className="g-3">
                {filteredFeedback.slice(0, 8).map((item) => (
                  <Col key={item.id} xs={12} md={6} lg={3}>
                    <FeedbackCard item={item} />
                  </Col>
                ))}
              </Row>
            )}
          </div>
        </Col>
      </Row>
    </Container>
  );
}
