import React, { useState } from 'react';

// Nodos: 0=México, 1=USA, 2=Hawaii, 3=Japón
const NODES = {
  0: { x: 15, y: 50, label: '0 (MEX)' },
  1: { x: 40, y: 20, label: '1 (USA)' },
  2: { x: 70, y: 20, label: '2 (HI)' },
  3: { x: 85, y: 80, label: '3 (JPN)' }
};

// [origen, destino, precio]
const FLIGHTS = [
  { u: 0, v: 1, w: 100 },
  { u: 1, v: 2, w: 100 },
  { u: 2, v: 3, w: 100 },
  { u: 0, v: 3, w: 500 } // Vuelo directo, caro pero con 0 escalas
];

const K_LIMIT = 1; // Solo se permite 1 escala

export default function App() {
  const [frames, setFrames] = useState([]);
  const [step, setStep] = useState(0);
  const [phase, setPhase] = useState('setup');
  const [logs, setLogs] = useState(["Dale a 'Iniciar Búsqueda' para ver cómo evitamos la trampa de las escalas."]);

  const addLog = (msg) => setLogs(prev => [...prev, msg].slice(-5));

  const generateFrames = () => {
    let generated = [];
    const src = 0;
    const dst = 3;
    
    // Array para guardar el precio mínimo global a cada nodo
    let prices = { 0: 0, 1: Infinity, 2: Infinity, 3: Infinity };
    
    // Cola del BFS: { nodo, costo_acumulado, escalas }
    let q = [{ node: src, cost: 0, stops: 0 }];
    
    let currentStates = { 0: 'idle', 1: 'idle', 2: 'idle', 3: 'idle' };

    const pushFrame = (action, queue, activeEdge, logMsg) => {
      generated.push({
        prices: { ...prices },
        states: { ...currentStates },
        q: [...queue],
        activeEdge,
        logMsg
      });
    };

    pushFrame('start', q, null, `🚀 Iniciamos en Nodo ${src}. Nuestro límite es K = ${K_LIMIT} escala.`);

    while (q.length > 0) {
      let currentQ = [...q];
      const { node, cost, stops } = q.shift();
      
      currentStates[node] = 'current';
      pushFrame('visit', currentQ, null, `🔍 Analizando Nodo ${node}. Costo hasta aquí: $${cost}. Escalas usadas: ${stops}.`);

      // ⚠️ LA REGLA DE ORO: Si ya pasamos el límite de escalas, no exploramos sus vuelos
      if (stops > K_LIMIT) {
        currentStates[node] = 'visited';
        pushFrame('skip', q, null, `🚫 Límite excedido (Escalas ${stops} > K ${K_LIMIT}). No podemos volar desde aquí.`);
        continue;
      }

      // Buscar vuelos desde el nodo actual
      let flightsFromNode = FLIGHTS.filter(f => f.u === node);
      
      for (let flight of flightsFromNode) {
        const { v, w } = flight;
        const nextCost = cost + w;

        pushFrame('check_flight', q, flight, `✈️ Vuelo de ${node} a ${v} (Costo: $${w}). Costo total proyectado: $${nextCost}.`);

        // OPTIMIZACIÓN: Solo lo metemos a la cola si el nuevo costo mejora el récord histórico
        if (nextCost < prices[v]) {
          const oldPrice = prices[v] === Infinity ? '∞' : prices[v];
          prices[v] = nextCost;
          q.push({ node: v, cost: nextCost, stops: stops + 1 });
          
          if (currentStates[v] !== 'visited') {
            currentStates[v] = 'queued';
          }
          
          pushFrame('update', q, flight, `✅ ¡Mejoramos el precio a ${v}! De $${oldPrice} a $${nextCost}. Lo metemos a la cola.`);
        } else {
          pushFrame('ignore', q, flight, `❌ El costo $${nextCost} no es mejor que el récord actual $${prices[v]}. Ignoramos este vuelo.`);
        }
      }

      currentStates[node] = 'visited';
    }

    const finalPrice = prices[dst] === Infinity ? -1 : prices[dst];
    pushFrame('finish', [], null, `🏁 Búsqueda terminada. El vuelo más barato a ${dst} dentro de ${K_LIMIT} escala(s) cuesta: $${finalPrice}.`);
    
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

  const currentFrame = frames[step] || { prices: {0:0, 1:'∞', 2:'∞', 3:'∞'}, states: {}, q: [], activeEdge: null };
  const { prices, states, q, activeEdge } = currentFrame;

  // Helpers para dibujar flechas
  const getPath = (u, v) => {
    const x1 = NODES[u].x; const y1 = NODES[u].y;
    const x2 = NODES[v].x; const y2 = NODES[v].y;
    const dx = x2 - x1; const dy = y2 - y1;
    const length = Math.sqrt(dx*dx + dy*dy);
    const padding = 7; // % offset para no tapar el nodo
    const nx1 = x1 + (dx/length) * padding;
    const ny1 = y1 + (dy/length) * padding;
    const nx2 = x2 - (dx/length) * padding;
    const ny2 = y2 - (dy/length) * padding;
    return { nx1, ny1, nx2, ny2 };
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-8 font-sans text-slate-800 flex flex-col items-center">
      <h1 className="text-2xl sm:text-3xl font-extrabold mb-6 flex items-center gap-2">
        ✈️ Cheapest Flights Within K Stops (BFS)
      </h1>

      <div className="flex flex-col lg:flex-row gap-6 w-full max-w-6xl">
        
        {/* Panel Izquierdo: Mapa de Vuelos */}
        <div className="flex-[3] bg-white p-6 rounded-2xl shadow-lg border border-slate-200 flex flex-col">
          
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold">Mapa de Rutas</h2>
            <span className="text-sm font-bold bg-amber-100 text-amber-800 px-3 py-1 rounded-full border border-amber-300">
              Límite (K): {K_LIMIT} Escala
            </span>
          </div>

          <div className="relative w-full h-[400px] bg-slate-50 rounded-xl border border-slate-200 overflow-hidden shadow-inner">
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
              <defs>
                <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                  <polygon points="0 0, 10 3.5, 0 7" fill="#94a3b8" />
                </marker>
                <marker id="arrowhead-active" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                  <polygon points="0 0, 10 3.5, 0 7" fill="#eab308" />
                </marker>
              </defs>
              
              {FLIGHTS.map((edge, idx) => {
                const { nx1, ny1, nx2, ny2 } = getPath(edge.u, edge.v);
                const isActive = activeEdge && activeEdge.u === edge.u && activeEdge.v === edge.v;
                
                return (
                  <g key={idx}>
                    <line 
                      x1={`${nx1}%`} y1={`${ny1}%`} 
                      x2={`${nx2}%`} y2={`${ny2}%`} 
                      stroke={isActive ? "#eab308" : "#cbd5e1"} 
                      strokeWidth={isActive ? "4" : "2"} 
                      markerEnd={isActive ? "url(#arrowhead-active)" : "url(#arrowhead)"}
                      className={isActive ? "animate-pulse" : ""}
                    />
                    <circle cx={`${(nx1+nx2)/2}%`} cy={`${(ny1+ny2)/2}%`} r="14" fill="white" stroke={isActive ? "#eab308" : "#e2e8f0"} strokeWidth="2"/>
                    <text x={`${(nx1+nx2)/2}%`} y={`${(ny1+ny2)/2}%`} textAnchor="middle" dominantBaseline="central" className={`text-xs font-bold ${isActive ? 'fill-yellow-600' : 'fill-slate-500'}`}>
                      ${edge.w}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Nodos */}
            {Object.keys(NODES).map((n) => {
              const node = Number(n);
              const state = states[node] || 'idle';
              const price = phase === 'setup' && node !== 0 ? '∞' : (prices[node] === Infinity ? '∞' : prices[node]);
              
              let classes = "absolute w-16 h-16 -ml-8 -mt-8 rounded-full flex flex-col items-center justify-center font-bold transition-all duration-300 border-4 z-10 shadow-md ";
              if (state === 'current') classes += "bg-yellow-400 border-yellow-600 text-yellow-900 scale-110 z-30 ring-4 ring-yellow-200 animate-pulse";
              else if (state === 'visited') classes += "bg-slate-200 border-slate-400 text-slate-500 opacity-80";
              else if (state === 'queued') classes += "bg-cyan-100 border-cyan-400 text-cyan-800 scale-105";
              else classes += "bg-white border-slate-300 text-slate-700";

              // Color especial para el Target final
              if (node === 3 && state === 'visited') classes = "absolute w-16 h-16 -ml-8 -mt-8 rounded-full flex flex-col items-center justify-center font-bold transition-all duration-300 border-4 z-10 shadow-md bg-green-500 border-green-700 text-white scale-110";

              return (
                <div key={node} className={classes} style={{ left: `${NODES[node].x}%`, top: `${NODES[node].y}%` }}>
                  <span className="text-sm leading-none text-center px-1">{NODES[node].label}</span>
                  <span className={`text-[10px] bg-white text-slate-800 px-1.5 py-0.5 rounded-full absolute -bottom-3 border shadow-sm ${node === 3 ? 'border-green-600 font-bold text-green-700' : 'border-slate-300'}`}>
                    ${price}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            {phase === 'setup' && (
              <button onClick={startSimulation} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-md transition-transform hover:-translate-y-0.5">
                1. Iniciar Búsqueda 🚀
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

        {/* Panel Derecho: Cola y Logs */}
        <div className="flex-[2] flex flex-col gap-4">
          
          {/* Cola del BFS */}
          <div className="bg-white p-4 rounded-2xl shadow-md border border-slate-200">
            <h2 className="text-sm font-bold mb-2">📥 Cola de Vuelos (BFS)</h2>
            <div className="flex gap-2 overflow-x-auto py-2 items-center min-h-[4rem] bg-slate-50 rounded-lg px-2 border border-slate-100">
              {q.length === 0 ? (
                <span className="text-slate-400 italic text-xs w-full text-center">Vacía</span>
              ) : (
                q.map((item, idx) => (
                  <div key={idx} className={`flex-shrink-0 px-2 py-1.5 rounded-lg border text-xs flex flex-col items-center shadow-sm ${idx === 0 ? 'bg-yellow-100 border-yellow-400 text-yellow-900 font-bold scale-105' : 'bg-white border-slate-300 text-slate-600'}`}>
                    <span>Nodo {item.node}</span>
                    <span className="opacity-75">Costo: ${item.cost}</span>
                    <span className="font-bold text-red-500">Escalas: {item.stops}</span>
                  </div>
                ))
              )}
            </div>
            <p className="text-[10px] text-slate-400 mt-1 text-center">Controlamos las escalas metiéndolas en la misma cola.</p>
          </div>

          {/* Tabla de Precios */}
          <div className="bg-white p-4 rounded-2xl shadow-md border border-slate-200">
            <h2 className="text-sm font-bold mb-2">💸 Precios Mínimos Récord</h2>
            <div className="grid grid-cols-4 gap-2 text-center text-sm">
              {[0, 1, 2, 3].map(n => (
                <div key={n} className="flex flex-col border rounded-lg overflow-hidden shadow-sm">
                  <div className={`font-bold py-1 text-xs ${n===3 ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-600'}`}>Nodo {n}</div>
                  <div className={`py-1 bg-white font-mono ${prices[n] !== Infinity && phase !== 'setup' ? 'text-blue-600 font-bold' : 'text-slate-400'}`}>
                    {phase === 'setup' && n !== 0 ? '∞' : (prices[n] === Infinity ? '∞' : `$${prices[n]}`)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Consola */}
          <div className="bg-slate-900 text-green-400 p-4 rounded-2xl shadow-lg flex-1 min-h-[200px] flex flex-col font-mono text-sm border-4 border-slate-800 relative">
            <div className="absolute top-0 left-0 w-full bg-slate-800 text-slate-300 text-xs py-1 px-3 font-sans font-bold">
              Consola de Reservas
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