// API endpoint to save news to Supabase explore table
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
        const {
            interest_id,
            topic_name,
            articles_count,
            timeframe,
            total_articles,
            articles_data,
            generated_at,
            created_at
        } = req.body;

        // Validate required fields
        if (!interest_id || !topic_name) {
            return res.status(400).json({ 
                error: 'Missing required fields: interest_id and topic_name are required' 
            });
        }

        console.log('💾 Saving to Supabase explore table:', {
            interest_id,
            topic_name,
            articles_count,
            timeframe
        });

        // Insert data into Supabase explore table
        const { data, error } = await supabase
            .from('explore')
            .insert([
                {
                    interest_id,
                    topic_name,
                    articles_count,
                    timeframe,
                    total_articles,
                    articles_data,
                    generated_at,
                    created_at
                }
            ])
            .select();

        if (error) {
            console.error('❌ Supabase error:', error);
            return res.status(500).json({ 
                error: 'Failed to save to database',
                details: error.message 
            });
        }

        console.log('✅ Successfully saved to Supabase:', data);

        return res.status(200).json({
            success: true,
            message: 'News saved to explore table successfully',
            data: data[0]
        });

    } catch (error) {
        console.error('❌ Server error:', error);
        return res.status(500).json({ 
            error: 'Internal server error',
            details: error.message 
        });
    }
}
