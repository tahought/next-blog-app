import { prisma } from "@/lib/prisma";
import { NextResponse, NextRequest } from "next/server";

// 一覧取得ルートなので RouteParams は不要です
export const GET = async (req: NextRequest) => {
  try {
    // findUnique ではなく findMany を使って全記事（または公開済み記事）を取得します
    const posts = await prisma.post.findMany({
      where: {
        published: true, // 公開済みの記事のみ取得する場合
      },
      select: {
        id: true,
        title: true,
        content: true,
        published: true,
        coverImageURL: true,
        createdAt: true,
        updatedAt: true,
        categories: {
          select: {
            category: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc", // 新しい順に並べる
      },
    });

    return NextResponse.json(posts);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "投稿記事一覧の取得に失敗しました" },
      { status: 500 },
    );
  }
};