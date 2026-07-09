/* ============================================================================
   dearrow.js — Sustituye la flecha de asignación `←` por el verbo natural de
   cada operación, en el pseudocódigo de los módulos de problema.

   No es un reemplazo mecánico: el verbo depende del patrón.

     X ← 0                    →  X empieza en 0            X starts at 0
     cola ← vacía             →  cola empieza vacía        queue starts empty
     puentes ← []             →  puentes empieza como lista vacía
     X ← X + 1                →  sumar 1 a X               add 1 to X
     X ← X - 1                →  restar 1 a X              subtract 1 from X
     X ← <expresión>          →  X pasa a ser <expr>       X becomes <expr>

   Ojo: `dist[v] ← dist[u] + w` NO es un incremento de dist[v] (el lado
   izquierdo no coincide con la base del derecho) → "pasa a ser".

   Uso:  node tools/dearrow.js            (dry-run: imprime el diff)
         node tools/dearrow.js --write    (aplica)
   ========================================================================= */
"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.resolve(__dirname, "..");
const JS = path.join(ROOT, "js");
const PROBLEMS_DIR = path.join(JS, "problems");
const WRITE = process.argv.includes("--write");

/* --- Sandbox de navegador mínimo (igual que validate-code.js) ------------- */
function makeSandbox() {
  const noopEl = () => ({
    appendChild() {}, setAttribute() {}, classList: { add() {}, remove() {}, toggle() {} },
    dataset: {}, style: {}, querySelector: () => null, querySelectorAll: () => [],
  });
  const s = {
    document: {
      createElement: noopEl, createTextNode: () => ({}),
      querySelector: () => null, querySelectorAll: () => [],
      documentElement: { setAttribute() {} }, getElementById: () => null, addEventListener() {},
    },
    localStorage: { getItem: () => null, setItem() {} },
    location: { search: "" },
    URLSearchParams: class { get() { return null; } },
    console,
  };
  s.window = s;
  vm.createContext(s);
  return s;
}

/* --- Separa cuerpo y comentario, conservando la columna del `//` ---------- */
function split(line) {
  const i = line.indexOf("//");
  if (i < 0) return { body: line, comment: null, col: 0 };
  return { body: line.slice(0, i).replace(/\s+$/, ""), comment: line.slice(i), col: i };
}
function join(indent, body, comment, col) {
  const full = indent + body;
  if (!comment) return full;
  const pad = Math.max(col - full.length, 2);
  return full + " ".repeat(pad) + comment;
}

/* --- ¿El lado derecho es un valor inicial (literal), no una expresión? ---- */
// El valor inicial puede llevar una coletilla: "0, para cada letra c".
const INIT_ES = [
  [/^(\d+|menos infinito|más infinito|-?\s*infinito)(,.*)?$/, (v) => `empieza en ${v}`],
  [/^(lista |cadena )?vacía?$/,    ()  => `empieza vacía`],
  [/^vacío$/,                      ()  => `empieza vacío`],
  [/^\[\]$/,                       ()  => `empieza como lista vacía`],
  [/^sin visitar(,.*)?$/,          (v) => `empieza sin visitar${v.slice("sin visitar".length)}`],
];
const INIT_EN = [
  [/^(\d+|negative infinity|positive infinity|-?\s*infinity)(,.*)?$/, (v) => `starts at ${v}`],
  [/^(an? )?empty( list| string| set)?$/, () => `starts empty`],
  [/^\[\]$/,                       ()  => `starts as an empty list`],
  [/^unvisited(,.*)?$/,            (v) => `starts unvisited${v.slice("unvisited".length)}`],
];

// Escapa para construir un regex a partir de un identificador con [ ] ( ) .
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/* --- Excepciones -----------------------------------------------------------
   La regla genérica produce castellano malo en tres familias:

     (r, c) ← sacar de la cola   →  "(r,c) pasa a ser sacar…"  (verbo de sujeto)
     cola ← [root]               →  "cola pasa a ser [root]"   (es inicializar)
     nivel ← lista vacía         →  "nivel empieza vacía"      (concordancia)

   Aquí van escritas a mano, con su inglés.                                   */
