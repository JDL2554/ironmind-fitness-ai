def build_week(cycle: list[str], days_per_week: int, rest_rule: str):
    schedule = []
    cycle_idx = 0

    for day in range(1, 8):
        if len([d for d in schedule if d["type"] == "train"]) >= days_per_week:
            schedule.append({"day": day, "type": "rest"})
            continue

        if rest_rule == "every_other_day" and schedule and schedule[-1]["type"] == "train":
            schedule.append({"day": day, "type": "rest"})
            continue

        schedule.append({
            "day": day,
            "type": "train",
            "focus": cycle[cycle_idx % len(cycle)]
        })
        cycle_idx += 1

    return schedule
