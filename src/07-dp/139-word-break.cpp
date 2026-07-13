// ============================================================================
// 139. Word Break  (Media)
// ----------------------------------------------------------------------------
// Dada una cadena s y un diccionario de palabras wordDict, determina si s se
// puede partir en una secuencia de una o más palabras del diccionario,
// separadas donde se quiera (las palabras del diccionario se pueden reusar
// tantas veces como haga falta).
//
// Ejemplo: s = "leetcode", wordDict = ["leet", "code"]
//
//   "leetcode" = "leet" + "code"   -> true
//
// Programación dinámica (dynamic programming, DP) 1D booleana: dp[i] indica
// si el prefijo de s de longitud i (los primeros i caracteres) se puede
// partir completamente en palabras del diccionario.
//
// Diagrama de la tabla dp para s = "leetcode":
//
//   i:      0  1  2  3  4  5  6  7  8
//   letra:     l  e  e  t  c  o  d  e
//   dp[i]:  T  F  F  F  T  F  F  F  T
//
//   dp[0] = true (la cadena vacía siempre se puede "partir": caso base).
//   Para cada i de 1 a n, probamos cada j < i:
//     si dp[j] es true y el substring s[j..i) está en el diccionario:
//       dp[i] = true
//
// Por qué funciona: si el prefijo de longitud i se puede partir en palabras
// del diccionario, entonces existe algún punto de corte j donde la última
// palabra usada es exactamente s[j..i); todo lo que viene antes de j (el
// prefijo de longitud j) también tuvo que partirse correctamente, es decir
// dp[j] debe ser true. Como probamos todos los posibles puntos de corte j,
// cubrimos todas las formas de llegar a i.
//
// Complejidad: tiempo O(n^2) (n valores de i, cada uno prueba hasta n
// valores de j, y comparar/crear el substring toma tiempo proporcional a su
// longitud), espacio O(n) para la tabla dp (sin contar el diccionario).
// ============================================================================
#include <vector>
#include <string>
#include <unordered_set>
#include <cassert>
#include <iostream>
using namespace std;

class Solution {
public:
    bool wordBreak(string s, vector<string>& wordDict) {
        unordered_set<string> dict(wordDict.begin(), wordDict.end());
        int n = (int)s.size();
        vector<bool> dp(n + 1, false);
        dp[0] = true;

        for (int i = 1; i <= n; i++) {
            for (int j = 0; j < i; j++) {
                if (dp[j] && dict.count(s.substr(j, i - j))) {
                    dp[i] = true;
                    break;
                }
            }
        }

        return dp[n];
    }
};

int main() {
    Solution sol;

    // Caso normal: ejemplo clásico del enunciado de LeetCode.
    vector<string> d1 = {"leet", "code"};
    assert(sol.wordBreak("leetcode", d1) == true);

    // Caso límite: cadena vacía siempre se puede partir (cero palabras).
    vector<string> d2 = {"a", "b"};
    assert(sol.wordBreak("", d2) == true);

    // Caso límite: una sola palabra que coincide exacto con el diccionario.
    vector<string> d3 = {"hola"};
    assert(sol.wordBreak("hola", d3) == true);

    // Trampa común: palabras del diccionario que se solapan y hacen que un
    // corte "obvio" falle, pero exista otro corte válido. "catsandog" NO se
    // puede partir con este diccionario aunque "cats", "and", "sand" y "dog"
    // existan por separado, porque ningún corte deja "og" cubierto.
    vector<string> d4 = {"cats", "dog", "sand", "and", "cat"};
    assert(sol.wordBreak("catsandog", d4) == false);

    // Caso donde SÍ hay solape pero el corte correcto existe: "cat" + "sand"
    // + "og" no funciona, pero "cats" + "and" + "dog" sí.
    vector<string> d5 = {"cats", "dog", "sand", "and", "cat"};
    assert(sol.wordBreak("catsanddog", d5) == true);

    cout << "139. Word Break: todas las pruebas pasaron.\n";
    return 0;
}
