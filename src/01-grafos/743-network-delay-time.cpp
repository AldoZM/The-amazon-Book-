// ============================================================================
// 743. Network Delay Time  (Medium)
// ----------------------------------------------------------------------------
// Hay n nodos numerados de 1 a n. Nos dan times[i] = [u, v, w]: una señal que
// sale de u tarda w unidades de tiempo en llegar a v (arista DIRIGIDA y
// PONDERADA). Enviamos una señal desde el nodo k. Devuelve el tiempo mínimo
// que tarda en que la señal llegue a TODOS los n nodos, o -1 si algún nodo
// nunca la recibe.
//
// Ejemplo: times = [[2,1,1],[2,3,1],[3,4,1]], n = 4, k = 2
//
//        2 --1--> 1
//        |
//        1
//        v
//        3 --1--> 4
//
//   Desde 2: a 1 le llega en 1, a 3 en 1, a 4 (via 3) en 1+1 = 2.
//   El nodo que tarda más es 4, con tiempo 2 => respuesta 2.
//
// Diagrama de Dijkstra (cola de prioridad, min-heap por distancia):
//
//   dist[k] = 0, resto = infinito
//   heap: (0, k)
//   mientras el heap no esté vacío:
//     sacar (d, u) con menor d
//     si d > dist[u] ya conocido, es una entrada obsoleta: ignorar
//     para cada arista (u -> v, peso w):
//       si dist[u] + w < dist[v]:   // relajación de la arista
//         dist[v] = dist[u] + w
//         heap.push((dist[v], v))
//
// Idea: es un BFS "por distancia" en vez de por número de aristas. Como los
// pesos no son todos iguales, no basta con procesar por capas (como en BFS
// normal): hay que procesar siempre el nodo con la MENOR distancia acumulada
// todavía no confirmada, y para eso sirve el min-heap. Esto es Dijkstra:
// mientras las aristas sean todas de peso >= 0, la primera vez que sacamos
// un nodo del heap su distancia ya es la mínima posible (no puede mejorar
// después, porque cualquier otro camino que pase por un nodo con distancia
// mayor solo puede sumar más peso, nunca restar). Si hubiera pesos negativos
// esta garantía se rompe y haría falta Bellman-Ford.
// El heap puede tener entradas duplicadas u obsoletas para un mismo nodo
// (llegamos a él por varios caminos); las descartamos comparando contra la
// distancia ya confirmada en dist[].
//
// Al final, si algún nodo se quedó en infinito, es inalcanzable => -1.
// Si no, la respuesta es la mayor de las distancias mínimas (el último nodo
// en enterarse es el que determina cuánto tarda la red completa).
//
// Complejidad: tiempo O(E log V), espacio O(V + E).
// ============================================================================
#include <vector>
#include <queue>
#include <climits>
#include <cassert>
#include <iostream>
using namespace std;

class Solution {
public:
    int networkDelayTime(vector<vector<int>>& times, int n, int k) {
        // Lista de adyacencia: adj[u] = {(v, peso), ...}
        vector<vector<pair<int,int>>> adj(n + 1);
        for (auto& t : times) {
            int u = t[0], v = t[1], w = t[2];
            adj[u].push_back({v, w});
        }

        vector<int> dist(n + 1, INT_MAX);
        dist[k] = 0;

        // Min-heap por distancia: pair<distancia, nodo>.
        priority_queue<pair<int,int>, vector<pair<int,int>>, greater<>> heap;
        heap.push({0, k});

        while (!heap.empty()) {
            auto [d, u] = heap.top();
            heap.pop();
            if (d > dist[u]) continue;   // entrada obsoleta, ya mejoramos u

            for (auto& [v, w] : adj[u]) {
                if (dist[u] + w < dist[v]) {   // relajación de la arista
                    dist[v] = dist[u] + w;
                    heap.push({dist[v], v});
                }
            }
        }

        int maxDist = 0;
        for (int nodo = 1; nodo <= n; ++nodo) {
            if (dist[nodo] == INT_MAX) return -1;   // nodo inalcanzable
            maxDist = max(maxDist, dist[nodo]);
        }
        return maxDist;
    }
};

int main() {
    Solution s;

    // Caso normal: la señal llega a todos, el nodo 4 es el más lento (t=2).
    vector<vector<int>> t1 = {{2,1,1},{2,3,1},{3,4,1}};
    assert(s.networkDelayTime(t1, 4, 2) == 2);

    // Nodo 2 es inalcanzable desde 1 (solo hay arista 1 -> 2, no llega a 2
    // el resto de nodos aunque exista arco 1->2... aquí forzamos un nodo sin
    // ningún arco de entrada).
    vector<vector<int>> t2 = {{1,2,1}};
    assert(s.networkDelayTime(t2, 3, 1) == -1);   // nodo 3 nunca recibe la señal

    // Un solo nodo: la señal ya está en k, tarda 0.
    vector<vector<int>> t3 = {};
    assert(s.networkDelayTime(t3, 1, 1) == 0);

    // Camino donde el orden de procesamiento del heap importa: hay una ruta
    // directa cara y una ruta indirecta barata.
    vector<vector<int>> t4 = {{1,2,5},{1,3,1},{3,2,1}};
    // Desde 1: directo a 2 cuesta 5, pero via 3 cuesta 1+1=2 (mejor).
    assert(s.networkDelayTime(t4, 3, 1) == 2);

    cout << "743 Network Delay Time: todas las pruebas pasaron.\n";
    return 0;
}
