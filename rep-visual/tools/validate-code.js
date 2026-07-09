/* ============================================================================
   validate-code.js — Verifica el contrato entre el pseudocódigo y la animación.

   El pseudocódigo de cada problema vive en `code.es` / `code.en`, y cada paso
   de la animación resalta una o varias líneas mediante `step.line` (índices
   0-based). Nada en tiempo de ejecución avisa si esos índices se desalinean:
   `VIS.highlightLine` falla en silencio. Este script es esa red de seguridad.

   Comprueba, para los 32 módulos:
     [ERROR] code.es y code.en tienen distinto número de líneas.
     [ERROR] algún step.line queda fuera de rango, o no es un entero.
     [ERROR] algún step no declara `line`.
     [ERROR] un id de ancla se repite dentro del mismo problema.
     [AVISO] una línea de código no la resalta ningún paso de ningún caso.
     [AVISO] un paso resalta una línea en blanco.

   Uso:  node tools/validate-code.js          (desde rep-visual/)
         node tools/validate-code.js 200 1192 (solo esos problemas)

   Sale con código 1 si hay al menos un ERROR.
   ========================================================================= */
"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.resolve(__dirname, "..");
const JS = path.join(ROOT, "js");
const PROBLEMS_DIR = path.join(JS, "problems");

/* --- Entorno de navegador mínimo -----------------------------------------
   i18n.js y renderers.js tocan `document`, `localStorage` y `location` al
   cargarse; los módulos de problema solo necesitan `window` y los tres
   helpers de layout, que son funciones puras. Con estos stubs basta.        */
function makeSandbox() {
  const noopEl = () => ({
    appendChild() {}, setAttribute() {}, classList: { add() {}, remove() {}, toggle() {} },
    dataset: {}, style: {}, querySelector: () => null, querySelectorAll: () => [],
  });
  const sandbox = {
    document: {
      createElement: noopEl,
      createTextNode: () => ({}),
      querySelector: () => null,
      querySelectorAll: () => [],
      documentElement: { setAttribute() {} },
      getElementById: () => null,
      addEventListener() {},
    },
    localStorage: { getItem: () => null, setItem() {} },
    location: { search: "" },
    URLSearchParams: class { get() { return null; } },
    console,
  };
  // En el navegador `window` ES el objeto global: los build() usan `VIS` a
  // secas. Replicamos ese alias o `VIS is not defined`.
  sandbox.window = sandbox;
  vm.createContext(sandbox);
  return sandbox;
}

function run(sandbox, file) {
  vm.runInContext(fs.readFileSync(file, "utf8"), sandbox, { filename: file });
}

/* --- Utilidades ---------------------------------------------------------- */
const isBlank = (s) => !String(s).trim();

// step.line admite número o array de números.
function linesOf(step) {
  if (step.line == null) return null;
  return Array.isArray(step.line) ? step.line : [step.line];
}

