import { Link } from "react-router-dom";

export function LandingPage() {
  return (
    <section className="auth-shell">
      <article className="card auth-card">
        <h1 className="page-title">JamiiFlow</h1>
        <p style={{ marginTop: "-0.4rem", color: "var(--color-muted)" }}>
          Welfare group management built for admins, treasurers, and members.
        </p>
        <div className="quick-actions-grid" style={{ marginTop: "0.8rem" }}>
          <Link className="quick-action-card" to="/login">
            <div className="quick-action-head">
              <span className="icon-chip">LG</span>
              <h3 className="quick-action-title">Login</h3>
            </div>
            <p className="quick-action-text">Access your member, admin, or super admin dashboard.</p>
          </Link>
          <Link className="quick-action-card" to="/signup">
            <div className="quick-action-head">
              <span className="icon-chip">SU</span>
              <h3 className="quick-action-title">Sign Up</h3>
            </div>
            <p className="quick-action-text">Join your welfare group and create your account.</p>
          </Link>
        </div>
      </article>
    </section>
  );
}
