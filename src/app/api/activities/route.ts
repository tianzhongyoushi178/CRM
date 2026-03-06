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
      ? { subject: { contains: search, mode: "insensitive" as const } }
      : {};

    const [activities, total] = await Promise.all([
      prisma.activity.findMany({
        where,
        include: {
          owner: { select: { id: true, name: true } },
          account: { select: { id: true, name: true } },
          contact: { select: { id: true, firstName: true, lastName: true } },
          opportunity: { select: { id: true, name: true } },
          lead: { select: { id: true, firstName: true, lastName: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.activity.count({ where }),
    ]);

    return NextResponse.json({
      activities,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("活動一覧取得エラー:", error);
    return NextResponse.json(
      { error: "活動の取得に失敗しました" },
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

    if (!body.subject || !body.type) {
      return NextResponse.json(
        { error: "件名と種類は必須です" },
        { status: 400 }
      );
    }

    const activity = await prisma.activity.create({
      data: {
        type: body.type,
        subject: body.subject,
        description: body.description || null,
        dueDate: body.dueDate ? new Date(body.dueDate) : null,
        status: body.status || "OPEN",
        priority: body.priority || "NORMAL",
        accountId: body.accountId || null,
        contactId: body.contactId || null,
        opportunityId: body.opportunityId || null,
        leadId: body.leadId || null,
        ownerId: session.user.id,
      },
      include: {
        owner: { select: { id: true, name: true } },
        account: { select: { id: true, name: true } },
        contact: { select: { id: true, firstName: true, lastName: true } },
        opportunity: { select: { id: true, name: true } },
        lead: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    return NextResponse.json(activity, { status: 201 });
  } catch (error) {
    console.error("活動作成エラー:", error);
    return NextResponse.json(
      { error: "活動の作成に失敗しました" },
      { status: 500 }
    );
  }
}
