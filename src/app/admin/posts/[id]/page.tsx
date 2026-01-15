"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner, faSave, faTrash, faExclamationCircle, faImage, faTag } from "@fortawesome/free-solid-svg-icons";
import { postSchema } from "@/lib/schemas";
import toast, { Toaster } from "react-hot-toast"; // package.jsonにあるライブラリを活用

interface Category {
  id: string;
  name: string;
}

const EditPostPage: React.FC = () => {
  const { id } = useParams() as { id: string };
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [coverImageURL, setCoverImageURL] = useState("");
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [postRes, catRes] = await Promise.all([
          fetch(`/api/admin/posts/${id}`),
          fetch("/api/admin/categories"),
        ]);
        if (!postRes.ok || !catRes.ok) throw new Error();

        const postData = await postRes.json();
        const categoriesData = await catRes.json();

        setTitle(postData.title);
        setContent(postData.content);
        setCoverImageURL(postData.coverImageURL);
        setCategoryIds(postData.categories.map((c: any) => c.categoryId));
        setCategories(categoriesData);
      } catch (err) {
        toast.error("データの読み込みに失敗しました");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) { e.preventDefault(); e.returnValue = ""; }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = postSchema.safeParse({ title, content, coverImageURL, categoryIds });

    if (!result.success) {
      const newErrors: { [key: string]: string } = {};
      result.error.issues.forEach((issue) => {
        const fieldName = issue.path[0];
        if (fieldName) newErrors[fieldName as string] = issue.message;
      });
      setErrors(newErrors);
      toast.error("入力内容を確認してください");
      return;
    }

    setIsSubmitting(true);
    const loadingToast = toast.loading("更新中...");
    try {
      const res = await fetch(`/api/admin/posts/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result.data),
      });
      if (!res.ok) throw new Error();
      
      setIsDirty(false);
      toast.success("記事を更新しました", { id: loadingToast });
      router.push("/admin/posts");
      router.refresh();
    } catch (err) {
      toast.error("更新に失敗しました", { id: loadingToast });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("本当に削除しますか？")) return;
    try {
      const res = await fetch(`/api/admin/posts/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("削除しました");
      router.push("/admin/posts");
      router.refresh();
    } catch (err) {
      toast.error("削除に失敗しました");
    }
  };

  if (isLoading) return <div className="p-12 text-center text-slate-400"><FontAwesomeIcon icon={faSpinner} spin size="2x" /></div>;

  return (
    <main className="max-w-4xl mx-auto p-6 md:p-12">
      <Toaster /> {/* 通知用コンポーネント */}
      
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-slate-800">記事の編集</h1>
        <button onClick={handleDelete} className="text-red-400 hover:text-red-600 text-sm font-bold transition-colors">
          <FontAwesomeIcon icon={faTrash} className="mr-2" />削除
        </button>
      </div>

      <form onSubmit={handleUpdate} className="space-y-8 bg-white p-8 rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/50">
        
        {/* タイトル */}
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">タイトル</label>
          <input
            type="text"
            value={title}
            onChange={(e) => { setTitle(e.target.value); setIsDirty(true); }}
            className={`w-full p-4 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-blue-400 transition-all outline-none ${errors.title ? 'border-red-400 bg-red-50' : 'border-slate-100'}`}
          />
          {errors.title && <p className="text-red-500 text-xs mt-2"><FontAwesomeIcon icon={faExclamationCircle} /> {errors.title}</p>}
        </div>

        {/* カバー画像URL & ライブプレビュー */}
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">
            <FontAwesomeIcon icon={faImage} className="mr-2 text-slate-400" />カバー画像URL
          </label>
          <input
            type="text"
            value={coverImageURL}
            onChange={(e) => { setCoverImageURL(e.target.value); setIsDirty(true); }}
            className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl mb-4 text-sm"
          />
          {coverImageURL && (
            <div className="relative aspect-video rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
              <img src={coverImageURL} alt="Preview" className="object-cover w-full h-full" 
                onError={(e) => (e.currentTarget.src = "https://placehold.jp/24/cccccc/ffffff/400x225.png?text=Invalid%20URL")} />
              <div className="absolute top-2 left-2 bg-black/50 text-white text-[10px] px-2 py-1 rounded">PREVIEW</div>
            </div>
          )}
        </div>

        {/* カテゴリ選択（タグスタイル） */}
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-3">
            <FontAwesomeIcon icon={faTag} className="mr-2 text-slate-400" />カテゴリ選択
          </label>
          <div className="flex flex-wrap gap-2 p-4 bg-slate-50 rounded-xl border border-slate-100">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  const nextIds = categoryIds.includes(cat.id) 
                    ? categoryIds.filter(id => id !== cat.id) 
                    : [...categoryIds, cat.id];
                  setCategoryIds(nextIds);
                  setIsDirty(true);
                }}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                  categoryIds.includes(cat.id) 
                  ? 'bg-blue-500 text-white shadow-md shadow-blue-200' 
                  : 'bg-white text-slate-400 border border-slate-200 hover:border-blue-300'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
          {errors.categoryIds && <p className="text-red-500 text-xs mt-2">{errors.categoryIds}</p>}
        </div>

        {/* 本文（文字数カウント付） */}
        <div>
          <div className="flex justify-between mb-2">
            <label className="text-sm font-bold text-slate-700">本文</label>
            <span className="text-xs text-slate-400 font-mono">{content.length} characters</span>
          </div>
          <textarea
            value={content}
            onChange={(e) => { setContent(e.target.value); setIsDirty(true); }}
            rows={10}
            className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none font-mono text-sm"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-slate-900 hover:bg-black text-white font-bold py-4 rounded-xl transition-all disabled:opacity-50"
        >
          {isSubmitting ? <FontAwesomeIcon icon={faSpinner} spin /> : <><FontAwesomeIcon icon={faSave} className="mr-2" />更新内容を保存</>}
        </button>
      </form>
    </main>
  );
};

export default EditPostPage;