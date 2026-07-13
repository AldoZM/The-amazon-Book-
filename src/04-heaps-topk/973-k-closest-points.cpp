// ============================================================================
// 973. K Closest Points to Origin  (Medium)
// ----------------------------------------------------------------------------
// Nos dan una lista de puntos en el plano, points[i] = [x, y], y un entero k.
// Hay que devolver los k puntos más cercanos al origen (0, 0), usando la
// distancia euclidiana. El orden de la respuesta no importa.
//
// Ejemplo: points = [[1,3],[-2,2]], k = 1
//   distancia al origen de [1,3]  = sqrt(1^2 + 3^2)  = sqrt(10) ~= 3.16
//   distancia al origen de [-2,2] = sqrt((-2)^2+2^2) = sqrt(8)  ~= 2.83
//   [-2,2] está más cerca => respuesta {[-2,2]}.
//
// Diagrama del algoritmo (max-heap de tamaño k por distancia al cuadrado):
//
//   heap = []  (max-heap, la cima siempre es el MÁS LEJANO del heap)
//   para cada punto p en points:
//     d2 = distancia al cuadrado de p al origen   (x*x + y*y, sin sqrt)
//     heap.push((d2, p))
//     si heap.size() > k:
//       heap.pop()          // se saca el más lejano: ya no puede ser top-k cercano
//   al terminar, el heap contiene los k puntos más cercanos
//
// Idea: comparar distancias al cuadrado da el mismo orden que comparar
// distancias reales (la raíz cuadrada es una función creciente, así que si
// a^2 < b^2 con a, b >= 0 entonces a < b). Evitamos calcular sqrt, que es más
// lento y puede introducir errores de precisión con floats, sin cambiar el
// resultado. Usamos un max-heap (en vez de min-heap como en 215) porque aquí
// queremos descartar rápido a los puntos MÁS LEJANOS: mantenemos los k
// puntos más cercanos vistos hasta el momento, y cuando el heap crece más
// allá de k, el que sobra es el más lejano de esos k+1 (el candidato menos
// atractivo para estar en el top-k cercano), así que lo sacamos.
//
// Por qué funciona: mismo invariante que 215 mirado al revés. Después de
// procesar cualquier prefijo de points, el heap contiene los
// min(k, puntos_vistos) puntos más CERCANOS de ese prefijo. Al final el
// heap tiene los k más cercanos de la lista completa.
//
// Complejidad: tiempo O(n log k), espacio O(k).
// ============================================================================
#include <vector>
#include <queue>
#include <unordered_set>
#include <cassert>
#include <iostream>
using namespace std;

class Solution {
public:
    vector<vector<int>> kClosest(vector<vector<int>>& points, int k) {
        // Max-heap por distancia al cuadrado: pair<distancia^2, índice del punto>.
        priority_queue<pair<long long,int>> heap;
        for (int i = 0; i < (int)points.size(); ++i) {
            long long x = points[i][0], y = points[i][1];
            long long d2 = x * x + y * y;
            heap.push({d2, i});
            if ((int)heap.size() > k) {
                heap.pop();   // sacamos el más lejano: no puede ser top-k cercano
            }
        }

        vector<vector<int>> resultado;
        while (!heap.empty()) {
            resultado.push_back(points[heap.top().second]);
            heap.pop();
        }
        return resultado;
    }
};

int main() {
    Solution s;

    // Caso normal.
    vector<vector<int>> p1 = {{1,3},{-2,2}};
    vector<vector<int>> r1 = s.kClosest(p1, 1);
    assert(r1.size() == 1);
    assert(r1[0] == vector<int>({-2, 2}));

    // Un solo punto, k = 1.
    vector<vector<int>> p2 = {{5,5}};
    vector<vector<int>> r2 = s.kClosest(p2, 1);
    assert(r2.size() == 1);
    assert(r2[0] == vector<int>({5, 5}));

    // k igual al tamaño de la lista: deben salir todos los puntos (orden no
    // garantizado, así que comparamos como conjunto de pares).
    vector<vector<int>> p3 = {{3,3},{5,-1},{-2,4}};
    vector<vector<int>> r3 = s.kClosest(p3, 3);
    assert(r3.size() == 3);
    auto asPairSet = [](vector<vector<int>>& v) {
        unordered_set<long long> out;
        for (auto& pt : v) out.insert(((long long)(pt[0] + 100) << 32) ^ (pt[1] + 100));
        return out;
    };
    assert(asPairSet(r3) == asPairSet(p3));

    // Caso donde el orden de procesamiento importa: tres puntos con distancias
    // 1, 100, 4 (al cuadrado); k = 2 debe quedarse con los de distancia 1 y 4,
    // descartando el de distancia 100 sin importar en qué orden llegaron.
    vector<vector<int>> p4 = {{10,0},{1,0},{0,2}};
    // d2: [10,0]=100, [1,0]=1, [0,2]=4
    vector<vector<int>> r4 = s.kClosest(p4, 2);
    assert(r4.size() == 2);
    unordered_set<long long> got4;
    for (auto& pt : r4) got4.insert(((long long)(pt[0] + 100) << 32) ^ (pt[1] + 100));
    unordered_set<long long> expect4 = {
        ((long long)(1 + 100) << 32) ^ (0 + 100),
        ((long long)(0 + 100) << 32) ^ (2 + 100)
    };
    assert(got4 == expect4);

    cout << "973. K Closest Points to Origin: todas las pruebas pasaron.\n";
    return 0;
}
