import { Link } from 'react-router-dom';
import { ServiceCard } from './ServiceCard';
import { services } from '../content/site';

export function ServicesSection() {
  return (
    <section className="ds-services-v2" id="services">
      <div className="ds-services-container">
        <div className="ds-services-heading">
          <div>
            <p className="ds-services-eyebrow">
              OUR EXPERTISE / 01—04
            </p>

            <h2>
              Intelligence meets
              <span> protection.</span>
            </h2>
          </div>

          <div className="ds-services-heading-right">
            <p>
              From intelligent software to secure digital
              infrastructure, we engineer solutions that
              help businesses move forward with confidence.
            </p>

            <Link to="/expertise">
              Explore all expertise ↗
            </Link>
          </div>
        </div>

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
  );
}
