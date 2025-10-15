// Import CSS
import './styles.css';

// Supabase configuration will be set in supabase-config.js
// Make sure to update your Supabase credentials there

// Interest mapping
const INTEREST_MAPPING = {
  'AI': '46a4ed1c-0f5a-4775-ad72-28b9ec252000',
  'Arts': '7b37b1c4-40f7-43fc-864a-a51929d19c91',
  'Business': 'db0c846d-25bb-457f-8e70-57acbf1d05d8',
  'Education': '0991f93c-0d4d-4136-bb0d-ea4a6754ae21',
  'Emerging': '80c53377-ae3d-4734-ab51-896c6109e226',
  'Entertainment': '15405ba6-2295-4a96-bc5d-d3a942204cbf',
  'Environment': '09ec6ee8-30d5-4fbd-8adc-f8f8ac73430d',
  'Food': '550e931e-1bce-4008-944f-a241dd7c1486',
  'Health': '6c9128ee-cc69-4ba9-8972-d8503d68cae7',
  'Hobbies': '002ae8cb-0e49-49c3-9588-549490fbad8b',
  'Lifestyle': '1fbfab3e-bde4-451a-8a96-1659dabade36',
  'Politics': '1d0e7662-0c24-46ab-b2c1-e1456625ed98',
  'Sports': '3fd574df-f8c6-4bf3-bbeb-915cdf8cf335',
  'Technology': 'dfa7bf22-61b5-4b36-a3d4-7ed80d777a12',
  'Travel': 'f47bd5d0-2961-4bb6-9b0c-a5350a242676'
};

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
    hideJsonResponse();
    
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
        
        // Print complete JSON response
        console.log('=== COMPLETE API JSON RESPONSE ===');
        console.log(JSON.stringify(data, null, 2));
        console.log('=== END OF JSON RESPONSE ===');
        
        // Display JSON response in UI
        showJsonResponse(data);
        
        if (data.success) {
            console.log('API Response Success:', data.success);
            console.log('Articles received:', data.data?.articles?.length);
            console.log('Total Articles:', data.data?.totalArticles);
            console.log('Topic:', data.data?.topic);
            console.log('Timeframe:', data.data?.timeframe);
            
            if (data.data?.articles) {
                console.log('=== INDIVIDUAL ARTICLES ===');
                data.data.articles.forEach((article, index) => {
                    console.log(`Article ${index + 1}:`, {
                        title: article.title,
                        image: article.image,
                        source: article.source,
                        link: article.link,
                        time: article.time,
                        datetime: article.datetime,
                        articleType: article.articleType
                    });
                });
                console.log('=== END OF ARTICLES ===');
                
                // Save to Supabase explore table
                await saveNewsToSupabase(data.data, primaryTopic);
            }
            newsData = data.data;
            showNewsDisplay(newsData);
        } else {
            console.log('API Response Failed:', data);
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

function showJsonResponse(data) {
    const jsonDisplay = document.getElementById('jsonResponse');
    if (jsonDisplay) {
        jsonDisplay.innerHTML = `
            <div class="json-container">
                <div class="json-header">
                    <h3><i class="fas fa-code"></i> API JSON Response</h3>
                    <button class="toggle-json-btn" onclick="window.toggleJsonDisplay && window.toggleJsonDisplay()">
                        <i class="fas fa-chevron-down"></i>
                    </button>
                </div>
                <div class="json-content" id="jsonContent" style="display: none;">
                    <pre><code>${JSON.stringify(data, null, 2)}</code></pre>
                </div>
            </div>
        `;
        jsonDisplay.style.display = 'block';
    }
}

function hideJsonResponse() {
    const jsonDisplay = document.getElementById('jsonResponse');
    if (jsonDisplay) {
        jsonDisplay.style.display = 'none';
    }
}

function toggleJsonDisplay() {
    const jsonContent = document.getElementById('jsonContent');
    const toggleBtn = document.querySelector('.toggle-json-btn i');
    
    if (jsonContent && toggleBtn) {
        if (jsonContent.style.display === 'none') {
            jsonContent.style.display = 'block';
            toggleBtn.className = 'fas fa-chevron-up';
        } else {
            jsonContent.style.display = 'none';
            toggleBtn.className = 'fas fa-chevron-down';
        }
    }
}

// Make toggleJsonDisplay globally available
window.toggleJsonDisplay = toggleJsonDisplay;

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
                <span>No Image Available</span>
            </div>
        `;
    }

    // Create a unique ID for this image
    const imageId = 'img_' + Math.random().toString(36).substr(2, 9);

    // Try to use a proxy service for external images
    let imageSrc = src;
    if (src.includes('news.google.com') || src.includes('googleusercontent.com')) {
        // For Google News images, try without proxy first, will fallback in error handler
        imageSrc = src;
    }

    return `
        <div class="image-wrapper">
            <img
                id="${imageId}"
                src="${imageSrc}"
                alt="${alt}"
                class="article-image"
                loading="lazy"
                crossorigin="anonymous"
                referrerpolicy="no-referrer"
                onerror="window.handleImageError && window.handleImageError(this)"
                onload="window.handleImageLoad && window.handleImageLoad(this)"
            />
        </div>
    `;
}

function handleImageError(img) {
    console.log('❌ Image failed to load:', img.src);
    
    // Check if this is the first attempt (no data-retry attribute)
    const retryCount = parseInt(img.getAttribute('data-retry') || '0');
    
    if (retryCount === 0) {
        // Try loading without crossorigin first
        console.log('🔄 Retrying image load without crossorigin...');
        img.setAttribute('data-retry', '1');
        img.removeAttribute('crossorigin');
        img.src = img.src; // Trigger reload
        return;
    }
    
    // Hide the image after retry failed
    img.style.display = 'none';
    
    // Find the wrapper and replace with placeholder
    const wrapper = img.parentElement;
    if (wrapper && wrapper.classList.contains('image-wrapper')) {
        wrapper.innerHTML = `
            <div class="image-placeholder">
                <i class="fas fa-image"></i>
                <span>Image blocked by source</span>
                <small>External images may be restricted</small>
            </div>
        `;
    }
}

function handleImageLoad(img) {
    console.log('✅ Image loaded successfully:', img.src);
}

// Make functions globally available
window.handleImageError = handleImageError;
window.handleImageLoad = handleImageLoad;

function handleLinkClick(url) {
    if (url) {
        window.open(url, '_blank', 'noopener,noreferrer');
    }
}

// Make handleLinkClick globally available
window.handleLinkClick = handleLinkClick;

// Function to save news articles to Supabase explore_news table with duplicate checking
async function saveNewsToSupabase(newsData, topicName) {
    try {
        const interestId = INTEREST_MAPPING[topicName];
        if (!interestId) {
            console.error('❌ Interest ID not found for topic:', topicName);
            return;
        }

        if (!newsData.articles || newsData.articles.length === 0) {
            console.log('⚠️ No articles to save for topic:', topicName);
            return;
        }

        console.log('💾 Processing', newsData.articles.length, 'articles for topic:', topicName, 'with interest ID:', interestId);

        // Prepare articles data for explore_news table
        const articlesToSave = newsData.articles.map((article, index) => ({
            interest_id: interestId,
            title: article.title || 'Untitled Article',
            link: article.link || '',
            time: article.time || 'Recently',
            source: article.source || 'Unknown Source',
            image: article.image || null,
            datetime: article.datetime || new Date().toISOString(),
            article_type: article.articleType || 'regular',
            sort_order: index
        }));

        // Make request to your backend API that will check for duplicates and save to Supabase
        const response = await fetch('/api/save-news', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                articles: articlesToSave,
                topic_name: topicName,
                interest_id: interestId
            })
        });

        if (response.ok) {
            const result = await response.json();
            console.log('✅ Bulk save completed:', {
                total_processed: result.total_processed,
                new_articles: result.new_articles,
                duplicates_found: result.duplicates_found,
                successfully_saved: result.successfully_saved,
                errors: result.errors
            });
        } else {
            const errorData = await response.json();
            console.error('❌ Failed to save to Supabase:', response.status, errorData);
        }

    } catch (error) {
        console.error('❌ Error saving to Supabase:', error);
    }
}
