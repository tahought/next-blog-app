"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import type { Post } from "@/app/_types/Post";
import type { PostApiResponse } from "@/app/_types/PostApiResponse";
import type { Category } from "@/app/_types/Category";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faSpinner, 
  faSearch, 
  faFilter, 
  faPlus, 
  faFileLines, 
  faTrash, 
  faPenToSquare 
} from "@fortawesome/free-solid-svg-icons";

/**
 * 投稿記事管理ページ
 * 検索、カテゴリフィルタ、削除機能を完備
 */
const Page: React.FC = () => {
  const [posts, setPosts] = useState<Post[] | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 検索とフィルタのステート
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // 記事一覧を取得
  const fetchPosts = useCallback(async () => {
    try {
      const response = await fetch("/api/posts", { method: "GET", cache: "no-store" });
      if (!response.ok) throw new Error("データの取得に失敗しました");
      const postResponse: PostApiResponse[] = await response.json();
      
      setPosts(
        postResponse.map((rawPost) => ({
          id: rawPost.id,
          title: rawPost.title,
          content: rawPost.content,
          coverImage: { url: rawPost.coverImageURL, width: 1000, height: 1000 },
          createdAt: rawPost.createdAt,
          categories: rawPost.categories.map((c) => ({
            id: c.category.id,
            name: c.category.name,
          })),
        }))
      );
    } catch (e) {
      console.error("Fetch posts error:", e);
    }
  }, []);

  // フィルタ用カテゴリ一覧を取得
  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch("/api/categories", { method: "GET", cache: "no-store" });
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (e) {
      console.error("Fetch categories error:", e);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
    fetchCategories();
  }, [fetchPosts, fetchCategories]);

  // 検索とフィルタの適用（リアルタイム更新）
  const filteredPosts = useMemo(() => {
    if (!posts) return [];
    return posts.filter((post) => {
      const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === "all" || post.categories.some((c) => c.id === selectedCategory);
      return matchesSearch && matchesCategory;
    });
  }, [posts, searchQuery, selectedCategory]);

  /**
   * 削除処理
   */
  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`「${title}」を完全に削除しますか？\nこの操作は元に戻せません。`)) return;
    
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/admin/posts/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("削除に失敗しました");
      await fetchPosts(); // リストを再取得
    } catch (e) {
      window.alert("エラーが発生しました。");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    // メニューバーとの相殺を防ぐため pt-24 (PC) を設定
    <main className="max-w-6xl mx-auto p-6 pt-16 md:pt-24 min-h-screen bg-white selection:bg-indigo-100 font-sans">
      <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight mb-2 text-slate-800">記事管理</h1>
          <p className="text-slate-500 text-sm font-medium italic">作成したブログ記事の検索、編集、削除が行えます。</p>
        </div>
        <Link href="/admin/posts/new">
          <button className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold flex items-center shadow-lg hover:bg-slate-800 transition-all active:scale-95 whitespace-nowrap">
            <FontAwesomeIcon icon={faPlus} className="mr-2" />
            新規記事を作成
          </button>
        </Link>
      </header>

      {/* ツールバー */}
      <div className="flex flex-col md:flex-row gap-4 mb-10 bg-slate-50 p-5 rounded-3xl border border-slate-100 shadow-sm">
        <div className="relative flex-1 group">
          <FontAwesomeIcon icon={faSearch} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
          <input 
            type="text" 
            placeholder="記事のタイトルで検索..." 
            value={searchQuery} 
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          />
        </div>
        <div className="flex items-center space-x-2">
          <FontAwesomeIcon icon={faFilter} className="text-slate-400" />
          <select 
            value={selectedCategory} 
            onChange={e => setSelectedCategory(e.target.value)}
            className="bg-white border border-slate-200 rounded-2xl px-4 py-3.5 text-sm outline-none cursor-pointer min-w-[200px] focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">すべてのカテゴリ</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      </div>

      {!posts ? (
        <div className="py-32 text-center text-slate-400 font-bold flex flex-col items-center gap-4">
          <FontAwesomeIcon icon={faSpinner} className="animate-spin text-indigo-500" size="2x" />
          <span>記事を読み込み中...</span>
        </div>
      ) : (
        <div className="space-y-3">
          {/* PC版ヘッダー行 */}
          <div className="hidden md:grid grid-cols-12 gap-4 px-8 py-3 text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 mb-4 bg-slate-50/50 rounded-t-xl">
            <div className="col-span-7">記事の詳細</div>
            <div className="col-span-2 text-center border-l border-slate-200">公開日</div>
            <div className="col-span-3 text-right">アクション</div>
          </div>

          {filteredPosts.length > 0 ? (
            filteredPosts.map((post) => (
              <div key={post.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 px-6 py-5 md:py-4 items-center group bg-white border border-slate-100 rounded-[32px] md:rounded-2xl hover:bg-slate-50 hover:shadow-xl hover:shadow-indigo-500/5 transition-all">
                <div className="col-span-1 md:col-span-7 flex items-center space-x-5">
                  <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-300 shrink-0 group-hover:bg-white group-hover:text-indigo-400 transition-colors shadow-inner">
                    <FontAwesomeIcon icon={faFileLines} size="xl" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-slate-800 text-lg group-hover:text-indigo-600 transition-colors truncate">{post.title}</h3>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {post.categories.map(c => (
                        <span key={c.id} className="bg-white border border-slate-200 text-slate-500 text-[10px] font-black px-2 py-0.5 rounded-lg uppercase tracking-tighter shadow-sm">
                          {c.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="hidden md:block col-span-2 text-center text-xs font-black text-slate-400">
                  {new Date(post.createdAt).toLocaleDateString('ja-JP')}
                </div>

                <div className="col-span-1 md:col-span-3 flex items-center justify-between md:justify-end space-x-3 mt-4 md:mt-0">
                  <Link href={`/admin/posts/${post.id}`} className="flex-1 md:flex-none">
                    <button className="w-full bg-white border-2 border-slate-100 text-slate-600 px-6 py-2.5 rounded-2xl text-xs font-black hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all flex items-center justify-center shadow-sm">
                      <FontAwesomeIcon icon={faPenToSquare} className="mr-2" />
                      編集
                    </button>
                  </Link>
                  <button 
                    onClick={() => handleDelete(post.id, post.title)}
                    className="text-slate-300 hover:text-red-500 transition-all p-3 rounded-2xl hover:bg-red-50 shrink-0"
                    title="記事を完全に削除"
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-32 bg-slate-50 rounded-[40px] border-2 border-dashed border-slate-200 text-slate-400 font-black uppercase tracking-widest">
              該当する記事がありません
            </div>
          )}
        </div>
      )}

      {/* 処理中オーバーレイ */}
      {isSubmitting && (
        <div className="fixed inset-0 bg-white/60 backdrop-blur-[4px] z-50 flex items-center justify-center">
          <div className="bg-white px-12 py-8 rounded-[48px] shadow-2xl border border-slate-100 flex flex-col items-center space-y-4">
            <FontAwesomeIcon icon={faSpinner} className="animate-spin text-indigo-600" size="3x" />
            <span className="font-black text-slate-800 text-xs tracking-widest uppercase">Processing...</span>
          </div>
        </div>
      )}
    </main>
  );
};

export default Page;