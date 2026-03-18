import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { BookOpen, Sparkles, Clock, FileText, Download } from 'lucide-react';
import { saveAs } from 'file-saver';

export default function LandingPage() {
  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/download-source');
      if (!response.ok) throw new Error('Download failed');
      const blob = await response.blob();
      saveAs(blob, 'source-code.zip');
    } catch (error) {
      console.error('Error downloading source:', error);
      alert('Có lỗi xảy ra khi tải mã nguồn. Vui lòng thử lại sau.');
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="flex h-16 items-center justify-between px-6 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-blue-600" />
          <span className="text-xl font-bold text-gray-900">Kế hoạch bài dạy Pro+</span>
        </div>
        <nav className="flex items-center gap-4">
          <button onClick={handleDownload} className="text-sm font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-1 cursor-pointer">
            <Download className="h-4 w-4" />
            Tải mã nguồn
          </button>
          <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900">
            Đăng nhập
          </Link>
          <Button asChild>
            <Link to="/register">Đăng ký miễn phí</Link>
          </Button>
        </nav>
      </header>

      <main>
        <section className="py-24 px-6 text-center">
          <h1 className="text-5xl font-extrabold text-gray-900 tracking-tight mb-6">
            Soạn kế hoạch bài dạy chuẩn <br />
            <span className="text-blue-600">nhanh gấp 10 lần</span> với AI
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10">
            Kế hoạch bài dạy Pro+ là nền tảng giúp giáo viên Việt Nam tạo, chỉnh sửa và quản lý kế hoạch bài dạy chuyên nghiệp, bám sát chương trình GDPT 2018.
          </p>
          <div className="flex justify-center gap-4">
            <Button size="lg" asChild>
              <Link to="/register">Bắt đầu ngay</Link>
            </Button>
            <Button size="lg" variant="outline" onClick={handleDownload} className="flex items-center gap-2 text-emerald-600 border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 cursor-pointer">
              <Download className="h-5 w-5" />
              Tải mã nguồn (ZIP)
            </Button>
          </div>
        </section>

        <section className="py-20 bg-gray-50 px-6">
          <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-10">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <div className="h-12 w-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-6">
                <Sparkles className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">AI Thông Minh</h3>
              <p className="text-gray-600">Tự động sinh kế hoạch bài dạy đầy đủ các phần: mục tiêu, khởi động, hình thành kiến thức, luyện tập, vận dụng.</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <div className="h-12 w-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mb-6">
                <Clock className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Tiết Kiệm Thời Gian</h3>
              <p className="text-gray-600">Thay vì mất hàng giờ, bạn chỉ cần 5 phút để có một kế hoạch bài dạy hoàn chỉnh và sẵn sàng lên lớp.</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <div className="h-12 w-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-6">
                <FileText className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Xuất File Chuẩn</h3>
              <p className="text-gray-600">Dễ dàng xuất kế hoạch bài dạy ra định dạng PDF hoặc DOCX với bố cục đẹp mắt, đúng chuẩn của Bộ GD&ĐT.</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-10 text-center text-gray-500 border-t border-gray-100">
        <p>&copy; 2026 Kế hoạch bài dạy Pro+. Phát triển bởi Thầy Hồ Sỹ Long - Zalo 0943278804.</p>
      </footer>
    </div>
  );
}
