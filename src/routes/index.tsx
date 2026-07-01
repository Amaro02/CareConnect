import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { readFile } from "node:fs/promises";

const getBusinessName = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const cfg = JSON.parse(await readFile("site.json", "utf8")) as {
      businessName?: string;
    };
    return cfg.businessName?.trim() ?? "CareConnect";
  } catch {
    return "CareConnect";
  }
});

export const Route = createFileRoute("/")({
  loader: () => getBusinessName(),
  component: Home,
});

function Home() {
  const businessName = Route.useLoaderData();
  return (
    <div className="min-h-dvh bg-white dark:bg-gray-950">
      {/* Navigation */}
      <header className="border-b border-gray-100 dark:border-gray-800">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="text-xl font-bold text-gray-900 dark:text-gray-100">
            {businessName}
          </div>
          <div className="flex items-center gap-4">
            <a
              href="/login"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
            >
              Sign in
            </a>
            <a
              href="/signup"
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
            >
              Get started
            </a>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-32">
        <div className="text-center">
          <span className="inline-block rounded-full bg-indigo-100 px-3 py-1 text-sm font-medium text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
            For early childhood & school-age programs
          </span>
          <h1 className="mx-auto mt-6 max-w-4xl text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl dark:text-gray-100">
            Classroom engagement and parent communication, made simple
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600 dark:text-gray-400">
            Teachers award points, manage a prize store, and send daily reports with
            photos. Parents see how their child's day went, celebrate wins, and stay
            connected — all in real time.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <a
              href="/signup"
              className="rounded-md bg-indigo-600 px-8 py-3 text-base font-semibold text-white shadow-sm hover:bg-indigo-500"
            >
              Start free trial
            </a>
            <a
              href="/login"
              className="rounded-md border border-gray-300 bg-white px-8 py-3 text-base font-semibold text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Sign in
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-t border-gray-100 bg-gray-50 py-20 dark:border-gray-800 dark:bg-gray-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Everything you need in one place
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
              Built for teachers, loved by parents.
            </p>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-950">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-950">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
                Points & Rewards
              </h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Award points to students for achievements and behavior. Let them
                redeem prizes from the classroom store.
              </p>
            </div>

            <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-950">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-950">
                <span className="text-2xl">📋</span>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
                Daily Reports
              </h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Send detailed daily reports to parents with photos, notes on
                meals, naps, activities, and more.
              </p>
            </div>

            <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-950">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-950">
                <span className="text-2xl">💬</span>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
                Parent Communication
              </h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Parents stay connected with real-time updates, messaging with
                teachers, and a view into their child's day.
              </p>
            </div>

            <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-950">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-950">
                <span className="text-2xl">📸</span>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
                Photo Sharing
              </h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Share photos from the classroom directly in daily reports.
                Parents love seeing their child in action.
              </p>
            </div>

            <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-950">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-950">
                <span className="text-2xl">🏫</span>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
                Multi-Site Management
              </h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Manage multiple classrooms and facilities from one dashboard.
                Perfect for daycare centers and school districts.
              </p>
            </div>

            <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-950">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-950">
                <span className="text-2xl">🔒</span>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
                Secure & Private
              </h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Role-based access ensures teachers, parents, and admins see only
                what they should. Your data stays safe.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Simple, transparent pricing
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
              Start with a free trial. Scale as you grow.
            </p>
          </div>

          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            <div className="rounded-lg border border-gray-200 bg-white p-8 dark:border-gray-800 dark:bg-gray-900">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Trial
              </h3>
              <p className="mt-4 text-4xl font-bold text-gray-900 dark:text-gray-100">
                Free
              </p>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Per classroom
              </p>
              <ul className="mt-6 space-y-3 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-center gap-2">✓ Up to 20 students</li>
                <li className="flex items-center gap-2">✓ Daily reports</li>
                <li className="flex items-center gap-2">✓ Points & rewards</li>
                <li className="flex items-center gap-2">✓ Photo sharing</li>
              </ul>
              <a
                href="/signup"
                className="mt-8 block w-full rounded-md bg-indigo-600 px-4 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
              >
                Start free trial
              </a>
            </div>

            <div className="rounded-lg border-2 border-indigo-500 bg-white p-8 shadow-lg dark:bg-gray-900">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Facility
              </h3>
              <p className="mt-4 text-4xl font-bold text-gray-900 dark:text-gray-100">
                $99
              </p>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Per month per site
              </p>
              <ul className="mt-6 space-y-3 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-center gap-2">✓ Unlimited classrooms</li>
                <li className="flex items-center gap-2">✓ Up to 200 students</li>
                <li className="flex items-center gap-2">✓ All features</li>
                <li className="flex items-center gap-2">✓ Priority support</li>
              </ul>
              <a
                href="/signup"
                className="mt-8 block w-full rounded-md bg-indigo-600 px-4 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
              >
                Get started
              </a>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-8 dark:border-gray-800 dark:bg-gray-900">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                District
              </h3>
              <p className="mt-4 text-4xl font-bold text-gray-900 dark:text-gray-100">
                Custom
              </p>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Annual pricing
              </p>
              <ul className="mt-6 space-y-3 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-center gap-2">✓ Multiple sites</li>
                <li className="flex items-center gap-2">✓ Custom branding</li>
                <li className="flex items-center gap-2">✓ Dedicated support</li>
                <li className="flex items-center gap-2">✓ API access</li>
              </ul>
              <a
                href="/signup"
                className="mt-8 block w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-center text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Contact us
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 dark:border-gray-800">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-gray-400 dark:text-gray-600 sm:px-6">
          <p>&copy; {new Date().getFullYear()} {businessName}. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
