import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface PDFOptions {
  title: string;
  client: string;
  date: string;
}

/**
 * Generate PDF from HTML content using html2canvas for true WYSIWYG fidelity
 * This ensures all styles (fonts, colors, sizes, alignment) are preserved exactly
 */
export async function generatePDFFromHTML(
  htmlContent: string,
  options: PDFOptions
): Promise<jsPDF> {
  const { title, client, date } = options;
  
  // Create a container that mimics the editor's A4 styling
  // NO padding here - margins are handled by jsPDF positioning
  const container = document.createElement('div');
  container.id = 'pdf-render-container';
  container.style.cssText = `
    position: absolute;
    left: -9999px;
    top: 0;
    width: 170mm;
    padding: 0;
    background: #ffffff;
    box-sizing: border-box;
    font-family: 'Inter', Arial, sans-serif;
  `;
  
  // Apply the same wysiwyg-editor styles but force black bullets for PDF
  container.innerHTML = `
    <style>
      #pdf-render-container * {
        box-sizing: border-box;
      }
      #pdf-render-container {
        font-family: 'Inter', Arial, sans-serif;
        font-size: 11pt;
        line-height: 1.6;
        color: #333;
      }
      #pdf-render-container h1 {
        font-size: 22pt;
        font-weight: 700;
        color: #1e1e1e;
        margin-bottom: 12pt;
        margin-top: 0;
        padding-bottom: 8pt;
        border-bottom: 2px solid hsl(24, 95%, 53%);
      }
      #pdf-render-container h2 {
        font-size: 16pt;
        font-weight: 600;
        color: #323232;
        margin-bottom: 10pt;
        margin-top: 18pt;
      }
      #pdf-render-container h3 {
        font-size: 13pt;
        font-weight: 600;
        color: #464646;
        margin-bottom: 8pt;
        margin-top: 14pt;
      }
      #pdf-render-container p {
        margin-bottom: 10pt;
        color: #505050;
        font-size: 11pt;
      }
      #pdf-render-container ul,
      #pdf-render-container ol {
        margin-bottom: 12pt;
        padding-left: 24pt;
      }
      #pdf-render-container ul {
        list-style-type: disc;
        list-style-position: outside;
      }
      #pdf-render-container ul li {
        margin-bottom: 4pt;
        color: #505050;
        font-size: 11pt;
        padding-left: 0;
      }
      /* Force BLACK bullets for PDF - override theme colors */
      #pdf-render-container ul li::marker {
        color: #000000 !important;
      }
      #pdf-render-container ol {
        list-style-type: decimal;
      }
      #pdf-render-container ol li {
        margin-bottom: 4pt;
        color: #505050;
        font-size: 11pt;
      }
      #pdf-render-container ol li::marker {
        color: #000000 !important;
      }
      #pdf-render-container strong {
        font-weight: 600;
        color: #323232;
      }
      #pdf-render-container em {
        font-style: italic;
      }
      #pdf-render-container u {
        text-decoration: underline;
      }
    </style>
    <div class="pdf-content">${htmlContent}</div>
  `;
  
  document.body.appendChild(container);
  
  // Wait for fonts to load
  await document.fonts.ready;
  
  // Small delay to ensure rendering is complete
  await new Promise(resolve => setTimeout(resolve, 100));
  
  try {
    // Render to canvas with high quality
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: 643, // 170mm in pixels at 96 DPI
      onclone: (clonedDoc) => {
        // Ensure fonts are applied in the cloned document
        const clonedContainer = clonedDoc.getElementById('pdf-render-container');
        if (clonedContainer) {
          // Force re-apply font styles
          const elements = clonedContainer.querySelectorAll('*');
          elements.forEach((el) => {
            const htmlEl = el as HTMLElement;
            const computedStyle = window.getComputedStyle(htmlEl);
            if (computedStyle.fontFamily) {
              htmlEl.style.fontFamily = computedStyle.fontFamily;
            }
            if (computedStyle.fontSize) {
              htmlEl.style.fontSize = computedStyle.fontSize;
            }
            if (computedStyle.fontWeight) {
              htmlEl.style.fontWeight = computedStyle.fontWeight;
            }
            if (computedStyle.fontStyle) {
              htmlEl.style.fontStyle = computedStyle.fontStyle;
            }
            if (computedStyle.textDecoration) {
              htmlEl.style.textDecoration = computedStyle.textDecoration;
            }
            if (computedStyle.textAlign) {
              htmlEl.style.textAlign = computedStyle.textAlign;
            }
          });
        }
      }
    });
    
    // Create PDF
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    
    // Header
    const headerHeight = 35;
    pdf.setFillColor(255, 107, 0);
    pdf.rect(0, 0, pageWidth, headerHeight, 'F');
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    pdf.text('avaliAI', 20, 23);
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Gerador de Propostas Inteligente', 20, 30);
    
    // Document info
    const infoY = 45;
    pdf.setFillColor(245, 245, 245);
    pdf.roundedRect(20, infoY, pageWidth - 40, 20, 3, 3, 'F');
    
    pdf.setTextColor(100, 100, 100);
    pdf.setFontSize(9);
    pdf.text(`Cliente: ${client}`, 25, infoY + 8);
    pdf.text(`Data: ${date}`, 25, infoY + 15);
    pdf.text(`Documento: ${title}`, pageWidth / 2, infoY + 8);
    
    // Add canvas content with proper margins
    const imgData = canvas.toDataURL('image/png');
    const margin = 20; // 20mm margins
    const imgWidth = pageWidth - (2 * margin);
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    const contentStartY = 70; // Closer to info box
    let remainingHeight = imgHeight;
    let sourceY = 0;
    
    const availableHeight = pageHeight - contentStartY - 15; // More space at bottom
    
    // Handle multi-page content
    let isFirstPage = true;
    while (remainingHeight > 0) {
      const currentAvailableHeight = isFirstPage ? availableHeight : pageHeight - 30;
      const sliceHeight = Math.min(remainingHeight, currentAvailableHeight);
      const sourceHeight = (sliceHeight / imgHeight) * canvas.height;
      
      // Create a temporary canvas for this slice
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = canvas.width;
      tempCanvas.height = sourceHeight;
      
      const ctx = tempCanvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
        ctx.drawImage(
          canvas,
          0, sourceY,
          canvas.width, sourceHeight,
          0, 0,
          canvas.width, sourceHeight
        );
        
        const sliceData = tempCanvas.toDataURL('image/png');
        const yPos = isFirstPage ? contentStartY : 15;
        pdf.addImage(sliceData, 'PNG', margin, yPos, imgWidth, sliceHeight);
      }
      
      remainingHeight -= sliceHeight;
      sourceY += sourceHeight;
      
      if (remainingHeight > 0) {
        pdf.addPage();
        isFirstPage = false;
      }
    }
    
    // Footer on all pages
    const pageCount = pdf.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);
      
      pdf.setDrawColor(255, 107, 0);
      pdf.setLineWidth(0.3);
      pdf.line(20, pageHeight - 15, pageWidth - 20, pageHeight - 15);
      
      pdf.setTextColor(150, 150, 150);
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Gerado por avaliAI - Proposta Comercial', 20, pageHeight - 10);
      pdf.text(`Página ${i} de ${pageCount}`, pageWidth - 40, pageHeight - 10);
    }
    
    return pdf;
  } finally {
    document.body.removeChild(container);
  }
}

/**
 * Download PDF directly from HTML content
 */
export async function downloadProposalPDF(
  htmlContent: string, 
  options: PDFOptions
): Promise<void> {
  const pdf = await generatePDFFromHTML(htmlContent, options);
  pdf.save(`proposta-${options.client.toLowerCase().replace(/\s+/g, '-')}.pdf`);
}

/**
 * Get PDF as data URL for preview
 */
export async function getProposalPDFDataUrl(
  htmlContent: string, 
  options: PDFOptions
): Promise<string> {
  const pdf = await generatePDFFromHTML(htmlContent, options);
  return pdf.output('dataurlstring');
}

/**
 * Get PDF as Blob
 */
export async function getProposalPDFBlob(
  htmlContent: string, 
  options: PDFOptions
): Promise<Blob> {
  const pdf = await generatePDFFromHTML(htmlContent, options);
  return pdf.output('blob');
}
