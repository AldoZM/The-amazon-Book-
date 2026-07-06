// ============================================================================
// 994. Rotting Oranges  (Medium)
// ----------------------------------------------------------------------------
// Cuadrícula con valores: 0 = vacío, 1 = naranja fresca, 2 = naranja podrida.
// Cada minuto, toda naranja fresca adyacente (4 direcciones) a una podrida
// se pudre. Devuelve los minutos hasta que ninguna naranja quede fresca, o
// -1 si es imposible (queda alguna fresca aislada).
//
// Ejemplo:
//   minuto 0        minuto 1        minuto 2
//     2 1 1           2 2 1           2 2 2
//     1 1 0    =>     2 1 0    =>     2 2 0
//     0 1 1           0 1 1           0 2 1   ... hasta minuto 4
//
// Diagrama del BFS multi-fuente (todas las podridas empiezan en la cola):
//
//   cola inicial: [todas las (r,c) con valor 2]
//   por cada nivel (minuto): sacamos la capa actual y pudrimos vecinas
//   frescas, que entran al siguiente nivel. El número de niveles-1 = minutos.
//
// Idea: BFS por niveles desde TODAS las podridas a la vez (multi-fuente).
// Contamos cuántas frescas hay; cada vez que pudrimos una, la restamos.
// Si al final quedan frescas => -1. Si no había frescas al inicio => 0.
//
// Complejidad: tiempo O(m*n), espacio O(m*n) por la cola.
// ============================================================================
#include <vector>
#include <queue>
#include <cassert>
#include <iostream>
using namespace std;

class Solution {
public:
    int orangesRotting(vector<vector<int>>& grid) {
        int m = grid.size(), n = grid[0].size();
        queue<pair<int,int>> cola;   // naranjas podridas (fuentes del BFS)
        int frescas = 0;
        for (int r = 0; r < m; ++r)
            for (int c = 0; c < n; ++c) {
                if (grid[r][c] == 2) cola.push({r, c});
                else if (grid[r][c] == 1) ++frescas;
            }

        if (frescas == 0) return 0;   // nada que pudrir

        int minutos = 0;
        int dr[] = {-1, 1, 0, 0};
        int dc[] = {0, 0, -1, 1};
        while (!cola.empty() && frescas > 0) {
            int capa = cola.size();   // naranjas podridas en este minuto
            for (int i = 0; i < capa; ++i) {
                auto [r, c] = cola.front(); cola.pop();
                for (int d = 0; d < 4; ++d) {
                    int nr = r + dr[d], nc = c + dc[d];
                    if (nr < 0 || nr >= m || nc < 0 || nc >= n) continue;
                    if (grid[nr][nc] != 1) continue;   // vacío o ya podrida
                    grid[nr][nc] = 2;                  // se pudre
                    --frescas;
                    cola.push({nr, nc});
                }
            }
            ++minutos;   // pasó un minuto completo
        }
        return frescas == 0 ? minutos : -1;
    }
};

int main() {
    Solution s;

    vector<vector<int>> g1 = {{2,1,1},{1,1,0},{0,1,1}};
    assert(s.orangesRotting(g1) == 4);

    // Imposible: la naranja de abajo-izquierda nunca se pudre.
    vector<vector<int>> g2 = {{2,1,1},{0,1,1},{1,0,1}};
    assert(s.orangesRotting(g2) == -1);

    // Sin naranjas frescas => 0 minutos.
    vector<vector<int>> g3 = {{0,2}};
    assert(s.orangesRotting(g3) == 0);

    // Todo vacío => 0.
    vector<vector<int>> g4 = {{0,0},{0,0}};
    assert(s.orangesRotting(g4) == 0);

    cout << "994 Rotting Oranges: todas las pruebas pasaron.\n";
    return 0;
}
