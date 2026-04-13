import { createBrowserRouter } from "react-router-dom";
import { AppLayout } from "../layouts/AppLayout";
import { LandingPage } from "../pages/public/LandingPage";
import { LoginPage } from "../pages/public/LoginPage";
import { SignUpPage } from "../pages/public/SignUpPage";
import { DashboardPage } from "../pages/system/DashboardPage";
import { ContributionsPage } from "../pages/system/ContributionsPage";
import { ErrorPage } from "../pages/system/ErrorPage";
import { GroupsPage } from "../pages/system/GroupsPage";
import { MembersPage } from "../pages/system/MembersPage";
import { NotFoundPage } from "../pages/system/NotFoundPage";
import { OperationsPage } from "../pages/system/OperationsPage";
import { PaymentsPage } from "../pages/system/PaymentsPage";
import { ReceiptsPage } from "../pages/system/ReceiptsPage";
import { ReportsPage } from "../pages/system/ReportsPage";
import { ProtectedRoute } from "./ProtectedRoute";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: "login", element: <LoginPage /> },
      { path: "signup", element: <SignUpPage /> },
      {
        path: "app",
        element: <ProtectedRoute />,
        children: [
          { path: "dashboard", element: <DashboardPage /> },
          { path: "groups", element: <GroupsPage /> },
          { path: "members", element: <MembersPage /> },
          { path: "contributions", element: <ContributionsPage /> },
          { path: "payments", element: <PaymentsPage /> },
          { path: "receipts", element: <ReceiptsPage /> },
          { path: "operations", element: <OperationsPage /> },
          { path: "reports", element: <ReportsPage /> },
        ],
      },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);
