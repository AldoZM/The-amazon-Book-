// ============================================================================
// 337. House Robber III (Medium)
// ----------------------------------------------------------------------------
// El ladrón ha descubierto un nuevo vecindario para robar. Hay una sola
// entrada a este lugar, llamada "raíz". Además de la raíz, cada casa tiene
// exactamente una casa matriz (un padre). Después de un recorrido, el ladrón
// se da cuenta de que todas las casas en este lugar forman un árbol binario.
// 
// Automáticamente se contactará a la policía si se roban dos casas unidas
// directamente en la misma noche (es decir, no puedes robar un nodo y a
// su padre).
// 
// Determina la cantidad máxima de dinero que el ladrón puede robar esta noche
// sin alertar a la policía.
// 
// Ejemplo 1:
//      3
//     / \
//    2   3
//     \   \
//      3   1
// Robo óptimo = 3 (raíz) + 3 (hijo de 2) + 1 (hijo de 3) = 7.
// 
// Ejemplo 2:
//      3
//     / \
//    4   5
//   / \   \
//  1   3   1
// Robo óptimo = 4 (hijo izq) + 5 (hijo der) = 9.
// 
// Idea clave:
// Para cada nodo, tenemos dos opciones:
// 1. Robar el nodo actual. Si lo hacemos, NO podemos robar sus hijos,
//    así que sumamos el valor del nodo más lo que sacaríamos de los "nietos"
//    (es decir, robando los subárboles de los hijos, pero eligiendo no
//    robar los hijos inmediatos).
// 2. NO robar el nodo actual. Si hacemos esto, somos libres de decidir si
//    robar o no robar cada uno de los hijos (tomando el máximo entre ambas
//    opciones para cada hijo).
// 
// Para evitar recalcular estados (que daría O(2^n)), usamos DFS en post-order,
// devolviendo para cada nodo un par: [max_sin_robar_raiz, max_robando_raiz].
// 
// Complejidad: tiempo O(n), espacio O(h) para la pila de recursión.
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
    int rob(TreeNode* root) {
        pair<int, int> resultado = robarDFS(root);
        return max(resultado.first, resultado.second);
    }
    
private:
    // Devuelve un par {maximo_SIN_robar_el_nodo, maximo_ROBANDO_el_nodo}
    pair<int, int> robarDFS(TreeNode* nodo) {
        if (!nodo) {
            return {0, 0};
        }
        
        pair<int, int> izq = robarDFS(nodo->left);
        pair<int, int> der = robarDFS(nodo->right);
        
        // Si decidimos NO robar el nodo actual, somos libres de elegir
        // la mejor opción (robar o no robar) para cada uno de sus hijos.
        int sinRobar = max(izq.first, izq.second) + max(der.first, der.second);
        
        // Si decidimos ROBAR el nodo actual, obligatoriamente NO podemos robar
        // a sus hijos directos.
        int robando = nodo->val + izq.first + der.first;
        
        return {sinRobar, robando};
    }
};

int main() {
    Solution s;
    
    // Caso 1:
    //      3
    //     / \
    //    2   3
    //     \   \
    //      3   1
    TreeNode* r1 = new TreeNode(3);
    r1->left = new TreeNode(2);
    r1->right = new TreeNode(3);
    r1->left->right = new TreeNode(3);
    r1->right->right = new TreeNode(1);
    assert(s.rob(r1) == 7);
    
    // Caso 2:
    //      3
    //     / \
    //    4   5
    //   / \   \
    //  1   3   1
    TreeNode* r2 = new TreeNode(3);
    r2->left = new TreeNode(4);
    r2->right = new TreeNode(5);
    r2->left->left = new TreeNode(1);
    r2->left->right = new TreeNode(3);
    r2->right->right = new TreeNode(1);
    assert(s.rob(r2) == 9);
    
    cout << "337 House Robber III: todas las pruebas pasaron.\n";
    
    // Cleanup manual (solo para no ensuciar la salida, en CP a veces se omite
    // pero aquí somos limpios).
    delete r1->left->right; delete r1->right->right;
    delete r1->left; delete r1->right; delete r1;
    
    delete r2->left->left; delete r2->left->right; delete r2->right->right;
    delete r2->left; delete r2->right; delete r2;
    
    return 0;
}
