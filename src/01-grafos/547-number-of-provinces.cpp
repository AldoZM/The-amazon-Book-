// ============================================================================
// 547. Number of Provinces  (Medium)
// ----------------------------------------------------------------------------
// Hay n ciudades. Nos dan una matriz de adyacencia isConnected de tamaño
// n x n, donde isConnected[i][j] == 1 si la ciudad i y la ciudad j están
// conectadas DIRECTAMENTE, e isConnected[i][j] == 0 si no lo están (siempre
// isConnected[i][i] == 1, la matriz es simétrica). Una "provincia" es un
// grupo de ciudades conectadas directa o indirectamente, y que no está
// conectado con ninguna ciudad fuera del grupo. Queremos contar cuántas
// provincias hay.
//
// Ejemplo:
//   isConnected =
//     1 1 0          Ciudad 0 y 1 están conectadas directamente.
//     1 1 0          Ciudad 2 no está conectada con nadie más.
//     0 0 1
//
//   Hay 2 provincias: {0, 1} y {2}.
//
// Idea: esta matriz de adyacencia NO es más que otra forma de darnos el
// mismo grafo no dirigido de 323 "Number of Connected Components". En vez de
// recibir una lista de aristas [a, b], recibimos, para cada par de ciudades
// (i, j), si existe o no la arista. Así que el problema es idéntico: contar
// componentes conexos. Usamos Union-Find (DSU): cada ciudad empieza siendo
// su propia provincia; cada vez que isConnected[i][j] == 1 con i != j,
// unimos las ciudades i y j (si no estaban ya en la misma provincia,
// decrementamos el contador de provincias).
//
// Diagrama de la matriz interpretada como grafo:
//
//   isConnected[i][j] == 1  <=>  arista (i, j) en el grafo
//
//       0 --- 1        2 (aislada)
//
//   (fila/columna 0 y 1 se apuntan entre sí; fila/columna 2 solo se apunta
//    a sí misma en la diagonal)
//
// Complejidad: tiempo O(n^2 * alfa(n)) (revisamos las n^2 celdas de la
//              matriz, cada find/unir es casi O(1) amortizado),
//              espacio O(n) por los arreglos padre y rango.
// ============================================================================
#include <vector>
#include <cassert>
#include <iostream>
using namespace std;

class Solution {
public:
    int findCircleNum(vector<vector<int>>& isConnected) {
        int n = isConnected.size();
        padre.resize(n);
        rango.assign(n, 0);
        for (int i = 0; i < n; ++i) padre[i] = i;   // cada ciudad es su propia raíz

        int provincias = n;   // al inicio, cada ciudad es una provincia aislada
        for (int i = 0; i < n; ++i) {
            for (int j = i + 1; j < n; ++j) {   // basta la mitad superior (matriz simétrica)
                if (isConnected[i][j] == 1) {
                    int raizI = find(i);
                    int raizJ = find(j);
                    if (raizI != raizJ) {
                        unir(raizI, raizJ);
                        --provincias;   // dos provincias se fusionaron en una
                    }
                }
            }
        }
        return provincias;
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

    // Ciudades 0 y 1 conectadas directamente; ciudad 2 aislada => 2 provincias.
    vector<vector<int>> m1 = {
        {1, 1, 0},
        {1, 1, 0},
        {0, 0, 1},
    };
    assert(s.findCircleNum(m1) == 2);

    // Ninguna ciudad conectada con otra (solo la diagonal) => 3 provincias.
    vector<vector<int>> m2 = {
        {1, 0, 0},
        {0, 1, 0},
        {0, 0, 1},
    };
    assert(s.findCircleNum(m2) == 3);

    // Todas las ciudades conectadas entre sí => 1 sola provincia.
    vector<vector<int>> m3 = {
        {1, 1, 1},
        {1, 1, 1},
        {1, 1, 1},
    };
    assert(s.findCircleNum(m3) == 1);

    // Una sola ciudad => 1 provincia.
    vector<vector<int>> m4 = {{1}};
    assert(s.findCircleNum(m4) == 1);

    cout << "547 Number of Provinces: todas las pruebas pasaron.\n";
    return 0;
}
