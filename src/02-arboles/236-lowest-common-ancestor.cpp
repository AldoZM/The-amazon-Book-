// ============================================================================
// 236. Lowest Common Ancestor of a Binary Tree  (Medium)
// ----------------------------------------------------------------------------
// Dado un árbol binario y dos nodos p y q que están garantizados presentes en
// el árbol, encuentra su ancestro común más bajo (LCA, Lowest Common Ancestor).
// El LCA es el nodo más profundo que tiene tanto a p como a q como
// descendientes (un nodo se considera descendiente de sí mismo).
//
// Ejemplo:
//                3
//              /   \
//             5     1
//            / \   / \
//           6   2 0   8
//              / \
//             7   4
//
//   LCA(5, 1) = 3   (están en subárboles distintos de la raíz)
//   LCA(5, 4) = 5   (5 es ancestro directo de 4)
//   LCA(6, 4) = 5   (ambos cuelgan del subárbol de 5)
//
// Diagrama de la recursión DFS: en cada nodo preguntamos "¿p o q vive en mi
// subárbol izquierdo?" y "¿en el derecho?":
//
//              nodo
//             /    \
//       buscar p/q   buscar p/q
//       en izq        en der
//
//   - Si el nodo actual ES p o q, lo devolvemos de inmediato (no hace falta
//     seguir bajando por ese lado: ya encontramos uno de los dos objetivos).
//   - Si izquierda y derecha devuelven ambas algo no nulo, quiere decir que
//     p y q se repartieron uno a cada lado: el nodo actual es el LCA.
//   - Si solo un lado devuelve algo no nulo, ese resultado se propaga hacia
//     arriba (el LCA está más arriba, o es el propio nodo encontrado).
//
// Idea: DFS recursivo tipo post-order. Cada llamada devuelve, para el
// subárbol que analiza, "el nodo relevante encontrado" (p, q, el LCA, o
// nullptr si ninguno de los dos está ahí).
//
// Complejidad: tiempo O(n) (visitamos cada nodo una vez),
//              espacio O(h) por la pila de recursión (h = altura del árbol).
// ============================================================================
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
    TreeNode* lowestCommonAncestor(TreeNode* root, TreeNode* p, TreeNode* q) {
        if (root == nullptr || root == p || root == q) return root;

        TreeNode* izq = lowestCommonAncestor(root->left, p, q);
        TreeNode* der = lowestCommonAncestor(root->right, p, q);

        if (izq != nullptr && der != nullptr) return root;  // p y q en ramas distintas
        return (izq != nullptr) ? izq : der;                // propaga el que exista
    }
};

int main() {
    Solution s;

    // Árbol de prueba:
    //                3
    //              /   \
    //             5     1
    //            / \   / \
    //           6   2 0   8
    //              / \
    //             7   4
    TreeNode* n3 = new TreeNode(3);
    TreeNode* n5 = new TreeNode(5);
    TreeNode* n1 = new TreeNode(1);
    TreeNode* n6 = new TreeNode(6);
    TreeNode* n2 = new TreeNode(2);
    TreeNode* n0 = new TreeNode(0);
    TreeNode* n8 = new TreeNode(8);
    TreeNode* n7 = new TreeNode(7);
    TreeNode* n4 = new TreeNode(4);

    n3->left = n5;   n3->right = n1;
    n5->left = n6;   n5->right = n2;
    n1->left = n0;   n1->right = n8;
    n2->left = n7;   n2->right = n4;

    // Caso 1: p y q en subárboles distintos de la raíz => LCA es la raíz.
    TreeNode* r1 = s.lowestCommonAncestor(n3, n5, n1);
    assert(r1 != nullptr && r1->val == 3);

    // Caso 2: uno es ancestro directo del otro => LCA es el ancestro (5).
    TreeNode* r2 = s.lowestCommonAncestor(n3, n5, n4);
    assert(r2 != nullptr && r2->val == 5);

    // Caso 3: ambos cuelgan del subárbol de 2 (hijo de 5) => LCA es 2.
    TreeNode* r3 = s.lowestCommonAncestor(n3, n7, n4);
    assert(r3 != nullptr && r3->val == 2);

    // Caso 4: árbol pequeño de dos nodos, p es la raíz y q su único hijo.
    TreeNode* a = new TreeNode(1);
    TreeNode* b = new TreeNode(2);
    a->left = b;
    TreeNode* r4 = s.lowestCommonAncestor(a, a, b);
    assert(r4 != nullptr && r4->val == 1);

    // Caso 5: dos hojas hermanas => LCA es su padre directo (1).
    TreeNode* r5 = s.lowestCommonAncestor(n3, n0, n8);
    assert(r5 != nullptr && r5->val == 1);

    delete n6; delete n7; delete n4; delete n2; delete n5;
    delete n0; delete n8; delete n1; delete n3;
    delete b; delete a;

    cout << "236 Lowest Common Ancestor: todas las pruebas pasaron.\n";
    return 0;
}
