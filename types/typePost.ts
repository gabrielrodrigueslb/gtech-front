
export interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt?: string;
  content: string;
  contentType: ContentType;
  status: PostStatus;
  publishedAt: string;
  createdAt: string;
  author: string;
  category: Category;
  featuredImage: string;
  readTime: string;
}

export type PostStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export type ContentType = 'MARKDOWN' | 'HTML';

export interface Category {
  id: number;
  name: string;
}