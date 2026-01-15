import { prisma } from "@/lib/prisma";
import { NextResponse, NextRequest } from "next/server";

type RouteParams = {
  params: Promise<{ id: string }>;
};

type RequestBody = {
  name: string;
  imageURL?: string;
  description?: string;
};

export const PUT = async (req: NextRequest, routeParams: RouteParams) => {
  try {
    const { id } = await routeParams.params;
    const body: RequestBody = await req.json();

    const category = await prisma.category.update({
      where: { id },
      data: {
        name: body.name,
        imageURL: body.imageURL,
        description: body.description,
      },
    });
    return NextResponse.json(category);
  } catch (error) {
    return NextResponse.json({ error: "更新に失敗しました" }, { status: 500 });
  }
};

// DELETEなどは変更なし