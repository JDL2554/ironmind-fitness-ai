# db.py
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv
load_dotenv()

def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])

def init_db():
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
      weight DOUBLE PRECISION NOT NULL,
      experience_level TEXT NOT NULL,
      workout_volume TEXT NOT NULL,
      goals JSONB NOT NULL,
      equipment TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    """)
    conn.commit()
    cur.close()
    conn.close()
