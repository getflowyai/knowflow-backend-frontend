// Simple API endpoint for saving news to Supabase
const { createClient } = require('@supabase/supabase-js');
const supabaseConfig = require('../supabase-config-simple');

// Supabase configuration - you'll need to replace these with your actual values
const supabaseUrl = process.env.SUPABASE_URL || supabaseConfig.url;
const supabaseKey = process.env.SUPABASE_ANON_KEY || supabaseConfig.anonKey;

const supabase = createClient(supabaseUrl, supabaseKey);

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

module.exports = async (req, res) => {
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

        // Check for existing articles to avoid duplicates
        console.log('🔍 Checking for duplicates...');
        
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

        // Get the current highest sort_order for this interest
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

        // Bulk insert new articles
        console.log(`💾 Bulk inserting ${newArticles.length} new articles...`);

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
};
