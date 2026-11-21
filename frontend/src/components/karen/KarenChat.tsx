import { useLocation } from "react-router-dom";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { sendKarenMessage } from "../../lib/karenChatService";
import "./KarenChat.css";

const avatar = "/images/karen/karen-approved.webp";
type Message = { id: number; role: "karen" | "visitor"; text: string; at: Date };
const intro = "Welcome to Dark Synapses.\nI'm Karen, your interactive assistant.\nHow can I help you today?";
const topics = ["Our Services", "AI Services", "Cybersecurity", "AI Security", "AI-Powered Security", "Digital Forensics", "Projects", "Contact"];
export function reply(question: string): string {
  const q = question.toLowerCase();
  if (/forensic|evidence|investigat/.test(q)) return "Our Digital Forensics service focuses on content authenticity and examining digital evidence. Contact us to discuss your needs.";
  if (/powered|applications|apps/.test(q)) return "AI-Powered Security uses intelligent technologies to strengthen security operations and workflows.";
  if (/ai security|secure ai|llm/.test(q)) return "AI Security is about protecting AI models, applications, and their supporting systems.";
  if (/cyber|penetration|vulnerabilit/.test(q)) return "Our Cybersecurity work helps organizations identify risks and strengthen their defenses.";
  if (/artificial|machine learning|automation|agents|ai services/.test(q)) return "Our AI Services focus on intelligent solutions, automation, and practical AI applications.";
  if (/service|offer|special/.test(q)) return "We offer AI Services, Cybersecurity, AI Security, AI-Powered Security, and Digital Forensics (Content Authenticity). Which would you like to explore?";
  if (/about|who/.test(q)) return "Dark Synapses builds practical AI and cybersecurity solutions. Explore the About section to learn about our approach.";
  if (/project|portfolio|case stud/.test(q)) return "Visit our Projects page to explore our work and examples.";
  if (/contact|collaborat|business|hire/.test(q)) return "You can reach the Dark Synapses team through the Contact page.";
  if (/hello|hi|hey/.test(q)) return "Hey there! I'm Karen. Ask me about our services, projects, or how to reach us.";
  return "I can help with our services, projects, and contact details. Try one of the suggested questions!";
}
const clock = (at: Date) => at.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
export function KarenChat() {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>(() => [{ id: 1, role: "karen", text: intro, at: new Date() }]);
  const [sending, setSending] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const nextId = useRef(2);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isWelcome = messages.length === 1;
  useEffect(() => {
    if (open) scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open, showSuggestions, sending]);
  useEffect(() => { if (open) inputRef.current?.focus(); }, [open]);
  async function send(text: string) {
    const question = text.trim();
    if (!question || sending) return;
    setMessages(prev => [...prev, { id: nextId.current++, role: "visitor", text: question, at: new Date() }]);
    setInput("");
    setShowSuggestions(false);
    setSending(true);
    try {
      const result = await sendKarenMessage(question, reply);
      setMessages(prev => [...prev, { id: nextId.current++, role: "karen", text: result.reply, at: new Date() }]);
    } catch {
      setMessages(prev => [...prev, { id: nextId.current++, role: "karen", text: "Sorry, I couldn't respond just now. Please try again.", at: new Date() }]);
    } finally { setSending(false); }
  }
  function submit(e: FormEvent<HTMLFormElement>) { e.preventDefault(); void send(input); }
  if (location.pathname.startsWith("/security-researcher")) return null;
  return <div className="karen-widget">
    {open && <section className={`karen-panel ${isWelcome ? "karen-panel-welcome" : "karen-panel-conversation"}`} aria-label="Karen chat assistant">
      <header className="karen-header">
        <img className="karen-header-avatar" src={avatar} alt="Karen, smiling CRT robot" />
        <div className="karen-heading"><strong>KAREN <em>//</em></strong><span>Dark Synapses Assistant</span></div>
        <button className="karen-minimize" type="button" onClick={() => setOpen(false)} aria-label="Minimize Karen">−</button>
        <button className="karen-close" type="button" onClick={() => setOpen(false)} aria-label="Close Karen">×</button>
      </header>
      <div className="karen-scroll" ref={scrollRef} role="log" aria-label="Conversation" aria-live="polite">
        {messages.map(m => <div className={`karen-message ${m.role}`} key={m.id}>
          {m.role === "karen" && <img className="karen-inline-avatar" src={avatar} alt="" />}
          <div className="karen-message-body">
            <div className="karen-message-meta"><span>{m.role === "karen" ? "KAREN ›" : "YOU ›"}</span><time dateTime={m.at.toISOString()}>{clock(m.at)}</time></div>
            <div className="karen-bubble">{m.text}</div>
          </div>
        </div>)}
        {sending && <div className="karen-typing" role="status">KAREN › typing…</div>}
        {showSuggestions && <div className="karen-suggestions" aria-label="Suggested questions">
          <span className="karen-suggestions-label">SUGGESTED QUESTIONS</span>
          <div className="karen-suggestion-list">{topics.slice(0, isWelcome ? 4 : topics.length).map(t => <button key={t} type="button" disabled={sending} onClick={() => void send(t)}>{t}</button>)}</div>
        </div>}
      </div>
      <div className="karen-bottom">
        {!isWelcome && <button className="karen-toggle-questions" type="button" onClick={() => setShowSuggestions(v => !v)} aria-expanded={showSuggestions}>{showSuggestions ? "− Hide questions" : "+ Suggested questions"}</button>}
        <form className="karen-form" onSubmit={submit}>
          <span className="karen-prompt" aria-hidden="true">›</span>
          <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)} aria-label="Ask Karen" placeholder="Ask Karen anything..." />
          <button type="submit" disabled={!input.trim() || sending} aria-label="Send message"><svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg></button>
        </form>
      </div>
    </section>}
    <button className="karen-launcher" type="button" aria-label={open ? "Close Karen chat" : "Open Karen chat"} aria-expanded={open} onClick={() => setOpen(v => !v)}><img src={avatar} alt="" /></button>
  </div>;
}
