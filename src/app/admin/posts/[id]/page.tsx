"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faSpinner, 
  faSave, 
  faTrash, 
  faArrowLeft, 
  faCircleExclamation, 
  faPlus, 
  faImage 
} from "@fortawesome/free-solid-svg-icons";

// 型定義
interface Category {
  id: string;
  name: string;
}

interface Post {
  id: string;
  title: string;
  content: string;
  coverImageURL: string;
  isPublished?: boolean;
  categories: { category: Category }[];
}

const Page: React.FC = () => {
  const router = useRouter();
  const { id } = useParams() as { id: string };

  const [isInitialized, setIsInitialized] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fetchErrorMsg, setFetchErrorMsg] = useState<string | null>(null);

  // ステート管理
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [coverURL, setCoverURL] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [checkableCategories, setCheckableCategories] = useState<{ id: string; name: string; isSelect: boolean }[]>([]);

  // 変更検知用
  const [initialJson, setInitialJson] = useState("");
  const [errors, setErrors] = useState<{ title?: string; content?: string }>({});

  // カテゴリ追加用
  const [isAddingCat, setIsAddingCat] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const addInputRef = useRef<HTMLInputElement>(null);

  // 1. データの初期取得
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 先ほど作成した admin 用の API パス (/api/admin/posts/...) を使用します
        const [postRes, catRes] = await Promise.all([
          fetch(`/api/admin/posts/${id}`, { cache: "no-store" }),
          fetch("/api/categories", { cache: "no-store" }),
        ]);

        if (!postRes.ok || !catRes.ok) {
          throw new Error("データの取得に失敗しました");
        }

        const postData: Post = await postRes.json();
        const catData: Category[] = await catRes.json();

        setTitle(postData.title);
        setContent(postData.content);
        setCoverURL(postData.coverImageURL || "");
        setIsPublished(postData.isPublished ?? false);

        const selectedIds = new Set(postData.categories.map((c) => c.category.id));
        const cats = catData.map((c) => ({
          id: c.id,
          name: c.name,
          isSelect: selectedIds.has(c.id),
        }));
        setCheckableCategories(cats);

        const snapshot = JSON.stringify({ 
          title: postData.title, 
          content: postData.content, 
          coverURL: postData.coverImageURL || "", 
          isPublished: postData.isPublished ?? false, 
          cats 
        });
        setInitialJson(snapshot);
        setIsInitialized(true);
      } catch (error) {
        setFetchErrorMsg("読み込みに失敗しました。記事IDやAPIの設定を確認してください。");
      }
    };
    fetchData();
  }, [id]);

  // 変更検知
  const isDirty = useMemo(() => {
    if (!isInitialized) return false;
    const current = JSON.stringify({ title, content, coverURL, isPublished, cats: checkableCategories });
    return initialJson !== current;
  }, [isInitialized, initialJson, title, content, coverURL, isPublished, checkableCategories]);

  // 保存忘れ防止
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) { e.preventDefault(); e.returnValue = ""; }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  // 更新処理
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setErrors({
        title: !title.trim() ? "タイトルを入力してください" : undefined,
        content: !content.trim() ? "本文を入力してください" : undefined,
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const body = {
        title,
        content,
        coverImageURL: coverURL,
        isPublished,
        categoryIds: checkableCategories.filter((c) => c.isSelect).map((c) => c.id),
      };
      
      const res = await fetch(`/api/admin/posts/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("更新失敗");
      
      router.push("/admin/posts");
      router.refresh();
    } catch (error) {
      window.alert("エラーが発生しました。");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 削除処理
  const handleDelete = async () => {
    if (!window.confirm("この記事を完全に削除しますか？")) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/admin/posts/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("削除失敗");
      router.push("/admin/posts");
      router.refresh();
    } catch (error) {
      window.alert("削除に失敗しました。");
    } finally {
      setIsSubmitting(false);
    }
  };

  // カテゴリ即時追加
  const addNewCategory = async () => {
    if (!newCatName.trim()) { setIsAddingCat(false); return; }
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCatName }),
      });
      if (res.ok) {
        const newCat = await res.json();
        setCheckableCategories(prev => [...prev, { id: newCat.id, name: newCat.name, isSelect: true }]);
        setNewCatName("");
        setIsAddingCat(false);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (fetchErrorMsg) return (
    <div className="p-10 text-center">
      <p className="text-red-500 font-bold mb-4">{fetchErrorMsg}</p>
      <button onClick={() => router.back()} className="text-slate-500 underline text-sm">戻る</button>
    </div>
  );

  if (!isInitialized) return (
    <div className="p-20 text-center text-slate-400 font-bold">
      <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-3 text-indigo-500" />
      読み込み中...
    </div>
  );

  return (
    <div className="min-h-screen bg-white text-slate-900 pb-24 selection:bg-indigo-100">
      {/* ナビゲーションバー */}
      <nav className="border-b border-slate-100 px-6 py-4 flex items-center justify-between sticky top-0 bg-white/90 backdrop-blur-md z-30">
        <button 
          onClick={() => { if (isDirty && !window.confirm("変更が保存されていません。移動しますか？")) return; router.back(); }}
          className="flex items-center text-slate-500 hover:text-slate-800 transition-colors text-sm font-bold"
        >
          <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
          戻る
        </button>
        
        <div className="flex items-center space-x-3">
          <div className="hidden md:flex bg-slate-100 p-1 rounded-xl">
            <button 
              onClick={() => setIsPublished(false)} 
              className={`px-4 py-1.5 rounded-lg text-[10px] font-black transition-all ${!isPublished ? "bg-white text-slate-900 shadow-sm" : "text-slate-400"}`}
            >
              DRAFT
            </button>
            <button 
              onClick={() => setIsPublished(true)} 
              className={`px-4 py-1.5 rounded-lg text-[10px] font-black transition-all ${isPublished ? "bg-indigo-600 text-white shadow-sm" : "text-slate-400"}`}
            >
              PUBLISH
            </button>
          </div>

          <button onClick={handleDelete} className="text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-md text-sm font-bold transition-all">
            削除
          </button>
          
          <button 
            onClick={handleUpdate}
            disabled={!isDirty || isSubmitting}
            className={`px-8 py-2.5 rounded-2xl text-sm font-bold flex items-center transition-all shadow-lg active:scale-95
              ${isDirty && !isSubmitting ? "bg-slate-900 text-white hover:bg-slate-800" : "bg-slate-100 text-slate-400 cursor-not-allowed"}`}
          >
            保存する
          </button>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 pt-16">
        {/* カバー画像 */}
        <div className="mb-12 h-64 md:h-80 rounded-[40px] bg-slate-50 overflow-hidden border border-slate-100 relative shadow-inner flex items-center justify-center">
          {coverURL ? (
            <img src={coverURL} className="w-full h-full object-cover" alt="Cover" />
          ) : (
            <div className="flex flex-col items-center text-slate-200">
              <FontAwesomeIcon icon={faImage} size="4x" />
              <span className="text-[10px] font-black uppercase mt-4">No Cover Image</span>
            </div>
          )}
        </div>

        <form onSubmit={handleUpdate} className="space-y-16">
          <section>
            <input 
              type="text" 
              placeholder="無題" 
              value={title} 
              onChange={e => { setTitle(e.target.value); if (errors.title) setErrors({...errors, title: undefined}); }}
              className={`w-full text-4xl md:text-6xl font-black border-none outline-none p-0 focus:ring-0 placeholder:text-slate-100 transition-colors ${errors.title ? "text-red-300" : "text-slate-900"}`}
            />
            {errors.title && <p className="text-red-500 text-xs font-bold mt-4 flex items-center"><FontAwesomeIcon icon={faCircleExclamation} className="mr-1" />{errors.title}</p>}
          </section>

          <section className="space-y-8 py-10 border-y border-slate-50">
            <div className="flex flex-col md:flex-row md:items-center">
              <label className="w-40 text-[10px] font-black text-slate-300 uppercase tracking-widest mb-2 md:mb-0">Cover URL</label>
              <input 
                type="url" 
                value={coverURL} 
                placeholder="https://..."
                onChange={e => setCoverURL(e.target.value)}
                className="flex-1 text-sm border-none focus:ring-0 p-0 text-slate-500 italic placeholder:text-slate-200" 
              />
            </div>
            
            <div className="flex flex-col md:flex-row md:items-start">
              <label className="w-40 text-[10px] font-black text-slate-300 uppercase tracking-widest mt-2 mb-3 md:mb-0">Categories</label>
              <div className="flex-1 flex flex-wrap gap-2 items-center">
                {checkableCategories.map(c => (
                  <button 
                    key={c.id} 
                    type="button" 
                    onClick={() => setCheckableCategories(prev => prev.map(p => p.id === c.id ? {...p, isSelect: !p.isSelect} : p))}
                    className={`px-4 py-1.5 rounded-full text-[11px] font-bold border transition-all ${c.isSelect ? "bg-indigo-600 border-indigo-600 text-white shadow-md" : "bg-white border-slate-200 text-slate-400 hover:border-slate-400"}`}
                  >
                    {c.name}
                  </button>
                ))}
                
                {isAddingCat ? (
                  <input 
                    ref={addInputRef} 
                    autoFocus 
                    value={newCatName} 
                    onChange={e => setNewCatName(e.target.value)}
                    onBlur={addNewCategory} 
                    onKeyDown={e => e.key === 'Enter' && addNewCategory()}
                    className="border-b-2 border-indigo-400 text-[11px] font-bold outline-none w-24 bg-transparent"
                    placeholder="名前..."
                  />
                ) : (
                  <button type="button" onClick={() => setIsAddingCat(true)} className="text-slate-300 hover:text-indigo-600 p-2">
                    <FontAwesomeIcon icon={faPlus} />
                  </button>
                )}
              </div>
            </div>
          </section>

          <section className="relative pb-20">
            <div className="flex justify-between items-center mb-8">
              <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Content</label>
              <span className={`text-[10px] font-black px-3 py-1 rounded-full ${content.length > 2000 ? "bg-red-50 text-red-500" : "bg-slate-50 text-slate-400"}`}>
                {content.length.toLocaleString()} 文字
              </span>
            </div>
            <textarea 
              placeholder="ここに入力を開始..." 
              value={content}
              onChange={e => { setContent(e.target.value); if (errors.content) setErrors({...errors, content: undefined}); }}
              className={`w-full min-h-[500px] text-lg leading-relaxed border-none outline-none p-0 focus:ring-0 placeholder:text-slate-100 resize-none transition-colors ${errors.content ? "text-red-300" : "text-slate-700"