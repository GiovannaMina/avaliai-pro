import jsPDF from 'jspdf';

interface PDFOptions {
  title: string;
  client: string;
  date: string;
  themeColor?: string;
}

function cleanHTML(content: string): string {
  if (!content) return '';
  let cleaned = content
    .replace(/[%Ï•]/g, '')
    .replace(/<br\s*\/?>/g, '<br>')
    .replace(/&nbsp;/g, ' ');

  cleaned = cleaned.replace(/<li>\s*<p[^>]*>/g, '<li>').replace(/<\/p>\s*<\/li>/g, '</li>');
  
  if (!cleaned.includes('<')) return `<p>${cleaned}</p>`;
  return cleaned;
}

function parseSize(val: string | null): number {
  if (!val) return 12;
  const num = parseFloat(val);
  if (isNaN(num)) return 12;
  if (val.includes('pt')) return num;
  if (val.includes('px')) return num * 0.75; 
  return num;
}

export async function generateProposalPDF(proposal: string, options: PDFOptions): Promise<jsPDF> {
  const { title, client, date } = options;
  const themeColor = options.themeColor || '#f97316'; 
  
  const doc = new jsPDF();
  const mainFont = 'helvetica';
  
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);
  let yPosition = margin;
  
  let cursorX = margin;
  
  const checkNewPage = (requiredSpace: number) => {
    if (yPosition + requiredSpace > pageHeight - margin) {
      doc.addPage();
      yPosition = margin;
      cursorX = margin;
      return true;
    }
    return false;
  };

  doc.setFillColor(themeColor); 
  doc.rect(0, 0, pageWidth, 35, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont(mainFont, 'bold');
  doc.text('avaliAI', margin, 23);
  doc.setFontSize(10);
  doc.setFont(mainFont, 'normal');
  doc.text('Gerador de Propostas Inteligente', margin, 30);
  yPosition = 50;
  
  doc.setFillColor(245, 245, 245);
  doc.roundedRect(margin, yPosition, contentWidth, 25, 3, 3, 'F');
  doc.setTextColor(100, 100, 100);
  doc.setFont(mainFont, 'normal');
  doc.setFontSize(9);
  doc.text(`Cliente: ${client}`, margin + 5, yPosition + 10);
  doc.text(`Data: ${date}`, margin + 5, yPosition + 18);
  doc.text(`Documento: ${title}`, pageWidth / 2, yPosition + 10);
  yPosition = 85;

  const parser = new DOMParser();
  const htmlDoc = parser.parseFromString(cleanHTML(proposal), 'text/html');
  const body = htmlDoc.body;

  let lineBuffer: { 
    text: string; 
    width: number; 
    isSpace: boolean; 
    font: string; 
    style: string; 
    size: number; 
    color: number; 
    isUnderline: boolean;
  }[] = [];

  let currentLineWidth = 0;

  const flushLine = (align: string, isLastLine: boolean, indent: number) => {
    while (lineBuffer.length > 0 && lineBuffer[lineBuffer.length - 1].isSpace) {
      lineBuffer.pop();
    }

    if (lineBuffer.length === 0) {
      currentLineWidth = 0;
      return;
    }

    const maxLineHeight = Math.max(...lineBuffer.map(t => t.size * 0.45));
    
    const realLineWidth = lineBuffer.reduce((sum, t) => sum + t.width, 0);
    const availableSpace = contentWidth - (indent - margin) - realLineWidth;
    const spaceTokens = lineBuffer.filter(t => t.isSpace).length;
    
    let startX = indent;
    let extraSpace = 0;

    if (align === 'justify' && !isLastLine && spaceTokens > 0) {
      extraSpace = availableSpace / spaceTokens;
    } else if (align === 'center') {
      startX += availableSpace / 2;
    } else if (align === 'right') {
      startX += availableSpace;
    }

    let currentX = startX;

    lineBuffer.forEach(token => {
      doc.setFont(token.font, token.style);
      doc.setFontSize(token.size);
      doc.setTextColor(token.color, token.color, token.color);

      if (token.isSpace) {
        currentX += token.width + extraSpace;
      } else {
        doc.text(token.text, currentX, yPosition);
        
        if (token.isUnderline) {
          doc.setDrawColor(0,0,0);
          doc.setLineWidth(0.5);
          doc.line(currentX, yPosition + 1, currentX + token.width, yPosition + 1);
        }
        
        currentX += token.width;
      }
    });

    yPosition += maxLineHeight;
    checkNewPage(10);
    
    lineBuffer = [];
    currentLineWidth = 0;
  };

  const processNode = (node: Node, context: { 
    font: string, 
    isBold: boolean,    
    isItalic: boolean,  
    isUnderline: boolean,
    size: number, 
    align: string, 
    indent: number, 
    listType: 'ul' | 'ol' | 'none', 
    listCounter: number 
  }) => {
    
    if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as HTMLElement;
      const tagName = el.tagName.toLowerCase();
      
      let current = { ...context };

      if (el.style.fontSize) current.size = parseSize(el.style.fontSize);
      if (el.style.textAlign) current.align = el.style.textAlign;

      if (tagName === 'strong' || tagName === 'b' || Number(el.style.fontWeight) >= 700) current.isBold = true;
      if (tagName === 'em' || tagName === 'i' || el.style.fontStyle === 'italic') current.isItalic = true;
      if (tagName === 'u' || el.style.textDecoration?.includes('underline')) current.isUnderline = true;

      const isBlock = ['p', 'div', 'h1', 'h2', 'h3', 'li', 'ul', 'ol'].includes(tagName);

      if (['h1', 'h2', 'h3'].includes(tagName)) {
        current.isBold = true;
        current.isItalic = false;
        if (tagName === 'h1') current.size = 22;
        if (tagName === 'h2') current.size = 16;
        if (tagName === 'h3') current.size = 13;
        flushLine(current.align, true, current.indent); 
        checkNewPage(20);
        yPosition += 5;
      }

      if (isBlock && lineBuffer.length > 0) {
        flushLine(current.align, true, current.indent);
      }

      if (tagName === 'ol') { current.listType = 'ol'; current.listCounter = 1; }
      if (tagName === 'ul') { current.listType = 'ul'; }

      if (tagName === 'li') {
        current.indent = margin + 12;
        
        let styleStr = 'normal';
        if (current.isBold && current.isItalic) styleStr = 'bolditalic';
        else if (current.isBold) styleStr = 'bold';
        else if (current.isItalic) styleStr = 'italic';

        doc.setFont(mainFont, styleStr);
        doc.setFontSize(current.size);
        doc.setTextColor(0, 0, 0); 
        
        if (current.listType === 'ol') {
          doc.text(`${current.listCounter}.`, margin + 4, yPosition);
          current.listCounter++; 
        } else {
          const bulletY = yPosition - (current.size * 0.115); 
          doc.setFillColor(0, 0, 0);
          doc.circle(margin + 4, bulletY, 1.2, 'F');
        }
      }

      let childCounter = 1;
      el.childNodes.forEach(child => {
        if (child.nodeName.toLowerCase() === 'li') {
            const childContext = { ...current, listCounter: childCounter };
            processNode(child, childContext);
            childCounter++;
        } else {
            processNode(child, current);
        }
      });

      if (isBlock) {
        flushLine(current.align, true, current.indent);
        yPosition += (current.size * 0.4); 
        checkNewPage(10);
      }
      return;
    }

    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent || '';
      if (!text) return;

      let styleStr = 'normal';
      if (context.isBold && context.isItalic) styleStr = 'bolditalic';
      else if (context.isBold) styleStr = 'bold';
      else if (context.isItalic) styleStr = 'italic';

      doc.setFont(mainFont, styleStr);
      doc.setFontSize(context.size);

      const tokens = text.split(/(\s+)/);

      tokens.forEach(token => {
        if (token.length === 0) return;

        const isSpace = /^\s+$/.test(token);

        if (lineBuffer.length === 0 && isSpace) {
          return;
        }

        const tokenWidth = doc.getTextWidth(token);
        const maxW = contentWidth - (context.indent - margin);

        if (tokenWidth > maxW) {
            if (currentLineWidth > 0) {
               flushLine(context.align, false, context.indent);
            }
            
            let remainingToken = token;
            while (remainingToken.length > 0) {
               let chunk = "";
               let chunkWidth = 0;
               let i = 0;
               
               while (i < remainingToken.length) {
                  const char = remainingToken[i];
                  const charWidth = doc.getTextWidth(char);
                  if (chunkWidth + charWidth > maxW) break;
                  chunk += char;
                  chunkWidth += charWidth;
                  i++;
               }
               
               const tokenColor = context.isBold ? 0 : 60;
               lineBuffer.push({
                  text: chunk,
                  width: chunkWidth,
                  isSpace: false,
                  font: mainFont,
                  style: styleStr,
                  size: context.size,
                  color: tokenColor,
                  isUnderline: context.isUnderline
               });
               
               if (i < remainingToken.length) {
                   flushLine(context.align, false, context.indent);
                   remainingToken = remainingToken.slice(i);
               } else {
                   currentLineWidth += chunkWidth;
                   remainingToken = "";
               }
            }
            return;
        }

        if (currentLineWidth + tokenWidth > maxW) {
          if (isSpace) return;
          flushLine(context.align, false, context.indent);
        }

        const tokenColor = context.isBold ? 0 : 60;

        lineBuffer.push({
          text: token,
          width: tokenWidth,
          isSpace: isSpace,
          font: mainFont,
          style: styleStr,
          size: context.size,
          color: tokenColor,
          isUnderline: context.isUnderline
        });

        currentLineWidth += tokenWidth;
      });
    }
  };

  processNode(body, {
    font: mainFont,
    isBold: false,
    isItalic: false,
    isUnderline: false,
    size: 12,
    align: 'justify',
    indent: margin,
    listType: 'none',
    listCounter: 0
  });

  flushLine('left', true, margin);

  return doc;
}

export async function downloadProposalPDF(proposal: string, options: PDFOptions): Promise<void> {
  const doc = await generateProposalPDF(proposal, options);
  const safeClientName = options.client.toLowerCase().replace(/[^a-z0-9]/g, '-');
  doc.save(`proposta-${safeClientName}.pdf`);
}

export async function getProposalPDFDataUrl(proposal: string, options: PDFOptions): Promise<string> {
  const doc = await generateProposalPDF(proposal, options);
  return doc.output('dataurlstring');
}

export async function getProposalPDFBlob(proposal: string, options: PDFOptions): Promise<Blob> {
  const doc = await generateProposalPDF(proposal, options);
  return doc.output('blob');
}