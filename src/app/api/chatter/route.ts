import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    const posts = await prisma.chatterPost.findMany({
      include: {
        author: { select: { id: true, name: true } },
        comments: {
          include: {
            author: { select: { id: true, name: true } },
          },
          orderBy: { createdAt: "asc" },
        },
        likes: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ posts });
  } catch (error) {
    console.error("Chatter投稿一覧取得エラー:", error);
    return NextResponse.json(
      { error: "投稿の取得に失敗しました" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    const body = await request.json();

    if (!body.body || typeof body.body !== "string" || body.body.trim() === "") {
      return NextResponse.json(
        { error: "投稿内容は必須です" },
        { status: 400 }
      );
    }

    const post = await prisma.chatterPost.create({
      data: {
        body: body.body.trim(),
        type: body.type || "POST",
        authorId: session.user.id,
      },
      include: {
        author: { select: { id: true, name: true } },
        comments: {
          include: {
            author: { select: { id: true, name: true } },
          },
        },
        likes: true,
      },
    });

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error("Chatter投稿作成エラー:", error);
    return NextResponse.json(
      { error: "投稿の作成に失敗しました" },
      { status: 500 }
    );
  }
}
