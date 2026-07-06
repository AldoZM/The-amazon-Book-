// ============================================================================
// 1192. Critical Connections in a Network  (Hard)
// ----------------------------------------------------------------------------
// Hay n servidores numerados de 0 a n-1 conectados por "connections" (aristas
// NO dirigidas). El grafo es conexo (se puede llegar de cualquier servidor a
// cualquier otro). Una conexión es CRÍTICA (un "puente") si, al quitarla, el
// grafo se parte en dos o más componentes: es decir, esa arista es la ÚNICA
// forma de comunicar a los servidores de un lado con los del otro. Debemos
// devolver TODAS las conexiones críticas.
//
// Ejemplo, n = 4, connections = [[0,1],[1,2],[2,0],[1,3]]:
//
//        0
//       / \
//      1---2         3 cuelga de 1 con una sola arista.
//      |
//      3
//
// El triángulo 0-1-2 tiene tres caminos distintos entre cualquier par de sus
// nodos (quitar una arista del triángulo no lo desconecta), así que NINGUNA
// arista del triángulo es puente. Pero 1-3 es la ÚNICA forma de llegar a 3:
// si la quitamos, el servidor 3 queda aislado. Por eso [[1,3]] es la única
// conexión crítica.
//
// Técnica: PUENTES DE TARJAN, una variante del DFS clásico con dos arreglos
// nuevos en este libro:
//
//   disc[u] = el "número de orden" en que el DFS descubrió (visitó por
//             primera vez) al nodo u. Es simplemente un contador global que
//             aumenta cada vez que visitamos un nodo nuevo: el primer nodo
//             visitado tiene disc = 0, el segundo disc = 1, etc. Una vez
//             asignado, disc[u] YA NO CAMBIA.
//
//   low[u]  = el disc MÁS PEQUEÑO al que u puede "regresar" usando, como
//             máximo, UNA arista de retroceso (back-edge) hacia un ancestro
//             en el árbol de DFS. Es decir: partiendo de u, moviéndonos por
//             aristas del árbol hacia descendientes y (a lo más) una arista
//             que salte hacia arriba a un ancestro ya visitado, ¿qué tan
//             "arriba" en el orden de descubrimiento podemos llegar? Este
//             valor SÍ se va actualizando (sólo baja, nunca sube) conforme
//             el DFS regresa de sus hijos.
//
// Diagrama del árbol de DFS para el ejemplo (raíz = 0):
//
//              0  disc=0
//              |
//              1  disc=1
//             /|
//            2 3   disc=2      disc=3
//            |
//         (back-edge a 0)
//
//   Al procesar 2, encontramos una arista de retroceso hacia 0 (ya visitado,
//   y no es el padre de 2). Eso significa que 2 puede "regresar" hasta
//   disc=0 sin usar la arista 1-2 ni la 0-1: por eso low[2] = 0. Ese 0 se
//   propaga hacia arriba: low[1] = min(low[1], low[2]) = 0, y luego
//   low[0] = min(low[0], low[1]) = 0. Así, ni la arista 0-1 ni la 1-2 son
//   puente, porque el subárbol de abajo tiene una "cuerda" (back-edge) que
//   lo mantiene conectado al resto incluso sin esa arista del árbol.
//
//   En cambio, 3 no tiene ninguna arista de retroceso (su único vecino es su
//   padre, 1), así que low[3] se queda en su propio disc = 3. Ese 3 NO puede
//   "escapar" hacia arriba de disc[1] = 1.
//
// La condición clave: para una arista de árbol (u, v) donde v es hijo de u,
//
//              (u,v) es puente   <=>   low[v] > disc[u]
//
// ¿Por qué funciona? low[v] > disc[u] significa que, desde el subárbol de v
// (usando aristas del árbol hacia abajo y a lo más una arista de retroceso),
// es IMPOSIBLE alcanzar a u o a cualquier ancestro de u. La única forma en
// que v y su subárbol se comunican con el resto del grafo es a través de la
// arista (u, v). Quitarla los desconecta: es un puente. Si en cambio
// low[v] <= disc[u], existe una "cuerda" que rodea la arista (u, v) y la
// vuelve prescindible.
//
// Aplicando esto al ejemplo: low[3] = 3 > disc[1] = 1  => (1,3) es puente.
// low[2] = 0, disc[1] = 1 => 0 > 1 es falso => (1,2) NO es puente.
// low[1] = 0, disc[0] = 0 => 0 > 0 es falso => (0,1) NO es puente.
//
// Al final del DFS habremos revisado cada arista del árbol exactamente una
// vez con esta prueba, y habremos recolectado todos los puentes.
//
// Complejidad: tiempo O(V + E) (un DFS normal, cada nodo y arista se visitan
//              una vez), espacio O(V + E) para la lista de adyacencia más
//              O(V) de los arreglos disc/low y la pila de recursión.
// ============================================================================
#include <vector>
#include <cassert>
#include <algorithm>
#include <iostream>
using namespace std;

