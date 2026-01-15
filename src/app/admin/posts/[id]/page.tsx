"use client";
import { useState, useEffect, Suspense } from "react"; // Suspenseを追加
import { useParams, useSearchParams } from "next/navigation"; // useSearchParamsを追加

import type { Post } from "@/app/_types/Post";
import type { PostApiResponse } from "@/app/_types/PostApiResponse";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner, faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";
import Image from "next/image";

import DOMPurify from "isomorphic-dompurify";

const PostDetail: React.FC = () => {
  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const { id } = useParams() as { id: string };
  const searchParams = useSearchParams();
  // URLに ?preview=true が含まれているか判定
  const isPreviewMode = searchParams.get("preview") === "true";

  useEffect(() => {
    const fetchPost = async () => {
      setIsLoading(true);
      try {
        const requestUrl = `/api/posts/${id}`;
        const response = await fetch(requestUrl, {
          method: "GET",
          cache: "no-store",
        });
        if (!response.ok) {
          throw new Error("データの取得に失敗しました");
        }
        const res: PostApiResponse = await response.json();

        // 【重要】下書きかつプレビューモードでない場合はアクセス拒否
        if (!res.published && !isPreviewMode) {
          throw new Error("この記事は現在非公開（下書き）です。");
        }

        setPost({
          id: res.id,
          title: res.title,
          content: res.content,
          published: res.published,
          coverImage: {
            url: res.coverImageURL,
            width: 1000,
            height: 1000,
          },
          createdAt: res.createdAt,
          categories: res.categories.map((category) => ({
            id: category.category.id,
            name: category.category.name,
          })),
        });
      } catch (e) {
        setFetchError(
          e instanceof Error ? e.message : "予期せぬエラーが発生しました",
        );
      } finally {
        setIsLoading(false);
      }
    };
    fetchPost();
  }, [id, isPreviewMode]);

  if (fetchError) {
    return (
      <div className="max-w-4xl mx-auto p-12 text-center">
        <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-500 mb-4" size="3x" />
        <div className="text-xl font-bold text-gray-800">{fetchError}</div>
      </div>
    );
  }

  if (isLoading || !post) {
    return (
      <div className="text-gray-500 p-12 text-center">
        <FontAwesomeIcon icon={faSpinner} className="mr-1 animate-spin" />
        Loading...
      </div>
    );
  }

  // サニタイズ設定を見直し（段落や見出しを許可）
  const safeHTML = DOMPurify.sanitize(post.content, {
    ALLOWED_TAGS: ["b", "strong", "i", "em", "u", "br", "p", "div", "h1", "h2", "h3"],
  });

  return (
    <main className="max-w-4xl mx-auto p-6 md:p-12 bg-white min-h-screen">
      {/* プレビューモード用のバナー表示 */}
      {isPreviewMode && !post.published && (
        <div className="bg-amber-50 border-l-4 border-amber-500 text-amber-700 p-4 mb-8 rounded shadow-sm">
          <p className="font-bold flex items-center">
            <FontAwesomeIcon icon={faExclamationTriangle} className="mr-2" />
            プレビューモード
          </p>
          <p className="text-sm italic">この記事は現在「下書き」状態です。管理者以外には表示されません。</p>
        </div>
      )}

      <article className="space-y-8">
        <header>
          <div className="flex gap-2 mb-4">
            {post.categories.map(c => (
              <span key={c.id} className="text-[10px] font-black uppercase tracking-widest bg-slate-100 text-slate-500 px-2 py-1 rounded">
                {c.name}
              </span>
            ))}
          </div>
          <h1 className="text-4xl font-black text-slate-900 leading-tight mb-4">{post.title}</h1>
          <time className="text-slate-400 text-sm font-medium italic">
            {new Date(post.createdAt).toLocaleDateString('ja-JP')}
          </time>
        </header>

        <div className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl shadow-slate-200">
          <Image
            src={post.coverImage.url}
            alt={post.title}
            fill
            priority
            className="object-cover"
          />
        </div>

        <div 
          className="prose prose-slate max-w-none text-slate-700 leading-relaxed text-lg"
          dangerouslySetInnerHTML={{ __html: safeHTML }} 
        />
      </article>
    </main>
  );
};

// useSearchParamsを使うコンポーネントはSuspenseでラップする必要がある（Next.jsの仕様）
const Page = () => (
  <Suspense fallback={<div className="p-12 text-center">Loading...</div>}>
    <PostDetail />
  </Suspense>
);

export default Page;