import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface MarkdownPreviewProps {
  content: string;
  className?: string;
  noteLinks?: { id: string; title: string }[];
}

export function MarkdownPreview({ content, className, noteLinks = [] }: MarkdownPreviewProps) {
  const html = useMemo(() => parseMarkdown(content, noteLinks), [content, noteLinks]);

  return (
    <div 
      className={cn("prose prose-invert max-w-none", className)}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

function parseMarkdown(text: string, noteLinks: { id: string; title: string }[]): string {
  if (!text) return '';

  let html = escapeHtml(text);

  // Code blocks (triple backticks)
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
    return `<pre class="bg-surface border border-border p-4 overflow-x-auto font-mono text-sm"><code class="language-${lang}">${code.trim()}</code></pre>`;
  });

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code class="bg-surface px-1.5 py-0.5 font-mono text-sm text-primary">$1</code>');

  // Headers
  html = html.replace(/^### (.+)$/gm, '<h3 class="text-lg font-bold font-display mt-6 mb-2">$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold font-display mt-8 mb-3">$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold font-display mt-8 mb-4 text-primary">$1</h1>');

  // Bold
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-bold">$1</strong>');

  // Italic
  html = html.replace(/\*([^*]+)\*/g, '<em class="italic">$1</em>');

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-primary underline hover:text-primary/80">$1</a>');

  // Note links [[Note Title]]
  html = html.replace(/\[\[([^\]]+)\]\]/g, (_, title) => {
    const note = noteLinks.find(n => n.title.toLowerCase() === title.toLowerCase());
    if (note) {
      return `<a href="/notes/${note.id}" class="text-glow-secondary underline hover:text-glow-secondary/80">[[${title}]]</a>`;
    }
    return `<span class="text-muted-foreground">[[${title}]]</span>`;
  });

  // Unordered lists
  html = html.replace(/^- (.+)$/gm, '<li class="ml-4 list-disc">$1</li>');
  html = html.replace(/(<li[^>]*>.*<\/li>\n?)+/g, '<ul class="my-2">$&</ul>');

  // Ordered lists
  html = html.replace(/^\d+\. (.+)$/gm, '<li class="ml-4 list-decimal">$1</li>');

  // Blockquotes
  html = html.replace(/^> (.+)$/gm, '<blockquote class="border-l-2 border-primary pl-4 italic text-muted-foreground my-4">$1</blockquote>');

  // Horizontal rules
  html = html.replace(/^---$/gm, '<hr class="border-border my-6" />');

  // Paragraphs (double newlines)
  html = html.replace(/\n\n/g, '</p><p class="my-4">');
  
  // Single newlines to <br>
  html = html.replace(/\n/g, '<br />');

  // Wrap in paragraph if not already wrapped
  if (!html.startsWith('<')) {
    html = `<p class="my-4">${html}</p>`;
  }

  return html;
}

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
  };
  return text.replace(/[&<>]/g, char => map[char] || char);
}
