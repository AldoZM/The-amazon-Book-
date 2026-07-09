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
      const cur = +sel.value;
      this.buildCaseSelect();
      sel.value = cur;
      this.setPlayLabel();
      this.render();
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
      sel.onchange = () => this.loadCase(+sel.value);
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

    next() { if (this.i < this.steps.length - 1) { this.i++; this.render(); return true; } return false; },
    prev() { if (this.i > 0) { this.i--; this.render(); } },
    reset() { this.pause(); this.i = 0; this.render(); },

    setPlayLabel() {
      const b = qs("#btn-play");
      if (b) b.textContent = this.timer ? VIS.t("pause") : VIS.t("play");
    },
    play() {
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
    toggle() { this.timer ? this.pause() : this.play(); },

    bindControls() {
      qs("#btn-play").onclick = () => this.toggle();
      qs("#btn-next").onclick = () => { this.pause(); this.next(); };
      qs("#btn-prev").onclick = () => { this.pause(); this.prev(); };
      qs("#btn-reset").onclick = () => this.reset();
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
