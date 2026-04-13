import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, NavLink, Outlet } from "react-router-dom";
import { logout } from "../features/auth/api";

const navItems = [
  { to: "/app/dashboard", label: "Dashboard" },
  { to: "/app/groups", label: "Groups" },
  { to: "/app/members", label: "Members" },
];

export function AppLayout() {
  const queryClient = useQueryClient();
  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
    },
  });

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link to="/" className="brand">
          JamiiFlow
        </Link>
        <nav className="side-nav">
          {navItems.map((item) => (
            <NavLink
              key={`${item.to}-${item.label}`}
              to={item.to}
              className={({ isActive }) => `side-nav__item${isActive ? " active" : ""}`}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="content-area">
        <div className="top-bar" style={{ display: "flex", justifyContent: "flex-end", padding: "0.4rem" }}>
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
    </div>
  );
}
