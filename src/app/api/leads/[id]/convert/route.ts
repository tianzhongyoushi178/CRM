import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    const { id } = await params;

    const lead = await prisma.lead.findUnique({ where: { id } });
    if (!lead) {
      return NextResponse.json(
        { error: "リードが見つかりません" },
        { status: 404 }
      );
    }

    if (lead.isConverted) {
      return NextResponse.json(
        { error: "このリードは既に変換済みです" },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      // 取引先を作成
      const account = await tx.account.create({
        data: {
          name: lead.company || `${lead.lastName} ${lead.firstName}`,
          industry: lead.industry,
          phone: lead.phone,
          address: lead.address,
          city: lead.city,
          prefecture: lead.prefecture,
          postalCode: lead.postalCode,
          ownerId: session.user.id,
        },
      });

      // 取引先責任者を作成
      const contact = await tx.contact.create({
        data: {
          firstName: lead.firstName,
          lastName: lead.lastName,
          email: lead.email,
          phone: lead.phone,
          title: lead.title,
          accountId: account.id,
          address: lead.address,
          city: lead.city,
          prefecture: lead.prefecture,
          postalCode: lead.postalCode,
          description: lead.description,
          ownerId: session.user.id,
        },
      });

      // 商談を作成
      const opportunity = await tx.opportunity.create({
        data: {
          name: `${lead.company || lead.lastName} - 新規商談`,
          stage: "PROSPECTING",
          accountId: account.id,
          ownerId: session.user.id,
        },
      });

      // 商談と取引先責任者を関連付け
      await tx.opportunityContact.create({
        data: {
          opportunityId: opportunity.id,
          contactId: contact.id,
          role: "主担当",
        },
      });

      // リードを変換済みに更新
      await tx.lead.update({
        where: { id },
        data: {
          isConverted: true,
          convertedAccountId: account.id,
          convertedContactId: contact.id,
          convertedOpportunityId: opportunity.id,
        },
      });

      return { account, contact, opportunity };
    });

    return NextResponse.json({
      message: "リードを変換しました",
      accountId: result.account.id,
      contactId: result.contact.id,
      opportunityId: result.opportunity.id,
    });
  } catch (error) {
    console.error("リード変換エラー:", error);
    return NextResponse.json(
      { error: "リードの変換に失敗しました" },
      { status: 500 }
    );
  }
}
