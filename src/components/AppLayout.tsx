import { Suspense, useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { CommandBar, useCommandBar } from './CommandBar';
import { Moon, Sun } from 'lucide-react';

const keyboardRoutes: Record<string, string> = {
  '1': '/',
  '2': '/projects',
  '3': '/notes',
  '4': '/bookmarks',
  '5': '/tasks',
  '6': '/graph',
  '7': '/uplink',
  ',': '/settings',
};

export function AppLayout() {
  const { open, setOpen } = useCommandBar();
  const navigate = useNavigate();
  const location = useLocation();
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    if (typeof window === 'undefined') return 'dark';
    return localStorage.getItem('myos-theme') === 'light' ? 'light' : 'dark';
  });

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.metaKey && !e.shiftKey && !e.altKey && !e.ctrlKey) {
        const route = keyboardRoutes[e.key];
        if (route) {
          e.preventDefault();
          navigate(route);
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('light', theme === 'light');
    root.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('myos-theme', theme);
  }, [theme]);

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      <Sidebar onCommandOpen={() => setOpen(true)} />
      
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="h-12 shrink-0 border-b border-border bg-[var(--black)] px-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="nd-label">Safety Intel Console</div>
            <div className="hidden md:flex items-center gap-2 font-mono text-[11px] text-[var(--text-secondary)]">
              <span className="h-2 w-2 rounded-full bg-[var(--text-display)] pulse-led" />
              <span>LOCAL PROTOTYPE</span>
              <span className="text-[var(--text-disabled)]">/</span>
              <span>NO LIVE COLLECTORS</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="inline-flex h-8 items-center gap-2 rounded-full border border-[var(--border-visible)] px-3 font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--text-primary)] transition-colors hover:border-[var(--text-display)]"
            aria-label="Toggle color mode"
          >
            {theme === 'dark' ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5" />}
            {theme}
          </button>
        </div>

        <div className="route-viewport relative flex-1 overflow-y-scroll overflow-x-hidden bg-background">
          <div className="absolute inset-0 dot-grid-subtle opacity-60 pointer-events-none" />
          <Suspense fallback={<RouteLoading />}>
            <div key={location.pathname} className="route-transition relative z-10 min-h-full">
              <Outlet />
            </div>
          </Suspense>
        </div>
      </main>

      <CommandBar open={open} onOpenChange={setOpen} />
    </div>
  );
}

function RouteLoading() {
  return (
    <div className="route-loading relative z-10 flex min-h-full items-center justify-center">
      <div className="nd-card dot-grid-subtle px-6 py-5">
        <div className="nd-label">Loading route</div>
        <div className="mt-4 grid grid-cols-8 gap-1">
          {Array.from({ length: 8 }).map((_, index) => (
            <span
              key={index}
              className="h-2 w-6 bg-[var(--text-display)] segment-fill"
              style={{ animationDelay: `${index * 40}ms`, opacity: index < 5 ? 1 : 0.18 }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
