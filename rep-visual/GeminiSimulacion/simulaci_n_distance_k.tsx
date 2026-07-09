import React, { useState } from 'react';

// Estructura del árbol (El ejemplo clásico de LeetCode)
const INITIAL_TREE = {
  3: { left: 5, right: 1 },
  5: { left: 6, right: 2 },
  1: { left: 0, right: 8 },
  6: { left: null, right: null },
  2: { left: 7, right: 4 },
  0: { left: null, right: null },
  8: { left: null, right: null },
  7: { left: null, right: null },
  4: { left: null, right: null }
};

// Coordenadas fijas para dibujar el árbol
const LAYOUT = {
  3: { x: 50, y: 10 },
  5: { x: 25, y: 35 },
  1: { x: 75, y: 35 },
  6: { x: 12, y: 65 },
  2: { x: 38, y: 65 },
  0: { x: 62, y: 65 },
  8: { x: 88, y: 65 },
  7: { x: 28, y: 90 },
  4: { x: 48, y: 90 }
};

const DOWN_EDGES = [
  [3, 5], [3, 1], [5, 6], [5, 2],
  [1, 0], [1, 8], [2, 7], [2, 4]
];

export default function App() {
  const [target, setTarget] = useState(5);
  const [k, setK] = useState(2);
  
  const [frames, setFrames] = useState([]);
  const [step, setStep] = useState(0);
  const [phase, setPhase] = useState('setup'); // setup, graph_ready, running, done
  const [logs, setLogs] = useState(["Elige tu nodo Target y la distancia K."]);
  const [queue, setQueue] = useState([]);

  const addLog = (msg) => setLogs(prev => [...prev, msg].slice(-5));

  // Genera la animación del BFS
  const generateBFSFrames = () => {
    let generatedFrames = [];
    let currentStates = {};
    Object.keys(INITIAL_TREE).forEach(key => currentStates[key] = 'idle');
    
    // Nuestro "grafo" temporal con punteros al padre
    let graph = JSON.parse(JSON.stringify(INITIAL_TREE));
    
    // 1. FASE DFS (Silenciosa en el código, pero vital)
    const dfsParents = (nodeVal, parentVal) => {
      if (nodeVal === null) return;
      graph[nodeVal].parent = parentVal;
      dfsParents(graph[nodeVal].left, nodeVal);
      dfsParents(graph[nodeVal].right, nodeVal);
    };
    dfsParents(3, null); // 3 es la raíz

    // 2. FASE BFS
    let q = [{ node: Number(target), dist: 0 }];
    let visited = new Set([Number(target)]);
    
    currentStates[target] = 'target';

    const pushFrame = (action, currQ, logMsg) => {
      generatedFrames.push({
        states: { ...currentStates },
        queue: [...currQ],
        logMsg
      });
    };

    pushFrame('start', q, `🚀 Iniciando BFS desde el Target (${target}). Distancia actual: 0.`);

    let results = [];

    while (q.length > 0) {
      // Tomamos una foto de la cola antes de procesar el nodo actual
      let currentQ = [...q];
      const { node, dist } = q.shift();
      
      if (dist === k) {
        currentStates[node] = 'result';
        results.push(node);
        pushFrame('found', q, `🎉 ¡Distancia ${k} alcanzada! Nodo ${node} es parte de la respuesta.`);
        continue; // Ya no seguimos explorando desde aquí (dist > k)
      }

      currentStates[node] = 'visiting';
      pushFrame('visit', currentQ, `🔍 Visitando nodo ${node} (Distancia ${dist}). Buscando vecinos...`);

      let added = 0;
      // Exploramos las 3 direcciones (Izquierda, Derecha, Arriba)
      const neighbors = [graph[node].left, graph[node].right, graph[node].parent];
      
      for (let neighbor of neighbors) {
        if (neighbor !== null && !visited.has(neighbor)) {
          visited.add(neighbor);
          q.push({ node: neighbor, dist: dist + 1 });
          if (currentStates[neighbor] !== 'result') {
            currentStates[neighbor] = 'queued'; // Para que se vea en espera
          }
          added++;
        }
      }

      currentStates[node] = 'visited'; // Terminamos con él
      if (added > 0) {
        pushFrame('enqueued', q, `👉 Se encontraron ${added} vecinos válidos. Entran a la cola (Dist ${dist + 1}).`);
      }
    }

    pushFrame('finish', [], `🏁 Búsqueda terminada. Resultados finales: [${results.join(', ')}]`);
    return generatedFrames;
  };

  const transformToGraph = () => {
    setPhase('graph_ready');
    addLog("✅ FASE 1: DFS Completo. Se agregaron punteros 'Arriba' (Líneas rojas). ¡Ahora es un grafo!");
  };

  const startBFS = () => {
    const newFrames = generateBFSFrames();
    setFrames(newFrames);
    setStep(0);
    setPhase('running');
    setQueue(newFrames[0].queue);
  };

  const nextStep = () => {
    if (step >= frames.length - 1) {
      setPhase('done');
      return;
    }
    const nextFrame = frames[step + 1];
    setStep(step + 1);
    setQueue(nextFrame.queue);
    if (nextFrame.logMsg) addLog(`> ${nextFrame.logMsg}`);
  };

  const reset = () => {
    setFrames([]);
    setStep(0);
    setPhase('setup');
    setQueue([]);
    setLogs(["Simulación reiniciada. Elige nuevos valores."]);
  };

  const currentFrame = frames[step] || { states: {} };
  const states = phase === 'setup' || phase === 'graph_ready' ? {} : currentFrame.states;

  const getNodeClasses = (nodeVal) => {
    let base = "absolute w-12 h-12 -ml-6 -mt-6 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-300 border-2 z-20 shadow-md ";
    const state = states[nodeVal] || 'idle';

    if (state === 'result') return base + "bg-green-500 border-green-700 text-white shadow-[0_0_20px_rgba(34,197,94,0.8)] scale-125 z-30 animate-pulse";
    if (state === 'target') return base + "bg-blue-500 border-blue-700 text-white scale-110 z-20 ring-4 ring-blue-300 shadow-[0_0_15px_rgba(59,130,246,0.8)]";
    if (state === 'visiting') return base + "bg-yellow-400 border-yellow-600 text-yellow-900 scale-110 z-20";
    if (state === 'queued') return base + "bg-cyan-200 border-cyan-400 text-slate-800 scale-105 z-20";
    if (state === 'visited') return base + "bg-slate-200 border-slate-300 text-slate-400 opacity-60";
    
    if ((phase === 'setup' || phase === 'graph_ready') && nodeVal == target) return base + "bg-blue-100 border-blue-400 text-blue-700 ring-4 ring-blue-200";

    return base + "bg-white border-slate-300 text-slate-700";
  };

  const allNodes = Object.keys(INITIAL_TREE).map(Number).sort((a,b)=>a-b);

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-8 font-sans text-slate-800 flex flex-col items-center">
      <h1 className="text-2xl sm:text-3xl font-extrabold mb-6 flex items-center gap-2">
        🌲 All Nodes Distance K
      </h1>

      <div className="flex flex-col lg:flex-row gap-6 w-full max-w-5xl">
        
        {/* Panel Izquierdo: Visualizador */}
        <div className="flex-1 bg-white p-6 rounded-2xl shadow-lg border border-slate-200 flex flex-col">
          
          <div className="flex gap-4 mb-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-bold text-slate-600 mb-1">🎯 Target:</label>
              <select value={target} onChange={(e) => setTarget(e.target.value)} disabled={phase !== 'setup'} className="w-full border-2 border-slate-300 rounded-lg px-3 py-2 font-bold focus:border-blue-500 outline-none">
                {allNodes.map(n => <option key={`target-${n}`} value={n}>{n}</option>)}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-bold text-slate-600 mb-1">📏 Distancia K:</label>
              <input type="number" min="0" max="4" value={k} onChange={(e) => setK(Number(e.target.value))} disabled={phase !== 'setup'} className="w-full border-2 border-slate-300 rounded-lg px-3 py-2 font-bold focus:border-blue-500 outline-none"/>
            </div>
          </div>

          <div className="relative w-full aspect-square bg-slate-100 rounded-xl border border-slate-200 mt-4 overflow-hidden">
            {/* Aristas Hacia Abajo (Normales) */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
              {DOWN_EDGES.map(([u, v], idx) => (
                <line key={`down-${idx}`} x1={`${LAYOUT[u].x}%`} y1={`${LAYOUT[u].y}%`} x2={`${LAYOUT[v].x}%`} y2={`${LAYOUT[v].y}%`} stroke="#cbd5e1" strokeWidth="3" />
              ))}
              
              {/* Aristas Hacia Arriba (Padres - Punteadas rojas) */}
              {phase !== 'setup' && DOWN_EDGES.map(([u, v], idx) => (
                <line key={`up-${idx}`} x1={`${LAYOUT[v].x}%`} y1={`${LAYOUT[v].y}%`} x2={`${LAYOUT[u].x}%`} y2={`${LAYOUT[u].y}%`} stroke="#ef4444" strokeWidth="2" strokeDasharray="5,5" className="animate-pulse" />
              ))}
            </svg>
            
            {/* Nodos */}
            {Object.keys(LAYOUT).map((nodeVal) => (
              <div key={nodeVal} className={getNodeClasses(nodeVal)} style={{ left: `${LAYOUT[nodeVal].x}%`, top: `${LAYOUT[nodeVal].y}%` }}>
                {nodeVal}
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-col gap-3">
            {phase === 'setup' && (
              <button onClick={transformToGraph} className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-xl shadow-md transition-transform hover:-translate-y-0.5">
                1. Fase 1: Mapear Padres (Crear Grafo) ⬆️
              </button>
            )}
            
            {phase === 'graph_ready' && (
              <button onClick={startBFS} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-md transition-transform hover:-translate-y-0.5 animate-pulse">
                2. Fase 2: Iniciar BFS desde Target 🌊
              </button>
            )}

            {(phase === 'running' || phase === 'done') && (
              <button onClick={nextStep} disabled={phase === 'done'} className={`font-bold py-3 rounded-xl shadow-lg transition-transform flex items-center justify-center gap-2 ${phase === 'done' ? 'bg-slate-300 text-slate-500' : 'bg-green-600 hover:bg-green-700 text-white hover:-translate-y-0.5'}`}>
                {phase === 'done' ? '🏁 Búsqueda Finalizada' : '3. Avanzar BFS (Procesar Cola) 👣'}
              </button>
            )}

            <button onClick={reset} className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2 rounded-xl border border-slate-300">
              🔄 Reiniciar
            </button>
          </div>
        </div>

        {/* Panel Derecho: Consola y Cola */}
        <div className="flex-1 flex flex-col gap-4">
          
          {/* Cola del BFS */}
          <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-200">
            <h2 className="text-lg font-bold mb-1">📥 Cola del BFS (Queue)</h2>
            <p className="text-xs text-slate-500 mb-4">El BFS procesa el nodo de la izquierda.</p>
            <div className="flex gap-2 overflow-x-auto py-2 items-center min-h-[4rem]">
              {queue.length === 0 ? (
                <span className="text-slate-400 italic text-sm w-full text-center">La cola está vacía</span>
              ) : (
                queue.map((item, idx) => (
                  <div key={idx} className={`flex-shrink-0 px-3 py-1.5 rounded-lg border text-sm flex flex-col items-center ${idx === 0 ? 'bg-blue-100 border-blue-400 text-blue-800 font-bold scale-105 shadow-sm' : 'bg-cyan-50 border-cyan-200 text-slate-600'}`}>
                    <span>Nodo {item.node}</span>
                    <span className="text-xs opacity-75">Dist: {item.dist}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Consola de Logs */}
          <div className="bg-slate-900 text-green-400 p-6 rounded-2xl shadow-lg flex-1 min-h-[300px] flex flex-col font-mono text-sm border-4 border-slate-800 relative">
            <div className="absolute top-0 left-0 w-full bg-slate-800 text-slate-300 text-xs py-1.5 px-4 font-sans font-bold shadow-sm">
              Terminal de Ejecución
            </div>
            <div className="flex-1 overflow-y-auto mt-4 flex flex-col justify-end gap-2">
              {logs.map((log, i) => (
                <p key={i} className={`leading-relaxed ${i === logs.length - 1 ? 'text-white font-bold' : 'opacity-60'}`}>
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