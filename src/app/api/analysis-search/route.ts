import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface WhereCondition {
  name?: { contains: string };
  opportunity?: { name: { contains: string } };
  weight?: string;
  installHeight?: string;
  temperatureZone?: string;
  cleanLevel?: string;
  explosionProof?: string;
  oilSmoke?: string;
  gas?: string;
  plCsType?: string;
  loadL?: string;
  loadW?: string;
  packageType?: string;
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);

    const where: WhereCondition = {};

    const name = searchParams.get("name");
    if (name) {
      const converted = name.replace(/\*/g, "%");
      where.name = { contains: converted };
    }

    const opportunityName = searchParams.get("opportunityName");
    if (opportunityName) {
      const converted = opportunityName.replace(/\*/g, "%");
      where.opportunity = { name: { contains: converted } };
    }

    const exactFields = [
      "weight",
      "installHeight",
      "temperatureZone",
      "cleanLevel",
      "explosionProof",
      "oilSmoke",
      "gas",
      "plCsType",
      "loadL",
      "loadW",
      "packageType",
    ] as const;

    for (const field of exactFields) {
      const value = searchParams.get(field);
      if (value) {
        where[field] = value;
      }
    }

    const results = await prisma.analysisInfo.findMany({
      where,
      include: {
        opportunity: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 200,
    });

    return NextResponse.json({ results, total: results.length });
  } catch (error) {
    console.error("分析情報検索エラー:", error);
    return NextResponse.json(
      { error: "分析情報の検索に失敗しました" },
      { status: 500 }
    );
  }
}
