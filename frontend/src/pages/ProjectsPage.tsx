import '../styles/projects-page.css';

export function ProjectsPage() {
  return (
    <main className="ds-projects-page">
      <section className="ds-projects-hero">
        <p className="ds-projects-eyebrow">
          DARK SYNAPSES / SELECTED WORK
        </p>

        <h1>
          Ideas engineered.
          <span> Solutions delivered.</span>
        </h1>

        <p className="ds-projects-description">
          Explore the technology, engineering, and security
          work behind Dark Synapses. Our portfolio will
          showcase selected projects, their challenges,
          technical approaches, and outcomes.
        </p>
      </section>

      <section className="ds-projects-content">
        <div className="ds-projects-empty">
          <span className="ds-projects-empty-label">
            OUR PORTFOLIO
          </span>

          <h2>Selected projects coming soon.</h2>

          <p>
            We're preparing a closer look at our work
            across AI engineering, cybersecurity,
            and intelligent security systems.
          </p>
        </div>
      </section>
    </main>
  );
}
