# Supabase Setup for News Saving

This guide will help you set up automatic saving of generated news to your Supabase explore table.

## 1. Supabase Configuration

### Step 1: Get Your Supabase Credentials
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings** > **API**
4. Copy the following:
   - **Project URL** (e.g., `https://your-project-id.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)

### Step 2: Update Configuration
Edit the file `supabase-config.js` and replace the placeholder values:

```javascript
export const SUPABASE_CONFIG = {
    url: 'https://your-actual-project-id.supabase.co',
    anonKey: 'your-actual-anon-key-here'
};
```

## 2. Database Schema

Make sure your Supabase `explore_news` table has the following structure:

```sql
-- Global Explore News Table
CREATE TABLE IF NOT EXISTS explore_news (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  interest_id UUID REFERENCES interests(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  link TEXT NOT NULL,
  time TEXT, -- "18 hours ago", "8 hours ago", etc.
  source TEXT NOT NULL,
  image TEXT, -- image URL
  datetime TIMESTAMP, -- ISO datetime string
  article_type TEXT DEFAULT 'regular', -- "regular" or other types
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  sort_order INTEGER DEFAULT 0
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_explore_news_interest_id ON explore_news(interest_id);
CREATE INDEX IF NOT EXISTS idx_explore_news_datetime ON explore_news(datetime DESC);
CREATE INDEX IF NOT EXISTS idx_explore_news_sort_order ON explore_news(interest_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_explore_news_source ON explore_news(source);

-- Enable Row Level Security (RLS)
ALTER TABLE explore_news ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (read-only for all authenticated users)
CREATE POLICY "All users can view explore news" ON explore_news
  FOR SELECT USING (true);

-- Grant necessary permissions
GRANT SELECT ON public.explore_news TO anon, authenticated;
GRANT ALL ON public.explore_news TO authenticated; -- For admin operations
```

## 3. Environment Variables (Optional)

You can also set environment variables instead of editing the config file:

```bash
# .env.local
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
```

## 4. How It Works

When a user generates news for a specific interest:

1. **Frontend** collects the news data from the API
2. **Maps** the topic name to the corresponding interest ID
3. **Sends** the data to `/api/save-explore-news-bulk` endpoint
4. **Backend** checks for duplicates and bulk saves new articles to Supabase explore_news table
5. **No login required** - uses anon key for public access

## 5. Data Structure

Each article is saved individually to the `explore_news` table with the following structure:

```javascript
{
    interest_id: "46a4ed1c-0f5a-4775-ad72-28b9ec252000", // AI interest ID
    title: "Latest AI Breakthrough in Machine Learning",
    link: "https://example.com/article",
    time: "2 hours ago",
    source: "TechCrunch",
    image: "https://example.com/image.jpg",
    datetime: "2024-01-15T10:30:00.000Z",
    article_type: "regular",
    sort_order: 0,
    created_at: "2024-01-15T10:30:00.000Z",
    updated_at: "2024-01-15T10:30:00.000Z"
}
```

### Interest ID Mapping:
- **AI**: `46a4ed1c-0f5a-4775-ad72-28b9ec252000`
- **Arts**: `7b37b1c4-40f7-43fc-864a-a51929d19c91`
- **Business**: `db0c846d-25bb-457f-8e70-57acbf1d05d8`
- **Education**: `0991f93c-0d4d-4136-bb0d-ea4a6754ae21`
- **Emerging**: `80c53377-ae3d-4734-ab51-896c6109e226`
- **Entertainment**: `15405ba6-2295-4a96-bc5d-d3a942204cbf`
- **Environment**: `09ec6ee8-30d5-4fbd-8adc-f8f8ac73430d`
- **Food**: `550e931e-1bce-4008-944f-a241dd7c1486`
- **Health**: `6c9128ee-cc69-4ba9-8972-d8503d68cae7`
- **Hobbies**: `002ae8cb-0e49-49c3-9588-549490fbad8b`
- **Lifestyle**: `1fbfab3e-bde4-451a-8a96-1659dabade36`
- **Politics**: `1d0e7662-0c24-46ab-b2c1-e1456625ed98`
- **Sports**: `3fd574df-f8c6-4bf3-bbeb-915cdf8cf335`
- **Technology**: `dfa7bf22-61b5-4b36-a3d4-7ed80d777a12`
- **Travel**: `f47bd5d0-2961-4bb6-9b0c-a5350a242676`

## 6. Features

### **🔄 Bulk Processing**
- **Efficient**: Processes all articles in a single request
- **Fast**: Uses bulk insert for better performance
- **Smart**: Maintains proper sort_order for article ordering

### **🚫 Duplicate Prevention**
- **Automatic**: Checks existing articles by link URL
- **Smart Filtering**: Only saves articles that don't already exist
- **Efficient**: Uses database queries to identify duplicates quickly

### **📊 Detailed Reporting**
The API returns comprehensive statistics:
```javascript
{
    success: true,
    total_processed: 10,        // Total articles processed
    new_articles: 7,           // New articles found
    duplicates_found: 3,       // Duplicates filtered out
    successfully_saved: 7,     // Successfully saved to database
    errors: [],               // Any errors encountered
    topic_name: "Technology",
    interest_id: "dfa7bf22-61b5-4b36-a3d4-7ed80d777a12"
}
```

## 7. Testing

1. Update your Supabase configuration
2. Deploy your application
3. Generate news for any topic
4. Check your Supabase explore_news table for the saved data
5. Check browser console for detailed bulk save results
6. Generate news again for the same topic to see duplicate detection in action

## 8. Troubleshooting

### Common Issues:

1. **"Interest ID not found"**: Check that the topic name matches exactly with the mapping
2. **"Failed to save to database"**: Verify your Supabase credentials and table schema
3. **CORS errors**: Make sure your API endpoint is properly configured

### Debug Logs:

The application logs all Supabase operations to the browser console:
- `💾 Processing X articles for topic:`
- `🔍 Checking for duplicates...`
- `📊 Found X existing articles in database`
- `✨ X new articles to save (X duplicates filtered out)`
- `💾 Bulk inserting X new articles...`
- `✅ Bulk save completed:` with detailed statistics
- `❌ Error saving to Supabase:`
