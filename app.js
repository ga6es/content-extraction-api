import express from 'express';
import dotenv from 'dotenv';
import indexRouter from './routes/index.js';
import apiRouter from './routes/api.js';

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mount routes
app.use('/', indexRouter);
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
