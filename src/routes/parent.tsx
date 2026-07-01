import { createFileRoute } from "@tanstack/react-router";
import { logout } from "~/lib/server-fns";

export const Route = createFileRoute("/parent")({
  component: ParentPortal,
});

function ParentPortal() {
  return (
    <div className="min-h-dvh bg-gray-50 dark:bg-gray-950">
      <header className="border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            CareConnect
          </h1>
          <nav className="flex items-center gap-4">
            <a href="/parent" className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
              My Child
            </a>
            <button
              onClick={async () => {
                await logout();
                localStorage.removeItem("session_token");
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
            Parent Portal
          </h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Stay connected with your child's day at school.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {/* Daily Reports Card */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Daily Reports
            </h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              View reports from your child's teacher, including photos and daily notes.
            </p>
            <div className="mt-4">
              <p className="text-center text-gray-400 dark:text-gray-500 text-sm py-8">
                No reports yet. Check back after your child's school day.
              </p>
            </div>
          </div>

          {/* Points & Achievements Card */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Points & Achievements
            </h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              See your child's points, rewards, and classroom achievements.
            </p>
            <div className="mt-4">
              <p className="text-center text-gray-400 dark:text-gray-500 text-sm py-8">
                Points will appear here once your child starts earning them.
              </p>
            </div>
          </div>
        </div>

        {/* Messages Section */}
        <div className="mt-8">
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Messages
            </h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Communicate with your child's teacher.
            </p>
            <div className="mt-4">
              <p className="text-center text-gray-400 dark:text-gray-500 text-sm py-8">
                No messages yet. Your teacher can send you messages here.
              </p>
              <button className="w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500">
                Message Teacher
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
