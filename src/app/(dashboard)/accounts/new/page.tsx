import AccountForm from "@/components/AccountForm";

export default function NewAccountPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#032D60]">取引先を作成</h1>
        <p className="mt-1 text-sm text-gray-500">新しい取引先を登録します</p>
      </div>
      <AccountForm />
    </div>
  );
}
