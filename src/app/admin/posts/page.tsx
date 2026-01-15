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
  faPenToSquare,
  faEye,
  faCheckCircle,
  faCircle,
  faCopy,
  faCheckSquare,
  faSquare
} from "@fortawesome/free-solid-svg-icons";

/**
 * 投稿記事管理ページ
 * 検索、カテゴリフィルタ、一括削除、複製、ステータス表示、プレビュー機能を完備
 */
const Page: React.FC = () => {
  const [posts, setPosts] = useState<Post[] | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 検索とフィルタのステート
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // 一括操作用の選択ステート
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

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
          // schema.prismaで定義したpublishedフィールドを使用
          published: rawPost.published, 
          coverImage: { url: rawPost.coverImageURL, width: 1000, height: 1000 },
          createdAt: rawPost.createdAt,
          categories: rawPost.categories.map((c) => ({
            id: c.category.id,
            name: c.category.name,
          })),
        }))
      );
      // リスト更新時に選択をリセット
      setSelectedIds([]);
    } catch (e) {
      console.error("Fetch posts error:", e);
    }
  }, []);

  // カテゴリ一覧を取得
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

  // 検索とフィルタの適用
  const filteredPosts = useMemo(() => {
    if (!posts) return [];
    return posts.filter((post) => {
      const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === "all" || post.categories.some((c) => c.id === selectedCategory);
      return matchesSearch && matchesCategory;
    });
  }, [posts, searchQuery, selectedCategory]);

  // チェックボックスの制御
  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredPosts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredPosts.map(p => p.id));
    }
  };

  // 一括削除処理
  const handleBulkDelete = async () => {
    if (!window.confirm(`${selectedIds.length}件の記事を完全に削除しますか？`)) return;
    setIsSubmitting(true);
    try {
      // 全削除リクエストを並列実行
      await Promise.all(
        selectedIds.map(id => fetch(`/api/admin/posts/${id}`, { method: "DELETE" }))
      );
      await fetchPosts();
    } catch (e) {
      window.alert("一部の記事の削除に失敗しました。");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 複製（コピー）機能
  const handleCopy = async (post: Post) => {
    if (!window.confirm(`「${post.title}」をコピーして新しい下書きを作成しますか？`)) return;
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `${post.title} (コピー)`,
          content: post.content,
          coverImageURL: post.coverImage.url,
          categoryIds: post.categories.map(c => c.id),
        }),
      });
      if (!res.ok) throw new Error();
      await fetchPosts();
    } catch (e) {
      window.alert("複製の作成に失敗しました。");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`「${title}」を完全に削除しますか？`)) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/admin/posts/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      await fetchPosts();
    } catch (e) {
      window.alert("削除に失敗しました。");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="max-w-6xl mx-auto p-6 pt-16 md:pt-24 min-h-screen bg-white font-sans selection:bg-indigo-100">
      <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight mb-2 text-slate-800">記事管理</h1>
          <p className="text-slate-500 text-sm font-medium italic">検索、編集、複製、一括削除などの管理操作が行えます。</p>
        </div>
        <div className="flex gap-3">
          {selectedIds.length > 0 && (
            <button 
              onClick={handleBulkDelete}
              className="bg-red-50 text-red-600 px-6 py-3 rounded-2xl font-bold flex items-center border border-red-100 hover:bg-red-600 hover:text-white transition-all shadow-sm"
            >
              <FontAwesomeIcon icon={faTrash} className="mr-2" />
              {selectedIds.length}件を一括削除
            </button>
          )}
          <Link href="/admin/posts/new">
            <button className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold flex items-center shadow-lg hover:bg-slate-800 transition-all active:scale-95 whitespace-nowrap">
              <FontAwesomeIcon icon={faPlus} className="mr-2" />
              新規記事
            </button>
          </Link>
        </div>
      </header>

      {/* ツールバー */}
      <div className="flex flex-col md:flex-row gap-4 mb-10 bg-slate-50 p-5 rounded-3xl border border-slate-100 shadow-sm">
        <div className="relative flex-1 group">
          <FontAwesomeIcon icon={faSearch} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
          <input 
            type="text" 
            placeholder="キーワードで検索..." 
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
            className="bg-white border border-slate-200 rounded-2xl px-4 py-3.5 text-sm outline-none cursor-pointer min-w-[200px]"
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
          {/* PC版ヘッダー行: カラム割り当てを最適化（操作列を広げ、タイトル列を調整） */}
          <div className="hidden md:grid grid-cols-12 gap-4 px-8 py-3 text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 mb-4 bg-slate-50/50 rounded-t-xl">
            <div className="col-span-1 flex justify-center">
              <button onClick={toggleSelectAll} className="hover:text-indigo-600 transition-colors">
                <FontAwesomeIcon icon={selectedIds.length === filteredPosts.length && filteredPosts.length > 0 ? faCheckSquare : faSquare} size="lg" />
              </button>
            </div>
            <div className="col-span-3">記事の詳細</div>
            <div className="col-span-2 text-center border-l border-slate-200">ステータス</div>
            <div className="col-span-2 text-center border-l border-slate-200">公開日</div>
            <div className="col-span-4 text-right">アクション</div>
          </div>

          {filteredPosts.length > 0 ? (
            filteredPosts.map((post) => (
              <div key={post.id} className={`grid grid-cols-1 md:grid-cols-12 gap-4 px-6 py-4 items-center group border rounded-[32px] md:rounded-2xl transition-all ${selectedIds.includes(post.id) ? 'bg-indigo-50/30 border-indigo-200 shadow-md' : 'bg-white border-slate-100 hover:bg-slate-50'}`}>
                {/* チェックボックス列 */}
                <div className="hidden md:flex col-span-1 justify-center">
                  <button onClick={() => toggleSelect(post.id)} className={`${selectedIds.includes(post.id) ? 'text-indigo-600' : 'text-slate-200 group-hover:text-slate-300'} transition-colors`}>
                    <FontAwesomeIcon icon={selectedIds.includes(post.id) ? faCheckSquare : faSquare} size="lg" />
                  </button>
                </div>

                {/* 記事詳細: col-span-3 */}
                <div className="col-span-1 md:col-span-3 flex items-center space-x-4">
                  <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-300 shrink-0 group-hover:bg-white group-hover:text-indigo-400 transition-colors shadow-inner">
                    <FontAwesomeIcon icon={faFileLines} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors truncate">{post.title}</h3>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {post.categories.map(c => <span key={c.id} className="bg-white border border-slate-200 text-slate-400 text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter">{c.name}</span>)}
                    </div>
                  </div>
                </div>

                {/* ステータス: col-span-2 */}
                <div className="hidden md:flex col-span-2 justify-center">
                  {post.published ? (
                    <span className="text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full text-[10px] font-black border border-emerald-100 uppercase tracking-wider"><FontAwesomeIcon icon={faCheckCircle} className="mr-1.5" /> Published</span>
                  ) : (
                    <span className="text-slate-400 bg-slate-100 px-3 py-1 rounded-full text-[10px] font-black border border-slate-200 uppercase tracking-wider"><FontAwesomeIcon icon={faCircle} className="mr-1.5 text-[8px]" /> Draft</span>
                  )}
                </div>

                {/* 公開日: col-span-2 */}
                <div className="hidden md:block col-span-2 text-center text-xs font-black text-slate-400">
                  {new Date(post.createdAt).toLocaleDateString('ja-JP')}
                </div>

                {/* アクション: col-span-4 に広げて干渉を防止 */}
                <div className="col-span-1 md:col-span-4 flex items-center justify-end space-x-2">
                  <Link href={`/posts/${post.id}`} target="_blank" title="プレビュー">
                    <button className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-white rounded-xl transition-all shadow-sm border border-transparent hover:border-slate-100">
                      <FontAwesomeIcon icon={faEye} />
                    </button>
                  </Link>
                  <button onClick={() => handleCopy(post)} title="複製を作成" className="p-2 text-slate-400 hover:text-blue-600 hover:bg-white rounded-xl transition-all shadow-sm border border-transparent hover:border-slate-100">
                    <FontAwesomeIcon icon={faCopy} />
                  </button>
                  <Link href={`/admin/posts/${post.id}`} title="編集">
                    <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-xl transition-all shadow-sm border border-transparent hover:border-slate-100">
                      <FontAwesomeIcon icon={faPenToSquare} />
                    </button>
                  </Link>
                  <button onClick={() => handleDelete(post.id, post.title)} className="text-slate-300 hover:text-red-500 transition-all p-2 rounded-xl hover:bg-red-50" title="削除">
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-32 bg-slate-50 rounded-[40px] border-2 border-dashed border-slate-200 text-slate-400 font-black uppercase tracking-widest">該当する記事がありません</div>
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