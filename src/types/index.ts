// Type definitions for the application

export interface Day {
  day: number;
  topic: string;
  task: string;
  completed: boolean;
  articleId: string | null;
}

export interface Week {
  name: string;
  weeklyGoal: string;
  days: Day[];
}

export interface Month {
  name: string;
  overview: string;
  weeks: Week[];
}

export interface Roadmap {
  id: string;
  title: string;
  goal: string;
  duration: string;
  level: string;
  language: string;
  progress: number;
  months: Month[];
}

export interface ArticleSection {
  heading: string;
  content: string;
}

export interface ExternalResource {
  title: string;
  url: string;
  // Fallback properties for compatibility
  uri?: string;
  link?: string;
  href?: string;
  source?: string;
}

export interface Article {
  id: string;
  title: string;
  summary: string;
  sections: ArticleSection[];
  externalResource?: ExternalResource;
}

export type ViewType = 'dashboard' | 'create' | 'roadmap' | 'article';

export interface GroqFunctionData {
  userId: string;
  action: string;
  data: any;
}

export interface CreateRoadmapForm {
  goal: string;
  duration: string;
  level: string;
}

export interface UserSession {
  email: string;
  isLoggedIn: boolean;
  loginTime: number;
}

export interface UserData {
  roadmaps: Record<string, Roadmap>;
  articles: Record<string, Article>;
  selectedRoadmapId: string | null;
  selectedArticleId: string | null;
  theme: 'light' | 'dark';
  language: string;
}
