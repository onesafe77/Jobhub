-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Add embedding column to cpns_bumn_posts
ALTER TABLE cpns_bumn_posts ADD COLUMN IF NOT EXISTS embedding vector(1536);

-- Create a function to search for posts using vector similarity
CREATE OR REPLACE FUNCTION match_cpns_posts (
  query_embedding vector(1536),
  match_threshold float,
  match_count int
)
RETURNS TABLE (
  id uuid,
  caption text,
  url text,
  author text,
  "timestamp" timestamptz,
  image_url text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    cpns_bumn_posts.id,
    cpns_bumn_posts.caption,
    cpns_bumn_posts.url,
    cpns_bumn_posts.author,
    cpns_bumn_posts.timestamp,
    cpns_bumn_posts.image_url,
    1 - (cpns_bumn_posts.embedding <=> query_embedding) AS similarity
  FROM cpns_bumn_posts
  WHERE 1 - (cpns_bumn_posts.embedding <=> query_embedding) > match_threshold
  ORDER BY cpns_bumn_posts.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
