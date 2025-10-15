// Import CSS
import './styles.css';

// Topics data
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

// Global state
let selectedTopics = [];
let loading = false;
let newsData = null;

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    renderTopics();
    setupEventListeners();
}

function setupEventListeners() {
    const form = document.getElementById('newsForm');
    const selectAllBtn = document.getElementById('selectAllBtn');
    
    form.addEventListener('submit', handleFormSubmit);
    selectAllBtn.addEventListener('click', handleSelectAll);
}

function renderTopics() {
    const topicsGrid = document.getElementById('topicsGrid');
    topicsGrid.innerHTML = '';

    TOPICS.forEach(topic => {
        const topicCard = document.createElement('div');
        topicCard.className = 'topic-card';
        topicCard.innerHTML = `
            <div class="topic-icon">
                <i class="${getTopicIcon(topic)}"></i>
            </div>
            <span class="topic-name">${topic}</span>
            <div class="selected-indicator" style="display: none;">
                <i class="fas fa-check"></i>
            </div>
        `;
        
        topicCard.addEventListener('click', () => handleTopicToggle(topic));
        topicsGrid.appendChild(topicCard);
    });
}

function getTopicIcon(topic) {
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
}

function handleTopicToggle(topic) {
    const topicCards = document.querySelectorAll('.topic-card');
    const topicCard = Array.from(topicCards).find(card => 
        card.querySelector('.topic-name').textContent === topic
    );
    
    if (selectedTopics.includes(topic)) {
        selectedTopics = selectedTopics.filter(t => t !== topic);
        topicCard.classList.remove('selected');
        topicCard.querySelector('.selected-indicator').style.display = 'none';
    } else {
        selectedTopics.push(topic);
        topicCard.classList.add('selected');
        topicCard.querySelector('.selected-indicator').style.display = 'flex';
    }
    
    updateFormState();
}

function handleSelectAll() {
    const allSelected = selectedTopics.length === TOPICS.length;
    selectedTopics = allSelected ? [] : [...TOPICS];
    
    const topicCards = document.querySelectorAll('.topic-card');
    topicCards.forEach((card, index) => {
        const topic = TOPICS[index];
        const isSelected = selectedTopics.includes(topic);
        
        if (isSelected) {
            card.classList.add('selected');
            card.querySelector('.selected-indicator').style.display = 'flex';
        } else {
            card.classList.remove('selected');
            card.querySelector('.selected-indicator').style.display = 'none';
        }
    });
    
    updateFormState();
}

function updateFormState() {
    const selectedCount = document.getElementById('selectedCount');
    const generateBtn = document.getElementById('generateBtn');
    const selectAllBtn = document.getElementById('selectAllBtn');
    const formHint = document.getElementById('formHint');
    
    const count = selectedTopics.length;
    selectedCount.textContent = `${count} topic${count !== 1 ? 's' : ''} selected`;
    
    generateBtn.disabled = count === 0 || loading;
    selectAllBtn.disabled = loading;
    
    if (count === 0) {
        formHint.style.display = 'block';
    } else {
        formHint.style.display = 'none';
    }
    
    selectAllBtn.innerHTML = `
        <i class="fas fa-check-double"></i>
        ${count === TOPICS.length ? 'Deselect All' : 'Select All'}
    `;
}

async function handleFormSubmit(e) {
    e.preventDefault();
    
    if (selectedTopics.length === 0) return;
    
    const limit = parseInt(document.getElementById('limit').value);
    const timeframe = document.getElementById('timeframe').value;
    
    await fetchNews(selectedTopics, limit, timeframe);
}

async function fetchNews(selectedTopics, limit = 10, timeframe = '7d') {
    setLoading(true);
    hideError();
    hideNewsDisplay();
    
    try {
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
            newsData = data.data;
            showNewsDisplay(newsData);
        } else {
            throw new Error(data.message || 'Failed to fetch news');
        }
    } catch (err) {
        showError(err.message);
        console.error('Error fetching news:', err);
    } finally {
        setLoading(false);
    }
}

function setLoading(isLoading) {
    loading = isLoading;
    const generateBtn = document.getElementById('generateBtn');
    
    if (isLoading) {
        generateBtn.innerHTML = `
            <i class="fas fa-spinner fa-spin"></i>
            Generating News...
        `;
        generateBtn.disabled = true;
    } else {
        generateBtn.innerHTML = `
            <i class="fas fa-magic"></i>
            Generate News
        `;
        updateFormState();
    }
}

function showError(message) {
    const errorMessage = document.getElementById('errorMessage');
    const errorText = document.getElementById('errorText');
    
    errorText.textContent = message;
    errorMessage.style.display = 'block';
}

