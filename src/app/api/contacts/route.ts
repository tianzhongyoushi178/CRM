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
      ? {
          OR: [
            { firstName: { contains: search, mode: "insensitive" as const } },
            { lastName: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {};

    const [contacts, total] = await Promise.all([
      prisma.contact.findMany({
        where,
        include: {
          account: { select: { id: true, name: true } },
          owner: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.contact.count({ where }),
    ]);

    return NextResponse.json({
      contacts,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("取引先責任者一覧取得エラー:", error);
    return NextResponse.json(
      { error: "取引先責任者の取得に失敗しました" },
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

    if (!body.lastName) {
      return NextResponse.json(
        { error: "姓は必須です" },
        { status: 400 }
      );
    }

    const contact = await prisma.contact.create({
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
        ownerId: session.user.id,
      },
      include: {
        account: { select: { id: true, name: true } },
        owner: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(contact, { status: 201 });
  } catch (error) {
    console.error("取引先責任者作成エラー:", error);
    return NextResponse.json(
      { error: "取引先責任者の作成に失敗しました" },
      { status: 500 }
    );
  }
}
