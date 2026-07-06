// ============================================================================
// 1644. Lowest Common Ancestor of a Binary Tree II  (Medium)
// ----------------------------------------------------------------------------
// Dado un árbol binario y dos nodos p y q, encuentra su ancestro común más
// bajo (LCA). A diferencia del problema 236, aquí p y/o q PUEDEN NO EXISTIR
// en el árbol. Si alguno de los dos falta, debemos devolver nullptr.
//
// Ejemplo (mismo árbol que en 236):
//                3
//              /   \
//             5     1
//            / \   / \
//           6   2 0   8
//              / \
//             7   4
//
//   LCA(5, 1) = 3     (ambos existen, en subárboles distintos)
//   LCA(5, 4) = 5     (ambos existen, 5 es ancestro directo de 4)
//   LCA(5, 99) = null (99 no está en el árbol)
//   LCA(99, 88) = null (ninguno de los dos está en el árbol)
//
// Diferencia clave con 236: en 236 podíamos cortar la búsqueda en cuanto
// encontrábamos p o q ("if root == p or root == q, devuélvelo YA"), porque
// el enunciado GARANTIZABA que ambos existían en el árbol. Aquí esa garantía
// no existe: si cortáramos temprano y resultara que el otro nodo no está en
// el árbol, devolveríamos un LCA falso. Por eso NO podemos confiar en la
// primera coincidencia; hay que recorrer el árbol COMPLETO y, además, llevar
// la cuenta de cuántos de los dos nodos {p, q} encontramos de verdad.
//
// Diagrama de la técnica (DFS post-order con contador por referencia):
//
//              nodo
//             /    \
//       dfs(izq)    dfs(der)     <- ambas llamadas SIEMPRE se hacen completas
//             \    /                (no hay retorno anticipado)
//           ¿nodo es p o q?
//           sí -> contador++, este nodo es candidato a LCA
//           no -> si izq y der no son nulos, este nodo es el LCA;
//                 si sólo uno no es nulo, se propaga hacia arriba
//
// Al final, sólo confiamos en el candidato a LCA si el contador llegó a 2
// (es decir, se confirmó que TANTO p COMO q existen en el árbol). Si el
// contador es 0 o 1, alguno de los dos nodos no existe: devolvemos nullptr.
//
// Complejidad: tiempo O(n) (visitamos cada nodo exactamente una vez, sin
//              atajos, porque necesitamos confirmar la existencia de ambos),
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
        int contador = 0;
        TreeNode* candidato = dfs(root, p, q, contador);
        return (contador == 2) ? candidato : nullptr;  // sólo válido si ambos existen
    }

private:
    // Recorre TODO el subárbol (sin retorno anticipado) y va sumando en
    // "contador" cada vez que encuentra a p o a q. Devuelve el candidato a
    // LCA para este subárbol, igual que en 236.
    TreeNode* dfs(TreeNode* nodo, TreeNode* p, TreeNode* q, int& contador) {
        if (nodo == nullptr) return nullptr;

        TreeNode* izq = dfs(nodo->left, p, q, contador);
        TreeNode* der = dfs(nodo->right, p, q, contador);

        if (nodo == p || nodo == q) {
            ++contador;          // confirmamos que este nodo objetivo existe
            return nodo;
        }

        if (izq != nullptr && der != nullptr) return nodo;  // p y q en ramas distintas
        return (izq != nullptr) ? izq : der;                // propaga el que exista
    }
};

int main() {
    Solution s;

    // Árbol de prueba (el mismo que en 236):
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

    // Caso 1: p y q existen y están en subárboles distintos de la raíz
    // => LCA es la raíz (idéntico al caso feliz de 236).
    TreeNode* r1 = s.lowestCommonAncestor(n3, n5, n1);
    assert(r1 != nullptr && r1->val == 3);

    // Caso 2: p y q existen, uno es ancestro directo del otro => LCA es 5.
    TreeNode* r2 = s.lowestCommonAncestor(n3, n5, n4);
    assert(r2 != nullptr && r2->val == 5);

    // Caso 3: q NO existe en el árbol (nodo suelto, no enlazado a nada).
    // Aunque p (n5) sí existe, como q falta debemos devolver nullptr.
    TreeNode* suelto99 = new TreeNode(99);
    TreeNode* r3 = s.lowestCommonAncestor(n3, n5, suelto99);
    assert(r3 == nullptr);

    // Caso 4: NINGUNO de los dos existe en el árbol => nullptr.
    TreeNode* suelto88 = new TreeNode(88);
    TreeNode* r4 = s.lowestCommonAncestor(n3, suelto99, suelto88);
    assert(r4 == nullptr);

    // Caso 5: dos hojas hermanas que sí existen => LCA es su padre directo (1).
    TreeNode* r5 = s.lowestCommonAncestor(n3, n0, n8);
    assert(r5 != nullptr && r5->val == 1);

    delete n6; delete n7; delete n4; delete n2; delete n5;
    delete n0; delete n8; delete n1; delete n3;
    delete suelto99; delete suelto88;

    cout << "1644 LCA II: todas las pruebas pasaron.\n";
    return 0;
}
