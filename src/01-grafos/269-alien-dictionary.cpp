// ============================================================================
// 269. Alien Dictionary  (Hard)
// ----------------------------------------------------------------------------
// Nos dan una lista de palabras que ya vienen ORDENADAS según las reglas del
// alfabeto de un idioma alienígena (desconocido para nosotros). Hay que
// deducir un orden válido de las letras de ese alfabeto. Si la lista es
// inconsistente con cualquier orden posible, devolvemos "".
//
// Ejemplo:
//   words = ["wrt", "wrf", "er", "ett", "rftt"]
//   Comparando cada par de palabras adyacentes y viendo el primer carácter
//   en el que difieren, obtenemos las reglas: w antes de e, r antes de t (via
//   "er"/"ett"), e antes de r, y t antes de f. Un orden válido es "wertf".
//
// Diagrama: cada par de palabras adyacentes aporta UNA arista dirigida, la
// del primer carácter donde difieren (el resto de la palabra no dice nada
// sobre el orden del alfabeto):
//
//   wrt   wrf     w r t          diff en índice 2: t -> f
//    |     |
//   wrf   er      w r f
//    |     |
//   er    ett     e r            diff en índice 0: w -> e
//    |     |
//   ett   rftt    e t t          diff en índice 1: r -> t
//                 r f t t        diff en índice 0: e -> r
//
//   Grafo resultante:   w -> e -> r -> t -> f
//
// Idea: construimos un grafo dirigido letra -> letra comparando cada par de
// palabras consecutivas y tomando el primer par de caracteres distintos.
// Luego sacamos UN orden topológico (algoritmo de Kahn) sobre ese grafo; si
// no existe (hay un ciclo), la respuesta es "".
//
// Casos especiales CRÍTICOS:
//   (a) Prefijo inválido: si la palabra anterior es más larga que la
//       siguiente y la siguiente es un prefijo de la anterior (por ejemplo
//       ["abc", "ab"]), eso viola el orden alfabético (un prefijo siempre
//       debe ir antes que la palabra que lo extiende) => "".
//   (b) Ciclo en el grafo de letras => "" (no existe orden topológico).
//
// Complejidad: tiempo O(C), espacio O(1) sobre el alfabeto (a lo más 26
// letras), donde C es la suma de longitudes de todas las palabras (el tiempo
// que toma comparar palabras adyacentes domina sobre el topológico, que es
// O(26) en el peor caso).
// ============================================================================
#include <vector>
#include <string>
#include <queue>
#include <unordered_map>
#include <unordered_set>
#include <cassert>
#include <iostream>
using namespace std;

class Solution {
public:
    string alienOrder(vector<string>& words) {
        unordered_map<char, unordered_set<char>> adyacencia;  // letra -> letras que van después
        unordered_map<char, int> gradoEntrada;                 // cuántas letras deben ir antes

        // Registramos todas las letras que aparecen (con grado de entrada 0
        // por defecto), para no perder letras aisladas sin restricciones.
        for (const string& palabra : words)
            for (char c : palabra) {
                adyacencia[c];
                gradoEntrada[c] = 0;
            }

        // Comparamos cada par de palabras adyacentes para deducir aristas.
        for (size_t i = 0; i + 1 < words.size(); ++i) {
            const string& w1 = words[i];
            const string& w2 = words[i + 1];
            size_t minLen = min(w1.size(), w2.size());
            bool difieren = false;
            for (size_t j = 0; j < minLen; ++j) {
                if (w1[j] != w2[j]) {
                    if (!adyacencia[w1[j]].count(w2[j])) {
                        adyacencia[w1[j]].insert(w2[j]);
                        ++gradoEntrada[w2[j]];
                    }
                    difieren = true;
                    break;
                }
            }
            // Prefijo inválido: w1 es más larga que w2 pero coinciden en todo
            // el prefijo común => w2 debería haber ido antes que w1.
            if (!difieren && w1.size() > w2.size()) return "";
        }

        // Algoritmo de Kahn: arrancamos con las letras sin dependencias.
        queue<char> cola;
        for (auto& [letra, grado] : gradoEntrada)
            if (grado == 0) cola.push(letra);

        string resultado;
        while (!cola.empty()) {
            char actual = cola.front(); cola.pop();
            resultado += actual;
            for (char siguiente : adyacencia[actual]) {
                if (--gradoEntrada[siguiente] == 0) cola.push(siguiente);
            }
        }

        // Si no procesamos todas las letras, había un ciclo => imposible.
        if (resultado.size() != gradoEntrada.size()) return "";
        return resultado;
    }
};

