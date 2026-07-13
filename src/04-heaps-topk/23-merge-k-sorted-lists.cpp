// ============================================================================
// 23. Merge k Sorted Lists  (Hard)
// ----------------------------------------------------------------------------
// Nos dan un arreglo de k listas enlazadas, cada una ya ordenada de menor a
// mayor. Hay que fusionarlas en una sola lista enlazada, también ordenada, y
// devolver su cabeza.
//
// Ejemplo: lists = [[1,4,5],[1,3,4],[2,6]]
//   Fusión ordenada de las tres: 1,1,2,3,4,4,5,6
//
// Diagrama del algoritmo (min-heap con la cabeza actual de cada lista):
//
//   heap = []  (min-heap por valor del nodo)
//   para cada lista no vacía, meter su primer nodo al heap
//   dummy = nodo vacío que sirve de ancla para armar la respuesta
//   cola = dummy
//   mientras el heap no esté vacío:
//     sacar el nodo con menor valor
//     cola.next = ese nodo; cola = cola.next
//     si ese nodo tiene un siguiente, meter ese siguiente al heap
//   devolver dummy.next
//
// Idea: fusionar dos listas ordenadas es fácil (comparar sus cabezas y
// avanzar la más chica); fusionar k a la vez es lo mismo pero comparando k
// candidatos en lugar de 2. En vez de comparar las k cabezas una por una en
// cada paso (que sería O(k) por paso), las metemos en un min-heap: sacar el
// menor de k candidatos cuesta O(log k) en vez de O(k). Cada vez que
// "consumimos" un nodo de una lista, su siguiente nodo se vuelve el nuevo
// candidato de esa lista y entra al heap.
//
// Por qué funciona: en cualquier momento, el heap contiene exactamente un
// candidato por cada lista que todavía tiene nodos sin usar (su nodo actual,
// el más pequeño no usado de esa lista, porque las listas ya vienen
// ordenadas). El menor de todos esos candidatos es forzosamente el menor
// valor no usado de TODAS las listas juntas, así que es seguro colocarlo a
// continuación en la respuesta.
//
// Complejidad: tiempo O(N log k), donde N es el total de nodos en todas las
// listas y k es el número de listas. Espacio O(k) para el heap (más O(N)
// para la lista de salida, que no cuenta como espacio extra si se reutilizan
// los nodos originales, como hace este código).
// ============================================================================
#include <vector>
#include <queue>
#include <cassert>
#include <iostream>
using namespace std;

struct ListNode {
    int val;
    ListNode *next;
    ListNode(int x) : val(x), next(nullptr) {}
};

class Solution {
public:
    ListNode* mergeKLists(vector<ListNode*>& lists) {
        // Min-heap por valor: pair<valor, nodo>. Se compara por valor primero;
        // si dos valores empatan, comparar punteros solo desempata (no importa
        // el orden real entre ellos).
        auto cmp = [](ListNode* a, ListNode* b) { return a->val > b->val; };
        priority_queue<ListNode*, vector<ListNode*>, decltype(cmp)> heap(cmp);

        for (ListNode* nodo : lists) {
            if (nodo != nullptr) heap.push(nodo);
        }

        ListNode dummy(0);
        ListNode* cola = &dummy;

        while (!heap.empty()) {
            ListNode* menor = heap.top();
            heap.pop();
            cola->next = menor;
            cola = cola->next;
            if (menor->next != nullptr) heap.push(menor->next);
        }
        cola->next = nullptr;

        return dummy.next;
    }
};

int main() {
    Solution s;

    // Caso normal: lists = [[1,4,5],[1,3,4],[2,6]]
    ListNode* l1a = new ListNode(1);
    l1a->next = new ListNode(4);
    l1a->next->next = new ListNode(5);

    ListNode* l1b = new ListNode(1);
    l1b->next = new ListNode(3);
    l1b->next->next = new ListNode(4);

    ListNode* l1c = new ListNode(2);
    l1c->next = new ListNode(6);

    vector<ListNode*> lists1 = {l1a, l1b, l1c};
    ListNode* r1 = s.mergeKLists(lists1);
    vector<int> esperado1 = {1,1,2,3,4,4,5,6};
    ListNode* cur1 = r1;
    for (int v : esperado1) {
        assert(cur1 != nullptr);
        assert(cur1->val == v);
        cur1 = cur1->next;
    }
    assert(cur1 == nullptr);   // la lista terminó justo donde debía

    // Caso límite: arreglo de listas vacío.
    vector<ListNode*> lists2 = {};
    ListNode* r2 = s.mergeKLists(lists2);
    assert(r2 == nullptr);

    // Caso límite: todas las listas están vacías (nullptr).
    vector<ListNode*> lists3 = {nullptr, nullptr};
    ListNode* r3 = s.mergeKLists(lists3);
    assert(r3 == nullptr);

    // Una sola lista no vacía entre varias vacías.
    ListNode* l4a = new ListNode(5);
    vector<ListNode*> lists4 = {nullptr, l4a, nullptr};
    ListNode* r4 = s.mergeKLists(lists4);
    assert(r4 != nullptr);
    assert(r4->val == 5);
    assert(r4->next == nullptr);

    // Caso donde el orden de procesamiento del heap importa: listas con
    // valores entrelazados donde tomar la lista "equivocada" primero rompería
    // el orden final.
    ListNode* l5a = new ListNode(10);
    l5a->next = new ListNode(20);
    ListNode* l5b = new ListNode(1);
    l5b->next = new ListNode(15);
    l5b->next->next = new ListNode(30);
    vector<ListNode*> lists5 = {l5a, l5b};
    ListNode* r5 = s.mergeKLists(lists5);
    vector<int> esperado5 = {1,10,15,20,30};
    ListNode* cur5 = r5;
    for (int v : esperado5) {
        assert(cur5 != nullptr);
        assert(cur5->val == v);
        cur5 = cur5->next;
    }
    assert(cur5 == nullptr);

    cout << "23. Merge k Sorted Lists: todas las pruebas pasaron.\n";
    return 0;
}
