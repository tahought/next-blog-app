import { prisma } from "@/lib/prisma";
import { NextResponse, NextRequest } from "next/server";

export const GET = async () => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: { select: { posts: true } },
      },
      orderBy: { name: "asc" },
    });
    return NextResponse.json(categories);
  } catch (error) {
    return NextResponse.json({ error: "取得失敗" }, { status: 500 });
  }
};

export const POST = async (req: NextRequest) => {
  try {
    const { name, imageURL, description } = await req.json(); // ← imageURL, descriptionを追加
    if (!name?.trim()) return NextResponse.json({ error: "名前は必須です" }, { status: 400 });

    const category = await prisma.category.create({
      data: {
        name: name.trim(),
        imageURL: imageURL || null,
        description: description || null,
      },
    });
    return NextResponse.json(category);
  } catch (error) {
    return NextResponse.json({ error: "作成失敗" }, { status: 500 });
  }
};