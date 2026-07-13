# 987. Vertical Order Traversal of a Binary Tree

Dificultad: Difícil.

## El problema, en palabras simples

Imagina que dibujas un árbol binario sobre una hoja cuadriculada. La raíz del árbol se coloca en una columna central y en la fila más alta. Cada vez que bajas hacia un hijo izquierdo, te mueves una columna hacia la izquierda y una fila hacia abajo; cada vez que bajas hacia un hijo derecho, te mueves una columna hacia la derecha y una fila hacia abajo. Lo que se pide es devolver los valores de todos los nodos agrupados por columna, empezando por la columna más a la izquierda y terminando en la más a la derecha. Dentro de cada columna, los valores deben quedar ordenados de la fila más alta a la más baja. Y si dos nodos distintos terminan cayendo exactamente en la misma columna y en la misma fila, hay que desempatar poniendo primero el que tenga el valor numérico más pequeño.

## La idea central

Piensa en organizar una foto grupal enorme, donde a cada persona ya le asignaste una coordenada exacta en el piso: qué tan a la izquierda o a la derecha está parada, y en qué fila está parada respecto al frente. Si quieres anunciar a la gente por columnas de izquierda a derecha, y dentro de cada columna por fila, lo más simple no es tratar de caminar por el piso siguiendo algún patrón especial; lo más simple es escribir en una tarjeta la posición de cada persona junto con su nombre, juntar todas las tarjetas, y después ordenarlas. Si ordenas primero por columna, luego por fila, y luego por nombre en caso de empate, obtienes exactamente el orden que se pide, sin importar en qué orden hayas ido recolectando las tarjetas al principio. La parte que hace este problema más difícil que su versión más sencilla es justamente ese último desempate: cuando dos personas terminan exactamente en el mismo lugar del piso, hay que decidir con una regla clara quién se anuncia primero, y esa regla es el valor más pequeño.

## Cómo funciona el algoritmo, paso a paso

El proceso se divide en dos fases separadas: primero recolectar, después ordenar.

En la fase de recolección, recorremos el árbol completo, y a cada nodo que visitamos le asignamos tres datos: su columna, su fila, y su valor. La raíz arranca en la columna cero y la fila cero. Cuando avanzamos hacia el hijo izquierdo de un nodo, la columna de ese hijo es la columna del padre menos uno, y la fila del hijo es la fila del padre más uno. Cuando avanzamos hacia el hijo derecho, la columna del hijo es la columna del padre más uno, y la fila también es la fila del padre más uno. No importa si este recorrido lo hacemos bajando profundo primero o nivel por nivel, el resultado de la recolección es el mismo: una lista con la tarjeta de cada nodo del árbol.

Cuando terminamos de recolectar todas las tarjetas, pasamos a la fase de ordenamiento. Ordenamos la lista completa de tarjetas usando tres criterios en este orden de prioridad: primero por columna, de menor a mayor; cuando dos tarjetas tienen la misma columna, se desempata por fila, también de menor a mayor; y cuando dos tarjetas comparten columna y fila, el desempate final es por el valor del nodo, de menor a mayor.

Una vez que la lista completa quedó ordenada con ese criterio, la recorremos de principio a fin y vamos agrupando los valores que comparten la misma columna. Cada vez que la columna cambia respecto a la tarjeta anterior, comenzamos un grupo nuevo; mientras la columna se mantenga igual, seguimos agregando valores al grupo actual.

Al terminar de recorrer toda la lista ordenada, los grupos que formamos, en el orden en que los fuimos creando, son exactamente la respuesta que se pide.

## Por qué esta complejidad

En cuanto al tiempo, recolectar la tarjeta de cada nodo toma un tiempo proporcional a la cantidad total de nodos, porque visitamos cada uno una sola vez. Sin embargo, el paso que domina el tiempo total es el ordenamiento de todas las tarjetas: ordenar una cantidad de elementos no cuesta simplemente mirarlos una vez, cuesta un poco más que eso, un factor adicional que crece muy lentamente conforme aumenta la cantidad de elementos, algo así como el número de veces que se puede partir el montón de tarjetas a la mitad repetidamente.

En cuanto al espacio, necesitamos guardar una tarjeta con tres datos por cada nodo del árbol, así que el espacio usado crece de forma proporcional a la cantidad total de nodos.

## Errores comunes y tips de entrevista

El error más común es asumir que un recorrido normal del árbol, como recorrerlo nivel por nivel, ya entrega los valores en el orden correcto de columnas. Eso es falso, porque en un mismo nivel del árbol pueden aparecer nodos que pertenecen a columnas completamente distintas, mezclados entre sí; solo separando la recolección del ordenamiento se garantiza el resultado correcto.

Otro error frecuente es olvidar por completo la regla de desempate por valor cuando dos nodos coinciden exactamente en columna y en fila. Es fácil pasarla por alto porque en muchos árboles de ejemplo nunca ocurre esa coincidencia, pero cuando sí ocurre, ignorar esa regla produce una respuesta incorrecta y es precisamente el detalle que distingue este problema de su versión más sencilla.

También conviene explicar en la entrevista por qué separar el problema en dos fases, recolectar y luego ordenar, es más limpio que intentar llevar el orden correcto mientras se recorre el árbol: intentar mantener el orden durante el recorrido mismo obligaría a mezclar información de ramas distintas del árbol en tiempo real, lo cual es mucho más complicado que simplemente ordenar todo al final con un criterio de tres niveles.

Por último, vale la pena mencionar el caso de un árbol con un solo nodo, donde la respuesta es simplemente ese único valor en un solo grupo, y notar que este problema es la versión difícil de un problema más sencillo, donde toda la dificultad extra viene de ese desempate por valor.
