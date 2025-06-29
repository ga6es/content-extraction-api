import express from 'express';
import { extractContentFromRawArticles } from '../services/contentExtraction.js';

const router = express.Router();

// Middleware to check API key
const authenticateApiKey = (req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    const expectedApiKey = process.env.EXTRACTION_API_KEY;

    if (!expectedApiKey) {
        return res.status(500).json({ 
            error: 'Server configuration error: API key not configured' 
        });
    }

    if (!apiKey) {
        return res.status(401).json({ 
            error: 'Missing API key. Please provide x-api-key header.' 
        });
    }

    if (apiKey !== expectedApiKey) {
        return res.status(403).json({ 
            error: 'Invalid API key' 
        });
    }

    next();
};

// POST route for content extraction
router.post('/trigger-content-extraction', authenticateApiKey, async (req, res) => {
    try {
        const { articles } = req.body;

        if (!articles || !Array.isArray(articles)) {
            return res.status(400).json({
                error: 'Invalid request body. Expected an array of articles.'
            });
        }

        if (articles.length === 0) {
            return res.status(400).json({
                error: 'No articles provided for extraction.'
            });
        }

        console.log(`Processing ${articles.length} articles for content extraction...`);

        const result = await extractContentFromRawArticles(articles);

        res.json({
            success: true,
            message: 'Content extraction completed successfully',
            processed: articles.length,
            result: result,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Content extraction error:', error);
        
        res.status(500).json({
            error: 'Content extraction failed',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Health check endpoint
router.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        environment: {
            supabase: !!process.env.SUPABASE_URL,
            openai: !!process.env.OPENAI_API_KEY,
            apiKey: !!process.env.EXTRACTION_API_KEY
        }
    });
});

export default router;