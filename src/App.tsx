import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "./components/AppLayout";

// Lazy-load pages for code splitting
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Projects = lazy(() => import("./pages/Projects"));
const ProjectDetail = lazy(() => import("./pages/ProjectDetail"));
const NewProject = lazy(() => import("./pages/NewProject"));
const Notes = lazy(() => import("./pages/Notes"));
const NoteDetail = lazy(() => import("./pages/NoteDetail"));
const NewNote = lazy(() => import("./pages/NewNote"));
const Bookmarks = lazy(() => import("./pages/Bookmarks"));
const NewBookmark = lazy(() => import("./pages/NewBookmark"));
const Tasks = lazy(() => import("./pages/Tasks"));
const Graph = lazy(() => import("./pages/Graph"));
const Settings = lazy(() => import("./pages/Settings"));
const DailyNote = lazy(() => import("./pages/DailyNote"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Suspense fallback={null}>
          <Routes>
            <Route element={<AppLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/projects/new" element={<NewProject />} />
              <Route path="/projects/:id" element={<ProjectDetail />} />
              <Route path="/notes" element={<Notes />} />
              <Route path="/notes/daily" element={<DailyNote />} />
              <Route path="/notes/daily/:date" element={<DailyNote />} />
              <Route path="/notes/new" element={<NewNote />} />
              <Route path="/notes/:id" element={<NoteDetail />} />
              <Route path="/bookmarks" element={<Bookmarks />} />
              <Route path="/bookmarks/new" element={<NewBookmark />} />
              <Route path="/tasks" element={<Tasks />} />
              <Route path="/graph" element={<Graph />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
