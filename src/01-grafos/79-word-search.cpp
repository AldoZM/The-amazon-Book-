// ============================================================================
// 79. Word Search  (Medium)
// ----------------------------------------------------------------------------
// Dada una cuadrícula de letras (board) y una palabra (word), decide si la
// palabra existe formando un camino de celdas adyacentes en horizontal o
// vertical (no diagonal), sin reutilizar una misma celda dos veces.
//
// Ejemplo:
//   board =
//     A B C E          word = "ABCCED"  -> true (A-B-C-C-E-D, bajando y
//     S F C S                             recorriendo por la columna central)
//     A D E E          word = "SEE"     -> true
//                       word = "ABCB"    -> false (la segunda B reutilizaría
//                                          la celda ya usada por la primera)
//
// Diagrama de la búsqueda DFS con backtracking desde una celda (r,c) que
// coincide con word[i]:
//
//        (r-1,c)
//           |
//   (r,c-1)-(r,c)-(r,c+1)      Si board[r][c] == word[i], marcamos la celda
//           |                  como visitada ('#') y probamos las 4 vecinas
//        (r+1,c)               buscando word[i+1]. Si ninguna funciona,
//                               restauramos la celda (backtrack) antes de
//                               volver, para que otros caminos puedan usarla.
//
// Idea: para cada celda de la cuadrícula, intentamos que sea el punto de
// partida (word[0]) y hacemos DFS con backtracking. Al entrar a una celda la
// marcamos temporalmente para no reusarla en el mismo camino; al salir (ya
// sea que el camino tuvo éxito o fracasó) la restauramos a su valor original.
//
// Complejidad: tiempo O(m*n*4^L) donde L = longitud de word (en el peor caso,
//              desde cada una de las m*n celdas se abren hasta 4 ramas por
//              cada letra de la palabra),
//              espacio O(L) por la profundidad de la pila de recursión.
// ============================================================================
#include <vector>
#include <string>
#include <cassert>
#include <iostream>
using namespace std;

class Solution {
public:
    bool exist(vector<vector<char>>& board, string word) {
        if (board.empty() || board[0].empty() || word.empty()) return false;
        int m = board.size(), n = board[0].size();
        for (int r = 0; r < m; ++r) {
            for (int c = 0; c < n; ++c) {
                if (buscar(board, word, r, c, 0, m, n)) return true;
            }
        }
        return false;
    }

private:
    // Intenta continuar el camino de word desde word[i] partiendo de (r,c).
    bool buscar(vector<vector<char>>& board, const string& word,
                int r, int c, int i, int m, int n) {
        if (i == (int)word.size()) return true;  // ya se emparejó toda la palabra
        if (r < 0 || r >= m || c < 0 || c >= n) return false;  // fuera de límites
        if (board[r][c] != word[i]) return false;  // no coincide o ya visitada ('#')

        char original = board[r][c];
        board[r][c] = '#';   // marcamos la celda como usada en este camino

        bool encontrada =
            buscar(board, word, r - 1, c, i + 1, m, n) ||  // arriba
            buscar(board, word, r + 1, c, i + 1, m, n) ||  // abajo
            buscar(board, word, r, c - 1, i + 1, m, n) ||  // izquierda
            buscar(board, word, r, c + 1, i + 1, m, n);    // derecha

        board[r][c] = original;  // backtrack: restauramos antes de volver
        return encontrada;
    }
};

int main() {
    Solution s;

    // Palabra presente: A-B-C-C-E-D es un camino válido (baja por la columna
    // central de la C y luego va a la E y a la D).
    vector<vector<char>> b1 = {
        {'A','B','C','E'},
        {'S','F','C','S'},
        {'A','D','E','E'},
    };
    assert(s.exist(b1, "ABCCED") == true);

    // Palabra presente, camino corto por la columna derecha.
    vector<vector<char>> b2 = b1;
    assert(s.exist(b2, "SEE") == true);

    // Palabra ausente: no existe ningún camino que forme "ABCB" porque,
    // tras usar la primera B, la única forma de volver a una B requeriría
    // reutilizar la celda ya visitada.
    vector<vector<char>> b3 = b1;
    assert(s.exist(b3, "ABCB") == false);

    // Palabra de una sola letra: basta con que exista esa letra en la
    // cuadrícula (no requiere adyacencia con nada más).
    vector<vector<char>> b4 = b1;
    assert(s.exist(b4, "F") == true);
    assert(s.exist(b4, "Z") == false);

    // Cuadrícula de una sola celda.
    vector<vector<char>> b5 = {{'A'}};
    assert(s.exist(b5, "A") == true);
    assert(s.exist(b5, "AA") == false);  // reutilizaría la única celda

    cout << "79 Word Search: todas las pruebas pasaron.\n";
    return 0;
}
