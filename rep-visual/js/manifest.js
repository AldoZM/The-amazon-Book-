/* Manifiesto de problemas. `ready:true` = módulo js/problems/NUM.js existente.
   La portada (index.html) lo usa para armar las tarjetas.               */
window.MANIFEST = {
  blocks: [
    { id: "grafos", title: { es: "Bloque 1 · Grafos", en: "Block 1 · Graphs" } },
    { id: "arboles", title: { es: "Bloque 2 · Árboles", en: "Block 2 · Trees" } },
  ],
  problems: [
    // ---- Grafos ----
    { num: 200, title: "Number of Islands", dif: "M", block: "grafos", tags: ["DFS", "grid"], ready: true },
    { num: 994, title: "Rotting Oranges", dif: "M", block: "grafos", tags: ["BFS", "grid"], ready: true },
    { num: 695, title: "Max Area of Island", dif: "M", block: "grafos", tags: ["DFS", "grid"], ready: true },
    { num: 542, title: "01 Matrix", dif: "M", block: "grafos", tags: ["BFS", "grid"], ready: true },
    { num: 1091, title: "Shortest Path in Binary Matrix", dif: "M", block: "grafos", tags: ["BFS", "grid"], ready: true },
    { num: 417, title: "Pacific Atlantic Water Flow", dif: "M", block: "grafos", tags: ["DFS", "grid"], ready: true },
    { num: 79, title: "Word Search", dif: "M", block: "grafos", tags: ["backtracking", "grid"], ready: true },
    { num: 207, title: "Course Schedule", dif: "M", block: "grafos", tags: ["topológico", "BFS"], ready: true },
    { num: 210, title: "Course Schedule II", dif: "M", block: "grafos", tags: ["topológico", "BFS"], ready: true },
    { num: 269, title: "Alien Dictionary", dif: "H", block: "grafos", tags: ["topológico"], ready: true },
    { num: 127, title: "Word Ladder", dif: "H", block: "grafos", tags: ["BFS"], ready: true },
    { num: 126, title: "Word Ladder II", dif: "H", block: "grafos", tags: ["BFS", "backtracking"], ready: true },
    { num: 261, title: "Graph Valid Tree", dif: "M", block: "grafos", tags: ["union-find"], ready: true },
    { num: 323, title: "Connected Components", dif: "M", block: "grafos", tags: ["union-find"], ready: true },
    { num: 128, title: "Longest Consecutive Sequence", dif: "M", block: "grafos", tags: ["conjunto"], ready: true },
    { num: 547, title: "Number of Provinces", dif: "M", block: "grafos", tags: ["union-find", "DFS"], ready: true },
    { num: 743, title: "Network Delay Time", dif: "M", block: "grafos", tags: ["Dijkstra"], ready: true },
    { num: 787, title: "Cheapest Flights K Stops", dif: "M", block: "grafos", tags: ["Bellman-Ford"], ready: true },
    { num: 133, title: "Clone Graph", dif: "M", block: "grafos", tags: ["BFS", "DFS"], ready: true },
    { num: 1192, title: "Critical Connections", dif: "H", block: "grafos", tags: ["Tarjan"], ready: true },
    // ---- Árboles ----
    { num: 236, title: "Lowest Common Ancestor", dif: "M", block: "arboles", tags: ["DFS", "recursión"], ready: true },
    { num: 1644, title: "LCA II (puede faltar nodo)", dif: "M", block: "arboles", tags: ["DFS"], ready: true },
    { num: 103, title: "Zigzag Level Order", dif: "M", block: "arboles", tags: ["BFS", "niveles"], ready: true },
    { num: 199, title: "Right Side View", dif: "M", block: "arboles", tags: ["BFS", "niveles"], ready: true },
    { num: 987, title: "Vertical Order Traversal", dif: "H", block: "arboles", tags: ["BFS", "coordenadas"], ready: true },
    { num: 124, title: "Max Path Sum", dif: "H", block: "arboles", tags: ["DFS", "recursión"], ready: true },
    { num: 543, title: "Diameter of Binary Tree", dif: "M", block: "arboles", tags: ["DFS"], ready: true },
    { num: 863, title: "All Nodes Distance K", dif: "M", block: "arboles", tags: ["BFS", "grafo"], ready: true },
    { num: 98, title: "Validate BST", dif: "M", block: "arboles", tags: ["DFS", "inorden"], ready: true },
    { num: 105, title: "Build Tree (Pre+In)", dif: "M", block: "arboles", tags: ["recursión"], ready: true },
    { num: 337, title: "House Robber III", dif: "M", block: "arboles", tags: ["DP en árbol"], ready: true },
    { num: 297, title: "Serialize & Deserialize", dif: "H", block: "arboles", tags: ["BFS", "DFS"], ready: true },
  ],
};
