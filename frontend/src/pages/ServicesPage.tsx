import { services } from '../content/site';

export function ServicesPage() {
  return <section className="section expertise"><p className="eyebrow">Our expertise</p><h1>Built around<br /><span>your challenge.</span></h1><p className="intro">Initial service areas. We will refine these descriptions with the team's confirmed offerings.</p><div className="expertise-list">{services.map((service, index) => <article id={service.id} key={service.id}><span className="number">0{index + 1}</span><div><h2>{service.title}</h2><p>{service.description}</p></div></article>)}</div></section>;
}
