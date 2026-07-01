import { createFileRoute } from "@tanstack/react-router";
import { logout, getCurrentUser, getChildReports, getMessages, sendMessage } from "~/lib/server-fns";
import { useState, useEffect } from "react";

function getCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? decodeURIComponent(match[2]) : undefined;
}

function deleteCookie(name: string) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax`;
}

export const Route = createFileRoute("/parent")({
  component: ParentPortal,
});

function ParentPortal() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | undefined>();
  const [reports, setReports] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [showMsgForm, setShowMsgForm] = useState(false);
  const [msgBody, setMsgBody] = useState("");
  const [selectedReport, setSelectedReport] = useState<any>(null);

  useEffect(() => {
    const init = async () => {
      const t = getCookie("session_token");
      setToken(t);
      if (!t) { window.location.href = "/login"; return; }
      const result = await getCurrentUser({ data: { sessionToken: t } });
      if (!result.user) { window.location.href = "/login"; return; }
      setUser(result.user);
      
      const [reportData, msgData] = await Promise.all([
        getChildReports({ data: { sessionToken: t } }),
        getMessages({ data: { sessionToken: t } }),
      ]);
      setReports(reportData.reports || []);
      setStudents(reportData.students || []);
      setMessages(msgData.messages || []);
      setLoading(false);
    };
    init();
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !msgBody.trim()) return;
    // Find teacher from first report's classroom
    await sendMessage({ data: { sessionToken: token, recipientId: "", body: msgBody } });
    setMsgBody("");
    setShowMsgForm(false);
    const msgData = await getMessages({ data: { sessionToken: token } });
    setMessages(msgData.messages || []);
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
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Parent Portal</h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            {students.length > 0
              ? `View updates for ${students.map(s => s.firstName).join(", ")}`
              : "Stay connected with your child's day at school."}
          </p>
        </div>

        {/* Photo Gallery Section */}
        <div className="mb-8">
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Daily Reports & Photos
            </h3>
            
            {selectedReport ? (
              <div>
                <button onClick={() => setSelectedReport(null)} className="text-sm text-indigo-600 hover:text-indigo-500 mb-4">
                  &larr; Back to reports
                </button>
                <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(selectedReport.date).toLocaleDateString()} · {selectedReport.classroomName}
                  </p>
                  <p className="mt-2 text-gray-900 dark:text-gray-100">{selectedReport.summary}</p>
                  {selectedReport.photos?.length > 0 && (
                    <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {selectedReport.photos.map((photo: any) => (
                        <div key={photo.id} className="rounded-lg border border-gray-200 overflow-hidden dark:border-gray-700">
                          <div className="aspect-square bg-gray-100 flex items-center justify-center dark:bg-gray-800">
                            <span className="text-4xl">📷</span>
                          </div>
                          {photo.caption && <p className="p-2 text-xs text-gray-500">{photo.caption}</p>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : reports.length === 0 ? (
              <p className="text-center text-gray-400 dark:text-gray-500 text-sm py-8">
                No reports yet. Check back after your child's school day.
              </p>
            ) : (
              <div className="space-y-4">
                {reports.map(report => (
                  <div key={report.id} 
                    onClick={() => setSelectedReport(report)}
                    className="cursor-pointer rounded-lg border border-gray-200 p-4 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          {report.classroomName} — {new Date(report.date).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{report.mood}</p>
                      </div>
                      <div className="flex gap-1">
                        {report.photos?.slice(0, 3).map((p: any) => (
                          <div key={p.id} className="h-10 w-10 rounded bg-gray-100 flex items-center justify-center dark:bg-gray-800">
                            <span className="text-lg">📷</span>
                          </div>
                        ))}
                        {report.photos?.length > 3 && (
                          <div className="h-10 w-10 rounded bg-gray-100 flex items-center justify-center text-xs text-gray-500 dark:bg-gray-800">
                            +{report.photos.length - 3}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Messages Section */}
        <div>
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Messages</h3>
              <button onClick={() => setShowMsgForm(!showMsgForm)}
                className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-indigo-500">
                {showMsgForm ? "Cancel" : "New Message"}
              </button>
            </div>

            {showMsgForm && (
              <form onSubmit={handleSendMessage} className="mb-4 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
                <textarea value={msgBody} onChange={e => setMsgBody(e.target.value)} required
                  placeholder="Type your message to the teacher..."
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                  rows={3} />
                <p className="text-xs text-gray-400 mt-1 mb-2">Your message will be sent to your child's teacher.</p>
                <button type="submit" className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500">Send</button>
              </form>
            )}

            {messages.length === 0 ? (
              <p className="text-center text-gray-400 dark:text-gray-500 text-sm py-8">
                No messages yet. Send a message to your child's teacher.
              </p>
            ) : (
              <div className="space-y-3">
                {messages.map(msg => (
                  <div key={msg.id} className={`rounded-lg border p-3 ${msg.senderId === user?.id ? 'border-indigo-200 bg-indigo-50 dark:border-indigo-800 dark:bg-indigo-950' : 'border-gray-200 dark:border-gray-700'}`}>
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {msg.senderId === user?.id ? "You" : msg.senderName}
                      </p>
                      <p className="text-xs text-gray-400">{new Date(msg.createdAt).toLocaleDateString()}</p>
                    </div>
                    {msg.subject && <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mt-1">{msg.subject}</p>}
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{msg.body}</p>
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