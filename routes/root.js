import express from 'express';

const router = express.Router();

// Serve a simple live message for the root route
router.get('/', (req, res) => {
    res.json({ 
        status: 'live',
        message: 'Content Extraction API is running',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

export default router;