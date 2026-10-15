import Link from "next/link";
import { Mascot } from "@/components/Mascot";

// Without this, an unknown path gets Next's built-in 404: a bare white page reading
// "This page could not be found." in English, on an app that is otherwise entirely in
// Chinese, with no way back to it. The app only has one route, so anyone landing here
// followed something stale.
export default function NotFound() {
  return (
    <section className="flow">
      <div className="empty">
        <Mascot mood="sus" />
        <h2>這頁不存在。</h2>
        <p>我找過了，真的沒有。這大概是個過期的連結。</p>
        <Link className="primary" href="/">
          回去決定點什麼
        </Link>
      </div>
    </section>
  );
}
