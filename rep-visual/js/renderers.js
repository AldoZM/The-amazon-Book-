/* ============================================================================
   renderers.js — Pintores puros. Cada uno recibe una especificación y
   devuelve un elemento del DOM. Sin estado, sin dependencias.
   Namespace global: window.VIS
   ============================================================================ */
(function () {
  const VIS = window.VIS || (window.VIS = {});

  function el(tag, cls, txt) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (txt != null) e.textContent = txt;
    return e;
  }
  function svgEl(tag, attrs) {
    const e = document.createElementNS("http://www.w3.org/2000/svg", tag);
    if (attrs) for (const k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  }
  VIS.el = el;

  /* ---- Caja con etiqueta ---- */
  function box(label, content) {
    const b = el("div", "stage-box");
    label = VIS.pick ? VIS.pick(label) : label;
    if (label) b.appendChild(el("div", "label", label));
    b.appendChild(content);
    return b;
  }

  /* ------------------------------------------------------------------ GRID */
  // spec: { label, cells: [[{v, cls}]], coords }
  VIS.renderers = {};
  VIS.renderers.grid = function (spec) {
    const cells = spec.cells || [];
    const rows = cells.length;
    const cols = rows ? cells[0].length : 0;
    const g = el("div", "grid");
    // El ancho de celda es fluido (var --cell): 42px en monitor, se encoge en
    // móvil. Ver css/styles.css.
    g.style.gridTemplateColumns = `repeat(${cols}, var(--cell))`;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const cell = cells[r][c] || {};
        const d = el("div", "cell " + (cell.cls || ""));
        if (spec.coords) {
          const co = el("span", "coord", r + "," + c);
          d.appendChild(co);
        }
        d.appendChild(document.createTextNode(cell.v != null ? cell.v : ""));
        g.appendChild(d);
      }
    }
    return box(spec.label, g);
  };

  /* --------------------------------------------------- COLA / PILA / LISTA */
  // spec: { type:'queue'|'stack'|'list', label, items:[{v,cls}], arrows }
  function renderDS(spec) {
    const wrap = el("div", "ds " + (spec.type === "stack" ? "stack" : ""));
    const items = spec.items || [];
    if (items.length === 0) wrap.appendChild(el("span", "arrow", "∅ vacío"));
    items.forEach((it, i) => {
      const item = typeof it === "object" ? it : { v: it };
      wrap.appendChild(el("div", "item " + (item.cls || ""), String(item.v)));
      if (spec.arrows && i < items.length - 1) wrap.appendChild(el("span", "arrow", "→"));
    });
    return box(spec.label, wrap);
  }
  VIS.renderers.queue = renderDS;
  VIS.renderers.stack = renderDS;
  VIS.renderers.list = renderDS;

  /* ------------------------------------------------------------ VARIABLES */
  // spec: { vars: [{k, v, cls}] }  o  { vars: {k:v} }
  VIS.renderers.vars = function (spec) {
    const wrap = el("div", "vars");
    let arr = spec.vars;
    if (!Array.isArray(arr)) arr = Object.keys(arr).map((k) => ({ k, v: arr[k] }));
    arr.forEach((v) => {
      const c = el("div", "chip " + (v.cls || ""));
      c.appendChild(el("b", null, (VIS.pick ? VIS.pick(v.k) : v.k) + ": "));
      c.appendChild(document.createTextNode(String(v.v)));
      wrap.appendChild(c);
    });
    return wrap;
  };

  /* --------------------------------------------------- GRAFO / ÁRBOL (SVG) */
  // spec: { label, nodes:[{id,label,x,y,cls,shape}], edges:[{from,to,cls,directed,label}] }
  // Coordenadas en unidades arbitrarias; se calcula el viewBox automáticamente.
  VIS.renderers.graph = function (spec) {
    const nodes = spec.nodes || [];
    const edges = spec.edges || [];
    const R = spec.r || 20;
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    const pos = {};
    nodes.forEach((n) => {
      pos[n.id] = n;
      minX = Math.min(minX, n.x); maxX = Math.max(maxX, n.x);
      minY = Math.min(minY, n.y); maxY = Math.max(maxY, n.y);
    });
    const pad = R + 24;
    const w = (maxX - minX) + pad * 2;
    const h = (maxY - minY) + pad * 2;
    const svg = svgEl("svg", { viewBox: `${minX - pad} ${minY - pad} ${w} ${h}` });

    // flecha marcador
    const defs = svgEl("defs");
    const marker = svgEl("marker", {
      id: "arrow", viewBox: "0 0 10 10", refX: R + 9, refY: 5,
      markerWidth: 7, markerHeight: 7, orient: "auto-start-reverse",
    });
    marker.appendChild(svgEl("path", { d: "M0,0 L10,5 L0,10 z", fill: "#8b949e" }));
    defs.appendChild(marker);
    svg.appendChild(defs);

    // aristas
    edges.forEach((e) => {
      const a = pos[e.from], b = pos[e.to];
      if (!a || !b) return;
      const line = svgEl("line", {
        x1: a.x, y1: a.y, x2: b.x, y2: b.y,
        class: "edge " + (e.cls || ""),
      });
      if (e.directed) line.setAttribute("marker-end", "url(#arrow)");
      svg.appendChild(line);
      if (e.label != null) {
        const t = svgEl("text", {
          x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 - 5,
          class: "edge-label", "text-anchor": "middle",
        });
        t.textContent = e.label;
        svg.appendChild(t);
      }
    });

    // nodos
    nodes.forEach((n) => {
      const gg = svgEl("g", { class: "node " + (n.cls || "") });
      const fill = nodeFill(n.cls);
      const stroke = nodeStroke(n.cls);
      if (n.shape === "rect") {
        gg.appendChild(svgEl("rect", {
          x: n.x - R, y: n.y - R, width: R * 2, height: R * 2, rx: 6,
          fill, stroke, "stroke-width": 2,
        }));
      } else {
        gg.appendChild(svgEl("circle", { cx: n.x, cy: n.y, r: R, fill, stroke, "stroke-width": 2 }));
      }
      const t = svgEl("text", { x: n.x, y: n.y + 4, "text-anchor": "middle", fill: nodeText(n.cls) });
      t.textContent = n.label != null ? n.label : n.id;
      gg.appendChild(t);
      svg.appendChild(gg);
    });

    const w2 = el("div", "svg-stage");
    w2.appendChild(svg);
    return box(spec.label, w2);
  };
  VIS.renderers.tree = VIS.renderers.graph; // mismo pintor

  function nodeFill(cls) {
    switch (cls) {
      case "current": return "#1f6feb";
      case "visited": return "#24304a";
      case "done":    return "#12331e";
      case "frontier":return "#3a2d12";
      case "path":    return "#a371f7";
      case "target":  return "#1e3a2f";
      default:        return "#1c2330";
    }
  }
  function nodeStroke(cls) {
    switch (cls) {
      case "current": return "#ffffff";
      case "visited": return "#1f6feb";
      case "done":    return "#3fb950";
      case "frontier":return "#d29922";
      case "path":    return "#ffffff";
      case "target":  return "#39c5cf";
      default:        return "#30363d";
    }
  }
  function nodeText(cls) {
    if (cls === "current" || cls === "path") return "#ffffff";
    return "#e6edf3";
  }

  /* -------------------------------------------- Layout de árbol binario ---
     Recibe un árbol { id, val, left, right } y devuelve {nodes, edges}
     con coordenadas: x por recorrido inorden, y por profundidad.            */
  VIS.binaryLayout = function (root, opt) {
    opt = opt || {};
    const dx = opt.dx || 70, dy = opt.dy || 74;
    const nodes = [], edges = [];
    let counter = 0;
    (function walk(node, depth, parentId) {
      if (!node) return;
      walk(node.left, depth + 1, node.id);
      const x = counter++ * dx;
      const y = depth * dy;
      nodes.push({ id: node.id, label: node.val, x, y, _depth: depth });
      if (parentId != null) edges.push({ from: parentId, to: node.id });
      walk(node.right, depth + 1, node.id);
    })(root, 0, null);
    return { nodes, edges };
  };

  /* Coloca n nodos en círculo. Devuelve [[x,y], ...]. */
  VIS.circleLayout = function (n, cx, cy, R) {
    const pos = [];
    for (let i = 0; i < n; i++) {
      const a = -Math.PI / 2 + (2 * Math.PI * i) / n;
      pos.push([cx + R * Math.cos(a), cy + R * Math.sin(a)]);
    }
    return pos;
  };

  /* Construye un árbol { id,val,left,right } desde arreglo por niveles
     (formato LeetCode, con null para huecos). Asigna ids únicos.            */
  VIS.treeFromArray = function (arr) {
    if (!arr || !arr.length || arr[0] == null) return null;
    let id = 0;
    const root = { id: id++, val: arr[0], left: null, right: null };
    const q = [root];
    let i = 1;
    while (q.length && i < arr.length) {
      const node = q.shift();
      if (i < arr.length) { const v = arr[i++]; if (v != null) { node.left = { id: id++, val: v, left: null, right: null }; q.push(node.left); } }
      if (i < arr.length) { const v = arr[i++]; if (v != null) { node.right = { id: id++, val: v, left: null, right: null }; q.push(node.right); } }
    }
    return root;
  };

  /* --------------------------------------------------------- CÓDIGO -------
     Pinta las líneas una vez; luego solo se conmuta la clase .active.        */
  // Palabras clave del pseudocódigo (español + inglés).
  const KEYWORDS = new Set([
    // español
    "funcion", "función", "si", "sino", "entonces", "mientras", "para", "repetir",
    "veces", "hasta", "hacer", "retornar", "retorna", "cada", "de", "del", "en",
    "no", "y", "o", "seguir", "continuar", "algoritmo", "inicio", "fin",
    // cópulas y conectores del pseudocódigo en prosa ("si la celda es tierra")
    "es", "está", "esta", "son", "sea", "desde", "mientras",
    // verbos de asignación: sustituyen a la flecha ←, así que se pintan igual
    "empieza", "empiezan", "pasa", "pasan", "sumar", "restar", "llamarlo",
    "llamarla", "guardar", "guarda", "marcar",
    "starts", "start", "becomes", "become", "add", "subtract", "call", "mark", "holds",
    // inglés
    "function", "if", "else", "elif", "for", "while", "repeat", "times", "return",
    "each", "in", "of", "is", "not", "and", "or", "do", "until", "break", "continue",
    "from", "to", "then",
  ]);
  const LITERALS = new Set([
    "nulo", "verdadero", "falso", "vacía", "vacío", "vacia", "vacio", "infinito",
    "null", "true", "false", "empty", "infinity",
  ]);

  // Divide una línea en tokens {text, cls} sin usar innerHTML (evita inyección).
  function tokenize(line) {
    const out = [];
    let i = 0;
    const push = (text, cls) => out.push({ text, cls });
    while (i < line.length) {
      const c = line[i];
      // comentario hasta fin de línea
      if (c === "/" && line[i + 1] === "/") { push(line.slice(i), "tok-com"); break; }
      // cadena "..." o '...'
      if (c === '"' || c === "'") {
        let j = i + 1;
        while (j < line.length && line[j] !== c) j++;
        push(line.slice(i, Math.min(j + 1, line.length)), "tok-str");
        i = j + 1; continue;
      }
      // número
      if (/[0-9]/.test(c)) {
        let j = i; while (j < line.length && /[0-9]/.test(line[j])) j++;
        push(line.slice(i, j), "tok-num"); i = j; continue;
      }
      // palabra (identificador / keyword / literal)
      if (/[A-Za-zÁÉÍÓÚáéíóúÑñ_]/.test(c)) {
        let j = i; while (j < line.length && /[A-Za-z0-9ÁÉÍÓÚáéíóúÑñ_]/.test(line[j])) j++;
        const w = line.slice(i, j);
        const low = w.toLowerCase();
        let cls = null;
        if (KEYWORDS.has(low)) cls = "tok-key";
        else if (LITERALS.has(low)) cls = "tok-lit";
        else if (line[j] === "(") cls = "tok-fn";   // nombre de función
        push(w, cls); i = j; continue;
      }
      // operadores y símbolos
      if ("←→≥≤≠∞+-*/=<>≈".indexOf(c) >= 0) { push(c, "tok-op"); i++; continue; }
      // resto (espacios, puntuación) sin color
      push(c, null); i++;
    }
    return out;
  }

  VIS.renderCode = function (container, lines) {
    container.innerHTML = "";
    const pre = el("pre", "code");
    lines.forEach((line, i) => {
      const ln = el("div", "ln");
      ln.dataset.line = i;
      ln.appendChild(el("span", "gutter", String(i + 1)));
      const code = el("span", "src");
      if (line.length) tokenize(line).forEach((t) => code.appendChild(el("span", t.cls, t.text)));
      else code.appendChild(document.createTextNode(" "));
      ln.appendChild(code);
      pre.appendChild(ln);
    });
    container.appendChild(pre);
    return pre;
  };
  VIS.highlightLine = function (pre, idx) {
    const prev = pre.querySelectorAll(".ln.active");
    prev.forEach((p) => p.classList.remove("active"));
    const set = Array.isArray(idx) ? idx : [idx];
    let first = null;
    set.forEach((i) => {
      const ln = pre.querySelector(`.ln[data-line="${i}"]`);
      if (ln) { ln.classList.add("active"); if (!first) first = ln; }
    });
    if (first) {
      const top = first.offsetTop - pre.clientHeight / 2;
      pre.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
    }
  };
})();
