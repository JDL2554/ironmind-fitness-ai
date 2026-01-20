from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os

app = Flask(__name__)
CORS(app)

# Global variables to store exercise data
exercises_data = []
muscle_groups_data = []

from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate

app = Flask(__name__)
CORS(app)

app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get("DATABASE_URL")
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db = SQLAlchemy(app)
migrate = Migrate(app, db)

def extract_muscle_groups_from_exercises():
    """Extract unique muscle groups from the exercises data"""
    muscle_groups = set()

    for exercise in exercises_data:
        # Add primary muscles
        for muscle in exercise.get('primaryMuscles', []):
            muscle_groups.add(muscle)

        # Add secondary muscles
        for muscle in exercise.get('secondaryMuscles', []):
            muscle_groups.add(muscle)

    # Convert to list of dictionaries for consistency
    return [{"name": muscle} for muscle in sorted(muscle_groups)]

def load_exercise_data():
    """Load Free Exercise DB JSON files"""
    global exercises_data, muscle_groups_data

    try:
        # Load main exercises
        BASE_DIR = os.path.dirname(os.path.abspath(__file__))
        DATA_PATH = os.path.join(BASE_DIR, 'data', 'exercises.json')

        with open(DATA_PATH, 'r') as f:
            exercises_data = json.load(f)

        print(f"✅ Loaded {len(exercises_data)} exercises successfully!")

        # Extract unique muscle groups from exercises data
        muscle_groups_data = extract_muscle_groups_from_exercises()
        print(f"✅ Extracted {len(muscle_groups_data)} unique muscle groups!")

        # Show sample exercise structure
        if exercises_data:
            print("📊 Sample exercise structure:")
            sample = exercises_data[0]
            for key in sample.keys():
                print(f"   - {key}: {type(sample[key])}")

        return True

    except FileNotFoundError as e:
        print(f"❌ Error: Could not find exercises.json in data/ folder: {e}")
        print("Make sure you've copied exercises.json to backend/data/")
        return False
    except Exception as e:
        print(f"❌ Error loading exercise data: {e}")
        return False

@app.route('/api/health', methods=['GET'])
def health_check():
    """Simple health check endpoint"""
    return jsonify({
        "status": "healthy",
        "exercises_loaded": len(exercises_data) > 0,
        "total_exercises": len(exercises_data),
        "total_muscle_groups": len(muscle_groups_data)
    })

@app.route('/api/exercises', methods=['GET'])
def get_all_exercises():
    """Get all exercises with optional pagination"""
    if not exercises_data:
        return jsonify({"error": "Exercise data not loaded"}), 500

    # Optional pagination
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 50, type=int)

    start_idx = (page - 1) * per_page
    end_idx = start_idx + per_page

    paginated_data = exercises_data[start_idx:end_idx]

    return jsonify({
        "exercises": paginated_data,
        "total": len(exercises_data),
        "page": page,
        "per_page": per_page,
        "has_more": end_idx < len(exercises_data)
    })

@app.route('/api/exercises/search', methods=['GET'])
def search_exercises():
    """Search exercises by name, muscle group, equipment, etc."""
    if not exercises_data:
        return jsonify({"error": "Exercise data not loaded"}), 500

    # Get query parameters
    query = request.args.get('q', '').lower()
    muscle = request.args.get('muscle', '').lower()
    equipment = request.args.get('equipment', '').lower()
    category = request.args.get('category', '').lower()
    limit = request.args.get('limit', 20, type=int)

    filtered_exercises = []

    for exercise in exercises_data:
        match = True

        # Text search in name and instructions
        if query:
            name_match = query in exercise.get('name', '').lower()
            instruction_match = any(query in inst.lower() for inst in exercise.get('instructions', []))
            if not (name_match or instruction_match):
                match = False

        # Filter by primary muscle
        if muscle and match:
            primary_muscles = [m.lower() for m in exercise.get('primaryMuscles', [])]
            secondary_muscles = [m.lower() for m in exercise.get('secondaryMuscles', [])]
            if muscle not in primary_muscles and muscle not in secondary_muscles:
                match = False

        # Filter by equipment
        if equipment and match:
            exercise_equipment = exercise.get('equipment', '').lower()
            if equipment not in exercise_equipment:
                match = False

        # Filter by category
        if category and match:
            exercise_category = exercise.get('category', '').lower()
            if category not in exercise_category:
                match = False

        if match:
            filtered_exercises.append(exercise)

        # Stop if we hit the limit
        if len(filtered_exercises) >= limit:
            break

    return jsonify({
        "exercises": filtered_exercises,
        "total_found": len(filtered_exercises),
        "filters": {
            "query": query,
            "muscle": muscle,
            "equipment": equipment,
            "category": category
        }
    })

