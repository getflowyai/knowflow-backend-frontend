import React, { useState } from 'react';
import './NewsForm.css';

const NewsForm = ({ topics, onNewsFetch, loading }) => {
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [limit, setLimit] = useState(10);
  const [timeframe, setTimeframe] = useState('7d');

  const handleTopicToggle = (topic) => {
    setSelectedTopics(prev => 
      prev.includes(topic) 
        ? prev.filter(t => t !== topic)
        : [...prev, topic]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedTopics.length > 0) {
      onNewsFetch(selectedTopics, limit, timeframe);
    }
  };

  const handleSelectAll = () => {
    setSelectedTopics(selectedTopics.length === topics.length ? [] : [...topics]);
  };

  const getTopicIcon = (topic) => {
    const icons = {
      'AI': 'fas fa-robot',
      'Arts': 'fas fa-palette',
      'Business': 'fas fa-briefcase',
      'Education': 'fas fa-graduation-cap',
      'Emerging': 'fas fa-lightbulb',
      'Entertainment': 'fas fa-film',
      'Environment': 'fas fa-leaf',
      'Food': 'fas fa-utensils',
      'Health': 'fas fa-heartbeat',
      'Hobbies': 'fas fa-gamepad',
      'Lifestyle': 'fas fa-home',
      'Politics': 'fas fa-landmark',
      'Sports': 'fas fa-futbol',
      'Technology': 'fas fa-microchip',
      'Travel': 'fas fa-plane'
    };
    return icons[topic] || 'fas fa-newspaper';
  };

  return (
    <div className="news-form-container">
      <form onSubmit={handleSubmit} className="news-form">
        <div className="form-header">
          <h2 className="form-title">
            <i className="fas fa-filter"></i>
            Select News Topics
          </h2>
          <p className="form-description">
            Choose topics to generate personalized news (currently uses the first selected topic)
          </p>
        </div>

        <div className="form-controls">
          <button
            type="button"
            onClick={handleSelectAll}
            className="select-all-btn"
            disabled={loading}
          >
            <i className="fas fa-check-double"></i>
            {selectedTopics.length === topics.length ? 'Deselect All' : 'Select All'}
          </button>
          
          <div className="selected-count">
            <i className="fas fa-info-circle"></i>
            {selectedTopics.length} topic{selectedTopics.length !== 1 ? 's' : ''} selected
          </div>
        </div>

        <div className="form-options">
          <div className="option-group">
            <label htmlFor="limit">Number of Articles:</label>
            <select 
              id="limit" 
              value={limit} 
              onChange={(e) => setLimit(parseInt(e.target.value))}
              className="form-select"
            >
              <option value={5}>5 articles</option>
              <option value={10}>10 articles</option>
              <option value={15}>15 articles</option>
              <option value={20}>20 articles</option>
            </select>
          </div>
          
          <div className="option-group">
            <label htmlFor="timeframe">Time Frame:</label>
            <select 
              id="timeframe" 
              value={timeframe} 
              onChange={(e) => setTimeframe(e.target.value)}
              className="form-select"
            >
              <option value="1d">Last 24 hours</option>
              <option value="3d">Last 3 days</option>
              <option value="7d">Last week</option>
              <option value="30d">Last month</option>
            </select>
          </div>
        </div>

        <div className="topics-grid">
          {topics.map(topic => (
            <div
              key={topic}
              className={`topic-card ${selectedTopics.includes(topic) ? 'selected' : ''}`}
              onClick={() => handleTopicToggle(topic)}
            >
              <div className="topic-icon">
                <i className={getTopicIcon(topic)}></i>
              </div>
              <span className="topic-name">{topic}</span>
              {selectedTopics.includes(topic) && (
                <div className="selected-indicator">
                  <i className="fas fa-check"></i>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="form-actions">
          <button
            type="submit"
            className="generate-btn"
            disabled={selectedTopics.length === 0 || loading}
          >
            {loading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>
                Generating News...
              </>
            ) : (
              <>
                <i className="fas fa-magic"></i>
                Generate News
              </>
            )}
          </button>
        </div>

        {selectedTopics.length === 0 && (
          <div className="form-hint">
            <i className="fas fa-hand-pointer"></i>
            Please select at least one topic to generate news
          </div>
        )}
      </form>
    </div>
  );
};

export default NewsForm;
