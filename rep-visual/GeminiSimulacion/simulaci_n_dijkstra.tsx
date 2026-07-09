import React, { useState } from 'react';

// Grafo diseñado para mostrar "atajos" (Relaxation)
const NODES = {
  1: { x: 10, y: 50 },
  2: { x: 40, y: 20 },
  3: { x: 40, y: 80 },
  4: { x: 70, y: 20 },
  5: { x: 90, y: 50 }
};

// [origen, destino, peso]
const EDGES = [
  { u: 1, v: 2, w: 2 },
  { u: 1, v: 3, w: 5 }, // El camino directo es lento (5)
  { u: 2, v: 3, w: 1 }, // ¡Atajo! 1->2->3 toma 2+1 = 3
  { u: 2, v: 4, w: 4 },
  { u: 3, v: 4, w: 1 }, // ¡Otro atajo!
  { u: 3, v: 5, w: 4 },
  { u: 4, v: 5, w: 1 }
];

export default function App() {
  const [frames, setFrames] = useState([]);
  const [step, setStep] = useState(0);
  const [phase, setPhase] = useState('setup');
  const [logs, setLogs] = useState(["Dale a 'Iniciar Dijkstra' para ver cómo viaja la señal."]);

  const addLog = (msg) => setLogs(prev => [...prev, msg].slice(-5));

  const generateFrames = () => {
    let generated = [];
    const n = 5;
    const startNode = 1;
    
    let distances = { 1: 0, 2: Infinity, 3: Infinity, 4: Infinity, 5: Infinity };
    let visited = new Set();
    let pq = [{ node: startNode, time: 0 }]; // Simula una Priority Queue
    
    // Estados visuales: 'idle', 'pq', 'current', 'visited'
    let currentStates = { 1: 'idle', 2: 'idle', 3: 'idle', 4: 'idle', 5: 'idle' };

    const pushFrame = (action, activeNode, logMsg) => {
      generated.push({
        distances: { ...distances },
        states: { ...currentStates },
        pq: [...pq].sort((a,b) => a.time - b.time), // Siempre ordenado por tiempo
        activeNode,
        logMsg
      });
    };

    pushFrame('start', null, `🚀 Iniciamos en el nodo ${startNode}. Tiempo: 0. Los demás son Infinito.`);

    while (pq.length > 0) {
      // 1. Sacar el de menor tiempo
      pq.sort((a, b) => a.time - b.time);
      const curr = pq.shift();
      const u = curr.node;
      const t = curr.time;

      if (visited.has(u)) {
        pushFrame('skip', u, `⏭️ Nodo ${u} ya fue visitado con un tiempo mejor. Lo ignoramos.`);
        continue;
      }

      // Marcar como visitado/procesado
      visited.add(u);
      currentStates[u] = 'current';
      pushFrame('visit', u, `🔍 Procesando Nodo ${u} (Tiempo récord actual: ${t})`);

      // 2. Revisar vecinos
      let edgesFromU = EDGES.filter(e => e.u === u);
      let updates = 0;

      for (let edge of edgesFromU) {
        const v = edge.v;
        const weight = edge.w;
        const newTime = t + weight;

        if (newTime < distances[v]) {
          const oldTime = distances[v] === Infinity ? '∞' : distances[v];
          distances[v] = newTime;
          pq.push({ node: v, time: newTime });
          
          if (currentStates[v] !== 'visited') {
             currentStates[v] = 'pq';
          }
          
          updates++;
          pushFrame('relax', u, `⚡ ¡ATAJO! Hacia Nodo ${v}: ${t} + ${weight} = ${newTime}. (Mejora el viejo ${oldTime}).`);
        } else {
           pushFrame('no_relax', u, `❌ Hacia Nodo ${v}: ${t} + ${weight} = ${newTime}. No mejora el récord de ${distances[v]}.`);
        }
      }

      currentStates[u] = 'visited';
      if (updates === 0 && edgesFromU.length > 0) {
        pushFrame('done_node', u, `✅ Nodo ${u} procesado. No se encontraron rutas más rápidas.`);
      }
    }

    // Calcular resultado final
    let maxTime = 0;
    for (let i = 1; i <= n; i++) {
      if (distances[i] === Infinity) {
        maxTime = -1;
        break;
      }
      maxTime = Math.max(maxTime, distances[i]);
    }

    pushFrame('finish', null, `🏁 Búsqueda terminada. Tiempo total para llegar a todos: ${maxTime}`);
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
    if (nextFrame.logMsg) addLog(`> ${nextFrame.logMsg}`);
  };

  const reset = () => {
    setFrames([]);
    setStep(0);
    setPhase('setup');
    setLogs(["Simulación reiniciada."]);
  };

  const currentFrame = frames[step] || { distances: {1:0, 2:'∞', 3:'∞', 4:'∞', 5:'∞'}, states: {}, pq: [] };
  const { distances, states, pq } = currentFrame;

  // Helpers para dibujar flechas
  const getPath = (u, v) => {
    const x1 = NODES[u].x; const y1 = NODES[u].y;
    const x2 = NODES[v].x; const y2 = NODES[v].y;
    // Acortar la línea para que no tape el nodo
    const dx = x2 - x1; const dy = y2 - y1;
    const length = Math.sqrt(dx*dx + dy*dy);
    const padding = 6; // % offset
    const nx1 = x1 + (dx/length) * padding;
    const ny1 = y1 + (dy/length) * padding;
    const nx2 = x2 - (dx/length) * padding;
    const ny2 = y2 - (dy/length) * padding;
    return { nx1, ny1, nx2, ny2 };
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-8 font-sans text-slate-800 flex flex-col items-center">
      <h1 className="text-2xl sm:text-3xl font-extrabold mb-6 flex items-center gap-2">
        📡 Network Delay Time (Dijkstra)
      </h1>

      <div className="flex flex-col lg:flex-row gap-6 w-full max-w-6xl">
        
        {/* Panel Izquierdo: Grafo */}
        <div className="flex-[3] bg-white p-6 rounded-2xl shadow-lg border border-slate-200 flex flex-col">
          
          <div className="relative w-full h-[400px] bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
            {/* Definición de la flecha SVG */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
              <defs>
                <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                  <polygon points="0 0, 10 3.5, 0 7" fill="#94a3b8" />
                </marker>
              </defs>
              
              {EDGES.map((edge, idx) => {
                const { nx1, ny1, nx2, ny2 } = getPath(edge.u, edge.v);
                return (
                  <g key={idx}>
                    <line x1={`${nx1}%`} y1={`${ny1}%`} x2={`${nx2}%`} y2={`${ny2}%`} stroke="#cbd5e1" strokeWidth="3" markerEnd="url(#arrowhead)" />
                    {/* Fondo blanco para el texto del peso */}
                    <circle cx={`${(nx1+nx2)/2}%`} cy={`${(ny1+ny2)/2}%`} r="12" fill="white" stroke="#e2e8f0" strokeWidth="1"/>
                    <text x={`${(nx1+nx2)/2}%`} y={`${(ny1+ny2)/2}%`} textAnchor="middle" dominantBaseline="central" className="text-xs font-bold fill-blue-600">
                      {edge.w}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Nodos */}
            {Object.keys(NODES).map((n) => {
              const node = Number(n);
              const state = states[node] || 'idle';
              const dist = phase === 'setup' && node !== 1 ? '∞' : (distances[node] === Infinity ? '∞' : distances[node]);
              
              let classes = "absolute w-14 h-14 -ml-7 -mt-7 rounded-full flex flex-col items-center justify-center font-bold transition-all duration-300 border-4 z-10 shadow-md ";
              if (state === 'current') classes += "bg-yellow-400 border-yellow-600 text-yellow-900 scale-125 z-30 ring-4 ring-yellow-200 animate-pulse";
              else if (state === 'visited') classes += "bg-green-500 border-green-700 text-white scale-110";
              else if (state === 'pq') classes += "bg-cyan-100 border-cyan-400 text-cyan-800 scale-105";
              else classes += "bg-white border-slate-300 text-slate-700";

              return (
                <div key={node} className={classes} style={{ left: `${NODES[node].x}%`, top: `${NODES[node].y}%` }}>
                  <span className="text-lg leading-none">{node}</span>
                  <span className={`text-[10px] bg-white text-slate-800 px-1 rounded-full absolute -bottom-3 border shadow-sm ${state === 'visited' ? 'border-green-600 font-bold' : 'border-slate-300'}`}>
                    T: {dist}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            {phase === 'setup' && (
              <button onClick={startSimulation} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-md transition-transform hover:-translate-y-0.5">
                1. Iniciar Dijkstra 🚀
              </button>
            )}
            
            {(phase === 'running' || phase === 'done') && (
              <button onClick={nextStep} disabled={phase === 'done'} className={`flex-1 font-bold py-3 rounded-xl shadow-lg transition-transform flex items-center justify-center gap-2 ${phase === 'done' ? 'bg-slate-300 text-slate-500' : 'bg-green-600 hover:bg-green-700 text-white hover:-translate-y-0.5'}`}>
                {phase === 'done' ? '🏁 Simulación Terminada' : '2. Avanzar Paso 👣'}
              </button>
            )}

            <button onClick={reset} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2 rounded-xl border border-slate-300">
              🔄 Reiniciar
            </button>
          </div>
        </div>

        {/* Panel Derecho: Tabla, PQ y Logs */}
        <div className="flex-[2] flex flex-col gap-4">
          
          {/* Priority Queue Visualizer */}
          <div className="bg-white p-4 rounded-2xl shadow-md border border-slate-200">
            <h2 className="text-sm font-bold mb-2 flex justify-between">
              <span>📥 Cola de Prioridad (Min-Heap)</span>
            </h2>
            <div className="flex gap-2 overflow-x-auto py-2 items-center min-h-[3.5rem] bg-slate-50 rounded-lg px-2 border border-slate-100">
              {pq.length === 0 ? (
                <span className="text-slate-400 italic text-xs w-full text-center">Vacía</span>
              ) : (
                pq.map((item, idx) => (
                  <div key={idx} className={`flex-shrink-0 px-2 py-1 rounded border text-xs flex flex-col items-center shadow-sm ${idx === 0 ? 'bg-yellow-200 border-yellow-500 text-yellow-900 font-bold scale-105' : 'bg-white border-slate-300 text-slate-600'}`}>
                    <span>N: {item.node}</span>
                    <span>T: {item.time}</span>
                  </div>
                ))
              )}
            </div>
            <p className="text-[10px] text-slate-400 mt-1 text-center">Siempre saca al nodo con el menor tiempo (T).</p>
          </div>

          {/* Tabla de Resultados (Distancias) */}
          <div className="bg-white p-4 rounded-2xl shadow-md border border-slate-200">
            <h2 className="text-sm font-bold mb-2">⏱️ Récords de Tiempo por Nodo</h2>
            <div className="grid grid-cols-5 gap-1 text-center text-sm">
              {[1, 2, 3, 4, 5].map(n => (
                <div key={n} className="flex flex-col border rounded overflow-hidden">
                  <div className={`font-bold py-1 ${states[n] === 'visited' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-600'}`}>N{n}</div>
                  <div className={`py-1 bg-white font-mono ${distances[n] !== Infinity && phase !== 'setup' ? 'text-blue-600 font-bold' : 'text-slate-400'}`}>
                    {phase === 'setup' && n !== 1 ? '∞' : (distances[n] === Infinity ? '∞' : distances[n])}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Consola de Logs */}
          <div className="bg-slate-900 text-green-400 p-4 rounded-2xl shadow-lg flex-1 min-h-[200px] flex flex-col font-mono text-sm border-4 border-slate-800 relative">
            <div className="absolute top-0 left-0 w-full bg-slate-800 text-slate-300 text-xs py-1 px-3 font-sans font-bold">
              Consola del Router
            </div>
            <div className="flex-1 overflow-y-auto mt-4 flex flex-col justify-end gap-1.5">
              {logs.map((log, i) => (
                <p key={i} className={`leading-relaxed ${i === logs.length - 1 ? 'text-white font-bold' : 'opacity-60 text-xs'}`}>
                  {log}
                </p>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}