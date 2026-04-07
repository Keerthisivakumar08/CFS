import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import './AdminDashboard.css';
import cateringLogo from '../assets/catering-logo.png';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeNav, setActiveNav] = useState('feedback');
  const [theme, setTheme] = useState('light');
  const [feedbackData, setFeedbackData] = useState([]);
  const [filter, setFilter] = useState('this_month');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedNotification, setSelectedNotification] = useState(null);

  const notificationItems = [
    { title: 'New Stock Received', time: '2 hours ago', icon: '📦', color: 'green', detail: 'Fresh vegetables and dairy stock has been added to inventory.' },
    { title: 'System Backup Complete', time: '6 hours ago', icon: '💾', color: 'blue', detail: 'Daily backup completed successfully with no data issues.' },
    { title: 'Server Maintenance', time: 'Yesterday', icon: '🛠️', color: 'gray', detail: 'Scheduled maintenance was completed and services are stable.' },
    { title: 'Security Alert: Password change', time: 'Yesterday', icon: '🚨', color: 'red', detail: 'Admin password was changed recently. Verify if this was expected.' },
    { title: 'New Order Spike', time: '1 day ago', icon: '📈', color: 'green', detail: 'Order volume increased by 18% compared to previous day.' },
    { title: 'Payment Gateway Notice', time: '2 days ago', icon: '💳', color: 'blue', detail: 'Payment provider updated settlement timelines for card transactions.' },
    { title: 'Low Stock Warning', time: '2 days ago', icon: '⚠️', color: 'red', detail: 'Cheese and olive oil stock are below threshold levels.' },
    { title: 'New Staff Account Added', time: '3 days ago', icon: '👤', color: 'gray', detail: 'A new staff account was created with order-management access.' },
  ];

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    if (user.role !== 'admin') {
      navigate('/user-dashboard');
      return;
    }
    
    fetchFeedback();
    const interval = setInterval(fetchFeedback, 5000);
    return () => clearInterval(interval);
  }, [user, navigate]);

  const fetchFeedback = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await api.get('/feedback', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFeedbackData(res.data);
    } catch (err) {
      console.error('Error fetching feedback:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // ── Chart Data Calculations ──

  const barData = useMemo(() => {
    // Local processing for monthly trends (simplified for demo)
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const aprilPositive = feedbackData.filter((fb) => {
      const createdAt = new Date(fb.created_at);
      return createdAt.getMonth() === 3 && fb.rating >= 7;
    }).length;
    const aprilNegative = feedbackData.filter((fb) => {
      const createdAt = new Date(fb.created_at);
      return createdAt.getMonth() === 3 && fb.rating < 7;
    }).length;

    const positive = [45, 52, 48, aprilPositive, null, null, null, null, null, null, null, null];
    const negative = [15, 20, 18, aprilNegative, null, null, null, null, null, null, null, null];
    
    return {
      labels: months,
      datasets: [
        { label: 'Positive Feedback', data: positive, backgroundColor: '#8bc34a', borderRadius: 6 },
        { label: 'Negative Feedback', data: negative, backgroundColor: '#e74c3c', borderRadius: 6 },
      ],
    };
  }, [feedbackData, filter]);

  const doughnutData = useMemo(() => {
    const ratings = [0, 0, 0, 0, 0]; // 1, 2, 3, 4, 5 stars
    feedbackData.forEach(f => {
      const star = Math.ceil(f.rating / 2) - 1; // Map 1-10 to 1-5 index
      if (ratings[star] !== undefined) ratings[star]++;
    });

    return {
      labels: ['1 Star', '2 Stars', '3 Stars', '4 Stars', '5 Stars'],
      datasets: [{
        data: ratings.every(v => v === 0) ? [10, 20, 30, 40, 50] : ratings,
        backgroundColor: ['#e74c3c', '#ff9800', '#ffeb3b', '#2196f3', '#8bc34a'],
        hoverOffset: 4,
        borderWidth: 0,
      }],
    };
  }, [feedbackData]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { 
      x: { grid: { display: false } },
      y: { beginAtZero: true, grid: { color: '#f5f5f5' } }
    }
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, boxWidth: 8, font: { size: 10 } } } }
  };

  const navItems = [
    { key: 'home', icon: '🏠', label: 'Home' },
    { key: 'food', icon: '🍴', label: 'Food Order' },
    { key: 'fav', icon: '❤️', label: 'Favorite Menu' },
    { key: 'msg', icon: '💬', label: 'Message' },
    { key: 'hist', icon: '🕒', label: 'Order History' },
    { key: 'notif', icon: '🔔', label: 'Notification' },
    { key: 'feedback', icon: '💬', label: 'Feedback' },
    { key: 'sett', icon: '⚙️', label: 'Setting' },
  ];

  // ── View Rendering Functions ──

  const renderHome = () => (
    <div className="adm-view-container">
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-info">
            <span className="stat-label">Total Revenue</span>
            <h3 className="stat-value">$12,845.00</h3>
            <span className="stat-trend pos">↑ 12% from last month</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-info">
            <span className="stat-label">Total Orders</span>
            <h3 className="stat-value">78,620</h3>
            <span className="stat-trend pos">↑ 8% from last week</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <span className="stat-label">New Customers</span>
            <h3 className="stat-value">600,000</h3>
            <span className="stat-trend neg">↓ 3% from last week</span>
          </div>
        </div>
      </div>
      
      <div className="charts-grid mt-4">
        <div className="card-container">
           <h3 className="card-title">Weekly Sales Trend</h3>
           <div style={{ height: '250px' }}>
             <Bar data={barData} options={chartOptions} />
           </div>
        </div>
        <div className="card-container">
          <h3 className="card-title">Recent Activity</h3>
          <div className="activity-list">
            <div className="activity-item">
              <div className="act-dot"></div>
              <span>New order #4582 placed - <b>$42.00</b></span>
              <span className="act-time">2 mins ago</span>
            </div>
            <div className="activity-item">
              <div className="act-dot green"></div>
              <span>Table #4 checkout complete</span>
              <span className="act-time">15 mins ago</span>
            </div>
            <div className="activity-item">
              <div className="act-dot orange"></div>
              <span>Supply alert: "Organic Tomatoes" low</span>
              <span className="act-time">1 hour ago</span>
            </div>
          </div>
        </div>
      </div>

      <section className="recent-feedback-section mt-4">
        <h2 className="section-title">Recent Feedback</h2>
        <div className="feedback-grid">
          {feedbackData.length > 0 ? (
            feedbackData.slice(0, 3).map(fb => {
              const isPositive = fb.rating >= 7;
              return (
                <div key={fb.id} className={`feedback-card-premium ${isPositive ? 'positive' : 'negative'}`}>
                  <div className="fb-card-header">
                    <img src={`https://i.pravatar.cc/150?u=${fb.user_id}`} alt="User" className="fb-avatar" />
                    <div className="fb-user-info">
                      <h4>{fb.user_email || `User #${fb.user_id}`}</h4>
                      <span>{new Date(fb.created_at).toLocaleDateString()}</span>
                    </div>
                    <span className="fb-status-tag">
                      {isPositive ? 'Positive' : 'Negative'}
                    </span>
                  </div>
                  <div className="fb-rating">
                    {'★'.repeat(Math.ceil(fb.rating / 2))}{'☆'.repeat(5 - Math.ceil(fb.rating / 2))}
                  </div>
                  <p className="fb-comment">"{fb.comment || 'No comment'}"</p>
                </div>
              );
            })
          ) : (
            <p className="text-muted">No feedback yet.</p>
          )}
          {feedbackData.length > 3 && (
            <button className="btn-link" onClick={() => setActiveNav('feedback')}>View all feedback →</button>
          )}
        </div>
      </section>
    </div>
  );

  const renderFoodOrders = () => (
    <div className="adm-view-container">
      <div className="orders-table-container">
        <table className="adm-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {[
              { id: '#4582', name: 'Alice Wong', items: '2x Truffle Pasta', amount: '$54', status: 'Cooking', color: 'orange' },
              { id: '#4581', name: 'Mark Ruffalo', items: '1x Margherita', amount: '$22', status: 'Ready', color: 'green' },
              { id: '#4580', name: 'Sarah J.', items: '3x Salmon Steak', amount: '$89', status: 'Delivering', color: 'blue' },
              { id: '#4579', name: 'Devin K.', items: '1x Caesar Salad', amount: '$15', status: 'Delivered', color: 'gray' },
              { id: '#4578', name: 'Priya S.', items: '2x Paneer Tikka', amount: '$36', status: 'Ready', color: 'green' },
              { id: '#4577', name: 'Arun V.', items: '1x Chicken Biryani', amount: '$19', status: 'Cooking', color: 'orange' },
              { id: '#4576', name: 'Nila R.', items: '2x Veg Burger', amount: '$24', status: 'Delivering', color: 'blue' },
              { id: '#4575', name: 'Karthik M.', items: '1x Alfredo Pasta', amount: '$18', status: 'Delivered', color: 'gray' },
              { id: '#4574', name: 'Sneha P.', items: '3x French Fries', amount: '$21', status: 'Ready', color: 'green' },
              { id: '#4573', name: 'Rahul T.', items: '2x Pepper Pizza', amount: '$42', status: 'Cooking', color: 'orange' },
              { id: '#4572', name: 'Divya L.', items: '1x Greek Salad', amount: '$14', status: 'Delivered', color: 'gray' },
              { id: '#4571', name: 'Vikram N.', items: '2x Sushi Roll', amount: '$38', status: 'Delivering', color: 'blue' },
              { id: '#4570', name: 'Meera A.', items: '1x Tomato Soup', amount: '$11', status: 'Ready', color: 'green' },
              { id: '#4569', name: 'Sanjay B.', items: '2x Grilled Chicken', amount: '$40', status: 'Cooking', color: 'orange' },
              { id: '#4568', name: 'Anu K.', items: '1x Mushroom Pizza', amount: '$20', status: 'Delivering', color: 'blue' },
              { id: '#4567', name: 'Pradeep C.', items: '2x Noodles', amount: '$26', status: 'Delivered', color: 'gray' },
              { id: '#4566', name: 'Lavanya D.', items: '1x Veg Wrap', amount: '$13', status: 'Ready', color: 'green' },
              { id: '#4565', name: 'Gokul R.', items: '2x Tandoori Wings', amount: '$33', status: 'Cooking', color: 'orange' },
              { id: '#4564', name: 'Harini S.', items: '1x Brownie Sundae', amount: '$12', status: 'Ready', color: 'green' },
              { id: '#4563', name: 'Naveen P.', items: '2x Club Sandwich', amount: '$28', status: 'Delivering', color: 'blue' },
              { id: '#4562', name: 'Aishwarya M.', items: '1x Caesar Wrap', amount: '$16', status: 'Delivered', color: 'gray' },
              { id: '#4561', name: 'Yuvan T.', items: '3x Momos', amount: '$24', status: 'Cooking', color: 'orange' },
              { id: '#4560', name: 'Keerthi J.', items: '2x Falafel Bowl', amount: '$30', status: 'Ready', color: 'green' },
              { id: '#4559', name: 'Ramesh V.', items: '1x Seafood Platter', amount: '$48', status: 'Delivering', color: 'blue' },
            ].map(order => (
              <tr key={order.id}>
                <td><b>{order.id}</b></td>
                <td>{order.name}</td>
                <td>{order.items}</td>
                <td>{order.amount}</td>
                <td><span className={`status-pill ${order.color}`}>{order.status}</span></td>
                <td><button className="btn-icon">👁️</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderFavoriteMenu = () => (
    <div className="adm-view-container">
      <div className="menu-grid">
        {[
          { name: 'Truffle Mac & Cheese', price: '$24', rating: 4.9, img: 'https://images.unsplash.com/photo-1543339308-43e59d6b73a6?w=400' },
          { name: 'Grilled Salmon', price: '$32', rating: 4.8, img: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400' },
          { name: 'Wagyu Burger', price: '$28', rating: 4.7, img: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400' },
          { name: 'Avocado Toast', price: '$18', rating: 4.5, img: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=400' },
          { name: 'Chicken Alfredo', price: '$26', rating: 4.8, img: 'https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?w=400' },
          { name: 'Margherita Pizza', price: '$21', rating: 4.6, img: 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=400' },
          { name: 'Sushi Platter', price: '$34', rating: 4.9, img: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=400' },
          { name: 'Chocolate Lava Cake', price: '$14', rating: 4.7, img: 'https://images.unsplash.com/photo-1614707267537-b85aaf00c4b7?w=400' },
          { name: 'Pesto Pasta', price: '$23', rating: 4.6, img: 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=400' },
          { name: 'BBQ Chicken Pizza', price: '$25', rating: 4.7, img: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400' },
          { name: 'Veggie Supreme Pizza', price: '$22', rating: 4.5, img: 'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=400' },
          { name: 'Paneer Butter Masala', price: '$20', rating: 4.8, img: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400' },
          { name: 'Butter Naan Combo', price: '$16', rating: 4.4, img: 'https://images.unsplash.com/photo-1627308595171-d1b5d71e8cfd?w=400' },
          { name: 'Chicken Tikka', price: '$24', rating: 4.7, img: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400' },
          { name: 'Mutton Biryani', price: '$27', rating: 4.9, img: 'https://images.unsplash.com/photo-1701579231305-d84d8af9a3fd?w=400' },
          { name: 'Veg Biryani', price: '$19', rating: 4.5, img: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400' },
          { name: 'Hyderabadi Dum Biryani', price: '$29', rating: 4.8, img: 'https://images.unsplash.com/photo-1642821373181-696a54913e93?w=400' },
          { name: 'Chicken Shawarma', price: '$17', rating: 4.6, img: 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=400' },
          { name: 'Falafel Wrap', price: '$15', rating: 4.4, img: 'https://images.unsplash.com/photo-1562967916-eb82221dfb92?w=400' },
          { name: 'Club Sandwich', price: '$14', rating: 4.3, img: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400' },
          { name: 'Grilled Chicken Sandwich', price: '$18', rating: 4.6, img: 'https://images.unsplash.com/photo-1553909489-cd47e0ef937f?w=400' },
          { name: 'French Fries Bucket', price: '$11', rating: 4.2, img: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400' },
          { name: 'Cheese Nachos', price: '$13', rating: 4.5, img: 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=400' },
          { name: 'Loaded Potato Wedges', price: '$12', rating: 4.4, img: 'https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?w=400' },
          { name: 'Classic Caesar Salad', price: '$15', rating: 4.3, img: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400' },
          { name: 'Greek Salad Bowl', price: '$16', rating: 4.5, img: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400' },
          { name: 'Quinoa Power Bowl', price: '$18', rating: 4.6, img: 'https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?w=400' },
          { name: 'Tom Yum Soup', price: '$14', rating: 4.4, img: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400' },
          { name: 'Cream of Mushroom Soup', price: '$13', rating: 4.3, img: 'https://images.unsplash.com/photo-1543353071-10c8ba85a904?w=400' },
          { name: 'Hot and Sour Soup', price: '$12', rating: 4.2, img: 'https://images.unsplash.com/photo-1604908554007-58e52f06e74c?w=400' },
          { name: 'Tacos Trio', price: '$19', rating: 4.6, img: 'https://images.unsplash.com/photo-1565299585323-38174c4a6fdd?w=400' },
          { name: 'Chicken Quesadilla', price: '$20', rating: 4.7, img: 'https://images.unsplash.com/photo-1618040996337-56904b7850b9?w=400' },
          { name: 'Beef Burrito Bowl', price: '$22', rating: 4.5, img: 'https://images.unsplash.com/photo-1534352956036-cd81e27dd615?w=400' },
          { name: 'Ramen Bowl', price: '$21', rating: 4.8, img: 'https://images.unsplash.com/photo-1557872943-16a5ac26437e?w=400' },
          { name: 'Udon Noodles', price: '$19', rating: 4.5, img: 'https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=400' },
          { name: 'Hakka Noodles', price: '$17', rating: 4.4, img: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400' },
          { name: 'Chicken Fried Rice', price: '$18', rating: 4.6, img: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400' },
          { name: 'Veg Fried Rice', price: '$16', rating: 4.3, img: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400' },
          { name: 'Prawn Tempura', price: '$26', rating: 4.7, img: 'https://images.unsplash.com/photo-1625944525903-bb2f7f4d4f63?w=400' },
          { name: 'Fish and Chips', price: '$23', rating: 4.5, img: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400' },
          { name: 'Steak Platter', price: '$38', rating: 4.9, img: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400' },
          { name: 'Grilled Prawns', price: '$30', rating: 4.8, img: 'https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=400' },
          { name: 'Blueberry Cheesecake', price: '$12', rating: 4.6, img: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=400' },
          { name: 'Tiramisu', price: '$13', rating: 4.7, img: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400' },
          { name: 'Strawberry Sundae', price: '$10', rating: 4.4, img: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400' },
          { name: 'Mango Smoothie', price: '$9', rating: 4.5, img: 'https://images.unsplash.com/photo-1553531384-cc64ac80f931?w=400' },
          { name: 'Cold Coffee Frappe', price: '$8', rating: 4.3, img: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400' },
          { name: 'Fresh Lime Soda', price: '$7', rating: 4.2, img: 'https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=400' },
        ].map(item => (
          <div className="menu-card" key={item.name}>
            <img src={item.img} alt={item.name} className="menu-card-img" />
            <div className="menu-card-body">
              <h4>{item.name}</h4>
              <div className="menu-card-meta">
                <span className="menu-price">{item.price}</span>
                <span className="menu-rating">⭐ {item.rating}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderMessages = () => (
    <div className="adm-view-container">
      <div className="chat-layout">
        <div className="chat-sidebar">
          {[
            { name: 'Support Bot', text: 'How can I help?', time: 'Online', active: true },
            { name: 'Chef Mario', text: 'Stock update...', time: '5m' },
            { name: 'Delivery Team', text: 'Order #4580 out...', time: '12m' },
          ].map(chat => (
            <div className={`chat-item ${chat.active ? 'active' : ''}`} key={chat.name}>
              <div className="chat-avatar">{chat.name[0]}</div>
              <div className="chat-info">
                <h5>{chat.name}</h5>
                <p>{chat.text}</p>
              </div>
              <span className="chat-time">{chat.time}</span>
            </div>
          ))}
        </div>
        <div className="chat-main">
          <div className="chat-messages">
             <div className="msg-received">Hello! Welcome to Savory Support.</div>
             <div className="msg-sent">I need to check the stock for Truffles.</div>
             <div className="msg-received">Checking now... One moment please.</div>
          </div>
          <div className="chat-input-area">
            <input type="text" placeholder="Type a message..." />
            <button>Send</button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderOrderHistory = () => (
    <div className="adm-view-container">
      <div className="history-container">
        <h3 className="mb-4">Order History</h3>
        <table className="adm-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Total</th>
              <th>Method</th>
              <th>Receipt</th>
            </tr>
          </thead>
          <tbody>
            {[
              { date: '21 Mar 2026', id: '#HIST-4521', client: 'John Doe', total: '$120.50', method: 'Visa' },
              { date: '20 Mar 2026', id: '#HIST-4520', client: 'Sarah Connor', total: '$45.00', method: 'Cash' },
              { date: '19 Mar 2026', id: '#HIST-4519', client: 'James Bond', total: '$89.99', method: 'MasterCard' },
              { date: '18 Mar 2026', id: '#HIST-4518', client: 'Ellen Ripley', total: '$15.50', method: 'Apple Pay' },
              { date: '17 Mar 2026', id: '#HIST-4517', client: 'Priya S.', total: '$64.00', method: 'UPI' },
              { date: '16 Mar 2026', id: '#HIST-4516', client: 'Arun V.', total: '$38.75', method: 'Cash' },
              { date: '15 Mar 2026', id: '#HIST-4515', client: 'Nila R.', total: '$102.20', method: 'Visa' },
              { date: '14 Mar 2026', id: '#HIST-4514', client: 'Karthik M.', total: '$27.40', method: 'MasterCard' },
              { date: '13 Mar 2026', id: '#HIST-4513', client: 'Sneha P.', total: '$58.90', method: 'Apple Pay' },
              { date: '12 Mar 2026', id: '#HIST-4512', client: 'Rahul T.', total: '$73.10', method: 'UPI' },
              { date: '30 Apr 2026', id: '#HIST-4511', client: 'Aarav K.', total: '$84.60', method: 'Visa' },
              { date: '29 Apr 2026', id: '#HIST-4510', client: 'Diya M.', total: '$42.10', method: 'UPI' },
              { date: '28 Apr 2026', id: '#HIST-4509', client: 'Rohan P.', total: '$119.30', method: 'MasterCard' },
              { date: '27 Apr 2026', id: '#HIST-4508', client: 'Isha V.', total: '$56.80', method: 'Cash' },
              { date: '26 Apr 2026', id: '#HIST-4507', client: 'Kavin S.', total: '$33.40', method: 'Apple Pay' },
              { date: '25 Apr 2026', id: '#HIST-4506', client: 'Maya R.', total: '$72.95', method: 'UPI' },
              { date: '24 Apr 2026', id: '#HIST-4505', client: 'Nithin D.', total: '$64.20', method: 'Visa' },
              { date: '23 Apr 2026', id: '#HIST-4504', client: 'Pooja L.', total: '$25.50', method: 'Cash' },
              { date: '22 Apr 2026', id: '#HIST-4503', client: 'Vignesh T.', total: '$91.00', method: 'MasterCard' },
              { date: '21 Apr 2026', id: '#HIST-4502', client: 'Ananya J.', total: '$47.70', method: 'UPI' },
              { date: '20 Apr 2026', id: '#HIST-4501', client: 'Surya N.', total: '$58.30', method: 'Visa' },
              { date: '19 Apr 2026', id: '#HIST-4500', client: 'Keerthana B.', total: '$39.90', method: 'Apple Pay' },
              { date: '18 Apr 2026', id: '#HIST-4499', client: 'Harish C.', total: '$126.40', method: 'MasterCard' },
              { date: '17 Apr 2026', id: '#HIST-4498', client: 'Sahana G.', total: '$28.60', method: 'Cash' },
              { date: '16 Apr 2026', id: '#HIST-4497', client: 'Tarun A.', total: '$69.10', method: 'UPI' },
              { date: '15 Apr 2026', id: '#HIST-4496', client: 'Naveena P.', total: '$52.45', method: 'Visa' },
              { date: '14 Apr 2026', id: '#HIST-4495', client: 'Yash H.', total: '$77.00', method: 'Apple Pay' },
              { date: '13 Apr 2026', id: '#HIST-4494', client: 'Lavanya K.', total: '$31.25', method: 'Cash' },
              { date: '12 Apr 2026', id: '#HIST-4493', client: 'Manoj R.', total: '$88.90', method: 'MasterCard' },
              { date: '11 Apr 2026', id: '#HIST-4492', client: 'Deepa S.', total: '$40.80', method: 'UPI' },
              { date: '10 Apr 2026', id: '#HIST-4491', client: 'Arjun W.', total: '$95.35', method: 'Visa' },
              { date: '09 Apr 2026', id: '#HIST-4490', client: 'Nila B.', total: '$22.70', method: 'Cash' },
              { date: '08 Apr 2026', id: '#HIST-4489', client: 'Pranav I.', total: '$61.50', method: 'Apple Pay' },
              { date: '07 Apr 2026', id: '#HIST-4488', client: 'Megha Q.', total: '$108.20', method: 'MasterCard' },
              { date: '06 Apr 2026', id: '#HIST-4487', client: 'Sriram U.', total: '$49.30', method: 'UPI' },
              { date: '05 Apr 2026', id: '#HIST-4486', client: 'Bhavya X.', total: '$37.60', method: 'Visa' },
              { date: '04 Apr 2026', id: '#HIST-4485', client: 'Ritika Y.', total: '$83.15', method: 'Cash' },
              { date: '03 Apr 2026', id: '#HIST-4484', client: 'Dinesh Z.', total: '$44.40', method: 'Apple Pay' },
              { date: '02 Apr 2026', id: '#HIST-4483', client: 'Janani E.', total: '$57.95', method: 'MasterCard' },
              { date: '01 Apr 2026', id: '#HIST-4482', client: 'Lokesh F.', total: '$70.20', method: 'UPI' },
              { date: '31 Mar 2026', id: '#HIST-4481', client: 'Akhil G.', total: '$62.75', method: 'Visa' },
              { date: '30 Mar 2026', id: '#HIST-4480', client: 'Ira H.', total: '$29.10', method: 'Cash' },
              { date: '29 Mar 2026', id: '#HIST-4479', client: 'Jeeva I.', total: '$114.55', method: 'MasterCard' },
              { date: '28 Mar 2026', id: '#HIST-4478', client: 'Kriti J.', total: '$41.80', method: 'Apple Pay' },
              { date: '27 Mar 2026', id: '#HIST-4477', client: 'Mithun K.', total: '$67.35', method: 'UPI' },
              { date: '26 Mar 2026', id: '#HIST-4476', client: 'Nandha L.', total: '$53.25', method: 'Visa' },
              { date: '25 Mar 2026', id: '#HIST-4475', client: 'Oviya M.', total: '$36.40', method: 'Cash' },
              { date: '24 Mar 2026', id: '#HIST-4474', client: 'Prakash N.', total: '$99.60', method: 'MasterCard' },
              { date: '23 Mar 2026', id: '#HIST-4473', client: 'Qadir O.', total: '$45.15', method: 'Apple Pay' },
              { date: '22 Mar 2026', id: '#HIST-4472', client: 'Reena P.', total: '$75.85', method: 'UPI' },
              { date: '21 Mar 2026', id: '#HIST-4471', client: 'Sathya Q.', total: '$59.40', method: 'Visa' },
              { date: '20 Mar 2026', id: '#HIST-4470', client: 'Teja R.', total: '$32.90', method: 'Cash' },
              { date: '19 Mar 2026', id: '#HIST-4469', client: 'Uday S.', total: '$86.70', method: 'MasterCard' },
              { date: '18 Mar 2026', id: '#HIST-4468', client: 'Varsha T.', total: '$50.55', method: 'Apple Pay' },
              { date: '17 Mar 2026', id: '#HIST-4467', client: 'Wasim U.', total: '$68.20', method: 'UPI' },
              { date: '16 Mar 2026', id: '#HIST-4466', client: 'Xavier V.', total: '$27.75', method: 'Visa' },
              { date: '15 Mar 2026', id: '#HIST-4465', client: 'Yamini W.', total: '$90.10', method: 'Cash' },
              { date: '14 Mar 2026', id: '#HIST-4464', client: 'Zubin X.', total: '$42.65', method: 'MasterCard' },
              { date: '13 Mar 2026', id: '#HIST-4463', client: 'Aditi Y.', total: '$55.30', method: 'Apple Pay' },
              { date: '12 Mar 2026', id: '#HIST-4462', client: 'Bharat Z.', total: '$79.95', method: 'UPI' },
              { date: '11 Mar 2026', id: '#HIST-4461', client: 'Charan A.', total: '$34.20', method: 'Visa' },
              { date: '10 Mar 2026', id: '#HIST-4460', client: 'Devika B.', total: '$101.45', method: 'Cash' },
              { date: '09 Mar 2026', id: '#HIST-4459', client: 'Eshan C.', total: '$46.85', method: 'MasterCard' },
              { date: '08 Mar 2026', id: '#HIST-4458', client: 'Farah D.', total: '$63.10', method: 'Apple Pay' },
              { date: '07 Mar 2026', id: '#HIST-4457', client: 'Gautham E.', total: '$28.35', method: 'UPI' },
              { date: '06 Mar 2026', id: '#HIST-4456', client: 'Hema F.', total: '$84.25', method: 'Visa' },
              { date: '05 Mar 2026', id: '#HIST-4455', client: 'Inder G.', total: '$39.70', method: 'Cash' },
              { date: '04 Mar 2026', id: '#HIST-4454', client: 'Jayan H.', total: '$92.50', method: 'MasterCard' },
              { date: '03 Mar 2026', id: '#HIST-4453', client: 'Komal I.', total: '$48.60', method: 'Apple Pay' },
              { date: '02 Mar 2026', id: '#HIST-4452', client: 'Lalit J.', total: '$66.95', method: 'UPI' },
            ].map(h => (
              <tr key={h.id}>
                <td>{h.date}</td>
                <td>{h.id}</td>
                <td>{h.client}</td>
                <td>{h.total}</td>
                <td>{h.method}</td>
                <td><button className="btn-icon">📄</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderNotifications = () => (
    <div className="adm-view-container">
      <div className="notif-container">
        <h3 className="mb-4">System Notifications</h3>
        <div className="notif-list">
          {notificationItems.map((n, i) => (
            <div className="notif-card" key={i} onClick={() => setSelectedNotification(n)} style={{ cursor: 'pointer' }}>
              <div className={`notif-icon-box ${n.color}`}>{n.icon}</div>
              <div className="notif-content">
                <h4>{n.title}</h4>
                <p>{n.time}</p>
              </div>
            </div>
          ))}
        </div>
        {selectedNotification && (
          <div className="mt-4 p-3" style={{ border: '1px solid #f1f3f5', borderRadius: '12px', background: '#fff' }}>
            <h5 style={{ marginBottom: '8px' }}>{selectedNotification.title}</h5>
            <p style={{ marginBottom: '6px', color: '#666', fontSize: '0.9rem' }}>{selectedNotification.time}</p>
            <p style={{ marginBottom: 0 }}>{selectedNotification.detail}</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderFeedback = () => (
    <>
      <section className="charts-grid">
        <div className="card-container">
          <div className="chart-header">
            <h3 className="chart-title">Positive vs Negative Feedback</h3>
            <select className="chart-filter" value={filter} onChange={e => setFilter(e.target.value)}>
              <option value="this_month">This Month</option>
              <option value="last_month">Last Month</option>
              <option value="this_year">This Year</option>
            </select>
          </div>
          <div style={{ height: '300px' }}>
            <Bar data={barData} options={chartOptions} />
          </div>
        </div>

        <div className="card-container">
          <div className="chart-header">
            <h3 className="chart-title">Feedback Distribution</h3>
          </div>
          <div style={{ height: '300px' }}>
            <Doughnut data={doughnutData} options={doughnutOptions} />
          </div>
        </div>
      </section>

      <section className="recent-feedback-section">
        <h2 className="section-title">Recent Feedback</h2>
        <div className="feedback-grid">
          {feedbackData.length > 0 ? (
            feedbackData.map(fb => {
              const isPositive = fb.rating >= 7;
              return (
                <div key={fb.id} className={`feedback-card-premium ${isPositive ? 'positive' : 'negative'}`}>
                  <div className="fb-card-header">
                    <img src={`https://i.pravatar.cc/150?u=${fb.user_id}`} alt="User" className="fb-avatar" />
                    <div className="fb-user-info">
                      <h4>{fb.user_email || `User #${fb.user_id}`}</h4>
                      <span>{new Date(fb.created_at).toLocaleDateString()}</span>
                    </div>
                    <span className="fb-status-tag">
                      {isPositive ? 'Positive' : 'Negative'}
                    </span>
                  </div>
                  <div className="fb-rating">
                    {'★'.repeat(Math.ceil(fb.rating / 2))}{'☆'.repeat(5 - Math.ceil(fb.rating / 2))}
                  </div>
                  <p className="fb-comment">"{fb.comment || 'No comment'}"</p>
                </div>
              );
            })
          ) : (
            <p className="text-muted">No feedback yet.</p>
          )}
        </div>
      </section>
    </>
  );

  const renderCurrentView = () => {
    switch (activeNav) {
      case 'home': return renderHome();
      case 'food': return renderFoodOrders();
      case 'fav': return renderFavoriteMenu();
      case 'msg': return renderMessages();
      case 'hist': return renderOrderHistory();
      case 'notif': return renderNotifications();
      case 'feedback': return renderFeedback();
      default: return <div className="adm-view-container"><p className="text-muted">This section is coming soon!</p></div>;
    }
  };

  return (
    <div className={`adm-layout ${theme === 'dark' ? 'adm-dark' : ''}`}>
      {/* ── Sidebar ── */}
      <aside className="adm-sidebar">
        <div className="adm-logo" onClick={() => setActiveNav('home')} style={{ cursor: 'pointer' }}>
          <div className="adm-logo-icon">
            <img src={cateringLogo} alt="Catering logo" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />
          </div>
          <span>Savory</span>
        </div>
        <nav className="adm-nav">
          {navItems.map(item => (
            <button 
              key={item.key} 
              className={`adm-nav-item ${activeNav === item.key ? 'active' : ''}`}
              onClick={() => setActiveNav(item.key)}
            >
              <span>{item.icon}</span> {item.label}
            </button>
          ))}
          <button className="adm-logout-btn" onClick={logout}>
            <span>🚪</span> Logout
          </button>
        </nav>
      </aside>

      {/* ── Main content ── */}
      <main className="adm-main">
        <header className="adm-header">
          <div className="adm-header-left">
             <h1 className="adm-title">{navItems.find(n => n.key === activeNav)?.label}</h1>
             <p className="adm-subtitle">Welcome back, Admin</p>
          </div>
          <div className="adm-top-actions">
            {activeNav === 'feedback' && (
              <button className="adm-refresh-btn" onClick={fetchFeedback} disabled={isLoading}>
                {isLoading ? '🔄 Loading...' : '🔄 Refresh'}
              </button>
            )}
            <button className="dark-mode-toggle" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
              {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
            </button>
          </div>
        </header>

        {renderCurrentView()}
      </main>
    </div>
  );
}
