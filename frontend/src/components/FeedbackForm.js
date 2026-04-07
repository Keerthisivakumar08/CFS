import React, { useState } from 'react';
import api from '../api';
import './FeedbackForm.css';

const FeedbackForm = ({ onComplete }) => {
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
                comment,
                discovery_source: discoverySource,
                emoji
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setMessage({ type: 'success', text: 'Thank you for your feedback!' });
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
                    <h2 className="feedback-title">Feedback Time!</h2>
                    <p className="feedback-subtitle">We value your opinions, take a little time to evaluate us.</p>
                </div>
                <div>
                    <button className="help-btn">?</button>
                    <button className="close-btn" onClick={onComplete}>×</button>
                </div>
            </div>

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
                    <span className="remind-link" onClick={onComplete}>Remind me later</span>
                    <button 
                        type="submit" 
                        className="submit-btn" 
                        disabled={isSubmitting || rating === 0}
                    >
                        {isSubmitting ? 'Sending...' : 'Send'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default FeedbackForm;
