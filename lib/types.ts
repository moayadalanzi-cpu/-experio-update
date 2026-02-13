export type Post = {
  id: string;
  title: string;
  description: string;
  category: string;
  created_at?: string;

  likes_count?: number;
  liked_by_me?: boolean;
};
