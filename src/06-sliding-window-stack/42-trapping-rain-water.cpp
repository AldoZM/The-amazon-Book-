// ============================================================================
// 42. Trapping Rain Water  (Hard)
// ----------------------------------------------------------------------------
// Dado un arreglo height que representa la altura de columnas de un
// histograma (cada columna tiene ancho 1), calcula cuánta agua de lluvia
// queda atrapada entre las columnas después de llover.
//
// Ejemplo: height = [0,1,0,2,1,0,1,3,2,1,2,1]
//
//   3         _
//   2     _  | |_     _
//   1  _ |~|_|~|~|_  | |~|_
//   0 |_||_||_||_||_||_||_|
//     0 1 2 3 4 5 6 7 8 9 ...
//
//   El agua atrapada arriba de cada columna se dibuja con "~". En total se
//   atrapan 6 unidades de agua.
//
// Diagrama de two pointers (dos punteros que avanzan uno hacia el otro
// desde los extremos del arreglo):
//
//   L = 0, R = n-1
//   leftMax = 0, rightMax = 0
//   total = 0
//   mientras L < R:
//     si height[L] <= height[R]:
//       leftMax = max(leftMax, height[L])
//       total += leftMax - height[L]     // agua atrapada sobre la columna L
//       L++
//     si no:
//       rightMax = max(rightMax, height[R])
//       total += rightMax - height[R]    // agua atrapada sobre la columna R
//       R--
//
// Idea: el agua que se atrapa exactamente sobre la columna i es
// min(máximo a su izquierda, máximo a su derecha) - height[i]. El truco de
// two pointers evita calcular esos dos máximos por separado con arreglos
// extra: en cada paso movemos el puntero del lado con la altura MENOR entre
// height[L] y height[R]. ¿Por qué es seguro? Porque si height[L] <=
// height[R], entonces el máximo real a la derecha de L es al menos
// height[R] (aunque no sepamos su valor exacto todavía), que ya es >=
// height[L]; así que el mínimo de los dos máximos que limita el agua sobre
// L es, con certeza, leftMax (el máximo visto hasta L por la izquierda), sin
// importar cuál sea el máximo real del lado derecho. Simétrico para el otro
// caso.
//
// Complejidad: tiempo O(n), espacio O(1).
// ============================================================================
#include <vector>
#include <algorithm>
#include <cassert>
#include <iostream>
using namespace std;

class Solution {
public:
    int trap(vector<int>& height) {
        int n = (int)height.size();
        if (n == 0) return 0;

        int L = 0, R = n - 1;
        int leftMax = 0, rightMax = 0;
        int total = 0;

        while (L < R) {
            if (height[L] <= height[R]) {
                leftMax = max(leftMax, height[L]);
                total += leftMax - height[L];
                L++;
            } else {
                rightMax = max(rightMax, height[R]);
                total += rightMax - height[R];
                R--;
            }
        }
        return total;
    }
};

int main() {
    Solution sol;

    // Caso normal: ejemplo clásico del enunciado de LeetCode.
    vector<int> h1 = {0,1,0,2,1,0,1,3,2,1,2,1};
    assert(sol.trap(h1) == 6);

    // Caso límite: arreglo vacío.
    vector<int> h2 = {};
    assert(sol.trap(h2) == 0);

    // Caso límite: un solo elemento (no hay dónde atrapar agua).
    vector<int> h3 = {5};
    assert(sol.trap(h3) == 0);

    // Caso límite: dos elementos (tampoco se puede atrapar nada).
    vector<int> h4 = {5, 4};
    assert(sol.trap(h4) == 0);

    // Caso donde el orden de procesamiento importa: el puntero derecho
    // domina al principio (columna más alta a la derecha), así que hay que
    // mover el puntero izquierdo varias veces seguidas antes de que el
    // lado derecho tome el control.
    vector<int> h5 = {4, 2, 0, 3, 2, 5};
    assert(sol.trap(h5) == 9);

    cout << "42. Trapping Rain Water: todas las pruebas pasaron.\n";
    return 0;
}
