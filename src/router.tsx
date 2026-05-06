import { lazy, Suspense } from "react";
import { MainLayout } from "./components/layout/MainLayout";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { GlobalLoader } from "./components/common/GlobalLoader";
import NotFound from "./pages/NotFound";

// Lazy loaded pages
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Tasks = lazy(() => import("./pages/Tasks"));
const CalendarView = lazy(() => import("./pages/CalendarView"));
const Categories = lazy(() => import("./pages/Categories"));
const Settings = lazy(() => import("./pages/Settings"));
const LandingPage = lazy(() => import("./pages/LandingPage"));
const AuthPage = lazy(() => import("./pages/AuthPage"));
const VerifyEmail = lazy(() => import("./pages/VerifyEmail"));

// Helper to wrap lazy components in Suspense
const withSuspense = (Component: React.ComponentType) => (
  <Suspense fallback={<GlobalLoader />}>
    <Component />
  </Suspense>
);

export const routers = [
  {
    path: "/welcome",
    name: "welcome",
    element: withSuspense(LandingPage),
  },
  {
    path: "/auth",
    name: "auth",
    element: withSuspense(AuthPage),
  },
  {
    path: "/verify-email",
    name: "verify-email",
    element: withSuspense(VerifyEmail),
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        name: "dashboard",
        element: withSuspense(Dashboard),
      },
      {
        path: "tasks",
        name: "tasks",
        element: withSuspense(Tasks),
      },
      {
        path: "calendar",
        name: "calendar",
        element: withSuspense(CalendarView),
      },
      {
        path: "categories",
        name: "categories",
        element: withSuspense(Categories),
      },
      {
        path: "settings",
        name: "settings",
        element: withSuspense(Settings),
      },
    ],
  },
  /* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */
  {
    path: "*",
    name: "404",
    element: <NotFound />,
  },
];

declare global {
  interface Window {
    __routers__: typeof routers;
  }
}

window.__routers__ = routers;