const OVERRIDES = {
  es: new Map(Object.entries({
    // sacar de la cola: el nombre va al final
    "nodo ← sacar el primero de la cola":        "sacar el primero de la cola y llamarlo nodo",
    "actual ← sacar el primero de la cola":      "sacar el primero de la cola y llamarlo actual",
    "curso ← sacar el primero de la cola":       "sacar el primero de la cola y llamarlo curso",
    "c ← sacar la primera letra de la cola":     "sacar la primera letra de la cola y llamarla c",
    "(r, c) ← sacar el frente de la cola":       "sacar la primera de la cola y llamarla (r, c)",
    "(r, c) ← sacar la primera de la cola":      "sacar la primera de la cola y llamarla (r, c)",
    "(r, c) ← sacar el primero de la cola":      "sacar la primera de la cola y llamarla (r, c)",
    // colecciones que empiezan con algo dentro
    "cola ← [root]":                             "cola empieza con root dentro",
    "cola ← [(0, 0)]":                           "cola empieza con (0, 0) dentro",
    "cola ← lista con el par (begin, 1 paso)":   "cola empieza con el par (begin, 1 paso) dentro",
    "cola ← lista con la terna (root, fila 0, columna 0)": "cola empieza con la terna (root, fila 0, columna 0) dentro",
    "cola ← todas las naranjas podridas":        "cola empieza con todas las naranjas podridas dentro",
    "nivel ← conjunto que contiene solo a begin":  "nivel empieza con begin dentro",
    "visto ← conjunto que contiene solo a begin":  "visto empieza con begin dentro",
    "visto ← conjunto que contiene solo a target": "visto empieza con target dentro",
    // concordancia de género
    "nivel ← lista vacía":                       "nivel empieza vacío",
    "orden ← lista vacía":                       "orden empieza vacío",
    "siguiente ← lista vacía":                   "siguiente empieza vacío",
    "siguiente ← conjunto vacío":                "siguiente empieza vacío",
    // asignaciones que no son "pasar a ser"
    "padres ← para cada palabra, la lista de palabras desde las que se llegó a ella":
      "padres guarda, para cada palabra, la lista de palabras desde las que se llegó a ella",
    "mapa ← para cada columna, una lista de pares (fila, valor)":
      "mapa guarda, para cada columna, una lista de pares (fila, valor)",
    "tmp ← una copia de dist":                   "tmp empieza como una copia de dist",
    "señales ← contar cuántas de estas tres se cumplen: buscado, izq no es nulo, der no es nulo":
      "señales pasa a ser cuántas de estas tres se cumplen: buscado, izq no es nulo, der no es nulo",
    // más colecciones que se inicializan con algo dentro
    "cola ← el nodo inicial":                    "cola empieza con el nodo inicial dentro",
    "cola ← los cursos con grado 0":             "cola empieza con los cursos de grado 0 dentro",
    "cola ← las letras con grado 0":             "cola empieza con las letras de grado 0 dentro",
    "cola ← lista que contiene solo a target":   "cola empieza con target dentro",
    "conj ← un conjunto con todos los números":  "conj empieza con todos los números dentro",
    "componentes ← n":                           "componentes empieza en n",
    // plural y cópula
    "c1 y c2 ← las primeras letras en que a y b difieren":
      "c1 y c2 pasan a ser las primeras letras en que a y b difieren",
    "vecinos ← su hijo izquierdo, su hijo derecho y su padre":
      "vecinos son su hijo izquierdo, su hijo derecho y su padre",
  })),
  en: new Map(Object.entries({
    "node ← take the first one out of the queue":    "take the first one out of the queue and call it node",
    "node ← take the first from the queue":          "take the first one out of the queue and call it node",
    "current ← take the first one out of the queue": "take the first one out of the queue and call it current",
    "course ← take the first one out of the queue":  "take the first one out of the queue and call it course",
    "c ← take the first letter out of the queue":    "take the first letter out of the queue and call it c",
    "(r, c) ← pop the front of the queue":           "take the first one out of the queue and call it (r, c)",
    "(r, c) ← take the first one out of the queue":  "take the first one out of the queue and call it (r, c)",
    "queue ← [root]":                                "queue starts with root inside",
    "queue ← [(0, 0)]":                              "queue starts with (0, 0) inside",
    "queue ← list with the pair (begin, 1 step)":    "queue starts with the pair (begin, 1 step) inside",
    "queue ← list with the triple (root, row 0, column 0)": "queue starts with the triple (root, row 0, column 0) inside",
    "queue ← all the rotten oranges":                "queue starts with all the rotten oranges inside",
    "level ← set holding only begin":                "level starts with begin inside",
    "seen ← set holding only begin":                 "seen starts with begin inside",
    "seen ← set holding only target":                "seen starts with target inside",
    "ans ← empty list":                              "ans starts empty",
    "level ← empty list":                            "level starts empty",
    "order ← empty list":                            "order starts empty",
    "next ← empty list":                             "next starts empty",
    "next ← empty set":                              "next starts empty",
    "parents ← for each word, the list of words it was reached from":
      "parents holds, for each word, the list of words it was reached from",
    "map ← for each column, a list of pairs (row, value)":
      "map holds, for each column, a list of pairs (row, value)",
    "tmp ← a copy of dist":                          "tmp starts as a copy of dist",
    "signals ← count how many of these three hold: sought, left is not null, right is not null":
      "signals becomes how many of these three hold: sought, left is not null, right is not null",
    "queue ← the starting node":                     "queue starts with the starting node inside",
    "queue ← the courses with degree 0":             "queue starts with the degree-0 courses inside",
    "queue ← the letters with degree 0":             "queue starts with the degree-0 letters inside",
    "queue ← list holding only target":              "queue starts with target inside",
    "set ← a set with all the numbers":              "set starts with all the numbers inside",
    "components ← n":                                "components starts at n",
    "c1 and c2 ← the first letters where a and b differ":
      "c1 and c2 become the first letters where a and b differ",
    "neighbors ← its left child, its right child and its parent":
      "neighbors are its left child, its right child and its parent",
  })),
};

