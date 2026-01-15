import { prisma } from "@/lib/prisma";
import { NextResponse, NextRequest } from "next/server";

// カテゴリ一覧の取得：記事数を含めて取得
export const GET = async () => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { posts: true }, // 中間テーブル PostCategory の件数をカウント
        },
      },
      orderBy: { name: "asc" },
    });
    return NextResponse.json(categories);
  } catch (error) {
    return NextResponse.json({ error: "カテゴリの取得に失敗しました" }, { status: 500 });
  }
};

// カテゴリの新規作成
export const POST = async (req: NextRequest) => {
  try {
    const { name } = await req.json();
    
    // バリデーション：空文字チェック
    if (!name || name.trim() === "") {
      return NextResponse.json({ error: "名前を入力してください" }, { status: 400 });
    }

    // 重複チェック
    const exists = await prisma.category.findUnique({ where: { name: name.trim() } });
    if (exists) {
      return NextResponse.json({ error: "そのカテゴリは既に存在します" }, { status: 400 });
    }

    const category = await prisma.category.create({
      data: { name: name.trim() },
    });
    return NextResponse.json(category);
  } catch (error) {
    return NextResponse.json({ error: "作成に失敗しました" }, { status: 500 });
  }
};