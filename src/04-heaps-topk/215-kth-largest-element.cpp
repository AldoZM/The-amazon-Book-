// ============================================================================
// 215. Kth Largest Element in an Array  (Medium)
// ----------------------------------------------------------------------------
// Nos dan un arreglo nums (sin ordenar) y un entero k. Hay que devolver el
// k-ésimo elemento más grande, contando desde el más grande (el 1er más
// grande es el máximo, el 2do es el segundo máximo, etc.). No es el k-ésimo
// valor DISTINTO: si hay duplicados, cada copia cuenta por separado.
//
// Ejemplo: nums = [3,2,1,5,6,4], k = 2
//   Ordenado de mayor a menor: 6, 5, 4, 3, 2, 1
//   El 2do más grande es 5 => respuesta 5.
//
// Diagrama del algoritmo (min-heap de tamaño k):
//
//   heap = []  (min-heap, la cima siempre es el MENOR del heap)
//   para cada x en nums:
//     heap.push(x)
//     si heap.size() > k:
//       heap.pop()          // se saca el menor: ya no puede ser el k-ésimo mayor
//   al terminar, la cima del heap es la respuesta
//
// Idea: en vez de ordenar todo el arreglo (que nos da más información de la
// que necesitamos), mantenemos solo los k elementos más grandes vistos hasta
// el momento, en un min-heap de tamaño k. Cada vez que el heap se pasa de
// tamaño k, el elemento que sobra es forzosamente el MENOR de esos k+1 (el
// que menos posibilidades tiene de ser top-k), así que lo sacamos. Al final,
// el heap contiene exactamente los k mayores de todo el arreglo, y como es un
// min-heap, su cima (el menor de esos k) es justo el k-ésimo más grande.
//
// Por qué funciona: es un invariante que se mantiene en cada paso. Después de
// procesar cualquier prefijo del arreglo, el heap siempre contiene los
// min(k, elementos_vistos) valores más grandes de ese prefijo. Al llegar al
// final, el prefijo es el arreglo completo, así que el heap tiene los k
// mayores del arreglo completo, y su cima es el k-ésimo.
//
// Complejidad: tiempo O(n log k), espacio O(k).
// ============================================================================
#include <vector>
#include <queue>
#include <cassert>
#include <iostream>
using namespace std;

class Solution {
public:
    int findKthLargest(vector<int>& nums, int k) {
        // Min-heap de tamaño (a lo más) k.
        priority_queue<int, vector<int>, greater<>> heap;
        for (int x : nums) {
            heap.push(x);
            if ((int)heap.size() > k) {
                heap.pop();   // sacamos el menor: no puede ser top-k
            }
        }
        return heap.top();
    }
};

int main() {
    Solution s;

    // Caso normal.
    vector<int> n1 = {3,2,1,5,6,4};
    assert(s.findKthLargest(n1, 2) == 5);

    // k = 1: el máximo del arreglo.
    vector<int> n2 = {3,2,3,1,2,4,5,5,6};
    assert(s.findKthLargest(n2, 1) == 6);

    // Un solo elemento, k = 1.
    vector<int> n3 = {7};
    assert(s.findKthLargest(n3, 1) == 7);

    // k = tamaño del arreglo: el mínimo de todos.
    vector<int> n4 = {3,2,3,1,2,4,5,5,6};
    assert(s.findKthLargest(n4, 9) == 1);

    // Con duplicados donde el orden en que entran al heap importa: el valor
    // repetido debe contarse cada vez que aparece, no solo una vez.
    vector<int> n5 = {2,2,2,1};
    // Ordenado desc: 2,2,2,1 -> 3er más grande sigue siendo 2 (no 1).
    assert(s.findKthLargest(n5, 3) == 2);

    cout << "215. Kth Largest Element in an Array: todas las pruebas pasaron.\n";
    return 0;
}
