// ============================================================================
// 787. Cheapest Flights Within K Stops  (Medium)
// ----------------------------------------------------------------------------
// Hay n ciudades numeradas de 0 a n-1. Nos dan flights[i] = [from, to, price]:
// un vuelo DIRIGIDO de "from" a "to" que cuesta "price" (arista dirigida y
// ponderada, sin pesos negativos). Dado src, dst y k, devuelve el precio más
// barato de src a dst usando A LO MÁS k escalas (paradas intermedias), o -1
// si no existe tal ruta. Nota: "k escalas" significa hasta k nodos
// intermedios, es decir, hasta k+1 vuelos (aristas) en el camino.
//
// Ejemplo: n = 4, flights = [[0,1,100],[1,2,100],[2,0,100],[1,3,600],[2,3,200]]
// src = 0, dst = 3, k = 1
//
//        100        100        200
//    0 -------> 1 -------> 2 -------> 3
//               |                     ^
//               |__________600________|
//
//   Ruta 0->1->2->3 cuesta 100+100+200=400, pero usa 2 escalas (1 y 2):
//   con k=1 NO está permitida.
//   Ruta 0->1->3 cuesta 100+600=700 y usa solo 1 escala (nodo 1): sí cabe
//   en el límite k=1, y es la única opción => respuesta 700.
//
// Diagrama de Bellman-Ford limitado a k+1 rondas de relajación:
//
//   dist[src] = 0, resto = infinito
//   repetir (k+1) veces:                 <- cada ronda añade UNA arista más
//     nuevaDist = copia de dist          <- clave: ver más abajo
//     para cada arista (u -> v, precio w):
//       si dist[u] (de la ronda ANTERIOR) + w < nuevaDist[v]:
//         nuevaDist[v] = dist[u] + w
//     dist = nuevaDist
//   responder dist[dst], o -1 si sigue en infinito
//
// Idea (patrón NUEVO: Bellman-Ford): Dijkstra procesa nodos por distancia
// mínima y no ofrece control directo sobre CUÁNTAS aristas usa un camino;
// aquí necesitamos justo eso: acotar el número de escalas. Bellman-Ford
// relaja TODAS las aristas del grafo, una ronda tras otra; se puede probar
// que después de "r" rondas, dist[v] es el costo mínimo para llegar a v
// usando A LO MÁS r aristas. Como k escalas equivalen a k+1 aristas, basta
// con hacer k+1 rondas de relajación.
//
// El detalle crítico es la COPIA: en cada ronda construimos nuevaDist a
// partir de una fotografía fija de la ronda anterior (dist), y solo al
// terminar de recorrer todas las aristas reemplazamos dist por nuevaDist.
// Si en vez de eso actualizáramos dist "en el lugar" (como en Dijkstra),
// una sola ronda podría encadenar varias relajaciones seguidas -por
// ejemplo, relajar 0->1 y en la MISMA ronda usar ese nuevo dist[1] para
// relajar 1->2- colando de contrabando dos aristas (dos escalas) en una
// sola ronda. Eso rompería el límite de k escalas y podría dar una
// respuesta más barata pero inválida. Al usar una copia, cada ronda solo
// puede sumar exactamente una arista por camino, sin importar el orden en
// que iteremos las aristas.
//
// Complejidad: tiempo O(k*E) (k+1 rondas, cada una recorre las E aristas),
//              espacio O(n) para los arreglos de distancia.
// ============================================================================
#include <vector>
#include <cassert>
#include <iostream>
using namespace std;

class Solution {
public:
    int findCheapestPrice(int n, vector<vector<int>>& flights, int src, int dst, int k) {
        const int INF = 1e9;
        vector<int> dist(n, INF);
        dist[src] = 0;

        // k+1 rondas: cubrimos caminos de hasta k escalas (k+1 aristas).
        for (int ronda = 0; ronda <= k; ++ronda) {
            vector<int> nuevaDist = dist;   // copia: fotografía de la ronda anterior
            for (auto& f : flights) {
                int u = f[0], v = f[1], precio = f[2];
                if (dist[u] == INF) continue;   // u todavía inalcanzable en esta ronda
                if (dist[u] + precio < nuevaDist[v]) {
                    nuevaDist[v] = dist[u] + precio;
                }
            }
            dist = nuevaDist;
        }

        return dist[dst] == INF ? -1 : dist[dst];
    }
};

int main() {
    Solution s;

    // Caso clásico: con k=1 el camino directo 0->1->3 (600+100=700) gana
    // porque 0->1->2->3 usa 2 escalas y no está permitido.
    vector<vector<int>> f1 = {{0,1,100},{1,2,100},{2,0,100},{1,3,600},{2,3,200}};
    assert(s.findCheapestPrice(4, f1, 0, 3, 1) == 700);

    // Con k=0 (sin escalas) y sin vuelo directo 0->3, es imposible.
    assert(s.findCheapestPrice(4, f1, 0, 3, 0) == -1);

    // Con más escalas permitidas (k=4, sobran rondas) sí se puede aprovechar
    // la ruta de 2 escalas 0->1->2->3, más barata (100+100+200=400).
    assert(s.findCheapestPrice(4, f1, 0, 3, 4) == 400);

    // Ejemplo clásico de LeetCode: hay una ruta directa cara y una ruta con
    // una escala más barata.
    vector<vector<int>> f2 = {{0,1,100},{1,2,100},{0,2,500}};
    assert(s.findCheapestPrice(3, f2, 0, 2, 1) == 200);   // 0->1->2 = 200
    assert(s.findCheapestPrice(3, f2, 0, 2, 0) == 500);   // solo directo: 500

    // Destino totalmente inalcanzable, sin importar cuántas escalas demos.
    vector<vector<int>> f3 = {{0,1,100}};
    assert(s.findCheapestPrice(3, f3, 0, 2, 1) == -1);

    // src == dst: el costo es 0 sin necesidad de volar.
    assert(s.findCheapestPrice(3, f3, 0, 0, 1) == 0);

    cout << "787 Cheapest Flights: todas las pruebas pasaron.\n";
    return 0;
}
