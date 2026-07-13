# 695. Max Area of Island

Dificultad: Media.

## El problema, en palabras simples

Imagina, otra vez, un mapa dibujado en una cuadrícula, donde cada casilla es tierra o es agua. Un grupo de casillas de tierra forma una isla si están conectadas entre sí por arriba, por abajo, por la izquierda o por la derecha, sin contar las conexiones en diagonal. El área de una isla es simplemente el número de casillas de tierra que la forman. Lo que se pide, esta vez, no es contar cuántas islas hay, sino encontrar el área de la isla más grande de todo el mapa. Si el mapa no tiene absolutamente nada de tierra, la respuesta correcta es cero.

## La idea central

Piensa en un agrimensor que camina sobre un mapa enorme midiendo terrenos, y cada vez que pisa un pedazo de tierra que todavía no ha medido, se pone a caminar por toda esa parcela conectada, contando cuántos metros cuadrados tiene en total, hasta llegar a sus límites. En cuanto termina de medir una parcela completa, la marca en su libreta para no volver a medirla por accidente, y compara el tamaño que acaba de medir contra el terreno más grande que ha encontrado hasta el momento, quedándose siempre con el mayor de los dos. Así, en lugar de intentar comparar todas las parcelas entre sí de golpe, el agrimensor solo necesita recorrer el mapa una sola vez, midiendo cada parcela exactamente cuando la descubre por primera vez.

## Cómo funciona el algoritmo, paso a paso

Primero, recorremos el mapa completo, casilla por casilla, de arriba hacia abajo y de izquierda a derecha, y mantenemos guardado un número que representa el área máxima encontrada hasta el momento, empezando en cero.

Cada vez que llegamos a una casilla de tierra que todavía no ha sido medida, mandamos a nuestro agrimensor a medir la parcela completa conectada a esa casilla, usando un recorrido en profundidad, conocido también como Depth-First Search, o DFS: es una función que se llama a sí misma para seguir avanzando por los vecinos, como si fuera una fila de fichas de dominó que se van empujando unas a otras.

Cuando el agrimensor llega a una casilla, primero revisa si esa posición se sale de los límites del mapa, o si es agua, o si ya fue medida antes; en cualquiera de esos tres casos, no suma nada y se detiene ahí mismo. Si la casilla, en cambio, sí es tierra sin medir, la marca de inmediato como ya visitada —convirtiéndola, en la práctica, en agua para que nadie vuelva a contarla—, y suma uno al área de la parcela, correspondiente a esa misma casilla.

Después, desde esa misma casilla, el agrimensor se llama a sí mismo hacia sus cuatro vecinas: la de arriba, la de abajo, la de la izquierda y la de la derecha, y suma a su cuenta todo lo que cada una de esas llamadas le devuelva. De esta manera, la parcela se va midiendo como una ola que se extiende en las cuatro direcciones, hasta que ya no encuentra más tierra sin marcar conectada a ella.

Cuando el agrimensor termina de medir la parcela completa, ese total es el área de esa isla. Comparamos esa área contra el máximo que llevábamos guardado, y si es mayor, actualizamos el récord. Después seguimos recorriendo el mapa desde donde nos habíamos quedado, buscando la siguiente casilla de tierra sin medir.

Al terminar de recorrer el mapa completo, el número que quedó guardado como récord es la respuesta final.

## Por qué esta complejidad

En cuanto al tiempo, cada casilla del mapa se visita como máximo una vez para revisar si es tierra o agua, y cada casilla de tierra se mide y se marca una sola vez, porque en cuanto el agrimensor la marca, deja de contar para el resto del recorrido. Entonces, el trabajo total depende únicamente de cuántas casillas tiene el mapa, es decir, filas multiplicado por columnas.

En cuanto al espacio, como vamos marcando la tierra ya medida directamente sobre el propio mapa, convirtiéndola en agua, no necesitamos una estructura aparte para recordar qué casillas visitamos. Sin embargo, como la medición avanza llamándose a sí misma repetidamente para explorar cada vecina, esas llamadas pendientes sí ocupan espacio mientras siguen activas, y en el peor de los casos —un mapa que es una sola isla gigante que ocupa todo el terreno— ese espacio puede llegar a ser tan grande como el mapa completo.

## Errores comunes y tips de entrevista

Un error frecuente es olvidar marcar la casilla como visitada en el mismo instante en que se descubre, antes de seguir explorando sus vecinas; si se marca demasiado tarde, es fácil terminar contando la misma casilla más de una vez, o incluso entrar en un ciclo que nunca termina.

Otro error es confundir este problema con contar el número total de islas, en lugar de encontrar el área de la más grande; ambos problemas usan exactamente la misma técnica de recorrido, pero lo que se acumula y se compara es distinto, así que conviene tener muy claro, antes de programar, qué es lo que realmente se está sumando en cada llamada.

También vale la pena mencionar, en la entrevista, que modificar el mapa original para marcar la tierra visitada es válido aquí porque el problema no pide conservarlo intacto; si el entrevistador aclara que no se puede modificar la entrada original, entonces hace falta usar una estructura aparte para llevar el registro de las casillas visitadas, o resolver el problema con una cola en lugar de llamadas que se repiten a sí mismas.

Por último, recuerda cubrir los casos extremos: un mapa completamente de agua debe devolver un área máxima de cero, un mapa con una sola casilla de tierra debe devolver uno, y un mapa donde toda la cuadrícula es tierra debe devolver el total de casillas del mapa, porque en ese caso solo existe una isla gigante que lo cubre todo.
