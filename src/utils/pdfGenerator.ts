import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface PDFOptions {
  title: string;
  client: string;
  date: string;
}

/**
 * Generate PDF from DOM element using html2canvas for WYSIWYG fidelity
 */
export async function generatePDFFromElement(
  element: HTMLElement,
  options: PDFOptions
): Promise<jsPDF> {
  const { title, client, date } = options;
  
  // Clone the element to avoid modifying the original
  const clone = element.cloneNode(true) as HTMLElement;
  
  // Apply print-specific styles
  clone.style.width = '210mm';
  clone.style.padding = '20mm';
  clone.style.backgroundColor = '#ffffff';
  clone.style.position = 'absolute';
  clone.style.left = '-9999px';
  clone.style.top = '0';
  
  document.body.appendChild(clone);
  
  try {
    // Render to canvas with high quality
    const canvas = await html2canvas(clone, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: 794, // A4 width in pixels at 96 DPI
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
    
    // Add canvas content
    const imgData = canvas.toDataURL('image/png');
    const imgWidth = pageWidth - 40;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    const contentStartY = 75;
    let currentY = contentStartY;
    let remainingHeight = imgHeight;
    let sourceY = 0;
    
    const availableHeight = pageHeight - contentStartY - 20;
    
    // Handle multi-page content
    while (remainingHeight > 0) {
      const sliceHeight = Math.min(remainingHeight, availableHeight);
      const sourceHeight = (sliceHeight / imgHeight) * canvas.height;
      
      // Create a temporary canvas for this slice
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = canvas.width;
      tempCanvas.height = sourceHeight;
      
      const ctx = tempCanvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(
          canvas,
          0, sourceY,
          canvas.width, sourceHeight,
          0, 0,
          canvas.width, sourceHeight
        );
        
        const sliceData = tempCanvas.toDataURL('image/png');
        pdf.addImage(sliceData, 'PNG', 20, currentY, imgWidth, sliceHeight);
      }
      
      remainingHeight -= sliceHeight;
      sourceY += sourceHeight;
      
      if (remainingHeight > 0) {
        pdf.addPage();
        currentY = 20;
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
    document.body.removeChild(clone);
  }
}

/**
 * Legacy function for backward compatibility - now uses HTML content
 */
export function generateProposalPDF(proposal: string, options: PDFOptions): jsPDF {
  const { title, client, date } = options;
  const doc = new jsPDF();
  
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);
  let yPosition = margin;
  
  const checkNewPage = (requiredSpace: number) => {
    if (yPosition + requiredSpace > pageHeight - margin) {
      doc.addPage();
      yPosition = margin;
      return true;
    }
    return false;
  };

  // Header
  doc.setFillColor(255, 107, 0);
  doc.rect(0, 0, pageWidth, 35, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('avaliAI', margin, 23);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Gerador de Propostas Inteligente', margin, 30);
  
  yPosition = 50;
  
  // Document info
  doc.setFillColor(245, 245, 245);
  doc.roundedRect(margin, yPosition, contentWidth, 25, 3, 3, 'F');
  
  doc.setTextColor(100, 100, 100);
  doc.setFontSize(9);
  doc.text(`Cliente: ${client}`, margin + 5, yPosition + 10);
  doc.text(`Data: ${date}`, margin + 5, yPosition + 18);
  doc.text(`Documento: ${title}`, pageWidth / 2, yPosition + 10);
  
  yPosition = 85;
  
  // Parse HTML content
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = proposal;
  
  const processNode = (node: Node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent?.trim();
      if (text) {
        checkNewPage(8);
        doc.setTextColor(80, 80, 80);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        const splitText = doc.splitTextToSize(text, contentWidth);
        doc.text(splitText, margin, yPosition);
        yPosition += (splitText.length * 5) + 3;
      }
      return;
    }
    
    if (node.nodeType !== Node.ELEMENT_NODE) return;
    
    const element = node as HTMLElement;
    const tagName = element.tagName.toLowerCase();
    
    switch (tagName) {
      case 'h1':
        checkNewPage(20);
        doc.setTextColor(30, 30, 30);
        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        const h1Text = element.textContent || '';
        doc.text(h1Text, margin, yPosition);
        yPosition += 12;
        doc.setDrawColor(255, 107, 0);
        doc.setLineWidth(0.5);
        doc.line(margin, yPosition - 4, margin + doc.getTextWidth(h1Text), yPosition - 4);
        yPosition += 8;
        break;
        
      case 'h2':
        checkNewPage(15);
        yPosition += 5;
        doc.setTextColor(50, 50, 50);
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text(element.textContent || '', margin, yPosition);
        yPosition += 10;
        break;
        
      case 'h3':
        checkNewPage(12);
        yPosition += 3;
        doc.setTextColor(70, 70, 70);
        doc.setFontSize(13);
        doc.setFont('helvetica', 'bold');
        doc.text(element.textContent || '', margin, yPosition);
        yPosition += 8;
        break;
        
      case 'p':
        checkNewPage(8);
        doc.setTextColor(80, 80, 80);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        const pText = element.textContent || '';
        if (pText.trim()) {
          const splitText = doc.splitTextToSize(pText, contentWidth);
          doc.text(splitText, margin, yPosition);
          yPosition += (splitText.length * 5) + 5;
        } else {
          yPosition += 5;
        }
        break;
        
      case 'ul':
      case 'ol':
        const listItems = element.querySelectorAll(':scope > li');
        const isOrdered = tagName === 'ol';
        listItems.forEach((li, index) => {
          checkNewPage(8);
          doc.setTextColor(80, 80, 80);
          doc.setFontSize(11);
          doc.setFont('helvetica', 'normal');
          
          if (isOrdered) {
            doc.text(`${index + 1}.`, margin, yPosition);
          } else {
            doc.setFillColor(255, 107, 0);
            doc.circle(margin + 2, yPosition - 1.5, 1.2, 'F');
          }
          
          const liText = li.textContent || '';
          const splitText = doc.splitTextToSize(liText, contentWidth - 12);
          doc.text(splitText, margin + 10, yPosition);
          yPosition += (splitText.length * 5) + 3;
        });
        yPosition += 3;
        break;
        
      case 'strong':
      case 'b':
        doc.setFont('helvetica', 'bold');
        const strongText = element.textContent || '';
        if (strongText.trim()) {
          checkNewPage(8);
          doc.setTextColor(50, 50, 50);
          doc.setFontSize(11);
          doc.text(strongText, margin, yPosition);
          yPosition += 7;
        }
        doc.setFont('helvetica', 'normal');
        break;
        
      default:
        element.childNodes.forEach(child => processNode(child));
    }
  };
  
  tempDiv.childNodes.forEach(node => processNode(node));
  
  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    
    doc.setDrawColor(255, 107, 0);
    doc.setLineWidth(0.3);
    doc.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);
    
    doc.setTextColor(150, 150, 150);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('Gerado por avaliAI - Proposta Comercial', margin, pageHeight - 10);
    doc.text(`Página ${i} de ${pageCount}`, pageWidth - margin - 20, pageHeight - 10);
  }
  
  return doc;
}

export function downloadProposalPDF(proposal: string, options: PDFOptions): void {
  const doc = generateProposalPDF(proposal, options);
  doc.save(`proposta-${options.client.toLowerCase().replace(/\s+/g, '-')}.pdf`);
}

export function getProposalPDFBlob(proposal: string, options: PDFOptions): Blob {
  const doc = generateProposalPDF(proposal, options);
  return doc.output('blob');
}

export function getProposalPDFDataUrl(proposal: string, options: PDFOptions): string {
  const doc = generateProposalPDF(proposal, options);
  return doc.output('dataurlstring');
}

export async function downloadPDFFromElement(
  element: HTMLElement,
  options: PDFOptions
): Promise<void> {
  const doc = await generatePDFFromElement(element, options);
  doc.save(`proposta-${options.client.toLowerCase().replace(/\s+/g, '-')}.pdf`);
}

export async function getPDFDataUrlFromElement(
  element: HTMLElement,
  options: PDFOptions
): Promise<string> {
  const doc = await generatePDFFromElement(element, options);
  return doc.output('dataurlstring');
}
