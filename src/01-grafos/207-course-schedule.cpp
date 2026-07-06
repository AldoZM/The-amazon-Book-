// ============================================================================
// 207. Course Schedule  (Medium)
// ----------------------------------------------------------------------------
// Hay numCourses cursos, numerados de 0 a numCourses-1. La lista prerequisites
// contiene pares [a, b] que significan "para tomar el curso a, primero hay
// que tomar el curso b". Determina si es posible tomar todos los cursos.
//
// Esto equivale a preguntar si el grafo dirigido de dependencias (b -> a,
// "b habilita a a") tiene un ciclo. Si hay un ciclo, esos cursos se necesitan
// entre sí circularmente y nunca se puede empezar. Si no hay ciclo, siempre
// existe un orden válido para cursarlos: un orden topológico.
//
// Ejemplo con ciclo (imposible):
//   numCourses = 2, prerequisites = [[1,0],[0,1]]
//     0 --> 1
//     ^-----|      para tomar 1 necesitas 0, y para tomar 0 necesitas 1:
//                  ciclo, nunca se puede empezar.
//
// Ejemplo sin ciclo (posible):
//   numCourses = 4, prerequisites = [[1,0],[2,0],[3,1],[3,2]]
//     0 --> 1 --> 3
//     0 --> 2 --> 3      orden topológico válido: 0, 1, 2, 3
//
// Idea (algoritmo de Kahn, BFS con grados de entrada):
// - El "grado de entrada" (in-degree) de un curso es cuántos prerrequisitos
//   le faltan por cumplir antes de poder tomarlo.
// - Empezamos metiendo en una cola todos los cursos con grado de entrada 0
//   (los que no necesitan nada, se pueden tomar de inmediato).
// - Sacamos un curso de la cola, lo "tomamos" (lo contamos como procesado) y
//   reducimos en 1 el grado de entrada de todos los cursos que dependían de
//   él. Si alguno llega a 0, ya cumplió todos sus prerrequisitos y entra a
//   la cola.
// - Si al final procesamos exactamente numCourses cursos, no había ciclo y
//   existe un orden topológico completo => true. Si sobran cursos sin
//   procesar (se quedaron atorados en un ciclo, su grado de entrada nunca
//   baja a 0) => false.
//
// Complejidad: tiempo O(V+E) (V cursos, E prerrequisitos),
//              espacio O(V+E) por la lista de adyacencia y los grados.
// ============================================================================
#include <vector>
#include <queue>
#include <cassert>
#include <iostream>
using namespace std;

class Solution {
public:
    bool canFinish(int numCourses, vector<vector<int>>& prerequisites) {
        vector<vector<int>> adj(numCourses);   // adj[b] = cursos que dependen de b
        vector<int> gradoEntrada(numCourses, 0);

        for (auto& pre : prerequisites) {
            int a = pre[0], b = pre[1];   // para tomar a, primero hay que tomar b
            adj[b].push_back(a);
            ++gradoEntrada[a];
        }

        queue<int> cola;   // cursos listos para tomarse (sin prerrequisitos pendientes)
        for (int curso = 0; curso < numCourses; ++curso)
            if (gradoEntrada[curso] == 0) cola.push(curso);

        int procesados = 0;
        while (!cola.empty()) {
            int curso = cola.front(); cola.pop();
            ++procesados;   // "tomamos" este curso
            for (int siguiente : adj[curso]) {
                if (--gradoEntrada[siguiente] == 0) cola.push(siguiente);
            }
        }

        return procesados == numCourses;   // si falta alguno, había un ciclo
    }
};

int main() {
    Solution s;

    // Sin prerrequisitos: siempre se puede tomar todo.
    vector<vector<int>> p1 = {};
    assert(s.canFinish(2, p1) == true);

    // Cadena lineal: 1 necesita 0, 2 necesita 1, 3 necesita 2. Sin ciclos.
    vector<vector<int>> p2 = {{1,0},{2,1},{3,2}};
    assert(s.canFinish(4, p2) == true);

    // Ciclo simple: 0 necesita 1 y 1 necesita 0. Imposible.
    vector<vector<int>> p3 = {{0,1},{1,0}};
    assert(s.canFinish(2, p3) == false);

    // Varios cursos con un ciclo escondido entre 1, 2 y 3 (0 sí se puede tomar).
    vector<vector<int>> p4 = {{1,0},{2,1},{3,2},{1,3}};
    assert(s.canFinish(4, p4) == false);

    cout << "207 Course Schedule: todas las pruebas pasaron.\n";
    return 0;
}
