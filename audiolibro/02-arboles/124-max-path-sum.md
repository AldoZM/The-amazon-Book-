# 124. Binary Tree Maximum Path Sum

Dificultad: Difícil.

## El problema, en palabras simples

Te dan un árbol binario donde los valores de los nodos pueden ser positivos, negativos, o cero. Un camino, en este problema, es cualquier secuencia de nodos donde cada par de nodos consecutivos está conectado directamente por una arista, y ningún nodo se repite dentro del mismo camino. El camino no tiene que empezar en la raíz, ni tiene que terminar en una hoja: puede empezar en cualquier nodo y terminar en cualquier otro, siempre y cuando exista una forma de ir de uno al otro sin repetir nodos. Lo que se pide es encontrar, entre todos los caminos posibles del árbol, aquel cuya suma de valores sea lo más grande posible, y devolver esa suma.

## La idea central

Piensa en cada nodo del árbol como una parada de una línea de camiones, y cada parada tiene asociada una ganancia o una pérdida de dinero: algunas paradas te dan dinero, otras te lo quitan. Quieres armar la ruta, entre paradas conectadas, que te deje la mayor ganancia posible, y puedes empezar y terminar tu recorrido en cualquier parada. Ahora, párate mentalmente en cada parada del mapa, una por una, y hazte dos preguntas distintas. La primera pregunta es: si mi recorrido va a seguir extendiéndose hacia arriba, hacia la parada anterior a mí, ¿cuánto es lo máximo que puedo aportarle bajando por una sola de mis dos ramas hacia abajo? Solo puedo ofrecer una rama, porque un recorrido que sigue subiendo no puede partirse en dos direcciones a la vez. La segunda pregunta es distinta: si mi recorrido hiciera una vuelta en forma de U justo aquí, usando mis dos ramas al mismo tiempo y sin seguir subiendo más allá de mí, ¿cuánto sumaría en total? La respuesta a la primera pregunta es lo que le heredas a la parada de arriba para que ella siga construyendo su propio recorrido. La respuesta a la segunda pregunta nunca se hereda a nadie, solo sirve para comparar contra la mejor ganancia que llevamos vista hasta el momento en todo el mapa, por si esta parada resulta ser el punto donde en realidad vive el mejor recorrido posible.

## Cómo funciona el algoritmo, paso a paso

Guardamos una variable con la mejor suma encontrada hasta ahora, y la inicializamos con el número más pequeño posible, para que cualquier suma real, incluso una negativa, pueda superarla.

Definimos un proceso que recibe un nodo, y que primero se aplica a sí mismo sobre el hijo izquierdo de ese nodo, y luego sobre el hijo derecho, antes de calcular nada sobre el nodo actual. Es decir, primero resolvemos completamente lo que cuelga por abajo, y hasta el final procesamos al nodo de arriba; a este orden se le llama post-order.

Cuando llegamos a un nodo que no existe, simplemente devolvemos cero, porque una rama vacía no aporta nada al recorrido.

Cuando llegamos a un nodo real, primero le preguntamos a su hijo izquierdo cuál es la mejor ganancia que puede aportar hacia arriba, y hacemos lo mismo con el hijo derecho. Si cualquiera de esas dos ganancias resulta negativa, la reemplazamos por cero, porque nunca conviene extender un recorrido metiendo una rama que en lugar de sumar, resta; en ese caso, simplemente no la usamos.

Con esas dos ganancias ya calculadas, formamos un candidato: el valor del nodo actual, más la ganancia de su rama izquierda, más la ganancia de su rama derecha, las dos al mismo tiempo, como si el recorrido diera la vuelta justo en este nodo. Comparamos este candidato contra la mejor suma encontrada hasta ahora, y si el candidato es mayor, actualizamos la mejor suma.

Después de eso, lo que este nodo le devuelve hacia arriba, hacia quien lo llamó, es distinto del candidato que acabamos de calcular: le devuelve el valor del propio nodo más la mayor de las dos ganancias de sus ramas, nunca las dos juntas, porque un recorrido que sigue subiendo hacia el padre solo puede continuar por un único lado.

Repetimos este proceso para todos los nodos del árbol, subiendo desde las hojas hasta la raíz. Al terminar de procesar el árbol completo, la mejor suma que quedó guardada es la respuesta final.

## Por qué esta complejidad

En cuanto al tiempo, visitamos cada nodo del árbol exactamente una vez, y en cada nodo hacemos solamente un puñado de comparaciones y sumas, así que el trabajo total crece de forma proporcional a la cantidad de nodos que tiene el árbol.

En cuanto al espacio, como este proceso se llama a sí mismo bajando por las ramas antes de resolver cada nodo, esas llamadas se van apilando mientras están activas. La cantidad máxima de llamadas apiladas al mismo tiempo nunca es mayor que la altura del árbol, es decir, cuántos pisos hay desde la raíz hasta el nodo más profundo. En un árbol muy parejo esa altura es pequeña comparada con la cantidad de nodos, pero en un árbol muy desbalanceado, que parece casi una fila, la altura puede llegar a ser tan grande como la cantidad total de nodos.

## Errores comunes y tips de entrevista

El error más común es confundir las dos cantidades que se calculan en cada nodo: lo que se devuelve hacia el padre debe usar solamente la mejor de las dos ramas, nunca las dos sumadas, porque un recorrido que sigue subiendo no se puede partir en dos direcciones. Si por accidente devuelves la suma de ambas ramas hacia arriba, terminas contando recorridos que en realidad no son válidos, porque estarían pasando dos veces por el mismo nodo padre en direcciones distintas.

Otro error es olvidar que la respuesta final puede ser negativa. Si el árbol completo tiene un único nodo con un valor negativo, ese es el único recorrido posible, y la respuesta correcta es ese valor negativo, no cero. Por eso la mejor suma se debe inicializar con el número más pequeño posible, y nunca forzarla a empezar en cero.

También es fácil olvidar por qué se descarta una rama cuando su ganancia sale negativa: no es que esa rama no exista, es que sumarla al recorrido solo empeoraría el resultado, así que es mejor tratarla como si aportara cero y simplemente no extender el recorrido hacia ese lado.

Vale la pena decir en voz alta, antes de programar, que este problema necesita resolverse en post-order, es decir, resolviendo primero a los hijos y hasta el final al nodo actual, porque cada nodo necesita conocer la ganancia de sus dos ramas antes de poder calcular su propio candidato y su propia respuesta hacia el padre.

Por último, conviene mencionar casos raros antes de que te los pregunten: un árbol de un solo nodo, un árbol donde todos los valores son negativos, y una rama completa cuyos valores conviene ignorar por completo porque restarían al resultado en lugar de sumarle.
