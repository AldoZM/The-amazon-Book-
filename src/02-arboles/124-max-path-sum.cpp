// ============================================================================
// 124. Binary Tree Maximum Path Sum  (Hard)
// ----------------------------------------------------------------------------
// Dado un árbol binario (los valores pueden ser negativos), un "camino" es
// cualquier secuencia de nodos donde cada par consecutivo está conectado por
// una arista. Un nodo no puede aparecer dos veces en el mismo camino. El
// camino NO necesita pasar por la raíz ni terminar en una hoja: puede
// empezar y terminar en cualquier nodo. Queremos la suma máxima de valores
// de nodo que se puede lograr con algún camino.
//
// Ejemplo 1:
//        1
//       / \
//      2   3
//   Camino óptimo: 2 -> 1 -> 3, suma = 6.
//
// Ejemplo 2:
//      -10
//      /  \
//     9    20
//         /  \
//        15   7
//   Camino óptimo: 15 -> 20 -> 7 (ignora la raíz -10 y la rama de 9),
//   suma = 42.
//
// Ejemplo 3 (un solo nodo negativo):
//      -3
//   El único camino posible es el nodo solo: suma = -3. La respuesta SÍ
//   puede ser negativa si todos los valores lo son.
//
// Idea clave: en cada nodo hay dos cantidades distintas que no hay que
// confundir:
//
//   1) "Ganancia hacia abajo por UNA sola rama" (lo que devuelve la
//      recursión hacia su padre): el mejor camino que empieza en este nodo
//      y baja por a lo más UNO de sus dos hijos, porque un camino que sigue
//      subiendo hacia el padre solo puede continuar por un lado.
//
//         gananciaIzq = max(0, ganancia(nodo->left))
//         gananciaDer = max(0, ganancia(nodo->right))
//         devuelve  =  nodo->val + max(gananciaIzq, gananciaDer)
//
//      El max(0, ...) descarta una rama si resulta negativa: es mejor no
//      extender el camino por ahí (sumar un número negativo solo empeora).
//
//   2) "Mejor camino que DOBLA en este nodo" (usa las dos ramas a la vez,
//      solo sirve para actualizar la respuesta global, nunca se devuelve
//      hacia el padre porque un camino no puede bifurcarse dos veces):
//
//         candidato = nodo->val + gananciaIzq + gananciaDer
//         mejorGlobal = max(mejorGlobal, candidato)
//
// Diagrama en un nodo cualquiera:
//
//              nodo (val)
//             /          \
//     gananciaIzq      gananciaDer      (cada una ya con max(0, ...) aplicado)
//
//   - Lo que se DEVUELVE al padre: val + max(gananciaIzq, gananciaDer)
//     (una sola rama, para que el padre pueda seguir extendiendo el camino).
//   - Lo que actualiza la RESPUESTA GLOBAL: val + gananciaIzq + gananciaDer
//     (las dos ramas juntas, el camino "dobla" aquí y ya no puede crecer más
//     hacia arriba).
//
// Recorremos el árbol en post-order (primero hijos, luego nodo actual) para
// que cada nodo ya conozca la ganancia de sus dos subárboles antes de
// calcular su propio candidato.
//
// Complejidad: tiempo O(n) (visitamos cada nodo una vez),
//              espacio O(h) por la pila de recursión (h = altura del árbol).
// ============================================================================
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
    int maxPathSum(TreeNode* root) {
        mejorGlobal = INT_MIN;
        gananciaMaxima(root);
        return mejorGlobal;
    }

private:
    int mejorGlobal;

    // Devuelve la ganancia máxima que aporta este subárbol a un camino que
    // sigue subiendo hacia el padre (una sola rama). De paso, actualiza
    // mejorGlobal con el mejor camino que "dobla" en este nodo (dos ramas).
    int gananciaMaxima(TreeNode* nodo) {
        if (nodo == nullptr) return 0;

        // Ganancia de cada rama; si es negativa, mejor no tomarla (0).
        int gananciaIzq = max(0, gananciaMaxima(nodo->left));
        int gananciaDer = max(0, gananciaMaxima(nodo->right));

        // Camino que dobla en este nodo: usa las dos ramas a la vez.
        // Solo sirve para la respuesta global, nunca se propaga al padre.
        int candidato = nodo->val + gananciaIzq + gananciaDer;
        mejorGlobal = max(mejorGlobal, candidato);

        // Lo que sí se propaga al padre: este nodo más, a lo más, UNA rama.
        return nodo->val + max(gananciaIzq, gananciaDer);
    }
};

int main() {
    Solution s;

    // Caso 1: árbol pequeño sin valores negativos.
    //        1
    //       / \
    //      2   3
    // Camino óptimo: 2 -> 1 -> 3 = 6.
    TreeNode* n1 = new TreeNode(1);
    TreeNode* n2 = new TreeNode(2);
    TreeNode* n3 = new TreeNode(3);
    n1->left = n2; n1->right = n3;
    assert(s.maxPathSum(n1) == 6);
    delete n2; delete n3; delete n1;

    // Caso 2: la raíz es negativa y conviene descartarla junto con la rama
    // de 9; el camino óptimo vive por completo en el subárbol derecho.
    //      -10
    //      /  \
    //     9    20
    //         /  \
    //        15   7
    // Camino óptimo: 15 -> 20 -> 7 = 42.
    TreeNode* r = new TreeNode(-10);
    TreeNode* rIzq = new TreeNode(9);
    TreeNode* rDer = new TreeNode(20);
    TreeNode* rDerIzq = new TreeNode(15);
    TreeNode* rDerDer = new TreeNode(7);
    r->left = rIzq; r->right = rDer;
    rDer->left = rDerIzq; rDer->right = rDerDer;
    assert(s.maxPathSum(r) == 42);
    delete rIzq; delete rDerIzq; delete rDerDer; delete rDer; delete r;

    // Caso 3: un solo nodo negativo. No hay otra opción de camino más que
    // el nodo solo, así que la respuesta debe poder ser negativa.
    TreeNode* neg = new TreeNode(-3);
    assert(s.maxPathSum(neg) == -3);
    delete neg;

    // Caso 4: árbol con una rama completamente negativa que conviene
    // descartar (max(0, ...) la corta) en vez de arrastrarla al camino.
    //        5
    //       / \
    //     -8   9
    //     / \
    //   -2  -3
    // El mejor camino ignora por completo el subárbol de -8: la respuesta
    // es 5 -> 9 = 14, no 5 + (-8) + 9 ni nada que incluya -2 o -3.
    TreeNode* raiz2 = new TreeNode(5);
    TreeNode* izq = new TreeNode(-8);
    TreeNode* der = new TreeNode(9);
    TreeNode* izqIzq = new TreeNode(-2);
    TreeNode* izqDer = new TreeNode(-3);
    raiz2->left = izq; raiz2->right = der;
    izq->left = izqIzq; izq->right = izqDer;
    assert(s.maxPathSum(raiz2) == 14);
    delete izqIzq; delete izqDer; delete izq; delete der; delete raiz2;

    // Caso 5: todos los valores negativos; la mejor respuesta es el nodo
    // individual menos negativo (un camino de un solo nodo).
    //      -3
    //      / \
    //    -2  -1
    TreeNode* n = new TreeNode(-3);
    TreeNode* nIzq = new TreeNode(-2);
    TreeNode* nDer = new TreeNode(-1);
    n->left = nIzq; n->right = nDer;
    assert(s.maxPathSum(n) == -1);
    delete nIzq; delete nDer; delete n;

    cout << "124 Max Path Sum: todas las pruebas pasaron.\n";
    return 0;
}