class Solution {
public:
    vector<vector<int>> criticalConnections(int n, vector<vector<int>>& connections) {
        vector<vector<int>> adj(n);
        for (auto& c : connections) {
            adj[c[0]].push_back(c[1]);
            adj[c[1]].push_back(c[0]);
        }

        disc.assign(n, -1);
        low.assign(n, -1);
        timer = 0;
        vector<vector<int>> puentes;

        // El grafo es conexo (garantía del enunciado), así que un solo DFS
        // desde el nodo 0 recorre todos los servidores.
        dfs(0, -1, adj, puentes);

        return puentes;
    }

private:
    vector<int> disc;   // disc[u]: momento de descubrimiento de u
    vector<int> low;    // low[u]: disc mínimo alcanzable desde el subárbol de u
    int timer;

    void dfs(int u, int padre, vector<vector<int>>& adj, vector<vector<int>>& puentes) {
        disc[u] = low[u] = timer++;

        for (int v : adj[u]) {
            if (v == padre) continue;   // no regresar por la misma arista al padre

            if (disc[v] == -1) {
                // v aún no visitado: es hijo de u en el árbol de DFS.
                dfs(v, u, adj, puentes);
                low[u] = min(low[u], low[v]);   // propagar hacia arriba
                if (low[v] > disc[u]) {
                    // Ninguna cuerda desde el subárbol de v llega hasta u
                    // (ni más arriba): la arista (u, v) es un puente.
                    puentes.push_back({min(u, v), max(u, v)});
                }
            } else {
                // v ya visitado y no es el padre: es una arista de retroceso
                // (back-edge) hacia un ancestro. Actualiza low[u] con el
                // disc de ese ancestro (no con su low, por eso se usa disc[v]).
                low[u] = min(low[u], disc[v]);
            }
        }
    }
};

int main() {
    Solution s;

    // Normaliza (ya vienen como [min,max] desde el algoritmo) y ordena el
    // vector de puentes para comparar sin depender del orden de recorrido.
    auto ordenar = [](vector<vector<int>> v) {
        sort(v.begin(), v.end());
        return v;
    };

    // Caso 1 (el del enunciado): triángulo 0-1-2 con una arista colgante 1-3.
    // El triángulo no tiene puentes; la única conexión crítica es 1-3.
    vector<vector<int>> c1 = {{0,1},{1,2},{2,0},{1,3}};
    vector<vector<int>> esperado1 = {{1,3}};
    assert(ordenar(s.criticalConnections(4, c1)) == esperado1);

    // Caso 2: camino lineal 0-1-2-3. Sin ciclos, así que TODAS las aristas
    // son puentes (quitar cualquiera desconecta el grafo en dos pedazos).
    vector<vector<int>> c2 = {{0,1},{1,2},{2,3}};
    vector<vector<int>> esperado2 = {{0,1},{1,2},{2,3}};
    assert(ordenar(s.criticalConnections(4, c2)) == esperado2);

    // Caso 3: dos triángulos (0-1-2 y 3-4-5) unidos por una sola arista
    // puente (2-3). Ningún lado del triángulo es puente, pero la conexión
    // que los une sí lo es.
    vector<vector<int>> c3 = {{0,1},{1,2},{2,0},{2,3},{3,4},{4,5},{5,3}};
    vector<vector<int>> esperado3 = {{2,3}};
    assert(ordenar(s.criticalConnections(6, c3)) == esperado3);

    // Caso 4: anillo (ciclo) de 4 nodos. Cada arista tiene una ruta
    // alternativa por el resto del anillo, así que no hay puentes.
    vector<vector<int>> c4 = {{0,1},{1,2},{2,3},{3,0}};
    assert(ordenar(s.criticalConnections(4, c4)).empty());

    cout << "1192 Critical Connections: todas las pruebas pasaron.\n";
    return 0;
}
