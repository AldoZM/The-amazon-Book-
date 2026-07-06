// ============================================================================
// 98. Validate Binary Search Tree (Medium)
// ----------------------------------------------------------------------------
// Dada la raíz de un árbol binario, determina si es un árbol de búsqueda binaria
// (BST) válido.
// 
// Un BST válido se define como sigue:
// - El subárbol izquierdo de un nodo contiene solo nodos con claves MENORES que
//   la clave del nodo.
// - El subárbol derecho de un nodo contiene solo nodos con claves MAYORES que
//   la clave del nodo.
// - Ambos subárboles (izquierdo y derecho) deben ser también BST válidos.
// 
// Ejemplo 1:
//      2
//     / \
//    1   3
// Es un BST válido. Todo a la izquierda de 2 es < 2, todo a la derecha es > 2.
// 
// Ejemplo 2:
//      5
//     / \
//    1   4
//       / \
//      3   6
// NO es válido. Aunque en el nodo 4, 3 < 4 y 6 > 4, el nodo 3 está en el
// subárbol derecho de 5 y 3 NO es mayor que 5.
// 
// Idea clave: un error común es comparar solo el nodo actual con sus dos
// hijos inmediatos. Esto falla porque un nodo muy abajo en el subárbol derecho
// podría violar la condición de ser mayor que la raíz original.
// 
// Solución correcta: recursión bajando un RANGO PERMITIDO (min, max).
// - Al ir a la izquierda, el valor máximo permitido se actualiza al valor actual.
// - Al ir a la derecha, el valor mínimo permitido se actualiza al valor actual.
// (Usamos el tipo long long para evitar problemas de overflow con INT_MAX/INT_MIN).
// 
// Complejidad: tiempo O(n) (visitamos cada nodo una vez),
//              espacio O(h) por la pila de recursión (h = altura).
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
    bool isValidBST(TreeNode* root) {
        return validar(root, LLONG_MIN, LLONG_MAX);
    }
    
private:
    bool validar(TreeNode* nodo, long long minimo, long long maximo) {
        if (nodo == nullptr) return true;
        
        // Si el valor actual está fuera del rango permitido, no es un BST.
        if (nodo->val <= minimo || nodo->val >= maximo) {
            return false;
        }
        
        // El subárbol izquierdo debe tener valores menores que nodo->val.
        // El subárbol derecho debe tener valores mayores que nodo->val.
        return validar(nodo->left, minimo, nodo->val) && 
               validar(nodo->right, nodo->val, maximo);
    }
};

int main() {
    Solution s;
    
    // Caso 1: Árbol válido simple.
    //      2
    //     / \
    //    1   3
    TreeNode* n1 = new TreeNode(2);
    n1->left = new TreeNode(1);
    n1->right = new TreeNode(3);
    assert(s.isValidBST(n1) == true);
    delete n1->left; delete n1->right; delete n1;
    
    // Caso 2: Árbol inválido por nodo profundo.
    //      5
    //     / \
    //    1   4
    //       / \
    //      3   6
    TreeNode* n2 = new TreeNode(5);
    n2->left = new TreeNode(1);
    n2->right = new TreeNode(4);
    n2->right->left = new TreeNode(3);
    n2->right->right = new TreeNode(6);
    assert(s.isValidBST(n2) == false);
    delete n2->right->left; delete n2->right->right;
    delete n2->left; delete n2->right; delete n2;
    
    // Caso 3: Solo un nodo (siempre válido).
    TreeNode* n3 = new TreeNode(10);
    assert(s.isValidBST(n3) == true);
    delete n3;
    
    // Caso 4: Valores en el límite de los enteros de 32 bits (INT_MAX).
    TreeNode* n4 = new TreeNode(INT_MAX);
    assert(s.isValidBST(n4) == true);
    delete n4;
    
    cout << "98 Validate BST: todas las pruebas pasaron.\n";
    return 0;
}
