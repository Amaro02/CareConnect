import { createFileRoute, redirect } from "@tanstack/react-router";
import { logout, getCurrentUser } from "~/lib/server-fns";
import { useState, useEffect } from "react";

function getCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? decodeURIComponent(match[2]) : undefined;
}

function deleteCookie(name: string) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax`;
}

export const Route = createFileRoute("/dashboard")({
  component: TeacherDashboard,
});

function TeacherDashboard() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = getCookie("session_token");
      if (!token) {
        window.location.href = "/login";
        return;
      }
      const result = await getCurrentUser({ data: { sessionToken: token } });
      if (!result.user) {
        window.location.href = "/login";
        return;
      }
      setUser(result.user);
      setLoading(false);
    };
    checkAuth();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-gray-50 dark:bg-gray-950">
      <header className="border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            CareConnect
          </h1>
          <nav className="flex items-center gap-4">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {user?.firstName} {user?.lastName}
            </span>
            <a href="/dashboard" className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
              Dashboard
            </a>
            <button
              onClick={async () => {
                await logout();
                deleteCookie("session_token");
                window.location.href = "/login";
              }}
              className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
            >
              Sign out
            </button>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Teacher Dashboard
          </h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Manage your classes, award points, and send daily reports.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              My Classrooms
            </h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              View and manage your classrooms, students, and daily activities.
            </p>
            <div className="mt-4">
              <p className="text-center text-gray-400 dark:text-gray-500 text-sm py-8">
                No classrooms yet. Create one to get started.
              </p>
              <button className="w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500">
                Create Classroom
              </button>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Points & Rewards
            </h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Award points to students and manage the prize store.
            </p>
            <div className="mt-4">
              <p className="text-center text-gray-400 dark:text-gray-500 text-sm py-8">
                Select a classroom to award points.
              </p>
              <button className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700">
                Award Points
              </button>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Daily Reports
            </h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Write and send daily reports to parents with photos.
            </p>
            <div className="mt-4">
              <p className="text-center text-gray-400 dark:text-gray-500 text-sm py-8">
                No reports this week.
              </p>
              <button className="w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500">
                New Report
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}