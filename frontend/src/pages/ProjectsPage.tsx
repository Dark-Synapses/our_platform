import { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import '../styles/projects-page.css';

type Category = 'AI Services' | 'Cybersecurity' | 'AI Security' | 'AI-Powered Security' | 'Digital Forensics';
type Project = { features?:string[]; data_story?:string; media?:string[]; service_categories?:Category[]; slug:string; title:string; category:Category; discipline:string; summary:string; challenge:string; approach:string; technologies:string[]; status:'draft'|'published'; featured?:boolean; image?:string; note?:string };
const categories:Category[]=['AI Services','Cybersecurity','AI Security','AI-Powered Security','Digital Forensics'];
function useProjects() {
 const [projects,setProjects]=useState<Project[]>([]);
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState(false);
 useEffect(()=>{const controller=new AbortController();
  fetch('/api/v1/projects',{signal:controller.signal}).then(async response=>{
   if(!response.ok)throw new Error('Projects unavailable');
   return response.json() as Promise<Project[]>;
  }).then(setProjects).catch(()=>{if(!controller.signal.aborted)setError(true)})
   .finally(()=>{if(!controller.signal.aborted)setLoading(false)});
  return ()=>controller.abort();},[]);
 return {projects,loading,error};
}
function usePreview(){const [params]=useSearchParams();return params.get('preview')==='1';}
function useDraftProjects(enabled:boolean){const [data,setData]=useState<Project[]>([]);const [error,setError]=useState(false);useEffect(()=>{if(!enabled)return;const controller=new AbortController();fetch('/api/v1/admin/projects',{credentials:'include',signal:controller.signal}).then(r=>{if(!r.ok)throw Error('Admin session required');return r.json() as Promise<Project[]>}).then(setData).catch(()=>{if(!controller.signal.aborted)setError(true)});return ()=>controller.abort()},[enabled]);return {data,error}}
function Visual({project}:{project:Project}){return <div className="dsp-v2-visual">{project.media?.[0]?.match(/\.(mp4|webm)$/i)?<video src={project.media[0]} controls preload="metadata" playsInline aria-label={`${project.title} demonstration`} />:project.image?<img src={project.image} alt={`${project.title} project demonstration screenshot`} />:<div className="dsp-v2-media-empty"><span className="dsp-v2-media-symbol">[ + ]</span><strong>PROJECT MEDIA PENDING</strong><span>Use an approved frame, screenshot or architecture diagram</span></div>}</div>}
export function ProjectsPage(){
 const previewEnabled=usePreview();
 const [active,setActive]=useState<Category|'All'>('All');const [search,setSearch]=useState('');
 const {projects:publishedProjects,loading,error}=useProjects();
 const {data:drafts,error:previewError}=useDraftProjects(previewEnabled);
 const projects=previewEnabled?drafts:publishedProjects;
 const featured=projects.find(p=>p.featured)??projects[0];
 const visible=useMemo(()=>projects.filter(p=>(active==='All'||p.category===active||p.service_categories?.includes(active))&&`${p.title} ${p.summary} ${p.discipline} ${p.technologies.join(' ')}`.toLowerCase().includes(search.toLowerCase().trim())),[projects,active,search]);
 return <main className="dsp-page dsp-v2" id="main-content">
 {!previewEnabled&&loading&&<p role="status">Loading projects...</p>}{!previewEnabled&&error&&<p role="alert">Projects could not be loaded. Please try again later.</p>}{previewEnabled&&<div className="dsp-v2-preview-banner" role="status">ADMIN-ONLY PREVIEW · DATABASE RECORDS {previewError?'· ADMIN LOGIN REQUIRED':''}</div>}
 <header className="dsp-v2-header"><p className="dsp-kicker">/ PROJECTS · ENGINEERING IN PRACTICE</p><h1>Engineering beyond the concept.</h1><p>Real systems. Applied intelligence. Purpose-built security.</p><p className="dsp-v2-sub">Selected work across intelligent systems, automation, computer vision and engineering. Only approved work appears publicly.</p></header>
 <section id="selected-work" className="dsp-v2-section" aria-labelledby="featured-heading"><div className="dsp-v2-section-head"><h2 id="featured-heading">Featured project</h2><span>SELECTED ENGINEERING WORK</span></div>
 {featured?<article className="dsp-v2-featured"><div className="dsp-v2-featured-copy"><p className="dsp-kicker">{featured.category.toUpperCase()} / {featured.discipline.toUpperCase()}</p><h3>{featured.title}</h3><p>{featured.summary}</p><div className="dsp-v2-pill-row"><span>{featured.category}</span><span>{featured.discipline}</span>{previewEnabled&&<span className="dsp-v2-draft">{featured.status.toUpperCase()}</span>}</div>{Boolean(featured.features?.length)&&<div className="dsp-v2-capabilities"><strong>CORE CAPABILITIES</strong><div>{featured.features?.slice(0,6).map(f=><span key={f}>{f}</span>)}</div></div>}<div className="dsp-v2-facts"><div><strong>CHALLENGE</strong><p>{featured.challenge}</p></div><div><strong>ENGINEERING</strong><p>{featured.approach}</p></div></div>{featured.data_story&&<p className="dsp-v2-data-story"><strong>KNOWLEDGE & DATA</strong>{featured.data_story}</p>}<Link className="dsp-button" to={`/projects/${featured.slug}${previewEnabled?'?preview=1':''}`}>View case study</Link></div><Visual project={featured}/></article>:<div className="dsp-no-results"><h3>Selected projects are being prepared.</h3><p>Verified, approved case studies will appear here.</p></div>}
 </section>
 <section className="dsp-v2-section" aria-labelledby="projects-heading"><div className="dsp-v2-section-head"><h2 id="projects-heading">Explore by expertise</h2><span>{visible.length} {previewEnabled?'DRAFT PREVIEWS':'PUBLISHED PROJECTS'}</span></div><div className="dsp-v2-toolbar"><div className="dsp-filters" aria-label="Filter by service"><button type="button" aria-pressed={active==='All'} onClick={()=>setActive('All')}>All projects</button>{categories.map(c=><button type="button" key={c} aria-pressed={active===c} onClick={()=>setActive(c)}>{c}</button>)}</div><label className="dsp-v2-search"><span className="dsp-sr-only">Search projects</span><input className="dsp-search" type="search" placeholder="Search projects or technologies" value={search} onChange={e=>setSearch(e.target.value)}/></label></div>
 {visible.length?<div className="dsp-v2-grid">{visible.map(p=><article key={p.slug} className="dsp-v2-card"><Visual project={p}/><div className="dsp-v2-card-body"><div className="dsp-v2-pill-row"><span>{p.category}</span>{previewEnabled&&<span className="dsp-v2-draft">{p.status.toUpperCase()}</span>}</div><h3>{p.title}</h3><p>{p.summary}</p><div className="dsp-tech">{p.technologies.map(t=><span key={t}>{t}</span>)}</div><Link className="dsp-text-link" to={`/projects/${p.slug}${previewEnabled?'?preview=1':''}`}>View case study</Link></div></article>)}</div>:<div className="dsp-no-results"><h3>{projects.length?'No matching projects.':'Case studies are being prepared.'}</h3><p>{projects.length?'Try a different search or category.':'No unapproved work is published.'}</p></div>}</section>
 <section className="dsp-v2-section"><div className="dsp-v2-section-head"><h2>Our engineering approach</h2></div><div className="dsp-method-grid">{[['Discover','Understand requirements and constraints.'],['Plan sprints','Define architecture and implementation milestones.'],['Build & review','Implement, test and review.'],['Deliver & support','Deliver and support the solution.']].map(([name,desc])=><div className="dsp-method-step" key={name}><h3>{name}</h3><p>{desc}</p></div>)}</div></section>
 <section className="dsp-cta"><div><p className="dsp-kicker">WORK WITH US</p><h2>Have a project in mind?</h2><p>Discuss your AI, security or engineering challenge.</p></div><Link className="dsp-button" to="/contact">Contact us</Link></section>
 </main>
}
function useProject(slug:string|undefined,preview:boolean){
 const [state,setState]=useState<{key:string;project:Project|null;error:string}>({key:'',project:null,error:''});
 const key=`${preview}:${slug}`;
 useEffect(()=>{const controller=new AbortController();
 fetch(`/api/v1/${preview?'admin/':''}projects/${encodeURIComponent(slug??'')}`,{credentials:'include',signal:controller.signal,cache:'no-store'}).then(async r=>{if(!r.ok)throw Error(r.status===404?'Project not available':`Unable to load project (HTTP ${r.status})`);return r.json() as Promise<Project>}).then(project=>{if(!controller.signal.aborted)setState({key,project,error:''})}).catch(e=>{if(!controller.signal.aborted)setState({key,project:null,error:String(e.message)})});return ()=>controller.abort();},[key,slug,preview]);
 return state.key===key?state:{project:null,error:''};
}
export function ProjectDetailPage(){const {slug}=useParams();const previewEnabled=usePreview();const {project,error}=useProject(slug,previewEnabled);if(!project)return <main className="dsp-page dsp-v2 dsp-v2-detail"><h1>{error||'Loading project…'}</h1><Link to="/projects">Back to projects</Link></main>;return <main className="dsp-page dsp-v2 dsp-v2-detail">{previewEnabled&&<div className="dsp-v2-preview-banner">ADMIN PREVIEW</div>}<Link className="dsp-text-link" to={`/projects${previewEnabled?'?preview=1':''}`}>Back to projects</Link><p className="dsp-kicker">CASE STUDY / {project.category.toUpperCase()}</p><h1>{project.title}</h1><p className="dsp-lead">{project.summary}</p><Visual project={project}/><div className="dsp-v2-detail-grid"><section><h2>Challenge</h2><p>{project.challenge}</p></section><section><h2>Engineering approach</h2><p>{project.approach}</p></section>{Boolean(project.features?.length)&&<section><h2>Core capabilities</h2><ul>{project.features?.map(f=><li key={f}>{f}</li>)}</ul></section>}{project.data_story&&<section><h2>Knowledge & data</h2><p>{project.data_story}</p></section>}<section><h2>Technology</h2><div className="dsp-tech">{project.technologies.map(t=><span key={t}>{t}</span>)}</div></section>{previewEnabled&&project.note&&<section><h2>Internal verification notes</h2><p>{project.note}</p></section>}</div></main>}
