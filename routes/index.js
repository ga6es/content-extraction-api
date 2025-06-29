import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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