export function AboutPage() {
  return (
    <section className="section expertise">
      <p className="eyebrow">About Dark Synapses</p>
      <h1>
        Intelligence with purpose.
        <br />
        <span>Security by design.</span>
      </h1>

      <p className="intro">
        Dark Synapses brings together AI engineering and cybersecurity
        to help organizations build intelligent, reliable, and secure
        digital systems.
      </p>

      <div className="steps about-values">
        <article>
          <span className="number">01</span>
          <h3>Engineering Excellence</h3>
          <p>We prioritize reliable architectures, maintainable systems,
          and thoughtful technical execution.</p>
        </article>

        <article>
          <span className="number">02</span>
          <h3>Security First</h3>
          <p>Security is considered throughout the design,
          development, and deployment lifecycle.</p>
        </article>

        <article>
          <span className="number">03</span>
          <h3>Practical Innovation</h3>
          <p>We focus on solutions that address real business
          challenges and create measurable value.</p>
        </article>
      </div>
    </section>
  );
}
