"use client";
import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner, faPlus, faSearch, faTrash, faEdit, faHashtag } from "@fortawesome/free-solid-svg-icons";
import { twMerge } from "tailwind-merge";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";

const Page: React.FC = () => {
  // ... (StateとFetchロジックは以前のものを維持)

  return (
    <main className="max-w-4xl mx-auto p-4 md:p-8">
      <Toaster />
      
      {/* ヘッダー: スマホでは縦並び、PCでは横並び */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 tracking-tight">カテゴリ管理</h1>
          <p className="text-gray-500 text-xs md:text-sm mt-1">ブログの分類タグを整理・管理します</p>
        </div>
        <Link href="/admin/categories/new" className="w-full md:w-auto">
          <button className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white px-5 py-2.5 rounded-lg hover:bg-gray-800 transition shadow-sm font-medium text-sm">
            <FontAwesomeIcon icon={faPlus} className="text-xs" />
            新規作成
          </button>
        </Link>
      </div>

      {/* 検索バー */}
      <div className="mb-6 relative">
        <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
        <input
          type="text"
          placeholder="カテゴリ名で検索..."
          className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 transition text-sm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* リストエリア */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        {/* ヘッダーはPCのみ表示 */}
        <div className="hidden md:grid grid-cols-[1fr_120px_100px] px-6 py-3 bg-gray-50 border-b border-gray-200 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          <div>名前</div>
          <div className="text-center">使用数</div>
          <div className="text-right">操作</div>
        </div>

        <div className="divide-y divide-gray-100">
          {filteredCategories?.map((cat) => (
            <div key={cat.id} className="
              grid grid-cols-1 md:grid-cols-[1fr_120px_100px] 
              px-4 md:px-6 py-4 items-center gap-3 md:gap-4 
              hover:bg-gray-50 transition-colors group
            ">
              {/* 名前列 */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center text-gray-400">
                  <FontAwesomeIcon icon={faHashtag} className="text-xs" />
                </div>
                <span className="font-bold md:font-medium text-gray-700">{cat.name}</span>
                {/* スマホのみ横に件数をバッジ表示 */}
                <span className="md:hidden px-2 py-0.5 bg-gray-100 rounded-full text-[10px] font-bold text-gray-500">
                  {cat._count?.posts ?? 0}
                </span>
              </div>
              
              {/* PC用件数列 */}
              <div className="hidden md:block text-center text-sm text-gray-500 font-mono">
                {cat._count?.posts ?? 0}
              </div>

              {/* 操作ボタン: スマホでは常時表示、PCではホバー時のみ */}
              <div className="flex justify-start md:justify-end gap-2 md:opacity-0 md:group-hover:opacity-100 transition-opacity border-t md:border-none pt-3 md:pt-0">
                <Link href={`/admin/categories/${cat.id}`} className="flex-1 md:flex-none text-center px-3 py-1.5 text-xs text-gray-600 bg-gray-100 md:bg-transparent rounded-md flex items-center justify-center gap-1 hover:bg-gray-200">
                  <FontAwesomeIcon icon={faEdit} /> <span className="md:hidden">編集</span>
                </Link>
                <button 
                  onClick={() => handleDelete(cat.id, cat.name)}
                  className="flex-1 md:flex-none text-center px-3 py-1.5 text-xs text-red-600 bg-red-50 md:bg-transparent rounded-md flex items-center justify-center gap-1 hover:bg-red-100"
                >
                  <FontAwesomeIcon icon={faTrash} /> <span className="md:hidden">削除</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
};

export default Page;