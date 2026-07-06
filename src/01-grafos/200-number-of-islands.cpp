// ============================================================================
// 200. Number of Islands  (Medium)
// ----------------------------------------------------------------------------
// Dada una cuadrícula de '1' (tierra) y '0' (agua), cuenta cuántas islas hay.
// Una isla se forma conectando tierras adyacentes en horizontal o vertical
// (no en diagonal). Los bordes de la cuadrícula son todos agua.
//
// Ejemplo:
//   grid =
//     1 1 0 0 0          Aquí hay 3 islas:
//     1 1 0 0 0            - bloque 2x2 arriba-izquierda
//     0 0 1 0 0            - celda central
//     0 0 0 1 1            - bloque de 2 abajo-derecha
//
// Diagrama de la exploración DFS desde una celda de tierra:
//
//        (r-1,c)
//           |
//   (r,c-1)-(r,c)-(r,c+1)      Visitamos las 4 vecinas; cada tierra
//           |                  visitada la marcamos como '0' (hundida)
//        (r+1,c)               para no contarla otra vez.
//
// Idea: recorremos la cuadrícula. Cuando encontramos un '1' no visitado,
// sumamos una isla y "hundimos" (marcamos como agua) toda su tierra conectada
// con DFS. Así cada isla se cuenta exactamente una vez.
//
// Complejidad: tiempo O(m*n) (cada celda se visita una vez),
//              espacio O(m*n) peor caso por la pila de recursión.
// ============================================================================
#include <vector>
#include <cassert>
#include <iostream>
using namespace std;

class Solution {
public:
    int numIslands(vector<vector<char>>& grid) {
        if (grid.empty() || grid[0].empty()) return 0;
        int m = grid.size(), n = grid[0].size();
        int islas = 0;
        for (int r = 0; r < m; ++r) {
            for (int c = 0; c < n; ++c) {
                if (grid[r][c] == '1') {   // tierra sin visitar => nueva isla
                    ++islas;
                    hundir(grid, r, c, m, n);
                }
            }
        }
        return islas;
    }

private:
    // Marca como agua toda la tierra conectada a (r,c).
    void hundir(vector<vector<char>>& grid, int r, int c, int m, int n) {
        if (r < 0 || r >= m || c < 0 || c >= n) return;  // fuera de límites
        if (grid[r][c] != '1') return;                    // agua o ya visitada
        grid[r][c] = '0';                                 // hundir esta celda
        hundir(grid, r - 1, c, m, n);   // arriba
        hundir(grid, r + 1, c, m, n);   // abajo
        hundir(grid, r, c - 1, m, n);   // izquierda
        hundir(grid, r, c + 1, m, n);   // derecha
    }
};

int main() {
    Solution s;

    vector<vector<char>> g1 = {
        {'1','1','0','0','0'},
        {'1','1','0','0','0'},
        {'0','0','1','0','0'},
        {'0','0','0','1','1'},
    };
    assert(s.numIslands(g1) == 3);

    vector<vector<char>> g2 = {
        {'1','1','1','1','0'},
        {'1','1','0','1','0'},
        {'1','1','0','0','0'},
        {'0','0','0','0','0'},
    };
    assert(s.numIslands(g2) == 1);

    vector<vector<char>> g3 = {{'0','0'},{'0','0'}};
    assert(s.numIslands(g3) == 0);

    vector<vector<char>> vacio = {};
    assert(s.numIslands(vacio) == 0);

    cout << "200 Number of Islands: todas las pruebas pasaron.\n";
    return 0;
}
