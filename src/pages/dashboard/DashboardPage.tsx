import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, FileText, Calendar, Clock, BookOpen, ChevronRight, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useAppStore } from '@/store/appStore';

export default function DashboardPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const { savedLessonPlans, deleteLessonPlan } = useAppStore();

  const filteredPlans = savedLessonPlans?.filter((plan: any) => 
    plan.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    plan.subject?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Danh sách Kế hoạch Bài dạy</h1>
          <p className="text-gray-500 mt-1">Quản lý và chỉnh sửa các giáo án của bạn</p>
        </div>
        <Link
          to="/app/lesson-plans/new"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
        >
          <Plus className="mr-2 h-5 w-5" />
          Tạo KHBD mới
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Tìm kiếm theo tên bài, môn học..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          {filteredPlans.length > 0 ? (
            filteredPlans.map((plan: any) => (
              <Link
                key={plan.id}
                to={`/app/lesson-plans/${plan.id}`}
                className="block hover:bg-gray-50 transition-colors group"
              >
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                      <FileText className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {plan.title || 'Bài học chưa có tên'}
                      </h3>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <BookOpen className="h-4 w-4" />
                          {plan.subject} - {plan.grade}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {plan.durationMinutes} phút
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {plan.updatedAt ? format(new Date(plan.updatedAt), 'dd/MM/yyyy', { locale: vi }) : 'Chưa có dữ liệu'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={(e) => {
                        e.preventDefault();
                        if (confirm('Bạn có chắc muốn xóa KHBD này khỏi thiết bị?')) {
                          deleteLessonPlan(plan.id);
                        }
                      }}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                      title="Xóa kế hoạch"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                    <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="p-8 text-center text-gray-500">
              {searchTerm ? 'Không tìm thấy KHBD nào phù hợp.' : 'Bạn chưa tạo KHBD nào.'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
