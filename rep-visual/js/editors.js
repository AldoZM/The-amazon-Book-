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

  /* Vista previa de un árbol, con los mismos ayudantes que usa build(). */
  VIS.preview.tree = function (arr, label) {
    const root = VIS.treeFromArray(arr);
    const layout = VIS.binaryLayout(root);
    return {
      type: "tree", label, r: 18,
      nodes: layout.nodes.map((n) => ({ id: n.id, label: n.label, x: n.x, y: n.y, cls: "" })),
      edges: layout.edges,
    };
  };

  const ETIQUETA_ARBOL = { es: "Árbol", en: "Tree" };
  const MAX_NODOS = 31;   // más allá, el dibujo deja de caber

  /* Descriptor completo de un problema de árbol. Los ocho reciben el mismo
     arreglo de LeetCode: comparten `parse` y `previewSpec`, y solo cambian el
     árbol de partida y la instrucción. Escribirlo ocho veces sería copiarlo
     ocho veces.                                                              */
  VIS.treeEditor = function (arranque, hint) {
    return {
      kind: "text",
      fields: [
        {
          id: "tree",
          label: ETIQUETA_ARBOL,
          placeholder: { es: "[1,2,3,null,4]", en: "[1,2,3,null,4]" },
        },
      ],
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
