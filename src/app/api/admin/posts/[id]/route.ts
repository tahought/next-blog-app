import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> } // [修正] Promise型
) {
  const { id } = await params; // [修正] awaitを追加

  try {
    const post = await prisma.post.findUnique({
      where: { id },
      include: { categories: { include: { category: true } } },
    });
    if (!post) return NextResponse.json({ error: "Not Found" }, { status: 404 });
    return NextResponse.json(post);
  } catch (error) {
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params; // [修正] awaitを追加
  const body = await request.json();

  try {
    const updatedPost = await prisma.$transaction(async (tx) => {
      // 一旦既存のカテゴリ紐付けを削除
      await tx.postCategory.deleteMany({ where: { postId: id } });
      
      // 記事を更新し、新しいカテゴリを紐付け
      return await tx.post.update({
        where: { id },
        data: {
          title: body.title,
          content: body.content,
          coverImageURL: body.coverImageURL,
          categories: {
            create: body.categoryIds.map((catId: string) => ({
              categoryId: catId,
            })),
          },
        },
      });
    });

    return NextResponse.json(updatedPost);
  } catch (error) {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params; // [修正] awaitを追加
  try {
    await prisma.post.delete({ where: { id } });
    return NextResponse.json({ message: "Deleted" });
  } catch (error) {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}