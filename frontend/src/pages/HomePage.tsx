import { Link } from 'react-router-dom';
import { deliverySteps, services } from '../content/site';

export function HomePage() {
  return <>
    <section className="hero">
      <div className="hero-copy"><p className="eyebrow">AI Engineering / Cybersecurity</p>
        <h1>Intelligence.<br /><span>Engineered securely.</span></h1>
        <p className="intro">We build intelligent systems and help businesses understand and manage their security risks.</p>
        <Link className="button" to="/expertise">Explore our expertise <span aria-hidden="true">↗</span></Link>
        <p className="tagline">Where Intelligence Meets Threats.</p>
      </div>
    </section>
    <section className="section light"><div className="section-heading"><p className="eyebrow">What we help you solve</p><h2>Complex challenges.<br /><span>Clear next steps.</span></h2></div>
      <div className="service-list">{services.map((service, index) => <Link to={`/expertise#${service.id}`} className="service-row" key={service.id}><span className="number">0{index + 1}</span><h3>{service.title}</h3><span aria-hidden="true">↗</span></Link>)}</div>
    </section>
    <section className="section" id="approach"><p className="eyebrow">Our approach</p><h2>Clear scope. Visible progress.</h2><div className="steps">{deliverySteps.map((step, index) => <article key={step.title}><span className="number">0{index + 1}</span><h3>{step.title}</h3><p>{step.description}</p></article>)}</div></section>
  </>;
}
