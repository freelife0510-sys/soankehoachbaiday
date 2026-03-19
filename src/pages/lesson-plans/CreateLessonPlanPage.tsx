import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles, ArrowLeft, Save, UploadCloud, X, Loader2 } from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { generateLessonPlanContent } from '@/lib/gemini-client';

const formSchema = z.object({
  title: z.string().min(3, 'Tên bài học quá ngắn'),
  subject: z.string().min(1, 'Vui lòng nhập môn học'),
  grade: z.string().min(1, 'Vui lòng nhập lớp'),
  curriculum: z.string().min(1, 'Vui lòng nhập chương trình'),
  durationMinutes: z.coerce.number().min(10, 'Thời lượng tối thiểu 10 phút').max(300, 'Thời lượng tối đa 300 phút'),
  objectiveSummary: z.string().min(10, 'Mục tiêu quá ngắn'),
  teachingMethod: z.string().min(1, 'Vui lòng nhập phương pháp'),
  assessmentMethod: z.string().min(1, 'Vui lòng nhập cách đánh giá'),
  materials: z.string().optional(),
  additionalNotes: z.string().optional(),
  aiModel: z.string().default('gemini-1.5-flash'),
});

const fileToBase64 = (file: File): Promise<{ mimeType: string, data: string }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      const data = result.split(',')[1];
      resolve({ mimeType: file.type, data });
    };
    reader.onerror = (error) => reject(error);
  });
};

