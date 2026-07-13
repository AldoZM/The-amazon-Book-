// ============================================================================
// 2402. Meeting Rooms III  (Hard)
// ----------------------------------------------------------------------------
// Hay n salas numeradas de 0 a n-1. Nos dan meetings[i] = [inicio, fin], y
// se procesan en orden de inicio. Para cada reunión: se asigna a la sala
// LIBRE de menor índice disponible en ese momento. Si ninguna está libre,
// la reunión se RETRASA hasta que la sala que se desocupe primero quede
// disponible, conservando la MISMA duración (fin - inicio original), y se
// asigna a esa sala (la de menor índice si hay empate en el momento en que
// se desocupan). Devuelve la sala que organizó más reuniones (la de menor
// índice en caso de empate).
//
// Ejemplo: n = 2, meetings = [[0,10],[1,5],[2,7],[3,4]]
//
//   sala 0: [0,10]---------------------------------[10,11]
//   sala 1:      [1,5]---   [5,10](retrasada de [2,7], dura 5)  [10,?]
//
//   [0,10] -> sala 0 libre, se asigna. [1,5] -> sala 1 libre, se asigna.
//   [2,7] -> ninguna sala libre a tiempo 2; la que se libera primero es la
//     sala 1 en el tiempo 5. Se retrasa: dura 7-2=5, así que ocupa la sala
//     1 de 5 a 10. [3,4] -> ninguna libre a tiempo 3 (sala 0 libera en 10,
//     sala 1 libera en 10, empate -> gana la de menor índice, sala 0);
//     dura 4-3=1, ocupa la sala 0 de 10 a 11.
//   Conteo: sala 0 organizó 2 reuniones, sala 1 organizó 2. Empate -> gana
//   la de menor índice: respuesta 0.
//
// Diagrama del algoritmo (dos min-heaps):
//
//   ordenar meetings por inicio
//   libres  = min-heap de índices de sala, todas al inicio (0..n-1)
//   ocupadas = min-heap de (horaDeFin, índiceSala), vacío al inicio
//   para cada (inicio, fin) en meetings (ya ordenados):
//     mientras ocupadas no esté vacío y ocupadas.top().horaFin <= inicio:
//       // esa sala ya terminó su reunión a tiempo: queda libre
//       libres.push(ocupadas.pop().índiceSala)
//     si libres no está vacío:
//       sala = libres.pop()               // la de menor índice
//       ocupadas.push((fin, sala))
//     si no:
//       (horaLibre, sala) = ocupadas.pop() // la que se libera MÁS PRONTO
//       duración = fin - inicio
//       ocupadas.push((horaLibre + duración, sala))  // se retrasa, misma duración
//     conteo[sala] += 1
//   devolver el índice de sala con mayor conteo (menor índice en empate)
//
// Por qué funciona: procesar las reuniones en orden de inicio garantiza que
// cuando le toca el turno a una reunión, ya sabemos qué salas se han
// liberado hasta ese instante. El min-heap de salas libres nos da siempre
// la de menor índice (regla de desempate del enunciado). El min-heap de
// salas ocupadas, ordenado por hora de fin, nos dice cuál sala se
// desocupará primero cuando NINGUNA esté libre; a esa se le asigna la
// reunión retrasada, conservando su duración original.
//
// Complejidad: tiempo O(n log n) por el ordenamiento inicial más O(n log k)
// por las operaciones de heap (donde k <= n es el número de salas), espacio
// O(n) para los heaps y el conteo.
// ============================================================================
#include <vector>
#include <queue>
#include <algorithm>
#include <cassert>
#include <iostream>
using namespace std;

class Solution {
public:
    int mostBooked(int n, vector<vector<int>>& meetings) {
        sort(meetings.begin(), meetings.end());

        priority_queue<int, vector<int>, greater<int>> libres;
        for (int i = 0; i < n; ++i) libres.push(i);

        // (horaDeFin, índiceSala), min-heap: primero la que termina antes,
        // en empate la de menor índice (orden natural de pair).
        priority_queue<pair<long long,int>, vector<pair<long long,int>>, greater<>> ocupadas;

        vector<int> conteo(n, 0);

        for (auto& m : meetings) {
            long long inicio = m[0], fin = m[1];

            while (!ocupadas.empty() && ocupadas.top().first <= inicio) {
                libres.push(ocupadas.top().second);
                ocupadas.pop();
            }

            if (!libres.empty()) {
                int sala = libres.top();
                libres.pop();
                ocupadas.push({fin, sala});
                conteo[sala]++;
            } else {
                auto [horaLibre, sala] = ocupadas.top();
                ocupadas.pop();
                long long duracion = fin - inicio;
                ocupadas.push({horaLibre + duracion, sala});
                conteo[sala]++;
            }
        }

        int mejor = 0;
        for (int i = 1; i < n; ++i) {
            if (conteo[i] > conteo[mejor]) mejor = i;
        }
        return mejor;
    }
};

int main() {
    Solution s;

    // Caso normal (ejemplo oficial de LeetCode): empate 2-2, gana sala 0.
    vector<vector<int>> m1 = {{0,10},{1,5},{2,7},{3,4}};
    assert(s.mostBooked(2, m1) == 0);

    // Otro ejemplo oficial, con 3 salas: sala 1 organiza más reuniones.
    vector<vector<int>> m2 = {{1,20},{2,10},{3,5},{4,9},{6,8}};
    assert(s.mostBooked(3, m2) == 1);

    // Caso límite: una sola sala. Todas las reuniones, se solapen o no,
    // terminan cayendo en la sala 0 (retrasadas si hace falta).
    vector<vector<int>> m3 = {{0,5},{5,10}};
    assert(s.mostBooked(1, m3) == 0);

    // Caso donde el orden de procesamiento importa: las mismas reuniones
    // del primer caso pero revueltas en el arreglo de entrada. Como el
    // algoritmo ordena por inicio antes de procesar, el resultado debe ser
    // idéntico al caso normal (sala 0).
    vector<vector<int>> m4 = {{2,7},{0,10},{3,4},{1,5}};
    assert(s.mostBooked(2, m4) == 0);

    cout << "2402. Meeting Rooms III: todas las pruebas pasaron.\n";
    return 0;
}
