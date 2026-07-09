import React, { useState } from 'react';

// Coordenadas fijas para el ejemplo clásico de LeetCode
const LAYOUT = {
  'hit': { x: 50, y: 10, level: 0 },
  'hot': { x: 50, y: 30, level: 1 },
  'dot': { x: 25, y: 55, level: 2 },
  'lot': { x: 75, y: 55, level: 2 },
  'dog': { x: 25, y: 80, level: 3 },
  'log': { x: 75, y: 80, level: 3 },
  'cog': { x: 50, y: 95, level: 4 }
};

export default function App() {
  const [frames, setFrames] = useState([]);
  const [step, setStep] = useState(0);
  const [phase, setPhase] = useState('setup'); // setup, bfs, dfs, done
  const [logs, setLogs] = useState(["Elige 'Iniciar BFS' para empezar a construir el grafo de caminos más cortos."]);
  
  const addLog = (msg) => setLogs(prev => [...prev, msg].slice(-5));

  // Genera todos los frames (BFS + DFS) para la animación
  const generateFrames = () => {
    let generated = [];
    let currentStates = {};
    Object.keys(LAYOUT).forEach(w => currentStates[w] = 'idle');
    let edges = [];
    let allPaths = [];
    let currentDfsPath = [];

    const pushFrame = (action, phaseName, logMsg) => {
      generated.push({
        states: { ...currentStates },
        edges: [...edges],
        phaseName,
        action,
        allPaths: [...allPaths],
        currentDfsPath: [...currentDfsPath],
        logMsg
      });
    };

    pushFrame('start', 'bfs', `🚀 FASE 1 (BFS): Empezamos en 'hit' buscando nivel por nivel.`);

    // --- SIMULACIÓN HARDCODED FASE 1 (BFS) ---
    // Nivel 0 -> 1
    currentStates['hit'] = 'visited';
    currentStates['hot'] = 'visiting';
    edges.push({u: 'hit', v: 'hot'});
    pushFrame('bfs_step', 'bfs', `🌊 Nivel 1: Cambiamos 'i' por 'o'. Encontramos 'hot'. Añadimos arista hit -> hot.`);
    
    // Nivel 1 -> 2
    currentStates['hot'] = 'visited';
    currentStates['dot'] = 'visiting';
    currentStates['lot'] = 'visiting';
    edges.push({u: 'hot', v: 'dot'});
    edges.push({u: 'hot', v: 'lot'});
    pushFrame('bfs_step', 'bfs', `🌊 Nivel 2: Desde 'hot' generamos 'dot' y 'lot'. Añadimos aristas.`);

    // Nivel 2 -> 3
    currentStates['dot'] = 'visited';
    currentStates['lot'] = 'visited';
    currentStates['dog'] = 'visiting';
    currentStates['log'] = 'visiting';
    edges.push({u: 'dot', v: 'dog'});
    edges.push({u: 'lot', v: 'log'});
    pushFrame('bfs_step', 'bfs', `🌊 Nivel 3: 'dot' conecta con 'dog'. 'lot' conecta con 'log'.`);

    // Nivel 3 -> 4
    currentStates['dog'] = 'visited';
    currentStates['log'] = 'visited';
    currentStates['cog'] = 'target';
    edges.push({u: 'dog', v: 'cog'});
    edges.push({u: 'log', v: 'cog'});
    pushFrame('bfs_done', 'bfs', `🎯 Nivel 4: ¡Ambos caminos llegan a 'cog'! Grafo dirigido construido. BFS terminado.`);

    // Limpiar estados visuales para DFS
    Object.keys(LAYOUT).forEach(w => currentStates[w] = 'idle');
    currentStates['hit'] = 'path';
    currentStates['cog'] = 'target_idle';
    pushFrame('dfs_start', 'dfs', `🕵️‍♂️ FASE 2 (DFS): Ahora recorreremos las flechas desde 'hit' usando Backtracking.`);

    // --- SIMULACIÓN HARDCODED FASE 2 (DFS) ---
    // Camino 1
    currentDfsPath = ['hit', 'hot'];
    currentStates['hot'] = 'path';
    pushFrame('dfs_step', 'dfs', `👣 DFS avanza a 'hot'. Ruta: [hit, hot]`);

    currentDfsPath.push('dot');
    currentStates['dot'] = 'path';
    pushFrame('dfs_step', 'dfs', `👣 DFS avanza a 'dot'. Ruta: [hit, hot, dot]`);

    currentDfsPath.push('dog');
    currentStates['dog'] = 'path';
    pushFrame('dfs_step', 'dfs', `👣 DFS avanza a 'dog'. Ruta: [hit, hot, dot, dog]`);

    currentDfsPath.push('cog');
    currentStates['cog'] = 'path_target';
    allPaths.push(['hit', 'hot', 'dot', 'dog', 'cog']);
    pushFrame('dfs_found', 'dfs', `✅ ¡Llegamos a 'cog'! Guardamos este camino completo.`);

    // Backtracking
    currentStates['cog'] = 'target_idle';
    currentStates['dog'] = 'idle';
    currentDfsPath.pop(); // saca cog
    currentDfsPath.pop(); // saca dog
    pushFrame('backtrack', 'dfs', `🔙 BACKTRACK: Retrocedemos borrando 'cog' y 'dog' para explorar la otra rama.`);

    // Camino 2
    currentStates['dot'] = 'idle';
    currentDfsPath.pop(); // saca dot
    currentStates['lot'] = 'path';
    currentDfsPath.push('lot');
    pushFrame('dfs_step', 'dfs', `👣 DFS explora la otra opción desde 'hot': Avanza a 'lot'.`);

    currentStates['log'] = 'path';
    currentDfsPath.push('log');
    pushFrame('dfs_step', 'dfs', `👣 DFS avanza a 'log'. Ruta: [hit, hot, lot, log]`);

    currentStates['cog'] = 'path_target';
    currentDfsPath.push('cog');
    allPaths.push(['hit', 'hot', 'lot', 'log', 'cog']);
    pushFrame('dfs_found', 'dfs', `✅ ¡Llegamos a 'cog'! Guardamos el segundo camino.`);

    // Finish
    currentStates['cog'] = 'target_idle';
    currentStates['log'] = 'idle';
    currentStates['lot'] = 'idle';
    currentStates['hot'] = 'idle';
    currentStates['hit'] = 'idle';
    currentDfsPath = [];
    pushFrame('done', 'done', `🏁 ¡Terminamos! Hemos extraído todas las rutas más cortas.`);

    return generated;
  };

  const startSimulation = () => {
    const newFrames = generateFrames();
    setFrames(newFrames);
    setStep(0);
    setPhase('running');
  };

  const nextStep = () => {
    if (step >= frames.length - 1) return;
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

  const currentFrame = frames[step] || { states: {}, edges: [], allPaths: [], currentDfsPath: [], phaseName: 'setup' };
  const { states, edges, allPaths, currentDfsPath, phaseName } = currentFrame;

  const getWordClasses = (word) => {
    let base = "absolute px-3 py-1.5 -ml-8 -mt-4 rounded-lg font-bold border-2 transition-all duration-300 shadow-md text-sm text-center w-16 ";
    const state = states[word] || (word === 'hit' ? 'start_idle' : (word === 'cog' ? 'target_idle' : 'idle'));

    // Estilos del BFS
    if (state === 'visiting') return base + "bg-cyan-200 border-cyan-400 text-cyan-900 scale-110 z-20 animate-pulse";
    if (state === 'visited') return base + "bg-blue-100 border-blue-300 text-blue-700 z-10";
    if (state === 'target') return base + "bg-green-400 border-green-600 text-white scale-110 z-20 shadow-[0_0_15px_rgba(34,197,94,0.8)]";
    
    // Estilos del DFS
    if (state === 'path') return base + "bg-yellow-300 border-yellow-500 text-yellow-900 scale-110 z-30 shadow-lg";
    if (state === 'path_target') return base + "bg-green-500 border-green-700 text-white scale-125 z-30 shadow-[0_0_20px_rgba(34,197,94,0.8)] animate-bounce";
    
    // Idle states
    if (state === 'start_idle' || word === 'hit') return base + "bg-slate-800 border-slate-900 text-white";
    if (state === 'target_idle' || word === 'cog') return base + "bg-emerald-100 border-emerald-400 text-emerald-800 border-dashed";
    
    return base + "bg-white border-slate-300 text-slate-500";
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-8 font-sans text-slate-800 flex flex-col items-center">
      <h1 className="text-2xl sm:text-3xl font-extrabold mb-6 flex items-center gap-2">
        🪜 Word Ladder II (BFS + DFS)
      </h1>

      <div className="flex flex-col lg:flex-row gap-6 w-full max-w-5xl">
        
        {/* Panel Izquierdo: Grafo de Palabras */}
        <div className="flex-[3] bg-white p-6 rounded-2xl shadow-lg border border-slate-200 flex flex-col">
          
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold">Grafo de Transformaciones</h2>
            <div className="flex gap-2 text-xs font-bold">
              <span className={`px-2 py-1 rounded ${phaseName === 'bfs' ? 'bg-cyan-100 text-cyan-800 ring-2 ring-cyan-400' : 'bg-slate-100 text-slate-400'}`}>1. Construir (BFS)</span>
              <span className={`px-2 py-1 rounded ${phaseName === 'dfs' ? 'bg-yellow-100 text-yellow-800 ring-2 ring-yellow-400' : 'bg-slate-100 text-slate-400'}`}>2. Extraer (DFS)</span>
            </div>
          </div>

          <div className="relative w-full h-[450px] bg-slate-50 rounded-xl border border-slate-200 overflow-hidden shadow-inner">
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
              <defs>
                <marker id="arrow" markerWidth="8" markerHeight="6" refX="28" refY="3" orient="auto">
                  <polygon points="0 0, 8 3, 0 6" fill="#94a3b8" />
                </marker>
                <marker id="arrow-active" markerWidth="8" markerHeight="6" refX="28" refY="3" orient="auto">
                  <polygon points="0 0, 8 3, 0 6" fill="#eab308" />
                </marker>
              </defs>
              
              {edges.map((edge, idx) => {
                const u = LAYOUT[edge.u];
                const v = LAYOUT[edge.v];
                // Checar si la arista está activa en el DFS actual
                const isActiveDFS = phaseName === 'dfs' && currentDfsPath.includes(edge.u) && currentDfsPath.includes(edge.v) && currentDfsPath.indexOf(edge.v) === currentDfsPath.indexOf(edge.u) + 1;
                
                return (
                  <line 
                    key={idx}
                    x1={`${u.x}%`} y1={`${u.y}%`}
                    x2={`${v.x}%`} y2={`${v.y}%`}
                    stroke={isActiveDFS ? "#eab308" : "#cbd5e1"}
                    strokeWidth={isActiveDFS ? "4" : "2"}
                    markerEnd={isActiveDFS ? "url(#arrow-active)" : "url(#arrow)"}
                    className={isActiveDFS ? "animate-pulse" : ""}
                  />
                );
              })}
            </svg>

            {Object.keys(LAYOUT).map((word) => (
              <div 
                key={word} 
                className={getWordClasses(word)} 
                style={{ left: `${LAYOUT[word].x}%`, top: `${LAYOUT[word].y}%` }}
              >
                {word}
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            {phase === 'setup' && (
              <button onClick={startSimulation} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-md transition-transform hover:-translate-y-0.5">
                Empezar Simulación 🚀
              </button>
            )}
            
            {(phase === 'running' || phase === 'done') && (
              <button onClick={nextStep} disabled={phaseName === 'done'} className={`flex-1 font-bold py-3 rounded-xl shadow-lg transition-transform flex items-center justify-center gap-2 ${phaseName === 'done' ? 'bg-slate-300 text-slate-500' : 'bg-green-600 hover:bg-green-700 text-white hover:-translate-y-0.5'}`}>
                {phaseName === 'done' ? '🏁 Terminado' : 'Avanzar Paso 👣'}
              </button>
            )}

            <button onClick={reset} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2 rounded-xl border border-slate-300">
              🔄 Reiniciar
            </button>
          </div>
        </div>

        {/* Panel Derecho: Estado y Resultados */}
        <div className="flex-[2] flex flex-col gap-4">
          
          {/* Tracking del DFS actual */}
          <div className="bg-white p-4 rounded-2xl shadow-md border border-slate-200 h-32 flex flex-col">
            <h2 className="text-sm font-bold mb-2 text-yellow-600 flex items-center gap-2">
              <span>🕵️‍♂️ Ruta actual (DFS Backtracking)</span>
            </h2>
            <div className="flex flex-wrap gap-1 items-center">
              {currentDfsPath.length === 0 ? (
                <span className="text-slate-400 italic text-xs">Esperando a la Fase 2...</span>
              ) : (
                currentDfsPath.map((w, idx) => (
                  <React.Fragment key={idx}>
                    <span className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-2 py-1 rounded text-xs font-bold shadow-sm">{w}</span>
                    {idx < currentDfsPath.length - 1 && <span className="text-yellow-400 font-bold text-xs">→</span>}
                  </React.Fragment>
                ))
              )}
            </div>
          </div>

          {/* Rutas Encontradas */}
          <div className="bg-white p-4 rounded-2xl shadow-md border border-slate-200 flex-1 flex flex-col">
            <h2 className="text-sm font-bold mb-2 text-green-600">✅ Rutas más cortas encontradas</h2>
            <div className="flex-1 flex flex-col gap-2 overflow-y-auto">
              {allPaths.length === 0 ? (
                <span className="text-slate-400 italic text-xs">Aún no se han completado rutas.</span>
              ) : (
                allPaths.map((path, idx) => (
                  <div key={idx} className="bg-green-50 border border-green-200 p-2 rounded-lg flex flex-wrap gap-1 items-center">
                    {path.map((w, i) => (
                      <React.Fragment key={i}>
                        <span className="text-green-800 text-xs font-bold">{w}</span>
                        {i < path.length - 1 && <span className="text-green-400 text-xs">→</span>}
                      </React.Fragment>
                    ))}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Consola */}
          <div className="bg-slate-900 text-green-400 p-4 rounded-2xl shadow-lg h-48 flex flex-col font-mono text-sm border-4 border-slate-800 relative">
            <div className="absolute top-0 left-0 w-full bg-slate-800 text-slate-300 text-xs py-1 px-3 font-sans font-bold">
              Consola
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