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

    const contact = await prisma.contact.findUnique({
      where: { id },
      include: {
        account: { select: { id: true, name: true } },
        owner: { select: { id: true, name: true } },
        opportunityContacts: {
          include: {
            opportunity: {
              select: {
                id: true,
                name: true,
                amount: true,
                stage: true,
                closeDate: true,
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

    if (!contact) {
      return NextResponse.json(
        { error: "取引先責任者が見つかりません" },
        { status: 404 }
      );
    }

    return NextResponse.json(contact);
  } catch (error) {
    console.error("取引先責任者取得エラー:", error);
    return NextResponse.json(
      { error: "取引先責任者の取得に失敗しました" },
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

    if (!body.lastName) {
      return NextResponse.json(
        { error: "姓は必須です" },
        { status: 400 }
      );
    }

    const existing = await prisma.contact.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "取引先責任者が見つかりません" },
        { status: 404 }
      );
    }

    const contact = await prisma.contact.update({
      where: { id },
      data: {
        firstName: body.firstName || "",
        lastName: body.lastName,
        email: body.email || null,
        phone: body.phone || null,
        mobile: body.mobile || null,
        title: body.title || null,
        department: body.department || null,
        accountId: body.accountId || null,
        address: body.address || null,
        city: body.city || null,
        prefecture: body.prefecture || null,
        postalCode: body.postalCode || null,
        description: body.description || null,
      },
      include: {
        account: { select: { id: true, name: true } },
        owner: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(contact);
  } catch (error) {
    console.error("取引先責任者更新エラー:", error);
    return NextResponse.json(
      { error: "取引先責任者の更新に失敗しました" },
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

    const existing = await prisma.contact.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "取引先責任者が見つかりません" },
        { status: 404 }
      );
    }

    await prisma.contact.delete({ where: { id } });

    return NextResponse.json({ message: "取引先責任者を削除しました" });
  } catch (error) {
    console.error("取引先責任者削除エラー:", error);
    return NextResponse.json(
      { error: "取引先責任者の削除に失敗しました" },
      { status: 500 }
    );
  }
}
