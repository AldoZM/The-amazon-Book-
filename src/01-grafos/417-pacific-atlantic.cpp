// ============================================================================
// 417. Pacific Atlantic Water Flow  (Medium)
// ----------------------------------------------------------------------------
// Dada una matriz de alturas `heights` de tamaño m x n, el océano Pacífico
// toca el borde superior y el borde izquierdo; el océano Atlántico toca el
// borde inferior y el borde derecho. El agua fluye de una celda a una vecina
// (arriba, abajo, izquierda, derecha) si la altura de la vecina es MENOR O
// IGUAL a la altura de la celda actual (el agua desciende o se mantiene).
// Debemos devolver las coordenadas de las celdas desde las que el agua puede
// llegar a AMBOS océanos.
//
// Ejemplo (el clásico de LeetCode):
//   heights =
//     1  2  2  3  5
//     3  2  3  4  4
//     2  4  5  3  1
//     6  7  1  4  5
//     5  1  1  2  4
//
//   Resultado: [[0,4],[1,3],[1,4],[2,2],[3,0],[3,1],[4,0]]
//
// Diagrama de la idea (BFS/DFS INVERSO desde cada océano):
//
//   Pacífico toca                      Atlántico toca
//   fila 0 y columna 0                 fila m-1 y columna n-1
//        ↓                                   ↓
//   +--------------+                   +--------------+
//   |P P P P P     |                   |            A A|
//   |P             |                   |              A|
//   |P             |   (subiendo de    |              A|
//   |P             |    altura hacia   |              A|
//   |P             |    adentro)       |A A A A A A A A|
//   +--------------+                   +--------------+
//
// Idea: hacer BFS/DFS desde cada celda por separado sería O((m*n)^2). En su
// lugar invertimos el problema: partimos de los bordes de cada océano y
// exploramos hacia adentro SUBIENDO de altura (el reverso de "fluir hacia
// abajo"). Una celda vecina es alcanzable en el grafo inverso si su altura es
// MAYOR O IGUAL a la de la celda actual (porque en el grafo original el agua
// fluiría de esa vecina hacia la celda actual). Así marcamos qué celdas
// alcanzan el Pacífico y cuáles alcanzan el Atlántico; la respuesta es la
// intersección de ambos conjuntos.
//
// Complejidad: tiempo O(m*n) (cada celda se visita a lo más una vez por
//              océano), espacio O(m*n) por las matrices de visitados y la
//              pila de recursión.
// ============================================================================
#include <vector>
#include <algorithm>
#include <cassert>
#include <iostream>
using namespace std;

class Solution {
public:
    vector<vector<int>> pacificAtlantic(vector<vector<int>>& heights) {
        vector<vector<int>> resultado;
        if (heights.empty() || heights[0].empty()) return resultado;
        int m = heights.size(), n = heights[0].size();

        vector<vector<bool>> pacifico(m, vector<bool>(n, false));
        vector<vector<bool>> atlantico(m, vector<bool>(n, false));

        // Bordes del Pacífico: fila 0 y columna 0.
        // Bordes del Atlántico: fila m-1 y columna n-1.
        for (int c = 0; c < n; ++c) {
            dfs(heights, pacifico, 0, c, m, n);
            dfs(heights, atlantico, m - 1, c, m, n);
        }
        for (int r = 0; r < m; ++r) {
            dfs(heights, pacifico, r, 0, m, n);
            dfs(heights, atlantico, r, n - 1, m, n);
        }

        for (int r = 0; r < m; ++r)
            for (int c = 0; c < n; ++c)
                if (pacifico[r][c] && atlantico[r][c])
                    resultado.push_back({r, c});

        return resultado;
    }

private:
    // DFS inverso: desde (r,c) avanza hacia una vecina sólo si su altura es
    // mayor o igual (en el grafo original el agua fluiría de esa vecina hacia
    // aquí, ya que fluye de mayor/igual altura hacia menor/igual altura).
    void dfs(vector<vector<int>>& heights, vector<vector<bool>>& visitado,
             int r, int c, int m, int n) {
        visitado[r][c] = true;
        int dr[] = {-1, 1, 0, 0};
        int dc[] = {0, 0, -1, 1};
        for (int d = 0; d < 4; ++d) {
            int nr = r + dr[d], nc = c + dc[d];
            if (nr < 0 || nr >= m || nc < 0 || nc >= n) continue;
            if (visitado[nr][nc]) continue;
            if (heights[nr][nc] < heights[r][c]) continue;  // agua no podría subir
            dfs(heights, visitado, nr, nc, m, n);
        }
    }
};

// Compara dos listas de coordenadas sin importar el orden.
bool mismasCeldas(vector<vector<int>> a, vector<vector<int>> b) {
    sort(a.begin(), a.end());
    sort(b.begin(), b.end());
    return a == b;
}

int main() {
    Solution s;

    // Caso clásico de LeetCode.
    vector<vector<int>> h1 = {
        {1, 2, 2, 3, 5},
        {3, 2, 3, 4, 4},
        {2, 4, 5, 3, 1},
        {6, 7, 1, 4, 5},
        {5, 1, 1, 2, 4},
    };
    vector<vector<int>> esperado1 = {
        {0, 4}, {1, 3}, {1, 4}, {2, 2}, {3, 0}, {3, 1}, {4, 0}
    };
    assert(mismasCeldas(s.pacificAtlantic(h1), esperado1));

    // Caso borde: matriz 1x1. La única celda toca los cuatro bordes a la
    // vez, así que siempre alcanza ambos océanos sin importar su altura.
    vector<vector<int>> h2 = {{5}};
    vector<vector<int>> esperado2 = {{0, 0}};
    assert(mismasCeldas(s.pacificAtlantic(h2), esperado2));

    // Caso borde: una sola fila. Como m=1, esa fila es a la vez la fila
    // superior (Pacífico) y la inferior (Atlántico): todas las celdas
    // alcanzan ambos océanos de inmediato, sin importar la altura.
    vector<vector<int>> h3 = {{1, 2, 3}};
    vector<vector<int>> esperado3 = {{0, 0}, {0, 1}, {0, 2}};
    assert(mismasCeldas(s.pacificAtlantic(h3), esperado3));

    // Caso borde: una sola columna. Como n=1, esa columna es a la vez la
    // columna izquierda (Pacífico) y la derecha (Atlántico): todas las
    // celdas alcanzan ambos océanos de inmediato.
    vector<vector<int>> h4 = {{1}, {2}, {3}};
    vector<vector<int>> esperado4 = {{0, 0}, {1, 0}, {2, 0}};
    assert(mismasCeldas(s.pacificAtlantic(h4), esperado4));

    // Meseta plana: toda la matriz tiene la misma altura, así que el agua
    // fluye libremente entre vecinas y todas las celdas llegan a ambos
    // océanos.
    vector<vector<int>> h5 = {
        {3, 3, 3},
        {3, 3, 3},
        {3, 3, 3},
    };
    vector<vector<int>> esperado5 = {
        {0, 0}, {0, 1}, {0, 2},
        {1, 0}, {1, 1}, {1, 2},
        {2, 0}, {2, 1}, {2, 2},
    };
    assert(mismasCeldas(s.pacificAtlantic(h5), esperado5));

    cout << "417 Pacific Atlantic: todas las pruebas pasaron.\n";
    return 0;
}