export default function CreateLessonPlanPage() {
  const navigate = useNavigate();
  const { geminiApiKey, saveLessonPlan } = useAppStore();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [generateError, setGenerateError] = useState('');
  
  const { register, handleSubmit, formState: { errors } } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      durationMinutes: 45,
      curriculum: 'Chương trình GDPT 2018',
      aiModel: 'gemini-1.5-flash',
    }
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const onGenerate = async (data: any) => {
    if (!geminiApiKey) {
      setGenerateError('Bạn chưa cấu hình Gemini API Key. Vui lòng vào mục Cài đặt để thêm.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsGenerating(true);
    setGenerateError('');
    try {
      const sourceFiles = await Promise.all(files.map(fileToBase64));
      
      const payload = {
        ...data,
        sourceFiles,
      };

      const result = await generateLessonPlanContent(geminiApiKey, data.aiModel, payload);
      
      const newPlan = {
        id: crypto.randomUUID(),
        title: result.title || data.title,
        subject: data.subject,
        grade: data.grade,
        status: 'GENERATED',
        sections: result.sections,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      saveLessonPlan(newPlan);
      navigate(`/app/lesson-plans/${newPlan.id}`);
    } catch (error: any) {
      console.error(error);
      setGenerateError(error.message || 'Có lỗi xảy ra khi tạo kế hoạch bài dạy. Vui lòng kiểm tra lại API Key.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsGenerating(false);
    }
  };

  const onSaveDraft = async (data: any) => {
    const newPlan = {
      id: crypto.randomUUID(),
      ...data,
      status: 'DRAFT',
      sections: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    saveLessonPlan(newPlan);
    navigate(`/app/lesson-plans/${newPlan.id}`);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto relative">
      {isGenerating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 flex flex-col items-center max-w-sm text-center">
            <Loader2 className="h-12 w-12 text-blue-600 animate-spin mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">AI đang soạn KHBD...</h3>
            <p className="text-gray-500 text-sm">Quá trình này có thể mất 20-40 giây tùy thuộc vào độ dài của tài liệu nguồn tải lên. Vui lòng không đóng trang web.</p>
          </div>
        </div>
      )}

      {generateError && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6 border border-red-200">
          <strong>Lỗi:</strong> {generateError}
          {generateError.includes('API Key') && (
            <div className="mt-2 text-sm">
              <Link to="/app/settings" className="underline font-medium hover:text-red-900">Đi đến Cài đặt ngay</Link>
            </div>
          )}
        </div>
      )}

      <div className="flex items-center mb-8">
        <button onClick={() => navigate(-1)} className="mr-4 p-2 rounded-full hover:bg-gray-100 transition-colors">
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tạo kế hoạch bài dạy mới</h1>
          <p className="text-gray-500 mt-1">Điền thông tin cơ bản để AI hỗ trợ bạn soạn kế hoạch bài dạy</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
        <form className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Tên bài học *</label>
              <Input {...register('title')} placeholder="VD: Phép cộng phân số" />
              {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message as string}</p>}
            </div>

            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Model AI</label>
              <select 
                {...register('aiModel')} 
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="gemini-1.5-flash">Gemini 1.5 Flash (Nhanh, Tiết kiệm)</option>
                <option value="gemini-1.5-pro">Gemini 1.5 Pro (Thông minh, Chính xác)</option>
                <option value="gemini-2.0-flash-exp">Gemini 2.0 Flash (Bản mới nhất)</option>
              </select>
            </div>
            <div className="hidden md:block"></div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Môn học *</label>
              <Input {...register('subject')} placeholder="VD: Toán" />
              {errors.subject && <p className="text-red-500 text-xs mt-1">{errors.subject.message as string}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Lớp *</label>
              <Input {...register('grade')} placeholder="VD: Lớp 4" />
              {errors.grade && <p className="text-red-500 text-xs mt-1">{errors.grade.message as string}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Chương trình *</label>
              <Input {...register('curriculum')} placeholder="VD: Chương trình GDPT 2018" />
              {errors.curriculum && <p className="text-red-500 text-xs mt-1">{errors.curriculum.message as string}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Thời lượng (phút) *</label>
              <Input {...register('durationMinutes')} type="number" />
              {errors.durationMinutes && <p className="text-red-500 text-xs mt-1">{errors.durationMinutes.message as string}</p>}
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Mục tiêu bài học *</label>
              <Textarea {...register('objectiveSummary')} placeholder="Học sinh cần đạt được những kiến thức, kỹ năng, thái độ gì sau bài học?" rows={3} />
              {errors.objectiveSummary && <p className="text-red-500 text-xs mt-1">{errors.objectiveSummary.message as string}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phương pháp dạy học *</label>
              <Input {...register('teachingMethod')} placeholder="VD: Hoạt động nhóm, vấn đáp, trò chơi" />
              {errors.teachingMethod && <p className="text-red-500 text-xs mt-1">{errors.teachingMethod.message as string}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phương pháp đánh giá *</label>
              <Input {...register('assessmentMethod')} placeholder="VD: Quan sát, hỏi đáp, bài tập nhanh" />
              {errors.assessmentMethod && <p className="text-red-500 text-xs mt-1">{errors.assessmentMethod.message as string}</p>}
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Thiết bị & Học liệu</label>
              <Input {...register('materials')} placeholder="VD: Bảng phụ, phiếu học tập, máy chiếu" />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú thêm cho AI</label>
              <Textarea {...register('additionalNotes')} placeholder="VD: Lớp có nhiều học sinh yếu, cần các ví dụ thực tế gần gũi..." rows={2} />
            </div>

            <div className="col-span-2 mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Tài liệu nguồn / Sách giáo khoa (Tùy chọn)</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors w-full h-32 relative cursor-pointer">
                <input 
                  type="file" 
                  multiple 
                  accept="image/*,application/pdf"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <UploadCloud className="h-8 w-8 text-gray-400 mb-2" />
                <p className="text-sm text-gray-600">Thả file hoặc <span className="text-blue-600 font-medium">Click để tải lên</span></p>
                <p className="text-xs text-gray-400 mt-1">Hỗ trợ PDF, Ảnh (Tối đa 30MB)</p>
              </div>
              
              {files.length > 0 && (
                <div className="mt-4 flex flex-col gap-2">
                  {files.map((file, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 rounded-md bg-blue-50 border border-blue-100 text-sm">
                      <span className="truncate text-blue-700 font-medium" style={{ maxWidth: '85%' }}>{file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                      <button type="button" onClick={() => removeFile(idx)} className="p-1 text-blue-500 hover:text-red-500 hover:bg-white rounded-md">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-6 border-t border-gray-100">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleSubmit(onSaveDraft)}
              disabled={isSaving || isGenerating}
            >
              <Save className="mr-2 h-4 w-4" />
              {isSaving ? 'Đang lưu...' : 'Lưu nháp'}
            </Button>
            <Button 
              type="button" 
              onClick={handleSubmit(onGenerate)}
              disabled={isSaving || isGenerating}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              {isGenerating ? 'AI Đang soạn kế hoạch bài dạy...' : 'Sinh kế hoạch bài dạy bằng AI'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
