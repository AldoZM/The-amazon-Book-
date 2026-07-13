// ============================================================================
// 295. Find Median from Data Stream  (Hard)
// ----------------------------------------------------------------------------
// Hay que diseñar una estructura MedianFinder que reciba números uno a uno
// (addNum) y en cualquier momento pueda devolver la mediana (findMedian) de
// todos los números recibidos hasta ese momento. Si la cantidad de números es
// impar, la mediana es el de en medio; si es par, es el promedio de los dos
// de en medio.
//
// Ejemplo:
//   addNum(1) -> stream: [1]
//   addNum(2) -> stream: [1,2]        -> findMedian() = (1+2)/2 = 1.5
//   addNum(3) -> stream: [1,2,3]      -> findMedian() = 2
//
// Diagrama del algoritmo (dos heaps balanceados):
//
//   izquierda = max-heap con la mitad MENOR de los números vistos
//   derecha   = min-heap con la mitad MAYOR de los números vistos
//   invariante: |izquierda.size() - derecha.size()| <= 1
//               todo elemento de izquierda <= todo elemento de derecha
//
//   addNum(x):
//     si izquierda está vacía o x <= cima(izquierda): izquierda.push(x)
//     si no: derecha.push(x)
//     // rebalancear para que ningún heap tenga más de 1 de diferencia
//     si izquierda.size() > derecha.size() + 1:
//       derecha.push(izquierda.pop())
//     si no si derecha.size() > izquierda.size() + 1:
//       izquierda.push(derecha.pop())
//
//   findMedian():
//     si izquierda.size() == derecha.size(): (cima(izquierda) + cima(derecha)) / 2
//     si izquierda.size() > derecha.size(): cima(izquierda)
//     si no: cima(derecha)
//
// Idea: partir el stream en dos mitades, la mitad menor guardada en un
// max-heap (para consultar su máximo, que es el candidato a mediana desde
// abajo, en O(1)) y la mitad mayor en un min-heap (para consultar su mínimo,
// el candidato a mediana desde arriba, en O(1)). Mantener ambos heaps del
// mismo tamaño (o con diferencia de a lo más 1) garantiza que la mediana
// esté siempre en la frontera entre las dos mitades: en la cima de uno de
// los dos heaps, o en el promedio de ambas cimas.
//
// Por qué funciona: como todo elemento de izquierda es <= todo elemento de
// derecha (esto se mantiene por cómo decidimos a qué heap va cada número
// nuevo), izquierda contiene exactamente los valores más pequeños del stream
// y derecha los más grandes, partidos a la mitad. El rebalanceo después de
// cada inserción es O(log n) y nunca rompe ese orden entre las dos mitades,
// porque solo movemos la cima de un heap al otro (el elemento "frontera").
//
// Complejidad: addNum O(log n), findMedian O(1), espacio O(n).
// ============================================================================
#include <queue>
#include <vector>
#include <cassert>
#include <cmath>
#include <iostream>
using namespace std;

class MedianFinder {
public:
    MedianFinder() {}

    void addNum(int num) {
        if (izquierda.empty() || num <= izquierda.top()) {
            izquierda.push(num);
        } else {
            derecha.push(num);
        }

        // Rebalancear: ningún heap puede tener más de 1 elemento de más.
        if (izquierda.size() > derecha.size() + 1) {
            derecha.push(izquierda.top());
            izquierda.pop();
        } else if (derecha.size() > izquierda.size() + 1) {
            izquierda.push(derecha.top());
            derecha.pop();
        }
    }

    double findMedian() {
        if (izquierda.size() == derecha.size()) {
            return (izquierda.top() + derecha.top()) / 2.0;
        } else if (izquierda.size() > derecha.size()) {
            return izquierda.top();
        } else {
            return derecha.top();
        }
    }

private:
    priority_queue<int> izquierda;                                   // max-heap, mitad menor
    priority_queue<int, vector<int>, greater<>> derecha;              // min-heap, mitad mayor
};

int main() {
    // Caso normal del enunciado.
    MedianFinder mf1;
    mf1.addNum(1);
    assert(fabs(mf1.findMedian() - 1.0) < 1e-9);
    mf1.addNum(2);
    assert(fabs(mf1.findMedian() - 1.5) < 1e-9);
    mf1.addNum(3);
    assert(fabs(mf1.findMedian() - 2.0) < 1e-9);

    // Caso límite: un solo número.
    MedianFinder mf2;
    mf2.addNum(42);
    assert(fabs(mf2.findMedian() - 42.0) < 1e-9);

    // Caso donde el orden de llegada importa: números que llegan desordenados
    // deben seguir balanceándose correctamente entre los dos heaps.
    MedianFinder mf3;
    mf3.addNum(5);
    mf3.addNum(15);
    mf3.addNum(1);
    // stream ordenado: 1, 5, 15 -> mediana = 5
    assert(fabs(mf3.findMedian() - 5.0) < 1e-9);
    mf3.addNum(3);
    // stream ordenado: 1, 3, 5, 15 -> mediana = (3+5)/2 = 4
    assert(fabs(mf3.findMedian() - 4.0) < 1e-9);
    mf3.addNum(8);
    // stream ordenado: 1, 3, 5, 8, 15 -> mediana = 5
    assert(fabs(mf3.findMedian() - 5.0) < 1e-9);

    // Caso con muchos números repetidos.
    MedianFinder mf4;
    mf4.addNum(2);
    mf4.addNum(2);
    mf4.addNum(2);
    // stream: 2, 2, 2 -> mediana = 2
    assert(fabs(mf4.findMedian() - 2.0) < 1e-9);

    cout << "295. Find Median from Data Stream: todas las pruebas pasaron.\n";
    return 0;
}