@app.route('/api/muscle-groups', methods=['GET'])
def get_muscle_groups():
    """Get all muscle groups"""
    return jsonify({
        "muscle_groups": muscle_groups_data,
        "total": len(muscle_groups_data)
    })

@app.route('/api/exercises/by-muscle/<muscle_name>', methods=['GET'])
def get_exercises_by_muscle(muscle_name):
    """Get exercises targeting a specific muscle"""
    if not exercises_data:
        return jsonify({"error": "Exercise data not loaded"}), 500

    muscle_name = muscle_name.lower()
    matching_exercises = []

    for exercise in exercises_data:
        primary_muscles = [m.lower() for m in exercise.get('primaryMuscles', [])]
        secondary_muscles = [m.lower() for m in exercise.get('secondaryMuscles', [])]

        if muscle_name in primary_muscles or muscle_name in secondary_muscles:
            matching_exercises.append(exercise)

    return jsonify({
        "exercises": matching_exercises,
        "muscle": muscle_name,
        "total": len(matching_exercises)
    })

@app.route('/api/exercises/random', methods=['GET'])
def get_random_exercises():
    """Get random exercises for program generation"""
    import random

    if not exercises_data:
        return jsonify({"error": "Exercise data not loaded"}), 500

    count = request.args.get('count', 5, type=int)
    count = min(count, len(exercises_data))  # Don't exceed available exercises

    random_exercises = random.sample(exercises_data, count)

    return jsonify({
        "exercises": random_exercises,
        "count": len(random_exercises)
    })

@app.route('/api/exercises/stats', methods=['GET'])
def get_exercise_stats():
    """Get statistics about the exercise database"""
    if not exercises_data:
        return jsonify({"error": "Exercise data not loaded"}), 500

    # Count exercises by category
    categories = {}
    equipment_types = {}
    muscle_groups = {}

    for exercise in exercises_data:
        # Count categories
        category = exercise.get('category', 'Unknown')
        categories[category] = categories.get(category, 0) + 1

        # Count equipment
        equipment = exercise.get('equipment', 'Unknown')
        equipment_types[equipment] = equipment_types.get(equipment, 0) + 1

        # Count primary muscles
        for muscle in exercise.get('primaryMuscles', []):
            muscle_groups[muscle] = muscle_groups.get(muscle, 0) + 1

    return jsonify({
        "total_exercises": len(exercises_data),
        "categories": categories,
        "equipment_types": equipment_types,
        "primary_muscle_distribution": muscle_groups
    })

if __name__ == '__main__':
    if load_exercise_data():
        print("🚀 Starting Flask server...")
        print("📡 Available endpoints:")
        print("   - GET /api/health")
        print("   - GET /api/exercises")
        print("   - GET /api/exercises/search?q=squat&muscle=quadriceps")
        print("   - GET /api/muscle-groups")
        print("   - GET /api/exercises/by-muscle/quadriceps")
        print("   - GET /api/exercises/random?count=5")
        print("   - GET /api/exercises/stats")
        app.run(debug=True, port=5000, host='0.0.0.0')
    else:
        print("❌ Failed to load exercise data. Please check your JSON files in backend/data/")