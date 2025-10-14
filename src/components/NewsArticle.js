import React from 'react';
import ImageWithFallback from './ImageWithFallback';
import './NewsArticle.css';

const NewsArticle = ({ article, index }) => {

  const formatTime = (time) => {
    if (!time) return 'Recently';
    return time;
  };

  const formatDateTime = (datetime) => {
    if (!datetime) return null;
    try {
      const date = new Date(datetime);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return null;
    }
  };

  const getArticleTypeColor = (articleType) => {
    const colors = {
      'breaking': '#e53e3e',
      'featured': '#667eea',
      'trending': '#38a169',
      'latest': '#d69e2e',
      'default': '#718096'
    };
    return colors[articleType?.toLowerCase()] || colors.default;
  };

  const getArticleTypeIcon = (articleType) => {
    const icons = {
      'breaking': 'fas fa-bolt',
      'featured': 'fas fa-star',
      'trending': 'fas fa-fire',
      'latest': 'fas fa-clock',
      'default': 'fas fa-newspaper'
    };
    return icons[articleType?.toLowerCase()] || icons.default;
  };

  const handleLinkClick = (e) => {
    e.preventDefault();
    if (article.link) {
      window.open(article.link, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <article className="news-article" style={{ animationDelay: `${index * 0.1}s` }}>
      <div className="article-header">
        <div className="article-type-badge">
          <i className={getArticleTypeIcon(article.articleType)}></i>
          <span>{article.articleType || 'Article'}</span>
        </div>
        <div className="article-time">
          <i className="fas fa-clock"></i>
          <span>{formatTime(article.time)}</span>
        </div>
      </div>

      <div className="article-image-container">
        <ImageWithFallback 
          src={article.image} 
          alt={article.title}
          className="article-image"
        />
      </div>

      <div className="article-content">
        <h3 className="article-title">
          {article.title}
        </h3>

        <div className="article-meta">
          <div className="article-source">
            <i className="fas fa-external-link-alt"></i>
            <span>{article.source}</span>
          </div>
          
          {formatDateTime(article.datetime) && (
            <div className="article-datetime">
              <i className="fas fa-calendar"></i>
              <span>{formatDateTime(article.datetime)}</span>
            </div>
          )}
        </div>

        <button 
          className="read-more-btn"
          onClick={handleLinkClick}
          disabled={!article.link}
        >
          <i className="fas fa-external-link-alt"></i>
          Read Full Article
        </button>
      </div>

      <style jsx>{`
        .article-type-badge {
          background: ${getArticleTypeColor(article.articleType)}20;
          color: ${getArticleTypeColor(article.articleType)};
          border: 1px solid ${getArticleTypeColor(article.articleType)}40;
        }
        
        .article-type-badge i {
          color: ${getArticleTypeColor(article.articleType)};
        }
      `}</style>
    </article>
  );
};

export default NewsArticle;
