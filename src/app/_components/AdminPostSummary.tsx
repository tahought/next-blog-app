// src/app/_components/AdminPostSummary.tsx (一部抜粋)
return (
  <div className="
    grid grid-cols-1 md:grid-cols-[1fr_120px_180px_100px] 
    gap-2 md:gap-4 px-6 py-4 items-start md:items-center 
    hover:bg-gray-50 transition-colors group
  ">
    {/* タイトル列: 確実に1行で切り取る */}
    <div className="flex items-center gap-3 min-w-0">
      <FontAwesomeIcon icon={faFileLines} className="hidden md:block text-gray-300 group-hover:text-blue-500 transition-colors" />
      <Link href={`/admin/posts/${post.id}`} className="font-bold md:font-medium text-gray-800 hover:text-blue-600 truncate text-base md:text-sm">
        {post.title}
      </Link>
    </div>

    {/* 日付・カテゴリ・操作ボタンのロジックは以前のレスポンシブ版を維持 */}
    {/* md:grid-cols の数値 (120, 180, 100) を page.tsx のヘッダーと合わせるのがコツです */}
  </div>
);