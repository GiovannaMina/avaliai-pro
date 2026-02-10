import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import FontFamily from '@tiptap/extension-font-family';
import { 
  Bold, Italic, Underline as UnderlineIcon, List, ListOrdered, 
  AlignLeft, AlignCenter, AlignRight, AlignJustify, 
  Undo, Redo, ALargeSmall 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useEffect, useRef, useState } from 'react';
import { Extension } from '@tiptap/core';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
}

const FontSize = Extension.create({
  name: 'fontSize',
  addOptions() { return { types: ['textStyle'] }; },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: element => element.style.fontSize?.replace(/['"]+/g, ''),
            renderHTML: attributes => {
              if (!attributes.fontSize) return {};
              return { style: `font-size: ${attributes.fontSize}` };
            },
          },
        },
      },
    ];
  },
  addCommands() {
    return {
      setFontSize: (fontSize: string) => ({ chain }) => chain().setMark('textStyle', { fontSize }).run(),
      unsetFontSize: () => ({ chain }) => chain().setMark('textStyle', { fontSize: null }).removeEmptyTextStyle().run(),
    } as any;
  },
});

const FONT_SIZES = [
  { value: '10pt', label: '10' },
  { value: '11pt', label: '11' },
  { value: '12pt', label: '12' },
  { value: '13pt', label: '13' },
  { value: '14pt', label: '14' },
  { value: '16pt', label: '16' },
  { value: '18pt', label: '18' },
  { value: '24pt', label: '24' },
];

export function RichTextEditor({ content, onChange }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [_, forceUpdate] = useState(0);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      TextStyle,
      FontFamily.configure({ types: ['textStyle'] }),
      FontSize,
    ],
    content: convertMarkdownToHtml(content),
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    onSelectionUpdate: () => forceUpdate(n => n + 1),
    onTransaction: () => forceUpdate(n => n + 1),
    editorProps: {
      attributes: { class: 'wysiwyg-editor outline-none' },
    },
  });

  useEffect(() => {
    if (editor && content) {
      const currentHtml = editor.getHTML();
      if (currentHtml !== content && !content.startsWith('<')) {
        editor.commands.setContent(convertMarkdownToHtml(content));
      }
    }
  }, [content, editor]);

  if (!editor) return null;

  const ToolbarButton = ({ onClick, isActive = false, children, title }: any) => (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onMouseDown={(e) => { e.preventDefault(); onClick(); }}
      title={title}
      className={`h-8 w-8 p-0 ${isActive ? 'bg-accent text-primary' : 'text-muted-foreground hover:text-foreground'}`}
    >
      {children}
    </Button>
  );

  return (
    <div className="flex flex-col h-full bg-muted/30">
      <div className="flex items-center gap-1 px-3 py-2 border-b bg-card flex-wrap shrink-0">
        <ToolbarButton onClick={() => editor.chain().focus().undo().run()} title="Desfazer"><Undo className="w-4 h-4" /></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().redo().run()} title="Refazer"><Redo className="w-4 h-4" /></ToolbarButton>
        
        <Separator orientation="vertical" className="h-6 mx-1" />
        
        <Select
          value={editor.getAttributes('textStyle').fontSize || '12pt'}
          onValueChange={(value) => (editor.commands as any).setFontSize(value)}
        >
          <SelectTrigger className="w-20 h-8 text-xs" onMouseDown={(e) => e.preventDefault()}>
            <ALargeSmall className="w-3 h-3 mr-1" />
            <SelectValue placeholder="Tam." />
          </SelectTrigger>
          <SelectContent>
            {FONT_SIZES.map((size) => (
              <SelectItem key={size.value} value={size.value}>{size.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Separator orientation="vertical" className="h-6 mx-1" />
        
        <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')} title="Negrito"><Bold className="w-4 h-4" /></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')} title="Itálico"><Italic className="w-4 h-4" /></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} isActive={editor.isActive('underline')} title="Sublinhado"><UnderlineIcon className="w-4 h-4" /></ToolbarButton>
        
        <Separator orientation="vertical" className="h-6 mx-1" />
        
        <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')} title="Lista"><List className="w-4 h-4" /></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive('orderedList')} title="Numerada"><ListOrdered className="w-4 h-4" /></ToolbarButton>
        
        <Separator orientation="vertical" className="h-6 mx-1" />
        
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('left').run()} isActive={editor.isActive({ textAlign: 'left' })} title="Esquerda"><AlignLeft className="w-4 h-4" /></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('center').run()} isActive={editor.isActive({ textAlign: 'center' })} title="Centro"><AlignCenter className="w-4 h-4" /></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('right').run()} isActive={editor.isActive({ textAlign: 'right' })} title="Direita"><AlignRight className="w-4 h-4" /></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('justify').run()} isActive={editor.isActive({ textAlign: 'justify' })} title="Justificado"><AlignJustify className="w-4 h-4" /></ToolbarButton>
      </div>

      <div className="flex-1 overflow-auto py-8 px-4">
        <div ref={editorRef} className="a4-container mx-auto bg-white shadow-2xl" id="editor-content">
          <EditorContent editor={editor} className="h-full" />
        </div>
      </div>
    </div>
  );
}

export function getEditorElement(): HTMLElement | null {
  return document.getElementById('editor-content');
}

function convertMarkdownToHtml(markdown: string): string {
  if (markdown.startsWith('<')) return markdown;
  let html = markdown;
  
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  
  const lines = html.split('\n');
  let inList = false;
  let listType = '';

  let newLines = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    const isBullet = line.startsWith('- ') || line.startsWith('* ');
    const isOrdered = /^\d+\.\s/.test(line);
    
    if (isBullet || isOrdered) {
      const currentType = isBullet ? 'ul' : 'ol';
      const content = line.replace(/^(-\s|\*\s|\d+\.\s)/, '');
      
      if (!inList) {
        inList = true;
        listType = currentType;
        newLines.push(`<${listType}>`);
      } else if (listType !== currentType) {
        newLines.push(`</${listType}>`);
        listType = currentType;
        newLines.push(`<${listType}>`);
      }
      newLines.push(`<li>${content}</li>`);
    } else {
      if (inList) {
        newLines.push(`</${listType}>`);
        inList = false;
      }
      if (line.length > 0 && !line.startsWith('<')) {
        newLines.push(`<p>${line}</p>`);
      } else {
        newLines.push(line);
      }
    }
  }
  if (inList) newLines.push(`</${listType}>`);
  
  return newLines.join('');
}