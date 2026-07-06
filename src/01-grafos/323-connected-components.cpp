// ============================================================================
// 323. Number of Connected Components in an Undirected Graph  (Medium)
// ----------------------------------------------------------------------------
// Hay n nodos, numerados de 0 a n-1, y una lista edges de pares [a, b] que
// representan aristas NO dirigidas. Cuenta cuántos componentes conexos tiene
// el grafo.
//
// Ejemplo 1:
//   n = 5, edges = [[0,1],[1,2],[3,4]]
//
//     0 --- 1 --- 2        3 --- 4
//
//   Hay 2 componentes: {0,1,2} y {3,4}.
//
// Ejemplo 2:
//   n = 5, edges = [[0,1],[1,2],[2,3],[3,4]]
//
//     0 --- 1 --- 2 --- 3 --- 4
//
//   Todos quedan conectados en cadena: 1 solo componente.
//
// Idea (Union-Find / DSU, Disjoint Set Union):
// - Empezamos suponiendo que cada nodo es su propio componente: n
//   componentes en total, cada uno representado por su propia raíz.
// - Por cada arista [a, b], buscamos la raíz de a y la raíz de b (find).
//   Si ya comparten raíz, la arista no cambia nada (ya estaban en el mismo
//   componente). Si tienen raíces distintas, unimos los dos conjuntos
//   (union) y decrementamos el contador de componentes en 1: dos
//   componentes se acaban de fusionar en uno solo.
// - Al terminar de procesar todas las aristas, el contador tiene la
//   respuesta final.
// - Usamos unión por rango y compresión de caminos para que find/union
//   sean casi O(1) amortizado (O(alfa(n)), la función inversa de Ackermann).
//
// Diagrama de una unión:
//
//   componente(a): [a]--[x]--[raiz_a]      componente(b): [b]--[raiz_b]
//
//   find(a) = raiz_a, find(b) = raiz_b, son distintas => unimos:
//
//   raiz_b pasa a colgar de raiz_a (o viceversa, según el rango) y
//   --componentes.
//
// Nota: es hermano del problema 261 "Graph Valid Tree" (mismo DSU: un grafo
// es árbol si y solo si tiene exactamente n-1 aristas y termina con un solo
// componente, es decir, ninguna arista intenta unir un nodo consigo mismo
// en el mismo componente) y del patrón de "contar islas" (200, 695): en
// vez de recorrer una cuadrícula con DFS/BFS, aquí contamos componentes de
// un grafo general dado por lista de aristas. También se puede resolver con
// DFS/BFS marcando visitados y contando cuántas veces arrancamos una
// exploración nueva, igual que en Number of Islands.
//
// Complejidad: tiempo O(n + e*alfa(n)) (n nodos, e aristas),
//              espacio O(n) por los arreglos padre y rango.
// ============================================================================
#include <vector>
#include <cassert>
#include <iostream>
using namespace std;

class Solution {
public:
    int countComponents(int n, vector<vector<int>>& edges) {
        padre.resize(n);
        rango.assign(n, 0);
        for (int i = 0; i < n; ++i) padre[i] = i;   // cada nodo es su propia raíz

        int componentes = n;   // al inicio, cada nodo es un componente aislado
        for (auto& arista : edges) {
            int a = arista[0], b = arista[1];
            int raizA = find(a);
            int raizB = find(b);
            if (raizA != raizB) {
                unir(raizA, raizB);
                --componentes;   // dos componentes se fusionaron en uno
            }
        }
        return componentes;
    }

private:
    vector<int> padre;
    vector<int> rango;

    // Encuentra la raíz del conjunto de x, comprimiendo el camino recorrido.
    int find(int x) {
        if (padre[x] != x) padre[x] = find(padre[x]);   // compresión de caminos
        return padre[x];
    }

    // Une los conjuntos de dos raíces distintas usando unión por rango.
    void unir(int raizA, int raizB) {
        if (rango[raizA] < rango[raizB]) swap(raizA, raizB);
        padre[raizB] = raizA;               // la raíz de menor rango cuelga de la mayor
        if (rango[raizA] == rango[raizB]) ++rango[raizA];
    }
};

int main() {
    Solution s;

    // Dos componentes: {0,1,2} en cadena y {3,4} aparte.
    vector<vector<int>> e1 = {{0,1},{1,2},{3,4}};
    assert(s.countComponents(5, e1) == 2);

    // Cadena que conecta todo: un solo componente.
    vector<vector<int>> e2 = {{0,1},{1,2},{2,3},{3,4}};
    assert(s.countComponents(5, e2) == 1);

    // Sin aristas: cada nodo es su propio componente.
    vector<vector<int>> e3 = {};
    assert(s.countComponents(4, e3) == 4);

    // Un solo nodo, sin aristas: un componente.
    vector<vector<int>> e4 = {};
    assert(s.countComponents(1, e4) == 1);

    cout << "323 Connected Components: todas las pruebas pasaron.\n";
    return 0;
}
