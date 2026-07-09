import React, { useState } from 'react';

// Estructura de nuestro árbol (El mismo ejemplo 1 de LeetCode)
const TREE_NODES = {
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

// Coordenadas fijas en porcentajes para dibujar el árbol fácilmente
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

const EDGES = [
  [3, 5], [3, 1], [5, 6], [5, 2],
  [1, 0], [1, 8], [2, 7], [2, 4]
];

export default function App() {
  const [p, setP] = useState(5);
  const [q, setQ] = useState(1);
  const [frames, setFrames] = useState([]);
  const [step, setStep] = useState(0);
  const [phase, setPhase] = useState('setup'); // setup, running, done
  const [logs, setLogs] = useState(["Elige dos nodos P y Q, y dale a 'Generar DFS'."]);

  const addLog = (msg) => setLogs(prev => [...prev, msg].slice(-5));

  // Motor DFS: Precalcula todos los pasos para la animación
  const generateFrames = (targetP, targetQ) => {
    let generatedFrames = [];
    
    // Estado inicial de todos los nodos ('idle', 'visiting', 'target', 'lca', 'done')
    let currentStates = {};
    Object.keys(TREE_NODES).forEach(key => currentStates[key] = 'idle');

    const pushFrame = (action, activeNode, logMsg) => {
      generatedFrames.push({
        states: { ...currentStates },
        action,
        activeNode,
        logMsg
      });
    };

    // La función recursiva exacta del algoritmo de LeetCode
    const dfs = (nodeVal) => {
      if (nodeVal === null) return null;

      currentStates[nodeVal] = 'visiting';
      pushFrame('visit', nodeVal, `🔍 Visitando nodo ${nodeVal}.`);

      // CASO BASE: Encontramos P o Q
      if (nodeVal === targetP || nodeVal === targetQ) {
        currentStates[nodeVal] = 'target';
        pushFrame('target', nodeVal, `🎯 ¡Encontramos a ${nodeVal}! Retorna ${nodeVal} hacia arriba.`);
        return nodeVal; // Importante: Ya no busca en sus hijos
      }

      const node = TREE_NODES[nodeVal];
      
      // Llamada recursiva izquierda
      const left = dfs(node.left);
      currentStates[nodeVal] = 'visiting'; // Recupera el foco
      pushFrame('receive', nodeVal, `⬅️ Nodo ${nodeVal} recibe '${left || 'null'}' de la izquierda.`);

      // Llamada recursiva derecha
      const right = dfs(node.right);
      currentStates[nodeVal] = 'visiting'; // Recupera el foco
      pushFrame('receive', nodeVal, `➡️ Nodo ${nodeVal} recibe '${right || 'null'}' de la derecha.`);

      // DECISIÓN: Si recibió algo de AMBOS lados, él es el LCA
      if (left !== null && right !== null) {
        currentStates[nodeVal] = 'lca';
        pushFrame('lca', nodeVal, `👑 ¡Nodo ${nodeVal} recibió de ambos lados! Es el Ancestor (LCA).`);
        return nodeVal;
      }

      // Si solo recibió de un lado, pasa esa respuesta hacia arriba
      const result = left !== null ? left : right;
      currentStates[nodeVal] = 'done';
      pushFrame('return', nodeVal, `⬆️ Nodo ${nodeVal} retorna '${result || 'null'}' hacia arriba.`);
      return result;
    };

    pushFrame('start', 3, `🚀 Iniciando DFS desde la raíz (3)...`);
    dfs(3);
    pushFrame('finish', null, `🏁 Búsqueda terminada.`);
    
    return generatedFrames;
  };

  const startSimulation = () => {
    if (p === q) {
      addLog("⚠️ Los nodos P y Q deben ser diferentes.");
      return;
    }
    const newFrames = generateFrames(Number(p), Number(q));
    setFrames(newFrames);
    setStep(0);
    setPhase('running');
    setLogs([`Iniciando búsqueda para p=${p}, q=${q}...`]);
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
    setLogs(["Simulación reiniciada. Elige nuevos nodos."]);
  };

  const currentFrame = frames[step] || { states: {} };
  const states = currentFrame.states || {};

  // Colores para los nodos según su estado
  const getNodeClasses = (nodeVal) => {
    let base = "absolute w-12 h-12 -ml-6 -mt-6 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-300 border-2 z-10 shadow-md ";
    const state = states[nodeVal] || 'idle';

    if (state === 'lca') return base + "bg-green-500 border-green-700 text-white shadow-[0_0_20px_rgba(34,197,94,0.8)] scale-125 z-30 animate-pulse";
    if (state === 'target') return base + "bg-blue-500 border-blue-700 text-white scale-110 z-20";
    if (state === 'visiting') return base + "bg-yellow-300 border-yellow-500 text-yellow-900 scale-110 z-20 shadow-[0_0_15px_rgba(253,224,71,0.8)]";
    if (state === 'done') return base + "bg-slate-200 border-slate-300 text-slate-400 opacity-60";
    
    // Si está en 'idle' y fue seleccionado en la configuración
    if (phase === 'setup' && (nodeVal == p || nodeVal == q)) return base + "bg-blue-100 border-blue-400 text-blue-700 ring-4 ring-blue-200";

    return base + "bg-white border-slate-300 text-slate-700";
  };

  const allNodes = Object.keys(TREE_NODES).map(Number).sort((a,b)=>a-b);

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-8 font-sans text-slate-800 flex flex-col items-center">
      <h1 className="text-2xl sm:text-3xl font-extrabold mb-6 flex items-center gap-2">
        🌳 Lowest Common Ancestor (LCA)
      </h1>

      <div className="flex flex-col lg:flex-row gap-6 w-full max-w-5xl">
        
        {/* Panel Izquierdo: Visualizador del Árbol */}
        <div className="flex-1 bg-white p-6 rounded-2xl shadow-lg border border-slate-200 flex flex-col">
          
          <div className="flex gap-4 mb-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-bold text-slate-600 mb-1">Nodo P:</label>
              <select value={p} onChange={(e) => setP(e.target.value)} disabled={phase !== 'setup'} className="w-full border-2 border-slate-300 rounded-lg px-3 py-2 font-bold focus:border-blue-500 outline-none">
                {allNodes.map(n => <option key={`p-${n}`} value={n}>{n}</option>)}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-bold text-slate-600 mb-1">Nodo Q:</label>
              <select value={q} onChange={(e) => setQ(e.target.value)} disabled={phase !== 'setup'} className="w-full border-2 border-slate-300 rounded-lg px-3 py-2 font-bold focus:border-blue-500 outline-none">
                {allNodes.map(n => <option key={`q-${n}`} value={n}>{n}</option>)}
              </select>
            </div>
          </div>

          {/* Contenedor del Árbol (Relative para posicionar hijos) */}
          <div className="relative w-full aspect-square bg-slate-100 rounded-xl border border-slate-200 mt-4 overflow-hidden">
            {/* SVG para las líneas (aristas) */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
              {EDGES.map(([u, v], idx) => (
                <line 
                  key={idx}
                  x1={`${LAYOUT[u].x}%`} y1={`${LAYOUT[u].y}%`}
                  x2={`${LAYOUT[v].x}%`} y2={`${LAYOUT[v].y}%`}
                  stroke="#cbd5e1" // slate-300
                  strokeWidth="3"
                />
              ))}
            </svg>

            {/* Nodos superpuestos */}
            {Object.keys(LAYOUT).map((nodeVal) => (
              <div 
                key={nodeVal}
                className={getNodeClasses(nodeVal)}
                style={{ left: `${LAYOUT[nodeVal].x}%`, top: `${LAYOUT[nodeVal].y}%` }}
              >
                {nodeVal}
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-col gap-3">
            {phase === 'setup' && (
              <button onClick={startSimulation} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-md transition-transform hover:-translate-y-0.5">
                1. Generar Búsqueda Recursiva
              </button>
            )}
            
            {(phase === 'running' || phase === 'done') && (
              <button onClick={nextStep} disabled={phase === 'done'} className={`font-bold py-3 rounded-xl shadow-lg transition-transform flex items-center justify-center gap-2 ${phase === 'done' ? 'bg-slate-300 text-slate-500' : 'bg-green-600 hover:bg-green-700 text-white hover:-translate-y-0.5'}`}>
                {phase === 'done' ? '🏁 Búsqueda Finalizada' : '2. Avanzar 1 Paso (Call Stack) 👣'}
              </button>
            )}

            <button onClick={reset} className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2 rounded-xl border border-slate-300">
              🔄 Elegir otros nodos
            </button>
          </div>
        </div>

        {/* Panel Derecho: Consola y Reglas */}
        <div className="flex-1 flex flex-col gap-6">
          
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200">
            <h2 className="text-lg font-bold mb-3">Las 3 Reglas del LCA</h2>
            <ul className="text-sm text-slate-600 space-y-2">
              <li><strong className="text-yellow-600">🟡 DFS (Recursión):</strong> Bajamos hasta el fondo (o hasta encontrar a P o Q) y luego pasamos las respuestas hacia arriba.</li>
              <li><strong className="text-blue-600">🔵 Retorno Temprano:</strong> Si un nodo es igual a P o Q, se retorna a sí mismo inmediatamente. ¡Ya no busca en sus hijos!</li>
              <li><strong className="text-green-600">🟢 El Ancestor:</strong> El primer nodo que recibe respuestas válidas (no nulas) de <strong>ambos</strong> hijos es el LCA.</li>
            </ul>
          </div>

          {/* Consola de Logs */}
          <div className="bg-slate-900 text-green-400 p-6 rounded-2xl shadow-lg flex-1 min-h-[300px] flex flex-col font-mono text-sm border-4 border-slate-800 relative">
            <div className="absolute top-0 left-0 w-full bg-slate-800 text-slate-300 text-xs py-1.5 px-4 font-sans font-bold shadow-sm">
              Terminal (Call Stack)
            </div>
            <div className="flex-1 overflow-y-auto mt-6 flex flex-col justify-end gap-2">
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