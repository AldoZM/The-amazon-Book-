import React, { useState } from 'react';

// El ejemplo clásico de LeetCode
const INITIAL_NUMS = [100, 4, 200, 1, 3, 2];

export default function App() {
  const [frames, setFrames] = useState([]);
  const [step, setStep] = useState(0);
  const [phase, setPhase] = useState('setup'); // setup, running, done
  const [logs, setLogs] = useState(["Dale a 'Convertir a Set' para empezar."]);

  const addLog = (msg) => setLogs(prev => [...prev, msg].slice(-5));

  const generateFrames = () => {
    let generated = [];
    const numSet = new Set(INITIAL_NUMS);
    
    // Estados visuales: 'idle', 'evaluating', 'skipped', 'is_start', 'counting', 'done'
    let states = {};
    INITIAL_NUMS.forEach(n => states[n] = 'idle');
    
    let longestStreak = 0;
    let currentStreak = 0;
    let currentNum = null;

    const pushFrame = (action, activeNum, lookingFor, logMsg) => {
      generated.push({
        states: { ...states },
        longestStreak,
        currentStreak,
        activeNum,
        lookingFor,
        logMsg
      });
    };

    pushFrame('start', null, null, `🚀 FASE 1: Arreglo convertido a Hash Set. Búsquedas ahora toman O(1).`);

    // Iteramos sobre los números originales
    for (let num of INITIAL_NUMS) {
      states[num] = 'evaluating';
      pushFrame('check_start', num, num - 1, `🔍 Evaluando ${num}. ¿Existe el ${num - 1} en el set?`);

      // ⚠️ LA REGLA DE ORO
      if (numSet.has(num - 1)) {
        states[num] = 'skipped';
        pushFrame('skip', num, num - 1, `🚫 SÍ existe el ${num - 1}. Entonces ${num} NO es el inicio de una secuencia. Lo saltamos.`);
        continue;
      }

      // Si no existe, es un INICIO válido
      states[num] = 'is_start';
      currentNum = num;
      currentStreak = 1;
      pushFrame('found_start', currentNum, currentNum + 1, `✅ NO existe el ${num - 1}. ¡${num} es el inicio de una secuencia! Empezamos a contar.`);

      // Contamos la secuencia hacia adelante
      while (numSet.has(currentNum + 1)) {
        states[currentNum + 1] = 'counting';
        currentNum += 1;
        currentStreak += 1;
        pushFrame('count_up', currentNum, currentNum + 1, `📈 ¡Encontramos ${currentNum}! Racha actual = ${currentStreak}. Buscando ${currentNum + 1}...`);
      }

      // Fin de esta secuencia
      longestStreak = Math.max(longestStreak, currentStreak);
      pushFrame('end_sequence', currentNum, currentNum + 1, `🛑 No existe ${currentNum + 1}. Fin de secuencia. Racha Max actualizada a ${longestStreak}.`);
      
      // Marcar como procesados
      let temp = num;
      while(temp <= currentNum) {
          states[temp] = 'done';
          temp++;
      }
    }

    pushFrame('finish', null, null, `🏁 Búsqueda terminada. La secuencia más larga es de ${longestStreak}.`);
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

  const currentFrame = frames[step] || { states: {}, longestStreak: 0, currentStreak: 0, activeNum: null, lookingFor: null };
  const { states, longestStreak, currentStreak, activeNum, lookingFor } = currentFrame;

  const getNumberClasses = (num) => {
    let base = "flex flex-col items-center justify-center w-16 h-16 sm:w-20 sm:h-20 border-4 rounded-2xl text-xl sm:text-2xl font-black transition-all duration-300 shadow-md ";
    const state = states[num] || 'idle';

    if (state === 'evaluating') return base + "bg-yellow-300 border-yellow-500 text-yellow-900 scale-110 z-10 animate-pulse ring-4 ring-yellow-200";
    if (state === 'skipped') return base + "bg-slate-200 border-slate-300 text-slate-400 opacity-60";
    if (state === 'is_start') return base + "bg-green-400 border-green-600 text-white scale-110 z-10 shadow-[0_0_15px_rgba(34,197,94,0.8)]";
    if (state === 'counting') return base + "bg-blue-400 border-blue-600 text-white scale-110 z-10";
    if (state === 'done') return base + "bg-blue-100 border-blue-300 text-blue-800";
    
    return base + "bg-white border-slate-300 text-slate-700";
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-8 font-sans text-slate-800 flex flex-col items-center">
      <h1 className="text-2xl sm:text-3xl font-extrabold mb-6 flex items-center gap-2">
        ⛓️ Longest Consecutive Sequence
      </h1>

      <div className="flex flex-col lg:flex-row gap-6 w-full max-w-5xl">
        
        {/* Panel Izquierdo: Arreglo y Set */}
        <div className="flex-[3] bg-white p-6 rounded-2xl shadow-lg border border-slate-200 flex flex-col gap-6">
          
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold">1. Arreglo Desordenado (Input)</h2>
          </div>
          
          <div className="flex gap-2 flex-wrap justify-center bg-slate-100 p-4 rounded-xl border shadow-inner">
             {INITIAL_NUMS.map((num, idx) => (
                <div key={`input-${idx}`} className="bg-white border-2 border-slate-300 text-slate-500 font-bold px-3 py-1 rounded">
                  {num}
                </div>
             ))}
          </div>

          <div className="flex justify-between items-center mt-2">
            <h2 className="text-lg font-bold">2. Hash Set O(1)</h2>
          </div>

          <div className="flex flex-wrap gap-4 justify-center bg-slate-50 p-6 rounded-xl border border-slate-200 min-h-[160px] items-center">
            {INITIAL_NUMS.map((num) => (
              <div key={num} className="relative">
                <div className={getNumberClasses(num)}>
                  {num}
                </div>
                {/* Etiqueta flotante para mostrar qué estamos buscando */}
                {activeNum === num && lookingFor !== null && phase !== 'done' && (
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs font-bold px-2 py-1 rounded shadow-lg whitespace-nowrap animate-bounce">
                    ¿Existe {lookingFor}?
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-2 flex flex-col sm:flex-row gap-3">
            {phase === 'setup' && (
              <button onClick={startSimulation} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-md transition-transform hover:-translate-y-0.5">
                1. Convertir a Set y Buscar 🚀
              </button>
            )}
            
            {(phase === 'running' || phase === 'done') && (
              <button onClick={nextStep} disabled={phase === 'done'} className={`flex-1 font-bold py-3 rounded-xl shadow-lg transition-transform flex items-center justify-center gap-2 ${phase === 'done' ? 'bg-slate-300 text-slate-500' : 'bg-green-600 hover:bg-green-700 text-white hover:-translate-y-0.5'}`}>
                {phase === 'done' ? '🏁 Terminado' : '2. Avanzar Paso 👣'}
              </button>
            )}

            <button onClick={reset} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2 rounded-xl border border-slate-300">
              🔄 Reiniciar
            </button>
          </div>
        </div>

        {/* Panel Derecho: Variables y Consola */}
        <div className="flex-[2] flex flex-col gap-4">
          
          {/* Marcadores */}
          <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-200 flex flex-col gap-4">
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Marcadores (Rachas)</h2>
            
            <div className="flex gap-4">
              <div className="flex-1 bg-blue-50 border border-blue-200 rounded-xl p-4 flex flex-col items-center justify-center">
                <span className="text-xs font-bold text-blue-500 mb-1">Racha Actual</span>
                <span className="text-4xl font-black text-blue-700">{currentStreak}</span>
              </div>
              
              <div className="flex-1 bg-green-50 border border-green-200 rounded-xl p-4 flex flex-col items-center justify-center relative overflow-hidden">
                <span className="text-xs font-bold text-green-600 mb-1 z-10">Racha MAX</span>
                <span className="text-4xl font-black text-green-700 z-10">{longestStreak}</span>
                <div className="absolute inset-0 bg-green-200 opacity-20 animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Consola */}
          <div className="bg-slate-900 text-green-400 p-5 rounded-2xl shadow-lg flex-1 min-h-[250px] flex flex-col font-mono text-sm border-4 border-slate-800 relative">
            <div className="absolute top-0 left-0 w-full bg-slate-800 text-slate-300 text-xs py-1.5 px-4 font-sans font-bold shadow-sm">
              Consola del Evaluador
            </div>
            <div className="flex-1 overflow-y-auto mt-4 flex flex-col justify-end gap-2">
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