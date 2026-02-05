import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  FolderKanban,
  FileText,
  Bookmark,
  CheckSquare,
  Network,
  Brain,
  Command,
  Settings,
} from 'lucide-react';

interface SidebarProps {
  onCommandOpen: () => void;
}

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard', description: 'Mission Control', shortcut: '1' },
  { path: '/projects', icon: FolderKanban, label: 'Projects', description: 'Hubs', shortcut: '2' },
  { path: '/notes', icon: FileText, label: 'Notes', description: 'Knowledge', shortcut: '3' },
  { path: '/bookmarks', icon: Bookmark, label: 'Bookmarks', description: 'Library', shortcut: '4' },
  { path: '/tasks', icon: CheckSquare, label: 'Tasks', description: 'Tracker', shortcut: '5' },
  { path: '/graph', icon: Network, label: 'Graph', description: 'Big Picture', shortcut: '6' },
  { path: '/uplink', icon: Brain, label: 'Uplink', description: 'Neural Link', shortcut: '7' },
];

export function Sidebar({ onCommandOpen }: SidebarProps) {
  const location = useLocation();

  return (
    <aside className="w-64 h-screen bg-sidebar border-r border-sidebar-border flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <h1 className="text-xl font-bold font-display text-foreground tracking-tight">
          <span className="text-primary glow-text">my</span>OS
        </h1>
        <p className="text-xs text-muted-foreground mt-1 font-mono">
          Personal Command Center
        </p>
      </div>

      {/* Command Bar Trigger */}
      <button
        onClick={onCommandOpen}
        className="mx-4 mt-4 flex items-center gap-2 px-3 py-2 bg-sidebar-accent border border-sidebar-border text-sm text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors font-mono"
      >
        <Command className="h-4 w-4" />
        <span>Quick Search</span>
        <kbd className="ml-auto text-xs bg-background px-1.5 py-0.5 border border-border">
          ⌘K
        </kbd>
      </button>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || 
            (item.path !== '/' && location.pathname.startsWith(item.path));
          
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 text-sm font-mono transition-all group",
                isActive
                  ? "bg-primary/10 text-primary border-l-2 border-primary glow-border"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-foreground border-l-2 border-transparent"
              )}
            >
              <item.icon className={cn(
                "h-4 w-4 transition-colors",
                isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
              )} />
              <div className="flex flex-col flex-1">
                <span>{item.label}</span>
                <span className={cn(
                  "text-[10px] uppercase tracking-wider",
                  isActive ? "text-primary/70" : "text-muted-foreground"
                )}>
                  {item.description}
                </span>
              </div>
              <kbd className={cn(
                "text-[10px] font-mono px-1.5 py-0.5 border opacity-0 group-hover:opacity-100 transition-opacity",
                isActive
                  ? "border-primary/30 text-primary/60"
                  : "border-border text-muted-foreground"
              )}>
                ⌘{item.shortcut}
              </kbd>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border">
        <NavLink
          to="/settings"
          className="flex items-center gap-3 px-3 py-2 text-sm font-mono text-muted-foreground hover:text-foreground transition-colors group"
        >
          <Settings className="h-4 w-4" />
          <span className="flex-1">Settings</span>
          <kbd className="text-[10px] font-mono px-1.5 py-0.5 border border-border text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
            ⌘,
          </kbd>
        </NavLink>
        <div className="mt-3 px-3 text-[10px] text-muted-foreground font-mono">
          <span className="text-primary">●</span> System Online
        </div>
      </div>
    </aside>
  );
}
