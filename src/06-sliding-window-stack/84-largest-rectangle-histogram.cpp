// ============================================================================
// 84. Largest Rectangle in Histogram  (Hard)
// ----------------------------------------------------------------------------
// Dado un arreglo heights con las alturas de las barras de un histograma
// (cada barra tiene ancho 1, todas paradas sobre la misma línea base),
// encuentra el área del rectángulo más grande que se puede formar usando
// una o más barras consecutivas, con altura igual a la barra más chica del
// tramo elegido.
//
// Ejemplo: heights = [2,1,5,6,2,3]
//
//   6         _
//   5      _ | |
//   4      | | |
//   3      | | |_  _
//   2  _   | | | ||_|
//   1 | |_ | | | ||_|
//   0 |_||_||_||_||_||_|
//     0  1  2  3  4  5
//
//   El rectángulo más grande usa las barras de índice 2 y 3 (alturas 5 y
//   6), con altura limitada por la más chica de las dos (5) y ancho 2:
//   área = 5 * 2 = 10.
//
// Diagrama de pila monótona (monotonic stack: pila de índices cuyas
// alturas van SIEMPRE en aumento de abajo hacia arriba):
//
//   pila = []   // guarda índices, heights[pila] es creciente
//   para i desde 0 hasta n (con un 0 "centinela" al final, i == n):
//     h = (i == n) ? 0 : heights[i]
//     mientras pila no vacía Y heights[tope de pila] >= h:
//       altura = heights[pila.pop()]         // barra que sacamos
//       // su ancho es hasta dónde llega siendo la más chica: desde el
//       // elemento que quedó justo debajo en la pila (exclusivo) hasta i
//       ancho = pila.vacía ? i : i - pila.tope() - 1
//       area = max(area, altura * ancho)
//     pila.push(i)
//
// Idea: cuando una barra nueva es más baja que la del tope de la pila,
// significa que la barra del tope ya no puede crecer más hacia la derecha
// (la barra nueva la "corta"): es el momento exacto de calcular el
// rectángulo más grande que tiene a esa barra del tope como su altura
// limitante. El ancho de ese rectángulo llega hasta la barra anterior en la
// pila (porque esa fue la última vez que hubo algo más bajo o igual, límite
// por la izquierda) y hasta la posición actual i (límite por la derecha,
// exclusivo). El 0 al final actúa como centinela para forzar que se vacíe
// toda la pila y se evalúen las barras que quedaron pendientes.
//
// Complejidad: tiempo O(n) (cada índice entra y sale de la pila una vez),
// espacio O(n).
// ============================================================================
#include <vector>
#include <stack>
#include <algorithm>
#include <cassert>
#include <iostream>
using namespace std;

class Solution {
public:
    int largestRectangleArea(vector<int>& heights) {
        int n = (int)heights.size();
        stack<int> pila;   // índices, con heights[pila] creciente
        int maxArea = 0;

        for (int i = 0; i <= n; ++i) {
            int h = (i == n) ? 0 : heights[i];   // centinela al final
            while (!pila.empty() && heights[pila.top()] >= h) {
                int altura = heights[pila.top()];
                pila.pop();
                int ancho = pila.empty() ? i : i - pila.top() - 1;
                maxArea = max(maxArea, altura * ancho);
            }
            pila.push(i);
        }
        return maxArea;
    }
};

int main() {
    Solution sol;

    // Caso normal: el rectángulo óptimo usa dos barras consecutivas.
    vector<int> h1 = {2,1,5,6,2,3};
    assert(sol.largestRectangleArea(h1) == 10);

    // Caso límite: arreglo vacío.
    vector<int> h2 = {};
    assert(sol.largestRectangleArea(h2) == 0);

    // Caso límite: una sola barra.
    vector<int> h3 = {5};
    assert(sol.largestRectangleArea(h3) == 5);

    // Todas las barras con la misma altura: el rectángulo óptimo usa todas.
    vector<int> h4 = {4,4,4,4};
    assert(sol.largestRectangleArea(h4) == 16);

    // Caso donde el orden de procesamiento (y el centinela final) importa:
    // la barra más chica está en medio, y el rectángulo óptimo se calcula
    // solo hasta que el centinela fuerza a vaciar la pila.
    vector<int> h5 = {2,1,2};
    assert(sol.largestRectangleArea(h5) == 3);

    cout << "84. Largest Rectangle in Histogram: todas las pruebas pasaron.\n";
    return 0;
}
