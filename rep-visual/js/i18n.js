/* ============================================================================
   i18n.js — Idioma español/inglés. Namespace VIS.
   - VIS.lang: "es" | "en" (persistido en localStorage).
   - VIS.pick(x): si x = {es,en} devuelve el del idioma activo; si es string lo
     devuelve tal cual (compatibilidad con módulos aún no traducidos).
   - VIS.pickCode(code): code puede ser array (un idioma) o {es:[...], en:[...]}.
   - VIS.t(key): cadena de interfaz.
   - VIS.applyStatic(root): rellena elementos con [data-i18n] y [data-i18n-ph].
   ============================================================================ */
(function () {
  const VIS = window.VIS || (window.VIS = {});

  const UI = {
    es: {
      brandSub: "Visualizador",
      back: "← Todos los problemas",
      stage: "Escenario",
      explain: "Explicación paso a paso",
      pseudo: "Pseudocódigo",
      reset: "⏮ Reiniciar",
      prev: "◀ Anterior",
      play: "▶ Reproducir",
      pause: "⏸ Pausar",
      next: "Siguiente ▶",
      slow: "Lento",
      fast: "Rápido",
      caseLabel: "Caso de entrada:",
      hint: "· ← → cambian de paso · espacio reproduce",
      queue: "Cola", stack: "Pila", list: "Lista",
      heroTitle: "Algoritmos, paso a paso",
      heroDesc: "Visualizaciones interactivas de los ejercicios de LeetCode más frecuentes en entrevistas de Amazon. Elige un problema y observa cómo trabaja el algoritmo: cuadrículas que se pintan, colas BFS que avanzan, árboles que se recorren.",
      search: "Buscar por número, título o etiqueta…",
      ready: "listos",
      soon: "· próximamente",
      medium: "Medium", hard: "Hard",
      footer: "Hecho para estudiar · The Amazon Book de Aldo Zetina",
      notFound: "Problema no encontrado.",
      loadError: "No se pudo cargar el módulo del problema.",
      noParam: "Falta el parámetro ?p=NUM",
    },
    en: {
      brandSub: "Visualizer",
      back: "← All problems",
      stage: "Stage",
      explain: "Step-by-step explanation",
      pseudo: "Pseudocode",
      reset: "⏮ Restart",
      prev: "◀ Previous",
      play: "▶ Play",
      pause: "⏸ Pause",
      next: "Next ▶",
      slow: "Slow",
      fast: "Fast",
      caseLabel: "Input case:",
      hint: "· ← → step through · space plays",
      queue: "Queue", stack: "Stack", list: "List",
      heroTitle: "Algorithms, step by step",
      heroDesc: "Interactive visualizations of the LeetCode problems most common in Amazon interviews. Pick a problem and watch the algorithm work: grids that fill in, BFS queues that advance, trees that get traversed.",
      search: "Search by number, title or tag…",
      ready: "ready",
      soon: "· coming soon",
      medium: "Medium", hard: "Hard",
      footer: "Made for studying · The Amazon Book by Aldo Zetina",
      notFound: "Problem not found.",
      loadError: "Could not load the problem module.",
      noParam: "Missing ?p=NUM parameter",
    },
  };

  VIS.lang = (function () {
    try {
      const q = new URLSearchParams(location.search).get("lang");
      if (q === "es" || q === "en") { localStorage.setItem("repvisual-lang", q); return q; }
      return localStorage.getItem("repvisual-lang") || "es";
    } catch (e) { return "es"; }
  })();

  VIS.t = function (key) {
    const d = UI[VIS.lang] || UI.es;
    return d[key] != null ? d[key] : (UI.es[key] != null ? UI.es[key] : key);
  };

  // Traducción de etiquetas (tags) español → inglés, centralizada.
  const TAGS = {
    "multifuente": "multi-source", "área": "area", "8 direcciones": "8 directions",
    "topológico": "topological", "ciclo": "cycle", "grafo implícito": "implicit graph",
    "conjunto": "set", "componentes": "components", "camino mínimo": "shortest path",
    "puentes": "bridges", "dos pasadas": "two passes", "niveles": "levels",
    "recursión": "recursion", "altura": "height", "grafo": "graph", "rango": "range",
    "inorden": "inorder", "coordenadas": "coordinates", "DP en árbol": "tree DP",
    "divide y vencerás": "divide & conquer", "diseño": "design",
  };
  VIS.tag = function (t) {
    if (t && typeof t === "object") return VIS.pick(t);
    if (VIS.lang === "en" && TAGS[t]) return TAGS[t];
    return t;
  };

  VIS.pick = function (x) {
    if (x && typeof x === "object" && !Array.isArray(x) && ("es" in x || "en" in x)) {
      return x[VIS.lang] != null ? x[VIS.lang] : (x.es != null ? x.es : x.en);
    }
    return x;
  };

  VIS.pickCode = function (code) {
    if (!code) return [];
    if (Array.isArray(code)) return code;
    return code[VIS.lang] || code.es || code.en || [];
  };

  /* Construye el pseudocódigo a partir de filas [ancla, español, inglés].
     Devuelve { es, en, L }: los dos arrays que espera pickCode, más `L`, un
     mapa ancla → índice de línea.

     Los pasos de la animación resaltan líneas por `step.line`. Escribir ahí el
     número a mano es frágil: insertar una línea desplaza en silencio todos los
     índices posteriores y el resaltado se desalinea sin error visible. Con
     anclas, `build()` dice L.hundir en vez de 12 y el pseudocódigo se puede
     reescribir libremente.

     El ancla "" (o null) marca líneas sin destino: separadores en blanco.
     Si se omite el inglés, se reutiliza el español (líneas simbólicas).       */
  VIS.code = function (rows) {
    const es = [], en = [], L = Object.create(null);
    rows.forEach((row, i) => {
      const id = row[0], lineEs = row[1], lineEn = row[2];
      es.push(lineEs);
      en.push(lineEn == null ? lineEs : lineEn);
      if (id) {
        if (id in L) throw new Error('VIS.code: ancla duplicada "' + id + '"');
        L[id] = i;
      }
    });
    return { es, en, L };
  };

  VIS.setLang = function (l) {
    VIS.lang = l;
    try { localStorage.setItem("repvisual-lang", l); } catch (e) {}
    VIS.applyStatic(document);
    if (typeof VIS.onLangChange === "function") VIS.onLangChange();
  };

  VIS.applyStatic = function (root) {
    (root || document).querySelectorAll("[data-i18n]").forEach((el) => {
      el.textContent = VIS.t(el.getAttribute("data-i18n"));
    });
    (root || document).querySelectorAll("[data-i18n-ph]").forEach((el) => {
      el.setAttribute("placeholder", VIS.t(el.getAttribute("data-i18n-ph")));
    });
    document.documentElement.setAttribute("lang", VIS.lang);
    // estado del switch, si existe
    const sw = document.getElementById("lang-switch");
    if (sw) sw.checked = VIS.lang === "en";
  };

  // Construye el control de idioma (switch ES/EN) y lo mete en un contenedor.
  VIS.mountLangSwitch = function (container) {
    if (!container) return;
    const wrap = document.createElement("label");
    wrap.className = "lang-toggle";
    wrap.innerHTML =
      '<span class="lang-es">ES</span>' +
      '<span class="switch"><input type="checkbox" id="lang-switch"><span class="slider"></span></span>' +
      '<span class="lang-en">EN</span>';
    container.appendChild(wrap);
    const input = wrap.querySelector("#lang-switch");
    input.checked = VIS.lang === "en";
    input.addEventListener("change", () => VIS.setLang(input.checked ? "en" : "es"));
    // resaltar el idioma activo
    const sync = () => {
      wrap.querySelector(".lang-es").classList.toggle("on", VIS.lang === "es");
      wrap.querySelector(".lang-en").classList.toggle("on", VIS.lang === "en");
    };
    sync();
    input.addEventListener("change", sync);
  };
})();
