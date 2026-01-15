import { prisma } from "@/lib/prisma";
import { NextResponse, NextRequest } from "next/server";

type RouteParams = { params: Promise<{ id: string }> };

export const PUT = async (req: NextRequest, routeParams: RouteParams) => {
  try {
    const { id } = await routeParams.params;
    const { name, imageURL, description } = await req.json(); // ← name以外も受け取る
    
    const category = await prisma.category.update({
      where: { id },
      data: { 
        name: name?.trim(), 
        imageURL, 
        description 
      },
    });
    return NextResponse.json(category);
  } catch (error) {
    return NextResponse.json({ error: "更新失敗" }, { status: 500 });
  }
};

export const DELETE = async (req: NextRequest, routeParams: RouteParams) => {
  try {
    const { id } = await routeParams.params;
    await prisma.category.delete({ where: { id } });
    return NextResponse.json({ msg: "削除しました" });
  } catch (error) {
    return NextResponse.json({ error: "削除失敗" }, { status: 500 });
  }
};