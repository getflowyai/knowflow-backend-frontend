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

Make sure your Supabase `explore` table has the following columns:

```sql
CREATE TABLE explore (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    interest_id UUID NOT NULL,
    topic_name VARCHAR(255) NOT NULL,
    articles_count INTEGER DEFAULT 0,
    timeframe VARCHAR(50),
    total_articles INTEGER DEFAULT 0,
    articles_data JSONB,
    generated_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
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
3. **Sends** the data to `/api/save-explore` endpoint
4. **Backend** saves the data to Supabase explore table
5. **No login required** - uses anon key for public access

## 5. Data Structure

The following data is saved to the explore table:

```javascript
{
    interest_id: "46a4ed1c-0f5a-4775-ad72-28b9ec252000", // AI interest ID
    topic_name: "AI",
    articles_count: 10,
    timeframe: "7d",
    total_articles: 10,
    articles_data: [...], // Array of all article objects
    generated_at: "2024-01-15T10:30:00.000Z",
    created_at: "2024-01-15T10:30:00.000Z"
}
```

## 6. Testing

1. Update your Supabase configuration
2. Deploy your application
3. Generate news for any topic
4. Check your Supabase explore table for the saved data
5. Check browser console for success/error logs

## 7. Troubleshooting

### Common Issues:

1. **"Interest ID not found"**: Check that the topic name matches exactly with the mapping
2. **"Failed to save to database"**: Verify your Supabase credentials and table schema
3. **CORS errors**: Make sure your API endpoint is properly configured

### Debug Logs:

The application logs all Supabase operations to the browser console:
- `💾 Saving news to Supabase for topic:`
- `✅ Successfully saved to Supabase:`
- `❌ Error saving to Supabase:`
