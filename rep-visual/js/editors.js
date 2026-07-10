/* ============================================================================
   editors.js — Parsers y vistas previas compartidos por los descriptores
   `problem.editor`. Funciones puras: sin DOM, sin estado.

   Un parser devuelve `{ok:true, ...}` o `{ok:false, error:{es,en}}`. El error
   dice QUÉ está mal (qué token, cuántos nodos caben), no solo que algo falla:
   el usuario lo lee mientras escribe.
   ============================================================================ */
(function () {
  const VIS = window.VIS || (window.VIS = {});
  VIS.parse = VIS.parse || {};
  VIS.preview = VIS.preview || {};

  const err = (es, en) => ({ ok: false, error: { es, en } });

  /* Notación de LeetCode para árboles: "[3,9,20,null,null,15,7]".
     Por niveles, con `null` para los huecos. Los corchetes son opcionales,
     pero si hay uno tiene que estar el otro.                                */
  VIS.parse.treeArray = function (text, maxNodes) {
    let s = String(text == null ? "" : text).trim();
    if (!s) return err("Escribe un árbol, por ejemplo [1,2,3].",
                       "Type a tree, for example [1,2,3].");

    const abre = s.startsWith("["), cierra = s.endsWith("]");
    if (abre !== cierra) {
      return abre ? err("Falta cerrar el corchete.", "The bracket is not closed.")
                  : err("Falta abrir el corchete.", "The bracket is not opened.");
    }
    if (abre) s = s.slice(1, -1).trim();
    if (!s) return err("El árbol está vacío: escribe al menos la raíz.",
                       "The tree is empty: type at least the root.");

    const partes = s.split(",");
    const arr = [];
    for (const bruto of partes) {
      const t = bruto.trim();
      if (t === "") {
        return err("Hay una coma de más.", "There is one comma too many.");
      }
      if (t === "null") { arr.push(null); continue; }
      if (!/^-?\d+$/.test(t)) {
        return err(`"${t}" no es un número ni null.`, `"${t}" is not a number or null.`);
      }
      arr.push(parseInt(t, 10));
    }

    if (arr[0] == null) {
      return err("La raíz no puede ser null.", "The root cannot be null.");
    }
    const nodos = arr.filter((v) => v != null).length;
    if (nodos > maxNodes) {
      return err(`Demasiados nodos: ${nodos}. Caben ${maxNodes}.`,
                 `Too many nodes: ${nodos}. The limit is ${maxNodes}.`);
    }
    return { ok: true, arr };
  };

  VIS.parse.edgeList = function (text, maxNodos) {
    let s = String(text == null ? "" : text).trim();
    if (!s) return err("Escribe aristas, ej: [[0,1]].", "Type edges, ex: [[0,1]].");
    let arr;
    try { arr = JSON.parse(s); }
    catch (e) { return err("Sintaxis inválida. Verifica corchetes.", "Invalid syntax. Check brackets."); }
    if (!Array.isArray(arr)) return err("Debe ser una lista de listas.", "Must be a list of lists.");
    
    let maxFound = -1;
    for (const edge of arr) {
      if (!Array.isArray(edge) || edge.length !== 2) return err("Cada arista debe tener 2 nodos.", "Each edge must have 2 nodes.");
      for (const node of edge) {
        if (!Number.isInteger(node) || node < 0) return err(`Nodo inválido: ${node}.`, `Invalid node: ${node}.`);
        if (node >= maxNodos) return err(`El nodo ${node} supera el límite de ${maxNodos - 1}.`, `Node ${node} exceeds the limit of ${maxNodos - 1}.`);
        if (node > maxFound) maxFound = node;
      }
    }
    return { ok: true, edges: arr, n: Math.max(0, maxFound + 1) };
  };

  VIS.parse.prereqList = function (text, maxNodos) {
    const res = VIS.parse.edgeList(text, maxNodos);
    if (!res.ok) return res;
    return { ok: true, prereqs: res.edges, n: res.n };
  };

  VIS.parse.adjList = function (text, maxNodos) {
    let s = String(text == null ? "" : text).trim();
    if (!s) return err("Escribe adyacencias, ej: [[2,4],[1,3]].", "Type adjacencies, ex: [[2,4],[1,3]].");
    let arr;
    try { arr = JSON.parse(s); }
    catch (e) { return err("Sintaxis inválida. Verifica corchetes.", "Invalid syntax. Check brackets."); }
    if (!Array.isArray(arr)) return err("Debe ser una lista de listas.", "Must be a list of lists.");
    
    let n = arr.length;
    if (n > maxNodos) return err(`Demasiados nodos: ${n}. Caben ${maxNodos}.`, `Too many nodes: ${n}. The limit is ${maxNodos}.`);
    
    for (const edge of arr) {
      if (!Array.isArray(edge)) return err("Debe ser una lista de listas.", "Must be a list of lists.");
      for (const node of edge) {
        if (!Number.isInteger(node) || node < 1) return err(`Nodo inválido: ${node}.`, `Invalid node: ${node}.`);
        // En LeetCode 133, los nodos van de 1 a n
        if (node > n) return err(`El nodo ${node} no existe, hay ${n}.`, `Node ${node} does not exist, there are ${n}.`);
      }
    }
    return { ok: true, adj: arr, n: n };
  };

  /* Vista previa de un grafo general.
     input: {n, edges, prereqs, adj, directed} */
  VIS.preview.graph = function (input, label) {
    const n = input.n || 0;
    // circleLayout(n, cx, cy, R) está en renderers.js
    const pos = VIS.circleLayout(n, 150, 150, 100);
    const nodes = [];
    for (let i = 0; i < n; i++) {
      nodes.push({ id: i, label: String(i), x: pos[i][0], y: pos[i][1], cls: "" });
    }

    const edges = [];
    if (input.edges) {
      input.edges.forEach(e => {
        edges.push({ from: e[0], to: e[1], directed: input.directed });
      });
    } else if (input.prereqs) {
      input.prereqs.forEach(e => {
        edges.push({ from: e[1], to: e[0], directed: input.directed });
      });
    } else if (input.adj) {
      input.adj.forEach((vecinos, i) => {
        const u = i + 1;
        vecinos.forEach(v => {
          if (u < v) edges.push({ from: u, to: v, directed: false });
        });
      });
      for (let i = 0; i < n; i++) {
        nodes[i].id = i + 1;
        nodes[i].label = String(i + 1);
      }
    }

    return {
      type: "graph", label, r: 18,
      nodes, edges
    };
  };

  /* Vista previa de un árbol, con los mismos ayudantes que usa build().
     `resaltados` es opcional: los nodos cuyo valor esté en la lista se pintan
     con la clase `target`, la misma que usa build() para marcar lo buscado.
     Un valor que no está en el árbol simplemente no marca nada: 1644 lo
     necesita, porque su caso didáctico es un nodo que no existe.             */
  VIS.preview.tree = function (arr, label, resaltados) {
    const marca = new Set(resaltados || []);
    const root = VIS.treeFromArray(arr);
    const layout = VIS.binaryLayout(root);
    return {
      type: "tree", label, r: 18,
      nodes: layout.nodes.map((n) => ({
        id: n.id, label: n.label, x: n.x, y: n.y,
        cls: marca.has(n.label) ? "target" : "",
      })),
      edges: layout.edges,
    };
  };

  const ETIQUETA_ARBOL = { es: "Árbol", en: "Tree" };
  // Un árbol grande sí cabe: el SVG lleva viewBox y se escala al ancho del
  // panel. Lo que se pierde es la letra. Medido en un panel de 620px: 11 nodos
  // → 10.3px, 15 → 7.6px, 20 → 5.7px, 31 → 3.7px. El caso predefinido más
  // grande del visualizador (236) tiene 11 nodos.
  const MAX_NODOS = 15;

  /* ------------------------------------------------------ ayudantes de árbol
     Funciones puras sobre el arreglo de LeetCode. Los editores las usan para
     poblar sus desplegables.                                                 */
  VIS.arbol = VIS.arbol || {};

  VIS.arbol.valores = function (arr) {
    const root = VIS.treeFromArray(arr);
    const vals = [];
    (function recorrer(n) {
      if (!n) return;
      vals.push(n.val);
      recorrer(n.left);
      recorrer(n.right);
    })(root);
    return [...new Set(vals)].sort((a, b) => a - b);
  };

  /* La distancia entre dos nodos puede subir y volver a bajar, así que el
     diámetro NO es la altura: en [3,5,1,6,2,0,8,null,null,7,4] la altura es 4
     y el diámetro 5. Se recorre el árbol como un grafo no dirigido.          */
  VIS.arbol.diametro = function (arr) {
    const root = VIS.treeFromArray(arr);
    if (!root) return 0;
    const vecinos = new Map();
    const unir = (a, b) => {
      if (!vecinos.has(a)) vecinos.set(a, []);
      vecinos.get(a).push(b);
    };
    (function recorrer(n, padre) {
      if (!n) return;
      if (!vecinos.has(n.id)) vecinos.set(n.id, []);
      if (padre != null) { unir(n.id, padre); unir(padre, n.id); }
      recorrer(n.left, n.id);
      recorrer(n.right, n.id);
    })(root, null);

    let diam = 0;
    for (const inicio of vecinos.keys()) {
      const dist = new Map([[inicio, 0]]);
      const cola = [inicio];
      while (cola.length) {
        const u = cola.shift();
        for (const v of vecinos.get(u)) {
          if (!dist.has(v)) { dist.set(v, dist.get(u) + 1); cola.push(v); }
        }
      }
      for (const d of dist.values()) diam = Math.max(diam, d);
    }
    return diam;
  };

  const opcion = (v) => ({ value: String(v), label: String(v) });

  VIS.arbol.opcionesDeNodos = function (texto) {
    const r = VIS.parse.treeArray(texto, MAX_NODOS);
    if (!r.ok) return [];
    return VIS.arbol.valores(r.arr).map(opcion);
  };

  VIS.arbol.opcionesDeK = function (texto) {
    const r = VIS.parse.treeArray(texto, MAX_NODOS);
    if (!r.ok) return [];
    const d = VIS.arbol.diametro(r.arr);
    return Array.from({ length: d + 1 }, (_, i) => opcion(i));
  };

  /* El campo de texto del árbol es idéntico en los tres editores que lo usan.
     Se devuelve un objeto nuevo en cada llamada, incluidos `label` y
     `placeholder`: si se compartieran, mutar el campo de un problema
     cambiaría el de los otros.                                              */
  VIS.arbol.campo = function () {
    return {
      id: "tree", type: "text",
      label: { es: ETIQUETA_ARBOL.es, en: ETIQUETA_ARBOL.en },
      placeholder: { es: "[1,2,3,null,4]", en: "[1,2,3,null,4]" },
    };
  };

  /* Parsea el campo `tree` y convierte a número los parámetros nombrados.

     Existe para que el límite de nodos y el manejo del error del árbol vivan en
     un solo sitio: 236 y 1644 tenían un `parse` idéntico carácter a carácter, y
     863 solo cambiaba los nombres de sus dos parámetros.

     Si un campo nombrado no está en `state` (o no es un número), se rechaza
     con un error que nombra el campo culpable: dejarlo pasar produciría un
     NaN silencioso que llega hasta build() sin ningún mensaje.               */
  VIS.arbol.parseCon = function (state, numericos) {
    const r = VIS.parse.treeArray(state.tree, MAX_NODOS);
    if (!r.ok) return { ok: false, field: "tree", error: r.error };
    const input = { tree: r.arr };
    for (const id of numericos || []) {
      const n = Number(state[id]);
      if (Number.isNaN(n)) {
        return { ok: false, field: id, error: {
          es: `"${id}" tiene que ser un número.`,
          en: `"${id}" must be a number.`,
        } };
      }
      input[id] = n;
    }
    return { ok: true, input };
  };

  /* Descriptor completo de un problema de grafo. */
  VIS.graphEditor = function (opciones) {
    return {
      kind: "text",
      fields: [{ 
        id: "graph", type: "text",
        label: { es: "Grafo", en: "Graph" },
        placeholder: { es: opciones.defaultInput, en: opciones.defaultInput }
      }],
      initial() { return { graph: opciones.defaultInput }; },
      parse(state) {
        const r = opciones.parser(state.graph, opciones.maxNodos);
        if (!r.ok) return { ok: false, field: "graph", error: r.error };
        r.directed = opciones.directed;
        return { ok: true, input: r };
      },
      previewSpec(input) { return VIS.preview.graph(input, { es: "Grafo", en: "Graph" }); },
      hint: opciones.hint
    };
  };

  /* Descriptor completo de un problema de árbol. Los ocho reciben el mismo
     arreglo de LeetCode: comparten `parse` y `previewSpec`, y solo cambian el
     árbol de partida y la instrucción. Escribirlo ocho veces sería copiarlo
     ocho veces.                                                              */
  VIS.treeEditor = function (arranque, hint) {
    return {
      kind: "text",
      fields: [VIS.arbol.campo()],
      initial() { return { tree: arranque }; },
      parse(state) {
        const r = VIS.parse.treeArray(state.tree, MAX_NODOS);
        if (!r.ok) return { ok: false, field: "tree", error: r.error };
        return { ok: true, input: r.arr };
      },
      previewSpec(arr) { return VIS.preview.tree(arr, ETIQUETA_ARBOL); },
      hint,
    };
  };
})();
