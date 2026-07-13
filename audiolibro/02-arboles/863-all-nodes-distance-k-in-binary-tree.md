# 863. All Nodes Distance K in Binary Tree

Dificultad: Media.

## El problema, en palabras simples

Imagina un árbol binario, donde cada nodo puede tener hasta dos hijos, uno a la izquierda y otro a la derecha. Se nos da un nodo específico dentro de ese árbol, al que llamamos el nodo objetivo, y también se nos da un número de pasos. Lo que se pide es encontrar todos los nodos del árbol que están exactamente a esa cantidad de pasos de distancia del nodo objetivo, contando los pasos como el número de conexiones que hay que cruzar para llegar de un nodo a otro, sin importar si esos pasos van hacia abajo, hacia arriba, o una combinación de ambas direcciones.

## La idea central

Piensa en una red de amistades donde, si solo conocieras a los "hijos" de cada persona, pero no supieras quién es su "padre", estarías atrapado viendo solo hacia abajo, como si cada quien solo pudiera presentarte a su gente más joven pero nunca a su gente mayor. El problema es que la persona que buscas puede estar en cualquier dirección: puede ser descendiente del objetivo, pero también puede ser un tío, un primo, o alguien completamente en otra rama de la familia, a quien solo se puede llegar subiendo primero y luego bajando por otro camino. La solución es dejar de pensar en el árbol como una jerarquía de padres e hijos, y empezar a pensarlo como una simple red de contactos: cada persona conoce a sus hijos, sí, pero también aprende a reconocer quién es su padre. Con esa red completa, ya no hay direcciones prohibidas, y se puede explorar libremente en cualquier sentido, exactamente como cuando alguien te presenta amigos de amigos, en círculos que se van expandiendo poco a poco desde ti.

## Cómo funciona el algoritmo, paso a paso

El proceso tiene dos partes claramente separadas.

En la primera parte, recorremos el árbol completo una sola vez, empezando desde la raíz, y para cada nodo que visitamos anotamos quién es su padre en algún lugar donde podamos consultarlo después rápidamente. Al terminar este recorrido, cada nodo del árbol ya tiene identificados hasta tres vecinos posibles: su hijo izquierdo, su hijo derecho, y su padre.

En la segunda parte, exploramos el árbol en círculos que se expanden, empezando desde el nodo objetivo. Este tipo de exploración por niveles se llama Breadth-First Search, glosa de BFS. Guardamos una lista de pendientes por visitar, que funciona como una fila de espera: el primero que entra a la fila es el primero que se procesa. Empezamos poniendo únicamente al nodo objetivo en esa fila, y marcamos que ya lo visitamos, para no volver a procesarlo después.

Repetimos el siguiente proceso mientras todavía queden nodos en la fila y todavía no hayamos llegado al número de pasos que buscamos. En cada vuelta, tomamos todos los nodos que están actualmente en la fila, que representan la distancia actual desde el objetivo, y para cada uno de ellos revisamos sus tres posibles vecinos: el hijo izquierdo, el hijo derecho, y el padre. A cada vecino que no hayamos visitado todavía, lo marcamos como visitado y lo agregamos a la fila para la siguiente vuelta. Cuando terminamos de revisar a todos los nodos de la vuelta actual, aumentamos en uno el contador de distancia recorrida.

En el momento en que el contador de distancia recorrida llega exactamente al número de pasos que buscamos, todos los nodos que quedaron en la fila en ese instante son, precisamente, los nodos que están a esa distancia exacta del objetivo. Esos nodos son la respuesta.

Si la fila se vacía por completo antes de llegar a la distancia buscada, significa que no existe ningún nodo tan lejos del objetivo, y la respuesta es una lista vacía.

## Por qué esta complejidad

En cuanto al tiempo, la primera parte visita cada nodo una sola vez para anotar quién es su padre, y la segunda parte también visita cada nodo como máximo una sola vez, gracias a que llevamos el control de quién ya fue visitado y no lo volvemos a procesar. Como ninguna de las dos partes repite trabajo, el tiempo total crece de forma proporcional a la cantidad total de nodos del árbol.

En cuanto al espacio, necesitamos guardar quién es el padre de cada nodo, lo cual ocupa un espacio proporcional al número de nodos. También necesitamos guardar cuáles nodos ya visitamos, y la fila de pendientes por procesar, y en el peor de los casos esas estructuras pueden llegar a contener a casi todos los nodos del árbol al mismo tiempo.

## Errores comunes y tips de entrevista

El error más importante de evitar es olvidar marcar los nodos como visitados durante la exploración en círculos: si no lo haces, la búsqueda puede rebotar entre un nodo y su padre una y otra vez, entrando en un ciclo que nunca termina.

Otro error común es intentar resolver el problema únicamente con las conexiones originales del árbol, es decir, solo mirando hacia los hijos, sin construir primero la relación de padres. Sin esa relación, es imposible alcanzar nodos que están en ramas distintas a la del objetivo, porque nunca se podría subir para luego bajar por otro camino.

También conviene explicar en la entrevista, antes de programar, la idea central de convertir el árbol en una red donde se puede caminar en cualquier dirección: eso demuestra que entiendes por qué un recorrido normal del árbol no alcanza para resolver este problema.

Por último, vale la pena mencionar los casos extremos: si el número de pasos buscado es cero, la respuesta es únicamente el propio nodo objetivo, y si el número de pasos es mayor que la distancia máxima posible dentro del árbol, la respuesta correcta es una lista vacía, no un error.
