import React, { useState } from 'react';
import NewsForm from './components/NewsForm';
import NewsDisplay from './components/NewsDisplay';
import './App.css';


const TOPICS = [
  'AI',
  'Arts',
  'Business',
  'Education',
  'Emerging',
  'Entertainment',
  'Environment',
  'Food',
  'Health',
  'Hobbies',
  'Lifestyle',
  'Politics',
  'Sports',
  'Technology',
  'Travel'
];

function App() {
  const [newsData, setNewsData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleNewsFetch = async (selectedTopics, limit = 10, timeframe = '7d') => {
    setLoading(true);
    setError(null);
    setNewsData(null);

    try {
      // For now, let's fetch news for the first selected topic
      // You can modify this to handle multiple topics as needed
      const primaryTopic = selectedTopics[0];
      
      const response = await fetch('https://know-flow-news.vercel.app/api/getNews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: primaryTopic,
          limit: limit,
          timeframe: timeframe
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        console.log('API Response:', data);
        console.log('Articles received:', data.data?.articles?.length);
        if (data.data?.articles) {
          data.data.articles.forEach((article, index) => {
            console.log(`Article ${index + 1}:`, {
              title: article.title,
              image: article.image,
              source: article.source
            });
          });
        }
        setNewsData(data.data);
      } else {
        throw new Error(data.message || 'Failed to fetch news');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching news:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="container">
          <h1 className="app-title">
            <i className="fas fa-newspaper"></i>
            KnowFlow News Generator
          </h1>
          <p className="app-subtitle">
            Discover the latest news across your favorite topics
          </p>
        </div>
      </header>

      <main className="app-main">
        <div className="container">
          <NewsForm 
            topics={TOPICS} 
            onNewsFetch={handleNewsFetch}
            loading={loading}
          />
          
          {error && (
            <div className="error-message">
              <i className="fas fa-exclamation-triangle"></i>
              <span>{error}</span>
            </div>
          )}

          {newsData && (
            <NewsDisplay data={newsData} />
          )}
        </div>
      </main>

      <footer className="app-footer">
        <div className="container">
          <p>&copy; 2024 KnowFlow. Powered by AI-driven news aggregation.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
