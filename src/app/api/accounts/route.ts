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

    const [accounts, total] = await Promise.all([
      prisma.account.findMany({
        where,
        include: { owner: { select: { id: true, name: true } } },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.account.count({ where }),
    ]);

    return NextResponse.json({
      accounts,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("取引先一覧取得エラー:", error);
    return NextResponse.json(
      { error: "取引先の取得に失敗しました" },
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

    const account = await prisma.account.create({
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
        ownerId: session.user.id,
      },
    });

    return NextResponse.json(account, { status: 201 });
  } catch (error) {
    console.error("取引先作成エラー:", error);
    return NextResponse.json(
      { error: "取引先の作成に失敗しました" },
      { status: 500 }
    );
  }
}
