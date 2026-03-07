-- Add year column to cpns_bumn_posts
ALTER TABLE cpns_bumn_posts ADD COLUMN IF NOT EXISTS year integer DEFAULT 2026;

-- Update existing records to 2026
UPDATE cpns_bumn_posts SET year = 2026 WHERE year IS NULL;

-- Update match_news_chunks to include year in the return table
CREATE OR REPLACE FUNCTION match_news_chunks (
  query_embedding vector(1536),
  match_threshold float,
  match_count int
)
RETURNS TABLE (
  id uuid,
  post_id uuid,
  content text,
  similarity float,
  url text,
  author text,
  caption text,
  year integer
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    news_content_chunks.id,
    news_content_chunks.post_id,
    news_content_chunks.content,
    1 - (news_content_chunks.embedding <=> query_embedding) AS similarity,
    cpns_bumn_posts.url,
    cpns_bumn_posts.author,
    cpns_bumn_posts.caption,
    cpns_bumn_posts.year
  FROM news_content_chunks
  JOIN cpns_bumn_posts ON news_content_chunks.post_id = cpns_bumn_posts.id
  WHERE 1 - (news_content_chunks.embedding <=> query_embedding) > match_threshold
  ORDER BY news_content_chunks.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
