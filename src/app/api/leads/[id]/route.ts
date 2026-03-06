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

    const lead = await prisma.lead.findUnique({
      where: { id },
      include: {
        owner: { select: { id: true, name: true } },
        activities: {
          select: {
            id: true,
            type: true,
            subject: true,
            status: true,
            dueDate: true,
          },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });

    if (!lead) {
      return NextResponse.json(
        { error: "リードが見つかりません" },
        { status: 404 }
      );
    }

    return NextResponse.json(lead);
  } catch (error) {
    console.error("リード取得エラー:", error);
    return NextResponse.json(
      { error: "リードの取得に失敗しました" },
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

    const existing = await prisma.lead.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "リードが見つかりません" },
        { status: 404 }
      );
    }

    if (!body.lastName) {
      return NextResponse.json(
        { error: "姓は必須です" },
        { status: 400 }
      );
    }

    const lead = await prisma.lead.update({
      where: { id },
      data: {
        firstName: body.firstName || "",
        lastName: body.lastName,
        email: body.email || null,
        phone: body.phone || null,
        company: body.company || null,
        title: body.title || null,
        status: body.status || "NEW",
        source: body.source || null,
        industry: body.industry || null,
        description: body.description || null,
        address: body.address || null,
        city: body.city || null,
        prefecture: body.prefecture || null,
        postalCode: body.postalCode || null,
      },
    });

    return NextResponse.json(lead);
  } catch (error) {
    console.error("リード更新エラー:", error);
    return NextResponse.json(
      { error: "リードの更新に失敗しました" },
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

    const existing = await prisma.lead.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "リードが見つかりません" },
        { status: 404 }
      );
    }

    await prisma.lead.delete({ where: { id } });

    return NextResponse.json({ message: "リードを削除しました" });
  } catch (error) {
    console.error("リード削除エラー:", error);
    return NextResponse.json(
      { error: "リードの削除に失敗しました" },
      { status: 500 }
    );
  }
}
