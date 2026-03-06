import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const skip = (page - 1) * limit;

    const where = search
      ? { name: { contains: search, mode: "insensitive" as const } }
      : {};

    const [calendars, total] = await Promise.all([
      prisma.sharedCalendar.findMany({
        where,
        include: { owner: { select: { id: true, name: true } } },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.sharedCalendar.count({ where }),
    ]);

    return NextResponse.json({
      calendars,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("共有カレンダー一覧取得エラー:", error);
    return NextResponse.json(
      { error: "共有カレンダーの取得に失敗しました" },
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

    if (!body.name) {
      return NextResponse.json(
        { error: "共有カレンダー名は必須です" },
        { status: 400 }
      );
    }

    const calendar = await prisma.sharedCalendar.create({
      data: {
        name: body.name,
        ownerId: session.user.id,
      },
    });

    return NextResponse.json(calendar, { status: 201 });
  } catch (error) {
    console.error("共有カレンダー作成エラー:", error);
    return NextResponse.json(
      { error: "共有カレンダーの作成に失敗しました" },
      { status: 500 }
    );
  }
}
