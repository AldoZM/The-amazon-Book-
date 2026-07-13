# 84. Largest Rectangle in Histogram

Dificultad: Difícil.

## El problema, en palabras simples

Nos dan una fila de barras verticales, todas paradas sobre la misma línea, cada una con su propia altura y todas con el mismo ancho. Queremos encontrar el rectángulo más grande que se pueda dibujar apoyado sobre esa línea, usando un tramo continuo de esas barras, sabiendo que la altura del rectángulo queda limitada por la barra más baja del tramo que elijamos.

## La idea central

Imagina un estante lleno de libros parados uno junto a otro, con distintos grosores y alturas, vistos como una fila de barras. Quieres apoyar una tabla horizontal encima de un tramo de esos libros, pero la tabla solo puede llegar tan alto como el libro más bajo que toque, porque si un libro es más bajo, la tabla se hunde hasta ahí en ese punto. La pregunta es qué tramo de libros, y a qué altura, te da la tabla con más área posible.

Para resolver esto de forma eficiente usamos una pila, pero una pila especial que llamamos pila monótona, o monotonic stack en inglés: es una pila donde, si la miras de abajo hacia arriba, las alturas de las barras que contiene siempre van en aumento. En cuanto llega una barra nueva que es más baja que la que está en la punta de la pila, sabemos que esa barra de la punta ya llegó a su límite: no puede seguir extendiéndose hacia la derecha, porque la barra nueva la corta. Ese es justo el momento de calcular qué tan grande hubiera sido el rectángulo que tenía a esa barra de la punta como su altura.

## Cómo funciona el algoritmo, paso a paso

Primero, preparamos una pila vacía donde vamos a guardar posiciones de barras, no las alturas directamente, y un valor para recordar el área más grande encontrada, que arranca en cero.

Luego, recorremos las barras de izquierda a derecha, y al final agregamos una barra imaginaria de altura cero, como un centinela que nos va a obligar a revisar todo lo que quedó pendiente en la pila cuando terminemos de recorrer las barras reales.

Para cada barra que vamos procesando, comparamos su altura contra la altura de la barra que está en la punta de la pila. Mientras la barra de la punta sea igual o más alta que la barra actual, quiere decir que esa barra de la punta ya no puede crecer más hacia la derecha, así que la sacamos de la pila para calcular su rectángulo.

Para calcular ese rectángulo, la altura es la altura de la barra que acabamos de sacar. El ancho se calcula mirando qué quedó en la nueva punta de la pila después de sacarla: si la pila quedó vacía, quiere decir que esa barra era la más baja de todas las que llevábamos hasta este punto, así que su rectángulo se extiende desde el principio hasta la posición actual. Si en cambio quedó algo en la pila, el rectángulo se extiende desde justo después de esa barra que quedó abajo, hasta la posición actual, sin incluirla.

Multiplicamos esa altura por ese ancho, y si el resultado es mayor que el área más grande que llevábamos guardada, la actualizamos.

Repetimos esta comparación con la nueva punta de la pila, sacando barras una tras otra mientras sigan siendo iguales o más altas que la barra actual. Cuando ya no hay más que sacar, metemos la posición de la barra actual a la pila y seguimos avanzando a la siguiente barra.

Cuando llegamos a la barra imaginaria de altura cero al final, este proceso obliga a que se saquen todas las barras que quedaban pendientes en la pila, así que ninguna se queda sin evaluar. El área más grande que quedó guardada al terminar es la respuesta.

## Por qué esta complejidad

En cuanto al tiempo, aunque el proceso tiene un ciclo dentro de otro ciclo, cada barra entra a la pila una sola vez y sale de la pila, como máximo, también una sola vez. Como ninguna barra se mete o se saca más de una vez, el trabajo total termina siendo proporcional a la cantidad de barras, no al cuadrado de esa cantidad, aunque a primera vista el ciclo anidado pueda parecer más costoso.

En cuanto al espacio, lo que ocupa memoria es la pila misma, que guarda posiciones de barras. En el peor de los casos, si las barras vienen ordenadas de menor a mayor de principio a fin, ninguna se saca hasta el final, y la pila llega a contener todas las posiciones al mismo tiempo, así que el espacio también es proporcional a la cantidad de barras.

## Errores comunes y tips de entrevista

Un error común es intentar resolver este problema con fuerza bruta, expandiéndose desde cada barra hacia los lados hasta encontrar algo más bajo; esa versión funciona pero es mucho más lenta, y suele ser el punto de partida natural antes de descubrir la versión con pila monótona, así que vale la pena mencionarla primero y luego explicar por qué se puede mejorar.

Otro error frecuente es calcular mal el ancho del rectángulo al sacar una barra de la pila: hay que usar la posición que quedó en la nueva punta de la pila después de sacarla, no la posición de la barra que se acaba de sacar, porque esa posición inferior es la verdadera barrera por la izquierda.

También es fácil olvidar la barra imaginaria de altura cero al final, y ese olvido deja sin evaluar el rectángulo de las barras que quedaron pendientes si el histograma termina subiendo de altura; conviene mencionar explícitamente ese detalle en la entrevista, junto con los casos límite de una fila vacía o de una sola barra.
