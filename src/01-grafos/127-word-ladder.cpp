// ============================================================================
// 127. Word Ladder  (Hard)
// ----------------------------------------------------------------------------
// Dadas beginWord, endWord y una lista wordList, encuentra la longitud de la
// secuencia de transformación MÁS CORTA de beginWord a endWord, tal que:
//   - cada paso cambia exactamente UNA letra,
//   - cada palabra intermedia resultante debe existir en wordList.
// La longitud cuenta las palabras (incluyendo begin y end). Si no existe tal
// secuencia (o endWord no está en wordList), devuelve 0.
//
// Ejemplo:
//   beginWord = "hit", endWord = "cog"
//   wordList  = ["hot","dot","dog","lot","log","cog"]
//
//   hit -> hot -> dot -> dog -> cog   (longitud 5)
//
// Diagrama del grafo implícito (arista si dos palabras difieren en 1 letra):
//
//        hit
//         |
//        hot
//        /  \
//      dot  lot
//       |    |
//      dog  log
//        \  /
//        cog
//
// Idea: cada palabra es un nodo; hay arista entre dos palabras si difieren en
// exactamente una letra. Buscamos el camino más corto de beginWord a endWord
// en ese grafo => BFS por niveles (no ponderado). Cada nivel del BFS
// corresponde a un paso de transformación.
//
// Para no construir el grafo explícitamente (sería carísimo), generamos los
// vecinos de una palabra "sobre la marcha": para cada posición, probamos las
// 26 letras del alfabeto distintas a la original y verificamos si el
// resultado está en el conjunto de wordList (O(1) con unordered_set).
//
// Complejidad: tiempo O(N * L^2 * 26), espacio O(N * L),
//              donde N = número de palabras en wordList, L = longitud de
//              cada palabra (todas tienen la misma longitud).
// ============================================================================
#include <vector>
#include <string>
#include <queue>
#include <unordered_set>
#include <cassert>
#include <iostream>
using namespace std;

class Solution {
public:
    int ladderLength(string beginWord, string endWord, vector<string>& wordList) {
        unordered_set<string> diccionario(wordList.begin(), wordList.end());
        if (diccionario.find(endWord) == diccionario.end()) return 0;

        queue<string> cola;             // BFS por niveles
        unordered_set<string> visitadas;
        cola.push(beginWord);
        visitadas.insert(beginWord);

        int nivel = 1;   // beginWord ya cuenta como la primera palabra
        while (!cola.empty()) {
            int capa = cola.size();   // palabras en el nivel actual
            for (int i = 0; i < capa; ++i) {
                string palabra = cola.front(); cola.pop();
                if (palabra == endWord) return nivel;

                // Generamos todos los vecinos: cambiar cada posición a cada
                // letra de la 'a' a la 'z' y ver si el resultado es válido.
                for (size_t pos = 0; pos < palabra.size(); ++pos) {
                    char original = palabra[pos];
                    for (char c = 'a'; c <= 'z'; ++c) {
                        if (c == original) continue;
                        palabra[pos] = c;
                        if (diccionario.count(palabra) && !visitadas.count(palabra)) {
                            visitadas.insert(palabra);
                            cola.push(palabra);
                        }
                    }
                    palabra[pos] = original;   // restauramos antes de la siguiente posición
                }
            }
            ++nivel;   // pasamos al siguiente nivel (un paso más de transformación)
        }
        return 0;   // se agotó el BFS sin alcanzar endWord => imposible
    }
};

int main() {
    Solution s;

    // Caso clásico: hit -> hot -> dot -> dog -> cog (longitud 5).
    vector<string> w1 = {"hot", "dot", "dog", "lot", "log", "cog"};
    assert(s.ladderLength("hit", "cog", w1) == 5);

    // endWord no está en wordList => imposible.
    vector<string> w2 = {"hot", "dot", "dog", "lot", "log"};
    assert(s.ladderLength("hit", "cog", w2) == 0);

    // Camino más corto entre dos palabras intermedias del mismo diccionario:
    // hot -> dot -> dog (longitud 3). La ruta hot->lot->log->dog es más larga.
    vector<string> w3 = {"hot", "dot", "dog", "lot", "log", "cog"};
    assert(s.ladderLength("hot", "dog", w3) == 3);

    // beginWord y endWord difieren en una sola letra y endWord está en la
    // lista => transformación directa, longitud 2.
    vector<string> w4 = {"hot"};
    assert(s.ladderLength("hit", "hot", w4) == 2);

    cout << "127 Word Ladder: todas las pruebas pasaron.\n";
    return 0;
}
