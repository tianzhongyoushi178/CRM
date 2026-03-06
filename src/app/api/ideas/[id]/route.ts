import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    const { id } = await params;

    const idea = await prisma.idea.findUnique({
      where: { id },
      include: {
        owner: { select: { id: true, name: true } },
      },
    });

    if (!idea) {
      return NextResponse.json(
        { error: "アイディアが見つかりません" },
        { status: 404 }
      );
    }

    return NextResponse.json(idea);
  } catch (error) {
    console.error("アイディア取得エラー:", error);
    return NextResponse.json(
      { error: "アイディアの取得に失敗しました" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const existing = await prisma.idea.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "アイディアが見つかりません" },
        { status: 404 }
      );
    }

    if (!body.name) {
      return NextResponse.json(
        { error: "アイディア名は必須です" },
        { status: 400 }
      );
    }

    const idea = await prisma.idea.update({
      where: { id },
      data: {
        name: body.name,
        description: body.description || null,
        category: body.category || null,
        status: body.status || null,
      },
    });

    return NextResponse.json(idea);
  } catch (error) {
    console.error("アイディア更新エラー:", error);
    return NextResponse.json(
      { error: "アイディアの更新に失敗しました" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    const { id } = await params;

    const existing = await prisma.idea.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "アイディアが見つかりません" },
        { status: 404 }
      );
    }

    await prisma.idea.delete({ where: { id } });

    return NextResponse.json({ message: "アイディアを削除しました" });
  } catch (error) {
    console.error("アイディア削除エラー:", error);
    return NextResponse.json(
      { error: "アイディアの削除に失敗しました" },
      { status: 500 }
    );
  }
}
