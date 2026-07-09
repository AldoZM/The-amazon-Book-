import React, { useState, useEffect } from 'react';

// El tablero clásico de LeetCode
const INITIAL_BOARD = [
  ['A', 'B', 'C', 'E'],
  ['S', 'F', 'C', 'S'],
  ['A', 'D', 'E', 'E']
];

export default function App() {
  const [targetWord, setTargetWord] = useState('ABCCED');
  const [frames, setFrames] = useState([]);
  const [step, setStep] = useState(0);
  const [phase, setPhase] = useState('setup'); // setup, running, success, fail
  const [logs, setLogs] = useState(["Escribe una palabra y dale a 'Generar Búsqueda'."]);

  const addLog = (msg) => setLogs(prev => [...prev, msg].slice(-5));

  // Motor pre-calculador del DFS: Evalúa todo el recorrido antes de animarlo
  const generateFrames = (board, target) => {
    let generatedFrames = [];
    const R = board.length;
    const C = board[0].length;
    let visited = Array(R).fill(0).map(() => Array(C).fill(false));
    let found = false;

    const dfs = (r, c, index, currentPath) => {
      if (found) return;

      const letter = board[r][c];
      generatedFrames.push({ action: 'checking', r, c, index, path: currentPath, letter, targetLetter: target[index] });

      if (letter !== target[index]) {
        generatedFrames.push({ action: 'mismatch', r, c, index, path: currentPath, letter });
        return;
      }

      const newPath = [...currentPath, { r, c }];
      generatedFrames.push({ action: 'match', r, c, index, path: newPath, letter });

      if (index === target.length - 1) {
        found = true;
        generatedFrames.push({ action: 'success', path: newPath });
        return;
      }

      visited[r][c] = true;
      const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]]; // Arriba, Abajo, Izq, Der

      for (let [dr, dc] of dirs) {
        let nr = r + dr, nc = c + dc;
        if (nr >= 0 && nr < R && nc >= 0 && nc < C && !visited[nr][nc]) {
          dfs(nr, nc, index + 1, newPath);
          if (found) return;
        }
      }

      // ⚠️ BACKTRACKING: Deshacemos el paso porque ninguna dirección funcionó
      visited[r][c] = false;
      generatedFrames.push({ action: 'backtrack', r, c, index, path: currentPath, letter });
    };

    for (let r = 0; r < R; r++) {
      for (let c = 0; c < C; c++) {
        if (!found && board[r][c] === target[0]) {
          generatedFrames.push({ action: 'start_search', r, c, path: [] });
          dfs(r, c, 0, []);
        }
      }
    }

    if (!found) {
      generatedFrames.push({ action: 'fail', path: [] });
    }

    return generatedFrames;
  };

  const startSimulation = () => {
    const cleanWord = targetWord.toUpperCase().replace(/[^A-Z]/g, '');
    if (!cleanWord) {
      addLog("⚠️ Escribe una palabra válida.");
      return;
    }
    setTargetWord(cleanWord);
    
    const newFrames = generateFrames(INITIAL_BOARD, cleanWord);
    setFrames(newFrames);
    setStep(0);
    setPhase('running');
    setLogs([`🚀 Iniciando búsqueda DFS para: "${cleanWord}"`]);
  };

  const nextStep = () => {
    if (step >= frames.length - 1) return;
    
    const currentFrame = frames[step];
    const nextFrame = frames[step + 1];
    setStep(step + 1);

    // Generar logs basados en la acción
    if (nextFrame.action === 'checking') {
      addLog(`🔍 Revisando (${nextFrame.r}, ${nextFrame.c}). ¿'${nextFrame.letter}' == '${nextFrame.targetLetter}'?`);
    } else if (nextFrame.action === 'mismatch') {
      addLog(`❌ Falso. La letra no coincide o ya fue visitada.`);
    } else if (nextFrame.action === 'match') {
      addLog(`✅ ¡Match! Letra '${nextFrame.letter}' encontrada. Avanzando a la siguiente...`);
    } else if (nextFrame.action === 'backtrack') {
      addLog(`⚠️ Callejón sin salida. BACKTRACKING en '${nextFrame.letter}'. Desmarcando casilla...`);
    } else if (nextFrame.action === 'success') {
      setPhase('success');
      addLog(`🎉 ¡ÉXITO! La palabra "${targetWord}" fue encontrada en el tablero.`);
    } else if (nextFrame.action === 'fail') {
      setPhase('fail');
      addLog(`💀 Fin de la búsqueda. La palabra no existe en el tablero.`);
    }
  };

  const reset = () => {
    setFrames([]);
    setStep(0);
    setPhase('setup');
    setLogs(["Simulación reiniciada."]);
  };

  // Obtener estado actual
  const currentFrame = frames[step] || { path: [] };
  const { action, path, r: currR, c: currC } = currentFrame;

  // Clases CSS para cada celda
  const getCellClasses = (r, c, letter) => {
    let base = "flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 border-2 rounded-xl text-xl sm:text-2xl font-black transition-all duration-300 ";
    
    const isCurrent = currR === r && currC === c;
    const isPath = path.some(p => p.r === r && p.c === c);

    if (action === 'success' && isPath) return base + "bg-green-500 border-green-700 text-white shadow-[0_0_15px_rgba(34,197,94,0.8)] scale-110 z-20";
    
    if (isCurrent) {
      if (action === 'checking') return base + "bg-yellow-300 border-yellow-500 scale-110 z-10 animate-pulse text-yellow-900";
      if (action === 'match') return base + "bg-blue-500 border-blue-700 scale-110 z-10 text-white";
      if (action === 'mismatch') return base + "bg-red-400 border-red-600 scale-110 z-10 text-white";
      if (action === 'backtrack') return base + "bg-orange-400 border-orange-600 scale-95 z-10 text-white";
    }

    if (isPath) return base + "bg-blue-200 border-blue-400 text-blue-800 shadow-inner"; // Camino activo
    
    return base + "bg-white border-slate-200 text-slate-700"; // Letras normales
  };

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-8 font-sans text-slate-800 flex flex-col items-center">
      <h1 className="text-2xl sm:text-3xl font-extrabold mb-6 flex items-center gap-2">
        🕵️‍♀️ Word Search (DFS + Backtracking)
      </h1>

      <div className="flex flex-col lg:flex-row gap-6 w-full max-w-5xl">
        
        {/* Panel Izquierdo: Tablero */}
        <div className="flex-1 bg-white p-6 rounded-2xl shadow-lg border border-slate-200">
          <div className="mb-6">
            <label className="block text-sm font-bold text-slate-600 mb-2">Palabra a buscar:</label>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={targetWord}
                onChange={(e) => setTargetWord(e.target.value.toUpperCase())}
                disabled={phase !== 'setup'}
                className="flex-1 border-2 border-slate-300 rounded-lg px-4 py-2 font-mono font-bold text-lg focus:border-blue-500 outline-none uppercase"
                placeholder="Ej. ABCCED"
                maxLength={10}
              />
            </div>
            <p className="text-xs text-slate-400 mt-2">Palabras geniales para probar: ABCCED, SEE, ABF</p>
          </div>

          <div className="grid gap-2 mx-auto w-max bg-slate-50 p-4 rounded-xl border border-slate-200" style={{ gridTemplateColumns: `repeat(${INITIAL_BOARD[0].length}, minmax(0, 1fr))` }}>
            {INITIAL_BOARD.map((row, r) => row.map((letter, c) => (
              <div key={`${r}-${c}`} className={getCellClasses(r, c, letter)}>
                {letter}
              </div>
            )))}
          </div>

          <div className="mt-8 flex flex-col gap-3">
            {phase === 'setup' && (
              <button onClick={startSimulation} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-md transition-transform hover:-translate-y-0.5">
                1. Generar Búsqueda (DFS)
              </button>
            )}
            
            {phase === 'running' && (
              <button onClick={nextStep} className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl shadow-lg transition-transform hover:-translate-y-0.5 flex items-center justify-center gap-2">
                2. Avanzar 1 Paso (Siguiente Recursión) 👣
              </button>
            )}

            <button onClick={reset} className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2 rounded-xl border border-slate-300">
              🔄 Reiniciar Simulación
            </button>
          </div>
        </div>

        {/* Panel Derecho: Estado y Consola */}
        <div className="flex-1 flex flex-col gap-6">
          
          {/* Tracker de Palabra */}
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200">
            <h2 className="text-lg font-bold mb-4">Progreso de la Palabra</h2>
            <div className="flex gap-2 justify-center flex-wrap">
              {targetWord.split('').map((char, idx) => {
                const isActive = (currentFrame.index === idx && action === 'checking') || 
                                 (currentFrame.index === idx && action === 'match') ||
                                 (currentFrame.index > idx && action !== 'fail');
                const isFound = path.length > idx || (phase === 'success');

                return (
                  <div key={idx} className={`flex items-center justify-center w-10 h-10 border-2 rounded-lg font-bold text-lg transition-colors
                    ${isFound ? 'bg-green-500 border-green-600 text-white' : 
                      isActive ? 'bg-yellow-300 border-yellow-500 text-yellow-900 animate-pulse' : 
                      'bg-slate-100 border-slate-300 text-slate-400'}`}
                  >
                    {char}
                  </div>
                );
              })}
            </div>
            {phase === 'running' && (
              <p className="text-sm text-center mt-4 text-slate-500">
                Largo del camino actual (Path): <span className="font-bold text-blue-600">{path.length}</span>
              </p>
            )}
          </div>

          {/* Consola de Logs */}
          <div className="bg-slate-900 text-green-400 p-6 rounded-2xl shadow-lg flex-1 min-h-[200px] flex flex-col font-mono text-sm border-4 border-slate-800 relative">
            <div className="absolute top-0 left-0 w-full bg-slate-800 text-slate-300 text-xs py-1.5 px-4 font-sans font-bold shadow-sm">
              Terminal (Call Stack)
            </div>
            <div className="flex-1 overflow-y-auto mt-4 flex flex-col justify-end gap-2">
              {logs.map((log, i) => (
                <p key={i} className={`leading-relaxed ${i === logs.length - 1 ? 'text-white font-bold' : 'opacity-60'}`}>
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