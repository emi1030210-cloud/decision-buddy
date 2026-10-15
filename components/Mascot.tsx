// The shell duck. Pure markup over the global .mascot classes — no hooks, no state —
// so the error and not-found pages can render it without pulling the whole app in
// behind it, which importing it from DecisionBuddy.tsx would do.
export function Mascot({
  mood = "happy",
}: {
  mood?: "happy" | "think" | "sus" | "caught" | "sleep";
}) {
  return (
    <div className={"mascot " + mood} aria-label={`鴨子夥伴：${mood}`}>
      <b className="arm left" />
      <b className="arm right" />
      <i />
      <i />
      <span aria-hidden="true" />
    </div>
  );
}
