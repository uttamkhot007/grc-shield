import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { Document, Packer, Paragraph, TextRun, ImageRun, HeadingLevel, PageBreak } from "docx";

export type ExportFormat = "pdf" | "jpeg" | "word";

interface ExportOptions {
  title: string;
  subtitle?: string;
  filename?: string;
}

export async function captureElementAsImage(
  element: HTMLElement
): Promise<{ canvas: HTMLCanvasElement; dataUrl: string }> {
  const canvas = await html2canvas(element, {
    backgroundColor: "#0a0a0f",
    scale: 2,
    useCORS: true,
    logging: false,
  });
  const dataUrl = canvas.toDataURL("image/jpeg", 0.95);
  return { canvas, dataUrl };
}

export async function exportDashboardAsPdf(
  element: HTMLElement,
  options: ExportOptions
): Promise<void> {
  const { canvas } = await captureElementAsImage(element);
  
  const imgWidth = 210;
  const pageHeight = 297;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;
  
  const pdf = new jsPDF("p", "mm", "a4");
  
  pdf.setFillColor(10, 10, 15);
  pdf.rect(0, 0, 210, 297, "F");
  
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(24);
  pdf.text(options.title, 15, 20);
  
  if (options.subtitle) {
    pdf.setFontSize(12);
    pdf.setTextColor(150, 150, 150);
    pdf.text(options.subtitle, 15, 28);
  }
  
  pdf.setFontSize(10);
  pdf.setTextColor(100, 100, 100);
  pdf.text(`Generated: ${new Date().toLocaleString()}`, 15, 36);
  
  let heightLeft = imgHeight;
  let position = 45;
  
  pdf.addImage(canvas.toDataURL("image/jpeg", 0.95), "JPEG", 0, position, imgWidth, imgHeight);
  heightLeft -= pageHeight - position;
  
  while (heightLeft > 0) {
    position = heightLeft - imgHeight;
    pdf.addPage();
    pdf.setFillColor(10, 10, 15);
    pdf.rect(0, 0, 210, 297, "F");
    pdf.addImage(canvas.toDataURL("image/jpeg", 0.95), "JPEG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
  }
  
  pdf.save(options.filename || `${options.title.toLowerCase().replace(/\s+/g, "-")}.pdf`);
}

export async function exportDashboardAsJpeg(
  element: HTMLElement,
  options: ExportOptions
): Promise<void> {
  const { dataUrl } = await captureElementAsImage(element);
  
  const link = document.createElement("a");
  link.download = options.filename || `${options.title.toLowerCase().replace(/\s+/g, "-")}.jpeg`;
  link.href = dataUrl;
  link.click();
}

export async function exportDashboardAsWord(
  element: HTMLElement,
  options: ExportOptions
): Promise<void> {
  const { dataUrl } = await captureElementAsImage(element);
  
  const base64Data = dataUrl.split(",")[1];
  const imageBuffer = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));
  
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: options.title,
                bold: true,
                size: 48,
                color: "1a1a2e",
              }),
            ],
            heading: HeadingLevel.HEADING_1,
          }),
          options.subtitle
            ? new Paragraph({
                children: [
                  new TextRun({
                    text: options.subtitle,
                    size: 24,
                    color: "666666",
                  }),
                ],
              })
            : new Paragraph({}),
          new Paragraph({
            children: [
              new TextRun({
                text: `Generated: ${new Date().toLocaleString()}`,
                size: 20,
                color: "999999",
              }),
            ],
          }),
          new Paragraph({ children: [] }),
          new Paragraph({
            children: [
              new ImageRun({
                data: imageBuffer,
                transformation: {
                  width: 600,
                  height: 400,
                },
                type: "jpg",
              }),
            ],
          }),
        ],
      },
    ],
  });
  
  const blob = await Packer.toBlob(doc);
  const link = document.createElement("a");
  link.download = options.filename || `${options.title.toLowerCase().replace(/\s+/g, "-")}.docx`;
  link.href = URL.createObjectURL(blob);
  link.click();
}

export async function exportWidget(
  element: HTMLElement,
  format: ExportFormat,
  options: ExportOptions
): Promise<void> {
  switch (format) {
    case "pdf":
      await exportDashboardAsPdf(element, options);
      break;
    case "jpeg":
      await exportDashboardAsJpeg(element, options);
      break;
    case "word":
      await exportDashboardAsWord(element, options);
      break;
  }
}
