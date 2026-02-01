import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { CommandBar, useCommandBar } from './CommandBar';

export function AppLayout() {
  const { open, setOpen } = useCommandBar();

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar onCommandOpen={() => setOpen(true)} />
      
      <main className="flex-1 overflow-auto">
        <div className="relative min-h-full">
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
