import { createBrowserRouter } from "react-router-dom";
import { AppLayout } from "../layouts/AppLayout";
import { LandingPage } from "../pages/public/LandingPage";
import { LoginPage } from "../pages/public/LoginPage";
import { DashboardPage } from "../pages/system/DashboardPage";
import { ErrorPage } from "../pages/system/ErrorPage";
import { GroupsPage } from "../pages/system/GroupsPage";
import { MembersPage } from "../pages/system/MembersPage";
import { NotFoundPage } from "../pages/system/NotFoundPage";
import { ProtectedRoute } from "./ProtectedRoute";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: "login", element: <LoginPage /> },
      {
        path: "app",
        element: <ProtectedRoute />,
        children: [
          { path: "dashboard", element: <DashboardPage /> },
          { path: "groups", element: <GroupsPage /> },
          { path: "members", element: <MembersPage /> },
        ],
      },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);
