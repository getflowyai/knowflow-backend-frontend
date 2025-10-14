import React from 'react';
import NewsArticle from './NewsArticle';
import './NewsDisplay.css';

const NewsDisplay = ({ data }) => {
  const formatTimeframe = (timeframe) => {
    if (!timeframe) return 'Recent';
    return timeframe.charAt(0).toUpperCase() + timeframe.slice(1);
  };

  const formatTopics = (topics) => {
    if (Array.isArray(topics)) {
      return topics.join(', ');
    }
    return topics || 'Multiple Topics';
  };

  return (
    <div className="news-display-container">
      <div className="news-header">
        <div className="news-meta">
          <div className="news-topic">
            <i className="fas fa-tag"></i>
            <span>{formatTopics(data.topic)}</span>
          </div>
          <div className="news-count">
            <i className="fas fa-newspaper"></i>
            <span>{data.totalArticles} Articles</span>
          </div>
          <div className="news-timeframe">
            <i className="fas fa-clock"></i>
            <span>{formatTimeframe(data.timeframe)}</span>
          </div>
        </div>
        
        <div className="news-summary">
          <h2 className="summary-title">
            <i className="fas fa-chart-line"></i>
            News Summary
          </h2>
          <p className="summary-text">
            Found {data.totalArticles} recent articles covering {formatTopics(data.topic)}. 
            Stay updated with the latest developments and insights.
          </p>
        </div>
      </div>

      <div className="articles-grid">
        {data.articles && data.articles.length > 0 ? (
          data.articles.map((article, index) => (
            <NewsArticle 
              key={`${article.link}-${index}`} 
              article={article} 
              index={index}
            />
          ))
        ) : (
          <div className="no-articles">
            <i className="fas fa-newspaper"></i>
            <h3>No articles found</h3>
            <p>Try selecting different topics or check back later for updates.</p>
          </div>
        )}
      </div>

      <div className="news-footer">
        <div className="refresh-hint">
          <i className="fas fa-info-circle"></i>
          <span>News is updated regularly. Generate new content to get the latest articles.</span>
        </div>
      </div>
    </div>
  );
};

export default NewsDisplay;
