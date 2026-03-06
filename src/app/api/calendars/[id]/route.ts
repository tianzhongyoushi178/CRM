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

    const calendar = await prisma.sharedCalendar.findUnique({
      where: { id },
      include: {
        owner: { select: { id: true, name: true } },
      },
    });

    if (!calendar) {
      return NextResponse.json(
        { error: "共有カレンダーが見つかりません" },
        { status: 404 }
      );
    }

    return NextResponse.json(calendar);
  } catch (error) {
    console.error("共有カレンダー取得エラー:", error);
    return NextResponse.json(
      { error: "共有カレンダーの取得に失敗しました" },
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

    const existing = await prisma.sharedCalendar.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "共有カレンダーが見つかりません" },
        { status: 404 }
      );
    }

    if (!body.name) {
      return NextResponse.json(
        { error: "共有カレンダー名は必須です" },
        { status: 400 }
      );
    }

    const calendar = await prisma.sharedCalendar.update({
      where: { id },
      data: {
        name: body.name,
      },
    });

    return NextResponse.json(calendar);
  } catch (error) {
    console.error("共有カレンダー更新エラー:", error);
    return NextResponse.json(
      { error: "共有カレンダーの更新に失敗しました" },
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

    const existing = await prisma.sharedCalendar.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "共有カレンダーが見つかりません" },
        { status: 404 }
      );
    }

    await prisma.sharedCalendar.delete({ where: { id } });

    return NextResponse.json({ message: "共有カレンダーを削除しました" });
  } catch (error) {
    console.error("共有カレンダー削除エラー:", error);
    return NextResponse.json(
      { error: "共有カレンダーの削除に失敗しました" },
      { status: 500 }
    );
  }
}
