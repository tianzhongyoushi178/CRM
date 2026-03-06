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

    const activity = await prisma.activity.findUnique({
      where: { id },
      include: {
        owner: { select: { id: true, name: true } },
        account: { select: { id: true, name: true } },
        contact: { select: { id: true, firstName: true, lastName: true } },
        opportunity: { select: { id: true, name: true } },
        lead: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    if (!activity) {
      return NextResponse.json(
        { error: "活動が見つかりません" },
        { status: 404 }
      );
    }

    return NextResponse.json(activity);
  } catch (error) {
    console.error("活動取得エラー:", error);
    return NextResponse.json(
      { error: "活動の取得に失敗しました" },
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

    const existing = await prisma.activity.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "活動が見つかりません" },
        { status: 404 }
      );
    }

    const activity = await prisma.activity.update({
      where: { id },
      data: {
        type: body.type,
        subject: body.subject,
        description: body.description || null,
        dueDate: body.dueDate ? new Date(body.dueDate) : null,
        completedDate: body.completedDate ? new Date(body.completedDate) : null,
        status: body.status,
        priority: body.priority,
        accountId: body.accountId || null,
        contactId: body.contactId || null,
        opportunityId: body.opportunityId || null,
        leadId: body.leadId || null,
      },
      include: {
        owner: { select: { id: true, name: true } },
        account: { select: { id: true, name: true } },
        contact: { select: { id: true, firstName: true, lastName: true } },
        opportunity: { select: { id: true, name: true } },
        lead: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    return NextResponse.json(activity);
  } catch (error) {
    console.error("活動更新エラー:", error);
    return NextResponse.json(
      { error: "活動の更新に失敗しました" },
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

    const existing = await prisma.activity.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "活動が見つかりません" },
        { status: 404 }
      );
    }

    await prisma.activity.delete({ where: { id } });

    return NextResponse.json({ message: "活動を削除しました" });
  } catch (error) {
    console.error("活動削除エラー:", error);
    return NextResponse.json(
      { error: "活動の削除に失敗しました" },
      { status: 500 }
    );
  }
}
