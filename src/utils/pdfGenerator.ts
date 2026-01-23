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
  const margin = 25;
  const contentWidth = pageWidth - (margin * 2);
  let yPosition = margin;
  
  // Helper function to add new page if needed
  const checkNewPage = (requiredSpace: number) => {
    if (yPosition + requiredSpace > pageHeight - margin) {
      doc.addPage();
      yPosition = margin + 10;
      return true;
    }
    return false;
  };

  // Helper function to draw thin horizontal line
  const drawSeparator = () => {
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 8;
  };

  // Header - Clean white background with logos placeholder
  yPosition = 20;
  
  // Left side - Client logo placeholder text
  doc.setTextColor(150, 150, 150);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('[Logo Cliente]', margin, yPosition);
  
  // Right side - avaliAI logo text
  doc.setTextColor(255, 107, 0); // Brand orange
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  const brandText = 'avaliAI';
  const brandWidth = doc.getTextWidth(brandText);
  doc.text(brandText, pageWidth - margin - brandWidth, yPosition);
  
  yPosition = 40;
  
  // Thin separator line
  drawSeparator();
  
  // Proposal header
  doc.setTextColor(100, 100, 100);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Proposta avaliAI, by Flow.Ers:', margin, yPosition);
  yPosition += 10;
  
  // Main title
  doc.setTextColor(30, 30, 30);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(title || 'Proposta Comercial', margin, yPosition);
  yPosition += 12;
  
  // Metadata
  doc.setTextColor(80, 80, 80);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  if (client) {
    doc.text(`Para: ${client}`, margin, yPosition);
    yPosition += 6;
  }
  doc.text(`Data: ${date}`, margin, yPosition);
  yPosition += 12;
  
  // Separator after metadata
  drawSeparator();
  
  // Process proposal content
  const lines = proposal.split('\n');
  
  lines.forEach((line) => {
    if (line.trim() === '') {
      yPosition += 4;
      return;
    }
    
    // Horizontal rule (---)
    if (line.trim() === '---') {
      checkNewPage(15);
      yPosition += 5;
      drawSeparator();
      return;
    }
    
    // Main title (# ) - Bold, uppercase with separator below
    if (line.startsWith('# ')) {
      checkNewPage(20);
      yPosition += 8;
      doc.setTextColor(30, 30, 30);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      const text = line.replace('# ', '').toUpperCase();
      doc.text(text, margin, yPosition);
      yPosition += 8;
      drawSeparator();
      return;
    }
    
    // Section title (## ) - Bold, uppercase
    if (line.startsWith('## ')) {
      checkNewPage(15);
      yPosition += 6;
      doc.setTextColor(40, 40, 40);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      const text = line.replace('## ', '').toUpperCase();
      doc.text(text, margin, yPosition);
      yPosition += 10;
      return;
    }
    
    // Subsection title (### )
    if (line.startsWith('### ')) {
      checkNewPage(12);
      yPosition += 4;
      doc.setTextColor(50, 50, 50);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(line.replace('### ', ''), margin, yPosition);
      yPosition += 8;
      return;
    }
    
    // List item (- ) - Simple black bullet
    if (line.startsWith('- ')) {
      checkNewPage(8);
      doc.setTextColor(60, 60, 60);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      
      // Simple bullet point
      doc.setFillColor(60, 60, 60);
      doc.circle(margin + 2, yPosition - 1.5, 1, 'F');
      
      const text = line.replace('- ', '');
      const splitText = doc.splitTextToSize(text, contentWidth - 10);
      doc.text(splitText, margin + 8, yPosition);
      yPosition += (splitText.length * 5) + 3;
      return;
    }
    
    // Bold text (**text**)
    if (line.startsWith('**') && line.endsWith('**')) {
      checkNewPage(10);
      doc.setTextColor(40, 40, 40);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      const text = line.replace(/\*\*/g, '');
      const splitText = doc.splitTextToSize(text, contentWidth);
      doc.text(splitText, margin, yPosition);
      yPosition += (splitText.length * 5) + 3;
      return;
    }
    
    // Regular paragraph
    checkNewPage(8);
    doc.setTextColor(60, 60, 60);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const splitText = doc.splitTextToSize(line, contentWidth);
    doc.text(splitText, margin, yPosition);
    yPosition += (splitText.length * 5) + 3;
  });
  
  // Minimal footer on all pages
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    
    // Page number only
    doc.setTextColor(180, 180, 180);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    const pageText = `${i}/${pageCount}`;
    const pageTextWidth = doc.getTextWidth(pageText);
    doc.text(pageText, (pageWidth - pageTextWidth) / 2, pageHeight - 10);
  }
  
  return doc;
}

export function downloadProposalPDF(proposal: string, options: PDFOptions): void {
  const doc = generateProposalPDF(proposal, options);
  doc.save(`proposta-${options.client.toLowerCase().replace(/\s+/g, '-') || 'comercial'}.pdf`);
}

export function getProposalPDFBlob(proposal: string, options: PDFOptions): Blob {
  const doc = generateProposalPDF(proposal, options);
  return doc.output('blob');
}

export function getProposalPDFDataUrl(proposal: string, options: PDFOptions): string {
  const doc = generateProposalPDF(proposal, options);
  return doc.output('dataurlstring');
}
