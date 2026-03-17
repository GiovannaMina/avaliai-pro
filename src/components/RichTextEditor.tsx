import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import FontFamily from '@tiptap/extension-font-family';
import { 
  Bold, Italic, Underline as UnderlineIcon, List, ListOrdered, 
  AlignLeft, AlignCenter, AlignRight, AlignJustify, 
  Undo, Redo, ALargeSmall, 
  Trash2, Table as TableIcon, ChevronDown, Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useEffect, useRef, useState } from 'react';
import { Extension } from '@tiptap/core';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableHeader } from '@tiptap/extension-table-header';
import { TableCell } from '@tiptap/extension-table-cell';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

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
      Table.configure({ 
        resizable: true,
        allowTableNodeSelection: true 
      }) as any,
      TableRow as any,
      TableHeader as any,
      TableCell as any,
    ],
    content: content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    onSelectionUpdate: () => forceUpdate(n => n + 1),
    onTransaction: () => forceUpdate(n => n + 1),
    editorProps: {
      attributes: { 
        class: 'wysiwyg-editor outline-none',
        spellcheck: 'false' 
      },
    },
  });

  useEffect(() => {
    if (editor && content) {
      const currentHtml = editor.getHTML();
      if (currentHtml !== content && !content.startsWith('<')) {
        editor.commands.setContent(content);
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
      <style>{`
        .resize-cursor {
          cursor: col-resize !important;
        }
      `}</style>
      <div className="flex items-center gap-1 px-3 py-2 border-b bg-card flex-wrap shrink-0 shadow-sm">
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

        <Separator orientation="vertical" className="h-6 mx-1" />


        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 gap-1 px-1 text-muted-foreground hover:text-foreground cursor-pointer">
              <TableIcon className="w-4 h-4" />
              <ChevronDown className="w-3 h-3 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-64 bg-white border shadow-lg z-50 p-1">
            <DropdownMenuItem onClick={() => (editor.chain().focus() as any).insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} className="cursor-pointer">
              <Plus className="w-4 h-4 mr-2" /> Inserir tabela
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
            
            <DropdownMenuItem onClick={() => (editor.chain().focus() as any).addColumnBefore().run()} disabled={!editor.isActive('table')} className="cursor-pointer">
              Inserir coluna à esquerda
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => (editor.chain().focus() as any).addColumnAfter().run()} disabled={!editor.isActive('table')} className="cursor-pointer">
              Inserir coluna à direita
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => (editor.chain().focus() as any).deleteColumn().run()} disabled={!editor.isActive('table')} className="cursor-pointer">
              Apagar coluna
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
            
            <DropdownMenuItem onClick={() => (editor.chain().focus() as any).addRowBefore().run()} disabled={!editor.isActive('table')} className="cursor-pointer">
              Inserir linha acima
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => (editor.chain().focus() as any).addRowAfter().run()} disabled={!editor.isActive('table')} className="cursor-pointer">
              Inserir linha abaixo
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => (editor.chain().focus() as any).deleteRow().run()} disabled={!editor.isActive('table')} className="cursor-pointer">
              Apagar linha
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
            
            <DropdownMenuItem 
              onClick={() => (editor.chain().focus() as any).toggleHeaderRow().run()} 
              disabled={!editor.isActive('table')} 
              className="cursor-pointer"
            >
              Linha de cabeçalho (On/Off)
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => (editor.chain().focus() as any).toggleHeaderColumn().run()} 
              disabled={!editor.isActive('table')} 
              className="cursor-pointer"
            >
              Coluna de cabeçalho (On/Off)
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />

            <DropdownMenuItem 
              onClick={() => (editor.chain().focus() as any).deleteTable().run()} 
              disabled={!editor.isActive('table')}
              className="text-destructive focus:text-destructive cursor-pointer"
            >
              <Trash2 className="w-4 h-4 mr-2" /> Excluir tabela
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
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

