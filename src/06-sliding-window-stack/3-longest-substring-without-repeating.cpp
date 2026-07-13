// ============================================================================
// 3. Longest Substring Without Repeating Characters  (Medium)
// ----------------------------------------------------------------------------
// Dada una cadena s, devuelve la longitud de la subcadena CONTIGUA más larga
// que no repite ningún carácter.
//
// Ejemplo: s = "abcabcbb"
//
//   a b c a b c b b
//   ^     ^
//   L     R  (al llegar a la segunda 'a', hay que mover L)
//
//   La subcadena más larga sin repetidos es "abc", de longitud 3.
//
// Diagrama de sliding window (ventana deslizante, dos punteros L/R que
// definen un rango contiguo [L, R]):
//
//   ultimoIndice = mapa vacio  // último índice donde vimos cada carácter
//   L = 0
//   mejor = 0
//   para R desde 0 hasta el final de s:
//     c = s[R]
//     si c ya está en ultimoIndice Y ese índice es >= L:
//       // el carácter repetido cae DENTRO de la ventana actual: hay que
//       // cerrarla justo después de esa aparición anterior
//       L = ultimoIndice[c] + 1
//     ultimoIndice[c] = R
//     mejor = max(mejor, R - L + 1)
//
// Idea: en vez de, al encontrar un repetido, mover L de uno en uno hasta
// salir del carácter repetido (que sería O(n) por cada R, y O(n^2) en
// total), guardamos el último índice donde vimos cada carácter y saltamos L
// directo justo después de esa posición. Esto es correcto porque cualquier
// subcadena que empiece antes de esa posición y llegue hasta R tendría el
// carácter repetido dos veces, así que no sirve. El truco de la condición
// "ese índice es >= L" es importante: si vimos el carácter antes pero esa
// aparición ya quedó fuera de la ventana actual (porque L avanzó por otra
// razón), no hay que retroceder L.
//
// Complejidad: tiempo O(n), espacio O(min(n, tamaño del alfabeto)).
// ============================================================================
#include <string>
#include <unordered_map>
#include <algorithm>
#include <cassert>
#include <iostream>
using namespace std;

class Solution {
public:
    int lengthOfLongestSubstring(string s) {
        unordered_map<char, int> ultimoIndice;
        int L = 0;
        int mejor = 0;

        for (int R = 0; R < (int)s.size(); ++R) {
            char c = s[R];
            auto it = ultimoIndice.find(c);
            if (it != ultimoIndice.end() && it->second >= L) {
                // El carácter repetido está dentro de la ventana: cerrar L
                // justo después de esa aparición anterior.
                L = it->second + 1;
            }
            ultimoIndice[c] = R;
            mejor = max(mejor, R - L + 1);
        }
        return mejor;
    }
};

int main() {
    Solution sol;

    // Caso normal: "abc" se repite, la ventana máxima sin repetidos es "abc".
    assert(sol.lengthOfLongestSubstring("abcabcbb") == 3);

    // Caso límite: cadena vacía.
    assert(sol.lengthOfLongestSubstring("") == 0);

    // Caso límite: un solo carácter.
    assert(sol.lengthOfLongestSubstring("a") == 1);

    // Todos los caracteres repetidos: la ventana nunca crece más de 1.
    assert(sol.lengthOfLongestSubstring("bbbbb") == 1);

    // Caso donde el orden de procesamiento importa: el carácter repetido
    // aparece muy atrás en la cadena, pero la ventana relevante en el
    // momento de la repetición ya lo había dejado atrás (L avanzó antes por
    // otra repetición), así que NO debe retroceder L de más.
    // s = "abba": R=0 'a'(L=0,best=1) R=1 'b'(L=0,best=2)
    //     R=2 'b' repetido en ventana (idx1>=L=0) -> L=2, best sigue 2
    //     R=3 'a' visto en idx0, pero idx0 < L=2 -> NO se mueve L, best=max(2,3-2+1=2)=2
    assert(sol.lengthOfLongestSubstring("abba") == 2);

    // Caso con espacios y símbolos, subcadena más larga en medio de la cadena.
    assert(sol.lengthOfLongestSubstring("pwwkew") == 3);   // "wke"

    cout << "3. Longest Substring Without Repeating Characters: todas las pruebas pasaron.\n";
    return 0;
}
