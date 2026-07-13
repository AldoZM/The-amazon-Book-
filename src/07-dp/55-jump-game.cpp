// ============================================================================
// 55. Jump Game  (Media)
// ----------------------------------------------------------------------------
// Dado un arreglo nums donde cada elemento nums[i] representa el número
// máximo de posiciones que puedes saltar hacia adelante desde el índice i,
// determina si es posible llegar desde el índice 0 hasta el último índice
// del arreglo.
//
// Ejemplo: nums = [2,3,1,1,4]
//
//   índice:   0  1  2  3  4
//   nums[i]:  2  3  1  1  4
//
//   desde 0 saltamos hasta 2 posiciones (llegamos como máximo al índice 2),
//   desde 1 saltamos hasta 3 posiciones (llegamos como máximo al índice 4,
//   que ya es el último) -> true
//
// Este problema SÍ se puede resolver con programación dinámica (dynamic
// programming, DP) tabular, pero admite una solución greedy (voraz) más
// simple y más eficiente en espacio, que es la que se espera en una
// entrevista: en vez de recordar si cada posición individual es alcanzable,
// solo llevamos la cuenta del alcance máximo visto hasta el momento.
//
// Diagrama del algoritmo greedy:
//
//   alcanceMaximo = 0
//   para i desde 0 hasta el último índice:
//     si i > alcanceMaximo:
//       // ni siquiera pudimos llegar a esta posición -> imposible
//       return false
//     alcanceMaximo = max(alcanceMaximo, i + nums[i])
//   return true
//
// Por qué funciona: alcanceMaximo siempre representa el índice más lejano al
// que se puede llegar usando únicamente posiciones ya confirmadas como
// alcanzables (índices 0..i). Si en algún momento i supera ese alcance,
// significa que ninguna posición anterior alcanzable pudo "brincar" hasta i,
// así que i (y todo lo que dependa de partir desde i) es inalcanzable. Si el
// ciclo completa sin que eso pase, el alcance máximo termina cubriendo el
// último índice.
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
    bool canJump(vector<int>& nums) {
        int n = (int)nums.size();
        int alcanceMaximo = 0;

        for (int i = 0; i < n; i++) {
            if (i > alcanceMaximo) return false;
            alcanceMaximo = max(alcanceMaximo, i + nums[i]);
        }

        return true;
    }
};

int main() {
    Solution sol;

    // Caso normal: ejemplo clásico del enunciado de LeetCode.
    vector<int> n1 = {2, 3, 1, 1, 4};
    assert(sol.canJump(n1) == true);

    // Caso límite: un solo elemento, ya estás en el último índice.
    vector<int> n2 = {0};
    assert(sol.canJump(n2) == true);

    // Trampa común: un cero en medio del camino que bloquea el avance,
    // porque ninguna posición anterior alcanza a saltar por encima de él.
    vector<int> n3 = {3, 2, 1, 0, 4};
    assert(sol.canJump(n3) == false);

    // Caso donde un cero NO bloquea porque una posición anterior ya tiene
    // alcance suficiente para saltar por encima de él.
    vector<int> n4 = {2, 3, 0, 1, 4};
    assert(sol.canJump(n4) == true);

    // Caso límite: el primer elemento es 0 pero el arreglo tiene un solo
    // elemento, así que ya llegamos sin necesidad de saltar.
    vector<int> n5 = {0};
    assert(sol.canJump(n5) == true);

    cout << "55. Jump Game: todas las pruebas pasaron.\n";
    return 0;
}
