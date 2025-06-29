import express from 'express';
import dotenv from 'dotenv';
import healthRouter from './routes/health.js';
import apiRouter from './routes/api.js';
import rootRouter from './routes/root.js';

dotenv.config();

const app = express();

app.use(express.json());

// Mount routes
app.use('/', rootRouter);
app.use('/api', healthRouter);
app.use('/api', apiRouter);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`✅ Content Extraction API running on port ${port}`);
});
