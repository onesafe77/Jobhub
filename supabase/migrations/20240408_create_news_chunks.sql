-- Create a table for article chunks
CREATE TABLE IF NOT EXISTS news_content_chunks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES cpns_bumn_posts(id) ON DELETE CASCADE,
  content text NOT NULL,
  embedding vector(1536),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE news_content_chunks ENABLE ROW LEVEL SECURITY;

-- Allow public read access (assuming posts are public)
CREATE POLICY "Allow public read access to news_chunks" 
ON news_content_chunks FOR SELECT 
TO public 
USING (true);

-- Create index for vector similarity search
CREATE INDEX ON news_content_chunks USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- RPC function to search news chunks
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
  -- Join metadata from the parent post
  url text,
  author text,
  caption text
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
    cpns_bumn_posts.caption
  FROM news_content_chunks
  JOIN cpns_bumn_posts ON news_content_chunks.post_id = cpns_bumn_posts.id
  WHERE 1 - (news_content_chunks.embedding <=> query_embedding) > match_threshold
  ORDER BY news_content_chunks.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
