import dotenv from 'dotenv';
dotenv.config();

console.log('DEBUG - SUPABASE_URL:', process.env.SUPABASE_URL);
console.log('DEBUG - SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY);
console.log('DEBUG - OPENAI_API_KEY:', process.env.OPENAI_API_KEY);
console.log('DEBUG - EXTRACTION_API_KEY:', process.env.EXTRACTION_API_KEY);
console.log('DEBUG - PORT:', process.env.PORT);

import express from 'express';
import rootRouter from './routes/root.js';
import apiRouter from './routes/api.js';

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mount routes
app.use('/', rootRouter);
app.use('/api', apiRouter);

// 404 handler - must be after all routes
app.use('*', (req, res) => {
  res.status(404).json({ error: "Not Found" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal Server Error';
  
  res.status(statusCode).json({
    error: message,
    timestamp: new Date().toISOString()
  });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`✅ Content Extraction API running on port ${port}`);
});