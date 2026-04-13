import { isRouteErrorResponse, useRouteError } from "react-router-dom";

export function ErrorPage() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    return (
      <section>
        <h1>Request failed</h1>
        <p>
          {error.status} - {error.statusText}
        </p>
      </section>
    );
  }

  return (
    <section>
      <h1>Unexpected error</h1>
      <p>Please refresh and try again.</p>
    </section>
  );
}
