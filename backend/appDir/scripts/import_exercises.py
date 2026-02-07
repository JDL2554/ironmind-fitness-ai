import json
import os
from pathlib import Path

import psycopg2
from psycopg2.extras import execute_batch


def get_db_url() -> str:
    # Supports either DATABASE_URL or DB_URL
    db_url = os.getenv("DATABASE_URL") or os.getenv("DB_URL")
    if not db_url:
        raise RuntimeError(
            "Missing DATABASE_URL (or DB_URL). Set it to your Postgres connection string.\n"
            "Example (local): postgresql://ironmind:password@localhost:5432/ironmind_db"
        )
    return db_url


def load_exercises_json(json_path: Path) -> list[dict]:
    if not json_path.exists():
        raise FileNotFoundError(f"Could not find exercises json at: {json_path}")

    with json_path.open("r", encoding="utf-8") as f:
        data = json.load(f)

    if not isinstance(data, list):
        raise ValueError("exercises.json must be a JSON array of objects.")
    return data


def normalize_exercise(row: dict) -> dict:
    # Your dataset has these keys: id, name, level, category, equipment, force, mechanic, primaryMuscles, secondaryMuscles
    ex_id = row.get("id")
    name = row.get("name")

    if not ex_id or not name:
        raise ValueError(f"Bad exercise row missing id/name: {row}")

    primary = row.get("primaryMuscles") or []
    secondary = row.get("secondaryMuscles") or []

    # Ensure arrays are lists of strings
    primary = [str(x) for x in primary if x is not None]
    secondary = [str(x) for x in secondary if x is not None]

    return {
        "id": str(ex_id),
        "name": str(name),
        "level": row.get("level"),
        "category": row.get("category"),
        "equipment": row.get("equipment"),
        "force": row.get("force"),
        "mechanic": row.get("mechanic"),
        "primary_muscles": primary,
        "secondary_muscles": secondary,
    }


def main():
    # Adjust this if your file is in a different location
    # This path assumes: backend/app/data/exercises.json
    base_dir = Path(__file__).resolve().parents[1]  # .../backend/app
    json_path = base_dir / "data" / "exercises.json"

    db_url = get_db_url()
    exercises_raw = load_exercises_json(json_path)

    exercises = []
    for r in exercises_raw:
        try:
            exercises.append(normalize_exercise(r))
        except Exception as e:
            print(f"Skipping bad row: {e}")

    print(f"Loaded {len(exercises)} valid exercises from {json_path}")

    insert_sql = """
    INSERT INTO exercises (
      id, name, level, category, equipment, force, mechanic, primary_muscles, secondary_muscles
    )
    VALUES (
      %(id)s, %(name)s, %(level)s, %(category)s, %(equipment)s, %(force)s, %(mechanic)s,
      %(primary_muscles)s, %(secondary_muscles)s
    )
    ON CONFLICT (id) DO UPDATE SET
      name = EXCLUDED.name,
      level = EXCLUDED.level,
      category = EXCLUDED.category,
      equipment = EXCLUDED.equipment,
      force = EXCLUDED.force,
      mechanic = EXCLUDED.mechanic,
      primary_muscles = EXCLUDED.primary_muscles,
      secondary_muscles = EXCLUDED.secondary_muscles;
    """

    conn = psycopg2.connect(db_url)
    try:
        conn.autocommit = False
        with conn.cursor() as cur:
            execute_batch(cur, insert_sql, exercises, page_size=500)
        conn.commit()
        print(f"✅ Inserted/updated {len(exercises)} exercises into Postgres.")
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


if __name__ == "__main__":
    main()
