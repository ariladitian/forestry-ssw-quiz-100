import React, { useEffect, useState } from "react";
import questions from "./questions.js";

const QUESTIONS_PER_SESSION = 30;
const PASS_RATE = 0.65;

function tfLabel(v){ return v ? "正しい (True)" : "誤り (False)"; }

export default function App(){
  const [sessionQuestions, setSessionQuestions] = useState([]);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [pests, setPests] = useState(0);
  const [showHira, setShowHira] = useState(true);
  const [showEn, setShowEn] = useState(false);
  const [finished, setFinished] = useState(false);
  const [history, setHistory] = useState([]);

  useEffect(()=>{ startSession(); }, []);

  const startSession = () => {
    const pool = [...questions];
    for (let i=pool.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [pool[i],pool[j]]=[pool[j],pool[i]]; }
    setSessionQuestions(pool.slice(0, Math.min(QUESTIONS_PER_SESSION, pool.length)));
    setIndex(0); setScore(0); setPests(0); setFinished(false); setHistory([]);
  };

  const playJapanese = (text) => {
    if (!("speechSynthesis" in window)) return;
    try { const u = new SpeechSynthesisUtterance(text); u.lang="ja-JP"; u.rate=0.95; window.speechSynthesis.cancel(); window.speechSynthesis.speak(u);} catch {}
  };

  const answerAndNext = (choice) => {
    const q = sessionQuestions[index]; if(!q) return;
    const correct = q.answer === choice;
    if (correct) setScore(s=>s+1); else setPests(p=>p+1);
    setHistory(h=>[...h, {...q, userAnswer: choice, correct }]);
    if (index + 1 < sessionQuestions.length) setIndex(i=>i+1);
    else setFinished(true);
  };

  const progressPct = sessionQuestions.length ? Math.round((index / sessionQuestions.length) * 100) : 0;
  const passed = finished ? score / Math.max(1, sessionQuestions.length) >= PASS_RATE : false;

  const styles = {
    app:{background:"#f3fbf3", minHeight:"100vh", padding:16, fontFamily:"'Noto Sans JP', system-ui", color:"#123"},
    header:{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12, gap:12},
    headerRight:{display:"flex", gap:8, alignItems:"center"},
    smallBtn:{background:"#fff", border:"1px solid #cfe9cf", padding:"6px 8px", borderRadius:6, cursor:"pointer"},
    main:{display:"flex", gap:20, alignItems:"flex-start"},
    side:{width:360},
    sidePanel:{background:"#fff", padding:12, borderRadius:12, border:"1px solid #d7edd7", textAlign:"left"},
    forestRow:{display:"flex", gap:6, margin:"8px 0"},
    treeSlot:{width:26, height:26, display:"flex", alignItems:"center", justifyContent:"center", background:"#eef7ee", border:"1px solid #cfe9cf", borderRadius:6},
    pestRow:{display:"flex", gap:2, marginBottom:6},
    questionArea:{flex:1},
    qHeader:{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8},
    playBtn:{background:"#fff", border:"1px solid #cfe9cf", padding:"6px 8px", borderRadius:6, cursor:"pointer"},
    card:{background:"#fff", padding:18, borderRadius:12, boxShadow:"0 6px 18px rgba(28,80,28,0.06)"},
    jpText:{fontSize:20, color:"#123a12", marginBottom:6},
    hira:{color:"#356b3a", fontSize:16},
    optionRow:{marginTop:14, display:"flex", gap:12},
    bigBtn:{flex:1, background:"linear-gradient(180deg,#e6f9e6,#cfeed0)", border:"1px solid #bfe6bf", padding:"10px 14px", fontWeight:700, color:"#114411", borderRadius:8, cursor:"pointer", boxShadow:"0 6px 10px rgba(17,68,17,0.07)"},
    bigBtnAlt:{flex:1, background:"linear-gradient(180deg,#fff0f0,#ffecec)", border:"1px solid #f2cfcf", color:"#7a2b2b", padding:"10px 14px", fontWeight:700, borderRadius:8, cursor:"pointer", boxShadow:"0 6px 10px rgba(17,68,17,0.07)"},
    results:{padding:12, background:"#f7fff7", borderRadius:12},
    restartBtn:{background:"#1b7a1b", color:"#fff", padding:"8px 12px", borderRadius:8, border:"none", cursor:"pointer"}
  };

  const forestRow = () => {
    const grown = Math.round((score / QUESTIONS_PER_SESSION) * 10);
    const items = [];
    for(let i=0;i<10;i++){ items.push(<div key={i} style={styles.treeSlot}>{i<grown?"🌳":"🌱"}</div>); }
    return <div style={styles.forestRow}>{items}</div>;
  };
  const pestRow = () => {
    if (pests<=0) return null;
    const count = Math.min(pests, 10);
    return <div style={styles.pestRow}>{Array.from({length:count}).map((_,i)=>(<span key={i} style={{fontSize:16, marginRight:4}}>🐛</span>))}</div>;
  };

  return (
    <div style={styles.app}>
      <header style={styles.header}>
        <div style={{display:"flex", flexDirection:"column"}}>
          <h1 style={{margin:0, fontSize:20}}>Forestry SSW Mock-Up test delivered by ChatGPT ding</h1>
          <div style={{fontSize:12, color:"#194d18"}}>Each session: {QUESTIONS_PER_SESSION} questions — pass at 65%</div>
        </div>
        <div style={styles.headerRight}>
          <button style={styles.smallBtn} onClick={startSession}>↻ New session</button>
          <button style={styles.smallBtn} onClick={()=>setShowHira(s=>!s)}>{showHira?"Hide Hiragana":"Show Hiragana"}</button>
          <button style={styles.smallBtn} onClick={()=>setShowEn(s=>!s)}>{showEn?"Hide English":"Show English"}</button>
        </div>
      </header>

      <main style={{display:"flex", gap:20, alignItems:"flex-start"}}>
        <aside style={{width:360}}>
          <div style={styles.sidePanel}>
            <div style={{ marginBottom: 6, fontSize: 13, color: "#134017" }}>Score: {score} / {sessionQuestions.length || QUESTIONS_PER_SESSION}</div>
            <div style={{ fontSize: 12, color: "#4b724b", marginBottom: 6 }}>Pests: {pests}</div>
            {forestRow()}
            {pestRow()}
            <div style={{background:"#e6efe6", borderRadius:8, marginTop:10, height:10, overflow:"hidden", border:"1px solid #d6efd6"}}>
              <div style={{height:"100%", background:"linear-gradient(90deg, #9dd78f, #2ca02c)", width:(progressPct+"%")}}/>
            </div>
          </div>
        </aside>

        <section style={styles.questionArea}>
          {!finished && sessionQuestions[index] && (
            <>
              <div style={styles.qHeader}>
                <div style={{ fontSize: 13, color: "#1f4a1f" }}>Question {index + 1} / {sessionQuestions.length}</div>
                <div><button onClick={()=>playJapanese(sessionQuestions[index].jp)} style={styles.playBtn} title="Play Japanese audio">🔊</button></div>
              </div>
              <article style={styles.card}>
                <div style={styles.jpText}>{sessionQuestions[index].jp}</div>
                {showHira && <div style={styles.hira}>{sessionQuestions[index].hira}</div>}
                {showEn && (<details style={{ marginTop: 8 }}><summary style={{ cursor:"pointer" }}>English hint</summary><div style={{ marginTop: 6, color: "#234" }}>{sessionQuestions[index].en}</div></details>)}
                <div style={styles.optionRow}>
                  <button style={styles.bigBtn} onClick={()=>answerAndNext(true)}>True</button>
                  <button style={styles.bigBtnAlt} onClick={()=>answerAndNext(false)}>False</button>
                </div>
                <div style={{marginTop:10, fontSize:12, color:"#345"}}><strong>Source:</strong> {sessionQuestions[index].source}</div>
              </article>
            </>
          )}

          {finished && (
            <div style={styles.results}>
              <h2 style={{ marginTop: 0 }}>{passed ? "合格! Passed ✅" : "不合格 Failed ❌"}</h2>
              <div style={{ fontSize: 14, color: "#1f5f1f" }}>Score: {score} / {sessionQuestions.length} — {Math.round((score/sessionQuestions.length)*100) || 0}%</div>
              <div style={{ marginTop: 16 }}>
                <h3>Review</h3>
                <div style={{ maxHeight: 320, overflow: "auto", padding: 8 }}>
                  {history.map((h,i)=>(
                    <div key={i} style={{ borderBottom: "1px dashed #ddd", padding: "8px 0" }}>
                      <div style={{ fontWeight: 700 }}>{h.jp}</div>
                      <div style={{ fontSize: 13, color: "#333" }}>Your answer: {tfLabel(h.userAnswer)} — Correct: {tfLabel(h.answer)}</div>
                      <div style={{ fontSize: 13, color: "#4a4a4a" }}><strong>Source:</strong> {h.source} &nbsp; | &nbsp; <strong>Reason:</strong> {h.reason}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ marginTop: 12 }}><button onClick={startSession} style={styles.restartBtn}>Start New Session</button></div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
