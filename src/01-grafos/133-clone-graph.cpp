// ============================================================================
// 133. Clone Graph  (Medium)
// ----------------------------------------------------------------------------
// Nos dan una referencia a un nodo de un grafo no dirigido y CONEXO. Cada
// nodo tiene un valor entero y una lista de vecinos. Debemos devolver una
// COPIA PROFUNDA (deep copy) de todo el grafo: cada nodo de la copia debe ser
// un objeto nuevo (distinta dirección de memoria), con el mismo valor y las
// mismas conexiones que su original.
//
// Ejemplo (grafo cuadrado de 4 nodos):
//
//   1 -- 2          Lista de adyacencia:
//   |    |            1: [2, 4]
//   4 -- 3            2: [1, 3]
//                      3: [2, 4]
//                      4: [1, 3]
//
// Diagrama del DFS con mapa original -> copia:
//
//   visitar(1) -> ¿existe copia de 1? no: la creamos, la guardamos en el mapa
//                 y recorremos sus vecinos [2, 4]
//                    visitar(2) -> creamos copia de 2, recorremos [1, 3]
//                        visitar(1) -> YA existe copia de 1 en el mapa:
//                                      la devolvemos sin recrearla (evita
//                                      recursión infinita en el ciclo)
//                        visitar(3) -> creamos copia de 3, recorremos [2, 4]
//                            visitar(2) -> ya existe, se devuelve del mapa
//                            visitar(4) -> creamos copia de 4, recorremos [1, 3]
//                                (1 y 3 ya existen, se devuelven del mapa)
//
// Idea: DFS clásico, pero en vez de un simple "visitado" usamos un
// unordered_map<Node*, Node*> que traduce cada nodo original a su copia. La
// primera vez que visitamos un nodo original creamos su copia y la
// registramos en el mapa ANTES de recorrer sus vecinos; así, si el grafo
// tiene un ciclo (como el cuadrado de arriba), al volver a toparnos con un
// nodo ya visitado simplemente reutilizamos la copia guardada en vez de
// clonar de nuevo o entrar en un bucle infinito.
//
// Complejidad: tiempo O(V+E) (visitamos cada nodo y cada arista una vez),
//              espacio O(V) por el mapa y la pila de recursión.
// ============================================================================
#include <vector>
#include <unordered_map>
#include <cassert>
#include <iostream>
using namespace std;

// Definición del nodo del grafo (la da el enunciado de LeetCode).
struct Node {
    int val;
    vector<Node*> neighbors;
    Node() : val(0), neighbors(vector<Node*>()) {}
    Node(int _val) : val(_val), neighbors(vector<Node*>()) {}
    Node(int _val, vector<Node*> _neighbors) : val(_val), neighbors(_neighbors) {}
};

class Solution {
public:
    Node* cloneGraph(Node* nodo) {
        if (nodo == nullptr) return nullptr;   // grafo vacío => copia vacía
        unordered_map<Node*, Node*> copias;    // original -> copia
        return clonar(nodo, copias);
    }

private:
    Node* clonar(Node* original, unordered_map<Node*, Node*>& copias) {
        auto it = copias.find(original);
        if (it != copias.end()) return it->second;   // ya clonado: reusar

        Node* copia = new Node(original->val);
        copias[original] = copia;   // registrar ANTES de recorrer vecinos
                                     // (rompe los ciclos del grafo)
        for (Node* vecino : original->neighbors) {
            copia->neighbors.push_back(clonar(vecino, copias));
        }
        return copia;
    }
};

// ---------------------------------------------------------------------------
// Utilidades de prueba: liberar la memoria de un grafo clonado y comparar
// que dos grafos (original y copia) tengan la misma estructura pero nodos
// con direcciones de memoria distintas.
// ---------------------------------------------------------------------------

// Verifica recursivamente que "copia" sea una réplica fiel de "original":
// mismos valores, misma cantidad de vecinos en el mismo orden, pero cada
// nodo de la copia debe ser un puntero DISTINTO al original correspondiente.
void verificarClonSonIguales(Node* original, Node* copia,
                              unordered_map<Node*, Node*>& visitados) {
    assert(original != nullptr && copia != nullptr);
    assert(original != copia);              // direcciones distintas
    assert(original->val == copia->val);    // mismo valor
    assert(original->neighbors.size() == copia->neighbors.size());

    visitados[original] = copia;
    for (size_t i = 0; i < original->neighbors.size(); ++i) {
        Node* vecinoOriginal = original->neighbors[i];
        Node* vecinoCopia = copia->neighbors[i];
        if (visitados.count(vecinoOriginal)) {
            // Ya visitado: sólo confirmamos que apunte a la MISMA copia
            // (así comprobamos que no se duplicó el clon de un nodo).
            assert(visitados[vecinoOriginal] == vecinoCopia);
        } else {
            verificarClonSonIguales(vecinoOriginal, vecinoCopia, visitados);
        }
    }
}

// Libera todos los nodos alcanzables desde "raiz" (evita fugas de memoria
// entre las distintas pruebas del main).
void liberarGrafo(Node* raiz) {
    if (raiz == nullptr) return;
    unordered_map<Node*, bool> visitados;
    vector<Node*> pila = {raiz};
    visitados[raiz] = true;
    vector<Node*> todos;
    while (!pila.empty()) {
        Node* actual = pila.back();
        pila.pop_back();
        todos.push_back(actual);
        for (Node* vecino : actual->neighbors) {
            if (!visitados.count(vecino)) {
                visitados[vecino] = true;
                pila.push_back(vecino);
            }
        }
    }
    for (Node* n : todos) delete n;
}

int main() {
    Solution s;

    // --- Caso 1: grafo cuadrado de 4 nodos (1-2-3-4-1), con ciclo ---
    Node* n1 = new Node(1);
    Node* n2 = new Node(2);
    Node* n3 = new Node(3);
    Node* n4 = new Node(4);
    n1->neighbors = {n2, n4};
    n2->neighbors = {n1, n3};
    n3->neighbors = {n2, n4};
    n4->neighbors = {n1, n3};

    Node* copia1 = s.cloneGraph(n1);
    assert(copia1 != nullptr);
    assert(copia1 != n1);   // el nodo raíz de la copia es un objeto distinto
    {
        unordered_map<Node*, Node*> visitados;
        verificarClonSonIguales(n1, copia1, visitados);
        assert(visitados.size() == 4);   // se clonaron exactamente 4 nodos
    }
    liberarGrafo(copia1);
    liberarGrafo(n1);

    // --- Caso 2: un solo nodo, sin vecinos ---
    Node* solo = new Node(1);
    Node* copiaSolo = s.cloneGraph(solo);
    assert(copiaSolo != nullptr);
    assert(copiaSolo != solo);
    assert(copiaSolo->val == 1);
    assert(copiaSolo->neighbors.empty());
    liberarGrafo(copiaSolo);
    liberarGrafo(solo);

    // --- Caso 3: grafo nulo (vacío) ---
    assert(s.cloneGraph(nullptr) == nullptr);

    cout << "133 Clone Graph: todas las pruebas pasaron.\n";
    return 0;
}
