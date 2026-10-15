"use client";

import { useEffect } from "react";
import { Mascot } from "@/components/Mascot";
import { KEY } from "@/lib/history";

// The net under everything. Several specific crashes have been fixed one at a time —
// unreadable history entries, a mode that matched no screen — and each one, before it
// was fixed, showed Next's bare "Application error: a client-side exception has
// occurred" on a blank page: English, no way back, and nothing left of the app.
//
// reset() re-renders the tree without a reload, which is enough when the failure was
// transient. It is not enough when the cause is still sitting in localStorage, so there
// is a second way out that clears the saved history. That one is destructive, so it says
// exactly what it deletes rather than offering a vague "reset".
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Production stacks are minified; the digest is what ties this to a server-side log.
    console.error("Decision Buddy:", error.digest ?? error.message, error);
  }, [error]);

  return (
    <section className="flow">
      <div className="empty">
        <Mascot mood="caught" />
        <h2>這次換鴨子卡住了。</h2>
        <p>不是你的問題。再試一次通常就好了。</p>
        <div className="actions">
          <button className="primary" onClick={reset}>
            再試一次
          </button>
          <button
            className="secondary"
            onClick={() => {
              try {
                localStorage.removeItem(KEY);
              } catch {}
              location.href = "/";
            }}
          >
            清掉紀錄重來
          </button>
        </div>
      </div>
    </section>
  );
}
