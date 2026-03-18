import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Save, Sparkles, Download, RefreshCw, Check } from 'lucide-react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import html2pdf from 'html2pdf.js';
import { useAppStore } from '@/store/appStore';
import { regenerateLessonSection } from '@/lib/gemini-client';
import { exportToDocx } from '@/lib/docx-export';

export default function LessonPlanEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { savedLessonPlans, saveLessonPlan, geminiApiKey } = useAppStore();
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [aiAction, setAiAction] = useState('');
  const [extraInstruction, setExtraInstruction] = useState('');
  const printRef = useRef<HTMLDivElement>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isAiProcessing, setIsAiProcessing] = useState(false);

  const lessonPlan = savedLessonPlans.find(p => p.id === id);
  const isLoading = false;

  const editor = useEditor({
    extensions: [StarterKit],
    content: '',
    onUpdate: ({ editor }) => {
      // Auto save logic could go here
    },
  });

  useEffect(() => {
    if (lessonPlan?.sections?.length > 0 && !activeSection) {
      setActiveSection(lessonPlan.sections[0].sectionKey);
    }
  }, [lessonPlan, activeSection]);

  useEffect(() => {
    if (activeSection && lessonPlan?.sections) {
      const section = lessonPlan.sections.find((s: any) => s.sectionKey === activeSection);
      if (section && editor) {
        editor.commands.setContent(section.contentHtml || section.contentText || '');
      }
    }
  }, [activeSection, lessonPlan, editor]);

  const saveCurrentSectionState = (contentHtml: string, contentText: string, secKey: string = activeSection as string) => {
    if (!lessonPlan || !secKey) return;
    setIsSaving(true);
    const updatedSections = lessonPlan.sections.map((s: any) => {
      if (s.sectionKey === secKey) {
        return { ...s, contentHtml, contentText };
      }
      return s;
    });
    saveLessonPlan({ ...lessonPlan, sections: updatedSections });
    setTimeout(() => setIsSaving(false), 500);
  };

  const handleSave = () => {
    if (activeSection && editor) {
      saveCurrentSectionState(editor.getHTML(), editor.getText());
    }
  };

  const handleAiAction = async () => {
    if (!activeSection || !aiAction || !geminiApiKey) return;
    setIsAiProcessing(true);
    try {
      const section = lessonPlan?.sections.find((s: any) => s.sectionKey === activeSection);
      const currentContent = section?.contentHtml || section?.contentText || '';
      
      let actionPrompt = '';
      switch (aiAction) {
        case 'improve': actionPrompt = 'Hãy cải thiện nội dung sau để chuyên nghiệp và rõ ràng hơn.'; break;
        case 'shorten': actionPrompt = 'Hãy rút gọn nội dung sau nhưng vẫn giữ ý chính.'; break;
        case 'expand': actionPrompt = 'Hãy mở rộng và thêm chi tiết cho nội dung sau.'; break;
        case 'convert_to_table': actionPrompt = 'Hãy chuyển đổi nội dung sau thành định dạng bảng HTML.'; break;
        case 'rewrite_for_grade_level': actionPrompt = 'Hãy viết lại nội dung sau cho phù hợp với độ tuổi học sinh (Dễ hiểu, có ví dụ gần gũi).'; break;
        default: actionPrompt = 'Hãy viết lại nội dung sau theo hướng tốt hơn, chuyên nghiệp hơn.';
      }
      if (extraInstruction) actionPrompt += `\n\nYêu cầu thêm: ${extraInstruction}`;
      
      const result = await regenerateLessonSection(geminiApiKey, 'gemini-2.5-flash', activeSection, currentContent, actionPrompt);
      
      const newContentHtml = result.contentHtml || '';
      if (editor && newContentHtml) {
        editor.commands.setContent(newContentHtml);
      }
      setAiAction('');
      setExtraInstruction('');
    } catch (err) {
      console.error(err);
      alert('Có lỗi xảy ra khi gọi AI');
    } finally {
      setIsAiProcessing(false);
    }
  };

  const handleExportPDF = () => {
    if (!printRef.current) return;
    const opt = {
      margin: 10,
      filename: `${lessonPlan?.title || 'khbd'}.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm' as const, format: 'a4', orientation: 'portrait' as const }
    };
    html2pdf().set(opt).from(printRef.current).save();
  };

  if (isLoading) {
    return <div className="flex h-full items-center justify-center">Đang tải kế hoạch bài dạy...</div>;
  }

  if (!lessonPlan) {
    return <div className="flex h-full items-center justify-center">Không tìm thấy kế hoạch bài dạy</div>;
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center">
          <button onClick={() => navigate('/app/dashboard')} className="mr-4 p-2 rounded-full hover:bg-gray-100 transition-colors">
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-gray-900">{lessonPlan.title}</h1>
            <div className="flex items-center text-xs text-gray-500">
              <span className={`px-2 py-0.5 rounded-full mr-2 ${
                lessonPlan.status === 'GENERATED' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
              }`}>
                {lessonPlan.status === 'GENERATED' ? 'Đã hoàn thành' : 'Bản nháp'}
              </span>
              {lessonPlan.subject} • {lessonPlan.grade}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => exportToDocx(lessonPlan)}>
            <Download className="mr-2 h-4 w-4" /> Xuất Word
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportPDF}>
            <Download className="mr-2 h-4 w-4" /> Xuất PDF
          </Button>
          <Button size="sm" onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Lưu
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Sections */}
        <div className="w-64 bg-gray-50 border-r border-gray-200 overflow-y-auto shrink-0 flex flex-col">
          <div className="p-4 font-semibold text-sm text-gray-500 uppercase tracking-wider border-b border-gray-200">
            Cấu trúc kế hoạch bài dạy
          </div>
          <nav className="flex-1 overflow-y-auto p-2 space-y-1">
            {lessonPlan.sections?.map((section: any) => (
              <button
                key={section.sectionKey}
                onClick={() => {
                  if (activeSection && activeSection !== section.sectionKey && editor) {
                    saveCurrentSectionState(editor.getHTML(), editor.getText(), activeSection);
                  }
                  setActiveSection(section.sectionKey);
                }}
                className={`w-full text-left px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                  activeSection === section.sectionKey
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-200'
                }`}
              >
                {section.sectionTitle}
              </button>
            ))}
          </nav>
        </div>

        {/* Editor */}
        <div className="flex-1 bg-white overflow-y-auto p-8 relative">
          {editor && (
            <div className="max-w-3xl mx-auto">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">
                  {lessonPlan.sections?.find((s: any) => s.sectionKey === activeSection)?.sectionTitle}
                </h2>
              </div>
              <div className="prose prose-blue max-w-none min-h-[500px] focus-within:outline-none">
                <EditorContent editor={editor} />
              </div>
            </div>
          )}
        </div>

        {/* AI Assistant Panel */}
        <div className="w-80 bg-gray-50 border-l border-gray-200 overflow-y-auto shrink-0 p-6 flex flex-col">
          <div className="flex items-center mb-6">
            <Sparkles className="h-5 w-5 text-blue-600 mr-2" />
            <h3 className="text-lg font-bold text-gray-900">Trợ lý AI</h3>
          </div>

          <div className="space-y-4 flex-1">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Hành động</label>
              <select
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={aiAction}
                onChange={(e) => setAiAction(e.target.value)}
              >
                <option value="">-- Chọn hành động --</option>
                <option value="improve">Cải thiện nội dung</option>
                <option value="shorten">Rút gọn</option>
                <option value="expand">Mở rộng chi tiết</option>
                <option value="convert_to_table">Chuyển thành bảng</option>
                <option value="rewrite_for_grade_level">Viết lại cho phù hợp độ tuổi</option>
                <option value="regenerate">Viết lại toàn bộ phần này</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Yêu cầu thêm (tùy chọn)</label>
              <Textarea
                placeholder="VD: Thêm một trò chơi nhỏ vào phần này..."
                value={extraInstruction}
                onChange={(e) => setExtraInstruction(e.target.value)}
                rows={3}
              />
            </div>

            <Button
              className="w-full"
              disabled={!aiAction || isAiProcessing}
              onClick={handleAiAction}
            >
              {isAiProcessing ? (
                <><RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Đang xử lý...</>
              ) : (
                <><Sparkles className="mr-2 h-4 w-4" /> Thực hiện</>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Hidden Print Container */}
      <div className="hidden">
        <div ref={printRef} className="p-8 bg-white text-black font-serif">
          <h1 className="text-3xl font-bold text-center mb-6">{lessonPlan.title}</h1>
          <div className="mb-8 text-center text-gray-600">
            <p>Môn học: {lessonPlan.subject} | Lớp: {lessonPlan.grade}</p>
            <p>Thời lượng: {lessonPlan.durationMinutes} phút</p>
          </div>
          
          {lessonPlan.sections?.map((section: any) => (
            <div key={section.sectionKey} className="mb-8">
              <h2 className="text-xl font-bold mb-4 border-b pb-2">{section.sectionTitle}</h2>
              <div 
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: section.contentHtml || section.contentText }} 
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
