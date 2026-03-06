import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
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

    if (!body.body || typeof body.body !== "string" || body.body.trim() === "") {
      return NextResponse.json(
        { error: "コメント内容は必須です" },
        { status: 400 }
      );
    }

    const comment = await prisma.chatterComment.create({
      data: {
        body: body.body.trim(),
        postId: id,
        authorId: session.user.id,
      },
      include: {
        author: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error("コメント作成エラー:", error);
    return NextResponse.json(
      { error: "コメントの作成に失敗しました" },
      { status: 500 }
    );
  }
}
