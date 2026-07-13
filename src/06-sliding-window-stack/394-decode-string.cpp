// ============================================================================
// 394. Decode String  (Medium)
// ----------------------------------------------------------------------------
// Dada una cadena codificada s con el patrón k[cadena], donde k es un
// entero positivo, decodifícala devolviendo la cadena expandida, repitiendo
// k veces lo que está dentro de los corchetes. El patrón puede anidarse
// (corchetes dentro de corchetes) y también puede haber texto normal fuera
// de cualquier corchete.
//
// Ejemplo: s = "3[a2[c]]"
//
//   3[ a 2[ c ] ]
//      |    |
//      |    +-- "c" repetida 2 veces -> "cc"
//      +-- "a" + "cc" = "acc", repetida 3 veces -> "accaccacc"
//
//   Respuesta: "accaccacc"
//
// Diagrama de pila explícita (stack de pares: cadena acumulada hasta el
// momento, número de repeticiones pendiente):
//
//   pila = []          // cada elemento: (cadenaAnterior, repeticiones)
//   actual = ""         // cadena que se está construyendo en el nivel actual
//   numero = 0           // dígitos acumulados antes de un '['
//   para cada carácter c en s:
//     si c es dígito:
//       numero = numero * 10 + valor(c)     // los números pueden tener 2+ dígitos
//     si c == '[':
//       pila.push((actual, numero))   // guardamos dónde íbamos antes de anidar
//       actual = ""                    // el nuevo nivel empieza limpio
//       numero = 0
//     si c == ']':
//       (cadenaAnterior, repeticiones) = pila.pop()
//       actual = cadenaAnterior + (actual repetida "repeticiones" veces)
//     si no (letra normal):
//       actual += c
//   devolver actual
//
// Idea: cada vez que entramos a un nuevo nivel de corchetes, "congelamos" lo
// que llevábamos construido y el número de repeticiones pendiente en la
// pila, y empezamos un lienzo limpio para ese nivel. Al cerrar el corchete,
// repetimos lo que se construyó en ese nivel y lo pegamos de vuelta a lo que
// teníamos congelado. Esto maneja anidamiento arbitrario de forma natural,
// porque cada apertura de corchete crea un nuevo "marco" en la pila,
// exactamente como una llamada recursiva, pero de forma iterativa.
//
// Complejidad: tiempo O(n * m) donde n es la longitud de s y m es la
// longitud de la cadena final decodificada (cada carácter se puede copiar
// varias veces al expandir repeticiones); espacio O(n) para la pila y la
// cadena resultante.
// ============================================================================
#include <string>
#include <stack>
#include <cctype>
#include <cassert>
#include <iostream>
using namespace std;

class Solution {
public:
    string decodeString(string s) {
        stack<pair<string, int>> pila;
        string actual = "";
        int numero = 0;

        for (char c : s) {
            if (isdigit((unsigned char)c)) {
                numero = numero * 10 + (c - '0');
            } else if (c == '[') {
                pila.push({actual, numero});
                actual = "";
                numero = 0;
            } else if (c == ']') {
                auto [cadenaAnterior, repeticiones] = pila.top();
                pila.pop();
                string bloque = actual;
                actual = cadenaAnterior;
                for (int i = 0; i < repeticiones; ++i) {
                    actual += bloque;
                }
            } else {
                actual += c;
            }
        }
        return actual;
    }
};

int main() {
    Solution sol;

    // Caso normal: dos bloques independientes al mismo nivel.
    assert(sol.decodeString("3[a]2[bc]") == "aaabcbc");

    // Caso límite: cadena vacía.
    assert(sol.decodeString("") == "");

    // Caso límite: texto sin ningún corchete, se devuelve tal cual.
    assert(sol.decodeString("abc") == "abc");

    // Texto normal mezclado con corchetes.
    assert(sol.decodeString("2[abc]3[cd]ef") == "abcabccdcdcdef");

    // Caso donde el orden de procesamiento importa: corchetes ANIDADOS, el
    // nivel interno debe resolverse y repetirse antes de que el nivel
    // externo lo use.
    assert(sol.decodeString("3[a2[c]]") == "accaccacc");

    // Número de repeticiones con más de un dígito.
    assert(sol.decodeString("10[a]") == "aaaaaaaaaa");

    cout << "394. Decode String: todas las pruebas pasaron.\n";
    return 0;
}
