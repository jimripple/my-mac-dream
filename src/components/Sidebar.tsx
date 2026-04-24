import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  Activity,
  Bookmark,
  CheckSquare,
  Command,
  FileText,
  FolderKanban,
  LayoutDashboard,
  Network,
  Radio,
  Settings,
} from 'lucide-react';

interface SidebarProps {
  onCommandOpen: () => void;
}

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Intel', description: 'Triage', shortcut: '1' },
  { path: '/projects', icon: FolderKanban, label: 'Cases', description: 'Projects', shortcut: '2' },
  { path: '/notes', icon: FileText, label: 'Notes', description: 'Logs', shortcut: '3' },
  { path: '/bookmarks', icon: Bookmark, label: 'Sources', description: 'Library', shortcut: '4' },
  { path: '/tasks', icon: CheckSquare, label: 'Actions', description: 'Tasks', shortcut: '5' },
  { path: '/graph', icon: Network, label: 'Graph', description: 'Links', shortcut: '6' },
  { path: '/uplink', icon: Radio, label: 'Uplink', description: 'Terminal', shortcut: '7' },
];

export function Sidebar({ onCommandOpen }: SidebarProps) {
  const location = useLocation();

  return (
    <aside className="hidden h-screen w-[224px] shrink-0 border-r border-border bg-[var(--black)] lg:flex lg:flex-col">
      <div className="px-5 py-6 border-b border-border">
        <div className="font-display text-[34px] leading-none tracking-[-0.03em] text-[var(--text-display)]">
          myOS
        </div>
        <div className="mt-2 nd-label">Church Safety OSINT</div>
      </div>

      <div className="p-3 border-b border-border">
        <button
          onClick={onCommandOpen}
          className="group flex h-11 w-full items-center gap-3 rounded-full border border-[var(--border-visible)] px-4 text-left font-mono text-[12px] uppercase tracking-[0.06em] text-[var(--text-secondary)] transition-colors hover:border-[var(--text-display)] hover:text-[var(--text-display)]"
        >
          <Command className="h-4 w-4" />
          <span>Command</span>
          <kbd className="ml-auto text-[10px] text-[var(--text-disabled)] group-hover:text-[var(--text-secondary)]">
            CMD K
          </kbd>
        </button>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path ||
            (item.path !== '/' && location.pathname.startsWith(item.path));

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                'group grid grid-cols-[20px_1fr_auto] items-center gap-3 rounded-lg px-3 py-3 transition-colors',
                isActive
                  ? 'bg-[var(--surface)] text-[var(--text-display)]'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--surface)] hover:text-[var(--text-primary)]'
              )}
            >
              <item.icon className="h-4 w-4" strokeWidth={1.5} />
              <span>
                <span className="block font-mono text-[12px] uppercase tracking-[0.08em]">
                  {item.label}
                </span>
                <span className="block font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--text-disabled)]">
                  {item.description}
                </span>
              </span>
              <span className="font-mono text-[10px] text-[var(--text-disabled)] opacity-0 transition-opacity group-hover:opacity-100">
                {item.shortcut}
              </span>
            </NavLink>
          );
        })}
      </nav>

      <div className="border-t border-border p-3">
        <NavLink
          to="/settings"
          className="group flex items-center gap-3 rounded-lg px-3 py-3 font-mono text-[12px] uppercase tracking-[0.08em] text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface)] hover:text-[var(--text-primary)]"
        >
          <Settings className="h-4 w-4" strokeWidth={1.5} />
          <span className="flex-1">Settings</span>
          <span className="text-[10px] text-[var(--text-disabled)]">,</span>
        </NavLink>
        <div className="mt-3 flex items-center gap-2 px-3 font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--text-disabled)]">
          <Activity className="h-3 w-3" strokeWidth={1.5} />
          <span>Manual / Sample Data</span>
        </div>
      </div>
    </aside>
  );
}