function convert(line, lang) {
  const { body, comment, col } = split(line);
  if (!body.includes("←")) return line;

  const indent = body.match(/^\s*/)[0];
  const trimmed = body.trim();
  const at = trimmed.indexOf("←");
  const lhs = trimmed.slice(0, at).trim();
  const rhs = trimmed.slice(at + 1).trim();

  const isEs = lang === "es";
  let out = OVERRIDES[lang].get(trimmed) || null;
  if (out) return join(indent, out, comment, col);

  // 1. Inicialización con literal.
  for (const [re, fn] of (isEs ? INIT_ES : INIT_EN)) {
    const m = rhs.match(re);
    if (m) { out = `${lhs} ${fn(rhs)}`; break; }
  }

  // 2. Incremento / decremento: el RHS empieza por el MISMO lhs.
  if (!out) {
    const inc = rhs.match(new RegExp(`^${esc(lhs)}\\s*([+-])\\s*(.+)$`));
    if (inc) {
      const [, op, amount] = inc;
      out = isEs
        ? (op === "+" ? `sumar ${amount} a ${lhs}` : `restar ${amount} a ${lhs}`)
        : (op === "+" ? `add ${amount} to ${lhs}` : `subtract ${amount} from ${lhs}`);
    }
  }

  // 3. Cualquier otra asignación.
  if (!out) out = isEs ? `${lhs} pasa a ser ${rhs}` : `${lhs} becomes ${rhs}`;

  return join(indent, out, comment, col);
}

/* --- Localiza los literales de cadena del bloque VIS.code([...]) ----------
   Reemplazar por texto no sirve: `dist[v] ← dist[u] + w` es IDÉNTICO en las
   columnas es y en, así que una sustitución global le pondría el verbo
   español al inglés. Hay que ir por posición: los literales del bloque van en
   tríos [ancla, es, en].                                                     */
