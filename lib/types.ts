export interface Lesson {
  id: string
  title: string
  content: string
  completed: boolean
}

export interface Chapter {
    id: string | null;
    completed: boolean;
    title: string;
    duration: string;
    content: string;
}
