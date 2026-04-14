import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";
import { z } from "zod";
import { listSignupGroups, login } from "../../features/auth/api";

const loginSchema = z
  .object({
    mode: z.enum(["member", "admin"]),
    email: z.string().optional(),
    groupId: z.string().optional(),
    facilityCode: z.string().optional(),
    username: z.string().optional(),
    password: z.string().min(8, "Password must have at least 8 characters."),
  })
  .superRefine((value, ctx) => {
    if (value.mode === "admin") {
      if (!value.email || !z.email().safeParse(value.email).success) {
        ctx.addIssue({
          code: "custom",
          path: ["email"],
          message: "Enter a valid admin email.",
        });
      }
      return;
    }
    if (!value.groupId) {
      ctx.addIssue({ code: "custom", path: ["groupId"], message: "Select your welfare group." });
    }
    if (!value.facilityCode || value.facilityCode.length < 2) {
      ctx.addIssue({ code: "custom", path: ["facilityCode"], message: "Facility code is required." });
    }
    if (!value.username || value.username.length < 2) {
      ctx.addIssue({ code: "custom", path: ["username"], message: "Username is required." });
    }
  });

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      mode: "member",
      email: "",
      groupId: "",
      facilityCode: "",
      username: "",
      password: "",
    },
  });
  const mode = watch("mode");
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
    if (values.mode === "admin") {
      loginMutation.mutate({
        email: values.email?.trim(),
        password: values.password,
      });
      return;
    }
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
          <h2 className="section-title">Welfare Access</h2>
          <p className="section-subtext">
            Members sign in with facility credentials. Super Admin and facility admins use email and password.
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
              Login Type
              <select {...register("mode")}>
                <option value="member">Member Login</option>
                <option value="admin">Super Admin / Facility Admin</option>
              </select>
            </label>
            {mode === "admin" ? (
              <label>
                Admin Email
                <input type="email" {...register("email")} aria-invalid={errors.email ? "true" : "false"} />
                {errors.email ? <small className="text-danger">{errors.email.message}</small> : null}
              </label>
            ) : (
              <>
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
              </>
            )}
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
                Login failed. Check your details and try again.
              </small>
            ) : null}
            <small style={{ color: "var(--color-muted)" }}>
              Member accounts are created by facility admins. Super Admin creates facility admin accounts.
            </small>
          </form>
        </article>
      </div>
    </section>
  );
}
