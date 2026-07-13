// ============================================================================
// 621. Task Scheduler  (Medium)
// ----------------------------------------------------------------------------
// Nos dan un arreglo de tareas (cada una representada por una letra 'A'-'Z')
// y un entero n: el número mínimo de unidades de tiempo que deben pasar entre
// dos ejecuciones de la MISMA tarea (el "enfriamiento" o cooldown). En cada
// unidad de tiempo se puede ejecutar una tarea o quedarse inactivo (idle).
// Hay que devolver el número mínimo de unidades de tiempo necesarias para
// ejecutar todas las tareas respetando el enfriamiento.
//
// Ejemplo: tasks = ['A','A','A','B','B','B'], n = 2
//   Un horario válido: A, B, idle, A, B, idle, A, B  -> 8 unidades.
//   (A necesita 2 huecos libres después de cada ejecución antes de repetirse,
//    igual B; como ambas se repiten 3 veces, se van alternando con un hueco.)
//
// Diagrama del algoritmo (max-heap de conteos + cola de enfriamiento):
//
//   freq = mapa tarea -> cuántas veces aparece
//   heap = max-heap con los conteos de freq (solo el número, no la letra)
//   cooldown = cola FIFO de pares (conteo_restante, tiempo_en_que_puede_volver)
//   tiempo = 0
//   mientras heap no esté vacío O cooldown no esté vacía:
//     tiempo += 1
//     si el frente de cooldown ya puede volver (su tiempo_en_que_puede_volver
//        == tiempo actual): devolverlo al heap
//     si heap no está vacío:
//       sacar el conteo más alto, restarle 1
//       si todavía queda conteo > 0: mandarlo a cooldown con
//         tiempo_en_que_puede_volver = tiempo + n + 1
//     // si heap está vacío pero cooldown no, esa unidad de tiempo fue idle
//   devolver tiempo
//
// Idea: como no importa CUÁL tarea se ejecuta en cada momento, solo cuántas
// veces falta ejecutar cada una, basta trabajar con los conteos de
// frecuencia. En cada unidad de tiempo conviene ejecutar la tarea con MAYOR
// conteo restante (así se "gasta" primero la tarea que más va a estorbar
// más adelante, dejándola lista para volver a entrar en cooldown cuanto
// antes), de ahí el max-heap. Una tarea que se acaba de ejecutar no puede
// volver a estar disponible hasta n+1 unidades después (n de enfriamiento más
// la propia unidad en que se ejecutó), así que se guarda aparte en una cola
// de enfriamiento hasta que le toque regresar al heap.
//
// Por qué funciona: en cada instante elegimos siempre la mejor tarea posible
// entre las disponibles (greedy). Si en algún momento no hay ninguna tarea
// disponible pero aún faltan tareas por ejecutar, esa unidad de tiempo se
// pierde en idle; eso es exactamente lo que refleja el algoritmo, porque
// avanzamos el reloj igual aunque el heap esté vacío mientras cooldown no lo
// esté.
//
// Complejidad: tiempo O(T log 26) = O(T), donde T es el número total de
// tareas (el heap nunca tiene más de 26 elementos distintos, uno por letra).
// Espacio O(26) = O(1).
// ============================================================================
#include <vector>
#include <queue>
#include <unordered_map>
#include <cassert>
#include <iostream>
using namespace std;

class Solution {
public:
    int leastInterval(vector<char>& tasks, int n) {
        unordered_map<char, int> freq;
        for (char t : tasks) freq[t]++;

        priority_queue<int> heap;   // max-heap de conteos
        for (auto& [letra, f] : freq) heap.push(f);

        // cooldown: pares (conteo_restante, tiempo_en_que_puede_volver)
        queue<pair<int,int>> cooldown;

        int tiempo = 0;
        while (!heap.empty() || !cooldown.empty()) {
            tiempo++;

            if (!cooldown.empty() && cooldown.front().second == tiempo) {
                heap.push(cooldown.front().first);
                cooldown.pop();
            }

            if (!heap.empty()) {
                int cuenta = heap.top();
                heap.pop();
                cuenta--;
                if (cuenta > 0) {
                    cooldown.push({cuenta, tiempo + n + 1});
                }
            }
            // si el heap estaba vacío aquí, esta unidad de tiempo fue idle
        }

        return tiempo;
    }
};

int main() {
    Solution s;

    // Caso normal del enunciado.
    vector<char> t1 = {'A','A','A','B','B','B'};
    assert(s.leastInterval(t1, 2) == 8);

    // Sin enfriamiento (n = 0): se ejecutan una tras otra sin huecos.
    vector<char> t2 = {'A','A','A','B','B','B'};
    assert(s.leastInterval(t2, 0) == 6);

    // Una sola tarea repetida: obliga a meter huecos de enfriamiento.
    vector<char> t3 = {'A','A','A','A'};
    // Horario: A _ _ A _ _ A _ _ A  (n=2, entre cada A deben pasar 2 huecos)
    assert(s.leastInterval(t3, 2) == 10);

    // Caso límite: una sola tarea, una sola vez.
    vector<char> t4 = {'A'};
    assert(s.leastInterval(t4, 5) == 1);

    // Muchas tareas distintas y n grande: como no hay repeticiones que
    // choquen, el enfriamiento nunca obliga a meter huecos idle.
    vector<char> t5 = {'A','B','C','D'};
    assert(s.leastInterval(t5, 10) == 4);

    cout << "621. Task Scheduler: todas las pruebas pasaron.\n";
    return 0;
}
