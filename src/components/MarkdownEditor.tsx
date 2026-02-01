import { useRef, useCallback } from 'react';
import { 
  Bold, 
  Italic, 
  Heading1, 
  Heading2, 
  List, 
  ListOrdered, 
  Code, 
  Link as LinkIcon,
  Quote,
  Minus,
} from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: string;
}

export function MarkdownEditor({
  value,
  onChange,
  placeholder = 'Start writing... (Markdown supported)',
  className,
  minHeight = '400px',
}: MarkdownEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertFormat = useCallback((before: string, after: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    
    const newText = value.substring(0, start) + before + selectedText + after + value.substring(end);
    onChange(newText);

    // Restore cursor position
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + before.length + selectedText.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  }, [value, onChange]);

  const insertAtLineStart = useCallback((prefix: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const lineStart = value.lastIndexOf('\n', start - 1) + 1;
    
    const newText = value.substring(0, lineStart) + prefix + value.substring(lineStart);
    onChange(newText);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length);
    }, 0);
  }, [value, onChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Cmd/Ctrl + B for bold
    if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
      e.preventDefault();
      insertFormat('**', '**');
    }
    // Cmd/Ctrl + I for italic
    if ((e.metaKey || e.ctrlKey) && e.key === 'i') {
      e.preventDefault();
      insertFormat('*', '*');
    }
    // Cmd/Ctrl + K for link
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      insertFormat('[', '](url)');
    }
  }, [insertFormat]);

  const tools = [
    { icon: Bold, action: () => insertFormat('**', '**'), title: 'Bold (Cmd+B)' },
    { icon: Italic, action: () => insertFormat('*', '*'), title: 'Italic (Cmd+I)' },
    { icon: Heading1, action: () => insertAtLineStart('# '), title: 'Heading 1' },
    { icon: Heading2, action: () => insertAtLineStart('## '), title: 'Heading 2' },
    { icon: List, action: () => insertAtLineStart('- '), title: 'Bullet List' },
    { icon: ListOrdered, action: () => insertAtLineStart('1. '), title: 'Numbered List' },
    { icon: Code, action: () => insertFormat('`', '`'), title: 'Inline Code' },
    { icon: LinkIcon, action: () => insertFormat('[', '](url)'), title: 'Link (Cmd+K)' },
    { icon: Quote, action: () => insertAtLineStart('> '), title: 'Quote' },
    { icon: Minus, action: () => insertFormat('\n---\n'), title: 'Horizontal Rule' },
  ];

  return (
    <div className={cn("space-y-2", className)}>
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-2 bg-surface border border-border">
        {tools.map((tool, index) => (
          <button
            key={index}
            type="button"
            onClick={tool.action}
            title={tool.title}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-background transition-colors"
          >
            <tool.icon className="h-4 w-4" />
          </button>
        ))}
      </div>

      {/* Editor */}
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="font-mono bg-surface border-border resize-none"
        style={{ minHeight }}
      />

      {/* Hints */}
      <div className="flex items-center gap-4 text-[10px] text-muted-foreground font-mono">
        <span>[[Note Title]] to link notes</span>
        <span>**bold**</span>
        <span>*italic*</span>
        <span>`code`</span>
      </div>
    </div>
  );
}
