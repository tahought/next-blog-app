"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faSpinner, 
  faSearch, 
  faPlus, 
  faTags, 
  faTrash, 
  faCheck, 
  faArrowUpRightFromSquare,
  faSortAmountDown,
  faEye
} from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import { Category } from "@/app/_types/Category";

/**
 * 拡張カテゴリ型: UI表示用の追加プロパティを定義
 */
interface ExtendedCategory extends Category {
  postCount?: number;
  imageUrl?: string;
  createdAt?: string;
}

const Page: React.FC = () => {
  const [categories, setCategories] = useState<ExtendedCategory[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("name-asc");

  // インライン編集・追加用のステート
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempName, setTempName] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState("");
  
  const editInputRef = useRef<HTMLInputElement>(null);
  const addInputRef = useRef<HTMLInputElement>(null);

  /**
   * カテゴリ一覧の取得
   */
  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/categories", { method: "GET", cache: "no-store" });
      if (!res.ok) throw new Error("データの取得に失敗しました");
      const data = await res.json();
      setCategories(data);
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  /**
   * インライン名前編集の保存処理
   */
  const handleUpdateName = async (id: string) => {
    if (!tempName.trim()) { setEditingId(null); return; }
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: tempName }),
      });
      if (!res.ok) throw new Error("更新に失敗しました");
      await fetchCategories();
      setEditingId(null);
    } catch (e) {
      window.alert("更新に失敗しました。");
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * 新規カテゴリの追加処理
   */
  const handleAddNew = async () => {
    if (!newName.trim()) { setIsAdding(false); return; }
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName }),
      });
      if (!res.ok) throw new Error("追加に失敗しました");
      await fetchCategories();
      setNewName("");
      setIsAdding(false);
    } catch (e) {
      window.alert("カテゴリの追加に失敗しました。");
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * 削除処理（確認ダイアログ付き）
   */
  const handleDelete = async (cat: ExtendedCategory) => {
    const message = cat.postCount && cat.postCount > 0 
      ? `警告: このカテゴリは ${cat.postCount} 件の記事で使用されています。\n本当に削除しますか？`
      : `カテゴリ「${cat.name}」を削除しますか？`;

    if (!window.confirm(message)) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/admin/categories/${cat.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("削除に失敗しました");
      await fetchCategories();
    } catch (e) {
      window.alert("削除に失敗しました。");
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * 検索とソートの適用ロジック
   */
  const processedCategories = useMemo(() => {
    if (!categories) return [];
    let result = [...categories];

    if (searchQuery) {
      result = result.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }

    result.sort((a, b) => {
      if (sortBy === "name-asc") return a.name.localeCompare(b.name, "ja");
      if (sortBy === "name-desc") return b.name.localeCompare(a.name, "ja");
      return 0;
    });

    return result;
  }, [categories, searchQuery, sortBy]);

  if (isLoading) return (
    <div className="p-10 text-slate-400 font-bold flex items-center justify-center">
      <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-3 text-indigo-500" />
      読み込み中...
    </div>
  );

  return (
    <main className="max-w-6xl mx-auto p-4 md:p-10 min-h-screen bg-white selection:bg-indigo-100">
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-2 text-slate-800 font-sans">カテゴリ管理</h1>
          <p className="text-slate-500 text-sm font-medium italic">名前をクリックして直接編集、または新規カテゴリを追加できます。</p>
        </div>
        <button 
          onClick={() => { setIsAdding(true); setTimeout(() => addInputRef.current?.focus(), 0); }}
          className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold flex items-center shadow-lg hover:bg-slate-800 transition-all active:scale-95 whitespace-nowrap"
        >
          <FontAwesomeIcon icon={faPlus} className="mr-2" />
          カテゴリ追加
        </button>
      </header>

      {/* 検索・ソートツールバー */}
      <div className="flex flex-col md:flex-row gap-4 mb-10 bg-slate-50 p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div className="relative flex-1 group">
          <FontAwesomeIcon icon={faSearch} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
          <input 
            type="text" 
            placeholder="カテゴリ名で検索..." 
            value={searchQuery} 
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div className="flex items-center space-x-2">
          <FontAwesomeIcon icon={faSortAmountDown} className="text-slate-400" />
          <select 
            value={sortBy} 
            onChange={e => setSortBy(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none cursor-pointer min-w-[160px] focus:ring-2 focus:ring-indigo-500"
          >
            <option value="name-asc">名前順 (A-Z)</option>
            <option value="name-desc">名前順 (Z-A)</option>
          </select>
        </div>
      </div>

      <div className="space-y-1.5">
        {/* ヘッダー行 (PCのみ) - 列の割り当てを明示 */}
        <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 mb-4 bg-slate-50/50 rounded-t-lg">
          <div className="col-span-6">カテゴリ詳細</div>
          <div className="col-span-2 text-center border-l border-slate-200">作成日</div>
          <div className="col-span-4 text-right">アクション</div>
        </div>

        {/* インライン追加用フォーム */}
        {isAdding && (
          <div className="bg-indigo-50 border-2 border-dashed border-indigo-200 p-5 rounded-2xl flex items-center space-x-4 animate-in slide-in-from-top-2 duration-300 mb-6">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-indigo-400 font-bold border border-indigo-100 shadow-sm">
              <FontAwesomeIcon icon={faTags} />
            </div>
            <input 
              ref={addInputRef}
              value={newName} 
              onChange={e => setNewName(e.target.value)}
              onBlur={handleAddNew} 
              onKeyDown={e => e.key === 'Enter' && handleAddNew()}
              placeholder="新しいカテゴリ名を入力してください..."
              className="bg-white border-2 border-indigo-300 rounded-xl px-4 py-2.5 text-sm font-bold outline-none flex-1 shadow-sm focus:border-indigo-500 transition-colors"
            />
          </div>
        )}

        {processedCategories.length > 0 ? (
          processedCategories.map(cat => (
            <div 
              key={cat.id} 
              className="grid grid-cols-1 md:grid-cols-12 gap-4 px-4 md:px-6 py-4 md:py-3.5 items-center group bg-white border border-slate-100 rounded-2xl md:rounded-xl hover:bg-slate-50 hover:shadow-lg hover:shadow-indigo-500/5 transition-all"
            >
              {/* カテゴリ詳細 (PC: col-span-6) */}
              <div className="col-span-1 md:col-span-6 flex items-center space-x-4">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-300 overflow-hidden border border-slate-100 shadow-inner shrink-0 group-hover:bg-white transition-colors">
                  {cat.imageUrl ? (
                    <img src={cat.imageUrl} className="w-full h-full object-cover" alt={cat.name} />
                  ) : (
                    <FontAwesomeIcon icon={faTags} />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  {editingId === cat.id ? (
                    <div className="flex items-center space-x-2">
                      <input 
                        ref={editInputRef} 
                        value={tempName} 
                        onChange={e => setTempName(e.target.value)}
                        onBlur={() => handleUpdateName(cat.id)} 
                        onKeyDown={e => e.key === 'Enter' && handleUpdateName(cat.id)}
                        className="bg-white border-2 border-indigo-400 rounded-lg px-3 py-1.5 text-sm font-bold outline-none w-full max-w-xs shadow-indigo-100 shadow-lg"
                      />
                      <button onClick={() => handleUpdateName(cat.id)} className="text-indigo-600 px-2 py-1 shrink-0 hover:scale-110 transition-transform">
                        <FontAwesomeIcon icon={faCheck} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col">
                      <span 
                        onClick={() => { setEditingId(cat.id); setTempName(cat.name); setTimeout(() => editInputRef.current?.focus(), 0); }} 
                        className="font-bold text-slate-800 cursor-text hover:bg-slate-200 px-2 -ml-2 rounded-md transition-all w-fit truncate max-w-full"
                        title="クリックして名前を直接編集"
                      >
                        {cat.name}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* 作成日 (PC: col-span-2) */}
              <div className="hidden md:block col-span-2 text-center text-[12px] font-bold text-slate-400 tracking-tight">
                {cat.createdAt ? new Date(cat.createdAt).toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit' }) : '-'}
              </div>

              {/* アクション (PC: col-span-4) */}
              <div className="col-span-1 md:col-span-4 flex items-center justify-between md:justify-end space-x-3 mt-3 md:mt-0">
                <Link href={`/admin/posts?categoryId=${cat.id}`} className="flex-1 md:flex-none">
                  <button 
                    className={`w-full flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl text-[11px] font-black transition-all border shadow-sm
                      ${cat.postCount && cat.postCount > 0 
                        ? 'bg-white border-indigo-200 text-indigo-600 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 active:scale-95' 
                        : 'bg-slate-50 border-transparent text-slate-300 cursor-not-allowed opacity-60'}`}
                    disabled={!cat.postCount || cat.postCount === 0}
                    title={cat.postCount && cat.postCount > 0 ? "この記事一覧を表示" : "紐付いた記事がありません"}
                  >
                    <FontAwesomeIcon icon={faEye} className="text-xs" />
                    <span className="whitespace-nowrap uppercase tracking-widest">{cat.postCount || 0} 件の記事を確認</span>
                    <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="text-[9px] opacity-70" />
                  </button>
                </Link>
                <button 
                  onClick={() => handleDelete(cat)}
                  className="text-slate-300 hover:text-red-500 transition-all p-2.5 rounded-xl hover:bg-red-50 shrink-0 group-hover:text-slate-400"
                  title="削除"
                >
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-24 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 text-slate-400 font-bold uppercase tracking-widest">
            該当するカテゴリがありません。
          </div>
        )}
      </div>

      {/* 処理中オーバーレイ */}
      {isSubmitting && (
        <div className="fixed inset-0 bg-white/60 backdrop-blur-[2px] z-50 flex items-center justify-center">
          <div className="bg-white px-10 py-6 rounded-3xl shadow-2xl border border-slate-100 flex flex-col items-center space-y-4">
            <FontAwesomeIcon icon={faSpinner} className="animate-spin text-indigo-600" size="2x" />
            <span className="font-black text-slate-800 text-xs uppercase tracking-[0.2em]">Synchronizing...</span>
          </div>
        </div>
      )}
    </main>
  );
};

export default Page;