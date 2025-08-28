// Exercise related types
export interface Exercise {
    name: string;
    force: string;
    level: string;
    mechanic: string;
    equipment: string;
    primaryMuscles: string[];
    secondaryMuscles: string[];
    instructions: string[];
    category: string;
    images: string[];
    id: string;
}



export interface ExerciseSearchParams {
    name?: string;
    muscle?: string;
    equipment?: string;
    category?: string;
    limit?: number;
}

// API Response types (matching your Flask backend)
export interface ExerciseApiResponse {
    exercises: Exercise[];
    total: number;
    page?: number;
    per_page?: number;
    has_more?: boolean;
}

export interface SearchApiResponse {
    exercises: Exercise[];
    total_found: number;
    filters: ExerciseSearchParams;
}