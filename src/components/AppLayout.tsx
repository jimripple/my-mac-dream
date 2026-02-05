import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { CommandBar, useCommandBar } from './CommandBar';

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

  return (
    <div className="flex h-screen bg-background overflow-hidden crt-screen screen-flicker">
      <Sidebar onCommandOpen={() => setOpen(true)} />
      
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="relative flex-1 noise-overlay overflow-auto">
          {/* Subtle grid background */}
          <div className="absolute inset-0 grid-bg opacity-50 pointer-events-none" />

          {/* Main content */}
          <div className="relative z-10">
            <Outlet />
          </div>
        </div>
      </main>

      <CommandBar open={open} onOpenChange={setOpen} />
    </div>
  );
}
