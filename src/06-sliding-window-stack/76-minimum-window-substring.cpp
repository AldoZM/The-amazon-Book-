// ============================================================================
// 76. Minimum Window Substring  (Hard)
// ----------------------------------------------------------------------------
// Dadas dos cadenas s y t, devuelve la subcadena CONTIGUA más corta de s que
// contiene a todos los caracteres de t (contando repeticiones: si t tiene
// dos 'a', la ventana debe tener al menos dos 'a'). Si no existe tal
// subcadena, devuelve la cadena vacía "".
//
// Ejemplo: s = "ADOBECODEBANC", t = "ABC"
//
//   A D O B E C O D E B A N C
//                     [B A N C]   <- ventana más chica que cubre A, B, C
//
//   Respuesta: "BANC" (longitud 4). Hay ventanas que cubren A, B, C antes,
//   pero son más largas.
//
// Diagrama de sliding window (ventana deslizante de tamaño variable, con
// conteo de caracteres "necesarios" vs. "presentes en la ventana"):
//
//   necesita[c]   = cuántas veces aparece cada carácter c en t
//   requeridos    = cuántos caracteres DISTINTOS hay que cubrir
//   ventana[c]    = cuántas veces aparece c en la ventana actual [L, R]
//   cubiertos     = cuántos caracteres distintos ya están completamente
//                   cubiertos (ventana[c] >= necesita[c])
//
//   L = 0
//   para R desde 0 hasta el final de s:
//     meter s[R] a la ventana (ventana[s[R]]++)
//     si s[R] es necesario y ventana[s[R]] llegó justo a necesita[s[R]]:
//       cubiertos++
//     mientras cubiertos == requeridos:      // la ventana YA cubre todo t
//       si esta ventana es más chica que la mejor guardada, guardarla
//       sacar s[L] de la ventana (ventana[s[L]]--)
//       si s[L] es necesario y ventana[s[L]] cayó por debajo de necesita[s[L]]:
//         cubiertos--
//       L++
//
// Idea: expandimos R hasta que la ventana cubra todo t (cubiertos ==
// requeridos), y en ese momento tratamos de encogerla desde L todo lo que se
// pueda sin perder la cobertura, guardando la más chica vista. Es la
// combinación clásica de sliding window: R solo avanza hacia adelante,
// L también solo avanza hacia adelante, así que cada carácter de s entra y
// sale de la ventana a lo más una vez.
//
// Complejidad: tiempo O(|s| + |t|), espacio O(|s| + |t|) (para los mapas de
// conteo, acotado por el tamaño del alfabeto).
// ============================================================================
#include <string>
#include <unordered_map>
#include <climits>
#include <cassert>
#include <iostream>
using namespace std;

class Solution {
public:
    string minWindow(string s, string t) {
        if (s.empty() || t.empty()) return "";

        unordered_map<char, int> necesita;
        for (char c : t) necesita[c]++;
        int requeridos = (int)necesita.size();

        unordered_map<char, int> ventana;
        int cubiertos = 0;
        int L = 0;
        int mejorLen = INT_MAX, mejorL = 0;

        for (int R = 0; R < (int)s.size(); ++R) {
            char c = s[R];
            ventana[c]++;
            if (necesita.count(c) && ventana[c] == necesita[c]) {
                cubiertos++;
            }

            while (L <= R && cubiertos == requeridos) {
                if (R - L + 1 < mejorLen) {
                    mejorLen = R - L + 1;
                    mejorL = L;
                }
                char lc = s[L];
                ventana[lc]--;
                if (necesita.count(lc) && ventana[lc] < necesita[lc]) {
                    cubiertos--;
                }
                L++;
            }
        }

        return mejorLen == INT_MAX ? "" : s.substr(mejorL, mejorLen);
    }
};

int main() {
    Solution sol;

    // Caso normal: ejemplo clásico del enunciado de LeetCode.
    assert(sol.minWindow("ADOBECODEBANC", "ABC") == "BANC");

    // Caso límite: alguna de las cadenas está vacía.
    assert(sol.minWindow("", "A") == "");
    assert(sol.minWindow("A", "") == "");

    // Caso límite: t pide más repeticiones de un carácter de las que s tiene.
    assert(sol.minWindow("a", "aa") == "");

    // Caso límite: un solo carácter, coincide exacto.
    assert(sol.minWindow("a", "a") == "a");

    // Caso donde el orden de procesamiento (contraer desde la izquierda
    // después de cada expansión) importa: la ventana mínima real está al
    // final de s, no al principio, y hay que descartar la cobertura parcial
    // temprana.
    assert(sol.minWindow("ab", "b") == "b");

    cout << "76. Minimum Window Substring: todas las pruebas pasaron.\n";
    return 0;
}
