import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import QuotationRequestForm from "@/components/QuotationRequestForm";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditQuotationRequestPage({
  params,
}: PageProps) {
  const session = await auth();
  if (!session) redirect("/login");

  const { id } = await params;

  const qr = await prisma.quotationRequest.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      title: true,
      status: true,
      assignStatus: true,
      opportunityId: true,
      accountName: true,
      endUserName: true,
      quotationNumber: true,
      salesBranch: true,
      installLocation: true,
      installEnvironment: true,
      submissionDeadline: true,
      seNote: true,
      // String系
      salesOffice: true,
      salesPersonName: true,
      endUserName2: true,
      installEnvType: true,
      tempSpecialDetail: true,
      cleanRoomDetail: true,
      hazardStorageDetail: true,
      envOtherDetail: true,
      loadType: true,
      loadSize: true,
      loadWeight: true,
      packageCategory: true,
      palletSize: true,
      procurementType: true,
      buildingType: true,
      installSpace: true,
      architectDrawing: true,
      exteriorDrawing: true,
      storageRequirement: true,
      constructionDoc: true,
      relatedFilePath: true,
      salesComment: true,
      managerComment: true,
      sourceQuotationId: true,
      seDepartment: true,
      seManagerComment: true,
      salesPersonId: true,
      sePersonId: true,
      seGroupLeaderId: true,
      seManagerId: true,
      // Boolean系
      tempSpecial: true,
      cleanRoom: true,
      hazardStorage: true,
      envOther: true,
      reqLayout: true,
      reqLoadDetail: true,
      reqCapacity: true,
      reqOperation: true,
      reqOtherDoc: true,
      submitLayout: true,
      submitCostSheet: true,
      submitAxialForce: true,
      submitPowerReq: true,
      submitSpecSheet: true,
      submitOther: true,
      // DateTime系
      desiredDeadline: true,
      seWorkStartDate: true,
      seWorkEndDate: true,
      seWorkEndActual: true,
      assignDate: true,
    },
  });

  if (!qr) notFound();

  const initialData = {
    id: qr.id,
    name: qr.name,
    title: qr.title,
    status: qr.status,
    assignStatus: qr.assignStatus,
    opportunityId: qr.opportunityId,
    accountName: qr.accountName,
    endUserName: qr.endUserName,
    quotationNumber: qr.quotationNumber,
    salesBranch: qr.salesBranch,
    installLocation: qr.installLocation,
    installEnvironment: qr.installEnvironment,
    submissionDeadline: qr.submissionDeadline
      ? qr.submissionDeadline.toISOString()
      : null,
    seNote: qr.seNote,
    // String系
    salesOffice: qr.salesOffice,
    salesPersonName: qr.salesPersonName,
    endUserName2: qr.endUserName2,
    installEnvType: qr.installEnvType,
    tempSpecialDetail: qr.tempSpecialDetail,
    cleanRoomDetail: qr.cleanRoomDetail,
    hazardStorageDetail: qr.hazardStorageDetail,
    envOtherDetail: qr.envOtherDetail,
    loadType: qr.loadType,
    loadSize: qr.loadSize,
    loadWeight: qr.loadWeight,
    packageCategory: qr.packageCategory,
    palletSize: qr.palletSize,
    procurementType: qr.procurementType,
    buildingType: qr.buildingType,
    installSpace: qr.installSpace,
    architectDrawing: qr.architectDrawing,
    exteriorDrawing: qr.exteriorDrawing,
    storageRequirement: qr.storageRequirement,
    constructionDoc: qr.constructionDoc,
    relatedFilePath: qr.relatedFilePath,
    salesComment: qr.salesComment,
    managerComment: qr.managerComment,
    sourceQuotationId: qr.sourceQuotationId,
    seDepartment: qr.seDepartment,
    seManagerComment: qr.seManagerComment,
    salesPersonId: qr.salesPersonId,
    sePersonId: qr.sePersonId,
    seGroupLeaderId: qr.seGroupLeaderId,
    seManagerId: qr.seManagerId,
    // Boolean系
    tempSpecial: qr.tempSpecial,
    cleanRoom: qr.cleanRoom,
    hazardStorage: qr.hazardStorage,
    envOther: qr.envOther,
    reqLayout: qr.reqLayout,
    reqLoadDetail: qr.reqLoadDetail,
    reqCapacity: qr.reqCapacity,
    reqOperation: qr.reqOperation,
    reqOtherDoc: qr.reqOtherDoc,
    submitLayout: qr.submitLayout,
    submitCostSheet: qr.submitCostSheet,
    submitAxialForce: qr.submitAxialForce,
    submitPowerReq: qr.submitPowerReq,
    submitSpecSheet: qr.submitSpecSheet,
    submitOther: qr.submitOther,
    // DateTime系
    desiredDeadline: qr.desiredDeadline
      ? qr.desiredDeadline.toISOString()
      : null,
    seWorkStartDate: qr.seWorkStartDate
      ? qr.seWorkStartDate.toISOString()
      : null,
    seWorkEndDate: qr.seWorkEndDate
      ? qr.seWorkEndDate.toISOString()
      : null,
    seWorkEndActual: qr.seWorkEndActual
      ? qr.seWorkEndActual.toISOString()
      : null,
    assignDate: qr.assignDate
      ? qr.assignDate.toISOString()
      : null,
  };

  return (
    <div>
      {/* パンくずリスト */}
      <nav className="flex items-center gap-1 text-sm text-[#706E6B] mb-6">
        <Link
          href="/quotation-requests"
          className="hover:text-[#0070D2]"
        >
          SE見積依頼
        </Link>
        <ChevronRight className="h-4 w-4" />
        <Link
          href={`/quotation-requests/${id}`}
          className="hover:text-[#0070D2]"
        >
          {qr.name}
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-[#3E3E3C]">編集</span>
      </nav>

      <div className="rounded-xl bg-white shadow-sm border border-[#DDDBDA] p-6">
        <h1 className="text-xl font-bold text-[#3E3E3C] mb-6">
          SE見積依頼を編集
        </h1>
        <QuotationRequestForm initialData={initialData} isEdit />
      </div>
    </div>
  );
}
