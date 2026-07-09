/* ============================================================================
   engine.js — Reproductor de pasos. Carga un módulo de problema, genera los
   pasos para el caso elegido y controla play/pausa/paso/velocidad.
   Un módulo de problema (window.PROBLEMS[num]) tiene la forma:

     {
       num, slug, title, difficulty, block, tags:[...], summary,
       code: ["linea0", "linea1", ...],
       cases: [ { name, input } ],
       legend: [ { cls, label } ],          // opcional
       build(input) -> [ step, ... ]
     }

   Un `step` = { line, note, grid, graph, tree, queue, stack, list, vars,
                 stage }.  `stage` (opcional) sobreescribe el ensamblado
   automático: array de items {type, ...spec}.
   ============================================================================ */
(function () {
  const VIS = window.VIS || (window.VIS = {});

  function qs(sel) { return document.querySelector(sel); }
  function param(name) { return new URLSearchParams(location.search).get(name); }

  // Ensambla la lista de items del escenario a partir de un step.
  function autoStage(step) {
    if (step.stage) return step.stage;
    const items = [];
    if (step.grid) items.push(Object.assign({ type: "grid" }, step.grid));
    if (step.grids) step.grids.forEach((g) => items.push(Object.assign({ type: "grid" }, g)));
    if (step.graph) items.push(Object.assign({ type: "graph" }, step.graph));
    if (step.tree) items.push(Object.assign({ type: "tree" }, step.tree));
    if (step.queue) items.push(Object.assign({ type: "queue", label: VIS.t("queue"), arrows: true }, normList(step.queue)));
    if (step.stack) items.push(Object.assign({ type: "stack", label: VIS.t("stack") }, normList(step.stack)));
    if (step.list) items.push(Object.assign({ type: "list", label: VIS.t("list") }, normList(step.list)));
    return items;
  }
  function normList(x) { return Array.isArray(x) ? { items: x } : x; }

  const Engine = {
    problem: null,
    steps: [],
    i: 0,
    timer: null,
    speed: 900,
    codePre: null,
    mode: "play",        // "play" | "edit"
    editState: null,     // cuadrícula que el usuario edita (modo interactivo)

    init(problem) {
      this.problem = problem;
      this.buildHeader();
      this.codePre = VIS.renderCode(qs("#code"), VIS.pickCode(problem.code));
      this.buildCaseSelect();
      this.buildLegend();
      this.bindControls();
      this.loadCase(0);
      VIS.onLangChange = () => this.relang();
    },

    // Refresca todo lo que depende del idioma sin perder caso ni paso.
    relang() {
      if (!this.problem) return;
      this.buildHeader();
      this.codePre = VIS.renderCode(qs("#code"), VIS.pickCode(this.problem.code));
      this.buildLegend();
      const sel = qs("#case-select");
      const cur = sel.value;          // puede ser "custom": se guarda como texto
      this.buildCaseSelect();
      sel.value = cur;
      this.setPlayLabel();
      if (this.mode === "edit") this.enterEditMode();
      else this.render();
    },

    buildHeader() {
      const p = this.problem;
      document.title = `${p.num}. ${p.title} — ${VIS.t("brandSub")}`;
      qs("#p-title").innerHTML = `<span class="num">${p.num}.</span> ${p.title}`;
      qs("#p-summary").textContent = VIS.pick(p.summary) || "";
      const tags = qs("#p-tags");
      tags.innerHTML = "";
      const dif = VIS.el("span", "tag " + p.difficulty, p.difficulty === "H" ? VIS.t("hard") : VIS.t("medium"));
      tags.appendChild(dif);
      (p.tags || []).forEach((t) => tags.appendChild(VIS.el("span", "tag", VIS.tag(t))));
    },

    buildCaseSelect() {
      const sel = qs("#case-select");
      sel.innerHTML = "";
      (this.problem.cases || [{}]).forEach((c, i) => {
        const o = VIS.el("option", null, VIS.pick(c.name) || "Caso " + (i + 1));
        o.value = i;
        sel.appendChild(o);
      });
      // Si el problema trae editor, se ofrece como un caso más: lo haces tú.
      if (this.problem.editor) {
        const o = VIS.el("option", null, VIS.t("custom"));
        o.value = "custom";
        sel.appendChild(o);
      }
      sel.onchange = () => {
        if (sel.value === "custom") this.enterEditMode();
        else this.loadCase(+sel.value);
      };
    },

    buildLegend() {
      const wrap = qs("#legend");
      wrap.innerHTML = "";
      const leg = this.problem.legend || [];
      if (!leg.length) { wrap.style.display = "none"; return; }
      wrap.style.display = "flex";
      leg.forEach((l) => {
        const lg = VIS.el("div", "lg");
        const sw = VIS.el("span", "sw");
        if (l.color) sw.style.background = l.color;
        else sw.className = "sw cell " + (l.cls || "");
        lg.appendChild(sw);
        lg.appendChild(document.createTextNode(VIS.pick(l.label)));
        wrap.appendChild(lg);
      });
    },

    loadCase(idx) {
      this.pause();
      this.mode = "play";
      this.hideEditorUI();
      const c = (this.problem.cases || [{}])[idx] || {};
      try {
        this.steps = this.problem.build(c.input) || [];
      } catch (err) {
        this.steps = [{ note: "Error generando pasos: " + err.message, line: 0 }];
        console.error(err);
      }
      this.i = 0;
      this.render();
    },

    // Enciende o apaga los cuatro controles de reproducción de una vez.
    setPlaybackEnabled(on) {
      ["#btn-prev", "#btn-next", "#btn-play", "#btn-reset"].forEach((s) => {
        const b = qs(s); if (b) b.disabled = !on;
      });
    },

    // Oculta la barra del editor y el botón Editar, y reactiva la reproducción.
    hideEditorUI() {
      const bar = qs("#editor-bar");
      if (bar) bar.style.display = "none";
      const be = qs("#btn-edit");
      if (be) be.style.display = "none";
      this.setPlaybackEnabled(true);
    },

    // Escenario en modo edición: una cuadrícula que se toca (kind "grid") o unos
    // campos de texto con vista previa en vivo (kind "text").
    paintEditor() {
      const ed = this.problem.editor;
      const stage = qs("#stage");
      const wrap = qs("#editor-fields");

      if ((ed.kind || "grid") === "text") {
        if (wrap) {
          wrap.innerHTML = "";
          wrap.style.display = "flex";
          ed.fields.forEach((f) => {
            const campo = VIS.el("label", "editor-field");
            campo.appendChild(VIS.el("span", "lbl", VIS.pick(f.label)));
            const inp = VIS.el("input");
            inp.type = "text";
            inp.id = "editor-field-" + f.id;
            inp.autocomplete = "off";
            inp.spellcheck = false;
            inp.value = this.editState[f.id];
            inp.placeholder = VIS.pick(f.placeholder) || "";
            // Se sanea en cada pulsación y se devuelve al campo: lo que se ve es
            // exactamente lo que va a parse().
            inp.oninput = () => {
              const limpio = f.sanitize ? f.sanitize(inp.value) : inp.value;
              if (limpio !== inp.value) inp.value = limpio;
              this.editState[f.id] = limpio;
              this.refreshPreview();
            };
            campo.appendChild(inp);
            wrap.appendChild(campo);
          });
        }
        this.refreshPreview();
        return;
      }

      if (wrap) wrap.style.display = "none";
      const redraw = () => {
        stage.innerHTML = "";
        stage.appendChild(VIS.renderers.gridEditor(this.editState, ed, (r, c) => {
          // `cycle` recibe la cuadrícula entera: hay problemas (547) donde un
          // toque cambia dos celdas.
          this.editState = ed.cycle(this.editState, r, c);
          redraw();   // 5×5: re-dibujar entero es trivial y evita estado extra
        }));
      };
      redraw();
      const run = qs("#btn-run");
      if (run) run.disabled = false;
    },

    // Corre parse() y refleja el resultado: vista previa o error. Es el único
    // sitio que decide si Ejecutar está habilitado.
    refreshPreview() {
      const ed = this.problem.editor;
      const res = ed.parse(this.editState);
      const hintEl = qs("#editor-hint");
      const run = qs("#btn-run");

      (ed.fields || []).forEach((f) => {
        const inp = qs("#editor-field-" + f.id);
        if (inp) inp.classList.remove("invalid");
      });

      if (res.ok) {
        if (hintEl) { hintEl.classList.remove("error"); hintEl.textContent = VIS.pick(ed.hint); }
        const spec = ed.previewSpec(res.input);
        const pintor = VIS.renderers[spec.type];
        if (pintor) {
          const stage = qs("#stage");
          stage.innerHTML = "";
          stage.appendChild(pintor(spec));
        }
        if (run) run.disabled = false;
        return;
      }

      if (hintEl) { hintEl.classList.add("error"); hintEl.textContent = VIS.pick(res.error); }
      if (res.field) {
        const inp = qs("#editor-field-" + res.field);
        if (inp) inp.classList.add("invalid");
      }
      if (run) run.disabled = true;
      // El escenario NO se toca: se conserva el último dibujo válido, para que
      // no parpadee mientras se escribe.
    },

    // Modo interactivo: el usuario construye la entrada y luego la ejecuta.
    enterEditMode() {
      this.pause();
      const ed = this.problem.editor;
      if (!ed) return;
      this.mode = "edit";
      this.steps = [];   // fuera los pasos del caso anterior: aún no hay reproducción
      // `== null` y no `!editState`: la cadena vacía y el objeto vacío son
      // estados legítimos, y `!""` haría reaparecer el valor por defecto.
      if (this.editState == null) this.editState = ed.initial();

      const hint = VIS.pick(ed.hint);
      const bar = qs("#editor-bar");
      if (bar) bar.style.display = "flex";
      const hintEl = qs("#editor-hint");
      if (hintEl) { hintEl.classList.remove("error"); hintEl.textContent = hint; }
      const run = qs("#btn-run");
      if (run) run.textContent = VIS.t("run");
      const be = qs("#btn-edit");
      if (be) be.style.display = "none";

      // Todavía no hay pasos: la narración explica qué hacer y no se reproduce.
      const nar = qs("#narration");
      if (nar) nar.innerHTML = hint;
      const bar2 = qs("#bar");
      if (bar2) bar2.style.width = "0%";
      this.setPlaybackEnabled(false);

      // Al final: `refreshPreview()` puede sustituir la instrucción por un error
      // y deshabilitar Ejecutar. Nadie debe pisarlo después.
      this.paintEditor();
    },

    // Alimenta el build() del problema con la entrada que construyó el usuario.
    runCustom() {
      const ed = this.problem.editor;
      if (!ed || this.editState == null) return;
      let entrada;
      if ((ed.kind || "grid") === "text") {
        const res = ed.parse(this.editState);
        if (!res.ok) return;      // el usuario ya ve el error; Ejecutar no hace nada
        entrada = res.input;
      } else {
        entrada = ed.toInput(this.editState);
      }
      try {
        this.steps = this.problem.build(entrada) || [];
      } catch (err) {
        this.steps = [{ note: "Error generando pasos: " + err.message, line: 0 }];
        console.error(err);
      }
      this.mode = "play";
      const bar = qs("#editor-bar");
      if (bar) bar.style.display = "none";
      const be = qs("#btn-edit");
      if (be) { be.style.display = ""; be.textContent = VIS.t("edit"); }
      this.setPlaybackEnabled(true);
      this.i = 0;
      this.render();
    },

    render() {
      const step = this.steps[this.i] || {};
      // escenario
      const stage = qs("#stage");
      stage.innerHTML = "";
      autoStage(step).forEach((item) => {
        const fn = VIS.renderers[item.type];
        if (fn) stage.appendChild(fn(item));
      });
      if (step.vars) stage.appendChild(VIS.renderers.vars({ vars: step.vars }));
      // código
      if (step.line != null) VIS.highlightLine(this.codePre, step.line);
      // narración
      qs("#narration").innerHTML =
        `<span class="step-no">${this.i + 1}/${this.steps.length}</span>` +
        (VIS.pick(step.note) || "");
      // barra
      const pct = this.steps.length > 1 ? (this.i / (this.steps.length - 1)) * 100 : 100;
      qs("#bar").style.width = pct + "%";
      // botones
      qs("#btn-prev").disabled = this.i === 0;
      qs("#btn-next").disabled = this.i >= this.steps.length - 1;
    },

    // La guarda va en la ACCIÓN y no en el botón: deshabilitar los botones no
    // bloquea el teclado ni el swipe, que también desembocan aquí. En modo
    // "edit" (el usuario está dibujando la rejilla) toda reproducción se ignora.
    locked() { return this.mode === "edit"; },

    next() { if (this.locked()) return false; if (this.i < this.steps.length - 1) { this.i++; this.render(); return true; } return false; },
    prev() { if (this.locked()) return; if (this.i > 0) { this.i--; this.render(); } },
    reset() { if (this.locked()) return; this.pause(); this.i = 0; this.render(); },

    setPlayLabel() {
      const b = qs("#btn-play");
      if (b) b.textContent = this.timer ? VIS.t("pause") : VIS.t("play");
    },
    play() {
      if (this.locked()) return;
      if (this.i >= this.steps.length - 1) this.i = 0;
      const b = qs("#btn-play");
      b.textContent = VIS.t("pause");
      b.classList.add("primary");
      this.timer = setInterval(() => {
        if (!this.next()) this.pause();
      }, this.speed);
    },
    pause() {
      clearInterval(this.timer);
      this.timer = null;
      const b = qs("#btn-play");
      if (b) { b.textContent = VIS.t("play"); b.classList.remove("primary"); }
    },
    toggle() { if (this.locked()) return; this.timer ? this.pause() : this.play(); },

    bindControls() {
      qs("#btn-play").onclick = () => this.toggle();
      qs("#btn-next").onclick = () => { this.pause(); this.next(); };
      qs("#btn-prev").onclick = () => { this.pause(); this.prev(); };
      qs("#btn-reset").onclick = () => this.reset();
      const run = qs("#btn-run");
      if (run) run.onclick = () => this.runCustom();
      const be = qs("#btn-edit");
      if (be) be.onclick = () => this.enterEditMode();
      const sp = qs("#speed");
      sp.oninput = () => {
        this.speed = 1900 - +sp.value; // rango invertido: derecha = rápido
        if (this.timer) { this.pause(); this.play(); }
      };
      document.addEventListener("keydown", (e) => {
        if (e.key === "ArrowRight") { this.pause(); this.next(); }
        else if (e.key === "ArrowLeft") { this.pause(); this.prev(); }
        else if (e.key === " ") { e.preventDefault(); this.toggle(); }
      });
      this.bindSwipe();
    },

    // Swipe horizontal sobre el escenario para avanzar/retroceder (móvil).
    bindSwipe() {
      const zone = qs(".stage-wrap");
      if (!zone) return;
      let x0 = 0, y0 = 0, tracking = false;
      zone.addEventListener("touchstart", (e) => {
        if (e.touches.length !== 1) { tracking = false; return; }
        x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; tracking = true;
      }, { passive: true });
      zone.addEventListener("touchend", (e) => {
        if (!tracking) return;
        tracking = false;
        const t = e.changedTouches[0];
        const dx = t.clientX - x0, dy = t.clientY - y0;
        // Gesto horizontal claro: ignora scroll vertical y toques cortos.
        if (Math.abs(dx) < 45 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
        this.pause();
        if (dx < 0) this.next(); else this.prev();
      }, { passive: true });
    },
  };

  // Arranque: lee ?p=NUM, inyecta el script del problema, luego inicia.
  VIS.boot = function () {
    const num = param("p");
    if (!num) { qs("#narration").textContent = VIS.t("noParam"); return; }
    const script = document.createElement("script");
    script.src = "js/problems/" + num + ".js";
    script.onload = function () {
      const p = (window.PROBLEMS || {})[num];
      if (!p) { qs("#narration").textContent = VIS.t("notFound"); return; }
      Engine.init(p);
      const st = param("step");   // opcional: arrancar en un paso concreto (capturas)
      if (st != null) { Engine.i = Math.max(0, Math.min(Engine.steps.length - 1, +st)); Engine.render(); }
    };
    script.onerror = function () {
      qs("#narration").textContent = VIS.t("loadError");
    };
    document.body.appendChild(script);
  };
  VIS.Engine = Engine;
})();
