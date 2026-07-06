// ============================================================================
// 128. Longest Consecutive Sequence  (Medium)
// ----------------------------------------------------------------------------
// Dado un arreglo de enteros sin ordenar, devuelve la longitud de la
// secuencia de enteros CONSECUTIVOS más larga (por ejemplo 3,4,5,6). El
// arreglo no está ordenado y el algoritmo debe correr en O(n).
//
// Ejemplo:
//   nums = [100, 4, 200, 1, 3, 2]
//   La secuencia consecutiva más larga es 1, 2, 3, 4  =>  longitud 4.
//
// Diagrama de la idea (metemos todo en un unordered_set):
//
//   set = { 100, 4, 200, 1, 3, 2 }
//
//   100 -> ¿existe 99? no  => 100 ES inicio de secuencia. Cuenta: 100 (long 1)
//     4 -> ¿existe 3?  sí  => 4 NO es inicio, se ignora aquí (ya se contará
//                             cuando lleguemos al verdadero inicio: 1)
//   200 -> ¿existe 199? no => 200 ES inicio. Cuenta: 200 (long 1)
//     1 -> ¿existe 0?  no  => 1 ES inicio de secuencia. Cuenta hacia arriba:
//                             1,2,3,4 (existen en el set) -> longitud 4
//     3 -> ¿existe 2?  sí  => NO es inicio, se ignora
//     2 -> ¿existe 1?  sí  => NO es inicio, se ignora
//
//   Máximo encontrado: 4
//
// Idea clave (por qué es O(n) y no O(n^2)): si para CADA número intentáramos
// contar hacia arriba su secuencia, cada elemento de una secuencia larga
// dispararía un conteo completo desde ahí, y sumaríamos trabajo repetido
// (1 dispara conteo de longitud 4, pero 2, 3 y 4 también dispararían sus
// propios conteos de longitud 3, 2, 1 => O(n^2) en el peor caso, como una
// secuencia 1..n completa).
//
// El truco es filtrar: SOLO contamos hacia arriba cuando el número es un
// "inicio de secuencia", es decir, cuando (num - 1) NO está en el set. Así,
// cada secuencia consecutiva se cuenta EXACTAMENTE UNA VEZ, empezando desde
// su mínimo. Como cada número pertenece a una única secuencia, y esa
// secuencia sólo se recorre una vez completa (desde su inicio), la suma total
// de pasos de conteo a lo largo de todo el algoritmo es a lo sumo n. Cada
// número se visita cuando mucho dos veces: una para meterlo al set / revisar
// si es inicio, y otra (a lo sumo) cuando se cuenta como parte de la
// secuencia de su verdadero inicio. Por eso el algoritmo completo es O(n).
//
// Complejidad: tiempo O(n) (cada número se procesa O(1) veces en promedio
//              gracias al unordered_set y al filtro de "inicio de secuencia"),
//              espacio O(n) por el unordered_set.
// ============================================================================
#include <vector>
#include <unordered_set>
#include <cassert>
#include <iostream>
using namespace std;

class Solution {
public:
    int longestConsecutive(vector<int>& nums) {
        unordered_set<int> presentes(nums.begin(), nums.end());
        int mejor = 0;

        for (int num : presentes) {
            // Sólo arrancamos el conteo si num es el INICIO de su secuencia,
            // es decir, si num - 1 no pertenece al conjunto. Esto evita
            // recontar la misma secuencia varias veces.
            if (presentes.count(num - 1)) continue;

            int actual = num;
            int longitud = 1;
            while (presentes.count(actual + 1)) {   // cuenta hacia arriba
                ++actual;
                ++longitud;
            }
            mejor = max(mejor, longitud);
        }
        return mejor;
    }
};

int main() {
    Solution s;

    vector<int> n1 = {100, 4, 200, 1, 3, 2};
    assert(s.longestConsecutive(n1) == 4);   // secuencia 1,2,3,4

    vector<int> n2 = {0, 3, 7, 2, 5, 8, 4, 6, 0, 1};
    assert(s.longestConsecutive(n2) == 9);   // secuencia 0..8 (el 0 duplicado no afecta)

    vector<int> vacio = {};
    assert(s.longestConsecutive(vacio) == 0);   // sin elementos, no hay secuencia

    vector<int> n3 = {1, 2, 2, 3};
    assert(s.longestConsecutive(n3) == 3);   // duplicados no alargan la secuencia: 1,2,3

    cout << "128 Longest Consecutive: todas las pruebas pasaron.\n";
    return 0;
}
