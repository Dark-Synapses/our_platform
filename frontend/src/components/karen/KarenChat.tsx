import { useState, type FormEvent } from "react";
import "./KarenChat.css";

const avatar = "/images/karen/karen-avatar.jpg";
type Message = { id: number; role: "karen" | "visitor"; text: string };
const intro = `Welcome to Dark Synapses — Where Intelligence Meets Threats!

I'm Karen, your digital guide. We bring together Artificial Intelligence, Cybersecurity, Digital Forensics, AI-Powered Applications, and AI Security to build smarter solutions and protect the technology of tomorrow.

Want to explore our services, learn about our team, see our projects, or get in touch? Ask away!`;
const topics = ["Our Services", "Artificial Intelligence", "Cybersecurity", "Digital Forensics", "AI-Powered Applications", "AI Security", "Our Team", "Projects", "Contact"];
function reply(question: string): string {
  const q = question.toLowerCase();
  if (/forensic|evidence|investigat/.test(q)) return "Digital Forensics focuses on examining digital evidence and investigating incidents. Contact our team to discuss your needs.";
  if (/powered|applications|apps/.test(q)) return "AI-Powered Applications combine software engineering with intelligent capabilities for real-world workflows.";
  if (/ai security|secure ai|llm/.test(q)) return "AI Security is about protecting AI models, applications, and their supporting systems.";
  if (/cyber|penetration|vulnerabilit/.test(q)) return "Our Cybersecurity work helps organizations identify risks and strengthen their defenses.";
  if (/artificial|machine learning|automation|agents/.test(q)) return "Our Artificial Intelligence services focus on intelligent solutions, automation, and practical AI applications.";
  if (/service|offer|special/.test(q)) return "Our five areas are Artificial Intelligence, Cybersecurity, Digital Forensics, AI-Powered Applications, and AI Security. Which interests you?";
  if (/team|founder|about|who/.test(q)) return "Meet the people behind Dark Synapses on our About page. I won't guess team details that aren't confirmed.";
  if (/project|portfolio|case stud/.test(q)) return "Visit our Projects page to explore our work and examples.";
  if (/contact|collaborat|business|hire/.test(q)) return "You can reach the Dark Synapses team through the Contact page.";
  if (/hello|hi|hey/.test(q)) return "Hey there! I'm Karen. Ask me about our services, team, projects, or how to reach us.";
  return "I'm in preview mode right now, so I can help with our five services, team, projects, and contact details. Try a topic below!";
}
export function KarenChat() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([{id: 1, role: "karen", text: intro}]);
  const [nextId, setNextId] = useState(2);
  function send(text: string) {
    const q = text.trim();
    if (!q) return;
    setMessages(prev => [...prev, {id: nextId, role: "visitor", text: q}, {id: nextId + 1, role: "karen", text: reply(q)}]);
    setNextId(id => id + 2);
    setInput("");
  }
  function submit(e: FormEvent<HTMLFormElement>) { e.preventDefault(); send(input); }
  return <div className="karen-widget">
    {open && <section className="karen-panel" aria-label="Karen chat assistant">
      <header className="karen-header">
        <img src={avatar} alt="Karen" className="karen-header-avatar" />
        <div className="karen-heading"><strong>Karen</strong><span>Your Dark Synapses Guide</span><small>● Interactive preview</small></div>
        <button className="karen-close" type="button" onClick={() => setOpen(false)} aria-label="Close Karen chat">×</button>
      </header>
      <div className="karen-scroll" aria-live="polite">
        {messages.map(m => <div className={`karen-message ${m.role}`} key={m.id}>
          {m.role === "karen" && <img src={avatar} alt="" className="karen-inline-avatar" />}
          <div className="karen-bubble">{m.text}</div>
        </div>)}
        <div className="karen-topics">{topics.map(t => <button key={t} type="button" onClick={() => send(t)}>{t}</button>)}</div>
      </div>
      <form className="karen-form" onSubmit={submit}>
        <input value={input} onChange={e => setInput(e.target.value)} aria-label="Ask Karen" placeholder="Ask Karen anything..." />
        <button type="submit" disabled={!input.trim()} aria-label="Send message">➤</button>
      </form>
      <div className="karen-footnote">Dark Synapses · Frontend preview</div>
    </section>}
    <button type="button" className="karen-launcher" aria-label={open ? "Close Karen chat" : "Open Karen chat"} aria-expanded={open} onClick={() => setOpen(v => !v)}>
      <img src={avatar} alt="" />{!open && <span className="karen-dot" />}
    </button>
  </div>;
}
