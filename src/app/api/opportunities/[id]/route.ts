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

    const opportunity = await prisma.opportunity.findUnique({
      where: { id },
      include: {
        account: { select: { id: true, name: true } },
        owner: { select: { id: true, name: true } },
        contacts: {
          include: {
            contact: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
                title: true,
              },
            },
          },
        },
        activities: {
          orderBy: { createdAt: "desc" },
          take: 10,
          include: {
            owner: { select: { id: true, name: true } },
          },
        },
      },
    });

    if (!opportunity) {
      return NextResponse.json(
        { error: "商談が見つかりません" },
        { status: 404 }
      );
    }

    return NextResponse.json(opportunity);
  } catch (error) {
    console.error("商談取得エラー:", error);
    return NextResponse.json(
      { error: "商談の取得に失敗しました" },
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

    const existing = await prisma.opportunity.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "商談が見つかりません" },
        { status: 404 }
      );
    }

    const opportunity = await prisma.opportunity.update({
      where: { id },
      data: {
        name: body.name,
        amount: body.amount != null ? parseFloat(String(body.amount)) : null,
        stage: body.stage,
        probability: body.probability != null ? parseInt(String(body.probability), 10) : null,
        closeDate: body.closeDate ? new Date(body.closeDate) : null,
        description: body.description || null,
        accountId: body.accountId || null,
      },
      include: {
        account: { select: { id: true, name: true } },
        owner: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(opportunity);
  } catch (error) {
    console.error("商談更新エラー:", error);
    return NextResponse.json(
      { error: "商談の更新に失敗しました" },
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

    const existing = await prisma.opportunity.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "商談が見つかりません" },
        { status: 404 }
      );
    }

    await prisma.opportunity.delete({ where: { id } });

    return NextResponse.json({ message: "商談を削除しました" });
  } catch (error) {
    console.error("商談削除エラー:", error);
    return NextResponse.json(
      { error: "商談の削除に失敗しました" },
      { status: 500 }
    );
  }
}
