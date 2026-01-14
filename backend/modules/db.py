# db.py
import sqlite3
from pathlib import Path

DB_PATH = Path(__file__).with_name("ironmind.db")

def get_conn() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db() -> None:
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        password_hash TEXT NOT NULL,
        age INTEGER NOT NULL,
        height TEXT NOT NULL,
        weight REAL NOT NULL,
        experience_level TEXT NOT NULL,
        workout_volume TEXT NOT NULL,
        goals TEXT NOT NULL,
        equipment TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    """)
    conn.commit()
    conn.close()
