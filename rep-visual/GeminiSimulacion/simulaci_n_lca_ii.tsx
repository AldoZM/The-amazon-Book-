import React, { useState } from 'react';

// Estructura del árbol
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

// Coordenadas fijas
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
  const [q, setQ] = useState(99); // 99 es nuestro nodo trampa
  const [frames, setFrames] = useState([]);
  const [step, setStep] = useState(0);
  const [phase, setPhase] = useState('setup');
  const [logs, setLogs] = useState(["Elige dos nodos. ¡Prueba elegir el Nodo 99 que no existe!"]);
  const [nodesFound, setNodesFound] = useState(0); // Contador visual

  const addLog = (msg) => setLogs(prev => [...prev, msg].slice(-5));

  const generateFrames = (targetP, targetQ) => {
    let generatedFrames = [];
    let currentStates = {};
    Object.keys(TREE_NODES).forEach(key => currentStates[key] = 'idle');
    let foundCount = 0;

    const pushFrame = (action, activeNode, logMsg) => {
      generatedFrames.push({
        states: { ...currentStates },
        action,
        activeNode,
        logMsg,
        foundCount
      });
    };

    // EL MOTOR DE LCA II (Sin retorno temprano)
    const dfs = (nodeVal) => {
      if (nodeVal === null) return null;

      currentStates[nodeVal] = 'visiting';
      pushFrame('visit', nodeVal, `🔍 Visitando nodo ${nodeVal}.`);

      // 🔴 ¡LA DIFERENCIA! Primero exploramos a fondo (Post-order), NO retornamos aún si encontramos el nodo
      const node = TREE_NODES[nodeVal];
      
      const left = dfs(node.left);
      if(left !== null) currentStates[nodeVal] = 'visiting'; // Recupera el foco
      
      const right = dfs(node.right);
      if(right !== null) currentStates[nodeVal] = 'visiting'; // Recupera el foco

      // AHORA SÍ, nos evaluamos a nosotros mismos
      let isTarget = false;
      if (nodeVal === targetP || nodeVal === targetQ) {
        foundCount++;
        isTarget = true;
        currentStates[nodeVal] = 'target';
        pushFrame('target', nodeVal, `🎯 Encontramos a ${nodeVal}! Llevamos ${foundCount}/2. ⚠️ Nota que NO retornamos temprano.`);
      }

      // Decisión del LCA
      if (left !== null && right !== null) {
        currentStates[nodeVal] = 'lca_candidate'; // Puede que no sea el real si falta el otro
        pushFrame('lca', nodeVal, `👑 Nodo ${nodeVal} recibió de ambos lados. Es candidato a LCA.`);
        return nodeVal;
      }

      const result = isTarget ? nodeVal : (left !== null ? left : right);
      currentStates[nodeVal] = 'done';
      pushFrame('return', nodeVal, `⬆️ Nodo ${nodeVal} retorna '${result || 'null'}' hacia arriba.`);
      return result;
    };

    pushFrame('start', 3, `🚀 Iniciando DFS... ¡Recorreremos TODO el árbol!`);
    const candidate = dfs(3);
    
    // Verificación final
    if (foundCount === 2) {
      pushFrame('finish', candidate, `✅ Los 2 nodos existen. El LCA definitivo es ${candidate}.`);
      currentStates[candidate] = 'lca_final';
    } else {
      pushFrame('finish', null, `❌ Solo encontramos ${foundCount} nodo(s). El otro no existe. El resultado es NULL.`);
    }
    // Empujar el frame final con el estado corregido
    generatedFrames[generatedFrames.length-1].states = {...currentStates};
    
    return generatedFrames;
  };

  const startSimulation = () => {
    if (p === q) {
      addLog("⚠️ P y Q deben ser diferentes.");
      return;
    }
    const newFrames = generateFrames(Number(p), Number(q));
    setFrames(newFrames);
    setStep(0);
    setNodesFound(0);
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
    setNodesFound(nextFrame.foundCount);
    if (nextFrame.logMsg) addLog(`> ${nextFrame.logMsg}`);
  };

  const reset = () => {
    setFrames([]);
    setStep(0);
    setNodesFound(0);
    setPhase('setup');
    setLogs(["Simulación reiniciada. ¡Intenta el caso del Nodo 99!"]);
  };

  const currentFrame = frames[step] || { states: {} };
  const states = currentFrame.states || {};

  const getNodeClasses = (nodeVal) => {
    let base = "absolute w-12 h-12 -ml-6 -mt-6 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-300 border-2 z-10 shadow-md ";
    const state = states[nodeVal] || 'idle';

    if (state === 'lca_final') return base + "bg-green-500 border-green-700 text-white shadow-[0_0_20px_rgba(34,197,94,0.8)] scale-125 z-30 animate-pulse";
    if (state === 'lca_candidate') return base + "bg-yellow-500 border-yellow-700 text-white scale-110 z-20";
    if (state === 'target') return base + "bg-blue-500 border-blue-700 text-white scale-110 z-20 ring-4 ring-blue-300";
    if (state === 'visiting') return base + "bg-yellow-300 border-yellow-500 text-yellow-900 scale-110 z-20 shadow-[0_0_15px_rgba(253,224,71,0.8)]";
    if (state === 'done') return base + "bg-slate-200 border-slate-300 text-slate-400 opacity-60";
    
    if (phase === 'setup' && (nodeVal == p || nodeVal == q)) return base + "bg-blue-100 border-blue-400 text-blue-700 ring-4 ring-blue-200";

    return base + "bg-white border-slate-300 text-slate-700";
  };

  const allNodes = Object.keys(TREE_NODES).map(Number).sort((a,b)=>a-b);

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-8 font-sans text-slate-800 flex flex-col items-center">
      <h1 className="text-2xl sm:text-3xl font-extrabold mb-6 flex items-center gap-2">
        🌳 LCA II (Post-Order)
      </h1>

      <div className="flex flex-col lg:flex-row gap-6 w-full max-w-5xl">
        
        {/* Panel Izquierdo: Visualizador */}
        <div className="flex-1 bg-white p-6 rounded-2xl shadow-lg border border-slate-200 flex flex-col">
          
          <div className="flex gap-4 mb-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-bold text-slate-600 mb-1">Nodo P:</label>
              <select value={p} onChange={(e) => setP(e.target.value)} disabled={phase !== 'setup'} className="w-full border-2 border-slate-300 rounded-lg px-3 py-2 font-bold focus:border-blue-500 outline-none">
                {allNodes.map(n => <option key={`p-${n}`} value={n}>{n}</option>)}
                <option value={99} className="text-red-500 font-bold bg-red-50">99 (No existe)</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-bold text-slate-600 mb-1">Nodo Q:</label>
              <select value={q} onChange={(e) => setQ(e.target.value)} disabled={phase !== 'setup'} className="w-full border-2 border-slate-300 rounded-lg px-3 py-2 font-bold focus:border-blue-500 outline-none">
                {allNodes.map(n => <option key={`q-${n}`} value={n}>{n}</option>)}
                <option value={99} className="text-red-500 font-bold bg-red-50">99 (No existe)</option>
              </select>
            </div>
          </div>

          <div className="relative w-full aspect-square bg-slate-100 rounded-xl border border-slate-200 mt-4 overflow-hidden">
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
              {EDGES.map(([u, v], idx) => (
                <line key={idx} x1={`${LAYOUT[u].x}%`} y1={`${LAYOUT[u].y}%`} x2={`${LAYOUT[v].x}%`} y2={`${LAYOUT[v].y}%`} stroke="#cbd5e1" strokeWidth="3" />
              ))}
            </svg>
            {Object.keys(LAYOUT).map((nodeVal) => (
              <div key={nodeVal} className={getNodeClasses(nodeVal)} style={{ left: `${LAYOUT[nodeVal].x}%`, top: `${LAYOUT[nodeVal].y}%` }}>
                {nodeVal}
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-col gap-3">
            {phase === 'setup' && (
              <button onClick={startSimulation} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-md transition-transform hover:-translate-y-0.5">
                1. Generar Búsqueda Post-Order
              </button>
            )}
            
            {(phase === 'running' || phase === 'done') && (
              <button onClick={nextStep} disabled={phase === 'done'} className={`font-bold py-3 rounded-xl shadow-lg transition-transform flex items-center justify-center gap-2 ${phase === 'done' ? 'bg-slate-300 text-slate-500' : 'bg-green-600 hover:bg-green-700 text-white hover:-translate-y-0.5'}`}>
                {phase === 'done' ? '🏁 Búsqueda Finalizada' : '2. Avanzar (Call Stack) 👣'}
              </button>
            )}
            <button onClick={reset} className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2 rounded-xl border border-slate-300">
              🔄 Reiniciar
            </button>
          </div>
        </div>

        {/* Panel Derecho: Estado y Reglas */}
        <div className="flex-1 flex flex-col gap-4">
          
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200">
            <h2 className="text-lg font-bold mb-2">Progreso (Nodos encontrados)</h2>
            <div className="flex gap-4 items-center">
              <div className={`flex-1 py-3 text-center rounded-lg font-bold text-lg border-2 ${nodesFound >= 1 ? 'bg-blue-100 border-blue-500 text-blue-700' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
                1 / 2
              </div>
              <div className={`flex-1 py-3 text-center rounded-lg font-bold text-lg border-2 ${nodesFound >= 2 ? 'bg-blue-100 border-blue-500 text-blue-700' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
                2 / 2
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-3">⚠️ Si no llegamos a 2/2 al final, el resultado debe ser NULL.</p>
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