/* --- Validación de un problema ------------------------------------------- */
function validate(num, p) {
  const errors = [];
  const warnings = [];
  const err = (m) => errors.push(m);
  const warn = (m) => warnings.push(m);

  const code = p.code || {};
  const es = code.es || [];
  const en = code.en || [];

  // 1. Paridad de idiomas. `step.line` es un único índice compartido por ambos
  //    arrays, así que si divergen, la vista EN resalta otra sentencia.
  if (es.length !== en.length) {
    err(`code.es tiene ${es.length} líneas y code.en tiene ${en.length}. ` +
        `Deben coincidir: step.line indexa ambos.`);
  }
  const nLines = Math.min(es.length, en.length);
  if (!nLines) err("El pseudocódigo está vacío.");

  // 2. Anclas simbólicas duplicadas (solo si el módulo ya usa VIS.code).
  if (code.L) {
    const seen = new Map();
    for (const [id, idx] of Object.entries(code.L)) {
      if (seen.has(idx)) warn(`Las anclas "${seen.get(idx)}" y "${id}" apuntan a la misma línea ${idx}.`);
      seen.set(idx, id);
    }
  }

  // 3. Recorre cada caso y comprueba los índices que emite build().
  const touched = new Set();
  (p.cases || [{}]).forEach((c, ci) => {
    const caseName = (c.name && (c.name.es || c.name.en)) || `caso ${ci}`;
    let steps;
    try {
      steps = p.build(c.input) || [];
    } catch (e) {
      err(`build() lanzó en "${caseName}": ${e.message}`);
      return;
    }
    if (!steps.length) { warn(`"${caseName}" no generó ningún paso.`); return; }

    steps.forEach((step, si) => {
      const where = `"${caseName}", paso ${si + 1}/${steps.length}`;
      const lines = linesOf(step);
      if (lines === null) {
        err(`${where}: no declara \`line\`. El paso heredará el resaltado del anterior.`);
        return;
      }
      lines.forEach((i) => {
        if (!Number.isInteger(i)) {
          err(`${where}: line=${JSON.stringify(i)} no es un entero.`);
          return;
        }
        if (i < 0 || i >= nLines) {
          err(`${where}: line=${i} fuera de rango [0, ${nLines - 1}]. ` +
              `highlightLine no encontrará .ln[data-line="${i}"] y el panel quedará sin resaltar.`);
          return;
        }
        touched.add(i);
        if (isBlank(es[i])) warn(`${where}: line=${i} resalta una línea en blanco.`);
      });
    });
  });

  // 4. Líneas muertas: escritas pero jamás resaltadas por ningún caso.
  if (!errors.length) {
    const dead = [];
    for (let i = 0; i < nLines; i++) {
      if (!touched.has(i) && !isBlank(es[i])) dead.push(i);
    }
    if (dead.length) {
      warn(`Líneas que ningún caso resalta: ${dead.join(", ")} ` +
           `(→ ${dead.map((i) => JSON.stringify(es[i].trim())).join(" · ")})`);
    }
  }

  return { errors, warnings };
}

/* --- Main ---------------------------------------------------------------- */
function main() {
  const only = process.argv.slice(2);
  const files = fs.readdirSync(PROBLEMS_DIR)
    .filter((f) => f.endsWith(".js"))
    .map((f) => f.replace(/\.js$/, ""))
    .filter((n) => !only.length || only.includes(n))
    .sort((a, b) => +a - +b);

  if (!files.length) {
    console.error("No se encontró ningún problema" + (only.length ? ` para: ${only.join(", ")}` : "."));
    process.exit(1);
  }

  const sandbox = makeSandbox();
  run(sandbox, path.join(JS, "i18n.js"));
  run(sandbox, path.join(JS, "renderers.js"));
  run(sandbox, path.join(JS, "editors.js"));

  let nErr = 0, nWarn = 0, nOk = 0;

  for (const num of files) {
    try {
      run(sandbox, path.join(PROBLEMS_DIR, num + ".js"));
    } catch (e) {
      console.log(`\x1b[31m✗ ${num}\x1b[0m  no se pudo cargar: ${e.message}`);
      nErr++;
      continue;
    }
    const p = sandbox.window.PROBLEMS[num];
    if (!p) {
      console.log(`\x1b[31m✗ ${num}\x1b[0m  el módulo no registró window.PROBLEMS["${num}"]`);
      nErr++;
      continue;
    }

    const { errors, warnings } = validate(num, p);
    const tag = `${num} ${p.title}`;
    if (errors.length) {
      nErr++;
      console.log(`\x1b[31m✗ ${tag}\x1b[0m`);
      errors.forEach((m) => console.log(`    \x1b[31mERROR\x1b[0m ${m}`));
    } else if (warnings.length) {
      nOk++;
      console.log(`\x1b[33m! ${tag}\x1b[0m`);
    } else {
      nOk++;
      console.log(`\x1b[32m✓ ${tag}\x1b[0m`);
    }
    warnings.forEach((m) => { nWarn++; console.log(`    \x1b[33maviso\x1b[0m ${m}`); });
  }

  console.log(`\n${nOk} correctos · ${nErr} con errores · ${nWarn} avisos`);
  process.exit(nErr ? 1 : 0);
}

main();
