import React, { useState } from 'react';

// El ejemplo clásico de LeetCode
const INITIAL_PREORDER = [3, 9, 20, 15, 7];
const INITIAL_INORDER = [9, 3, 15, 20, 7];

export default function App() {
  const [frames, setFrames] = useState([]);
  const [step, setStep] = useState(0);
  const [phase, setPhase] = useState('setup'); // setup, running, done
  const [logs, setLogs] = useState(["Dale a 'Generar Árbol' para ver la magia recursiva."]);

  const addLog = (msg) => setLogs(prev => [...prev, msg].slice(-5));

  const generateFrames = () => {
    let generatedFrames = [];
    let currentNodes = [];
    let currentEdges = [];
    let preIndex = 0;
    
    // Hash map para O(1) lookup
    const inMap = {};
    INITIAL_INORDER.forEach((val, idx) => inMap[val] = idx);

    const pushFrame = (action, pIdx, inStart, inEnd, rootIdx, val, msg) => {
      generatedFrames.push({
        preIndex: pIdx,
        inStart,
        inEnd,
        rootIdx,
        activeVal: val,
        action, // 'pick_root', 'split_inorder', 'build_node'
        nodes: [...currentNodes],
        edges: [...currentEdges],
        logMsg: msg
      });
    };

    // Función recursiva que simula la construcción
    const build = (inStart, inEnd, depth, xPos, offset, parentVal) => {
      if (inStart > inEnd) return null;

      // 1. Tomar la raíz del Preorder
      const rootVal = INITIAL_PREORDER[preIndex];
      const currentPIdx = preIndex;
      pushFrame('pick_root', currentPIdx, inStart, inEnd, null, rootVal, `🔍 Tomamos el siguiente del Preorder: ${rootVal}. ¡Esa es nuestra raíz actual!`);
      
      preIndex++;

      // 2. Encontrar en Inorder para dividir
      const rootIdx = inMap[rootVal];
      pushFrame('split_inorder', currentPIdx, inStart, inEnd, rootIdx, rootVal, `✂️ Encontramos ${rootVal} en el Inorder (índice ${rootIdx}). Lo que está a su izq. es el sub-árbol izquierdo, y a su der. el derecho.`);

      // 3. Construir Nodo visualmente
      const newNode = { val: rootVal, x: xPos, y: depth * 25 + 10 };
      currentNodes.push(newNode);
      if (parentVal !== null) {
        // Encontrar al padre para trazar la línea
        const parentNode = currentNodes.find(n => n.val === parentVal);
        currentEdges.push({ x1: parentNode.x, y1: parentNode.y, x2: newNode.x, y2: newNode.y });
      }
      pushFrame('build_node', currentPIdx, inStart, inEnd, rootIdx, rootVal, `🌳 Creamos el nodo ${rootVal} en el árbol.`);

      // 4. Llamadas recursivas
      build(inStart, rootIdx - 1, depth + 1, xPos - offset, offset / 1.5, rootVal); // Izquierda
      build(rootIdx + 1, inEnd, depth + 1, xPos + offset, offset / 1.5, rootVal); // Derecha

      return rootVal;
    };

    pushFrame('start', 0, 0, INITIAL_INORDER.length - 1, null, null, "🚀 Iniciando algoritmo...");
    build(0, INITIAL_INORDER.length - 1, 0, 50, 20, null);
    
    // Frame final para limpiar los highlights
    generatedFrames.push({
      preIndex: INITIAL_PREORDER.length,
      inStart: -1,
      inEnd: -1,
      rootIdx: -1,
      activeVal: null,
      action: 'done',
      nodes: [...currentNodes],
      edges: [...currentEdges],
      logMsg: "🎉 ¡Árbol construido exitosamente!"
    });

    return generatedFrames;
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

  const currentFrame = frames[step] || { nodes: [], edges: [], preIndex: -1, inStart: -1, inEnd: -1, rootIdx: -1, activeVal: null };
  const { preIndex, inStart, inEnd, rootIdx, activeVal, nodes, edges, action } = currentFrame;

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-8 font-sans text-slate-800 flex flex-col items-center">
      <h1 className="text-2xl sm:text-3xl font-extrabold mb-6 flex items-center gap-2">
        🏗️ Construct Tree (Preorder & Inorder)
      </h1>

      <div className="flex flex-col lg:flex-row gap-6 w-full max-w-5xl">
        
        {/* Panel Izquierdo: Arreglos y Árbol */}
        <div className="flex-1 bg-white p-6 rounded-2xl shadow-lg border border-slate-200 flex flex-col gap-6">
          
          {/* Visualizador de Arreglos */}
          <div className="flex flex-col gap-4 bg-slate-100 p-4 rounded-xl border border-slate-200">
            {/* Preorder */}
            <div>
              <h3 className="text-sm font-bold text-slate-600 mb-2">1️⃣ Preorder (Nos da las raíces)</h3>
              <div className="flex gap-2 justify-center">
                {INITIAL_PREORDER.map((val, idx) => (
                  <div key={`pre-${idx}`} className={`w-10 h-10 flex items-center justify-center font-bold rounded border-2 transition-all
                    ${idx === preIndex && action !== 'done' ? 'bg-blue-500 border-blue-700 text-white scale-110 shadow-lg' : 
                      idx < preIndex ? 'bg-slate-300 border-slate-400 text-slate-500' : 'bg-white border-slate-300'}
                  `}>
                    {val}
                  </div>
                ))}
              </div>
            </div>

            {/* Inorder */}
            <div>
              <h3 className="text-sm font-bold text-slate-600 mb-2 mt-2">2️⃣ Inorder (Nos da los límites Izq/Der)</h3>
              <div className="flex gap-2 justify-center">
                {INITIAL_INORDER.map((val, idx) => {
                  let isRoot = idx === rootIdx;
                  let inRange = idx >= inStart && idx <= inEnd;
                  let isLeft = inRange && idx < rootIdx && rootIdx !== null;
                  let isRight = inRange && idx > rootIdx && rootIdx !== null;
                  let isProcessed = idx < inStart || idx > inEnd; // Simplificación visual

                  let classes = "w-10 h-10 flex items-center justify-center font-bold rounded border-2 transition-all ";
                  
                  if (isRoot) classes += "bg-yellow-400 border-yellow-600 text-yellow-900 scale-110 shadow-md ring-2 ring-yellow-300";
                  else if (isLeft) classes += "bg-green-200 border-green-400 text-green-800";
                  else if (isRight) classes += "bg-purple-200 border-purple-400 text-purple-800";
                  else if (inRange && action !== 'done') classes += "bg-white border-blue-400 border-dashed text-blue-800"; // Rango activo pero no dividido
                  else classes += "bg-slate-100 border-slate-200 text-slate-400 opacity-50";

                  return (
                    <div key={`in-${idx}`} className={classes}>
                      {val}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Lienzo del Árbol */}
          <div className="relative w-full aspect-square bg-slate-50 rounded-xl border border-slate-200 overflow-hidden shadow-inner">
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
              {edges.map((edge, idx) => (
                <line 
                  key={idx} 
                  x1={`${edge.x1}%`} y1={`${edge.y1}%`} 
                  x2={`${edge.x2}%`} y2={`${edge.y2}%`} 
                  stroke="#94a3b8" 
                  strokeWidth="3" 
                  className="animate-[dash_0.5s_ease-out_forwards]"
                  strokeDasharray="100"
                  strokeDashoffset="0"
                />
              ))}
            </svg>
            
            {nodes.map((node, idx) => (
              <div 
                key={idx} 
                className={`absolute w-12 h-12 -ml-6 -mt-6 rounded-full flex items-center justify-center font-bold text-lg border-2 z-10 shadow-md transition-all duration-300
                  ${node.val === activeVal && action === 'build_node' ? 'bg-blue-500 border-blue-700 text-white scale-125 ring-4 ring-blue-300' : 'bg-white border-slate-400 text-slate-700'}
                `}
                style={{ left: `${node.x}%`, top: `${node.y}%` }}
              >
                {node.val}
              </div>
            ))}
          </div>

        </div>

        {/* Panel Derecho: Controles y Consola */}
        <div className="flex-1 flex flex-col gap-4">
          
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200">
            <div className="flex flex-col gap-3">
              {phase === 'setup' && (
                <button onClick={startSimulation} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-md transition-transform hover:-translate-y-0.5">
                  1. Generar Árbol
                </button>
              )}
              
              {(phase === 'running' || phase === 'done') && (
                <button onClick={nextStep} disabled={phase === 'done'} className={`font-bold py-3 rounded-xl shadow-lg transition-transform flex items-center justify-center gap-2 ${phase === 'done' ? 'bg-slate-300 text-slate-500' : 'bg-green-600 hover:bg-green-700 text-white hover:-translate-y-0.5'}`}>
                  {phase === 'done' ? '🏁 Construcción Finalizada' : '2. Avanzar Recursión 👣'}
                </button>
              )}

              <button onClick={reset} className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2 rounded-xl border border-slate-300">
                🔄 Reiniciar
              </button>
            </div>
          </div>

          {/* Consola de Logs */}
          <div className="bg-slate-900 text-green-400 p-6 rounded-2xl shadow-lg flex-1 min-h-[300px] flex flex-col font-mono text-sm border-4 border-slate-800 relative">
            <div className="absolute top-0 left-0 w-full bg-slate-800 text-slate-300 text-xs py-1.5 px-4 font-sans font-bold shadow-sm">
              Consola de Eventos
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