function stringLiterals(src) {
  const start = src.indexOf("VIS.code([");
  if (start < 0) return null;
  const out = [];
  let i = start, depth = 0, started = false;
  while (i < src.length) {
    const c = src[i];
    if (c === '"') {                       // literal de cadena (con escapes)
      const from = i;
      i++;
      while (i < src.length && src[i] !== '"') i += src[i] === "\\" ? 2 : 1;
      i++;
      out.push({ from, to: i, value: JSON.parse(src.slice(from, i)) });
      continue;
    }
    if (c === "/" && src[i + 1] === "/") { // comentario de JS: saltar la línea
      while (i < src.length && src[i] !== "\n") i++;
      continue;
    }
    if (c === "[") { depth++; started = true; }
    else if (c === "]") { depth--; if (started && depth === 0) break; }
    i++;
  }
  return out;
}

/* --- Main ---------------------------------------------------------------- */
const sandbox = makeSandbox();
vm.runInContext(fs.readFileSync(path.join(JS, "i18n.js"), "utf8"), sandbox);
vm.runInContext(fs.readFileSync(path.join(JS, "renderers.js"), "utf8"), sandbox);

const nums = fs.readdirSync(PROBLEMS_DIR).filter((f) => f.endsWith(".js"))
  .map((f) => f.replace(/\.js$/, "")).sort((a, b) => +a - +b);

let totalArrows = 0, totalFiles = 0, unmatched = [];

for (const num of nums) {
  const file = path.join(PROBLEMS_DIR, num + ".js");
  const src = fs.readFileSync(file, "utf8");
  vm.runInContext(src, sandbox, { filename: file });
  const p = sandbox.window.PROBLEMS[num];

  const lits = stringLiterals(src);
  if (!lits) { unmatched.push(`${num}: no encontré VIS.code([`); continue; }
  if (lits.length !== p.code.es.length * 3) {
    unmatched.push(`${num}: ${lits.length} literales, esperaba ${p.code.es.length * 3} (3 por fila)`);
    continue;
  }

  // Comprueba que el trío [ancla, es, en] cuadra con lo que el módulo expone.
  const subs = [];
  for (let row = 0; row < p.code.es.length; row++) {
    for (const [off, lang] of [[1, "es"], [2, "en"]]) {
      const lit = lits[row * 3 + off];
      const expected = p.code[lang][row];
      if (lit.value !== expected) {
        unmatched.push(`${num} fila ${row} [${lang}]: fuente=${JSON.stringify(lit.value)} módulo=${JSON.stringify(expected)}`);
        continue;
      }
      if (!lit.value.includes("←")) continue;
      const neu = convert(lit.value, lang);
      if (neu.includes("←")) { unmatched.push(`${num} [${lang}] sin regla: ${lit.value}`); continue; }
      subs.push({ lit, neu, lang });
    }
  }
  if (!subs.length) continue;

  // Aplica de atrás hacia adelante para no invalidar los offsets.
  let out = src;
  for (const { lit, neu } of [...subs].reverse()) {
    out = out.slice(0, lit.from) + JSON.stringify(neu) + out.slice(lit.to);
  }

  totalArrows += subs.length;
  totalFiles++;
  if (WRITE) fs.writeFileSync(file, out);
  else {
    console.log(`\n\x1b[1m── ${num} ──\x1b[0m`);
    subs.forEach(({ lit, neu, lang }) =>
      console.log(`  [${lang}] \x1b[31m${lit.value.trim()}\x1b[0m\n       \x1b[32m${neu.trim()}\x1b[0m`));
  }
}

console.log(`\n${WRITE ? "APLICADO" : "DRY-RUN"}: ${totalArrows} sustituciones en ${totalFiles} archivos.`);
if (unmatched.length) {
  console.log(`\n\x1b[33m${unmatched.length} línea(s) que ninguna regla resolvió:\x1b[0m`);
  unmatched.forEach((u) => console.log("  " + u));
  process.exit(1);
}
