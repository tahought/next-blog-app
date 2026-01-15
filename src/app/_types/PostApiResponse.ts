export type PostApiResponse = {
  id: string;
  title: string;
  content: string;
  coverImageURL: string;
  published: boolean; // 追加
  createdAt: string;
  categories: {
    category: {
      id: string;
      name: string;
    };
  }[];
};