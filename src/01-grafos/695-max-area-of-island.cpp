// ============================================================================
// 695. Max Area of Island  (Medium)
// ----------------------------------------------------------------------------
// Cuadrícula de 0 (agua) y 1 (tierra). Una isla es un grupo de tierras
// conectadas en horizontal o vertical (no diagonal). El "área" de una isla
// es cuántas celdas de tierra la forman. Devuelve el área de la isla más
// grande; si no hay tierra, devuelve 0.
//
// Ejemplo:
//   grid =
//     0 0 1 0 0          La isla más grande tiene área 5
//     0 0 1 1 0          (el bloque conectado del centro).
//     0 1 1 0 0          La celda suelta de abajo-derecha es otra isla (área 1).
//     0 0 0 0 1
//
// Diagrama del DFS que mide el área desde una celda de tierra:
//
//        (r-1,c)
//           |
//   (r,c-1)-(r,c)-(r,c+1)   Cada tierra visitada aporta 1 al área y se
//           |               hunde (marca como agua) para no recontarla.
//        (r+1,c)            El área de la isla = 1 + suma de las 4 vecinas.
//
// Idea: es el patrón de "Number of Islands", pero en vez de contar islas,
// el DFS devuelve el TAMAÑO de la isla que explora. Guardamos el máximo.
//
// Complejidad: tiempo O(m*n) (cada celda se visita una vez),
//              espacio O(m*n) peor caso por la pila de recursión.
// ============================================================================
#include <vector>
#include <cassert>
#include <algorithm>
#include <iostream>
using namespace std;

class Solution {
public:
    int maxAreaOfIsland(vector<vector<int>>& grid) {
        if (grid.empty() || grid[0].empty()) return 0;
        int m = grid.size(), n = grid[0].size();
        int maximo = 0;
        for (int r = 0; r < m; ++r)
            for (int c = 0; c < n; ++c)
                if (grid[r][c] == 1)                 // tierra sin visitar
                    maximo = max(maximo, area(grid, r, c, m, n));
        return maximo;
    }

private:
    // Devuelve el área de la isla conectada a (r,c), hundiéndola a su paso.
    int area(vector<vector<int>>& grid, int r, int c, int m, int n) {
        if (r < 0 || r >= m || c < 0 || c >= n) return 0;  // fuera de límites
        if (grid[r][c] != 1) return 0;                      // agua o visitada
        grid[r][c] = 0;                                     // hundir esta celda
        return 1
             + area(grid, r - 1, c, m, n)   // arriba
             + area(grid, r + 1, c, m, n)   // abajo
             + area(grid, r, c - 1, m, n)   // izquierda
             + area(grid, r, c + 1, m, n);  // derecha
    }
};

int main() {
    Solution s;

    vector<vector<int>> g1 = {
        {0,0,1,0,0},
        {0,0,1,1,0},
        {0,1,1,0,0},
        {0,0,0,0,1},
    };
    assert(s.maxAreaOfIsland(g1) == 5);

    // Toda agua => 0.
    vector<vector<int>> g2 = {{0,0,0},{0,0,0}};
    assert(s.maxAreaOfIsland(g2) == 0);

    // Una sola celda de tierra => 1.
    vector<vector<int>> g3 = {{0,1,0}};
    assert(s.maxAreaOfIsland(g3) == 1);

    // Toda tierra => área = m*n.
    vector<vector<int>> g4 = {{1,1},{1,1}};
    assert(s.maxAreaOfIsland(g4) == 4);

    cout << "695 Max Area of Island: todas las pruebas pasaron.\n";
    return 0;
}
