// ============================================================================
// 261. Graph Valid Tree  (Medium)
// ----------------------------------------------------------------------------
// Dados n nodos etiquetados de 0 a n-1 y una lista de aristas no dirigidas,
// determina si forman un árbol válido.
//
// Un grafo no dirigido con n nodos es un árbol si y sólo si cumple DOS
// condiciones a la vez:
//   1) Está completamente conectado (un solo componente).
//   2) No tiene ciclos.
//
// Un dato clave: un árbol con n nodos tiene EXACTAMENTE n-1 aristas. Si hay
// menos de n-1 aristas, es imposible estar conectado (false de inmediato).
// Si hay más de n-1, forzosamente hay un ciclo (false de inmediato). Con
// exactamente n-1 aristas, basta revisar que no exista ciclo para garantizar
// que el grafo es un único componente conectado (n-1 aristas sin ciclos ya
// implica conectividad total).
//
// Ejemplo (árbol válido), n = 5:
//
//        0
//      / | \
//     1  2  3
//     |
//     4
//   aristas: [[0,1],[0,2],[0,3],[1,4]]  ->  4 aristas = n-1  ->  true
//
// Ejemplo (con ciclo), n = 5:
//     0 - 1 - 2 - 0   (ciclo)      3 - 4 (componente aparte)
//   aristas: [[0,1],[1,2],[2,0],[3,4]]  ->  false
//
// Técnica: Union-Find (Disjoint Set Union, DSU) con unión por rango y
// compresión de caminos. Es un patrón NUEVO en este libro, así que se explica
// a detalle:
//
//   - Cada nodo empieza siendo su propio representante (su propio conjunto).
//   - find(x): sigue los punteros "padre" hasta la raíz del conjunto de x.
//     Con COMPRESIÓN DE CAMINOS, cada nodo visitado en el camino se re-liga
//     directamente a la raíz, para que futuras consultas sean casi O(1).
//   - unite(x, y): busca las raíces de x y y.
//       * Si ya son la MISMA raíz, x y y ya estaban conectados por otro
//         camino => añadir esta arista formaría un CICLO => false.
//       * Si son distintas, se fusionan los conjuntos. Con UNIÓN POR RANGO
//         (o por tamaño), la raíz del árbol más pequeño/bajo cuelga de la
//         raíz del árbol más grande, para mantener los árboles del DSU
//         planos y las operaciones rápidas.
//
// Recorremos todas las aristas llamando a unite(). Si alguna unite() detecta
// que ambos extremos ya comparten raíz, hay un ciclo -> false. Si procesamos
// todas las aristas sin ciclos Y el número de aristas es exactamente n-1,
// el grafo es un árbol válido.
//
// Complejidad: tiempo casi O(n + e * alfa(n)) (alfa = inversa de Ackermann,
//              prácticamente constante gracias a rango + compresión),
//              espacio O(n) para los arreglos padre/rango.
// ============================================================================
#include <vector>
#include <cassert>
#include <iostream>
using namespace std;

class Solution {
public:
    bool validTree(int n, vector<vector<int>>& edges) {
        // Un árbol con n nodos tiene exactamente n-1 aristas.
        if ((int)edges.size() != n - 1) return false;

        padre.resize(n);
        rango.assign(n, 0);
        for (int i = 0; i < n; ++i) padre[i] = i;   // cada nodo es su propia raíz

        for (auto& e : edges) {
            int a = e[0], b = e[1];
            if (!unite(a, b)) return false;   // ya estaban conectados => ciclo
        }
        return true;   // n-1 aristas y sin ciclos => un solo árbol conectado
    }

private:
    vector<int> padre;
    vector<int> rango;

    // Encuentra la raíz del conjunto de x, comprimiendo el camino recorrido.
    int find(int x) {
        if (padre[x] != x) padre[x] = find(padre[x]);   // compresión de caminos
        return padre[x];
    }

    // Une los conjuntos de a y b. Devuelve false si ya estaban en el mismo
    // conjunto (es decir, unir esta arista formaría un ciclo).
    bool unite(int a, int b) {
        int ra = find(a), rb = find(b);
        if (ra == rb) return false;   // mismo conjunto => ciclo

        // Unión por rango: la raíz de menor rango cuelga de la de mayor rango.
        if (rango[ra] < rango[rb]) swap(ra, rb);
        padre[rb] = ra;
        if (rango[ra] == rango[rb]) ++rango[ra];
        return true;
    }
};

int main() {
    Solution s;

    // Árbol válido: 5 nodos, 4 aristas (n-1), todo conectado, sin ciclos.
    vector<vector<int>> e1 = {{0,1},{0,2},{0,3},{1,4}};
    assert(s.validTree(5, e1) == true);

    // Con ciclo: 0-1-2-0 forma un ciclo; además 3-4 queda desconectado del
    // resto. La detección de ciclo en unite() basta para regresar false.
    vector<vector<int>> e2 = {{0,1},{1,2},{2,0},{3,4}};
    assert(s.validTree(5, e2) == false);

    // Desconectado: dos componentes separados {0,1} y {2,3}; sólo 2 aristas
    // pero se necesitan 3 (n-1 con n=4) para siquiera intentar ser árbol.
    vector<vector<int>> e3 = {{0,1},{2,3}};
    assert(s.validTree(4, e3) == false);

    // Un solo nodo sin aristas: componente trivial, es un árbol válido.
    vector<vector<int>> e4 = {};
    assert(s.validTree(1, e4) == true);

    cout << "261 Graph Valid Tree: todas las pruebas pasaron.\n";
    return 0;
}
