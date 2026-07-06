// ============================================================================
// 126. Word Ladder II  (Hard)
// ----------------------------------------------------------------------------
// Dadas beginWord, endWord y una lista wordList, cada palabra (empezando por
// beginWord) puede transformarse en otra cambiando exactamente UNA letra,
// siempre que el resultado exista en wordList. Se pide devolver TODAS las
// secuencias de transformación MÁS CORTAS de beginWord a endWord (cada
// secuencia incluye beginWord y endWord). Si endWord es inalcanzable,
// devuelve un vector vacío.
//
// Es la continuación natural del problema 127 (Word Ladder): ahí sólo se
// pedía la LONGITUD del camino más corto; aquí hay que reconstruir TODOS
// los caminos que alcanzan esa longitud mínima.
//
// Ejemplo:
//   beginWord = "hit", endWord = "cog"
//   wordList  = ["hot","dot","dog","lot","log","cog"]
//   Resultado (dos caminos, ambos de longitud 5):
//     ["hit","hot","dot","dog","cog"]
//     ["hit","hot","lot","log","cog"]
//
// Diagrama de niveles del BFS (cada fila es una capa a distancia +1 de la
// anterior; las flechas indican de qué palabra "padre" viene cada hija):
//
//   nivel 0:  hit
//              |
//   nivel 1:  hot
//             /  \
//   nivel 2: dot  lot
//             |    |
//   nivel 3: dog  log
//              \  /
//   nivel 4:    cog     <- endWord, alcanzado en el nivel 4 (camino de 5 palabras)
//
// Idea:
//   1) BFS por niveles desde beginWord sobre el conjunto de wordList. En cada
//      nivel, para cada palabra probamos cambiar cada posición por las 26
//      letras posibles; si el resultado está en el diccionario lo agregamos
//      al SIGUIENTE nivel y anotamos en un mapa de "padres" que esa palabra
//      puede alcanzarse desde la palabra actual.
//   2) Al terminar de procesar un nivel completo, eliminamos del diccionario
//      todas las palabras de ese nivel: así un nivel posterior no puede
//      "regresar" a una palabra ya alcanzada con una distancia mayor, lo que
//      rompería la propiedad de camino más corto.
//   3) En cuanto endWord aparece en algún nivel marcamos "encontrado" y
//      dejamos de expandir niveles nuevos (pero SÍ terminamos de procesar el
//      nivel actual completo, porque puede haber varios padres válidos que
//      lleguen a endWord en ese mismo nivel).
//   4) Con el mapa de padres armado, hacemos DFS con backtracking desde
//      endWord hacia beginWord, siguiendo todos los padres posibles en cada
//      paso, para reconstruir cada camino más corto. Cada camino se arma en
//      reversa (de endWord a beginWord) y se invierte al final.
//
// Complejidad: tiempo O(N * L^2 * 26) para el BFS (N = tamaño del diccionario,
//              L = longitud de las palabras) más el costo de reconstruir los
//              caminos, que en el peor caso es exponencial en el número de
//              caminos más cortos (es inherente al problema: hay que
//              devolverlos TODOS),
//              espacio O(N * L) para el diccionario y el mapa de padres.
// ============================================================================
#include <vector>
#include <string>
#include <unordered_set>
#include <unordered_map>
#include <algorithm>
#include <cassert>
#include <iostream>
using namespace std;

class Solution {
public:
    vector<vector<string>> findLadders(string beginWord, string endWord,
                                        vector<string>& wordList) {
        unordered_set<string> diccionario(wordList.begin(), wordList.end());
        vector<vector<string>> resultado;
        if (!diccionario.count(endWord)) return resultado;  // endWord inalcanzable

        unordered_map<string, vector<string>> padres;  // palabra -> predecesores
        unordered_set<string> nivelActual{beginWord};
        bool encontrado = false;

        while (!nivelActual.empty() && !encontrado) {
            // Quitamos del diccionario las palabras de este nivel: ya tienen
            // fijada su distancia mínima, y no queremos que un nivel futuro
            // "regrese" a ellas (dejaría de ser el camino más corto).
            for (const string& palabra : nivelActual) diccionario.erase(palabra);

            unordered_set<string> siguienteNivel;
            for (const string& palabra : nivelActual) {
                string variante = palabra;
                for (size_t pos = 0; pos < variante.size(); ++pos) {
                    char original = variante[pos];
                    for (char c = 'a'; c <= 'z'; ++c) {
                        if (c == original) continue;
                        variante[pos] = c;
                        if (diccionario.count(variante)) {
                            siguienteNivel.insert(variante);
                            padres[variante].push_back(palabra);
                            if (variante == endWord) encontrado = true;
                        }
                    }
                    variante[pos] = original;  // restauramos antes de la siguiente posición
                }
            }
            nivelActual = siguienteNivel;
        }

        if (!encontrado) return resultado;  // BFS se agotó sin alcanzar endWord

        vector<string> camino{endWord};
        reconstruir(endWord, beginWord, padres, camino, resultado);
        for (auto& c : resultado) reverse(c.begin(), c.end());
        return resultado;
    }

private:
    // DFS con backtracking: desde 'palabra' retrocede por todos sus padres
    // hasta llegar a beginWord, acumulando cada camino completo (en reversa,
    // de endWord a beginWord) en resultado.
    void reconstruir(const string& palabra, const string& beginWord,
                      unordered_map<string, vector<string>>& padres,
                      vector<string>& camino, vector<vector<string>>& resultado) {
        if (palabra == beginWord) {
            resultado.push_back(camino);
            return;
        }
        for (const string& padre : padres[palabra]) {
            camino.push_back(padre);
            reconstruir(padre, beginWord, padres, camino, resultado);
            camino.pop_back();
        }
    }
};

int main() {
    Solution s;

    // Caso clásico: dos caminos más cortos, ambos de longitud 5.
    {
        vector<string> wordList = {"hot", "dot", "dog", "lot", "log", "cog"};
        auto res = s.findLadders("hit", "cog", wordList);
        sort(res.begin(), res.end());
        vector<vector<string>> esperado = {
            {"hit", "hot", "dot", "dog", "cog"},
            {"hit", "hot", "lot", "log", "cog"},
        };
        sort(esperado.begin(), esperado.end());
        assert(res == esperado);
    }

    // Sin solución: endWord no está en wordList => vector vacío.
    {
        vector<string> wordList = {"hot", "dot", "dog", "lot", "log"};
        auto res = s.findLadders("hit", "cog", wordList);
        assert(res.empty());
    }

    // Un único camino más corto (sin bifurcaciones).
    {
        vector<string> wordList = {"dot", "dog"};
        auto res = s.findLadders("hot", "dog", wordList);
        vector<vector<string>> esperado = {{"hot", "dot", "dog"}};
        assert(res == esperado);
    }

    // beginWord no pertenece a wordList (sólo endWord y las intermedias
    // deben estar); aquí sólo existe un camino más corto de longitud 3.
    {
        vector<string> wordList = {"hot", "dot", "dog", "lot", "log", "cog", "hog"};
        auto res = s.findLadders("hig", "cog", wordList);
        vector<vector<string>> esperado = {{"hig", "hog", "cog"}};
        assert(res == esperado);
    }

    cout << "126 Word Ladder II: todas las pruebas pasaron.\n";
    return 0;
}
