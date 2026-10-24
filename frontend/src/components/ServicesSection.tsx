import { UiIcon } from './UiIcons';

import { Link } from 'react-router-dom';
import { ServiceCard } from './ServiceCard';
import { services } from '../content/site';

export function ServicesSection() {
  return (
    <section
      className="ds-services-v2 ds-home-premium-services"
      id="services"
    >
      <div className="ds-services-container">
        <div className="ds-services-heading">
          <div>
            <h2>
              Intelligence meets
              <span> protection.</span>
            </h2>
          </div>

          <div className="ds-services-heading-right">
            <p>
              From AI-powered software solutions to cybersecurity
              and digital forensics, we engineer secure,
              scalable technology that helps businesses
              move forward with confidence.
            </p>

            <Link to="/services">
              Explore all expertise <UiIcon name="arrow" />
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
