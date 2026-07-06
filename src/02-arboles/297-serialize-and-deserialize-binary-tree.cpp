// ============================================================================
// 297. Serialize and Deserialize Binary Tree (Hard)
// ----------------------------------------------------------------------------
// La serialización es el proceso de convertir una estructura de datos o un
// objeto en una secuencia de bits para que pueda almacenarse en un archivo o
// búfer de memoria, o transmitirse a través de una conexión de red para
// reconstruirse posteriormente en el mismo entorno o en otro entorno.
// 
// Diseña un algoritmo para serializar y deserializar un árbol binario. No hay
// restricciones sobre cómo tu algoritmo de serialización/deserialización debe
// funcionar. Solo necesitas asegurarte de que un árbol binario se pueda
// serializar en una cadena y esta cadena se pueda deserializar en la
// estructura de árbol original.
// 
// Ejemplo 1:
//      1
//     / \
//    2   3
//       / \
//      4   5
// Entrada: root = [1,2,3,null,null,4,5]
// Salida: [1,2,3,null,null,4,5]
// 
// Idea clave:
// Usaremos un recorrido en Preorden (Preorder: Raíz, Izquierda, Derecha).
// - Serializar: Recorremos el árbol y agregamos el valor del nodo seguido de
//   una coma (e.g., "1,"). Si encontramos un puntero nulo, agregamos un
//   marcador especial como "N,".
// - Deserializar: Leemos los tokens separados por coma uno por uno. Como
//   guardamos el árbol en preorden, el primer token es garantizadamente la
//   raíz. Luego construimos recursivamente el subárbol izquierdo y luego el
//   derecho usando el estado compartido (por ejemplo, pasando un stringstream
//   por referencia).
// 
// Complejidad: tiempo O(n), espacio O(n) tanto para serializar como para
//              deserializar (por la cadena generada y la pila de recursión).
// ============================================================================
#include <string>
#include <sstream>
#include <cassert>
#include <iostream>
using namespace std;

struct TreeNode {
    int val;
    TreeNode *left;
    TreeNode *right;
    TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
};

class Codec {
public:
    // Codifica un árbol a una cadena de texto.
    string serialize(TreeNode* root) {
        if (!root) return "N,";
        
        string res = to_string(root->val) + ",";
        res += serialize(root->left);
        res += serialize(root->right);
        
        return res;
    }

    // Decodifica tu cadena de texto a un árbol.
    TreeNode* deserialize(string data) {
        stringstream ss(data);
        return decodificar(ss);
    }
    
private:
    TreeNode* decodificar(stringstream& ss) {
        string token;
        // Leemos el siguiente token hasta la coma
        if (!getline(ss, token, ',')) {
            return nullptr;
        }
        
        // Si el token es "N", es un puntero nulo
        if (token == "N") {
            return nullptr;
        }
        
        // De lo contrario, es un número. Lo convertimos y creamos el nodo.
        TreeNode* nodo = new TreeNode(stoi(token));
        
        // Como serializamos en preorden, lo siguiente pertenece a la izquierda
        // y luego a la derecha.
        nodo->left = decodificar(ss);
        nodo->right = decodificar(ss);
        
        return nodo;
    }
};

// Función auxiliar para verificar si dos árboles son idénticos
bool sonIden(TreeNode* r1, TreeNode* r2) {
    if (!r1 && !r2) return true;
    if (!r1 || !r2) return false;
    return (r1->val == r2->val) &&
           sonIden(r1->left, r2->left) &&
           sonIden(r1->right, r2->right);
}

// Función auxiliar para liberar memoria
void liberarArbol(TreeNode* root) {
    if (!root) return;
    liberarArbol(root->left);
    liberarArbol(root->right);
    delete root;
}

int main() {
    Codec codec;
    
    // Caso 1: Árbol normal
    //      1
    //     / \
    //    2   3
    //       / \
    //      4   5
    TreeNode* root1 = new TreeNode(1);
    root1->left = new TreeNode(2);
    root1->right = new TreeNode(3);
    root1->right->left = new TreeNode(4);
    root1->right->right = new TreeNode(5);
    
    string ser1 = codec.serialize(root1);
    TreeNode* ans1 = codec.deserialize(ser1);
    assert(sonIden(root1, ans1));
    liberarArbol(root1);
    liberarArbol(ans1);
    
    // Caso 2: Árbol vacío
    TreeNode* root2 = nullptr;
    string ser2 = codec.serialize(root2);
    TreeNode* ans2 = codec.deserialize(ser2);
    assert(ans2 == nullptr);
    
    cout << "297 Serialize/Deserialize BST: todas las pruebas pasaron.\n";
    return 0;
}
