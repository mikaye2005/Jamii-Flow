import { Link } from "react-router-dom";

export function SignUpPage() {
  return (
    <section className="card form-card auth-card">
      <h1 className="page-title">Member Onboarding</h1>
      <p style={{ marginTop: "-0.4rem", color: "var(--color-muted)" }}>
        Member self-signup is disabled. Your facility admin must create your profile first.
      </p>
      <div className="form-grid">
        <p>
          Ask your facility admin to register your profile with your email, phone, address, and gender details.
        </p>
        <p>
          After creation, you will receive a confirmation email with your login details and a link to the landing page.
        </p>
        <Link to="/login" className="button-primary">
          Back to Login
        </Link>
      </div>
    </section>
  );
}
