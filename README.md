# KnowFlow News Generator

A modern, responsive React frontend application for generating personalized news articles using the KnowFlow News API.

## Features

- **Multi-topic Selection**: Choose from 15 different news topics including AI, Arts, Business, Education, and more
- **Beautiful UI**: Modern, responsive design with smooth animations and gradients
- **Real-time News**: Fetch the latest articles from the KnowFlow News API
- **Article Display**: Rich article cards with images, timestamps, and source information
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices

## Available Topics

- AI
- Arts
- Business
- Education
- Emerging
- Entertainment
- Environment
- Food
- Health
- Hobbies
- Lifestyle
- Politics
- Sports
- Technology
- Travel

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn

### Installation

1. Clone or download this project
2. Navigate to the project directory:
   ```bash
   cd KnowFlow-Backend-Frontend
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:3000`

### Available Scripts

- `npm start` - Start the development server
- `npm run dev` - Start the development server with auto-open
- `npm run build` - Build the project for production

## API Integration

The application integrates with the KnowFlow News API at:
`https://know-flow-news.vercel.app/api/getNews`

### API Request Format
```json
{
  "topics": ["AI", "Technology", "Business"]
}
```

### API Response Format
```json
{
  "success": true,
  "data": {
    "topic": "string",
    "totalArticles": "integer",
    "timeframe": "string",
    "articles": [
      {
        "title": "string",
        "link": "string (URL)",
        "time": "string (relative time)",
        "source": "string",
        "image": "string (URL)",
        "datetime": "string (ISO 8601)",
        "articleType": "string"
      }
    ]
  }
}
```

## Technology Stack

- **React 18** - Frontend framework
- **Webpack 5** - Module bundler
- **Babel** - JavaScript transpiler
- **CSS3** - Styling with modern features
- **Font Awesome** - Icons
- **Google Fonts** - Typography

## Project Structure

```
src/
├── components/
│   ├── NewsForm.js          # Topic selection form
│   ├── NewsForm.css         # Form styling
│   ├── NewsDisplay.js       # News articles display
│   ├── NewsDisplay.css      # Display styling
│   ├── NewsArticle.js       # Individual article component
│   └── NewsArticle.css      # Article styling
├── App.js                   # Main application component
├── App.css                  # Main application styling
├── index.js                 # Application entry point
└── index.css                # Global styles
```

## Features in Detail

### Topic Selection
- Interactive topic cards with icons
- Select all/deselect all functionality
- Visual feedback for selected topics
- Real-time selection counter

### News Display
- Grid layout for articles
- Article metadata (source, time, type)
- Image support with fallback handling
- External link integration
- Responsive design for all screen sizes

### User Experience
- Loading states with animations
- Error handling and user feedback
- Smooth transitions and hover effects
- Accessible design with proper contrast

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT License - feel free to use this project for your own applications.

## Contributing

1. Fork the project
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

---

Built with ❤️ for the KnowFlow News platform
