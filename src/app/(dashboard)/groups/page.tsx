export default function GroupsPage() {
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#032D60]">グループ</h1>
          <p className="mt-1 text-sm text-gray-500">最近参照したグループ</p>
        </div>
        <button
          type="button"
          className="rounded-lg bg-[#0070D2] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#005FB2]"
        >
          新規
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-[#DDDBDA] bg-white shadow-sm">
        <div className="flex flex-col items-center justify-center py-20">
          <svg
            className="h-24 w-24 text-[#0070D2] opacity-30"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          <p className="mt-4 text-sm text-[#706E6B] text-center">
            最近どのグループも表示していません。
            <br />
            リストビューを切り替えてください。
          </p>
        </div>
      </div>
    </div>
  );
}
