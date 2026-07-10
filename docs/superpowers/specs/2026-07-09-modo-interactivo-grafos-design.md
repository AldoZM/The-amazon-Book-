# Modo interactivo — Fase 3: Grafos (207, 210, 261, 323, 1192, 133)

Fecha: 2026-07-09
Estado: en revisión
Antecede: `2026-07-09-modo-interactivo-arboles-con-parametros-design.md`

## Contexto

El modo interactivo ya soporta cuadrículas y árboles (tanto estáticos como con parámetros dependientes). Ahora sigue la Fase 3, que abarca 6 problemas de grafos que comparten la misma estructura subyacente pero varían en su forma de entrada:

| Problema | Formato de entrada | Tipo de grafo |
|---|---|---|
| 207 Course Schedule | `{ n, prereqs }` | Dirigido |
| 210 Course Schedule II | `{ n, prereqs }` | Dirigido |
| 261 Graph Valid Tree | `{ n, edges }` | No dirigido |
| 323 Connected Components | `{ n, edges }` | No dirigido |
| 1192 Critical Connections | `{ n, edges }` | No dirigido |
| 133 Clone Graph | `{ n, adj }` | Listas de adyacencia |

De acuerdo con el archivo `context.txt`, no debemos forzar las tres variantes de entrada en un solo parser si eso implica un comportamiento enredado con booleanos. Necesitaremos parsers diferenciados pero que alimenten un generador visual común.

## Objetivo

Implementar el modo interactivo para los 6 problemas de grafos mencionados, permitiendo al usuario definir la estructura de los nodos y aristas a través de un campo de texto, observar una vista previa en tiempo real del grafo resultante y ejecutar las simulaciones con datos ingresados por el usuario.

## Arquitectura

### 1. Funciones de Parseo (en `js/editors.js`)

Se crearán funciones puras que conviertan el string de texto ingresado por el usuario en las estructuras respectivas o devuelvan un error explicativo que impida la ejecución. 

- `VIS.parse.edgeList(texto, maxNodos)`: Parsea arreglos de aristas del estilo `[[0,1], [1,2]]`. Si algún nodo excede el tamaño o es inválido, devuelve el error (e.g. "el nodo 7 no existe, hay 5").
- `VIS.parse.prereqList(texto, maxNodos)`: Parsea listas de prerrequisitos de cursos. Similar a `edgeList`, pero devuelve el formato exacto `{ n, prereqs }` o su equivalente. (Podría reutilizar internamente la lógica de `edgeList` pero devolviendo los campos con los nombres apropiados que esperan 207 y 210).
- `VIS.parse.adjList(texto, maxNodos)`: Parsea una lista de adyacencia como la esperada en 133, e.g. `[[2,4],[1,3],[2,4],[1,3]]`.

Estas funciones devolverán: `{ok: true, input}` o `{ok: false, error: {es, en}}`.

### 2. Función de Vista Previa (en `js/editors.js`)

- `VIS.preview.graph({n, edges, directed})`: Función pura sin DOM que renderiza el grafo para la vista previa utilizando la lógica existente de grafos en `renderers.js` (si es posible, adaptada a la vista previa). Mostrará el grafo resultante en tiempo real a medida que el usuario edite la lista.

### 3. Fábrica de Editor: `VIS.graphEditor(...)`

Para evitar duplicar código seis veces (como pasó inicialmente con los árboles), construiremos un `VIS.graphEditor` en `js/editors.js`.

Firma propuesta:
```javascript
VIS.graphEditor = (opciones) => {
    // opciones: { id_problema, maxNodos, directed, defaultInput, parser }
    return {
        initial: () => (opciones.defaultInput),
        fields: [{ 
            id: "graph", 
            type: "text", 
            label: {es: "Grafo", en: "Graph"}, 
            placeholder: {es: "Ej: [[0,1], [1,2]]", en: "Ex: [[0,1], [1,2]]"} 
        }],
        parse: (state) => opciones.parser(state.graph, opciones.maxNodos),
        previewSpec: (input) => VIS.preview.graph({ ...input, directed: opciones.directed })
    }
}
```

## Cambios a los Archivos de Problemas (`js/problems/<num>.js`)

Cada problema instanciará su editor usando la fábrica. Por ejemplo, en `207.js`:
```javascript
problem.editor = VIS.graphEditor({
    id: 207,
    maxNodos: 15,
    directed: true,
    defaultInput: "[[1,0]]",
    parser: VIS.parse.prereqList
});
```

## Casos Límite y Verificaciones Consideradas

- Nodos inexistentes: Si en un grafo de $N=3$, el usuario tipea la arista `[1, 4]`, el parser fallará informando explícitamente "El nodo 4 no existe, hay 3", apagando el botón Ejecutar y manteniendo el último grafo válido.
- Límite de `maxNodos`: Mantendremos un `MAX_NODOS` sensato para que se vea bien dentro del SVG (15).
- Validación de sintaxis: Como con el árbol, se rechazarán strings malformados sin excepciones lanzadas.

## Siguientes Pasos (una vez aprobado este spec)

1. Escribir el plan técnico paso a paso en `docs/superpowers/plans/`.
2. Escribir las funciones puras de parseo en TDD, verificando que los errores devueltos son explícitos.
3. Escribir `VIS.preview.graph` y `VIS.graphEditor`.
4. Asignar los editores a los 6 problemas.
5. Correr toda la suite de validación y sabotear los tests para garantizar su efectividad.
