// ============================================================================
// 199. Binary Tree Right Side View  (Medium)
// ----------------------------------------------------------------------------
// Dado un árbol binario, imagina que te paras del lado DERECHO del árbol y
// miras hacia él. Devuelve, de arriba hacia abajo, los valores de los nodos
// que alcanzas a ver (uno por cada nivel).
//
// Ejemplo clásico:
//                1
//              /   \
//             2     3
//              \     \
//               5     4
//
//   Vista derecha: [1, 3, 4]
//   Nivel 0: solo 1            -> visible: 1
//   Nivel 1: 2 y 3, gana 3     -> visible: 3 (el más a la derecha)
//   Nivel 2: solo 5            -> visible: 4  (¡ojo! el 5 queda oculto
//                                              detrás del 4, que está en
//                                              el mismo nivel pero cuelga
//                                              de la rama derecha de 3)
//
// Caso con nivel donde el nodo visible viene de la rama IZQUIERDA porque la
// rama derecha de ese nivel es más corta (termina antes):
//                1
//              /   \
//             2     3
//            /
//           4
//
//   Nivel 0: [1]       -> visible: 1
//   Nivel 1: [2, 3]     -> visible: 3
//   Nivel 2: [4]        -> visible: 4  (4 cuelga de la IZQUIERDA de 2; en
//                                       este nivel no hay ningún nodo del
//                                       lado derecho, así que el último nodo
//                                       leído de izquierda a derecha SÍ es
//                                       visible desde la derecha)
//   Vista derecha: [1, 3, 4]
//
// Idea: BFS por niveles (como en 994-rotting-oranges). En cada nivel
// recorremos todos sus nodos de izquierda a derecha y nos quedamos con el
// ÚLTIMO: ese es, por definición, el más a la derecha del nivel y por lo
// tanto el que se ve desde afuera. No importa de qué rama cuelgue (izquierda
// o derecha del padre); lo único que importa es su posición dentro del
// nivel.
//
// Alternativa equivalente: DFS visitando primero la rama derecha y luego la
// izquierda, registrando el primer nodo que se visita en cada profundidad
// (si ya hay un valor registrado para esa profundidad, el nodo actual queda
// oculto detrás de uno visitado antes, que por el orden de visita está más a
// la derecha).
//
// Complejidad: tiempo O(n) (visitamos cada nodo una vez),
//              espacio O(n) en el peor caso (la cola puede llegar a
//              contener hasta el último nivel completo, que en un árbol
//              balanceado es ~n/2 nodos; el resultado también usa O(n)).
// ============================================================================
#include <vector>
#include <queue>
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
    vector<int> rightSideView(TreeNode* root) {
        vector<int> vista;
        if (root == nullptr) return vista;   // árbol vacío => nada que ver

        queue<TreeNode*> cola;
        cola.push(root);

        while (!cola.empty()) {
            int nivel = cola.size();   // cuántos nodos hay en este nivel
            for (int i = 0; i < nivel; ++i) {
                TreeNode* actual = cola.front(); cola.pop();

                if (i == nivel - 1) vista.push_back(actual->val);  // último del nivel

                if (actual->left != nullptr)  cola.push(actual->left);
                if (actual->right != nullptr) cola.push(actual->right);
            }
        }
        return vista;
    }
};

int main() {
    Solution s;

    // Caso 1 (clásico): [1,2,3,null,5,null,4] => [1,3,4]
    //                1
    //              /   \
    //             2     3
    //              \     \
    //               5     4
    TreeNode* n1 = new TreeNode(1);
    TreeNode* n2 = new TreeNode(2);
    TreeNode* n3 = new TreeNode(3);
    TreeNode* n5 = new TreeNode(5);
    TreeNode* n4 = new TreeNode(4);
    n1->left = n2;  n1->right = n3;
    n2->right = n5;
    n3->right = n4;

    vector<int> r1 = s.rightSideView(n1);
    assert((r1 == vector<int>{1, 3, 4}));

    delete n5; delete n4; delete n2; delete n3; delete n1;

    // Caso 2: el nodo visible del último nivel cuelga de la rama IZQUIERDA
    // porque la rama derecha de ese nivel ya terminó (es más corta).
    //                1
    //              /   \
    //             2     3
    //            /
    //           4
    TreeNode* m1 = new TreeNode(1);
    TreeNode* m2 = new TreeNode(2);
    TreeNode* m3 = new TreeNode(3);
    TreeNode* m4 = new TreeNode(4);
    m1->left = m2;  m1->right = m3;
    m2->left = m4;

    vector<int> r2 = s.rightSideView(m1);
    assert((r2 == vector<int>{1, 3, 4}));

    delete m4; delete m2; delete m3; delete m1;

    // Caso 3: árbol vacío => vista vacía.
    vector<int> r3 = s.rightSideView(nullptr);
    assert(r3.empty());

    // Caso 4: un solo nodo => se ve únicamente él.
    TreeNode* solo = new TreeNode(42);
    vector<int> r4 = s.rightSideView(solo);
    assert((r4 == vector<int>{42}));
    delete solo;

    cout << "199 Right Side View: todas las pruebas pasaron.\n";
    return 0;
}
