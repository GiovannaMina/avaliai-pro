import jsPDF from 'jspdf';

interface PDFOptions {
  title: string;
  client: string;
  date: string;
}

export function generateProposalPDF(proposal: string, options: PDFOptions): jsPDF {
  const { title, client, date } = options;
  const doc = new jsPDF();
  
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);
  let yPosition = margin;
  
  // Helper function to add new page if needed
  const checkNewPage = (requiredSpace: number) => {
    if (yPosition + requiredSpace > pageHeight - margin) {
      doc.addPage();
      yPosition = margin;
      return true;
    }
    return false;
  };

  // Header with brand color
  doc.setFillColor(255, 107, 0); // Orange brand color
  doc.rect(0, 0, pageWidth, 35, 'F');
  
  // Logo text
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('avaliAI', margin, 23);
  
  // Subtitle
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Gerador de Propostas Inteligente', margin, 30);
  
  yPosition = 50;
  
  // Document info box
  doc.setFillColor(245, 245, 245);
  doc.roundedRect(margin, yPosition, contentWidth, 25, 3, 3, 'F');
  
  doc.setTextColor(100, 100, 100);
  doc.setFontSize(9);
  doc.text(`Cliente: ${client}`, margin + 5, yPosition + 10);
  doc.text(`Data: ${date}`, margin + 5, yPosition + 18);
  doc.text(`Documento: ${title}`, pageWidth / 2, yPosition + 10);
  
  yPosition = 85;
  
  // Process proposal content
  const lines = proposal.split('\n');
  
  lines.forEach((line) => {
    if (line.trim() === '') {
      yPosition += 5;
      return;
    }
    
    // Main title (# )
    if (line.startsWith('# ')) {
      checkNewPage(20);
      doc.setTextColor(30, 30, 30);
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      const text = line.replace('# ', '');
      doc.text(text, margin, yPosition);
      yPosition += 12;
      
      // Orange underline
      doc.setDrawColor(255, 107, 0);
      doc.setLineWidth(0.5);
      doc.line(margin, yPosition - 4, margin + doc.getTextWidth(text), yPosition - 4);
      yPosition += 5;
      return;
    }
    
    // Section title (## )
    if (line.startsWith('## ')) {
      checkNewPage(15);
      yPosition += 5;
      doc.setTextColor(50, 50, 50);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(line.replace('## ', ''), margin, yPosition);
      yPosition += 10;
      return;
    }
    
    // Subsection title (### )
    if (line.startsWith('### ')) {
      checkNewPage(12);
      yPosition += 3;
      doc.setTextColor(70, 70, 70);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(line.replace('### ', ''), margin, yPosition);
      yPosition += 8;
      return;
    }
    
    // List item (- )
    if (line.startsWith('- ')) {
      checkNewPage(8);
      doc.setTextColor(80, 80, 80);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      
      // Orange bullet
      doc.setFillColor(255, 107, 0);
      doc.circle(margin + 2, yPosition - 1.5, 1.5, 'F');
      
      const text = line.replace('- ', '');
      const splitText = doc.splitTextToSize(text, contentWidth - 10);
      doc.text(splitText, margin + 8, yPosition);
      yPosition += (splitText.length * 5) + 3;
      return;
    }
    
    // Bold text (**text**)
    if (line.startsWith('**') && line.endsWith('**')) {
      checkNewPage(10);
      doc.setTextColor(50, 50, 50);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(line.replace(/\*\*/g, ''), margin, yPosition);
      yPosition += 7;
      return;
    }
    
    // Regular paragraph
    checkNewPage(8);
    doc.setTextColor(80, 80, 80);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const splitText = doc.splitTextToSize(line, contentWidth);
    doc.text(splitText, margin, yPosition);
    yPosition += (splitText.length * 5) + 3;
  });
  
  // Footer on all pages
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    
    // Footer line
    doc.setDrawColor(255, 107, 0);
    doc.setLineWidth(0.3);
    doc.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);
    
    // Footer text
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
