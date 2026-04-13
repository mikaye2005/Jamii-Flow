import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { useLocation, useNavigate } from "react-router-dom";
import { z } from "zod";
import { login } from "../../features/auth/api";

const loginSchema = z.object({
  email: z.email("Enter a valid email address."),
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
      email: "",
      password: "",
    },
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
    loginMutation.mutate(values);
  };

  return (
    <section className="card form-card">
      <h1 className="page-title">Welcome to JamiiFlow</h1>
      <p style={{ marginTop: "-0.4rem", color: "var(--color-muted)" }}>
        Manage your welfare groups efficiently.
      </p>
      <form onSubmit={handleSubmit(onSubmit)} className="form-grid">
        <label>
          Email
          <input type="email" {...register("email")} />
          {errors.email ? <small className="text-danger">{errors.email.message}</small> : null}
        </label>
        <label>
          Password
          <input type="password" {...register("password")} />
          {errors.password ? (
            <small className="text-danger">{errors.password.message}</small>
          ) : null}
        </label>
        <button type="submit" className="button-primary" disabled={loginMutation.isPending}>
          {loginMutation.isPending ? "Signing in..." : "Log In"}
        </button>
        {loginMutation.isError ? (
          <small className="text-danger">Login failed. Check your email and password.</small>
        ) : null}
        <small style={{ color: "var(--color-muted)" }}>
          New member? <Link to="/signup">Create an account</Link>
        </small>
      </form>
    </section>
  );
}
