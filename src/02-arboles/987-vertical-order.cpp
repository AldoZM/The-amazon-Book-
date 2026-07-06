// ============================================================================
// 987. Vertical Order Traversal of a Binary Tree  (Hard)
// ----------------------------------------------------------------------------
// A cada nodo le asignamos una columna y una fila: la raíz está en columna 0,
// fila 0; el hijo izquierdo va una columna a la izquierda (columna-1) y una
// fila más abajo; el hijo derecho, una columna a la derecha (columna+1) y una
// fila más abajo. Debemos devolver los valores agrupados de columna menor a
// mayor; dentro de cada columna, ordenados por fila ascendente; y si dos
// nodos caen en la MISMA columna y MISMA fila, se desempata por valor
// ascendente (esto es justo lo que distingue a este problema del más
// sencillo 314, y lo que lo hace Hard).
//
// Ejemplo:
//            3                    columna -1: [9]
//          /   \                  columna  0: [3, 15]
//         9     20                columna  1: [20]
//              /  \                columna  2: [7]
//            15    7
//
//   (3 en c0,f0) (9 en c-1,f1) (20 en c1,f1) (15 en c0,f2) (7 en c2,f2)
//
// Diagrama del recorrido DFS acumulando (columna, fila, valor):
//
//        dfs(nodo, col, fila)
//          |-- guarda (col, fila, nodo->val)
//          |-- dfs(nodo->left,  col-1, fila+1)
//          |-- dfs(nodo->right, col+1, fila+1)
//
// Idea: recorremos el árbol completo (DFS o BFS, da igual) guardando una
// terna (columna, fila, valor) por cada nodo. Al final ordenamos todas las
// ternas: primero por columna, luego por fila, luego por valor (el orden
// natural de una tupla ya hace exactamente esto). Después agrupamos los
// valores consecutivos que comparten columna.
//
// Complejidad: tiempo O(n log n) por el ordenamiento de las n ternas,
//              espacio O(n) para guardarlas.
// ============================================================================
#include <vector>
#include <tuple>
#include <algorithm>
#include <functional>
#include <climits>
#include <cassert>
#include <iostream>
using namespace std;

struct TreeNode {
    int val;
    TreeNode *left;
    TreeNode *right;
    TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
};

class Solution {
public:
    vector<vector<int>> verticalTraversal(TreeNode* root) {
        vector<tuple<int,int,int>> nodos;   // (columna, fila, valor)

        function<void(TreeNode*, int, int)> dfs = [&](TreeNode* nodo, int col, int fila) {
            if (!nodo) return;
            nodos.emplace_back(col, fila, nodo->val);
            dfs(nodo->left, col - 1, fila + 1);
            dfs(nodo->right, col + 1, fila + 1);
        };
        dfs(root, 0, 0);

        // El orden natural de tuple<int,int,int> ya compara componente a
        // componente: columna, luego fila, luego valor. Justo lo que pide
        // el problema (incluido el desempate por valor).
        sort(nodos.begin(), nodos.end());

        vector<vector<int>> resultado;
        int colActual = INT_MIN;
        bool primera = true;
        for (auto& [col, fila, val] : nodos) {
            if (primera || col != colActual) {
                resultado.push_back({});
                colActual = col;
                primera = false;
            }
            resultado.back().push_back(val);
        }
        return resultado;
    }
};

int main() {
    Solution s;

    // Caso clásico: [3,9,20,null,null,15,7] => [[9],[3,15],[20],[7]]
    TreeNode* raiz1 = new TreeNode(3);
    raiz1->left = new TreeNode(9);
    raiz1->right = new TreeNode(20);
    raiz1->right->left = new TreeNode(15);
    raiz1->right->right = new TreeNode(7);
    vector<vector<int>> esperado1 = {{9}, {3, 15}, {20}, {7}};
    assert(s.verticalTraversal(raiz1) == esperado1);

    // Árbol completo [1,2,3,4,5,6,7]: los nodos 5 y 6 comparten columna 0 y
    // fila 2 (5 = hijo derecho de 2, que está en columna -1; 6 = hijo
    // izquierdo de 3, que está en columna 1; ambos terminan en columna 0).
    // Se desempatan por valor ascendente: 5 antes que 6.
    // Esperado: [[4],[2],[1,5,6],[3],[7]]
    TreeNode* raiz2 = new TreeNode(1);
    raiz2->left = new TreeNode(2);
    raiz2->right = new TreeNode(3);
    raiz2->left->left = new TreeNode(4);
    raiz2->left->right = new TreeNode(5);
    raiz2->right->left = new TreeNode(6);
    raiz2->right->right = new TreeNode(7);
    vector<vector<int>> esperado2 = {{4}, {2}, {1, 5, 6}, {3}, {7}};
    assert(s.verticalTraversal(raiz2) == esperado2);

    // Un solo nodo => [[x]]
    TreeNode* raiz3 = new TreeNode(42);
    vector<vector<int>> esperado3 = {{42}};
    assert(s.verticalTraversal(raiz3) == esperado3);

    cout << "987 Vertical Order: todas las pruebas pasaron.\n";
    return 0;
}
