import json
import os
from typing import Any

exercises_data: list[dict[str, Any]] = []
muscle_groups_data: list[dict[str, str]] = []

def extract_muscle_groups_from_exercises(exercises):
    muscle_groups = set()
    for exercise in exercises:
        for m in exercise.get("primaryMuscles", []):
            muscle_groups.add(m)
        for m in exercise.get("secondaryMuscles", []):
            muscle_groups.add(m)
    return [{"name": m} for m in sorted(muscle_groups)]

def load_exercise_data():
    global exercises_data, muscle_groups_data

    base_dir = os.path.dirname(os.path.abspath(__file__))  # .../services
    data_path = os.path.join(base_dir, "..", "data", "exercises.json")
    data_path = os.path.abspath(data_path)

    with open(data_path, "r", encoding="utf-8") as f:
        exercises_data = json.load(f)

    muscle_groups_data = extract_muscle_groups_from_exercises(exercises_data)
    print(f"Loaded {len(exercises_data)} exercises")
    print(f"Extracted {len(muscle_groups_data)} muscle groups")
