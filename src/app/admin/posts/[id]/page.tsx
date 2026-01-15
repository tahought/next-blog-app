"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner, faChevronLeft, faHashtag, faImage, faClock, faFileWord, faCloudArrowUp, faCircleCheck } from "@fortawesome/free-solid-svg-icons";
import { twMerge } from "tailwind-merge";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast, { Toaster } from "react-hot-toast";
import { postSchema } from "@/lib/schemas";
import Link from "next/link";
import dayjs from "dayjs";

const Page: React.FC = () => {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const [isInitialized, setIsInitialized] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "error">("saved");
  const [allCategories, setAllCategories] = useState<any[]>([]);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    resolver: zodResolver(postSchema),
    defaultValues: { title: "", content: "", coverImageURL: "", categoryIds: [] as string[] }
  });

  const content = watch("content") || "";
  const title = watch("title") || "";
  const coverImageUrl = watch("coverImageURL");
  const selectedCategoryIds = watch("categoryIds");

  // 【追加機能①】リアルタイム統計計算 (文字数 & 読了時間)
  const stats = useMemo(() => {
    const words = content.trim() ? content.trim().length : 0;
    const minutes = Math.ceil(words / 500); // 1分間500文字換算
    return { words, minutes };
  }, [content]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [postRes, catRes] = await Promise.all([
          fetch(`/api/posts/${id}`),
          fetch("/api/categories")
        ]);
        const postData = await postRes.json();
        const catData = await catRes.json();
        setAllCategories(catData);
        setValue("title", postData.title);
        setValue("content", postData.content);
        setValue("coverImageURL", postData.coverImageURL);
        setValue("categoryIds", postData.categories.map((c: any) => c.category.id));
        setIsInitialized(true);
      } catch (e) { toast.error("データの読み込みに失敗しました"); }
    };
    fetchData();
  }, [id, setValue]);

  const onSubmit = async (data: any) => {
    setSaveStatus("saving");
    try {
      const res = await fetch(`/api/admin/posts/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error();
      setSaveStatus("saved");
      toast.success("変更を保存しました");
    } catch (e) {
      setSaveStatus("error");
      toast.error("保存に失敗しました");
    }
  };

  if (!isInitialized) return <div className="p-20 text-center text-gray-400">Loading editor...</div>;

  return (
    <main className="min-h-screen bg-white">
      <Toaster />
      
      {/* 【追加機能②】ステータスバー付加のヘッドバー */}
      <nav className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 py-2 flex justify-between items-center">
        <div className="flex items-center gap-4 text-gray-500">
          <Link href="/admin/posts" className="hover:bg-gray-100 p-2 rounded-md transition"><FontAwesomeIcon icon={faChevronLeft} /></Link>
          <div className="flex items-center gap-2 text-xs font-medium">
            {saveStatus === "saving" ? (
              <><FontAwesomeIcon icon={faCloudArrowUp} className="animate-bounce" /> 保存中...</>
            ) : (
              <><FontAwesomeIcon icon={faCircleCheck} className="text-green-500" /> 保存済み</>
            )}
          </div>
        </div>
        <button onClick={handleSubmit(onSubmit)} className="bg-gray-900 text-white px-5 py-1.5 rounded-md text-sm font-bold hover:bg-gray-800 transition">
          公開設定を更新
        </button>
      </nav>

      {/* カバー画像プレビューエリア */}
      <div className="h-64 w-full bg-gray-50 relative overflow-hidden">
        {coverImageUrl ? (
          <img src={coverImageUrl} alt="Cover" className="w-full h-full object-cover opacity-90" />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-200 text-sm">カバー画像が設定されていません</div>
        )}
      </div>

      <div className="max-w-4xl mx-auto px-16 -mt-16 relative z-10">
        <div className="bg-white rounded-t-3xl p-12 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
          
          {/* 巨大なドキュメントタイトル */}
          <textarea
            {...register("title")}
            placeholder="無題"
            className="w-full text-6xl font-extrabold border-none focus:ring-0 resize-none placeholder-gray-100 text-gray-900 leading-tight mb-8"
            rows={1}
          />

          {/* 【追加機能③】プロパティ管理セクション */}
          <div className="space-y-4 mb-12 text-sm text-gray-500 border-b border-gray-50 pb-8">
            <div className="grid grid-cols-[140px_1fr] items-center">
              <span className="flex items-center gap-2"><FontAwesomeIcon icon={faHashtag} className="w-4" /> カテゴリ</span>
              <div className="flex flex-wrap gap-1.5">
                {allCategories.map(cat => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      const next = selectedCategoryIds.includes(cat.id) 
                        ? selectedCategoryIds.filter(v => v !== cat.id) 
                        : [...selectedCategoryIds, cat.id];
                      setValue("categoryIds", next);
                    }}
                    className={twMerge(
                      "px-3 py-1 rounded-full border transition-all font-bold text-[11px]",
                      selectedCategoryIds.includes(cat.id) ? "bg-blue-50 border-blue-200 text-blue-600" : "bg-white border-gray-200 text-gray-400 hover:border-gray-400"
                    )}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-[140px_1fr] items-center">
              <span className="flex items-center gap-2"><FontAwesomeIcon icon={faImage} className="w-4" /> カバー画像</span>
              <input {...register("coverImageURL")} placeholder="URLを入力して反映..." className="border-none focus:ring-0 text-gray-400 p-0 text-sm bg-transparent w-full" />
            </div>

            {/* 【追加機能④】自動解析データ */}
            <div className="grid grid-cols-[140px_1fr] items-center">
              <span className="flex items-center gap-2"><FontAwesomeIcon icon={faClock} className="w-4" /> 読了目安</span>
              <span className="text-gray-900 font-medium">約 {stats.minutes} 分 ({stats.words} 文字)</span>
            </div>
          </div>

          {/* 本文エディタエリア */}
          <textarea
            {...register("content")}
            placeholder="ここに内容を入力..."
            className="w-full min-h-[600px] border-none focus:ring-0 text-xl leading-relaxed text-gray-800 placeholder-gray-100 resize-none"
          />
        </div>
      </div>
    </main>
  );
};

export default Page;