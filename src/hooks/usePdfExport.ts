import { useCallback, useRef } from 'react';
import html2canvas from 'html2canvas-pro';
import jsPDF from 'jspdf';

export function usePdfExport() {
  const contentRef = useRef<HTMLDivElement>(null);

  const exportPdf = useCallback(async (projectName?: string, scale?: string, gmpStatus?: string) => {
    const element = contentRef.current;
    if (!element) return;

    // Hide elements marked with data-pdf-hide before capture
    const hiddenEls = element.querySelectorAll('[data-pdf-hide]');
    hiddenEls.forEach((el) => ((el as HTMLElement).style.display = 'none'));

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#FFFFFF',
    });

    // Restore hidden elements
    hiddenEls.forEach((el) => ((el as HTMLElement).style.display = ''));

    const imgData = canvas.toDataURL('image/png');
    const pageWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const margin = 5;
    const usableWidth = pageWidth - margin * 2;
    const usableHeight = pageHeight - margin * 2;

    // Scale to fit on one page
    let imgWidth = usableWidth;
    let imgHeight = (canvas.height * imgWidth) / canvas.width;

    if (imgHeight > usableHeight) {
      const scaleFactor = usableHeight / imgHeight;
      imgHeight = usableHeight;
      imgWidth = imgWidth * scaleFactor;
    }

    const xOffset = (pageWidth - imgWidth) / 2;
    const pdf = new jsPDF('p', 'mm', 'a4');
    pdf.addImage(imgData, 'PNG', xOffset, margin, imgWidth, imgHeight);

    const safeName = (projectName || 'peptiplan').replace(/[^a-zA-Z0-9_\- ]/g, '');
    const gmpLabel = gmpStatus === 'gmp' ? 'GMP' : gmpStatus === 'non-gmp' ? 'Non-GMP' : '';
    const parts = [safeName, scale, gmpLabel].filter(Boolean);
    const filename = `${parts.join(', ')}.pdf`;
    pdf.save(filename);
  }, []);

  return { contentRef, exportPdf };
}
