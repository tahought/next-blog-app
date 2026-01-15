import { z } from "zod";

export const postSchema = z.object({
  title: z.string().min(1, "タイトルを入力してください").max(100, "タイトルが長すぎます"),
  content: z.string().min(1, "本文を入力してください"),
  coverImageURL: z.string().url("有効なURLを入力してください").min(1, "画像URLは必須です"),
  categoryIds: z.array(z.string()).min(1, "カテゴリを1つ以上選択してください"),
});