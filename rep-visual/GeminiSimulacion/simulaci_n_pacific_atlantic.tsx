import React, { useState } from 'react';

const N = 5; // Matriz de 5x5 para que sea fácil de visualizar

// Alturas clásicas del ejemplo de LeetCode
const INITIAL_HEIGHTS = [
  [1, 2, 2, 3, 5],
  [3, 2, 3, 4, 4],
  [2, 4, 5, 3, 1],
  [6, 7, 1, 4, 5],
  [5, 1, 1, 2, 4]
];

const DIRS = [[-1, 0], [1, 0], [0, -1], [0, 1]];

export default function App() {
  // Estado de la cuadrícula
  const [grid, setGrid] = useState(() => 
    INITIAL_HEIGHTS.map((row, r) => row.map((height, c) => ({
      height,
      pacific: false, // ¿Es alcanzable desde el Pacífico?
      atlantic: false // ¿Es alcanzable desde el Atlántico?
    })))
  );

  const [phase, setPhase] = useState('start'); // start, pacific, atlantic, result
  const [logs, setLogs] = useState(["Bienvenido. El Pacífico está Arriba/Izquierda. El Atlántico Abajo/Derecha."]);

  const addLog = (msg) => setLogs(prev => [...prev, msg].slice(-4));

  // Función genérica para inundar desde un océano usando BFS
  const floodOcean = (oceanType) => {
    let newGrid = JSON.parse(JSON.stringify(grid));
    let queue = [];

    // 1. Meter las costas a la cola
    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        // Costas del Pacífico (Arriba r==0, Izquierda c==0)
        if (oceanType === 'pacific' && (r === 0 || c === 0)) {
          newGrid[r][c].pacific = true;
          queue.push({ r, c });
        }
        // Costas del Atlántico (Abajo r==N-1, Derecha c==N-1)
        if (oceanType === 'atlantic' && (r === N - 1 || c === N - 1)) {
          newGrid[r][c].atlantic = true;
          queue.push({ r, c });
        }
      }
    }

    // 2. BFS: Propagar el agua "cuesta arriba" (Reverse Thinking)
    while (queue.length > 0) {
      const curr = queue.shift();
      const currHeight = newGrid[curr.r][curr.c].height;

      for (let [dr, dc] of DIRS) {
        let nr = curr.r + dr;
        let nc = curr.c + dc;

        if (nr >= 0 && nr < N && nc >= 0 && nc < N) {
          // ⚠️ LA REGLA DE ORO: El agua solo fluye hacia alturas MAYORES O IGUALES
          if (newGrid[nr][nc].height >= currHeight) {
            
            // Si no estaba mojada por este océano, la mojamos y entra a la cola
            if (oceanType === 'pacific' && !newGrid[nr][nc].pacific) {
              newGrid[nr][nc].pacific = true;
              queue.push({ r: nr, c: nc });
            }
            if (oceanType === 'atlantic' && !newGrid[nr][nc].atlantic) {
              newGrid[nr][nc].atlantic = true;
              queue.push({ r: nr, c: nc });
            }
          }
        }
      }
    }

    setGrid(newGrid);
  };

  // Botones de acción
  const runPacific = () => {
    floodOcean('pacific');
    setPhase('pacific');
    addLog("🌊 Inundando desde el Pacífico (Arriba/Izq) cuesta arriba...");
  };

  const runAtlantic = () => {
    floodOcean('atlantic');
    setPhase('atlantic');
    addLog("🌊 Inundando desde el Atlántico (Abajo/Der) cuesta arriba...");
  };

  const showResult = () => {
    setPhase('result');
    let count = 0;
    grid.forEach(row => row.forEach(cell => {
      if (cell.pacific && cell.atlantic) count++;
    }));
    addLog(`✨ ¡Listo! Encontramos ${count} celdas que conectan a ambos océanos (Púrpura).`);
  };

  const reset = () => {
    setGrid(INITIAL_HEIGHTS.map((row) => row.map((height) => ({
      height, pacific: false, atlantic: false
    }))));
    setPhase('start');
    setLogs(["Simulación reiniciada."]);
  };

  // Determinar colores
  const getCellColor = (cell) => {
    if (phase === 'start') return 'bg-white border-slate-300 text-slate-700';
    
    if (cell.pacific && cell.atlantic) return 'bg-purple-500 border-purple-700 text-white shadow-[0_0_15px_rgba(168,85,247,0.8)] font-bold scale-110 z-10'; // Intersección
    if (cell.pacific) return 'bg-blue-400 border-blue-600 text-white'; // Solo Pacífico
    if (cell.atlantic) return 'bg-red-400 border-red-600 text-white'; // Solo Atlántico
    
    return 'bg-slate-100 border-slate-300 text-slate-400'; // Seco
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-2">🏔️ Pacific Atlantic Water Flow</h1>
      <p className="text-slate-600 mb-8 max-w-lg text-center">
        El truco está en ir de los océanos hacia el interior de la isla, fluyendo hacia alturas <strong>mayores o iguales</strong>.
      </p>

      <div className="flex gap-8 w-full max-w-4xl">
        
        {/* Mapa / Matriz */}
        <div className="flex-1 bg-white p-6 rounded-2xl shadow-lg relative border-4 border-slate-200">
          {/* Etiquetas visuales de los océanos */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 text-blue-500 font-bold text-sm tracking-widest">PACÍFICO</div>
          <div className="absolute top-1/2 left-2 -translate-y-1/2 -rotate-90 text-blue-500 font-bold text-sm tracking-widest">PACÍFICO</div>
          
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-red-500 font-bold text-sm tracking-widest">ATLÁNTICO</div>
          <div className="absolute top-1/2 right-2 rotate-90 text-red-500 font-bold text-sm tracking-widest">ATLÁNTICO</div>

          <div className="grid gap-2 mx-auto mt-8 mb-8" style={{ gridTemplateColumns: `repeat(${N}, minmax(0, 1fr))`, width: 'max-content' }}>
            {grid.map((row, r) => row.map((cell, c) => (
              <div 
                key={`${r}-${c}`} 
                className={`flex flex-col items-center justify-center w-14 h-14 rounded-lg border-2 text-xl font-black transition-all duration-500 ${getCellColor(cell)}`}
              >
                {cell.height}
              </div>
            )))}
          </div>
        </div>

        {/* Controles */}
        <div className="flex-1 flex flex-col gap-4">
          <div className="bg-white p-6 rounded-2xl shadow-lg flex-1 flex flex-col justify-center gap-4">
            <button 
              onClick={runPacific} 
              disabled={phase !== 'start'}
              className={`py-3 px-4 rounded-xl font-bold transition-all ${phase === 'start' ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-md' : 'bg-slate-200 text-slate-400'}`}
            >
              1. 🟦 Inundar desde Pacífico
            </button>
            
            <button 
              onClick={runAtlantic} 
              disabled={phase !== 'pacific'}
              className={`py-3 px-4 rounded-xl font-bold transition-all ${phase === 'pacific' ? 'bg-red-500 hover:bg-red-600 text-white shadow-md' : 'bg-slate-200 text-slate-400'}`}
            >
              2. 🟥 Inundar desde Atlántico
            </button>
            
            <button 
              onClick={showResult} 
              disabled={phase !== 'atlantic'}
              className={`py-3 px-4 rounded-xl font-bold transition-all ${phase === 'atlantic' ? 'bg-purple-500 hover:bg-purple-600 text-white shadow-md hover:scale-105' : 'bg-slate-200 text-slate-400'}`}
            >
              3. 🟪 Ver Intersección (Resultado)
            </button>

            <button onClick={reset} className="mt-4 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 rounded-xl">
              🔄 Reiniciar
            </button>
          </div>

          <div className="bg-slate-800 text-green-400 p-6 rounded-2xl shadow-lg h-40 flex flex-col justify-end font-mono text-sm">
            {logs.map((log, i) => (
              <p key={i} className={`mb-1 ${i === logs.length - 1 ? 'text-white font-bold' : 'opacity-70'}`}>
                {">"} {log}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}