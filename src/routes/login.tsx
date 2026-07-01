import { createFileRoute } from "@tanstack/react-router";
import { login } from "~/lib/server-fns";

function setCookie(name: string, value: string, days: number) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

function deleteCookie(name: string) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax`;
}

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-gray-50 px-4 dark:bg-gray-950">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            CareConnect
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Sign in to your account
          </p>
        </div>

        <form
          className="space-y-6"
          onSubmit={async (e) => {
            e.preventDefault();
            const form = e.currentTarget;
            const formData = new FormData(form);

            try {
              const result = await login({
                data: {
                  email: formData.get("email") as string,
                  password: formData.get("password") as string,
                },
              });

              if (result.user && "sessionToken" in result) {
                setCookie("session_token", result.sessionToken as string, 7);
                const role = result.user.role;
                if (role === "teacher" || role === "admin") {
                  window.location.href = "/dashboard";
                } else if (role === "parent") {
                  window.location.href = "/parent";
                }
              } else {
                const errorEl = document.getElementById("login-error");
                if (errorEl) {
                  errorEl.textContent = (result as any).error || "Login failed";
                  errorEl.classList.remove("hidden");
                }
              }
            } catch (err) {
              const errorEl = document.getElementById("login-error");
              if (errorEl) {
                errorEl.textContent = "An error occurred. Please try again.";
                errorEl.classList.remove("hidden");
              }
            }
          }}
        >
          <div id="login-error" className="hidden rounded-md bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950 dark:text-red-400" />

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 sm:text-sm"
            />
          </div>

          <button
            type="submit"
            className="flex w-full justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Sign in
          </button>

          <p className="text-center text-sm text-gray-600 dark:text-gray-400">
            Don&apos;t have an account?{" "}
            <a href="/signup" className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">
              Sign up
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}