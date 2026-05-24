-- Enable pgvector extension on Neon
-- Run once per database. Safe to re-run (IF NOT EXISTS).
CREATE EXTENSION IF NOT EXISTS vector;
