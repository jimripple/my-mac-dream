import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { CommandBar, useCommandBar } from './CommandBar';

export function AppLayout() {
  const { open, setOpen } = useCommandBar();

  return (
    <div className="flex h-screen bg-background overflow-hidden crt-screen screen-flicker">
      <Sidebar onCommandOpen={() => setOpen(true)} />
      
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="relative min-h-full noise-overlay">
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
