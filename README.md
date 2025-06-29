# Content Extraction API

A Node.js web application with content extraction capabilities using OpenAI and Supabase.

![static-site](public/images/static-site.png)

## Features

- **ESM Module Support**: Modern JavaScript with ES6 imports
- **Content Extraction API**: Extract structured content from raw articles using OpenAI
- **Supabase Integration**: Store extracted content in Supabase database
- **API Key Authentication**: Secure API endpoints with custom API keys
- **Railway Ready**: Configured for easy deployment on Railway

## API Endpoints

### GET `/`
Returns a simple live status message.

**Response:**
```json
{
  "status": "live",
  "message": "Content Extraction API is running",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "version": "1.0.0"
}
```

### POST `/api/trigger-content-extraction`
Extract structured content from raw articles.

**Headers:**
- `x-api-key`: Your extraction API key
- `Content-Type`: application/json

**Request Body:**
```json
{
  "articles": [
    {
      "id": "article_1",
      "title": "Sample Article",
      "content": "Article content here...",
      "url": "https://example.com/article"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Content extraction completed successfully",
  "processed": 1,
  "result": {
    "processed": 1,
    "successful": 1,
    "failed": 0,
    "errors": []
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### GET `/api/health`
Check API health and configuration status.

## Environment Variables

Create a `.env` file based on `.env.example`:

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
OPENAI_API_KEY=your_openai_api_key
EXTRACTION_API_KEY=your_secure_api_key_for_content_extraction
PORT=3000
```

## Database Schema

The application expects a Supabase table called `extracted_articles` with the following structure:

```sql
CREATE TABLE extracted_articles (
  id BIGSERIAL PRIMARY KEY,
  original_id TEXT,
  title TEXT,
  summary TEXT,
  key_points JSONB,
  entities JSONB,
  sentiment TEXT,
  category TEXT,
  tags JSONB,
  original_content TEXT,
  source_url TEXT,
  processed_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Local Development

1. Clone the repository
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env` and fill in your values
4. Start the server: `npm run dev`

## Deployment on Railway

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template/Abo1zu?referralCode=alphasec)

1. Connect your GitHub repository to Railway
2. Set the environment variables in Railway dashboard
3. Deploy automatically with Railway's build system

### Railway Environment Variables

Set these in your Railway project settings:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY`
- `EXTRACTION_API_KEY`

Railway will automatically set the `PORT` variable.

## Usage Example

```bash
# Test the API
curl -X POST http://localhost:3000/api/trigger-content-extraction \
  -H "Content-Type: application/json" \
  -H "x-api-key: your_api_key" \
  -d '{
    "articles": [
      {
        "id": "test_1",
        "title": "Test Article",
        "content": "This is a test article content for extraction...",
        "url": "https://example.com/test"
      }
    ]
  }'
```

## License

MIT License - see LICENSE file for details.