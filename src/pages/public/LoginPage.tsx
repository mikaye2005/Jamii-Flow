import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { useLocation, useNavigate } from "react-router-dom";
import { z } from "zod";
import { listSignupGroups, login } from "../../features/auth/api";

const loginSchema = z.object({
  groupId: z.string().min(1, "Select your welfare group."),
  facilityCode: z.string().min(2, "Facility code is required."),
  username: z.string().min(2, "Username is required."),
  password: z.string().min(8, "Password must have at least 8 characters."),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      groupId: "",
      facilityCode: "",
      username: "",
      password: "",
    },
  });
  const groupsQuery = useQuery({
    queryKey: ["login-groups"],
    queryFn: listSignupGroups,
  });

  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
      const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname;
      navigate(from ?? "/app/dashboard", { replace: true });
    },
  });

  const onSubmit = (values: LoginFormValues) => {
    loginMutation.mutate({
      groupId: values.groupId,
      facilityCode: values.facilityCode,
      username: values.username,
      password: values.password,
    });
  };

  return (
    <section className="auth-shell">
      <div className="auth-layout">
        <article className="card auth-info-panel">
          <h2 className="section-title">Member Welfare Access</h2>
          <p className="section-subtext">
            Sign in to see your KES contributions, pending arrears, receipts, and admin updates.
          </p>
          <div className="auth-feature-list">
            <div className="auth-feature-item">
              <span className="icon-chip">KES</span>
              <div>
                <strong>KES-Only Statements</strong>
                <p>All balances and payments are shown in Kenya shillings.</p>
              </div>
            </div>
            <div className="auth-feature-item">
              <span className="icon-chip">AR</span>
              <div>
                <strong>Arrears Alerts</strong>
                <p>Get updates for late payments and pending items.</p>
              </div>
            </div>
            <div className="auth-feature-item">
              <span className="icon-chip">NT</span>
              <div>
                <strong>Admin Notifications</strong>
                <p>Receive welfare notices and group messages in one place.</p>
              </div>
            </div>
          </div>
        </article>

        <article className="card form-card auth-card">
          <h1 className="page-title">Welcome to JamiiFlow</h1>
          <p style={{ marginTop: "-0.4rem", color: "var(--color-muted)" }}>
            Member login portal
          </p>
          <form onSubmit={handleSubmit(onSubmit)} className="form-grid">
            <label>
              Welfare Group
              <select {...register("groupId")} aria-invalid={errors.groupId ? "true" : "false"}>
                <option value="">Select group</option>
                {(groupsQuery.data?.groups ?? []).map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
              </select>
              {errors.groupId ? <small className="text-danger">{errors.groupId.message}</small> : null}
            </label>
            <label>
              Facility Code
              <input {...register("facilityCode")} aria-invalid={errors.facilityCode ? "true" : "false"} />
              {errors.facilityCode ? <small className="text-danger">{errors.facilityCode.message}</small> : null}
            </label>
            <label>
              Username
              <input {...register("username")} aria-invalid={errors.username ? "true" : "false"} />
              {errors.username ? <small className="text-danger">{errors.username.message}</small> : null}
            </label>
            <label>
              Password
              <input type="password" {...register("password")} aria-invalid={errors.password ? "true" : "false"} />
              {errors.password ? (
                <small className="text-danger">{errors.password.message}</small>
              ) : null}
            </label>
            <button type="submit" className="button-primary" disabled={loginMutation.isPending}>
              {loginMutation.isPending ? "Signing in..." : "Log In"}
            </button>
            {loginMutation.isError ? (
              <small className="text-danger">
                Login failed. Check group, facility code, username, and password.
              </small>
            ) : null}
            <small style={{ color: "var(--color-muted)" }}>
              New member? <Link to="/signup">Create an account</Link> | Admin can use email login API if needed.
            </small>
          </form>
        </article>
      </div>
    </section>
  );
}
