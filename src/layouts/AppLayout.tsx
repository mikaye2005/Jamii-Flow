import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { logout } from "../features/auth/api";
import { listMyNotifications } from "../features/reminders/api";
import { useAuth } from "../features/auth/useAuth";
import { hasMinimumRole } from "../lib/permissions";

const navItems = [
  { to: "/app/dashboard", label: "Dashboard", icon: "DB" },
  { to: "/app/super-admin", label: "Super Admin", icon: "SA" },
  { to: "/app/my-portal", label: "My Portal", icon: "ME" },
  { to: "/app/notifications", label: "Notifications", icon: "NT" },
  { to: "/app/profile", label: "Profile", icon: "PR" },
  { to: "/app/groups", label: "Groups", icon: "GR" },
  { to: "/app/members", label: "Members", icon: "MB" },
  { to: "/app/contributions", label: "Contributions", icon: "CT" },
  { to: "/app/payments", label: "Payments", icon: "PY" },
  { to: "/app/receipts", label: "Receipts", icon: "RC" },
  { to: "/app/operations", label: "Operations", icon: "OP" },
  { to: "/app/reports", label: "Reports", icon: "RP" },
];

export function AppLayout() {
  const location = useLocation();
  const queryClient = useQueryClient();
  const authQuery = useAuth();
  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
    },
  });

  const user = authQuery.data?.user;
  const notificationsQuery = useQuery({
    queryKey: ["notifications", "me"],
    queryFn: listMyNotifications,
    enabled: Boolean(user),
    refetchInterval: 30000,
  });
  const unreadNotifications = (notificationsQuery.data?.notifications ?? []).filter(
    (notification) => notification.status === "UNREAD",
  ).length;
  const isPublicRoute =
    location.pathname === "/" || location.pathname === "/login" || location.pathname === "/signup";

  if (isPublicRoute) {
    return (
      <main className="content-area">
        <Outlet />
      </main>
    );
  }

  const filteredNavItems = navItems.filter((item) => {
    if (!user) {
      return false;
    }
    if (user.globalRole === "SUPER_ADMIN") {
      return true;
    }

    if (item.to === "/app/groups" || item.to === "/app/members" || item.to === "/app/operations") {
      return user.memberships.some((membership) => hasMinimumRole(membership.role, "GROUP_ADMIN"));
    }

    if (item.to === "/app/super-admin") {
      return false;
    }

    if (item.to === "/app/payments" || item.to === "/app/receipts") {
      return user.memberships.some((membership) => hasMinimumRole(membership.role, "TREASURER"));
    }

    if (item.to === "/app/reports") {
      return user.memberships.some((membership) => hasMinimumRole(membership.role, "GROUP_ADMIN"));
    }

    return true;
  });

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link to="/" className="brand">
          <span className="brand__title">JamiiFlow</span>
          <span className="brand__subtitle">Community Welfare Suite</span>
        </Link>
        <nav className="side-nav">
          {filteredNavItems.map((item) => (
            <NavLink
              key={`${item.to}-${item.label}`}
              to={item.to}
              className={({ isActive }) => `side-nav__item${isActive ? " active" : ""}`}
            >
              <span className="side-nav__icon">{item.icon}</span>
              <span>{item.label}</span>
              {item.to === "/app/notifications" && unreadNotifications > 0 ? (
                <span className="side-nav__badge">{unreadNotifications}</span>
              ) : null}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="content-area">
        <div className="top-bar">
          <div className="top-bar__welcome">
            <strong>
              {user ? `${user.firstName} ${user.lastName}` : "Welcome"}
            </strong>
            <span>{user?.globalRole === "SUPER_ADMIN" ? "Super Admin" : "Group Workspace"}</span>
          </div>
          <button
            type="button"
            className="button-primary"
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
          >
            {logoutMutation.isPending ? "Signing out..." : "Logout"}
          </button>
        </div>
        <Outlet />
      </main>
      <nav className="mobile-nav">
        {filteredNavItems.slice(0, 5).map((item) => (
          <NavLink
            key={`mobile-${item.to}`}
            to={item.to}
            className={({ isActive }) => `mobile-nav__item${isActive ? " active" : ""}`}
          >
            <span className="mobile-nav__icon">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
