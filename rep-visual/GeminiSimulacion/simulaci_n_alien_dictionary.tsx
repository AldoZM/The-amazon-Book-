import React, { useState } from 'react';

// El ejemplo clásico de LeetCode
const WORDS = ["wrt", "wrf", "er", "ett", "rftt"];

// Coordenadas para el grafo visual
const LAYOUT = {
  'w': { x: 15, y: 50 },
  'e': { x: 35, y: 20 },
  'r': { x: 55, y: 50 },
  't': { x: 75, y: 20 },
  'f': { x: 90, y: 70 }
};

export default function App() {
  const [frames, setFrames] = useState([]);
  const [step, setStep] = useState(0);
  const [phase, setPhase] = useState('setup');
  const [logs, setLogs] = useState(["Dale a 'Iniciar Extracción' para empezar a sacar las reglas."]);

  const addLog = (msg) => setLogs(prev => [...prev, msg].slice(-5));

  const generateFrames = () => {
    let generated = [];
    
    // Estados iniciales
    let edges = [];
    let inDegree = { 'w': 0, 'e': 0, 'r': 0, 't': 0, 'f': 0 };
    let queue = [];
    let result = [];
    let currentStates = { 'w': 'idle', 'e': 'idle', 'r': 'idle', 't': 'idle', 'f': 'idle' };
    
    // Variables para Fase 1
    let activeWords = [null, null];
    let diffIndex = null;

    const pushFrame = (action, phaseName, logMsg) => {
      generated.push({
        edges: [...edges],
        inDegree: { ...inDegree },
        queue: [...queue],
        result: [...result],
        states: { ...currentStates },
        activeWords: [...activeWords],
        diffIndex,
        phaseName,
        action,
        logMsg
      });
    };

    pushFrame('start', 'fase1', `🚀 FASE 1: Extraer reglas (aristas) comparando palabras adyacentes.`);

    // --- FASE 1: Extraer Reglas ---
    for (let i = 0; i < WORDS.length - 1; i++) {
      let w1 = WORDS[i];
      let w2 = WORDS[i + 1];
      activeWords = [i, i + 1];
      diffIndex = null;
      pushFrame('compare', 'fase1', `🔍 Comparando "${w1}" y "${w2}"...`);

      let minLen = Math.min(w1.length, w2.length);
      let foundDiff = false;
      for (let j = 0; j < minLen; j++) {
        if (w1[j] !== w2[j]) {
          foundDiff = true;
          diffIndex = j;
          const u = w1[j];
          const v = w2[j];
          
          edges.push({ u, v });
          inDegree[v] = (inDegree[v] || 0) + 1;
          
          pushFrame('rule_found', 'fase1', `⚡ ¡Diferencia en índice ${j}! La letra '${u}' va antes que '${v}'. Regla: ${u} -> ${v}`);
          break; // Solo nos importa la PRIMERA diferencia
        }
      }
      
      if (!foundDiff) {
         pushFrame('no_rule', 'fase1', `🤷 No hay diferencia en el prefijo común.`);
      }
    }

    activeWords = [null, null];
    diffIndex = null;
    pushFrame('fase1_done', 'fase2', `✅ Grafo construido y Grados de Entrada (In-degree) calculados.`);

    // --- FASE 2: Kahn's Algorithm (Topological Sort) ---
    pushFrame('fase2_start', 'fase2', `🚀 FASE 2 (Kahn): Buscamos letras con In-degree = 0 (Sin requisitos previos).`);

    // Llenar cola inicial
    for (let char in inDegree) {
      if (inDegree[char] === 0) {
        queue.push(char);
        currentStates[char] = 'queue';
      }
    }
    pushFrame('init_queue', 'fase2', `📥 Las letras [${queue.join(', ')}] tienen 0 requisitos. Entran a la cola.`);

    while (queue.length > 0) {
      let u = queue.shift();
      result.push(u);
      currentStates[u] = 'result';
      
      pushFrame('pop_queue', 'fase2', `🎯 Sacamos '${u}' de la cola y lo ponemos en el alfabeto final.`);

      // Buscar vecinos (aristas que salen de 'u')
      let outgoingEdges = edges.filter(e => e.u === u && !e.removed);
      let freedChars = [];

      for (let edge of outgoingEdges) {
        edge.removed = true; // Visualmente "romper" la flecha
        let v = edge.v;
        inDegree[v] -= 1;
        
        if (inDegree[v] === 0) {
          queue.push(v);
          currentStates[v] = 'queue';
          freedChars.push(v);
        }
      }

      if (outgoingEdges.length > 0) {
         pushFrame('reduce_indegree', 'fase2', `✂️ Eliminamos flechas desde '${u}'. Nuevos In-degrees calculados.`);
         if (freedChars.length > 0) {
            pushFrame('push_queue', 'fase2', `🔓 ¡Las letras [${freedChars.join(', ')}] ahora tienen In-degree 0! Entran a la cola.`);
         }
      }
    }

    if (result.length === Object.keys(inDegree).length) {
       pushFrame('done', 'done', `🏁 ¡ÉXITO! Orden Alienígena encontrado: "${result.join('')}"`);
    } else {
       pushFrame('error', 'done', `💀 ¡CICLO DETECTADO! No pudimos procesar todas las letras. Retornamos "".`);
    }

    return generated;
  };

  const startSimulation = () => {
    const newFrames = generateFrames();
    setFrames(newFrames);
    setStep(0);
    setPhase('running');
  };

  const nextStep = () => {
    if (step >= frames.length - 1) {
      setPhase('done');
      return;
    }
    const nextFrame = frames[step + 1];
    setStep(step + 1);
    if (nextFrame.logMsg) addLog(nextFrame.logMsg);
  };

  const reset = () => {
    setFrames([]);
    setStep(0);
    setPhase('setup');
    setLogs(["Simulación reiniciada."]);
  };

  const currentFrame = frames[step] || { edges: [], inDegree: {'w':0,'e':0,'r':0,'t':0,'f':0}, queue: [], result: [], states: {}, activeWords: [null, null], diffIndex: null, phaseName: 'setup' };
  const { edges, inDegree, queue, result, states, activeWords, diffIndex, phaseName } = currentFrame;

  // Helpers SVG
  const getPath = (u, v) => {
    const x1 = LAYOUT[u].x; const y1 = LAYOUT[u].y;
    const x2 = LAYOUT[v].x; const y2 = LAYOUT[v].y;
    const dx = x2 - x1; const dy = y2 - y1;
    const length = Math.sqrt(dx*dx + dy*dy);
    const padding = 12; // offset para nodo
    return {
      nx1: x1 + (dx/length) * padding,
      ny1: y1 + (dy/length) * padding,
      nx2: x2 - (dx/length) * padding,
      ny2: y2 - (dy/length) * padding
    };
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-8 font-sans text-slate-800 flex flex-col items-center">
      <h1 className="text-2xl sm:text-3xl font-extrabold mb-6 flex items-center gap-2">
        👽 Alien Dictionary (Topological Sort)
      </h1>

      <div className="flex flex-col lg:flex-row gap-6 w-full max-w-6xl">
        
        {/* Panel Izquierdo: Diccionario y Reglas */}
        <div className="flex-1 bg-white p-6 rounded-2xl shadow-lg border border-slate-200 flex flex-col gap-4">
          <h2 className="text-lg font-bold flex justify-between">
            <span>📖 Diccionario Alien</span>
            <span className={`text-xs px-2 py-1 rounded ${phaseName === 'fase1' ? 'bg-cyan-100 text-cyan-800 ring-2 ring-cyan-400' : 'bg-slate-100 text-slate-400'}`}>Fase 1</span>
          </h2>
          
          <div className="flex flex-col gap-2 font-mono text-xl bg-slate-50 p-4 rounded-xl border shadow-inner items-center">
            {WORDS.map((word, idx) => {
              const isActive = activeWords.includes(idx);
              const isDiffWord = activeWords[0] === idx || activeWords[1] === idx;
              
              return (
                <div key={idx} className={`flex tracking-[0.5em] transition-all duration-300 px-4 py-1 rounded-lg ${isActive ? 'bg-yellow-200 shadow-sm ring-2 ring-yellow-400 font-bold scale-110 z-10' : 'text-slate-500'}`}>
                  {word.split('').map((char, cIdx) => (
                    <span key={cIdx} className={`${isActive && cIdx === diffIndex ? 'text-red-600 font-black underline decoration-4 underline-offset-4' : ''}`}>
                      {char}
                    </span>
                  ))}
                </div>
              );
            })}
          </div>

          {/* Tabla In-degree */}
          <div className="mt-4">
            <h3 className="text-sm font-bold text-slate-600 mb-2 text-center">📊 Tabla de In-degree (Requisitos)</h3>
            <div className="flex justify-center gap-2">
              {['w', 'e', 'r', 't', 'f'].map(char => (
                <div key={char} className={`flex flex-col items-center border rounded-lg overflow-hidden transition-all duration-300 ${inDegree[char] === 0 ? 'bg-green-100 border-green-400' : 'bg-white border-slate-300'}`}>
                  <div className="bg-slate-800 text-white font-bold w-8 text-center text-sm py-1">{char}</div>
                  <div className={`font-mono w-8 text-center font-bold py-1 ${inDegree[char] === 0 ? 'text-green-600' : 'text-slate-600'}`}>
                    {inDegree[char]}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Panel Central: Grafo DAG */}
        <div className="flex-1 bg-white p-6 rounded-2xl shadow-lg border border-slate-200 flex flex-col">
          <h2 className="text-lg font-bold mb-4 flex justify-between">
            <span>🕸️ Grafo de Dependencias (DAG)</span>
            <span className={`text-xs px-2 py-1 rounded ${phaseName === 'fase2' ? 'bg-yellow-100 text-yellow-800 ring-2 ring-yellow-400' : 'bg-slate-100 text-slate-400'}`}>Fase 2</span>
          </h2>
          
          <div className="relative w-full h-[300px] bg-slate-50 rounded-xl border border-slate-200 overflow-hidden shadow-inner">
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
              <defs>
                <marker id="arrow" markerWidth="8" markerHeight="6" refX="10" refY="3" orient="auto">
                  <polygon points="0 0, 8 3, 0 6" fill="#94a3b8" />
                </marker>
              </defs>
              
              {edges.map((edge, idx) => {
                if (edge.removed) return null; // No dibujar aristas eliminadas
                const { nx1, ny1, nx2, ny2 } = getPath(edge.u, edge.v);
                return (
                  <line 
                    key={idx}
                    x1={`${nx1}%`} y1={`${ny1}%`} x2={`${nx2}%`} y2={`${ny2}%`}
                    stroke="#cbd5e1" strokeWidth="3" markerEnd="url(#arrow)"
                    className="transition-all duration-500"
                  />
                );
              })}
            </svg>

            {/* Nodos */}
            {Object.keys(LAYOUT).map((node) => {
              const state = states[node] || 'idle';
              let classes = "absolute w-12 h-12 -ml-6 -mt-6 rounded-full flex flex-col items-center justify-center font-bold text-xl uppercase transition-all duration-300 border-4 z-10 shadow-md ";
              
              if (state === 'result') classes += "bg-green-500 border-green-700 text-white scale-110 shadow-[0_0_15px_rgba(34,197,94,0.8)]";
              else if (state === 'queue') classes += "bg-cyan-200 border-cyan-400 text-cyan-900 scale-110 z-20 animate-pulse";
              else classes += "bg-white border-slate-300 text-slate-700";

              return (
                <div key={node} className={classes} style={{ left: `${LAYOUT[node].x}%`, top: `${LAYOUT[node].y}%` }}>
                  {node}
                </div>
              );
            })}
          </div>

          <div className="mt-4 flex flex-col sm:flex-row gap-3">
            {phase === 'setup' && (
              <button onClick={startSimulation} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-md transition-transform hover:-translate-y-0.5">
                Iniciar Extracción 🚀
              </button>
            )}
            
            {(phase === 'running' || phase === 'done') && (
              <button onClick={nextStep} disabled={phase === 'done'} className={`flex-1 font-bold py-3 rounded-xl shadow-lg transition-transform flex items-center justify-center gap-2 ${phase === 'done' ? 'bg-slate-300 text-slate-500' : 'bg-green-600 hover:bg-green-700 text-white hover:-translate-y-0.5'}`}>
                {phase === 'done' ? '🏁 Terminado' : 'Avanzar Paso 👣'}
              </button>
            )}

            <button onClick={reset} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2 rounded-xl border border-slate-300">
              🔄 Reiniciar
            </button>
          </div>
        </div>

        {/* Panel Derecho: Kahn & Resultado */}
        <div className="flex-1 flex flex-col gap-4">
          
          {/* Cola */}
          <div className="bg-white p-4 rounded-2xl shadow-md border border-slate-200">
            <h2 className="text-sm font-bold mb-2">📥 Cola (In-degree = 0)</h2>
            <div className="flex gap-2 overflow-x-auto py-2 items-center min-h-[3.5rem] bg-slate-50 rounded-lg px-2 border border-slate-100">
              {queue.length === 0 ? (
                <span className="text-slate-400 italic text-xs w-full text-center">Vacía</span>
              ) : (
                queue.map((char, idx) => (
                  <div key={idx} className={`flex-shrink-0 w-8 h-8 rounded-full border flex items-center justify-center text-sm font-bold uppercase shadow-sm ${idx === 0 ? 'bg-cyan-200 border-cyan-400 text-cyan-900 scale-110' : 'bg-white border-slate-300 text-slate-600'}`}>
                    {char}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Resultado Final */}
          <div className="bg-white p-4 rounded-2xl shadow-md border border-slate-200 flex-1 flex flex-col">
            <h2 className="text-sm font-bold mb-2 text-green-600">✅ Alfabeto Alienígena Resultante</h2>
            <div className="flex-1 flex items-center justify-center bg-green-50 rounded-xl border border-green-200">
              {result.length === 0 ? (
                <span className="text-green-300/50 italic text-sm">Esperando letras...</span>
              ) : (
                <span className="text-3xl font-black text-green-700 tracking-[0.3em] uppercase">
                  {result.join('')}
                </span>
              )}
            </div>
          </div>

          {/* Consola */}
          <div className="bg-slate-900 text-green-400 p-4 rounded-2xl shadow-lg h-40 flex flex-col font-mono text-sm border-4 border-slate-800 relative">
            <div className="absolute top-0 left-0 w-full bg-slate-800 text-slate-300 text-xs py-1 px-3 font-sans font-bold">
              Consola del Traductor
            </div>
            <div className="flex-1 overflow-y-auto mt-4 flex flex-col justify-end gap-1.5">
              {logs.map((log, i) => (
                <p key={i} className={`leading-relaxed ${i === logs.length - 1 ? 'text-white font-bold' : 'opacity-60 text-xs'}`}>
                  {">"} {log}
                </p>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}