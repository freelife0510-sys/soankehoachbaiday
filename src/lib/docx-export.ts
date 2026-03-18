import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';
import { saveAs } from 'file-saver';

export const exportToDocx = async (lessonPlan: any) => {
  if (!lessonPlan) return;

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            text: `KẾ HOẠCH BÀI DẠY: ${lessonPlan.title.toUpperCase()}`,
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: `Môn học/Hoạt động giáo dục: `, bold: true }),
              new TextRun(lessonPlan.subject),
            ],
            spacing: { after: 120 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: `Lớp: `, bold: true }),
              new TextRun(lessonPlan.grade),
              new TextRun({ text: ` | Thời lượng: `, bold: true }),
              new TextRun(`${lessonPlan.durationMinutes || 45} phút`),
            ],
            spacing: { after: 400 },
          }),
          
          ...lessonPlan.sections.flatMap((section: any) => {
            const contentLines = (section.contentText || "").split('\\n').filter((l: string) => l.trim() !== '');
            return [
              new Paragraph({
                text: section.sectionTitle,
                heading: HeadingLevel.HEADING_2,
                spacing: { before: 240, after: 120 },
              }),
              ...contentLines.map((line: string) => 
                new Paragraph({
                  children: [new TextRun(line)],
                  spacing: { after: 120 },
                })
              )
            ];
          })
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `KHBD-${lessonPlan.title.replace(/[^a-z0-9]/gi, '_')}.docx`);
};
