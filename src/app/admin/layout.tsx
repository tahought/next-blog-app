"use client";
import { useState } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileLines, faTags, faHouse, faBars, faXmark } from "@fortawesome/free-solid-svg-icons";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false); // モバイルメニューの開閉状態

  const menuItems = [
    { name: "ホーム", href: "/", icon: faHouse },
    { name: "記事管理", href: "/admin/posts", icon: faFileLines },
    { name: "カテゴリ管理", href: "/admin/categories", icon: faTags },
  ];

  return (
    <div className="flex min-h-screen bg-[#fbfbfa]">
      {/* モバイル用ハンバーガーボタン (PCでは非表示) */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white border border-gray-200 rounded-md shadow-sm"
      >
        <FontAwesomeIcon icon={isOpen ? faXmark : faBars} />
      </button>

      {/* サイドバー (スマホでは isOpen の時だけ表示) */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-[#f7f7f5] border-r border-gray-200 transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <div className="p-6 font-bold text-gray-500 text-sm uppercase tracking-widest border-b border-gray-200/50">
          My Blog Admin
        </div>
        <nav className="p-4 space-y-1">
          {menuItems.map((item) => (
            <Link 
              key={item.name} 
              href={item.href} 
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-200 rounded-md transition-colors text-sm font-medium"
            >
              <FontAwesomeIcon icon={item.icon} className="w-4 text-gray-400" />
              {item.name}
            </Link>
          ))}
        </nav>
      </aside>

      {/* モバイルメニュー展開時のオーバーレイ */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 md:hidden"
        />
      )}

      {/* メインコンテンツ */}
      <main className="flex-1 md:ml-64 min-h-screen w-full overflow-x-hidden">
  <div className="max-w-6xl mx-auto py-8 px-4 md:py-12 md:px-10">
    {children}
  </div>
</main>
    </div>
  );
}