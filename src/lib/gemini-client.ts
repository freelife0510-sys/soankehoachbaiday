import { GoogleGenAI } from '@google/genai';

export const generateLessonPlanContent = async (
  apiKey: string,
  modelId: string,
  data: any
) => {
  const ai = new GoogleGenAI({ apiKey });
  
  const prompt = `
Bạn là chuyên gia giáo dục Việt Nam, chuyên soạn kế hoạch bài dạy.
Hãy soạn một kế hoạch bài dạy chi tiết dựa trên thông tin sau:
- Tên bài: ${data.title}
- Môn học: ${data.subject}
- Lớp: ${data.grade}
- Chương trình: ${data.curriculum}
- Thời lượng: ${data.durationMinutes} phút
- Mục tiêu: ${data.objectiveSummary}
- Phương pháp: ${data.teachingMethod}
- Đánh giá: ${data.assessmentMethod}
- Tài liệu/Thiết bị: ${data.materials || 'Không có'}
- Ghi chú thêm: ${data.additionalNotes || 'Không có'}

QUAN TRỌNG: 
- Bạn được cung cấp tài liệu nguồn (sách giáo khoa/bài tập) đính kèm nếu có. Hãy phân tích kỹ tài liệu nguồn này để soạn nội dung bám sát thật chính xác.
- Nếu Lớp là cấp Tiểu học (Lớp 1, 2, 3, 4, 5), BẮT BUỘC soạn theo cấu trúc của Công văn 2345/BGDĐT (I. Yêu cầu cần đạt, II. Đồ dùng dạy học, III. Các hoạt động dạy học chủ yếu: Khởi động, Khám phá, Luyện tập, Vận dụng, IV. Điều chỉnh sau bài dạy).
- Nếu Lớp là cấp THCS hoặc THPT (Lớp 6 đến 12), BẮT BUỘC soạn theo cấu trúc của Công văn 5512/BGDĐT (I. Mục tiêu, II. Thiết bị dạy học và học liệu, III. Tiến trình dạy học: Hoạt động 1: Khởi động, Hoạt động 2: Hình thành kiến thức mới, Hoạt động 3: Luyện tập, Hoạt động 4: Vận dụng. Mỗi hoạt động phải có đủ 4 bước: a) Mục tiêu, b) Nội dung, c) Sản phẩm, d) Tổ chức thực hiện).
- Tích hợp năng lực AI: Trong KHBD, nếu nội dung thích hợp, hãy tích hợp thêm năng lực AI vào phần mục tiêu ngoài các năng lực, phẩm chất của từng bộ môn theo chương trình GDPT 2018.
- PHẦN MINH HOẠ HÌNH ẢNH: Hãy chèn các hình ảnh minh hoạ có trong sách giáo khoa vào đúng vị trí trong nội dung KHBD bằng cách sử dụng mã HTML sau (tuyệt đối không dùng markdown):
  <div class="image-placeholder bg-blue-50 border border-blue-200 border-dashed rounded-lg p-6 my-4 text-center text-blue-700 italic"><p>📸 <b>Gợi ý minh hoạ:</b> [Mô tả chi tiết hình ảnh từ SGK cần chèn vào đây]</p></div>

Hãy trả về JSON với cấu trúc sau:
{
  "title": "Tên kế hoạch bài dạy",
  "metadata": {
    "subject": "Môn học",
    "grade": "Lớp",
    "curriculum": "Chương trình",
    "durationMinutes": 45
  },
  "sections": [
    {
      "sectionKey": "muc_tieu_yeu_cau",
      "sectionTitle": "I. Mục tiêu / Yêu cầu cần đạt",
      "contentHtml": "<p>Nội dung HTML chi tiết ở đây</p>"
    },
    {
      "sectionKey": "thiet_bi_hoc_lieu",
      "sectionTitle": "II. Thiết bị dạy học và học liệu / Đồ dùng dạy học",
      "contentHtml": "<p>Nội dung HTML chi tiết ở đây</p>"
    },
    {
      "sectionKey": "tien_trinh_hoat_dong_1",
      "sectionTitle": "III. Hoạt động 1: Khởi động",
      "contentHtml": "<p>Nội dung HTML chi tiết ở đây</p>"
    },
    {
      "sectionKey": "tien_trinh_hoat_dong_2",
      "sectionTitle": "III. Hoạt động 2: Hình thành kiến thức mới / Khám phá",
      "contentHtml": "<p>Nội dung HTML chi tiết ở đây</p>"
    },
    {
      "sectionKey": "tien_trinh_hoat_dong_3",
      "sectionTitle": "III. Hoạt động 3: Luyện tập / Thực hành",
      "contentHtml": "<p>Nội dung HTML chi tiết ở đây</p>"
    },
    {
      "sectionKey": "tien_trinh_hoat_dong_4",
      "sectionTitle": "III. Hoạt động 4: Vận dụng / Trải nghiệm",
      "contentHtml": "<p>Nội dung HTML chi tiết ở đây</p>"
    },
    {
      "sectionKey": "dieu_chinh_rut_kinh_nghiem",
      "sectionTitle": "IV. Điều chỉnh sau bài dạy / Rút kinh nghiệm",
      "contentHtml": "<p>Nội dung HTML chi tiết ở đây</p>"
    }
  ]
}
Lưu ý: 
- "sectionTitle" hãy điều chỉnh lại cho đúng chính xác với tên mục của Công văn 5512 hoặc 2345 tùy theo cấp học.
- "contentHtml" phải chứa mã HTML được định dạng đẹp mắt (dùng <strong>, <ul>, <li>, <p>, <table> nếu cần) để hiển thị trực tiếp trong trình soạn thảo.
`;

  let apiContents: any[] = [prompt];
  
  if (data.sourceFiles && Array.isArray(data.sourceFiles) && data.sourceFiles.length > 0) {
    const inlineDataFiles = data.sourceFiles.map((file: any) => ({
      inlineData: {
        data: file.data,
        mimeType: file.mimeType,
      }
    }));
    apiContents = [...inlineDataFiles, prompt];
  }

  const response = await ai.models.generateContent({
    model: modelId,
    contents: apiContents,
    config: {
      responseMimeType: 'application/json',
    },
  });

  const jsonStr = response.text?.trim() || '{}';
  const result = JSON.parse(jsonStr);
  
  const sections = result.sections || [];
  const transformedSections = sections.map((s: any, i: number) => ({
    sectionKey: s.sectionKey,
    sectionTitle: s.sectionTitle,
    orderIndex: i,
    contentHtml: s.contentHtml || '',
    contentText: s.contentHtml ? s.contentHtml.replace(/<[^>]*>/g, '') : '',
  }));
  
  return {
    ...result,
    sections: transformedSections
  };
};

export const regenerateLessonSection = async (
  apiKey: string,
  modelId: string,
  sectionKey: string,
  currentContent: string,
  actionPrompt: string
) => {
  const ai = new GoogleGenAI({ apiKey });
  
  const prompt = `
Bạn là chuyên gia giáo dục.
${actionPrompt}

Phần cần sửa chữa: "${sectionKey}"
Nội dung hiện tại:
${currentContent}

Trả về JSON với cấu trúc:
{
  "contentHtml": "Nội dung HTML mới",
  "contentText": "Nội dung text mới (không có thẻ HTML)"
}
`;

  const response = await ai.models.generateContent({
    model: modelId,
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
    },
  });

  const jsonStr = response.text?.trim() || '{}';
  return JSON.parse(jsonStr);
};
