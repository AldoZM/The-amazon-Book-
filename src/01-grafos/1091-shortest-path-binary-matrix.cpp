// ============================================================================
// 1091. Shortest Path in Binary Matrix  (Medium)
// ----------------------------------------------------------------------------
// Cuadrícula n x n de 0 y 1. Un "camino claro" va de la esquina superior
// izquierda (0,0) a la inferior derecha (n-1,n-1) pisando solo celdas con 0,
// moviéndose en las 8 direcciones (incluye diagonales). La longitud del
// camino es el NÚMERO DE CELDAS visitadas. Devuelve la longitud del camino
// más corto, o -1 si no existe.
//
// Ejemplo:
//   grid =                    Camino más corto: (0,0)->(1,1)->(2,2)
//     0 0 0                    longitud 4 ... espera, n=3 aquí da 4 celdas
//     1 1 0                    si vamos 0,0 -> 0,1 -> 1,2 -> 2,2 (por bordes).
//     1 1 0
//
// Diagrama de las 8 vecinas (movimiento tipo rey de ajedrez):
//
//   (r-1,c-1) (r-1,c) (r-1,c+1)
//   (r  ,c-1)  (r,c)  (r  ,c+1)     BFS: la primera vez que alcanzamos
//   (r+1,c-1) (r+1,c) (r+1,c+1)     (n-1,n-1) es por el camino más corto.
//
// Idea: BFS clásico de camino más corto en grafo no ponderado. Cada celda 0
// es un nodo; hay arista entre celdas 0 adyacentes en las 8 direcciones. BFS
// desde (0,0) garantiza que la primera vez que tocamos el destino la distancia
// (en celdas) es mínima. Marcamos visitadas mutando la celda a 1.
//
// Complejidad: tiempo O(n^2) (cada celda entra a la cola una vez),
//              espacio O(n^2) por la cola.
// ============================================================================
#include <vector>
#include <queue>
#include <cassert>
#include <iostream>
using namespace std;

class Solution {
public:
    int shortestPathBinaryMatrix(vector<vector<int>>& grid) {
        int n = grid.size();
        if (grid[0][0] != 0 || grid[n-1][n-1] != 0) return -1;  // extremo bloqueado

        queue<pair<int,int>> cola;
        cola.push({0, 0});
        grid[0][0] = 1;   // marcar visitada
        int longitud = 1; // (0,0) ya cuenta como 1 celda

        int dr[] = {-1,-1,-1, 0, 0, 1, 1, 1};
        int dc[] = {-1, 0, 1,-1, 1,-1, 0, 1};
        while (!cola.empty()) {
            int capa = cola.size();      // celdas a distancia actual
            for (int i = 0; i < capa; ++i) {
                auto [r, c] = cola.front(); cola.pop();
                if (r == n-1 && c == n-1) return longitud;  // llegamos
                for (int d = 0; d < 8; ++d) {
                    int nr = r + dr[d], nc = c + dc[d];
                    if (nr < 0 || nr >= n || nc < 0 || nc >= n) continue;
                    if (grid[nr][nc] != 0) continue;   // muro o ya visitada
                    grid[nr][nc] = 1;                  // marcar visitada
                    cola.push({nr, nc});
                }
            }
            ++longitud;   // avanzamos una capa (una celda más de camino)
        }
        return -1;   // nunca alcanzamos el destino
    }
};

int main() {
    Solution s;

    vector<vector<int>> g1 = {{0,1},{1,0}};
    assert(s.shortestPathBinaryMatrix(g1) == 2);

    vector<vector<int>> g2 = {{0,0,0},{1,1,0},{1,1,0}};
    assert(s.shortestPathBinaryMatrix(g2) == 4);

    // Origen bloqueado => -1.
    vector<vector<int>> g3 = {{1,0},{0,0}};
    assert(s.shortestPathBinaryMatrix(g3) == -1);

    // Una sola celda libre => longitud 1.
    vector<vector<int>> g4 = {{0}};
    assert(s.shortestPathBinaryMatrix(g4) == 1);

    // Destino inalcanzable => -1.
    vector<vector<int>> g5 = {{0,1,0},{1,1,0},{0,0,0}};
    assert(s.shortestPathBinaryMatrix(g5) == -1);

    cout << "1091 Shortest Path in Binary Matrix: todas las pruebas pasaron.\n";
    return 0;
}
