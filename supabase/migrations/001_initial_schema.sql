-- PIGMENT v4 Supabase Schema
-- Run this in your Supabase SQL editor

-- Enable vector extension for semantic search
CREATE EXTENSION IF NOT EXISTS vector;

-- Evolution metadata storage
CREATE TABLE IF NOT EXISTS evolution_runs (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    session_id UUID NOT NULL DEFAULT gen_random_uuid(),
    target_image_hash TEXT,
    target_image_url TEXT,
    start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_time TIMESTAMP WITH TIME ZONE,
    generations_completed INT DEFAULT 0,
    best_fitness FLOAT DEFAULT 0,
    polygon_count INT DEFAULT 50,
    algorithm_used TEXT DEFAULT 'multi-objective',
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Semantic embeddings (384-dim gte-small)
CREATE TABLE IF NOT EXISTS image_embeddings (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    evolution_run_id BIGINT REFERENCES evolution_runs(id) ON DELETE CASCADE,
    generation INT DEFAULT 0,
    fitness FLOAT DEFAULT 0,
    image_data TEXT,
    embedding VECTOR(384),
    aesthetic_score FLOAT DEFAULT 0,
    style_category TEXT DEFAULT 'unknown',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS embedding_cosine_idx ON image_embeddings USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- ML training data
CREATE TABLE IF NOT EXISTS training_data (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    feature_vector JSONB DEFAULT '{}'::jsonb,
    target_fitness FLOAT DEFAULT 0,
    mutation_success BOOLEAN DEFAULT false,
    parent_fitness FLOAT DEFAULT 0,
    offspring_fitness FLOAT DEFAULT 0,
    operator_used TEXT,
    style_category TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RL Q-table for mutation selection
CREATE TABLE IF NOT EXISTS rl_q_table (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    state_key TEXT NOT NULL,
    action_values JSONB DEFAULT '{}'::jsonb,
    update_count INT DEFAULT 0,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(state_key)
);

-- User feedback for reinforcement learning
CREATE TABLE IF NOT EXISTS user_feedback (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    evolution_run_id BIGINT REFERENCES evolution_runs(id) ON DELETE SET NULL,
    image_embedding_id BIGINT REFERENCES image_embeddings(id) ON DELETE SET NULL,
    user_rating INT CHECK (user_rating >= 1 AND user_rating <= 5),
    user_comments TEXT,
    preferred_over_previous BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Model checkpoints
CREATE TABLE IF NOT EXISTS model_checkpoints (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    model_name TEXT NOT NULL,
    model_version TEXT DEFAULT '1.0',
    model_weights_url TEXT,
    accuracy FLOAT DEFAULT 0,
    training_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    training_data_count INT DEFAULT 0,
    is_active BOOLEAN DEFAULT false,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Vector similarity search function
CREATE OR REPLACE FUNCTION match_embeddings(
    query_embedding VECTOR(384),
    match_threshold FLOAT DEFAULT 0.7,
    match_count INT DEFAULT 10
)
RETURNS TABLE (
    id BIGINT,
    fitness FLOAT,
    style_category TEXT,
    generation INT,
    similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT e.id, e.fitness, e.style_category, e.generation,
           1 - (e.embedding <=> query_embedding) as similarity
    FROM image_embeddings e
    WHERE 1 - (e.embedding <=> query_embedding) > match_threshold
    ORDER BY e.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;

-- Enable Row Level Security
ALTER TABLE evolution_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE image_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE rl_q_table ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_feedback ENABLE ROW LEVEL SECURITY;

-- Public read/write policies (adjust for production)
CREATE POLICY "Allow all" ON evolution_runs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON image_embeddings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON training_data FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON rl_q_table FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON user_feedback FOR ALL USING (true) WITH CHECK (true);