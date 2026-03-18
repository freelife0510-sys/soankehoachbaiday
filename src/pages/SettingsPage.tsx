import { useAppStore } from '@/store/appStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Key, ShieldAlert } from 'lucide-react';
import { useState } from 'react';

export default function SettingsPage() {
  const { geminiApiKey, setGeminiApiKey } = useAppStore();
  const [keyInput, setKeyInput] = useState(geminiApiKey || '');

  const handleSave = () => {
    setGeminiApiKey(keyInput);
    alert('Đã lưu cấu hình API Key!');
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Cài đặt hệ thống</h1>
        <p className="text-gray-500 mt-1">Cấu hình kết nối AI trên máy của bạn</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-6">
        <div className="p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <Key className="mr-2 h-5 w-5 text-blue-600" /> Cấu hình Gemini API Key
          </h2>
          <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-lg mb-6 flex gap-3 text-sm">
            <ShieldAlert className="h-5 w-5 shrink-0" />
            <p>
              <strong>Bảo mật:</strong> Ứng dụng này hoạt động 100% trên trình duyệt của bạn. API Key bạn nhập vào sẽ được lưu an toàn trong trình duyệt (localStorage) và chỉ được gửi trực tiếp đến máy chủ Google khi soạn giáo án. Hệ thống <strong>tuyệt đối không lưu trữ</strong> key của bạn ở bất kỳ máy chủ nào khác.
            </p>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Google Gemini API Key</label>
              <Input 
                type="password" 
                value={keyInput} 
                onChange={(e) => setKeyInput(e.target.value)}
                placeholder="AIzaSy..." 
                className="font-mono"
              />
              <p className="text-xs text-gray-500 mt-2">
                Bạn có thể lấy mã API miễn phí tại <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">Google AI Studio</a>.
              </p>
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <Button onClick={handleSave}>Lưu cấu hình</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
