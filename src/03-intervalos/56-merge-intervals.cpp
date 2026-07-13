// ============================================================================
// 56. Merge Intervals  (Medium)
// ----------------------------------------------------------------------------
// Nos dan un arreglo de intervalos intervals[i] = [inicio, fin]. Queremos
// fusionar todos los intervalos que se solapan (o que se tocan justo en un
// punto) y devolver el arreglo resultante de intervalos que ya no se
// solapan entre sí, cubriendo exactamente el mismo rango total.
//
// Ejemplo: intervals = [[1,3],[2,6],[8,10],[15,18]]
//
//   1--3
//      2-----6        8--10        15---18
//
//   [1,3] y [2,6] se solapan (3 >= 2) -> se funden en [1,6].
//   [8,10] y [15,18] no tocan a nadie -> quedan igual.
//   Resultado: [[1,6],[8,10],[15,18]]
//
// Diagrama del algoritmo:
//
//   ordenar intervals por su inicio
//   resultado = []
//   para cada intervalo iv en intervals (ya ordenados):
//     si resultado está vacío o el fin del último en resultado < iv.inicio:
//       // no se solapan: iv abre un grupo nuevo
//       resultado.push(iv)
//     si no:
//       // se solapan (o se tocan): extender el fin del último grupo
//       resultado.last().fin = max(resultado.last().fin, iv.fin)
//
// Por qué funciona: una vez ordenados por inicio, dos intervalos que no se
// solapan con el grupo "abierto" actual tampoco pueden solaparse con ningún
// grupo anterior (porque sus inicios son aún mayores). Así que basta con
// comparar cada intervalo nuevo contra el ÚLTIMO grupo armado hasta ahora:
// si el intervalo nuevo empieza antes (o justo cuando) termina ese grupo,
// pertenece al mismo grupo y solo hay que estirar su fin; si no, es un
// grupo nuevo. El orden por inicio es lo que hace posible resolverlo en una
// sola pasada.
//
// Complejidad: tiempo O(n log n) (dominado por el ordenamiento), espacio
// O(n) para el resultado (sin contar lo que pida el ordenamiento in-place).
// ============================================================================
#include <vector>
#include <algorithm>
#include <cassert>
#include <iostream>
using namespace std;

class Solution {
public:
    vector<vector<int>> merge(vector<vector<int>>& intervals) {
        vector<vector<int>> result;
        if (intervals.empty()) return result;

        sort(intervals.begin(), intervals.end(),
             [](const vector<int>& a, const vector<int>& b) {
                 return a[0] < b[0];
             });

        for (auto& iv : intervals) {
            if (result.empty() || result.back()[1] < iv[0]) {
                // No se solapa con el último grupo: abrimos uno nuevo.
                result.push_back(iv);
            } else {
                // Se solapa (o se tocan): estiramos el fin del último grupo.
                result.back()[1] = max(result.back()[1], iv[1]);
            }
        }
        return result;
    }
};

int main() {
    Solution s;

    // Caso normal: dos solapes que se funden, dos intervalos sueltos.
    vector<vector<int>> in1 = {{1,3},{2,6},{8,10},{15,18}};
    assert(s.merge(in1) == (vector<vector<int>>{{1,6},{8,10},{15,18}}));

    // Intervalos que solo se TOCAN (fin == inicio del siguiente): también
    // deben fusionarse, según el enunciado.
    vector<vector<int>> in2 = {{1,4},{4,5}};
    assert(s.merge(in2) == (vector<vector<int>>{{1,5}}));

    // Caso límite: arreglo vacío.
    vector<vector<int>> in3 = {};
    assert(s.merge(in3) == (vector<vector<int>>{}));

    // Caso límite: un solo intervalo, no hay nada que fusionar.
    vector<vector<int>> in4 = {{1,4}};
    assert(s.merge(in4) == (vector<vector<int>>{{1,4}}));

    // Caso donde el orden de procesamiento importa: el intervalo que
    // solapa llega ANTES en el arreglo original, así que si no ordenamos
    // por inicio primero, el algoritmo de una sola pasada falla.
    vector<vector<int>> in5 = {{2,3},{1,5}};
    assert(s.merge(in5) == (vector<vector<int>>{{1,5}}));

    cout << "56. Merge Intervals: todas las pruebas pasaron.\n";
    return 0;
}
