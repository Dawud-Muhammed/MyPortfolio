export interface BlogOrderRow {
  id?: string | number;
  published_at?: string | null;
  created_at?: string | null;
}
export declare function sortBlogPosts<T extends BlogOrderRow>(posts: readonly T[]): T[];
