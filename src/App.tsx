import { APP_NAME, APP_TAGLINE } from './constants';

const primaryCta = 'Fill Your Post-Death Family Continuity Binder';

export function App() {
  return (
    <div className="site-shell">
      <header className="site-header">
        <a className="wordmark" href="/" aria-label={APP_NAME}><span>{APP_NAME}</span><small>Local-first</small></a>
        <nav aria-label="Primary navigation"><a href="#privacy">Privacy</a><a href="#how-it-works">How it works</a></nav>
      </header>
      <main>
        <section className="hero" aria-labelledby="hero-title">
          <p className="eyebrow">A private family continuity record</p>
          <h1 id="hero-title">Prepare the information your family will need when you cannot provide it.</h1>
          <p className="hero-copy">Continuity Binder guides you through the people, accounts, documents, obligations, property, wishes, and instructions a surviving spouse, partner, executor, or trusted family member may need after a death.</p>
          <p className="trust-statement">Your binder is created in your browser. What you enter is encrypted on this device and is not sent to us.</p>
          <a className="button button-primary" href="/binder">{primaryCta}</a>
          <p className="free-note">Free as in beer. No account. No subscription. No catch.</p>
          <p className="quiet-note">You can print the finished binder, save it as a PDF, export human-readable files, or create an encrypted backup.</p>
        </section>
        <section className="trust-strip" id="privacy" aria-label="Privacy commitments">
          <article><h2>Local by design</h2><p>Binder data stays in this browser unless you explicitly export it.</p></article>
          <article><h2>Encrypted at rest</h2><p>Saved binder records are encrypted before they are written to local browser storage.</p></article>
          <article><h2>No tracking</h2><p>No analytics, advertising pixels, session replay, or third-party trackers.</p></article>
        </section>
        <section className="how-it-works" id="how-it-works" aria-labelledby="how-title">
          <p className="eyebrow">A durable record, built carefully</p><h2 id="how-title">How it works</h2>
          <div className="steps">
            <article><span>01</span><h3>Enter the facts once</h3><p>People, addresses, phone numbers, accounts, and contacts become reusable records.</p></article>
            <article><span>02</span><h3>Build the binder</h3><p>Complete each section at your own pace. Your progress is saved locally.</p></article>
            <article><span>03</span><h3>Take it with you</h3><p>Print it, save a PDF, export readable files, or create an encrypted backup.</p></article>
          </div>
        </section>
        <section className="security-clarification" aria-labelledby="clarification-title">
          <h2 id="clarification-title">Local-first does not mean magic.</h2>
          <p>The application itself is downloaded from this website. The information you enter into your binder is not transmitted by the application. As with any browser-based software, a compromised device, browser, extension, or unlocked session can expose information. Keep your device secure and store exported or printed copies carefully.</p>
        </section>
      </main>
      <footer className="site-footer">
        <div><strong>{APP_NAME}</strong><p>Free software for household continuity.</p></div>
        <nav aria-label="Footer navigation"><a href="#privacy">Privacy</a><a href="#privacy">Security</a><a href="#privacy">Terms / Disclaimer</a><a href="#privacy">Source Code</a></nav>
        <small>{APP_TAGLINE}</small>
      </footer>
    </div>
  );
}
