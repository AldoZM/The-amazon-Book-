// ============================================================================
// 1094. Car Pooling  (Medium)
// ----------------------------------------------------------------------------
// Manejas un coche con cierta capacidad de pasajeros y solo viajas hacia
// adelante (nunca retrocedes). Nos dan trips[i] = [numPasajeros, desde,
// hasta]: en el tramo del camino que va del punto "desde" al punto "hasta"
// suben numPasajeros personas (y bajan justo en "hasta"). Devuelve true si
// es posible llevar a todos los pasajeros de todos los viajes sin exceder
// la capacidad del coche en ningún punto del camino, o false si no.
//
// Ejemplo: trips = [[2,1,5],[3,3,7]], capacity = 4
//
//   posición: 0  1  2  3  4  5  6  7
//   viaje A:     +2....... -2
//   viaje B:              +3.......  -3
//   ocupación:   2  2  5  5  5  3  3     <- en la posición 3 ya hay 5 > 4
//
//   En la posición 3 coinciden los 2 pasajeros del viaje A (todavía no han
//   bajado, bajan en 5) con los 3 nuevos del viaje B: 2+3=5 > 4. No cabe.
//
// Diagrama del algoritmo (arreglo de diferencias / sweep line):
//
//   diff[posición] = cambio neto de pasajeros que ENTRAN o SALEN justo ahí
//   para cada viaje (num, desde, hasta):
//     diff[desde] += num     // suben "num" personas en este punto
//     diff[hasta] -= num     // bajan "num" personas en este punto
//   ocupación = 0
//   para cada posición del camino, de menor a mayor:
//     ocupación += diff[posición]
//     si ocupación > capacity: devolver false
//   devolver true
//
// Por qué funciona: en vez de simular pasajero por pasajero, acumulamos
// SOLO los cambios netos en cada punto del camino (cuántos suben menos
// cuántos bajan). Al barrer el camino de izquierda a derecha y sumar esos
// cambios en orden, la variable "ocupación" en cada posición representa
// exactamente cuántos pasajeros van en el coche en ese tramo, sin importar
// en qué orden vinieran los viajes en el arreglo de entrada: lo único que
// importa es su posición en el camino, no su posición en el arreglo.
//
// Complejidad: tiempo O(n + d) donde n es el número de viajes y d es el
// rango de posiciones del camino (barremos el arreglo de diferencias
// completo), espacio O(d) para el arreglo de diferencias.
// ============================================================================
#include <vector>
#include <cassert>
#include <iostream>
using namespace std;

class Solution {
public:
    bool carPooling(vector<vector<int>>& trips, int capacity) {
        // Restricción típica de LeetCode: 0 <= desde < hasta <= 1000.
        vector<int> diff(1001, 0);

        for (auto& t : trips) {
            int num = t[0], desde = t[1], hasta = t[2];
            diff[desde] += num;
            diff[hasta] -= num;
        }

        int ocupacion = 0;
        for (int pos = 0; pos < 1001; ++pos) {
            ocupacion += diff[pos];
            if (ocupacion > capacity) return false;
        }
        return true;
    }
};

int main() {
    Solution s;

    // Caso normal: en la posición 3 se juntan 5 pasajeros, excede capacidad 4.
    vector<vector<int>> t1 = {{2,1,5},{3,3,7}};
    assert(s.carPooling(t1, 4) == false);

    // Mismos viajes, capacidad 5: alcanza justo, cabe.
    vector<vector<int>> t2 = {{2,1,5},{3,3,7}};
    assert(s.carPooling(t2, 5) == true);

    // Caso límite: sin viajes, siempre cabe.
    vector<vector<int>> t3 = {};
    assert(s.carPooling(t3, 1) == true);

    // Caso límite: un solo viaje que ya excede la capacidad desde el inicio.
    vector<vector<int>> t4 = {{5,0,3}};
    assert(s.carPooling(t4, 4) == false);

    // Caso donde el orden de procesamiento (por posición, no por índice del
    // arreglo) importa: el primer viaje baja a sus pasajeros EXACTAMENTE en
    // la posición donde suben los del segundo viaje. No deben contarse como
    // simultáneos: la ocupación nunca debe superar 3.
    vector<vector<int>> t5 = {{3,0,2},{3,2,5}};
    assert(s.carPooling(t5, 3) == true);

    cout << "1094. Car Pooling: todas las pruebas pasaron.\n";
    return 0;
}
