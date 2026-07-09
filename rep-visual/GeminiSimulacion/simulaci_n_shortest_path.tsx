import React, { useState } from 'react';

const N = 6; // Laberinto 6x6

// ⚠️ ¡8 DIRECCIONES! Arriba, Abajo, Izq, Der y las 4 Diagonales
const DIRS = [
  [-1, 0], [1, 0], [0, -1], [0, 1], 
  [-1, -1], [-1, 1], [1, -1], [1, 1]
];

export default function App() {
  const createEmptyGrid = () => {
    return Array(N).fill(0).map((_, r) => 
      Array(N).fill(0).map((_, c) => ({
        val: 0, // 0 = Camino, 1 = Pared
        dist: null,
        parent: null,
        status: 'idle' // 'idle', 'queue', 'current', 'visited', 'path'
      }))
    );
  };

  const [grid, setGrid] = useState(createEmptyGrid());
  const [queue, setQueue] = useState([]);
  const [phase, setPhase] = useState('setup'); // 'setup', 'running', 'success', 'fail'
  const [logs, setLogs] = useState(["Fase de Diseño: Dibuja algunas paredes 🧱 haciendo clic en las celdas y luego dale a Iniciar."]);

  const addLog = (msg) => setLogs(prev => [...prev, msg].slice(-4));

  const toggleWall = (r, c) => {
    if (phase !== 'setup') return;
    const newGrid = [...grid];
    newGrid[r][c].val = newGrid[r][c].val === 0 ? 1 : 0;
    setGrid(newGrid);
  };

  const startBFS = () => {
    // 🔴 Trampa 2: Validar si la entrada o salida están bloqueadas
    if (grid[0][0].val === 1 || grid[N-1][N-1].val === 1) {
      addLog("⚠️ ERROR: La entrada (0,0) o la meta están bloqueadas. Retorna -1.");
      setPhase('fail');
      return;
    }

    let newGrid = [...grid];
    newGrid[0][0].dist = 1; // La distancia inicial es 1
    newGrid[0][0].status = 'queue';
    
    setQueue([{ r: 0, c: 0 }]);
    setGrid(newGrid);
    setPhase('running');
    addLog("🚀 BFS Iniciado. La celda (0,0) entró a la cola.");
  };

  const nextStep = () => {
    if (queue.length === 0) {
      setPhase('fail');
      addLog("❌ La cola se vació y no llegamos a la meta. ¡Camino bloqueado! (-1)");
      return;
    }

    let newGrid = JSON.parse(JSON.stringify(grid));
    let newQueue = [...queue];

    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        if (newGrid[r][c].status === 'current') newGrid[r][c].status = 'visited';
      }
    }

    // Sacamos al primero de la fila (Queue)
    const curr = newQueue.shift();
    newGrid[curr.r][curr.c].status = 'current';
    const currDist = newGrid[curr.r][curr.c].dist;
    
    addLog(`🔍 Visitando (${curr.r}, ${curr.c}) - Buscando en 8 direcciones...`);

    // ¿Llegamos a la meta?
    if (curr.r === N - 1 && curr.c === N - 1) {
      setPhase('success');
      addLog(`🎉 ¡META ALCANZADA! Distancia final: ${currDist}. Trazando la ruta más corta...`);
      reconstructPath(newGrid, curr.r, curr.c);
      setGrid(newGrid);
      setQueue([]);
      return;
    }

    // Buscar en 8 DIRECCIONES
    let added = 0;
    for (let [dr, dc] of DIRS) {
      let nr = curr.r + dr;
      let nc = curr.c + dc;

      if (nr >= 0 && nr < N && nc >= 0 && nc < N) {
        if (newGrid[nr][nc].val === 0 && newGrid[nr][nc].dist === null) {
          newGrid[nr][nc].dist = currDist + 1;
          newGrid[nr][nc].parent = { r: curr.r, c: curr.c };
          newGrid[nr][nc].status = 'queue';
          newQueue.push({ r: nr, c: nc });
          added++;
        }
      }
    }

    if (added > 0) addLog(`👉 Se encontraron ${added} vecinos válidos. Entran a la cola.`);
    setGrid(newGrid);
    setQueue(newQueue);
  };

  const reconstructPath = (currentGrid, r, c) => {
    let curr = currentGrid[r][c];
    while (curr) {
      curr.status = 'path';
      if (!curr.parent) break;
      curr = currentGrid[curr.parent.r][curr.parent.c];
    }
  };

  const reset = () => {
    setGrid(createEmptyGrid());
    setQueue([]);
    setPhase('setup');
    setLogs(["Simulación reiniciada. Dibuja tu laberinto."]);
  };

  const getCellClasses = (cell, r, c) => {
    let base = "flex flex-col items-center justify-center w-12 h-12 border-2 rounded-lg text-sm font-bold transition-all cursor-pointer select-none ";
    
    if (r === 0 && c === 0 && phase === 'setup') base += "ring-4 ring-green-400 "; // Inicio
    if (r === N-1 && c === N-1 && phase === 'setup') base += "ring-4 ring-red-400 "; // Meta

    if (cell.val === 1) return base + "bg-slate-800 border-slate-900 text-slate-500 shadow-inner"; // Pared
    if (cell.status === 'path') return base + "bg-yellow-400 border-yellow-600 shadow-[0_0_15px_rgba(250,204,21,0.8)] scale-110 z-20 text-slate-800";
    if (cell.status === 'current') return base + "bg-blue-500 border-blue-700 scale-110 shadow-lg z-10 text-white animate-pulse";
    if (cell.status === 'queue') return base + "bg-cyan-200 border-cyan-400 shadow-md text-slate-800";
    if (cell.status === 'visited') return base + "bg-slate-200 border-slate-300 text-slate-400 opacity-70";
    
    return base + "bg-white border-slate-200 text-slate-300 hover:bg-slate-50"; 
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans text-slate-800 flex flex-col items-center">
      <h1 className="text-3xl font-extrabold mb-6 flex items-center gap-2">
        🏁 Shortest Path in Binary Matrix
      </h1>

      <div className="flex flex-col lg:flex-row gap-6 w-full max-w-5xl">
        {/* Panel Izquierdo: Laberinto */}
        <div className="flex-1 bg-white p-6 rounded-2xl shadow-md border border-slate-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold">Laberinto</h2>
            <span className="text-xs font-semibold bg-slate-100 px-3 py-1 rounded-full text-slate-600 border border-slate-200">
              Inicio (0,0) {'->'} Meta ({N-1},{N-1})
            </span>
          </div>
          
          <div className="grid gap-1.5 mx-auto w-max bg-slate-100 p-3 rounded-xl border border-slate-200" style={{ gridTemplateColumns: `repeat(${N}, minmax(0, 1fr))` }}>
            {grid.map((row, r) => row.map((cell, c) => (
              <div key={`${r}-${c}`} className={getCellClasses(cell, r, c)} onClick={() => toggleWall(r, c)}>
                {cell.val === 1 ? '🧱' : (cell.dist !== null ? cell.dist : '')}
              </div>
            )))}
          </div>

          <div className="mt-6 flex flex-col gap-3">
            {phase === 'setup' && (
              <button onClick={startBFS} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-md transition-transform hover:-translate-y-0.5">
                1. Iniciar Búsqueda (Empezar BFS)
              </button>
            )}
            {phase === 'running' && (
              <button onClick={nextStep} className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl shadow-md transition-transform hover:-translate-y-0.5">
                2. Avanzar 1 Paso (Procesar Cola) 👣
              </button>
            )}
            <button onClick={reset} className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-2 rounded-xl border border-slate-200 transition-colors">
              🔄 Limpiar y Reiniciar
            </button>
          </div>
        </div>

        {/* Panel Derecho: Cola y Terminal */}
        <div className="flex-1 flex flex-col gap-4">
          <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-100 flex-1">
            <h2 className="text-lg font-bold mb-1">📥 Cola de Procesamiento (Queue)</h2>
            <p className="text-xs text-slate-500 mb-4">El BFS siempre saca la primera celda formada.</p>
            <div className="flex gap-2 overflow-x-auto py-2 items-center min-h-[4rem]">
              {queue.length === 0 ? (
                <span className="text-slate-400 italic text-sm w-full text-center">La cola está vacía</span>
              ) : (
                queue.map((item, idx) => (
                  <div key={idx} className={`flex-shrink-0 px-3 py-1.5 rounded-lg border text-sm ${idx === 0 ? 'bg-blue-100 border-blue-400 text-blue-800 font-bold scale-105 shadow-sm' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
                    ({item.r}, {item.c})
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-slate-900 text-green-400 p-5 rounded-2xl shadow-md h-48 flex flex-col font-mono text-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full bg-slate-800 text-slate-300 text-xs py-1.5 px-4 font-sans font-bold shadow-sm">
              Terminal BFS
            </div>
            <div className="flex-1 overflow-y-auto mt-6 flex flex-col justify-end gap-1">
              {logs.map((log, i) => (
                <p key={i} className={`${i === logs.length - 1 ? 'text-white font-bold' : 'opacity-60'}`}>
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