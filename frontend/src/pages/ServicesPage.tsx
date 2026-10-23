import { ServiceCard } from '../components/ServiceCard';
import { services } from '../content/site';
import '../styles/expertise-premium-v1.css';

export function ServicesPage() {
  return (
    <div className="ds-expertise-page">
      <section className="ds-expertise-intro">
        <p className="ds-services-eyebrow">
          DARK SYNAPSES / CAPABILITIES
        </p>

        <h1>
          Building the Future.
          <span> Securing What Matters.</span>
        </h1>

        <p>
          We combine AI engineering and cybersecurity
          expertise to design intelligent, secure,
          and maintainable solutions.
        </p>
      </section>

      <section className="ds-services-v2">
        <div className="ds-services-container">
          <div className="ds-services-grid">
            {services.map((service, index) => (
              <ServiceCard
                key={service.id}
                service={service}
                index={index}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
