import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { listSignupGroups, register } from "../../features/auth/api";

const signUpSchema = z
  .object({
    groupId: z.string().min(1, "Please select a group."),
    firstName: z.string().min(2, "First name is required."),
    lastName: z.string().min(2, "Last name is required."),
    email: z.email("Enter a valid email address."),
    phone: z.string().optional(),
    password: z.string().min(8, "Password must have at least 8 characters."),
    confirmPassword: z.string().min(8, "Confirm your password."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match.",
  });

type SignUpFormValues = z.infer<typeof signUpSchema>;

export function SignUpPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const groupsQuery = useQuery({
    queryKey: ["signup-groups"],
    queryFn: listSignupGroups,
  });

  const {
    register: formRegister,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      groupId: "",
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    },
  });

  const signUpMutation = useMutation({
    mutationFn: register,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
      navigate("/app/dashboard", { replace: true });
    },
  });

  const onSubmit = (values: SignUpFormValues) => {
    signUpMutation.mutate({
      groupId: values.groupId,
      firstName: values.firstName,
      lastName: values.lastName,
      email: values.email,
      phone: values.phone || undefined,
      password: values.password,
    });
  };

  return (
    <section className="card form-card">
      <h1 className="page-title">Create Member Account</h1>
      <p style={{ marginTop: "-0.4rem", color: "var(--color-muted)" }}>
        Join your welfare group and start tracking contributions.
      </p>
      <form onSubmit={handleSubmit(onSubmit)} className="form-grid">
        <label>
          Group
          <select {...formRegister("groupId")}>
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
          First Name
          <input {...formRegister("firstName")} />
          {errors.firstName ? <small className="text-danger">{errors.firstName.message}</small> : null}
        </label>
        <label>
          Last Name
          <input {...formRegister("lastName")} />
          {errors.lastName ? <small className="text-danger">{errors.lastName.message}</small> : null}
        </label>
        <label>
          Email
          <input type="email" {...formRegister("email")} />
          {errors.email ? <small className="text-danger">{errors.email.message}</small> : null}
        </label>
        <label>
          Phone
          <input {...formRegister("phone")} />
        </label>
        <label>
          Password
          <input type="password" {...formRegister("password")} />
          {errors.password ? <small className="text-danger">{errors.password.message}</small> : null}
        </label>
        <label>
          Confirm Password
          <input type="password" {...formRegister("confirmPassword")} />
          {errors.confirmPassword ? (
            <small className="text-danger">{errors.confirmPassword.message}</small>
          ) : null}
        </label>
        <button type="submit" className="button-primary" disabled={signUpMutation.isPending}>
          {signUpMutation.isPending ? "Creating account..." : "Sign Up"}
        </button>
        {signUpMutation.isError ? (
          <small className="text-danger">
            Signup failed. Check details or use a different email.
          </small>
        ) : null}
      </form>
    </section>
  );
}
