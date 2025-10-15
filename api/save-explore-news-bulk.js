// API endpoint to save news articles to Supabase explore_news table with duplicate checking
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
        const { articles, topic_name, interest_id } = req.body;

        // Validate required fields
        if (!articles || !Array.isArray(articles) || articles.length === 0) {
            return res.status(400).json({ 
                error: 'Missing required field: articles array is required' 
            });
        }

        if (!interest_id) {
            return res.status(400).json({ 
                error: 'Missing required field: interest_id is required' 
            });
        }

        console.log(`💾 Processing ${articles.length} articles for topic: ${topic_name} with interest ID: ${interest_id}`);

        // Validate each article has required fields
        const validArticles = articles.filter(article => {
            return article.interest_id && article.title && article.link && article.source;
        });

        if (validArticles.length === 0) {
            return res.status(400).json({ 
                error: 'No valid articles found. Each article must have interest_id, title, link, and source' 
            });
        }

        console.log(`✅ ${validArticles.length} valid articles to process out of ${articles.length} total`);

        // Step 1: Check for existing articles to avoid duplicates
        console.log('🔍 Checking for duplicates...');
        
        // Get all article links for this interest to check for duplicates
        const articleLinks = validArticles.map(article => article.link).filter(link => link);
        
        if (articleLinks.length === 0) {
            return res.status(400).json({ 
                error: 'No valid article links found for duplicate checking' 
            });
        }

        // Query existing articles by links for this interest
        const { data: existingArticles, error: queryError } = await supabase
            .from('explore_news')
            .select('link, title')
            .eq('interest_id', interest_id)
            .in('link', articleLinks);

        if (queryError) {
            console.error('❌ Error querying existing articles:', queryError);
            return res.status(500).json({ 
                error: 'Failed to check for duplicates',
                details: queryError.message 
            });
        }

        // Create a set of existing links for quick lookup
        const existingLinks = new Set(existingArticles.map(article => article.link));
        console.log(`📊 Found ${existingLinks.size} existing articles in database`);

        // Filter out duplicates
        const newArticles = validArticles.filter(article => {
            const isDuplicate = existingLinks.has(article.link);
            if (isDuplicate) {
                console.log(`🚫 Duplicate found: ${article.title} (${article.link})`);
            }
            return !isDuplicate;
        });

        console.log(`✨ ${newArticles.length} new articles to save (${validArticles.length - newArticles.length} duplicates filtered out)`);

        if (newArticles.length === 0) {
            return res.status(200).json({
                success: true,
                message: 'All articles already exist in database',
                total_processed: validArticles.length,
                new_articles: 0,
                duplicates_found: validArticles.length,
                successfully_saved: 0,
                errors: []
            });
        }

        // Step 2: Bulk insert new articles
        console.log(`💾 Bulk inserting ${newArticles.length} new articles...`);

        // Get the current highest sort_order for this interest to maintain proper ordering
        const { data: lastArticle, error: sortError } = await supabase
            .from('explore_news')
            .select('sort_order')
            .eq('interest_id', interest_id)
            .order('sort_order', { ascending: false })
            .limit(1)
            .single();

        let nextSortOrder = 0;
        if (!sortError && lastArticle) {
            nextSortOrder = lastArticle.sort_order + 1;
        }

        // Update sort_order for new articles
        const articlesWithSortOrder = newArticles.map((article, index) => ({
            ...article,
            sort_order: nextSortOrder + index
        }));

        const { data: insertedData, error: insertError } = await supabase
            .from('explore_news')
            .insert(articlesWithSortOrder)
            .select();

        if (insertError) {
            console.error('❌ Supabase insert error:', insertError);
            return res.status(500).json({ 
                error: 'Failed to save articles to database',
                details: insertError.message 
            });
        }

        console.log(`✅ Successfully saved ${insertedData.length} articles to Supabase`);

        return res.status(200).json({
            success: true,
            message: `Successfully processed ${validArticles.length} articles`,
            total_processed: validArticles.length,
            new_articles: newArticles.length,
            duplicates_found: validArticles.length - newArticles.length,
            successfully_saved: insertedData.length,
            errors: [],
            topic_name: topic_name,
            interest_id: interest_id
        });

    } catch (error) {
        console.error('❌ Server error:', error);
        return res.status(500).json({ 
            error: 'Internal server error',
            details: error.message 
        });
    }
}
