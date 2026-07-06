// ============================================================================
// 543. Diameter of Binary Tree (Easy)
// ----------------------------------------------------------------------------
// Dado la raíz de un árbol binario, devuelve la longitud del diámetro del
// árbol.
//
// El diámetro de un árbol binario es la longitud del camino más largo entre
// DOS NODOS CUALESQUIERA del árbol. Este camino puede o no pasar por la raíz.
//
// La longitud del camino entre dos nodos se representa por el número de
// aristas (edges) entre ellos, no el número de nodos.
//
// Ejemplo 1:
//         1
//        / \
//       2   3
//      / \
//     4   5
//   Diámetro óptimo: 4 -> 2 -> 1 -> 3 o 5 -> 2 -> 1 -> 3 (3 aristas).
//
// Ejemplo 2:
//       1
//      /
//     2
//   Diámetro óptimo: 1 -> 2 (1 arista).
//
// Idea clave:
// El camino más largo en el árbol puede o no pasar por la raíz.
// Sin embargo, si analizamos cualquier nodo como si fuera el punto más
// alto (o el "doblez") de un camino, la longitud del camino que pasa por él
// es exactamente la altura de su subárbol izquierdo más la altura de su
// subárbol derecho.
//
// Por lo tanto, en cada nodo, calculamos la "altura" (o profundidad) de sus
// hijos.
//   - Lo que devolvemos hacia arriba (al padre) es 1 + max(alturaIzq, alturaDer).
//   - Lo que actualiza nuestra respuesta global (el máximo diámetro visto hasta
//     ahora) es alturaIzq + alturaDer.
//
// Al recorrer el árbol en post-order, garantizamos que al procesar un nodo,
// ya tenemos las alturas calculadas de sus subárboles.
//
// Complejidad: tiempo O(n) (visitamos cada nodo una vez),
//              espacio O(h) por la pila de recursión (h = altura del árbol).
// ============================================================================
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
    int diameterOfBinaryTree(TreeNode* root) {
        maxDiametro = 0;
        altura(root);
        return maxDiametro;
    }

private:
    int maxDiametro;

    int altura(TreeNode* nodo) {
        if (nodo == nullptr) return 0;
        
        int alturaIzq = altura(nodo->left);
        int alturaDer = altura(nodo->right);
        
        // Camino que "dobla" en este nodo: suma de las aristas a izquierda y derecha
        maxDiametro = max(maxDiametro, alturaIzq + alturaDer);
        
        // Se propaga la altura máxima al padre + 1 (por la arista que conecta a este nodo)
        return 1 + max(alturaIzq, alturaDer);
    }
};

int main() {
    Solution s;

    // Caso 1: árbol básico.
    //         1
    //        / \
    //       2   3
    //      / \
    //     4   5
    // Diámetro: 3 (4->2->1->3 o 5->2->1->3).
    TreeNode* r1 = new TreeNode(1);
    r1->left = new TreeNode(2);
    r1->right = new TreeNode(3);
    r1->left->left = new TreeNode(4);
    r1->left->right = new TreeNode(5);
    assert(s.diameterOfBinaryTree(r1) == 3);
    
    delete r1->left->left;
    delete r1->left->right;
    delete r1->left;
    delete r1->right;
    delete r1;

    // Caso 2: árbol muy pequeño.
    //       1
    //      /
    //     2
    // Diámetro: 1 (1->2).
    TreeNode* r2 = new TreeNode(1);
    r2->left = new TreeNode(2);
    assert(s.diameterOfBinaryTree(r2) == 1);
    
    delete r2->left;
    delete r2;

    // Caso 3: árbol que dobla en un hijo y no pasa por la raíz.
    //          1
    //         /
    //        2
    //       / \
    //      3   4
    //     /     \
    //    5       6
    // El diámetro más largo es entre 5 y 6: 5->3->2->4->6 (4 aristas).
    // Pasa por 2, no por 1.
    TreeNode* r3 = new TreeNode(1);
    r3->left = new TreeNode(2);
    r3->left->left = new TreeNode(3);
    r3->left->right = new TreeNode(4);
    r3->left->left->left = new TreeNode(5);
    r3->left->right->right = new TreeNode(6);
    assert(s.diameterOfBinaryTree(r3) == 4);
    
    delete r3->left->left->left;
    delete r3->left->right->right;
    delete r3->left->left;
    delete r3->left->right;
    delete r3->left;
    delete r3;

    cout << "543 Diameter of Binary Tree: todas las pruebas pasaron.\n";
    return 0;
}
