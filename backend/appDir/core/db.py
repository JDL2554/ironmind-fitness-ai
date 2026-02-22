import psycopg2
from psycopg2.extras import RealDictCursor
from .config import DATABASE_URL

def get_conn():
    return psycopg2.connect(DATABASE_URL, cursor_factory=RealDictCursor)

def init_db():
    # Simple schema init (no Alembic yet). You can upgrade later.
    conn = get_conn()
    cur = conn.cursor()

    cur.execute("""
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      age INT NOT NULL,
      height TEXT NOT NULL,
      weight REAL NOT NULL,
      experience_level TEXT NOT NULL,
      workout_volume TEXT NOT NULL,
      goals JSONB NOT NULL,
      equipment TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    """)

    cur.execute("""
    CREATE TABLE IF NOT EXISTS workouts (
      id SERIAL PRIMARY KEY,
      user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      plan JSONB NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    """)

    cur.execute("""
    CREATE TABLE IF NOT EXISTS feedback (
      id SERIAL PRIMARY KEY,
      user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      workout_id INT NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
      rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
      difficulty TEXT,
      notes TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    """)

    cur.execute("""
    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS profile_image_url TEXT;
    """)

    cur.execute("""
    DO $$
    BEGIN
        IF NOT EXISTS (
            SELECT 1 FROM pg_type WHERE typname = 'relationship_status'
        ) THEN
            CREATE TYPE relationship_status AS ENUM (
                'pending',
                'accepted',
                'blocked'
            );
        END IF;
    END
    $$;
    """)

    cur.execute("""
    CREATE TABLE IF NOT EXISTS user_relationships (
        user_low BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        user_high BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        initiated_by BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        status relationship_status NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        PRIMARY KEY (user_low, user_high),
        CONSTRAINT no_self CHECK (user_low < user_high),
        CONSTRAINT initiator_in_pair CHECK (
            initiated_by = user_low OR initiated_by = user_high
        )
    );
    """)

    cur.execute("""
    CREATE INDEX IF NOT EXISTS idx_user_relationships_status
    ON user_relationships(status);
    """)

    conn.commit()
    cur.close()
    conn.close()
