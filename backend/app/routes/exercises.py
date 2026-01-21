from fastapi import APIRouter, HTTPException, Query
from app.services.exercise_store import exercises_data, muscle_groups_data
import random

router = APIRouter()

@router.get("/health")
def health():
    return {
        "status": "healthy",
        "exercises_loaded": len(exercises_data) > 0,
        "total_exercises": len(exercises_data),
        "total_muscle_groups": len(muscle_groups_data),
    }

@router.get("/exercises")
def get_all_exercises(page: int = 1, per_page: int = 50):
    if not exercises_data:
        raise HTTPException(status_code=500, detail="Exercise data not loaded")

    start = (page - 1) * per_page
    end = start + per_page

    return {
        "exercises": exercises_data[start:end],
        "total": len(exercises_data),
        "page": page,
        "per_page": per_page,
        "has_more": end < len(exercises_data),
    }

@router.get("/exercises/search")
def search_exercises(
        q: str = "",
        muscle: str = "",
        equipment: str = "",
        category: str = "",
        limit: int = Query(20, ge=1, le=200),
):
    if not exercises_data:
        raise HTTPException(status_code=500, detail="Exercise data not loaded")

    q = q.lower().strip()
    muscle = muscle.lower().strip()
    equipment = equipment.lower().strip()
    category = category.lower().strip()

    results = []

    for ex in exercises_data:
        match = True

        if q:
            name_match = q in ex.get("name", "").lower()
            inst_match = any(q in inst.lower() for inst in ex.get("instructions", []))
            if not (name_match or inst_match):
                match = False

        if muscle and match:
            primary = [m.lower() for m in ex.get("primaryMuscles", [])]
            secondary = [m.lower() for m in ex.get("secondaryMuscles", [])]
            if muscle not in primary and muscle not in secondary:
                match = False

        if equipment and match:
            ex_eq = (ex.get("equipment") or "").lower()
            if equipment not in ex_eq:
                match = False

        if category and match:
            ex_cat = (ex.get("category") or "").lower()
            if category not in ex_cat:
                match = False

        if match:
            results.append(ex)
            if len(results) >= limit:
                break

    return {
        "exercises": results,
        "total_found": len(results),
        "filters": {"q": q, "muscle": muscle, "equipment": equipment, "category": category},
    }

@router.get("/muscle-groups")
def get_muscle_groups():
    return {"muscle_groups": muscle_groups_data, "total": len(muscle_groups_data)}

@router.get("/exercises/by-muscle/{muscle_name}")
def get_exercises_by_muscle(muscle_name: str):
    if not exercises_data:
        raise HTTPException(status_code=500, detail="Exercise data not loaded")

    m = muscle_name.lower()
    matches = []

    for ex in exercises_data:
        primary = [x.lower() for x in ex.get("primaryMuscles", [])]
        secondary = [x.lower() for x in ex.get("secondaryMuscles", [])]
        if m in primary or m in secondary:
            matches.append(ex)

    return {"exercises": matches, "muscle": m, "total": len(matches)}

@router.get("/exercises/random")
def get_random_exercises(count: int = Query(5, ge=1, le=50)):
    if not exercises_data:
        raise HTTPException(status_code=500, detail="Exercise data not loaded")

    count = min(count, len(exercises_data))
    return {"exercises": random.sample(exercises_data, count), "count": count}

@router.get("/exercises/stats")
def get_exercise_stats():
    if not exercises_data:
        raise HTTPException(status_code=500, detail="Exercise data not loaded")

    categories = {}
    equipment_types = {}
    muscle_groups = {}

    for ex in exercises_data:
        cat = ex.get("category", "Unknown")
        categories[cat] = categories.get(cat, 0) + 1

        eq = ex.get("equipment", "Unknown")
        equipment_types[eq] = equipment_types.get(eq, 0) + 1

        for m in ex.get("primaryMuscles", []):
            muscle_groups[m] = muscle_groups.get(m, 0) + 1

    return {
        "total_exercises": len(exercises_data),
        "categories": categories,
        "equipment_types": equipment_types,
        "primary_muscle_distribution": muscle_groups,
    }
