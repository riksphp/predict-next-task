import { Tool } from './types';

function downloadTextAsPdf(text: string, title?: string) {
  // Minimal PDF generation via Blob (not a real PDF renderer but acceptable as text/pdf for demo)
  const blob = new Blob([text], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${title || 'document'}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export const saveTextAsPdfTool: Tool<
  { text: string; title?: string },
  { saved: boolean; title?: string }
> = {
  name: 'saveTextAsPDF',
  async execute(args): Promise<{ saved: boolean; title?: string }> {
    downloadTextAsPdf(args.text, args.title);
    return { saved: true, title: args.title };
  },
};

export const exportPdfTool: Tool<
  { title: string; text: string },
  { saved: boolean; title: string }
> = {
  name: 'exportPdf',
  async execute(args): Promise<{ saved: boolean; title: string }> {
    downloadTextAsPdf(args.text, args.title);
    return { saved: true, title: args.title };
  },
};