function hideError() {
    const errorMessage = document.getElementById('errorMessage');
    errorMessage.style.display = 'none';
}

function showNewsDisplay(data) {
    const newsDisplay = document.getElementById('newsDisplay');
    newsDisplay.innerHTML = createNewsDisplayHTML(data);
    newsDisplay.style.display = 'block';
}

function hideNewsDisplay() {
    const newsDisplay = document.getElementById('newsDisplay');
    newsDisplay.style.display = 'none';
}

function createNewsDisplayHTML(data) {
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

    return `
        <div class="news-header">
            <div class="news-meta">
                <div class="news-topic">
                    <i class="fas fa-tag"></i>
                    <span>${formatTopics(data.topic)}</span>
                </div>
                <div class="news-count">
                    <i class="fas fa-newspaper"></i>
                    <span>${data.totalArticles} Articles</span>
                </div>
                <div class="news-timeframe">
                    <i class="fas fa-clock"></i>
                    <span>${formatTimeframe(data.timeframe)}</span>
                </div>
            </div>
            
            <div class="news-summary">
                <h2 class="summary-title">
                    <i class="fas fa-chart-line"></i>
                    News Summary
                </h2>
                <p class="summary-text">
                    Found ${data.totalArticles} recent articles covering ${formatTopics(data.topic)}. 
                    Stay updated with the latest developments and insights.
                </p>
            </div>
        </div>

        <div class="articles-grid">
            ${data.articles && data.articles.length > 0 
                ? data.articles.map((article, index) => createArticleHTML(article, index)).join('')
                : `
                    <div class="no-articles">
                        <i class="fas fa-newspaper"></i>
                        <h3>No articles found</h3>
                        <p>Try selecting different topics or check back later for updates.</p>
                    </div>
                `
            }
        </div>

        <div class="news-footer">
            <div class="refresh-hint">
                <i class="fas fa-info-circle"></i>
                <span>News is updated regularly. Generate new content to get the latest articles.</span>
            </div>
        </div>
    `;
}

function createArticleHTML(article, index) {
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

    const color = getArticleTypeColor(article.articleType);
    const icon = getArticleTypeIcon(article.articleType);
    const formattedDateTime = formatDateTime(article.datetime);

    return `
        <article class="news-article" style="animation-delay: ${index * 0.1}s">
            <div class="article-header">
                <div class="article-type-badge" style="background: ${color}20; color: ${color}; border: 1px solid ${color}40;">
                    <i class="${icon}" style="color: ${color};"></i>
                    <span>${article.articleType || 'Article'}</span>
                </div>
                <div class="article-time">
                    <i class="fas fa-clock"></i>
                    <span>${formatTime(article.time)}</span>
                </div>
            </div>

            <div class="article-image-container">
                ${createImageHTML(article.image, article.title)}
            </div>

            <div class="article-content">
                <h3 class="article-title">${article.title}</h3>

                <div class="article-meta">
                    <div class="article-source">
                        <i class="fas fa-external-link-alt"></i>
                        <span>${article.source}</span>
                    </div>
                    
                    ${formattedDateTime ? `
                        <div class="article-datetime">
                            <i class="fas fa-calendar"></i>
                            <span>${formattedDateTime}</span>
                        </div>
                    ` : ''}
                </div>

                <button class="read-more-btn" ${!article.link ? 'disabled' : ''} onclick="handleLinkClick('${article.link || ''}')">
                    <i class="fas fa-external-link-alt"></i>
                    Read Full Article
                </button>
            </div>
        </article>
    `;
}

function createImageHTML(src, alt) {
    if (!src) {
        return `
            <div class="image-placeholder">
                <i class="fas fa-newspaper"></i>
                <span>No Image</span>
            </div>
        `;
    }

    return `
        <div class="image-wrapper">
            <img
                src="${src}"
                alt="${alt}"
                class="article-image"
                loading="lazy"
                onerror="handleImageError(this)"
                onload="handleImageLoad(this)"
            />
        </div>
    `;
}

function handleImageError(img) {
    img.style.display = 'none';
    const wrapper = img.parentElement;
    wrapper.innerHTML = `
        <div class="image-placeholder">
            <i class="fas fa-newspaper"></i>
            <span>No Image</span>
        </div>
    `;
}

function handleImageLoad(img) {
    console.log('✅ Image loaded successfully:', img.src);
}

function handleLinkClick(url) {
    if (url) {
        window.open(url, '_blank', 'noopener,noreferrer');
    }
}
