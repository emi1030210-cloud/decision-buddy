// The shell duck. Pure markup over the global .mascot classes — no hooks, no state —
// so the error and not-found pages can render it without pulling the whole app in
// behind it, which importing it from DecisionBuddy.tsx would do.
export function Mascot({
  mood = "happy",
}: {
  mood?: "happy" | "think" | "sus" | "caught" | "sleep";
}) {
  return (
    // The duck is decoration: whatever it is doing is always said in the text beside
    // it, so announcing it adds noise. It was also leaking an English identifier into
    // a Chinese interface — "鴨子夥伴：sleep" — and in the header it landed in front of
    // the wordmark, so that button announced as "鴨子夥伴：happy Decision Buddy".
    <div className={"mascot " + mood} aria-hidden="true">
      <b className="arm left" />
      <b className="arm right" />
      <i />
      <i />
      <span aria-hidden="true" />
    </div>
  );
}
