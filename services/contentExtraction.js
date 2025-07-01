import dotenv from 'dotenv';
dotenv.config();

console.log("DEBUG - SUPABASE_URL in service:", process.env.SUPABASE_URL);
console.log("DEBUG - SUPABASE_SERVICE_ROLE_KEY in service:", process.env.SUPABASE_SERVICE_ROLE_KEY);

import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase configuration. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Initialize OpenAI client
const openaiApiKey = process.env.OPENAI_API_KEY;

if (!openaiApiKey) {
    throw new Error('Missing OpenAI configuration. Please set OPENAI_API_KEY environment variable.');
}

const openai = new OpenAI({
    apiKey: openaiApiKey,
});

/**
 * Extract content from raw articles using OpenAI and store in Supabase
 * @param {Array} rawArticles - Array of raw article objects
 * @returns {Object} - Extraction results
 */
export async function extractContentFromRawArticles(rawArticles) {
    const results = {
        processed: 0,
        successful: 0,
        failed: 0,
        errors: []
    };

    console.log(`Starting content extraction for ${rawArticles.length} articles...`);

    for (const article of rawArticles) {
        try {
            results.processed++;

            // Validate article structure
            if (!article.content && !article.text && !article.body) {
                throw new Error('Article missing content field');
            }

            const content = article.content || article.text || article.body;
            
            // Extract structured content using OpenAI
            const extractedContent = await extractWithOpenAI(content, article);

            // Store in Supabase
            await storeExtractedContent(article, extractedContent);

            results.successful++;
            console.log(`Successfully processed article ${results.processed}/${rawArticles.length}`);

        } catch (error) {
            results.failed++;
            results.errors.push({
                articleId: article.id || `article_${results.processed}`,
                error: error.message
            });
            console.error(`Failed to process article ${results.processed}:`, error.message);
        }
    }

    console.log(`Content extraction completed. Success: ${results.successful}, Failed: ${results.failed}`);
    return results;
}

/**
 * Extract structured content using OpenAI
 * @param {string} content - Raw article content
 * @param {Object} article - Original article object
 * @returns {Object} - Extracted structured content
 */
async function extractWithOpenAI(content, article) {
    const prompt = `
Extract the following information from this article content and return it as a JSON object:

1. title: The main title/headline
2. summary: A concise 2-3 sentence summary
3. key_points: Array of 3-5 main points or takeaways
4. entities: Array of important people, places, organizations mentioned
5. sentiment: Overall sentiment (positive, negative, neutral)
6. category: Suggested category/topic for the article
7. tags: Array of relevant tags/keywords

Article content:
${content.substring(0, 4000)}...

Return only valid JSON without any additional text or formatting.
`;

    const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
            {
                role: "system",
                content: "You are a content extraction specialist. Extract structured information from articles and return only valid JSON."
            },
            {
                role: "user",
                content: prompt
            }
        ],
        max_tokens: 1000,
        temperature: 0.3
    });

    const extractedText = response.choices[0].message.content.trim();
    
    try {
        return JSON.parse(extractedText);
    } catch (parseError) {
        console.warn('Failed to parse OpenAI response as JSON, using fallback extraction');
        return {
            title: article.title || 'Untitled',
            summary: content.substring(0, 200) + '...',
            key_points: [],
            entities: [],
            sentiment: 'neutral',
            category: 'general',
            tags: []
        };
    }
}

/**
 * Store extracted content in Supabase
 * @param {Object} originalArticle - Original article data
 * @param {Object} extractedContent - Extracted structured content
 */
async function storeExtractedContent(originalArticle, extractedContent) {
    const articleData = {
        external_id: originalArticle.external_id,
        title: extractedContent.title,
        summary: extractedContent.summary,
        url: originalArticle.url,
        content: originalArticle.content || originalArticle.text || originalArticle.body,
        extraction_status: "success",
        extraction_error: null,
        published_at: new Date().toISOString(),
        source: originalArticle.source || null,
        created_at: new Date().toISOString()
    };

    console.log("DEBUG - Payload to insert:", articleData);

    const { data, error } = await supabase
        .from('raw_articles')
        .insert([articleData]);

    console.log("DEBUG - Supabase insert result:", { data, error });

    if (error) {
        throw new Error(`Supabase storage error: ${JSON.stringify(error)}`);
    }

    return data;
}