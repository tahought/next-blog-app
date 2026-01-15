import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// カテゴリ一覧の取得 (GET)
// 管理画面での表示用に利用します
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: {
        name: "asc",
      },
    });
    return NextResponse.json(categories);
  } catch (error) {
    return NextResponse.json(
      { error: "カテゴリの取得に失敗しました" },
      { status: 500 }
    );
  }
}

// カテゴリの新規作成 (POST)
// UIからの「カテゴリ追加」リクエストを処理します
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name } = body;

    // バリデーション: 名前が空でないかチェック
    if (!name || name.trim() === "") {
      return NextResponse.json(
        { error: "カテゴリ名は必須です" },
        { status: 400 }
      );
    }

    // データベースに保存
    const category = await prisma.category.create({
      data: {
        name: name.trim(),
      },
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error("Create Category Error:", error);
    return NextResponse.json(
      { error: "カテゴリの作成に失敗しました" },
      { status: 500 }
    );
  }
}