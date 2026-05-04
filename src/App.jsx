
import React, { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { BookOpen, ClipboardList, Layers, RotateCcw, Search, Shuffle, CheckCircle2 } from "lucide-react";
import { TERMS } from "./terms.js";
import "./styles.css";

function shuffle(arr){ return [...arr].sort(() => Math.random() - 0.5); }
function optionsFor(correct, pool){ return shuffle([correct, ...shuffle(pool.filter(x => x.term !== correct.term)).slice(0,3)]); }

function App(){
  const [mode,setMode]=useState("practica");
  const [query,setQuery]=useState("");
  const [category,setCategory]=useState("Todas");
  const [i,setI]=useState(0);
  const [selected,setSelected]=useState(null);
  const [score,setScore]=useState(0);
  const [answered,setAnswered]=useState(0);
  const [showBack,setShowBack]=useState(false);
  const [exam,setExam]=useState(()=>shuffle(TERMS).slice(0,20));
  const [answers,setAnswers]=useState({});

  const categories = useMemo(()=>["Todas", ...Array.from(new Set(TERMS.map(t=>t.category))).sort()],[]);
  const filtered = useMemo(()=> TERMS.filter(t =>
    (category==="Todas" || t.category===category) &&
    (t.term + " " + t.definition).toLowerCase().includes(query.toLowerCase())
  ),[query,category]);
  const pool = filtered.length >= 4 ? filtered : TERMS;
  const current = pool[i % pool.length];
  const opts = useMemo(()=>optionsFor(current,pool),[current,pool]);
  const examScore = exam.reduce((a,q,idx)=> a + (answers[idx]===q.term ? 1 : 0), 0);

  function reset(){ setI(0); setSelected(null); setScore(0); setAnswered(0); setShowBack(false); setExam(shuffle(pool).slice(0,20)); setAnswers({}); }
  function choose(term){ if(selected) return; setSelected(term); setAnswered(x=>x+1); if(term===current.term) setScore(x=>x+1); }
  function next(){ setI(x=>x+1); setSelected(null); setShowBack(false); }

  return <main className="page"><div className="wrap">
    <section className="header">
      <div><h1 className="title">Glosario interactivo de construcción</h1><p className="subtitle">241 conceptos cargados desde los dos PDF. Práctica, flashcards, examen y repaso.</p></div>
      <button className="btn secondary" onClick={reset}><RotateCcw size={18}/> Reiniciar</button>
    </section>

    <section className="card controls">
      <label><Search size={16}/> <input className="input" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Buscar concepto o definición..." /></label>
      <select className="select" value={category} onChange={e=>{setCategory(e.target.value);setI(0)}}>{categories.map(c=><option key={c}>{c}</option>)}</select>
    </section>

    <section className="tabs">
      <button className={`btn ${mode==="practica"?"active":"secondary"}`} onClick={()=>setMode("practica")}><ClipboardList size={18}/>Práctica</button>
      <button className={`btn ${mode==="flashcards"?"active":"secondary"}`} onClick={()=>setMode("flashcards")}><BookOpen size={18}/>Flashcards</button>
      <button className={`btn ${mode==="examen"?"active":"secondary"}`} onClick={()=>setMode("examen")}><CheckCircle2 size={18}/>Examen</button>
      <button className={`btn ${mode==="categorias"?"active":"secondary"}`} onClick={()=>setMode("categorias")}><Layers size={18}/>Repaso</button>
    </section>

    {mode==="practica" && <section className="card">
      <div className="row muted"><span>Pregunta {answered+1}</span><span>Puntaje: {score}/{answered}</span></div>
      <p className="muted">¿Qué concepto corresponde a esta definición?</p>
      <p className="definition">{current.definition}</p>
      <div className="options">{opts.map(op=>{
        let cls="option";
        if(selected && op.term===current.term) cls+=" correct";
        if(selected===op.term && op.term!==current.term) cls+=" wrong";
        return <button key={op.term} className={cls} onClick={()=>choose(op.term)}>{op.term}</button>
      })}</div>
      {selected && <div className="feedback"><b>{selected===current.term?"Correcto":"Incorrecto"}.</b> La respuesta era <b>{current.term}</b>.</div>}
      <p><button className="btn" onClick={next}>Siguiente</button></p>
    </section>}

    {mode==="flashcards" && <section className="card">
      <div className="row muted"><span>{(i%pool.length)+1} de {pool.length}</span><span>Letra {current.category}</span></div>
      <button className="flash" onClick={()=>setShowBack(!showBack)}><p className="muted">Tocá para girar</p><h2>{showBack ? current.definition : current.term}</h2></button>
      <p><button className="btn" onClick={next}><Shuffle size={18}/>Otra tarjeta</button></p>
    </section>}

    {mode==="examen" && <section className="card">
      <div className="row"><h2>Examen de 20 preguntas</h2><b>Nota: {examScore}/20</b></div>
      {exam.map((q,idx)=><div className="exam-item" key={idx}>
        <p><b>{idx+1}.</b> {q.definition}</p>
        <select className="select" value={answers[idx]||""} onChange={e=>setAnswers({...answers,[idx]:e.target.value})}>
          <option value="">Seleccione respuesta</option>
          {optionsFor(q,TERMS).map(op=><option key={op.term}>{op.term}</option>)}
        </select>
        {answers[idx] && <p className={answers[idx]===q.term?"correct-text":"wrong-text"}>{answers[idx]===q.term?"Correcto":`Incorrecto. Era: ${q.term}`}</p>}
      </div>)}
      <button className="btn" onClick={()=>{setExam(shuffle(pool).slice(0,20));setAnswers({});}}>Nuevo examen</button>
    </section>}

    {mode==="categorias" && <section className="grid">
      {filtered.map((t,idx)=><article className="card" key={idx}><p className="muted">Letra {t.category} · pág. {t.page}</p><h3 className="term-title">{t.term}</h3><p>{t.definition}</p></article>)}
    </section>}
  </div></main>;
}

createRoot(document.getElementById("root")).render(<App/>);
