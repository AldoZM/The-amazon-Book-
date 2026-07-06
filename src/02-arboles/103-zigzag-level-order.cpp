// ============================================================================
// 103. Binary Tree Zigzag Level Order Traversal  (Medium)
// ----------------------------------------------------------------------------
// Dado la raíz de un árbol binario, devuelve el recorrido por niveles de sus
// valores en zigzag: el nivel 0 va de izquierda a derecha, el nivel 1 va de
// derecha a izquierda, el nivel 2 de nuevo izquierda a derecha, y así
// alternando.
//
// Ejemplo:
//        3
//       / \
//      9  20
//         / \
//        15  7
//
//   nivel 0 (izq->der): [3]
//   nivel 1 (der->izq): [20, 9]      <- se invierte el orden normal [9, 20]
//   nivel 2 (izq->der): [15, 7]
//
//   Resultado: [[3], [20, 9], [15, 7]]
//
// Diagrama del BFS por niveles (igual que 994, pero con struct.size() como
// tamaño de la capa):
//
//   cola: [3]
//   nivel 0 -> saco 3, encolo 9 y 20        -> capa = [3]
//   nivel 1 -> saco 9, 20, encolo 15 y 7     -> capa = [9, 20] (se invierte)
//   nivel 2 -> saco 15, 7, no hay hijos      -> capa = [15, 7]
//
// Idea: BFS estándar por niveles (igual que en 994-rotting-oranges). La única
// diferencia es que, en los niveles impares, invertimos el vector del nivel
// antes de agregarlo al resultado. Usamos un contador de nivel (o el tamaño
// del resultado) para saber si toca invertir.
//
// Complejidad: tiempo O(n) (cada nodo se visita una vez),
//              espacio O(n) por la cola y el resultado.
// ============================================================================
#include <vector>
#include <queue>
#include <cassert>
#include <iostream>
#include <algorithm>
using namespace std;

struct TreeNode {
    int val;
    TreeNode* left;
    TreeNode* right;
    TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
};

class Solution {
public:
    vector<vector<int>> zigzagLevelOrder(TreeNode* root) {
        vector<vector<int>> resultado;
        if (root == nullptr) return resultado;   // árbol vacío => []

        queue<TreeNode*> cola;
        cola.push(root);
        bool derechaAIzquierda = false;   // nivel 0 va izquierda a derecha

        while (!cola.empty()) {
            int capa = cola.size();   // nodos en este nivel
            vector<int> nivel(capa);
            for (int i = 0; i < capa; ++i) {
                TreeNode* nodo = cola.front(); cola.pop();

                // Posición dentro del nivel: normal o invertida según dirección.
                int idx = derechaAIzquierda ? (capa - 1 - i) : i;
                nivel[idx] = nodo->val;

                if (nodo->left != nullptr) cola.push(nodo->left);
                if (nodo->right != nullptr) cola.push(nodo->right);
            }
            resultado.push_back(nivel);
            derechaAIzquierda = !derechaAIzquierda;   // alterna para el siguiente nivel
        }
        return resultado;
    }
};

// Construye el árbol de ejemplo:
//        3
//       / \
//      9  20
//         / \
//        15  7
TreeNode* construirArbolEjemplo() {
    TreeNode* raiz = new TreeNode(3);
    raiz->left = new TreeNode(9);
    raiz->right = new TreeNode(20);
    raiz->right->left = new TreeNode(15);
    raiz->right->right = new TreeNode(7);
    return raiz;
}

int main() {
    Solution s;

    // Caso clásico: [3,9,20,null,null,15,7] => [[3],[20,9],[15,7]]
    TreeNode* arbol1 = construirArbolEjemplo();
    vector<vector<int>> esperado1 = {{3}, {20, 9}, {15, 7}};
    assert(s.zigzagLevelOrder(arbol1) == esperado1);

    // Árbol vacío => [].
    assert(s.zigzagLevelOrder(nullptr).empty());

    // Un solo nodo => [[x]].
    TreeNode* unNodo = new TreeNode(1);
    vector<vector<int>> esperadoUnNodo = {{1}};
    assert(s.zigzagLevelOrder(unNodo) == esperadoUnNodo);

    cout << "103 Zigzag Level Order: todas las pruebas pasaron.\n";
    return 0;
}
