import { Link } from 'react-router-dom';
import { services } from '../content/site';

type Service = (typeof services)[number];

function ServiceIcon({ type }: { type: Service['icon'] }) {
  const paths: Record<Service['icon'], React.ReactNode> = {
    ai: (
      <>
        <rect x="5" y="5" width="14" height="14" rx="3" />
        <path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3" />
        <path d="M9 15V9l6 6V9" />
      </>
    ),
    shield: (
      <>
        <path d="M12 2 20 6v6c0 5-3.5 8-8 10-4.5-2-8-5-8-10V6z" />
        <path d="m9 12 2 2 4-4" />
      </>
    ),
    brain: (
      <>
        <path d="M12 5a4 4 0 0 0-7 2 4 4 0 0 0-1 7 4 4 0 0 0 7 4V6" />
        <path d="M12 5a4 4 0 0 1 7 2 4 4 0 0 1 1 7 4 4 0 0 1-7 4V6" />
        <path d="M8 10h2M14 10h2M8 15h2M14 15h2" />
      </>
    ),
    network: (
      <>
        <circle cx="12" cy="4" r="2" />
        <circle cx="5" cy="18" r="2" />
        <circle cx="19" cy="18" r="2" />
        <circle cx="12" cy="12" r="2" />
        <path d="M12 6v4M10 13l-4 3M14 13l4 3" />
      </>
    ),
  };

  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[type]}
    </svg>
  );
}

export function ServiceCard({
  service,
  index,
}: {
  service: Service;
  index: number;
}) {
  return (
    <article className="ds-service-card" id={service.id}>
      <div className="ds-service-card-top">
        <span className="ds-service-icon">
          <ServiceIcon type={service.icon} />
        </span>
        <span className="ds-service-index">
          0{index + 1} / 04
        </span>
      </div>

      <p className="ds-service-category">{service.category}</p>
      <h3>{service.title}</h3>
      <p className="ds-service-description">
        {service.description}
      </p>

      <div className="ds-service-capabilities">
        {service.capabilities.map((capability) => (
          <span key={capability}>{capability}</span>
        ))}
      </div>

      <Link
        to={`/expertise#${service.id}`}
        className="ds-service-link"
        aria-label={`Explore ${service.title}`}
      >
        Explore service <span aria-hidden="true">↗</span>
      </Link>
    </article>
  );
}