// ---------------------------------------------------------------------------
// Verifica que "resultado" sea un orden de letras compatible con "words": debe
// contener exactamente el mismo conjunto de letras (sin repetidas) y respetar
// cada arista deducida (letra c1 antes que c2). Como el orden topológico no es
// único cuando hay letras sin relación entre sí, esta función permite
// comparar sin depender de un string fijo.
bool ordenValido(const string& resultado, const vector<string>& words) {
    unordered_set<char> letras;
    for (const string& palabra : words)
        for (char c : palabra) letras.insert(c);

    if (resultado.size() != letras.size()) return false;

    unordered_map<char, int> posicion;
    for (int i = 0; i < (int)resultado.size(); ++i) {
        char c = resultado[i];
        if (!letras.count(c) || posicion.count(c)) return false;  // letra repetida o ajena
        posicion[c] = i;
    }

    for (size_t i = 0; i + 1 < words.size(); ++i) {
        const string& w1 = words[i];
        const string& w2 = words[i + 1];
        size_t minLen = min(w1.size(), w2.size());
        bool difieren = false;
        for (size_t j = 0; j < minLen; ++j) {
            if (w1[j] != w2[j]) {
                if (posicion[w1[j]] >= posicion[w2[j]]) return false;  // arista violada
                difieren = true;
                break;
            }
        }
        if (!difieren && w1.size() > w2.size()) return false;  // prefijo inválido
    }
    return true;
}

int main() {
    Solution s;

    // Ejemplo clásico: las aristas forman una cadena w->e->r->t->f, así que el
    // orden topológico es único y podemos comparar directo contra "wertf".
    vector<string> w1 = {"wrt", "wrf", "er", "ett", "rftt"};
    assert(s.alienOrder(w1) == "wertf");
    assert(ordenValido(s.alienOrder(w1), w1));

    // Prefijo inválido: "abc" es más larga que "ab" pero "ab" es su prefijo,
    // eso viola el orden alfabético => "".
    vector<string> w2 = {"abc", "ab"};
    assert(s.alienOrder(w2) == "");

    // Ciclo de 2 letras: hacen falta 3 palabras para que dos comparaciones
    // consecutivas den las dos aristas opuestas. "z","x" da z->x; "x","z" da
    // x->z => ciclo z<->x, imposible (caso clásico de LeetCode).
    vector<string> w3 = {"z", "x", "z"};
    assert(s.alienOrder(w3) == "");

    // Ambiguo: solo se deduce b->d; la letra c no tiene ninguna relación con
    // las demás, así que hay varios órdenes válidos (usamos el verificador).
    vector<string> w4 = {"ab", "adc"};
    string r4 = s.alienOrder(w4);
    assert(ordenValido(r4, w4));

    // Una sola palabra: no hay pares que comparar, cualquier letra presente
    // debe aparecer y no hay aristas que respetar.
    vector<string> w5 = {"z"};
    assert(s.alienOrder(w5) == "z");

    // Ciclo más largo escondido entre tres letras: a->b (de "ab","bc"),
    // b->c (de "bc","ca") y c->a (de "ca","a") cierran el ciclo a->b->c->a.
    vector<string> w6 = {"ab", "bc", "ca", "a"};
    assert(s.alienOrder(w6) == "");

    cout << "269 Alien Dictionary: todas las pruebas pasaron.\n";
    return 0;
}
