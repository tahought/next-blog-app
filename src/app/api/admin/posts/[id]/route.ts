import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * 重要：Next.jsのルールで、同一階層に page.tsx と route.ts を置くことはできません。
 * このファイルは必ず src/app/api/admin/posts/[id]/route.ts に配置してください。
 */

// 指定したIDの記事を取得 (GET)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  try {
    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        categories: { include: { category: true } },
      },
    });
    if (!post) return NextResponse.json({ error: "記事が見つかりません" }, { status: 404 });
    return NextResponse.json(post);
  } catch (error) {
    return NextResponse.json({ error: "取得に失敗しました" }, { status: 500 });
  }
}

// 指定したIDの記事を更新 (PUT)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  try {
    const body = await request.json();
    const { title, content, coverImageURL, categoryIds } = body;

    const post = await prisma.post.update({
      where: { id },
      data: {
        title,
        content,
        coverImageURL,
        categories: {
          deleteMany: {},
          create: categoryIds.map((categoryId: string) => ({
            category: { connect: { id: categoryId } },
          })),
        },
      },
    });
    return NextResponse.json(post);
  } catch (error) {
    console.error("Update error:", error);
    return NextResponse.json({ error: "更新に失敗しました" }, { status: 500 });
  }
}

// 指定したIDの記事を削除 (DELETE)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  try {
    await prisma.post.delete({ where: { id } });
    return NextResponse.json({ message: "削除しました" });
  } catch (error) {
    return NextResponse.json({ error: "削除に失敗しました" }, { status: 500 });
  }
}