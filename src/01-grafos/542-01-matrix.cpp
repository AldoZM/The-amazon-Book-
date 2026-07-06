// ============================================================================
// 542. 01 Matrix  (Medium)
// ----------------------------------------------------------------------------
// Dada una matriz de 0 y 1, devuelve una matriz del mismo tamaño donde cada
// celda contiene la distancia (número de pasos en 4 direcciones) al 0 más
// cercano. La distancia entre celdas adyacentes es 1.
//
// Ejemplo:
//   entrada        salida
//     0 0 0          0 0 0
//     0 1 0          0 1 0
//     1 1 1          1 2 1
//
// Diagrama del BFS multi-fuente (todos los 0 arrancan en la cola a la vez):
//
//   cola inicial: [todas las celdas con valor 0]  dist = 0
//   nivel 1: vecinas de los 0 que aún no tienen distancia -> dist = 1
//   nivel 2: vecinas de esas -> dist = 2 ...
//
//   La "ola" se expande desde TODOS los ceros simultáneamente, así la primera
//   vez que una celda 1 es alcanzada, es por su cero más cercano.
//
// Idea (truco clave): NO hacer un BFS por cada 1 (sería O((m*n)^2)). En vez de
// eso, hacer UN BFS multi-fuente partiendo de todos los ceros. Inicializamos
// dist=0 en los ceros e infinito en los unos; la onda del BFS asigna la
// distancia mínima a cada uno automáticamente.
//
// Complejidad: tiempo O(m*n) (cada celda entra a la cola una vez),
//              espacio O(m*n) por la cola y la matriz de distancias.
// ============================================================================
#include <vector>
#include <queue>
#include <cassert>
#include <climits>
#include <iostream>
using namespace std;

class Solution {
public:
    vector<vector<int>> updateMatrix(vector<vector<int>>& mat) {
        int m = mat.size(), n = mat[0].size();
        vector<vector<int>> dist(m, vector<int>(n, INT_MAX));
        queue<pair<int,int>> cola;

        // Fuentes del BFS: todos los ceros con distancia 0.
        for (int r = 0; r < m; ++r)
            for (int c = 0; c < n; ++c)
                if (mat[r][c] == 0) {
                    dist[r][c] = 0;
                    cola.push({r, c});
                }

        int dr[] = {-1, 1, 0, 0};
        int dc[] = {0, 0, -1, 1};
        while (!cola.empty()) {
            auto [r, c] = cola.front(); cola.pop();
            for (int d = 0; d < 4; ++d) {
                int nr = r + dr[d], nc = c + dc[d];
                if (nr < 0 || nr >= m || nc < 0 || nc >= n) continue;
                // Solo mejora si encontramos un camino más corto (aún sin fijar).
                if (dist[nr][nc] > dist[r][c] + 1) {
                    dist[nr][nc] = dist[r][c] + 1;
                    cola.push({nr, nc});
                }
            }
        }
        return dist;
    }
};

int main() {
    Solution s;

    vector<vector<int>> g1 = {{0,0,0},{0,1,0},{1,1,1}};
    vector<vector<int>> e1 = {{0,0,0},{0,1,0},{1,2,1}};
    assert(s.updateMatrix(g1) == e1);

    vector<vector<int>> g2 = {{0,0,0},{0,1,0},{0,0,0}};
    vector<vector<int>> e2 = {{0,0,0},{0,1,0},{0,0,0}};
    assert(s.updateMatrix(g2) == e2);

    // Fila con un solo cero al inicio.
    vector<vector<int>> g3 = {{0,1,1,1}};
    vector<vector<int>> e3 = {{0,1,2,3}};
    assert(s.updateMatrix(g3) == e3);

    cout << "542 01 Matrix: todas las pruebas pasaron.\n";
    return 0;
}
