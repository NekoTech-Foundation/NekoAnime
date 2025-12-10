import { HistoryList } from "@/components/history/history-list"

export default function HistoryPage() {
  return (
    <div className="min-h-screen pt-20 px-4 md:px-5 pb-10 ml-[80px] md:ml-[250px] transition-all duration-300">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            Lịch sử xem
          </h1>
          <p className="text-gray-400 mt-2">
            Danh sách các anime bạn đã xem gần đây, Hiển thị 30 Bộ anime đã xem của bạn
          </p>
        </div>

        <HistoryList />
      </div>
    </div>
  )
}
