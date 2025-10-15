// API endpoint to save news articles to Supabase explore_news table
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_CONFIG } from '../supabase-config.js';

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL || SUPABASE_CONFIG.url;
const supabaseKey = process.env.SUPABASE_ANON_KEY || SUPABASE_CONFIG.anonKey;

const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { articles, topic_name } = req.body;

        // Validate required fields
        if (!articles || !Array.isArray(articles) || articles.length === 0) {
            return res.status(400).json({ 
                error: 'Missing required field: articles array is required' 
            });
        }

        console.log(`💾 Saving ${articles.length} articles to Supabase explore_news table for topic: ${topic_name}`);

        // Validate each article has required fields
        const validArticles = articles.filter(article => {
            return article.interest_id && article.title && article.link && article.source;
        });

        if (validArticles.length === 0) {
            return res.status(400).json({ 
                error: 'No valid articles found. Each article must have interest_id, title, link, and source' 
            });
        }

        console.log(`✅ ${validArticles.length} valid articles to save out of ${articles.length} total`);

        // Insert articles into Supabase explore_news table
        const { data, error } = await supabase
            .from('explore_news')
            .insert(validArticles)
            .select();

        if (error) {
            console.error('❌ Supabase error:', error);
            return res.status(500).json({ 
                error: 'Failed to save articles to database',
                details: error.message 
            });
        }

        console.log('✅ Successfully saved articles to Supabase:', data.length, 'articles');

        return res.status(200).json({
            success: true,
            message: `Successfully saved ${data.length} articles to explore_news table`,
            saved_count: data.length,
            topic_name: topic_name,
            articles_saved: data.length,
            total_attempted: articles.length
        });

    } catch (error) {
        console.error('❌ Server error:', error);
        return res.status(500).json({ 
            error: 'Internal server error',
            details: error.message 
        });
    }
}
