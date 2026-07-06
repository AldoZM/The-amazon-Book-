// ============================================================================
// 863. All Nodes Distance K in Binary Tree (Medium)
// ----------------------------------------------------------------------------
// Dado la raíz de un árbol binario, un nodo objetivo (target) y un entero K,
// devuelve los valores de todos los nodos que están a una distancia K del
// nodo objetivo.
//
// Ejemplo:
//         3
//        / \
//       5   1
//      / \ / \
//     6  2 0  8
//       / \
//      7   4
// target = 5, K = 2
// Salida: [7, 4, 1]
// Explicación: Los nodos a distancia 2 de 5 son 7 y 4 (hacia abajo) y 1
// (hacia arriba, pasando por la raíz 3).
//
// Idea clave:
// En un árbol binario normal, solo podemos movernos hacia abajo (hijos).
// Sin embargo, para encontrar todos los nodos a distancia K, necesitamos
// expandirnos en todas direcciones: hacia los hijos y hacia los ancestros.
// 
// La solución tiene dos pasos:
// 1. Recorrer el árbol (DFS o BFS) para construir un mapa que asocie cada
//    nodo con su padre: unordered_map<TreeNode*, TreeNode*> padres. Esto
//    convierte el árbol en un grafo no dirigido.
// 2. Hacer una búsqueda en anchura (BFS) comenzando desde el nodo 'target'.
//    Llevamos un conjunto (set) de nodos visitados para no retroceder. En
//    cada paso de la BFS, nos expandimos a: hijo izquierdo, hijo derecho y
//    padre. Cuando el nivel de la BFS sea exactamente K, los nodos en la
//    cola son nuestra respuesta.
//
// Complejidad: tiempo O(N) para construir el mapa y hacer la BFS, espacio
//              O(N) para el mapa, el conjunto de visitados y la cola.
// ============================================================================
#include <vector>
#include <unordered_map>
#include <unordered_set>
#include <queue>
#include <algorithm>
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
    vector<int> distanceK(TreeNode* root, TreeNode* target, int k) {
        // Paso 1: Mapear padres
        unordered_map<TreeNode*, TreeNode*> padre;
        mapearPadres(root, nullptr, padre);
        
        // Paso 2: BFS desde el target
        queue<TreeNode*> q;
        unordered_set<TreeNode*> visitados;
        
        q.push(target);
        visitados.insert(target);
        int distanciaActual = 0;
        
        while (!q.empty()) {
            if (distanciaActual == k) {
                vector<int> resultado;
                while (!q.empty()) {
                    resultado.push_back(q.front()->val);
                    q.pop();
                }
                return resultado;
            }
            
            int tamanoNivel = q.size();
            for (int i = 0; i < tamanoNivel; ++i) {
                TreeNode* actual = q.front();
                q.pop();
                
                // Intentar hijo izquierdo
                if (actual->left && visitados.find(actual->left) == visitados.end()) {
                    visitados.insert(actual->left);
                    q.push(actual->left);
                }
                // Intentar hijo derecho
                if (actual->right && visitados.find(actual->right) == visitados.end()) {
                    visitados.insert(actual->right);
                    q.push(actual->right);
                }
                // Intentar padre
                if (padre[actual] && visitados.find(padre[actual]) == visitados.end()) {
                    visitados.insert(padre[actual]);
                    q.push(padre[actual]);
                }
            }
            distanciaActual++;
        }
        
        return {};
    }

private:
    void mapearPadres(TreeNode* nodo, TreeNode* p, unordered_map<TreeNode*, TreeNode*>& padre) {
        if (!nodo) return;
        padre[nodo] = p;
        mapearPadres(nodo->left, nodo, padre);
        mapearPadres(nodo->right, nodo, padre);
    }
};

int main() {
    Solution s;

    // Caso 1
    //         3
    //        / \
    //       5   1
    //      / \ / \
    //     6  2 0  8
    //       / \
    //      7   4
    TreeNode* r1 = new TreeNode(3);
    TreeNode* n5 = new TreeNode(5);
    TreeNode* n1 = new TreeNode(1);
    r1->left = n5; r1->right = n1;
    n5->left = new TreeNode(6);
    n5->right = new TreeNode(2);
    n5->right->left = new TreeNode(7);
    n5->right->right = new TreeNode(4);
    n1->left = new TreeNode(0);
    n1->right = new TreeNode(8);
    
    vector<int> res1 = s.distanceK(r1, n5, 2);
    sort(res1.begin(), res1.end());
    assert((res1 == vector<int>{1, 4, 7}));
    
    delete n5->right->left;
    delete n5->right->right;
    delete n5->right;
    delete n5->left;
    delete n1->left;
    delete n1->right;
    delete n1;
    delete n5;
    delete r1;

    // Caso 2: target es raíz
    TreeNode* r2 = new TreeNode(1);
    r2->left = new TreeNode(2);
    r2->right = new TreeNode(3);
    
    vector<int> res2 = s.distanceK(r2, r2, 1);
    sort(res2.begin(), res2.end());
    assert((res2 == vector<int>{2, 3}));
    
    delete r2->left;
    delete r2->right;
    delete r2;

    cout << "863 All Nodes Distance K: todas las pruebas pasaron.\n";
    return 0;
}
