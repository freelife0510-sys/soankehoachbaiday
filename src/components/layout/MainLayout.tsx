import { Outlet, Link, useNavigate } from 'react-router-dom';
import { BookOpen, LayoutDashboard, FileText, Settings, Download } from 'lucide-react';
import { saveAs } from 'file-saver';

export default function MainLayout() {
  const navigate = useNavigate();

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <BookOpen className="h-6 w-6 text-blue-600 mr-2" />
          <span className="text-lg font-bold text-gray-900">Kế hoạch bài dạy Pro+</span>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-1">
          <Link to="/app/dashboard" className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-900 hover:bg-gray-100">
            <LayoutDashboard className="mr-3 h-5 w-5 text-gray-500" />
            Bảng điều khiển
          </Link>
          <Link to="/app/lesson-plans/new" className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-900 hover:bg-gray-100">
            <FileText className="mr-3 h-5 w-5 text-gray-500" />
            Tạo kế hoạch bài dạy mới
          </Link>
          <Link to="/app/settings" className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-900 hover:bg-gray-100">
            <Settings className="mr-3 h-5 w-5 text-gray-500" />
            Cài đặt
          </Link>
        </nav>

        <div className="p-4 border-t border-gray-200 text-center">
          <p className="text-xs text-gray-500 mb-2">Chế độ 100% Client-Side</p>
          <p className="text-[10px] text-gray-400">Dữ liệu được bảo mật lưu trên máy tính của bạn.</p>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col h-full overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
