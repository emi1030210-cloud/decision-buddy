// `next dev` and `next build` both write .next. Running a build while the dev server is
// up overwrites what it is serving, and it dies with "Cannot find module './833.js'" —
// a confusing error a long way from its cause. The README has warned about this for a
// while, which did not stop it happening three times in one afternoon.
//
// npm runs this before `build`. It only looks: if nothing is listening, it says nothing.
//
// This sits in front of every deploy, so it fails open. A build must never be blocked by
// a bug in the check itself — only by actually finding a dev server. Everything below
// the import is inside the try for that reason, not just the part that can throw: the
// first version computed the port outside it, which would have turned a typo there into
// a failed deploy.
import { createConnection } from "node:net";

const listening = (port) =>
  new Promise((resolve) => {
    const socket = createConnection({ port, host: "127.0.0.1" });
    const done = (answer) => {
      socket.destroy();
      resolve(answer);
    };
    socket.setTimeout(400);
    socket.once("connect", () => done(true));
    socket.once("timeout", () => done(false));
    socket.once("error", () => done(false));
  });

try {
  const port = Number(process.env.PORT) || 3000;
  // CI 沒有人在跑 dev server，別多花那 400 毫秒
  const skip = process.env.CI || process.env.VERCEL;
  if (!skip && (await listening(port))) {
    process.stderr.write(
      `\n  連接埠 ${port} 上有東西在跑，很可能是 next dev。\n\n` +
        `  建置會覆寫掉它正在服務的 .next，dev server 會找不到自己的 chunk。\n` +
        `  先把它停掉再建置，或用 PORT=xxxx npm run build 指定別的埠來檢查。\n\n`,
    );
    process.exit(1);
  }
} catch {
  // 檢查本身壞掉不該擋住建置
}
