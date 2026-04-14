type MemberWelcomeEmailPayload = {
  toEmail: string;
  firstName: string;
  groupName: string;
  groupCode: string;
  temporaryPassword: string;
  roleLabel: string;
  landingUrl: string;
};

function envVar(env: Env, key: string): string {
  const value = (env as unknown as Record<string, unknown>)[key];
  return typeof value === "string" ? value : "";
}

export async function sendMemberWelcomeEmail(env: Env, payload: MemberWelcomeEmailPayload): Promise<boolean> {
  const apiKey = envVar(env, "RESEND_API_KEY");
  const from = envVar(env, "EMAIL_FROM") || "onboarding@jamiiflow.app";
  if (!apiKey) {
    return false;
  }

  const subject = `Welcome to ${payload.groupName} on JamiiFlow`;
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.55; color: #0f172a;">
      <h2>Welcome, ${payload.firstName}</h2>
      <p>Your ${payload.roleLabel} profile has been created for <strong>${payload.groupName}</strong>.</p>
      <p>Use the details below to access JamiiFlow:</p>
      <ul>
        <li><strong>Email / Username:</strong> ${payload.toEmail}</li>
        <li><strong>Facility Code:</strong> ${payload.groupCode}</li>
        <li><strong>Temporary Password:</strong> ${payload.temporaryPassword}</li>
      </ul>
      <p>
        Open the landing page here:
        <a href="${payload.landingUrl}">${payload.landingUrl}</a>
      </p>
      <p>Please log in and change your password as soon as possible.</p>
    </div>
  `;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [payload.toEmail],
      subject,
      html,
    }),
  });

  return response.ok;
}
