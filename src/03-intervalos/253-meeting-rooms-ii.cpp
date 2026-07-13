// ============================================================================
// 253. Meeting Rooms II  (Medium)
// ----------------------------------------------------------------------------
// Nos dan un arreglo de intervalos de reunión intervals[i] = [inicio, fin].
// Queremos el número MÍNIMO de salas necesarias para que todas las
// reuniones se puedan llevar a cabo, sabiendo que dos reuniones que se
// traslapan en el tiempo no pueden compartir sala.
//
// Ejemplo: intervals = [[0,30],[5,10],[15,20]]
//
//   0 -----------------------------30      (sala A)
//        5----10                            (sala B, cabe dentro de [0,30])
//                    15----20                (puede reusar la sala B, ya libre)
//
//   [5,10] y [15,20] no se traslapan entre sí, así que pueden compartir una
//   segunda sala; pero ambas se traslapan con [0,30], que necesita su
//   propia sala. Total: 2 salas.
//
// Diagrama del algoritmo (barrido / sweep line con dos punteros):
//
//   starts = [inicio de cada reunión], ordenado
//   ends   = [fin de cada reunión],    ordenado
//   salasEnUso = 0, maxSalas = 0
//   si = 0 (puntero en starts), ei = 0 (puntero en ends)
//   mientras si < n:
//     si starts[si] < ends[ei]:
//       // una reunión empieza antes de que la más próxima a terminar acabe
//       salasEnUso += 1;  si += 1
//       maxSalas = max(maxSalas, salasEnUso)
//     si no:
//       // una reunión termina antes (o justo cuando) empieza la siguiente:
//       // esa sala queda libre para reusarse
//       salasEnUso -= 1;  ei += 1
//
// Por qué funciona: separamos los inicios y los fines y los ordenamos por
// SEPARADO (ya no importa a qué reunión pertenecía cada hora). Recorremos
// el tiempo en orden cronológico: cada vez que una reunión empieza antes de
// que termine la que está más próxima a acabar, necesitamos una sala
// adicional; cada vez que una reunión termina, esa sala se libera y puede
// reusarse. El máximo de salas ocupadas SIMULTÁNEAMENTE durante todo el
// barrido es la respuesta.
//
// Complejidad: tiempo O(n log n) (ordenar starts y ends), espacio O(n) para
// los dos arreglos auxiliares.
// ============================================================================
#include <vector>
#include <algorithm>
#include <cassert>
#include <iostream>
using namespace std;

class Solution {
public:
    int minMeetingRooms(vector<vector<int>>& intervals) {
        int n = intervals.size();
        if (n == 0) return 0;

        vector<int> starts(n), ends(n);
        for (int i = 0; i < n; ++i) {
            starts[i] = intervals[i][0];
            ends[i] = intervals[i][1];
        }
        sort(starts.begin(), starts.end());
        sort(ends.begin(), ends.end());

        int salasEnUso = 0, maxSalas = 0;
        int si = 0, ei = 0;
        while (si < n) {
            if (starts[si] < ends[ei]) {
                // Empieza una reunión antes de que libere la más próxima.
                ++salasEnUso;
                ++si;
                maxSalas = max(maxSalas, salasEnUso);
            } else {
                // Se libera una sala (fin <= inicio actual).
                --salasEnUso;
                ++ei;
            }
        }
        return maxSalas;
    }
};

int main() {
    Solution s;

    // Caso normal: [5,10] y [15,20] pueden compartir sala, [0,30] no.
    vector<vector<int>> in1 = {{0,30},{5,10},{15,20}};
    assert(s.minMeetingRooms(in1) == 2);

    // Reuniones que no se traslapan en absoluto: basta una sala.
    vector<vector<int>> in2 = {{7,10},{2,4}};
    assert(s.minMeetingRooms(in2) == 1);

    // Caso límite: una sola reunión.
    vector<vector<int>> in3 = {{1,5}};
    assert(s.minMeetingRooms(in3) == 1);

    // Caso límite: arreglo vacío, no hace falta ninguna sala.
    vector<vector<int>> in4 = {};
    assert(s.minMeetingRooms(in4) == 0);

    // Caso donde el orden de procesamiento importa: hay un empate exacto
    // entre un inicio y un fin ([9,10] termina justo cuando otra reunión
    // empieza en 9). Si se procesara el inicio antes que el fin en el
    // empate, se contaría una sala de más.
    vector<vector<int>> in5 = {{9,10},{4,9},{4,17}};
    assert(s.minMeetingRooms(in5) == 2);

    cout << "253. Meeting Rooms II: todas las pruebas pasaron.\n";
    return 0;
}
