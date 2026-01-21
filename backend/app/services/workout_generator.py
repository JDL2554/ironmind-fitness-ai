from app.core.splits import SPLITS
from app.core.rest_rules import REST_RULES
from app.services.schedule_builder import build_week


VOLUME_TO_DAYS = {
    "1-2": 2,
    "3-4": 4,
    "5-6": 6,
    "7": 7,
}

def pick_split(experience_level: str, workout_volume: str, goals: list[str], equipment: str) -> str:
    """
    Baseline logic (π0). Keep it simple for now.
    You can make this smarter later (or RL).
    """
    days = VOLUME_TO_DAYS.get(workout_volume, 4)

    # super simple baseline choices
    if days <= 2:
        return "full_body"
    if days == 3:
        return "fb_eod"
    if days == 4:
        return "upper_lower"
    if days >= 5:
        return "ppl"

    return "upper_lower"


def generate_plan(experience_level: str, workout_volume: str, goals: list[str], equipment: str):
    days_per_week = VOLUME_TO_DAYS.get(workout_volume, 4)

    split_name = pick_split(experience_level, workout_volume, goals, equipment)

    split = SPLITS[split_name]
    cycle = split["cycle"]
    rest_rule = REST_RULES.get(split_name, "as_needed")

    week = build_week(cycle=cycle, days_per_week=days_per_week, rest_rule=rest_rule)

    return {
        "days_per_week": days_per_week,
        "split": split_name,
        "equipment": equipment,
        "goals": goals,
        "rest_rule": rest_rule,
        "week": week,   # <-- includes rest days properly
    }
