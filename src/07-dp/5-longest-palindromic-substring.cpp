// ============================================================================
// 5. Longest Palindromic Substring  (Media)
// ----------------------------------------------------------------------------
// Dada una cadena s, encuentra el substring (secuencia de caracteres
// CONTIGUOS) más largo que sea un palíndromo (se lee igual de izquierda a
// derecha que de derecha a izquierda).
//
// Ejemplo: s = "babad"
//
//   "bab" es palíndromo (longitud 3)
//   "aba" también es palíndromo (longitud 3)
//   cualquiera de los dos es una respuesta válida
//
// Técnica: expansión desde el centro (una variante de two pointers, dos
// punteros que se separan en vez de acercarse). Un palíndromo es simétrico
// respecto a un centro, y ese centro puede ser un solo carácter (para
// palíndromos de longitud impar, como "aba") o el punto entre dos caracteres
// (para palíndromos de longitud par, como "abba"). Para una cadena de
// longitud n hay exactamente 2n-1 centros posibles: n centros de un solo
// carácter y n-1 centros "entre pares".
//
// Diagrama para s = "babad", probando el centro en el índice 1 ('a'):
//
//   b a b a d
//     ^
//   L=1, R=1 -> s[L]==s[R] ('a'), se expande
//   L=0, R=2 -> s[L]==s[R] ('b'), se expande
//   L=-1     -> fuera de rango, se detiene
//   palíndromo encontrado: s[0..2] = "bab" (longitud 3)
//
// Algoritmo:
//   mejorInicio = 0, mejorLongitud = 1
//   para cada centro posible c de 0 a 2n-2:
//     si c es par:  L = R = c / 2            (centro de un carácter)
//     si c es impar: L = c / 2, R = L + 1     (centro entre dos caracteres)
//     mientras L >= 0 y R < n y s[L] == s[R]:
//       L--
//       R++
//     // al salir del ciclo, el palíndromo válido es s[L+1 .. R-1]
//     si (R - 1) - (L + 1) + 1 > mejorLongitud:
//       actualizar mejorInicio y mejorLongitud
//   devolver s.substr(mejorInicio, mejorLongitud)
//
// Por qué funciona: cada palíndromo tiene un centro único (aunque distintos
// palíndromos puedan compartir el mismo centro en distintas expansiones), así
// que probar los 2n-1 centros posibles y expandir cada uno hasta el máximo
// garantiza encontrar el palíndromo más largo posible alrededor de cada
// centro, y por lo tanto el más largo de toda la cadena. No hace falta la
// tabla 2D de DP (que también es correcta) porque la expansión desde el
// centro logra lo mismo con espacio constante extra.
//
// Complejidad: tiempo O(n^2) (2n-1 centros, cada expansión puede tomar hasta
// O(n) pasos), espacio O(1) extra (sin contar la cadena resultado).
// ============================================================================
#include <string>
#include <cassert>
#include <iostream>
using namespace std;

class Solution {
public:
    string longestPalindrome(string s) {
        int n = (int)s.size();
        if (n == 0) return "";

        int mejorInicio = 0, mejorLongitud = 1;

        for (int c = 0; c < 2 * n - 1; c++) {
            int L = c / 2;
            int R = (c % 2 == 0) ? c / 2 : c / 2 + 1;

            while (L >= 0 && R < n && s[L] == s[R]) {
                L--;
                R++;
            }

            // El palíndromo válido más reciente es s[L+1 .. R-1].
            int longitud = (R - 1) - (L + 1) + 1;
            if (longitud > mejorLongitud) {
                mejorLongitud = longitud;
                mejorInicio = L + 1;
            }
        }

        return s.substr(mejorInicio, mejorLongitud);
    }
};

int main() {
    Solution sol;

    // Caso normal: ejemplo clásico del enunciado de LeetCode. Hay dos
    // respuestas válidas ("bab" y "aba"); esta implementación, al probar
    // los centros de izquierda a derecha y solo reemplazar cuando encuentra
    // una longitud ESTRICTAMENTE mayor, se queda con la primera que
    // encuentra, que es "bab".
    assert(sol.longestPalindrome("babad") == "bab");

    // Caso límite: cadena vacía.
    assert(sol.longestPalindrome("") == "");

    // Caso límite: un solo carácter (es palíndromo trivial de sí mismo).
    assert(sol.longestPalindrome("a") == "a");

    // Trampa común: palíndromo de longitud par, que requiere un centro
    // "entre dos caracteres" y no solo centros de un carácter.
    assert(sol.longestPalindrome("cbbd") == "bb");

    // Caso sin ambigüedad de empates: toda la cadena es un palíndromo.
    assert(sol.longestPalindrome("racecar") == "racecar");

    cout << "5. Longest Palindromic Substring: todas las pruebas pasaron.\n";
    return 0;
}
