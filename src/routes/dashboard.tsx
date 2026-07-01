import { createFileRoute } from "@tanstack/react-router";
import { logout, getCurrentUser, getClassrooms, getStudents, listPrizes, createPrize, deletePrize, redeemPrize } from "~/lib/server-fns";
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
  const [token, setToken] = useState<string | undefined>();
  const [classrooms, setClassrooms] = useState<any[]>([]);
  const [selectedClassroom, setSelectedClassroom] = useState<string>("");
  const [prizes, setPrizes] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [showCreatePrize, setShowCreatePrize] = useState(false);
  const [prizeForm, setPrizeForm] = useState({ name: "", description: "", pointCost: 10, quantity: 1 });
  const [redeemPrizeId, setRedeemPrizeId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const init = async () => {
      const t = getCookie("session_token");
      setToken(t);
      if (!t) { window.location.href = "/login"; return; }
      const result = await getCurrentUser({ data: { sessionToken: t } });
      if (!result.user) { window.location.href = "/login"; return; }
      setUser(result.user);
      const cr = await getClassrooms({ data: { sessionToken: t } });
      if (cr.classrooms?.length > 0) {
        setClassrooms(cr.classrooms);
        setSelectedClassroom(cr.classrooms[0].id);
      }
      setLoading(false);
    };
    init();
  }, []);

  useEffect(() => {
    if (!token || !selectedClassroom) return;
    (async () => {
      const [p, s] = await Promise.all([
        listPrizes({ data: { sessionToken: token, classroomId: selectedClassroom } }),
        getStudents({ data: { sessionToken: token, classroomId: selectedClassroom } }),
      ]);
      setPrizes(p.prizes || []);
      setStudents(s.students || []);
    })();
  }, [token, selectedClassroom]);

  const handleCreatePrize = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !selectedClassroom) return;
    const result = await createPrize({
      data: { ...prizeForm, sessionToken: token, classroomId: selectedClassroom },
    });
    if (result.prize) {
      setShowCreatePrize(false);
      setPrizeForm({ name: "", description: "", pointCost: 10, quantity: 1 });
      const p = await listPrizes({ data: { sessionToken: token, classroomId: selectedClassroom } });
      setPrizes(p.prizes || []);
    }
  };

  const handleDeletePrize = async (prizeId: string) => {
    if (!token) return;
    await deletePrize({ data: { sessionToken: token, prizeId } });
    const p = await listPrizes({ data: { sessionToken: token, classroomId: selectedClassroom } });
    setPrizes(p.prizes || []);
  };

  const handleRedeemPrize = async (studentId: string) => {
    if (!token || !redeemPrizeId) return;
    const result = await redeemPrize({ data: { sessionToken: token, prizeId: redeemPrizeId, studentId } });
    if (result.error) {
      setMessage(result.error);
    } else {
      setMessage("Prize redeemed!");
      setRedeemPrizeId(null);
      const [p, s] = await Promise.all([
        listPrizes({ data: { sessionToken: token, classroomId: selectedClassroom } }),
        getStudents({ data: { sessionToken: token, classroomId: selectedClassroom } }),
      ]);
      setPrizes(p.prizes || []);
      setStudents(s.students || []);
    }
    setTimeout(() => setMessage(""), 3000);
  };

  if (loading) return <div className="flex min-h-dvh items-center justify-center"><p className="text-gray-500">Loading...</p></div>;

  return (
    <div className="min-h-dvh bg-gray-50 dark:bg-gray-950">
      <header className="border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">CareConnect</h1>
          <nav className="flex items-center gap-4">
            <span className="text-sm text-gray-500 dark:text-gray-400">{user?.firstName} {user?.lastName}</span>
            <button onClick={async () => { await logout(); deleteCookie("session_token"); window.location.href = "/login"; }}
              className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100">Sign out</button>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {message && <div className="mb-4 rounded-md bg-green-50 p-3 text-sm text-green-700 dark:bg-green-950 dark:text-green-400">{message}</div>}

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Teacher Dashboard</h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Manage your classes, prize store, and students.</p>
        </div>

        {/* Classroom Selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Select Classroom</label>
          <select value={selectedClassroom} onChange={e => setSelectedClassroom(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100">
            {classrooms.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Prize Store Section */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Prize Store</h3>
              <button onClick={() => setShowCreatePrize(true)}
                className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-indigo-500">+ Add Prize</button>
            </div>

            {/* Create Prize Form */}
            {showCreatePrize && (
              <form onSubmit={handleCreatePrize} className="mb-4 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
                <div className="space-y-3">
                  <input placeholder="Prize name" value={prizeForm.name} onChange={e => setPrizeForm({...prizeForm, name: e.target.value})} required
                    className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100" />
                  <input placeholder="Description (optional)" value={prizeForm.description} onChange={e => setPrizeForm({...prizeForm, description: e.target.value})}
                    className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100" />
                  <div className="flex gap-3">
                    <input type="number" placeholder="Point cost" value={prizeForm.pointCost} onChange={e => setPrizeForm({...prizeForm, pointCost: +e.target.value})} required min={1}
                      className="block w-1/2 rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100" />
                    <input type="number" placeholder="Quantity" value={prizeForm.quantity} onChange={e => setPrizeForm({...prizeForm, quantity: +e.target.value})} required min={1}
                      className="block w-1/2 rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100" />
                  </div>
                  <div className="flex gap-2">
                    <button type="submit" className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500">Create</button>
                    <button type="button" onClick={() => setShowCreatePrize(false)}
                      className="rounded-md border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300">Cancel</button>
                  </div>
                </div>
              </form>
            )}

            {/* Prize List */}
            {prizes.length === 0 ? (
              <p className="text-center text-gray-400 dark:text-gray-500 text-sm py-8">No prizes yet. Create one to get started.</p>
            ) : (
              <div className="space-y-3">
                {prizes.map(prize => (
                  <div key={prize.id} className="flex items-center justify-between rounded-lg border border-gray-100 p-3 dark:border-gray-700">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">{prize.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{prize.pointCost} pts · Qty: {prize.quantity}</p>
                      {prize.description && <p className="text-xs text-gray-400">{prize.description}</p>}
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => { setRedeemPrizeId(prize.id); }} disabled={prize.quantity < 1}
                        className="rounded-md bg-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-500 disabled:opacity-50">Redeem</button>
                      <button onClick={() => handleDeletePrize(prize.id)}
                        className="rounded-md border border-red-300 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400">Remove</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Students Section */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Students</h3>
            {redeemPrizeId && (
              <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-800 dark:bg-green-950">
                <p className="text-sm font-medium text-green-700 dark:text-green-400">Select a student to redeem prize:</p>
                <button onClick={() => setRedeemPrizeId(null)} className="text-xs text-green-600 underline mt-1">Cancel</button>
              </div>
            )}
            {students.length === 0 ? (
              <p className="text-center text-gray-400 dark:text-gray-500 text-sm py-8">No students in this classroom.</p>
            ) : (
              <div className="space-y-3">
                {students.map(student => (
                  <div key={student.id} className="flex items-center justify-between rounded-lg border border-gray-100 p-3 dark:border-gray-700">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">{student.firstName} {student.lastName}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{student.points} points</p>
                    </div>
                    {redeemPrizeId && (
                      <button onClick={() => handleRedeemPrize(student.id)}
                        className="rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500">Redeem</button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}