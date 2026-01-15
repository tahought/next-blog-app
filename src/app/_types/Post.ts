import type { Category } from "./Category";
import type { CoverImage } from "./CoverImage";

export type Post = {
  id: string;
  title: string;
  content: string;
  published: boolean; // 追加
  createdAt: string;
  categories: Category[];
  coverImage: CoverImage;
};