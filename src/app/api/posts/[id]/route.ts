import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET メソッドの例
export async function GET(
  request: NextRequest,
  // [修正] params を Promise 型にする
  { params }: { params: Promise<{ id: string }> }
) {
  // [修正] 使用前に await する
  const { id } = await params;

  try {
    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        categories: {
          include: {
            category: true,
          },
        },
      },
    });

    if (!post) {
      return NextResponse.json(
        { error: "記事が見つかりませんでした" },
        { status: 404 }
      );
    }

    return NextResponse.json(post);
  } catch (error) {
    return NextResponse.json(
      { error: "データの取得に失敗しました" },
      { status: 500 }
    );
  }
}

// PUT や DELETE も同様に修正が必要です
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  // ... 以下の処理 ...
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  // ... 以下の処理 ...
}