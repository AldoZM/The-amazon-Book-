// ============================================================================
// 105. Construct Binary Tree from Preorder and Inorder Traversal (Medium)
// ----------------------------------------------------------------------------
// Dados dos arreglos de enteros preorder e inorder donde preorder es el
// recorrido en preorden de un árbol binario e inorder es el recorrido en
// inorden del mismo árbol, construye y devuelve el árbol binario.
// 
// Ejemplo 1:
//      3
//     / \
//    9  20
//      /  \
//     15   7
// Entrada: preorder = [3,9,20,15,7], inorder = [9,3,15,20,7]
// Salida: [3,9,20,null,null,15,7] (representación en niveles)
// 
// Idea clave:
// 1. El primer elemento de 'preorder' siempre es la RAÍZ del árbol actual.
// 2. Buscamos el valor de esa raíz en el arreglo 'inorder'.
// 3. Todo lo que está a la izquierda de la raíz en 'inorder' pertenece al
//    subárbol izquierdo. Todo lo que está a la derecha pertenece al subárbol
//    derecho.
// 4. Con el tamaño del subárbol izquierdo (digamos, k elementos), sabemos que
//    los siguientes k elementos en 'preorder' (después de la raíz) son
//    exactamente el preorden del subárbol izquierdo.
// 
// Para que la búsqueda en 'inorder' sea rápida, usamos un mapa hash (O(1)) en
// lugar de hacer escaneo lineal (O(n)).
// 
// Complejidad: tiempo O(n) (hash map + recursión lineal), espacio O(n)
//              (mapa hash y pila de recursión).
// ============================================================================
#include <vector>
#include <unordered_map>
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
    TreeNode* buildTree(vector<int>& preorder, vector<int>& inorder) {
        // Mapa para encontrar el índice de cualquier valor en inorder en O(1)
        unordered_map<int, int> inorderIndex;
        for (int i = 0; i < inorder.size(); i++) {
            inorderIndex[inorder[i]] = i;
        }
        
        // Puntero global para avanzar en el arreglo preorder
        int preIndex = 0;
        return construir(preorder, inorderIndex, preIndex, 0, inorder.size() - 1);
    }
    
private:
    TreeNode* construir(const vector<int>& preorder, 
                        unordered_map<int, int>& inorderIndex, 
                        int& preIndex, int inStart, int inEnd) {
        
        // Caso base: no hay elementos para este subárbol
        if (inStart > inEnd) {
            return nullptr;
        }
        
        // El elemento actual en preorden es la raíz de este subárbol
        int rootVal = preorder[preIndex++];
        TreeNode* root = new TreeNode(rootVal);
        
        // Encontramos dónde está esta raíz en el arreglo inorden
        int mid = inorderIndex[rootVal];
        
        // Construimos recursivamente los subárboles izquierdo y derecho.
        // Importante: primero construimos el izquierdo porque los siguientes
        // elementos en preorder pertenecen al subárbol izquierdo.
        root->left = construir(preorder, inorderIndex, preIndex, inStart, mid - 1);
        root->right = construir(preorder, inorderIndex, preIndex, mid + 1, inEnd);
        
        return root;
    }
};

// Función auxiliar para liberar la memoria del árbol
void liberarArbol(TreeNode* root) {
    if (!root) return;
    liberarArbol(root->left);
    liberarArbol(root->right);
    delete root;
}

int main() {
    Solution s;
    
    // Caso 1:
    //      3
    //     / \
    //    9  20
    //      /  \
    //     15   7
    vector<int> pre1 = {3, 9, 20, 15, 7};
    vector<int> in1 = {9, 3, 15, 20, 7};
    TreeNode* root1 = s.buildTree(pre1, in1);
    
    assert(root1->val == 3);
    assert(root1->left->val == 9);
    assert(root1->right->val == 20);
    assert(root1->left->left == nullptr);
    assert(root1->left->right == nullptr);
    assert(root1->right->left->val == 15);
    assert(root1->right->right->val == 7);
    liberarArbol(root1);
    
    // Caso 2: Un solo nodo
    vector<int> pre2 = {-1};
    vector<int> in2 = {-1};
    TreeNode* root2 = s.buildTree(pre2, in2);
    assert(root2->val == -1);
    assert(root2->left == nullptr && root2->right == nullptr);
    liberarArbol(root2);
    
    cout << "105 Construct Binary Tree: todas las pruebas pasaron.\n";
    return 0;
}
