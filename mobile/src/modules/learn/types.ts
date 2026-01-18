export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
}

export interface Lesson {
  id: string;
  title: string;
  category: string;
  content: string;
  quiz?: QuizQuestion[];
}

export interface Category {
  id: string;
  name: string;
  description: string;
}

export interface LearnProgress {
  completedLessons: string[];
  quizScores: Record<string, number>;
}
