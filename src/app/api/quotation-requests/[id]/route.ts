import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const includeRelations = {
  sePerson: { select: { id: true, name: true } },
  seGroupLeader: { select: { id: true, name: true } },
  seManager: { select: { id: true, name: true } },
  owner: { select: { id: true, name: true } },
  opportunity: { select: { id: true, name: true } },
  salesPerson: { select: { id: true, name: true } },
};

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

    const quotationRequest = await prisma.quotationRequest.findUnique({
      where: { id },
      include: includeRelations,
    });

    if (!quotationRequest) {
      return NextResponse.json(
        { error: "SE見積依頼が見つかりません" },
        { status: 404 }
      );
    }

    return NextResponse.json(quotationRequest);
  } catch (error) {
    console.error("SE見積依頼取得エラー:", error);
    return NextResponse.json(
      { error: "SE見積依頼の取得に失敗しました" },
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

    const existing = await prisma.quotationRequest.findUnique({
      where: { id },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "SE見積依頼が見つかりません" },
        { status: 404 }
      );
    }

    const quotationRequest = await prisma.quotationRequest.update({
      where: { id },
      data: {
        name: body.name,
        title: body.title || null,
        status: body.status,
        assignStatus: body.assignStatus || null,
        opportunityId: body.opportunityId || null,
        accountName: body.accountName || null,
        endUserName: body.endUserName || null,
        quotationNumber: body.quotationNumber || null,
        salesBranch: body.salesBranch || null,
        installLocation: body.installLocation || null,
        installEnvironment: body.installEnvironment || null,
        submissionDeadline: body.submissionDeadline
          ? new Date(body.submissionDeadline)
          : null,
        seNote: body.seNote || null,

        // 基本情報
        salesOffice: body.salesOffice || null,
        salesPersonName: body.salesPersonName || null,
        endUserName2: body.endUserName2 || null,

        // 設置環境
        installEnvType: body.installEnvType || null,
        tempSpecial: body.tempSpecial ?? false,
        cleanRoom: body.cleanRoom ?? false,
        hazardStorage: body.hazardStorage ?? false,
        envOther: body.envOther ?? false,
        tempSpecialDetail: body.tempSpecialDetail || null,
        cleanRoomDetail: body.cleanRoomDetail || null,
        hazardStorageDetail: body.hazardStorageDetail || null,
        envOtherDetail: body.envOtherDetail || null,

        // 荷姿・荷重
        loadType: body.loadType || null,
        loadSize: body.loadSize || null,
        loadWeight: body.loadWeight || null,
        packageCategory: body.packageCategory || null,
        palletSize: body.palletSize || null,
        procurementType: body.procurementType || null,

        // 設置場所
        buildingType: body.buildingType || null,
        installSpace: body.installSpace || null,
        architectDrawing: body.architectDrawing || null,
        exteriorDrawing: body.exteriorDrawing || null,

        // 要求格納数
        storageRequirement: body.storageRequirement || null,

        // 工事関連資料
        constructionDoc: body.constructionDoc || null,

        // SEへの依頼関連
        relatedFilePath: body.relatedFilePath || null,
        reqLayout: body.reqLayout ?? false,
        reqLoadDetail: body.reqLoadDetail ?? false,
        reqCapacity: body.reqCapacity ?? false,
        reqOperation: body.reqOperation ?? false,
        reqOtherDoc: body.reqOtherDoc ?? false,

        // 営業への提出
        submitLayout: body.submitLayout ?? false,
        submitCostSheet: body.submitCostSheet ?? false,
        submitAxialForce: body.submitAxialForce ?? false,
        submitPowerReq: body.submitPowerReq ?? false,
        submitSpecSheet: body.submitSpecSheet ?? false,
        submitOther: body.submitOther ?? false,
        desiredDeadline: body.desiredDeadline
          ? new Date(body.desiredDeadline)
          : null,
        salesComment: body.salesComment || null,

        // 営業課長記入欄
        managerComment: body.managerComment || null,

        // システム情報
        sourceQuotationId: body.sourceQuotationId || null,

        // 担当者ID
        salesPersonId: body.salesPersonId || null,
        sePersonId: body.sePersonId || null,
        seGroupLeaderId: body.seGroupLeaderId || null,
        seManagerId: body.seManagerId || null,

        // SE部門
        seDepartment: body.seDepartment || null,
        seManagerComment: body.seManagerComment || null,

        // SE作業日程
        seWorkStartDate: body.seWorkStartDate
          ? new Date(body.seWorkStartDate)
          : null,
        seWorkEndDate: body.seWorkEndDate
          ? new Date(body.seWorkEndDate)
          : null,
        seWorkEndActual: body.seWorkEndActual
          ? new Date(body.seWorkEndActual)
          : null,
        assignDate: body.assignDate
          ? new Date(body.assignDate)
          : null,
      },
      include: includeRelations,
    });

    return NextResponse.json(quotationRequest);
  } catch (error) {
    console.error("SE見積依頼更新エラー:", error);
    return NextResponse.json(
      { error: "SE見積依頼の更新に失敗しました" },
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

    const existing = await prisma.quotationRequest.findUnique({
      where: { id },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "SE見積依頼が見つかりません" },
        { status: 404 }
      );
    }

    await prisma.quotationRequest.delete({ where: { id } });

    return NextResponse.json({ message: "SE見積依頼を削除しました" });
  } catch (error) {
    console.error("SE見積依頼削除エラー:", error);
    return NextResponse.json(
      { error: "SE見積依頼の削除に失敗しました" },
      { status: 500 }
    );
  }
}
