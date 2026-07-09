import React, { useState } from 'react';

const BEGIN_WORD = "hit";
const END_WORD = "cog";
const WORD_LIST = ["hot", "dot", "dog", "lot", "log", "cog"];

export default function App() {
  const [frames, setFrames] = useState([]);
  const [step, setStep] = useState(0);
  const [phase, setPhase] = useState('setup');
  const [logs, setLogs] = useState(["Dale a 'Iniciar BFS' para expandirnos nivel por nivel."]);

  const addLog = (msg) => setLogs(prev => [...prev, msg].slice(-5));

  const generateFrames = () => {
    let generated = [];
    let wordSet = new Set(WORD_LIST);
    let queue = [{ word: BEGIN_WORD, level: 1 }];
    let visited = new Set([BEGIN_WORD]);
    
    // Para visualización agrupada por niveles
    let levelsVisual = { 1: [BEGIN_WORD], 2: [], 3: [], 4: [], 5: [], 6: [] };
    let currentActiveWord = null;

    const pushFrame = (action, q, logMsg, activeW = null, isTarget = false) => {
      generated.push({
        queue: [...q],
        levelsVisual: JSON.parse(JSON.stringify(levelsVisual)),
        visited: new Set(visited),
        logMsg,
        activeW,
        isTarget
      });
    };

    pushFrame('start', queue, `🚀 Empezamos en '${BEGIN_WORD}'. Nivel inicial = 1.`);

    let found = false;

    while (queue.length > 0 && !found) {
      let currentQ = [...queue];
      const { word, level } = queue.shift();
      currentActiveWord = word;

      pushFrame('visit', currentQ, `🔍 Analizando '${word}' (Nivel ${level}). Buscando transformaciones...`, word);

      if (word === END_WORD) {
        found = true;
        pushFrame('found', queue, `🎉 ¡Llegamos a '${END_WORD}'! Longitud del camino: ${level}.`, word, true);
        break;
      }

      let neighborsFound = 0;
      let newNeighbors = [];

      // Simular la búsqueda de palabras que difieren en 1 letra (fuerza bruta teórica)
      // En la práctica del código, cambiamos cada letra por 'a'-'z'. Aquí iteramos la lista por simplicidad visual.
      for (let target of WORD_LIST) {
        if (!visited.has(target)) {
          let diff = 0;
          for (let i = 0; i < word.length; i++) {
            if (word[i] !== target[i]) diff++;
          }
          
          if (diff === 1) {
            visited.add(target);
            queue.push({ word: target, level: level + 1 });
            levelsVisual[level + 1].push(target);
            newNeighbors.push(target);
            neighborsFound++;
          }
        }
      }

      if (neighborsFound > 0) {
        pushFrame('neighbors', queue, `👉 Encontramos ${neighborsFound} palabra(s) válida(s): [${newNeighbors.join(', ')}]. Entran al Nivel ${level + 1}.`, word);
      } else {
        pushFrame('deadend', queue, `❌ No hay transformaciones nuevas desde '${word}'.`, word);
      }
    }

    if (!found) {
       pushFrame('fail', [], `💀 La cola se vació y no encontramos '${END_WORD}'. No hay camino válido.`);
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
    if (nextFrame.logMsg) addLog(`> ${nextFrame.logMsg}`);
  };

  const reset = () => {
    setFrames([]);
    setStep(0);
    setPhase('setup');
    setLogs(["Simulación reiniciada."]);
  };

  const currentFrame = frames[step] || { queue: [], levelsVisual: {1:[], 2:[], 3:[], 4:[], 5:[]}, visited: new Set(), activeW: null, isTarget: false };
  const { queue, levelsVisual, activeW, isTarget } = currentFrame;

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-8 font-sans text-slate-800 flex flex-col items-center">
      <h1 className="text-2xl sm:text-3xl font-extrabold mb-6 flex items-center gap-2">
        🪜 Word Ladder I (BFS Puro)
      </h1>

      <div className="flex flex-col lg:flex-row gap-6 w-full max-w-5xl">
        
        {/* Panel Izquierdo: Niveles BFS */}
        <div className="flex-[3] bg-white p-6 rounded-2xl shadow-lg border border-slate-200 flex flex-col">
          
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold">Ondas Expansivas (Niveles)</h2>
            <span className="text-sm font-bold bg-blue-100 text-blue-800 px-3 py-1 rounded-full border border-blue-300">
              Objetivo: {END_WORD}
            </span>
          </div>

          <div className="flex-1 w-full bg-slate-50 rounded-xl border border-slate-200 p-4 flex gap-4 overflow-x-auto shadow-inner min-h-[300px]">
            {[1, 2, 3, 4, 5].map((lvl) => (
              <div key={lvl} className="flex-1 min-w-[120px] flex flex-col items-center border-r border-slate-200 last:border-0 border-dashed pb-4">
                <div className="text-sm font-bold text-slate-400 mb-6 bg-white px-3 py-1 rounded-full border shadow-sm">
                  Nivel {lvl}
                </div>
                
                <div className="flex flex-col gap-4 w-full px-2">
                  {phase === 'setup' && lvl === 1 ? (
                    <div className="bg-slate-800 text-white font-bold py-2 rounded-lg text-center shadow-md">
                      {BEGIN_WORD}
                    </div>
                  ) : levelsVisual[lvl]?.map((w) => {
                    let classes = "font-bold py-2 px-4 rounded-lg text-center transition-all duration-300 border-2 shadow-md ";
                    
                    if (w === activeW) {
                      if (isTarget) classes += "bg-green-500 border-green-700 text-white scale-110 shadow-[0_0_15px_rgba(34,197,94,0.8)] animate-bounce";
                      else classes += "bg-yellow-400 border-yellow-600 text-yellow-900 scale-110 animate-pulse";
                    } else if (w === END_WORD && levelsVisual[lvl].includes(w)) {
                       classes += "bg-emerald-100 border-emerald-400 text-emerald-800 border-dashed opacity-50"; // Found but not active yet
                    } else {
                      classes += "bg-blue-100 border-blue-300 text-blue-800";
                    }

                    return (
                      <div key={w} className={classes}>
                        {w}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            {phase === 'setup' && (
              <button onClick={startSimulation} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-md transition-transform hover:-translate-y-0.5">
                1. Iniciar BFS 🚀
              </button>
            )}
            
            {(phase === 'running' || phase === 'done') && (
              <button onClick={nextStep} disabled={phase === 'done'} className={`flex-1 font-bold py-3 rounded-xl shadow-lg transition-transform flex items-center justify-center gap-2 ${phase === 'done' ? 'bg-slate-300 text-slate-500' : 'bg-green-600 hover:bg-green-700 text-white hover:-translate-y-0.5'}`}>
                {phase === 'done' ? '🏁 Búsqueda Finalizada' : '2. Avanzar (Procesar Cola) 👣'}
              </button>
            )}

            <button onClick={reset} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2 rounded-xl border border-slate-300">
              🔄 Reiniciar
            </button>
          </div>
        </div>

        {/* Panel Derecho: Cola y Consola */}
        <div className="flex-[2] flex flex-col gap-4">
          
          {/* Cola del BFS */}
          <div className="bg-white p-4 rounded-2xl shadow-md border border-slate-200">
            <h2 className="text-sm font-bold mb-2">📥 Cola del BFS</h2>
            <div className="flex gap-2 overflow-x-auto py-2 items-center min-h-[4rem] bg-slate-50 rounded-lg px-2 border border-slate-100">
              {queue.length === 0 ? (
                <span className="text-slate-400 italic text-xs w-full text-center">Vacía</span>
              ) : (
                queue.map((item, idx) => (
                  <div key={idx} className={`flex-shrink-0 px-3 py-1.5 rounded-lg border text-xs flex flex-col items-center shadow-sm ${idx === 0 ? 'bg-yellow-200 border-yellow-500 text-yellow-900 font-bold scale-105' : 'bg-white border-slate-300 text-slate-600'}`}>
                    <span className="font-bold uppercase tracking-wider">{item.word}</span>
                    <span className="opacity-75">Nivel: {item.level}</span>
                  </div>
                ))
              )}
            </div>
            <p className="text-[10px] text-slate-400 mt-2 text-center">Tachamos las palabras de la lista apenas entran a la cola para no repetir.</p>
          </div>

          {/* Consola */}
          <div className="bg-slate-900 text-green-400 p-4 rounded-2xl shadow-lg flex-1 min-h-[200px] flex flex-col font-mono text-sm border-4 border-slate-800 relative">
            <div className="absolute top-0 left-0 w-full bg-slate-800 text-slate-300 text-xs py-1 px-3 font-sans font-bold shadow-sm">
              Terminal BFS
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