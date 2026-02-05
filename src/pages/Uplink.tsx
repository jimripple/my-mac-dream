import { useState, useEffect, useRef, useCallback } from 'react';
import { useProjects, useNotes, useBookmarks, useTasks, useActivities } from '@/hooks/useStore';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

// Types
interface TerminalMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

// Boot sequence lines
const BOOT_LINES = [
  'myOS v0.1.0 — INITIALIZING',
  'Loading core modules.............. OK',
  'Mounting project index............. OK',
  'Scanning active workspaces......... OK',
  'Neural uplink...................... ESTABLISHED',
  '———————————————————————————————————',
  'UPLINK ONLINE. Ready for input.',
];

const BOOT_SESSION_KEY = 'uplink-booted';

export default function Uplink() {
  const [messages, setMessages] = useState<TerminalMessage[]>([]);
  const [input, setInput] = useState('');
  const [isBooting, setIsBooting] = useState(false);
  const [bootComplete, setBootComplete] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);

  // Conversation history for API context (session-only)
  const conversationHistory = useRef<Array<{ role: 'user' | 'assistant'; content: string }>>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Store hooks
  const { projects } = useProjects();
  const { notes } = useNotes();
  const { bookmarks } = useBookmarks();
  const { tasks } = useTasks();
  const { activities } = useActivities();

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Boot sequence — plays once per session
  useEffect(() => {
    const hasBooted = sessionStorage.getItem(BOOT_SESSION_KEY);
    if (hasBooted) {
      setBootComplete(true);
      setMessages([{
        id: 'boot-resume',
        role: 'system',
        content: 'UPLINK ONLINE. Ready for input.',
        timestamp: new Date(),
      }]);
      setTimeout(() => inputRef.current?.focus(), 100);
      return;
    }

    setIsBooting(true);
    let currentLine = 0;
    let cancelled = false;

    const addLine = () => {
      if (cancelled) return;
      if (currentLine < BOOT_LINES.length) {
        const line = BOOT_LINES[currentLine];
        setMessages(prev => [...prev, {
          id: `boot-${currentLine}`,
          role: 'system',
          content: line,
          timestamp: new Date(),
        }]);
        currentLine++;
        setTimeout(addLine, 200 + Math.random() * 300);
      } else {
        setIsBooting(false);
        setBootComplete(true);
        sessionStorage.setItem(BOOT_SESSION_KEY, 'true');
        setTimeout(() => inputRef.current?.focus(), 100);
      }
    };

    setTimeout(addLine, 500);

    return () => { cancelled = true; };
  }, []);

  // Build system prompt with live context
  const buildSystemPrompt = useCallback(() => {
    const activeProjects = projects.filter(p => p.status === 'active');
    const pendingTasks = tasks.filter(t => t.status !== 'done');

    return `You are myOS Uplink — a ship's computer and system process embedded in a personal command center application. You are NOT a chatbot. You are a terminal system process.

Communication style:
- Concise, terminal-style responses
- No fluff, no filler, no pleasantries
- No emojis ever
- Use uppercase for system-level emphasis sparingly
- Use dashes and pipes for formatting when helpful
- Think like a ship's computer: direct, precise, functional

Current system context:
- Active projects (${activeProjects.length}): ${activeProjects.map(p => p.name).join(', ') || 'None'}
- Total notes: ${notes.length}
- Total bookmarks: ${bookmarks.length}
- Pending tasks (${pendingTasks.length}): ${pendingTasks.slice(0, 10).map(t => `"${t.title}" [${t.priority}]`).join(', ') || 'None'}
- Total tasks: ${tasks.length} (${tasks.filter(t => t.status === 'done').length} complete)

You have knowledge of the user's workspace data above. When asked about projects, tasks, or system status, reference this real data. Keep responses focused and under 200 words unless the user asks for detail.`;
  }, [projects, notes, bookmarks, tasks]);

  // Handle slash commands (client-side, no API call)
  const handleSlashCommand = useCallback((command: string): boolean => {
    const cmd = command.trim().split(/\s+/)[0].toLowerCase();

    switch (cmd) {
      case '/clear':
        setMessages([{
          id: `clear-${Date.now()}`,
          role: 'system',
          content: 'Terminal cleared.',
          timestamp: new Date(),
        }]);
        conversationHistory.current = [];
        return true;

      case '/status': {
        const activeProjects = projects.filter(p => p.status === 'active');
        const completedTasks = tasks.filter(t => t.status === 'done');
        const status = [
          'SYSTEM STATUS',
          String.fromCharCode(9552).repeat(35),
          `Projects:  ${projects.length} total | ${activeProjects.length} active`,
          `Tasks:     ${tasks.length} total | ${completedTasks.length} complete`,
          `Notes:     ${notes.length}`,
          `Bookmarks: ${bookmarks.length}`,
          String.fromCharCode(9552).repeat(35),
          'ALL SYSTEMS OPERATIONAL',
        ].join('\n');

        setMessages(prev => [...prev, {
          id: `status-${Date.now()}`,
          role: 'system',
          content: status,
          timestamp: new Date(),
        }]);
        return true;
      }

      case '/projects': {
        const activeProjects = projects.filter(p => p.status === 'active');
        if (activeProjects.length === 0) {
          setMessages(prev => [...prev, {
            id: `projects-${Date.now()}`,
            role: 'system',
            content: 'No active projects found.',
            timestamp: new Date(),
          }]);
          return true;
        }

        const projectList = [
          'ACTIVE PROJECTS',
          String.fromCharCode(9552).repeat(35),
          ...activeProjects.map(p => {
            const projectTasks = tasks.filter(t => t.projectId === p.id);
            const done = projectTasks.filter(t => t.status === 'done').length;
            return `[${p.status.toUpperCase()}] ${p.name} — ${done}/${projectTasks.length} tasks`;
          }),
          String.fromCharCode(9552).repeat(35),
        ].join('\n');

        setMessages(prev => [...prev, {
          id: `projects-${Date.now()}`,
          role: 'system',
          content: projectList,
          timestamp: new Date(),
        }]);
        return true;
      }

      case '/help': {
        const help = [
          'AVAILABLE COMMANDS',
          String.fromCharCode(9552).repeat(35),
          '/clear      Clear terminal',
          '/status     System status',
          '/projects   List active projects',
          '/history    Recent activity',
          '/help       Show this help',
          String.fromCharCode(9552).repeat(35),
          'Type any message to talk to Uplink.',
        ].join('\n');

        setMessages(prev => [...prev, {
          id: `help-${Date.now()}`,
          role: 'system',
          content: help,
          timestamp: new Date(),
        }]);
        return true;
      }

      case '/history': {
        if (activities.length === 0) {
          setMessages(prev => [...prev, {
            id: `history-${Date.now()}`,
            role: 'system',
            content: 'No recent activity.',
            timestamp: new Date(),
          }]);
          return true;
        }

        const historyLines = [
          'RECENT ACTIVITY',
          String.fromCharCode(9552).repeat(35),
          ...activities.slice(0, 10).map(a =>
            `[${formatDistanceToNow(new Date(a.timestamp), { addSuffix: true })}] ${a.title}`
          ),
          String.fromCharCode(9552).repeat(35),
        ].join('\n');

        setMessages(prev => [...prev, {
          id: `history-${Date.now()}`,
          role: 'system',
          content: historyLines,
          timestamp: new Date(),
        }]);
        return true;
      }

      default:
        if (command.startsWith('/')) {
          setMessages(prev => [...prev, {
            id: `error-${Date.now()}`,
            role: 'system',
            content: `UNKNOWN COMMAND: ${cmd}\nType /help for available commands.`,
            timestamp: new Date(),
          }]);
          return true;
        }
        return false;
    }
  }, [projects, notes, bookmarks, tasks, activities]);

  // Send message to Anthropic API with streaming
  const sendMessage = useCallback(async (userMessage: string) => {
    const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
    if (!apiKey) {
      setMessages(prev => [...prev, {
        id: `error-${Date.now()}`,
        role: 'system',
        content: 'SYSTEM ERROR: API key not configured.\nSet VITE_ANTHROPIC_API_KEY in .env.local',
        timestamp: new Date(),
      }]);
      return;
    }

    conversationHistory.current.push({ role: 'user', content: userMessage });

    const responseId = `response-${Date.now()}`;
    setMessages(prev => [...prev, {
      id: responseId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
    }]);

    setIsStreaming(true);

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1024,
          stream: true,
          system: buildSystemPrompt(),
          messages: conversationHistory.current,
        }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`${response.status} — ${errorBody.slice(0, 200)}`);
      }

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let fullText = '';
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);
              if (parsed.type === 'content_block_delta' && parsed.delta?.type === 'text_delta') {
                fullText += parsed.delta.text;
                setMessages(prev => prev.map(m =>
                  m.id === responseId ? { ...m, content: fullText } : m
                ));
              }
            } catch {
              // Skip unparseable SSE data lines
            }
          }
        }
      }

      conversationHistory.current.push({ role: 'assistant', content: fullText });

    } catch (error: any) {
      const errorMsg = error?.message || 'Unknown error';
      setMessages(prev => prev.map(m =>
        m.id === responseId
          ? { ...m, content: `SYSTEM ERROR: ${errorMsg}`, role: 'system' as const }
          : m
      ));
      // Remove the failed exchange from history
      conversationHistory.current.pop();
    } finally {
      setIsStreaming(false);
    }
  }, [buildSystemPrompt]);

  // Handle form submit
  const handleSubmit = useCallback((e?: React.FormEvent) => {
    e?.preventDefault();

    const trimmed = input.trim();
    if (!trimmed || isStreaming || isBooting) return;

    // Add user message to display
    setMessages(prev => [...prev, {
      id: `user-${Date.now()}`,
      role: 'user',
      content: trimmed,
      timestamp: new Date(),
    }]);

    setInput('');

    // Slash commands are handled client-side
    if (trimmed.startsWith('/')) {
      handleSlashCommand(trimmed);
      return;
    }

    // Otherwise send to AI
    sendMessage(trimmed);
  }, [input, isStreaming, isBooting, handleSlashCommand, sendMessage]);

  return (
    <div className="h-full flex flex-col p-6">
      {/* Header */}
      <header className="flex-shrink-0 mb-4">
        <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono mb-1">
          <span className={cn(
            "text-primary",
            bootComplete && "animate-pulse-glow"
          )}>
            {bootComplete ? '\u25CF' : '\u25CB'}
          </span>
          <span>{bootComplete ? 'NEURAL LINK ACTIVE' : 'INITIALIZING...'}</span>
        </div>
        <h1 className="text-2xl font-bold font-display">
          <span className="text-primary glow-text">Uplink</span> Console
        </h1>
      </header>

      {/* Terminal Area */}
      <div className="flex-1 flex flex-col bg-card border border-border relative corner-brackets overflow-hidden min-h-0">
        <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-primary" />
        <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-primary" />

        {/* Scanline overlay */}
        <div
          className="absolute inset-0 pointer-events-none z-20"
          style={{
            background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, hsl(var(--background) / 0.03) 2px, hsl(var(--background) / 0.03) 4px)',
          }}
        />

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-1 font-mono text-sm">
            {messages.map((msg) => (
              <div key={msg.id}>
                {/* Timestamp */}
                <span className="text-[10px] text-muted-foreground/40 mr-2 select-none">
                  {msg.timestamp.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>

                {/* Content */}
                <span className={cn(
                  "whitespace-pre-wrap",
                  msg.role === 'user' && "text-primary",
                  msg.role === 'system' && "text-terminal-green",
                  msg.role === 'assistant' && "text-foreground",
                )}>
                  {msg.role === 'user' && <span className="text-primary/60">&gt; </span>}
                  {msg.content}
                  {msg.role === 'assistant' && isStreaming && messages[messages.length - 1]?.id === msg.id && (
                    <span className="animate-pulse text-primary ml-0.5">{'\u2588'}</span>
                  )}
                </span>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input */}
        <form
          onSubmit={handleSubmit}
          className="flex-shrink-0 border-t border-border px-4 py-3 flex items-center gap-2 bg-background/50"
        >
          <span className="text-primary font-mono text-sm select-none">&gt;</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={!bootComplete || isStreaming}
            placeholder={
              isBooting ? 'Initializing...'
                : isStreaming ? 'Processing...'
                : 'Type a message or /help for commands...'
            }
            className="flex-1 bg-transparent border-none outline-none font-mono text-sm text-foreground placeholder:text-muted-foreground/40 disabled:opacity-50"
            autoFocus
          />
          {isStreaming && (
            <span className="text-[10px] text-primary animate-pulse font-mono tracking-wider select-none">
              PROCESSING
            </span>
          )}
        </form>
      </div>
    </div>
  );
}
