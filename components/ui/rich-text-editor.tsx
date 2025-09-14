'use client';

import { useState, useRef, useEffect } from 'react';
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Quote, 
  Link,
  Image,
  Type,
  Eye,
  Code,
  Heading1,
  Heading2,
  Heading3
} from 'lucide-react';
import { Button } from './button';
import { cn } from '@/lib/utils';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function RichTextEditor({ 
  value, 
  onChange, 
  placeholder = "Start writing...",
  className 
}: RichTextEditorProps) {
  const [showPreview, setShowPreview] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync value with textarea
  useEffect(() => {
    if (textareaRef.current && textareaRef.current.value !== value) {
      textareaRef.current.value = value;
    }
  }, [value]);

  const insertText = (before: string, after: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    const newText = textarea.value.substring(0, start) + before + selectedText + after + textarea.value.substring(end);
    
    onChange(newText);
    
    // Set cursor position after state update
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + before.length + selectedText.length + after.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const insertAtNewLine = (text: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const textBefore = textarea.value.substring(0, start);
    const textAfter = textarea.value.substring(start);
    
    // Check if we're at the start of a line
    const lastNewline = textBefore.lastIndexOf('\n');
    const currentLine = textBefore.substring(lastNewline + 1);
    
    let newText;
    if (currentLine.trim() === '') {
      // We're on an empty line, just add the text
      newText = textBefore + text + textAfter;
    } else {
      // We're in the middle of a line, add a newline first
      newText = textBefore + '\n' + text + textAfter;
    }
    
    onChange(newText);
    
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = currentLine.trim() === '' ? start + text.length : start + text.length + 1;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const formatButtons = [
    {
      icon: Heading1,
      label: 'Heading 1',
      action: () => insertAtNewLine('# '),
    },
    {
      icon: Heading2,
      label: 'Heading 2',
      action: () => insertAtNewLine('## '),
    },
    {
      icon: Heading3,
      label: 'Heading 3',
      action: () => insertAtNewLine('### '),
    },
    {
      icon: Bold,
      label: 'Bold',
      action: () => insertText('**', '**'),
    },
    {
      icon: Italic,
      label: 'Italic',
      action: () => insertText('*', '*'),
    },
    {
      icon: Code,
      label: 'Inline Code',
      action: () => insertText('`', '`'),
    },
    {
      icon: List,
      label: 'Bullet List',
      action: () => insertAtNewLine('- '),
    },
    {
      icon: ListOrdered,
      label: 'Numbered List',
      action: () => insertAtNewLine('1. '),
    },
    {
      icon: Quote,
      label: 'Quote',
      action: () => insertAtNewLine('> '),
    },
    {
      icon: Link,
      label: 'Link',
      action: () => insertText('[', '](url)'),
    },
    {
      icon: Image,
      label: 'Image',
      action: () => insertText('![', '](image-url)'),
    },
  ];

  // Enhanced markdown to HTML converter
  const renderPreview = (markdown: string) => {
    if (!markdown) return '<p class="text-muted-foreground">Nothing to preview...</p>';

    let html = markdown
      // Headers
      .replace(/^### (.*$)/gim, '<h3 class="text-xl font-semibold mt-6 mb-3 text-foreground">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold mt-8 mb-4 text-foreground">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold mt-10 mb-6 text-foreground">$1</h1>')
      
      // Text formatting
      .replace(/\*\*(.*?)\**/gim, '<strong class="font-semibold text-foreground">$1</strong>')
      .replace(/(?<!\*)\*([^*]+)\*(?!\*)/gim, '<em class="italic text-foreground">$1</em>')
      
      // Code
      .replace(/``````/gim, '<pre class="bg-muted rounded-lg p-4 overflow-x-auto my-4"><code class="text-sm font-mono">$1</code></pre>')
      .replace(/`([^`]+)`/gim, '<code class="bg-muted px-2 py-1 rounded text-sm font-mono">$1</code>')
      
      // Links and Images
      .replace(/!\[([^\]]*)\]\(([^)]+)\)/gim, '<img alt="$1" src="$2" class="rounded-lg my-4 max-w-full h-auto" />')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" class="text-primary hover:underline" target="_blank" rel="noopener noreferrer">$1</a>')
      
      // Blockquotes
      .replace(/^> (.+$)/gim, '<blockquote class="border-l-4 border-primary pl-4 italic my-4 text-muted-foreground">$1</blockquote>')
      
      // Lists
      .replace(/^\* (.+$)/gim, '<li class="ml-4 mb-1">$1</li>')
      .replace(/^- (.+$)/gim, '<li class="ml-4 mb-1">$1</li>')
      .replace(/^\d+\. (.+$)/gim, '<li class="ml-4 mb-1">$1</li>')
      
      // Convert newlines to break tags for remaining content
      .split('\n')
      .map(line => {
        if (line.trim() === '') return '<br>';
        if (line.match(/^<(h[1-6]|li|blockquote|pre)/)) return line;
        if (line.includes('<li')) return `<ul class="list-disc ml-6 my-2">${line}</ul>`;
        return `<p class="mb-4 leading-relaxed text-foreground">${line}</p>`;
      })
      .join('');

    // Clean up multiple breaks and wrap lists
    html = html
      .replace(/(<br>\s*){2,}/g, '<br>')
      .replace(/(<li[^>]*>.*?<\/li>\s*)+/g, '<ul class="list-disc ml-6 my-2">$&</ul>')
      .replace(/<ul[^>]*>\s*<ul[^>]*>/g, '<ul class="list-disc ml-6 my-2">')
      .replace(/<\/ul>\s*<\/ul>/g, '</ul>');

    return html;
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className={cn('border rounded-lg overflow-hidden bg-background', className)}>
      {/* Toolbar */}
      <div className="flex items-center justify-between p-3 border-b bg-muted/30">
        <div className="flex items-center gap-1 flex-wrap">
          {formatButtons.map((button) => {
            const Icon = button.icon;
            return (
              <Button
                key={button.label}
                variant="ghost"
                size="sm"
                type="button"
                onClick={button.action}
                title={button.label}
                className="h-8 w-8 p-0"
              >
                <Icon className="h-4 w-4" />
              </Button>
            );
          })}
        </div>
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setShowPreview(!showPreview)}
          className={cn('flex items-center gap-2', showPreview && 'bg-accent')}
        >
          <Eye className="h-4 w-4" />
          {showPreview ? 'Edit' : 'Preview'}
        </Button>
      </div>

      {/* Editor/Preview */}
      <div className="relative min-h-[300px]">
        {showPreview ? (
          <div
            className="p-6 prose prose-sm max-w-none min-h-[300px] bg-background overflow-auto"
            dangerouslySetInnerHTML={{ __html: renderPreview(value) }}
          />
        ) : (
          <textarea
            ref={textareaRef}
            value={value}
            onChange={handleTextareaChange}
            placeholder={placeholder}
            className="w-full h-full min-h-[300px] p-6 resize-none border-0 bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-0 font-mono text-sm leading-relaxed"
            style={{ fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Inconsolata, "Roboto Mono", monospace' }}
          />
        )}
      </div>
    </div>
  );
}
