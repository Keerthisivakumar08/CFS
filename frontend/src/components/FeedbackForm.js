import React, { useState } from 'react';
import api from '../api';
import './FeedbackForm.css';

const FeedbackForm = ({ onComplete, onBack, selectedBrand }) => {
    const [activeView, setActiveView] = useState('feedback');
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [discoverySource, setDiscoverySource] = useState('');
    const [emoji, setEmoji] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const sources = [
        'Social media',
        'Streaming service ad',
        'Google search',
        'Friends'
    ];

    const emojis = [
        { char: '😡', label: 'Angry' },
        { char: '😫', label: 'Stressed' },
        { char: '😐', label: 'Neutral' },
        { char: '😴', label: 'Sleepy' },
        { char: '🙂', label: 'Slightly Smile' },
        { char: '😊', label: 'Happy' },
        { char: '🤯', label: 'Mind blown' },
        { char: '🤩', label: 'Star-struck' },
        { char: '🔥', label: 'Fire' },
        { char: '🚀', label: 'Rocket' }
    ];

    const menuItems = [
        { id: 1, name: 'Truffle Mac & Cheese', price: '$24', rating: 4.9, img: 'https://images.unsplash.com/photo-1543339308-43e59d6b73a6?w=400' },
        { id: 2, name: 'Grilled Salmon', price: '$32', rating: 4.8, img: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400' },
        { id: 3, name: 'Wagyu Burger', price: '$28', rating: 4.7, img: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400' },
        { id: 4, name: 'Avocado Toast', price: '$18', rating: 4.5, img: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=400' },
        { id: 5, name: 'Chicken Alfredo', price: '$26', rating: 4.8, img: 'https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?w=400' },
        { id: 6, name: 'Margherita Pizza', price: '$21', rating: 4.6, img: 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=400' },
        { id: 7, name: 'Sushi Platter', price: '$34', rating: 4.9, img: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=400' },
        { id: 8, name: 'Chocolate Lava Cake', price: '$14', rating: 4.7, img: 'https://images.unsplash.com/photo-1614707267537-b85aaf00c4b7?w=400' },
        { id: 9, name: 'Pesto Pasta', price: '$23', rating: 4.6, img: 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=400' }
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (rating === 0) {
            setMessage({ type: 'error', text: 'Please select a satisfaction rating.' });
            return;
        }

        setIsSubmitting(true);
        setMessage({ type: '', text: '' });

        try {
            const token = localStorage.getItem('token');
            await api.post('/feedback', {
                rating,
                comment: selectedBrand
                    ? `[Brand: ${selectedBrand.name}]${comment ? ` ${comment}` : ''}`
                    : comment,
                discovery_source: discoverySource,
                emoji
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setMessage({
                type: 'success',
                text: rating >= 7
                    ? 'Thanks for your support ❤️'
                    : 'Sorry for inconvenience, we will fix it'
            });
            setTimeout(() => {
                if (onComplete) onComplete();
            }, 2000);
        } catch (err) {
            console.error('Feedback Error:', err);
            const errorMsg = err.response?.data?.details || 'Failed to submit feedback. Please try again.';
            setMessage({ type: 'error', text: errorMsg });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="feedback-container">
            <div className="feedback-header">
                <div>
                    {selectedBrand && (
                        <div className="feedback-top-row">
                            <div className="selected-brand-chip">
                                <img src={selectedBrand.logo} alt={selectedBrand.name} className="selected-brand-logo" />
                                <span>{selectedBrand.name}</span>
                            </div>
                            <button
                                type="button"
                                className={`favorite-menu-toggle ${activeView === 'favorite' ? 'active' : ''}`}
                                onClick={() => setActiveView(activeView === 'favorite' ? 'feedback' : 'favorite')}
                            >
                                Favorite Menu
                            </button>
                        </div>
                    )}
                    <h2 className="feedback-title">Feedback Time!</h2>
                    <p className="feedback-subtitle">We value your opinions, take a little time to evaluate us.</p>
                </div>
                <div>
                    <button className="help-btn">?</button>
                    <button className="close-btn" onClick={onComplete}>×</button>
                </div>
            </div>

            {activeView === 'favorite' ? (
                <div className="feedback-favorite-wrap">
                    <h3 className="feedback-section-title mt-0">Favorite Menu</h3>
                    <div className="feedback-menu-grid">
                        {menuItems.map((item) => (
                            <div key={item.id} className="feedback-menu-card">
                                <img src={item.img} alt={item.name} className="feedback-menu-img" />
                                <div className="feedback-menu-body">
                                    <h4>{item.name}</h4>
                                    <div className="feedback-menu-meta">
                                        <span className="feedback-menu-price">{item.price}</span>
                                        <span className="feedback-menu-rating">&#9733; {item.rating}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
            <form onSubmit={handleSubmit}>
                <div className="feedback-section">
                    <h3 className="feedback-section-title">How satisfied were you when using the website?</h3>
                    <div className="rating-scale">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                            <button
                                key={num}
                                type="button"
                                className={`rating-btn ${rating === num ? 'active' : ''}`}
                                onClick={() => setRating(num)}
                            >
                                {num}
                            </button>
                        ))}
                    </div>
                    <div className="rating-labels">
                        <span>Not satisfied</span>
                        <span>Very satisfied</span>
                    </div>
                </div>

                <div className="feedback-section">
                    <h3 className="feedback-section-title">What are you thinking about us?</h3>
                    <textarea
                        className="feedback-textarea"
                        rows="3"
                        placeholder="Tell us now and we will do it as soon as possible."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                    ></textarea>
                </div>

                <div className="feedback-section">
                    <h3 className="feedback-section-title">How did you heard about us?</h3>
                    <div className="discovery-pills">
                        {sources.map(s => (
                            <button
                                key={s}
                                type="button"
                                className={`pill-btn ${discoverySource === s ? 'active' : ''}`}
                                onClick={() => setDiscoverySource(s)}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="feedback-section">
                    <h3 className="feedback-section-title">Give us a emoji!</h3>
                    <div className="emoji-grid">
                        {emojis.map(e => (
                            <button
                                key={e.char}
                                type="button"
                                title={e.label}
                                className={`emoji-btn ${emoji === e.char ? 'active' : ''}`}
                                onClick={() => setEmoji(e.char)}
                            >
                                {e.char}
                            </button>
                        ))}
                    </div>
                </div>

                {message.text && (
                    <div className={`mt-3 alert alert-${message.type === 'error' ? 'danger' : 'success'}`}>
                        {message.text}
                    </div>
                )}

                <div className="feedback-footer">
                    <span className="remind-link" onClick={onBack || onComplete}>
                        {onBack ? 'Back to logos' : 'Remind me later'}
                    </span>
                    <button 
                        type="submit" 
                        className="submit-btn" 
                        disabled={isSubmitting || rating === 0}
                    >
                        {isSubmitting ? 'Sending...' : 'Send'}
                    </button>
                </div>
            </form>
            )}
        </div>
    );
};

export default FeedbackForm;
