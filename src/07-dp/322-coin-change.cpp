// ============================================================================
// 322. Coin Change  (Media)
// ----------------------------------------------------------------------------
// Dado un arreglo coins con las denominaciones de monedas disponibles (puedes
// usar cada denominación tantas veces como quieras) y un entero amount,
// calcula el número MÍNIMO de monedas necesarias para juntar exactamente
// amount. Si no hay ninguna combinación que llegue exacto, devuelve -1.
//
// Ejemplo: coins = [1,2,5], amount = 11
//
//   11 = 5 + 5 + 1   -> 3 monedas (es el mínimo posible)
//
// Este es un problema clásico de programación dinámica (dynamic programming,
// DP): construimos la respuesta para montos pequeños y la reusamos para
// montos más grandes, en vez de probar todas las combinaciones posibles
// desde cero (lo cual sería exponencial).
//
// Diagrama de la tabla dp (dp[m] = mínimo número de monedas para llegar
// exacto al monto m; usamos un valor "infinito" para representar "todavía
// no se sabe cómo llegar a este monto"):
//
//   coins = [1,2,5]
//   monto m:   0  1  2  3  4  5  6  7  8  9 10 11
//   dp[m]:     0  1  1  2  2  1  2  2  3  3  2  3
//
//   dp[0] = 0 (con cero monedas llegas a monto 0, caso base).
//   Para cada monto m de 1 a amount, probamos cada moneda c:
//     si c <= m y dp[m-c] no es infinito:
//       dp[m] = min(dp[m], dp[m-c] + 1)
//   Es decir: si ya sabemos el mínimo de monedas para llegar a (m - c),
//   nada más agregamos una moneda de valor c encima de esa solución.
//
// Por qué funciona: la solución óptima para el monto m necesariamente usa
// AL MENOS una moneda; sea c esa última moneda usada, entonces el resto
// (m - c) se resolvió con el mínimo número de monedas posible para ese
// monto menor (si no, podríamos sustituir esa parte por una mejor y
// contradecir que dp[m] era el mínimo). Como probamos todas las monedas c
// como "última moneda", cubrimos todos los casos y nos quedamos con el
// mejor.
//
// Complejidad: tiempo O(amount * número de monedas), espacio O(amount).
// ============================================================================
#include <vector>
#include <algorithm>
#include <climits>
#include <cassert>
#include <iostream>
using namespace std;

class Solution {
public:
    int coinChange(vector<int>& coins, int amount) {
        const int INF = INT_MAX / 2; // "infinito" seguro contra overflow al sumar 1
        vector<int> dp(amount + 1, INF);
        dp[0] = 0;

        for (int m = 1; m <= amount; m++) {
            for (int c : coins) {
                if (c <= m && dp[m - c] != INF) {
                    dp[m] = min(dp[m], dp[m - c] + 1);
                }
            }
        }

        return dp[amount] == INF ? -1 : dp[amount];
    }
};

int main() {
    Solution sol;

    // Caso normal: ejemplo clásico del enunciado de LeetCode.
    vector<int> c1 = {1, 2, 5};
    assert(sol.coinChange(c1, 11) == 3);

    // Caso límite: monto 0 (no se necesita ninguna moneda).
    vector<int> c2 = {1, 2, 5};
    assert(sol.coinChange(c2, 0) == 0);

    // Caso límite: una sola denominación que no encaja exacto.
    vector<int> c3 = {2};
    assert(sol.coinChange(c3, 3) == -1);

    // Trampa común: monto imposible de alcanzar con las monedas dadas
    // (todas las monedas son mayores que amount, o no hay combinación
    // exacta posible).
    vector<int> c4 = {3, 7};
    assert(sol.coinChange(c4, 5) == -1);

    // Caso donde conviene combinar denominaciones distintas en vez de
    // usar solo la moneda más grande posible (greedy fallaría aquí: con
    // monedas {1,3,4} y amount=6, la solución óptima es 3+3=2 monedas, no
    // 4+1+1=3 monedas).
    vector<int> c5 = {1, 3, 4};
    assert(sol.coinChange(c5, 6) == 2);

    cout << "322. Coin Change: todas las pruebas pasaron.\n";
    return 0;
}
