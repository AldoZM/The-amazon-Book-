// ============================================================================
// 210. Course Schedule II  (Medium)
// ----------------------------------------------------------------------------
// Hay que cursar "numCourses" materias (0 .. numCourses-1). Nos dan una lista
// de prerrequisitos "prerequisites[i] = [a, b]", que significa: para tomar el
// curso a hace falta haber tomado antes el curso b. Devuelve UN orden válido
// en el que se pueden cursar todas las materias, o un vector vacío si es
// imposible (existe un ciclo de dependencias).
//
// Es la continuación natural del problema 207 (Course Schedule): ahí solo
// preguntaban si era posible terminar todos los cursos (true/false); aquí
// además hay que construir el orden topológico concreto.
//
// Ejemplo:
//   numCourses = 4, prerequisites = [[1,0],[2,0],[3,1],[3,2]]
//   Para tomar 1 y 2 hace falta 0; para tomar 3 hacen falta 1 y 2.
//
// Diagrama del grafo dirigido (a -> b significa "b depende de a"):
//
//        0
//      /   \
//     1     2
//      \   /
//        3
//
// Un orden válido es [0, 1, 2, 3] (o [0, 2, 1, 3]): el orden topológico no
// es único cuando hay ramas independientes.
//
// Idea (algoritmo de Kahn, BFS con grado de entrada):
//   1) Construimos la lista de adyacencia curso -> [cursos que dependen de él]
//      y calculamos el grado de entrada (in-degree) de cada curso: cuántos
//      prerrequisitos le faltan.
//   2) Metemos en una cola todos los cursos con grado de entrada 0 (se pueden
//      tomar de inmediato, sin prerrequisitos pendientes).
//   3) Sacamos un curso de la cola, lo agregamos al resultado, y "liberamos"
//      a sus dependientes restándoles 1 al grado de entrada; el que llegue a
//      0 entra a la cola.
//   4) Si al final el resultado no incluye a los "numCourses" cursos, hay un
//      ciclo (algunos cursos nunca bajan a grado de entrada 0) => devolvemos
//      un vector vacío.
//
// Complejidad: tiempo O(V + E) (V cursos, E prerrequisitos),
//              espacio O(V + E) por la lista de adyacencia y la cola.
// ============================================================================
#include <vector>
#include <queue>
#include <cassert>
#include <iostream>
using namespace std;

class Solution {
public:
    vector<int> findOrder(int numCourses, vector<vector<int>>& prerequisites) {
        vector<vector<int>> adj(numCourses);   // adj[b] = cursos que dependen de b
        vector<int> grado(numCourses, 0);      // grado de entrada de cada curso

        for (auto& pr : prerequisites) {
            int a = pr[0], b = pr[1];   // b es prerrequisito de a
            adj[b].push_back(a);
            ++grado[a];
        }

        queue<int> cola;   // cursos listos para tomar (sin prerrequisitos pendientes)
        for (int curso = 0; curso < numCourses; ++curso)
            if (grado[curso] == 0) cola.push(curso);

        vector<int> orden;
        orden.reserve(numCourses);

        while (!cola.empty()) {
            int actual = cola.front(); cola.pop();
            orden.push_back(actual);
            for (int dependiente : adj[actual]) {
                if (--grado[dependiente] == 0) cola.push(dependiente);
            }
        }

        if ((int)orden.size() != numCourses) return {};   // había un ciclo
        return orden;
    }
};

// ---------------------------------------------------------------------------
// Verifica que "orden" sea un orden topológico válido para "numCourses" cursos
// con las dependencias dadas en "prerequisites": debe incluir a todos los
// cursos exactamente una vez, y cada prerrequisito debe aparecer antes que el
// curso que lo necesita. Como el orden topológico no es único, esta función
// nos permite comparar sin depender de un vector fijo.
bool esOrdenValido(const vector<int>& orden, int numCourses,
                    const vector<vector<int>>& prerequisites) {
    if ((int)orden.size() != numCourses) return false;

    vector<int> posicion(numCourses, -1);
    vector<bool> visto(numCourses, false);
    for (int i = 0; i < (int)orden.size(); ++i) {
        int curso = orden[i];
        if (curso < 0 || curso >= numCourses || visto[curso]) return false;  // repetido o fuera de rango
        visto[curso] = true;
        posicion[curso] = i;
    }

    for (auto& pr : prerequisites) {
        int a = pr[0], b = pr[1];   // b debe ir antes que a
        if (posicion[b] >= posicion[a]) return false;
    }
    return true;
}

int main() {
    Solution s;

    // Sin prerrequisitos: cualquier permutación de 0..numCourses-1 es válida.
    vector<vector<int>> p1 = {};
    auto o1 = s.findOrder(2, p1);
    assert(esOrdenValido(o1, 2, p1));

    // Cadena lineal: 0 <- 1 <- 2 <- 3 (cada curso depende del anterior).
    // El orden topológico es único: [0, 1, 2, 3].
    vector<vector<int>> p2 = {{1, 0}, {2, 1}, {3, 2}};
    auto o2 = s.findOrder(4, p2);
    vector<int> esperado2 = {0, 1, 2, 3};
    assert(o2 == esperado2);
    assert(esOrdenValido(o2, 4, p2));

    // Grafo con ramas independientes (0 -> 1, 0 -> 2, 1 -> 3, 2 -> 3):
    // hay más de un orden válido, así que solo verificamos con esOrdenValido.
    vector<vector<int>> p3 = {{1, 0}, {2, 0}, {3, 1}, {3, 2}};
    auto o3 = s.findOrder(4, p3);
    assert(esOrdenValido(o3, 4, p3));

    // Ciclo: 0 depende de 1 y 1 depende de 0 => imposible, vector vacío.
    vector<vector<int>> p4 = {{0, 1}, {1, 0}};
    auto o4 = s.findOrder(2, p4);
    assert(o4.empty());

    // Ciclo más grande escondido entre cursos válidos: 0 -> 1 -> 2 -> 1.
    vector<vector<int>> p5 = {{1, 0}, {2, 1}, {1, 2}};
    auto o5 = s.findOrder(3, p5);
    assert(o5.empty());

    cout << "210 Course Schedule II: todas las pruebas pasaron.\n";
    return 0;
}
