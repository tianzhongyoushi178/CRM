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

    const account = await prisma.account.findUnique({
      where: { id },
      include: {
        owner: { select: { id: true, name: true } },
        contacts: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            title: true,
          },
          orderBy: { createdAt: "desc" },
        },
        opportunities: {
          select: {
            id: true,
            name: true,
            amount: true,
            stage: true,
            closeDate: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!account) {
      return NextResponse.json(
        { error: "取引先が見つかりません" },
        { status: 404 }
      );
    }

    return NextResponse.json(account);
  } catch (error) {
    console.error("取引先取得エラー:", error);
    return NextResponse.json(
      { error: "取引先の取得に失敗しました" },
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

    const existing = await prisma.account.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "取引先が見つかりません" },
        { status: 404 }
      );
    }

    const account = await prisma.account.update({
      where: { id },
      data: {
        name: body.name,
        industry: body.industry || null,
        phone: body.phone || null,
        website: body.website || null,
        address: body.address || null,
        city: body.city || null,
        prefecture: body.prefecture || null,
        postalCode: body.postalCode || null,
        description: body.description || null,
        annualRevenue: body.annualRevenue ? parseFloat(body.annualRevenue) : null,
        employees: body.employees ? parseInt(body.employees, 10) : null,
        rating: body.rating || null,
      },
    });

    return NextResponse.json(account);
  } catch (error) {
    console.error("取引先更新エラー:", error);
    return NextResponse.json(
      { error: "取引先の更新に失敗しました" },
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

    const existing = await prisma.account.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "取引先が見つかりません" },
        { status: 404 }
      );
    }

    await prisma.account.delete({ where: { id } });

    return NextResponse.json({ message: "取引先を削除しました" });
  } catch (error) {
    console.error("取引先削除エラー:", error);
    return NextResponse.json(
      { error: "取引先の削除に失敗しました" },
      { status: 500 }
    );
  }
}
