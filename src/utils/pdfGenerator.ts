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
    listCounter: number,
    listDepth: number
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

      if (tagName === 'table') {
        flushLine(current.align, true, current.indent);
        yPosition += 8;
        checkNewPage(15);

        const rows = Array.from(el.querySelectorAll('tr'));
        if (rows.length === 0) return;

        let maxCols = 0;
        const firstRowCells = Array.from(rows[0].querySelectorAll('th, td'));
        const explicitWidths: number[] = [];
        let hasExplicitWidths = false;

        firstRowCells.forEach(c => {
            const span = parseInt(c.getAttribute('colspan') || '1', 10);
            maxCols += span;
            const cw = c.getAttribute('colwidth');
            if (cw) {
                hasExplicitWidths = true;
                cw.split(',').forEach(w => explicitWidths.push(parseInt(w, 10)));
            } else {
                for(let i=0; i<span; i++) explicitWidths.push(0);
            }
        });

        if (maxCols === 0) return;

        const tableAvailableWidth = contentWidth - (current.indent - margin);
        const pdfColWidths: number[] = [];

        if (hasExplicitWidths) {
            const totalExplicit = explicitWidths.reduce((a,b) => a + (b || 100), 0);
            explicitWidths.forEach(w => {
                pdfColWidths.push(((w || 100) / totalExplicit) * tableAvailableWidth);
            });
        } else {
            for(let i=0; i<maxCols; i++) {
                pdfColWidths.push(tableAvailableWidth / maxCols);
            }
        }

        const cellPadding = 4;

        interface RenderWord { text: string; isBold: boolean; isItalic: boolean; size: number; width: number; }
        interface RenderLine { words: RenderWord[]; width: number; maxHeight: number; align: string; }

        rows.forEach(row => {
           const cells = Array.from(row.querySelectorAll('th, td'));
           let rowHeight = 0;
           const cellData: { lines: RenderLine[], isHeader: boolean, cellW: number }[] = [];
           let colIndex = 0;

           cells.forEach(cell => {
              const isHeader = cell.tagName.toLowerCase() === 'th';
              const colSpan = parseInt(cell.getAttribute('colspan') || '1', 10);
              
              const cellW = pdfColWidths.slice(colIndex, colIndex + colSpan).reduce((a,b) => a+b, 0);
              colIndex += colSpan;

              const paragraphs: RenderLine[][] = [];
              const childNodes = Array.from(cell.childNodes);
              const nodesToProcess = childNodes.length > 0 ? childNodes : [document.createTextNode(cell.textContent || '')];

              nodesToProcess.forEach(child => {
                  const pAlign = (child as HTMLElement).style?.textAlign || 'left';
                  let currentSize = isHeader ? 11 : current.size;
                  if ((child as HTMLElement).style?.fontSize) {
                      currentSize = parseSize((child as HTMLElement).style.fontSize);
                  }

                  const words: RenderWord[] = [];

                  const traverse = (node: Node, ctx: any) => {
                      if (node.nodeType === Node.TEXT_NODE) {
                          const text = node.textContent || '';
                          if (!text.trim() && text !== ' ') return;
                          
                          const textWords = text.split(/(\s+)/).filter(w => w.length > 0);
                          textWords.forEach(w => {
                              doc.setFont(mainFont, (ctx.isBold && ctx.isItalic) ? 'bolditalic' : ctx.isBold ? 'bold' : ctx.isItalic ? 'italic' : 'normal');
                              doc.setFontSize(ctx.size);
                              const wWidth = doc.getTextWidth(w);
                              
                              const maxContentW = cellW - (cellPadding * 2);

                              if (wWidth > maxContentW && !/^\s+$/.test(w)) {
                                  let chunk = '';
                                  let chunkW = 0;
                                  for (let i = 0; i < w.length; i++) {
                                      const charW = doc.getTextWidth(w[i]);
                                      if (chunkW + charW > maxContentW && chunk.length > 0) {
                                          words.push({ text: chunk, ...ctx, width: chunkW });
                                          chunk = w[i];
                                          chunkW = charW;
                                      } else {
                                          chunk += w[i];
                                          chunkW += charW;
                                      }
                                  }
                                  if (chunk.length > 0) {
                                      words.push({ text: chunk, ...ctx, width: chunkW });
                                  }
                              } else {
                                  words.push({ text: w, ...ctx, width: wWidth });
                              }
                          });
                      } else if (node.nodeType === Node.ELEMENT_NODE) {
                          const e = node as HTMLElement;
                          const tag = e.tagName.toLowerCase();
                          const newCtx = { ...ctx };
                          if (tag === 'strong' || tag === 'b' || Number(e.style.fontWeight) >= 700) newCtx.isBold = true;
                          if (tag === 'em' || tag === 'i') newCtx.isItalic = true;
                          if (e.style.fontSize) newCtx.size = parseSize(e.style.fontSize);
                          if (e.style.textAlign) newCtx.align = e.style.textAlign;
                          
                          Array.from(node.childNodes).forEach(c => traverse(c, newCtx));
                      }
                  };

                  traverse(child, { isBold: isHeader, isItalic: false, size: currentSize });

                  const maxContentW = cellW - (cellPadding * 2);
                  const lines: RenderLine[] = [];
                  let currentLineWords: RenderWord[] = [];
                  let currentLineW = 0;

                  words.forEach(w => {
                      const isSpace = /^\s+$/.test(w.text);
                      if (currentLineW + w.width > maxContentW && currentLineWords.length > 0) {
                          if (isSpace) return; 
                          
                          while(currentLineWords.length > 0 && /^\s+$/.test(currentLineWords[currentLineWords.length - 1].text)) {
                              const removed = currentLineWords.pop()!;
                              currentLineW -= removed.width;
                          }

                          lines.push({
                              words: currentLineWords,
                              width: currentLineW,
                              maxHeight: Math.max(...currentLineWords.map(cw => cw.size * 0.45), currentSize * 0.45),
                              align: pAlign
                          });
                          currentLineWords = [w];
                          currentLineW = w.width;
                      } else {
                          currentLineWords.push(w);
                          currentLineW += w.width;
                      }
                  });
                  if (currentLineWords.length > 0) {
                      lines.push({
                          words: currentLineWords,
                          width: currentLineW,
                          maxHeight: Math.max(...currentLineWords.map(cw => cw.size * 0.45), currentSize * 0.45),
                          align: pAlign
                      });
                  }
                  
                  if (lines.length > 0) paragraphs.push(lines);
              });

              let cellTotalHeight = cellPadding * 2;
              const flatLines: RenderLine[] = [];
              paragraphs.forEach((lines, idx) => {
                  lines.forEach(l => {
                      flatLines.push(l);
                      cellTotalHeight += l.maxHeight;
                  });
                  if (idx < paragraphs.length - 1) cellTotalHeight += 3; 
              });
              
              if (cellTotalHeight > rowHeight) rowHeight = cellTotalHeight;
              cellData.push({ lines: flatLines, isHeader, cellW });
           });

           checkNewPage(rowHeight);

           let currentX = current.indent;
           cellData.forEach(data => {
              doc.setDrawColor(180, 180, 180);
              doc.setLineWidth(0.1);
              if (data.isHeader) {
                  doc.setFillColor(245, 245, 245);
                  doc.rect(currentX, yPosition, data.cellW, rowHeight, 'FD');
              } else {
                  doc.rect(currentX, yPosition, data.cellW, rowHeight, 'S');
              }

              let textY = yPosition + cellPadding; 
              
              data.lines.forEach(line => {
                 let lineX = currentX + cellPadding;
                 const maxContentW = data.cellW - (cellPadding * 2);
                 
                 const cleanWords = [...line.words];
                 while(cleanWords.length > 0 && /^\s+$/.test(cleanWords[cleanWords.length - 1].text)) {
                     cleanWords.pop();
                 }
                 const cleanWidth = cleanWords.reduce((sum, w) => sum + w.width, 0);

                 if (line.align === 'center') {
                     lineX += (maxContentW - cleanWidth) / 2;
                 } else if (line.align === 'right') {
                     lineX += (maxContentW - cleanWidth);
                 }

                 textY += line.maxHeight;

                 cleanWords.forEach(w => {
                    doc.setFont(mainFont, (w.isBold && w.isItalic) ? 'bolditalic' : w.isBold ? 'bold' : w.isItalic ? 'italic' : 'normal');
                    doc.setFontSize(w.size);
                    doc.setTextColor(w.isBold ? 0 : 60);
                    if (!/^\s+$/.test(w.text)) {
                        doc.text(w.text, lineX, textY - (line.maxHeight * 0.15));
                    }
                    lineX += w.width;
                 });
              });

              currentX += data.cellW;
           });

           yPosition += rowHeight;
        });

        yPosition += 8;
        checkNewPage(10);
        return;
      }

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

      if (tagName === 'ol' || tagName === 'ul') {
          current.indent += 12;
          current.listDepth = (current.listDepth || 0) + 1;
          
          if (tagName === 'ol') {
              current.listType = 'ol';
              current.listCounter = 1;
          } else {
              current.listType = 'ul';
          }
      }

      if (tagName === 'li') {
        
        let styleStr = 'normal';
        if (current.isBold && current.isItalic) styleStr = 'bolditalic';
        else if (current.isBold) styleStr = 'bold';
        else if (current.isItalic) styleStr = 'italic';

        doc.setFont(mainFont, styleStr);
        doc.setFontSize(current.size);
        doc.setTextColor(0, 0, 0); 
        
        if (current.listType === 'ol') {
            doc.text(`${current.listCounter}.`, current.indent - 7, yPosition);
          } else {
            const bulletY = yPosition - (current.size * 0.115); 
            const depth = current.listDepth || 1;
            
          if (depth === 1) {
              doc.setFillColor(0, 0, 0);
              doc.circle(current.indent - 6, bulletY, 1.2, 'F'); 
          } else if (depth === 2) {
              doc.setDrawColor(0, 0, 0);
              doc.setLineWidth(0.3);
              doc.circle(current.indent - 6, bulletY, 1.2, 'S'); 
          } else {
              doc.setFillColor(0, 0, 0);
              doc.rect(current.indent - 7, bulletY - 1, 2.2, 2.2, 'F'); 
          }
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
    listCounter: 0,
    listDepth: 0
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