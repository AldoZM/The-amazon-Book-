// ============================================================================
// 347. Top K Frequent Elements  (Medium)
// ----------------------------------------------------------------------------
// Nos dan un arreglo nums y un entero k. Hay que devolver los k valores que
// aparecen con mayor frecuencia en nums. El orden de la respuesta no importa
// (LeetCode acepta cualquier orden), y se garantiza que la respuesta es única
// (no hay empates ambiguos en la posición k).
//
// Ejemplo: nums = [1,1,1,2,2,3], k = 2
//   Frecuencias: 1 aparece 3 veces, 2 aparece 2 veces, 3 aparece 1 vez.
//   Los 2 más frecuentes son 1 y 2 => respuesta {1, 2} (en algún orden).
//
// Diagrama del algoritmo (bucket sort por frecuencia, O(n)):
//
//   freq = mapa valor -> cuántas veces aparece
//   buckets = arreglo de listas, tamaño n+1
//     (buckets[f] = lista de valores que aparecen exactamente f veces)
//   para cada (valor, f) en freq:
//     buckets[f].push_back(valor)
//   recorrer buckets desde el índice más alto (n) hacia 0:
//     por cada valor en buckets[f], agregarlo a la respuesta
//     parar en cuanto la respuesta tenga k elementos
//
// Idea: la frecuencia máxima posible de cualquier valor es n (el arreglo
// completo es ese valor), así que en vez de ordenar los valores por
// frecuencia con un heap o un sort genérico (O(n log n)), usamos la
// frecuencia misma como índice de un "casillero" (bucket). Cada casillero
// f contiene todos los valores que aparecen exactamente f veces. Como solo
// existen n+1 casilleros posibles (de 0 a n) y cada valor cae en exactamente
// uno, llenarlos cuesta O(n). Luego basta recorrer los casilleros de mayor a
// menor frecuencia y tomar valores hasta juntar k: como cada valor solo se
// visita una vez en total (está en un único casillero), este recorrido
// también es O(n) en el peor caso.
//
// Alternativa equivalente en espíritu (no usada aquí): un min-heap de tamaño
// k por frecuencia, igual que en 215, con costo O(n log k).
//
// Complejidad: tiempo O(n), espacio O(n).
// ============================================================================
#include <vector>
#include <unordered_map>
#include <unordered_set>
#include <cassert>
#include <iostream>
using namespace std;

class Solution {
public:
    vector<int> topKFrequent(vector<int>& nums, int k) {
        unordered_map<int, int> freq;
        for (int x : nums) freq[x]++;

        int n = nums.size();
        vector<vector<int>> buckets(n + 1);   // buckets[f] = valores con frecuencia f
        for (auto& [valor, f] : freq) {
            buckets[f].push_back(valor);
        }

        vector<int> resultado;
        for (int f = n; f >= 0 && (int)resultado.size() < k; --f) {
            for (int valor : buckets[f]) {
                resultado.push_back(valor);
                if ((int)resultado.size() == k) break;
            }
        }
        return resultado;
    }
};

int main() {
    Solution s;

    // Caso normal. El orden no está garantizado por el algoritmo, así que
    // comparamos el CONJUNTO de valores, no el orden exacto.
    vector<int> n1 = {1,1,1,2,2,3};
    vector<int> r1 = s.topKFrequent(n1, 2);
    unordered_set<int> set1(r1.begin(), r1.end());
    assert(set1 == unordered_set<int>({1, 2}));
    assert(r1.size() == 2);

    // Un solo elemento distinto, k = 1.
    vector<int> n2 = {1};
    vector<int> r2 = s.topKFrequent(n2, 1);
    assert(r2 == vector<int>({1}));

    // k igual a la cantidad de valores distintos: todos deben salir.
    vector<int> n3 = {4,4,5,5,6};
    vector<int> r3 = s.topKFrequent(n3, 3);
    unordered_set<int> set3(r3.begin(), r3.end());
    assert(set3 == unordered_set<int>({4, 5, 6}));

    // Caso donde el orden de recorrido de buckets importa: valores con
    // frecuencias muy distintas, y el valor de mayor frecuencia absoluta
    // debe salir primero al truncar en k = 1.
    vector<int> n4 = {7,7,7,7,8,9,9};
    vector<int> r4 = s.topKFrequent(n4, 1);
    assert(r4 == vector<int>({7}));   // 7 aparece 4 veces, es el único con esa frecuencia

    cout << "347. Top K Frequent Elements: todas las pruebas pasaron.\n";
    return 0;
}
