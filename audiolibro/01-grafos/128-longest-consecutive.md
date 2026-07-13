# 128. Longest Consecutive Sequence

Dificultad: Media.

## El problema, en palabras simples

Nos dan un montón de números enteros, revueltos y sin ningún orden en particular. Queremos encontrar la secuencia más larga de números que sean consecutivos entre sí, es decir, números que van uno después del otro sin ningún hueco en medio, como por ejemplo tres, cuatro, cinco y seis. No importa en qué orden aparezcan los números dentro del montón original, solo importa si, agrupados, forman una cadena de números seguidos. Lo que se pide es la cantidad de números que tiene esa cadena más larga, y además se exige que la solución sea eficiente: el trabajo debe crecer de forma proporcional a la cantidad de números, no mucho más rápido que eso.

## La idea central

Imagina un patio lleno de niños, cada uno con un número pegado en la playera, pero todos revueltos, sin formarse en ninguna fila. Los niños cuyos números son consecutivos quieren tomarse de la mano y armar una fila ordenada. Nuestro trabajo es encontrar cuál sería la fila más larga que se puede armar con esos niños. El truco para resolver esto sin volvernos locos es no dejar que cualquier niño empiece a contar su fila: solo dejamos que empiece a contar el niño que está al frente de su fila, es decir, aquel que no tiene a nadie con el número justo anterior al suyo. Si un niño tiene el número cuatro y en el patio también hay un niño con el número tres, entonces el del cuatro no es el frente de nada, así que lo dejamos tranquilo y confiamos en que el niño del frente, más adelante en la cadena, será quien haga el conteo completo. De esta manera, cada fila se cuenta una sola vez, empezando siempre desde su verdadero inicio. Para poder preguntar rápidamente si existe un niño con determinado número, guardamos todos los números en una especie de caja mágica donde preguntar si algo está adentro es prácticamente instantáneo, sin tener que revisar uno por uno.

## Cómo funciona el algoritmo, paso a paso

Primero, metemos todos los números del montón dentro de esa caja mágica. Si algún número aparece repetido varias veces, se funde en una sola copia dentro de la caja, y eso no afecta el resultado, porque un número repetido no hace que la fila sea más larga.

Luego, recorremos, uno por uno, cada número distinto que quedó guardado en la caja. Para cada número, lo primero que hacemos es preguntar si existe, dentro de la misma caja, el número que sería justo el anterior a él. Si ese número anterior sí existe, entonces el número que estamos revisando no es el frente de ninguna fila, así que lo dejamos pasar sin hacer nada más con él, porque sabemos que en algún otro momento se contará como parte de la fila de alguien más.

Si en cambio el número anterior no existe dentro de la caja, entonces acabamos de encontrar el frente de una fila nueva. Empezamos a contar desde ahí: preguntamos si existe el número siguiente, y si existe, avanzamos hasta él y seguimos preguntando por el que sigue después de ese, y así sucesivamente, sumando uno a la longitud de la fila cada vez que encontramos un número más que continúa la secuencia. Nos detenemos en cuanto preguntamos por un número que ya no existe dentro de la caja.

Cada vez que terminamos de contar una fila completa desde su frente, comparamos su longitud contra la fila más larga que hayamos encontrado hasta ese momento, y nos quedamos con la mayor de las dos.

Cuando terminamos de revisar todos los números distintos del montón, la fila más larga que hayamos encontrado en el camino es la respuesta final.

## Por qué esta complejidad

En cuanto al tiempo, aunque parezca que cada número podría disparar un conteo larguísimo, en realidad eso solo pasa cuando el número es el frente de su fila. Como cada número pertenece a una única fila y esa fila solamente se recorre completa una vez, desde su frente, la suma de todos los pasos de conteo, sumando todas las filas del patio entero, no puede ser mayor que la cantidad total de números que hay. Entonces cada número se toca cuando mucho un par de veces: una vez para revisar si es el frente de su fila, y como mucho otra vez cuando se cuenta como parte de la fila de su verdadero frente. Por eso el trabajo total crece de forma proporcional a la cantidad de números, ni más ni menos.

En cuanto al espacio, lo único que necesitamos guardar es la caja mágica con todos los números distintos, así que el espacio usado también crece de forma proporcional a la cantidad de números.

## Errores comunes y tips de entrevista

El error más común, con mucha diferencia, es ordenar el montón de números antes de buscar la secuencia. Ordenar sí resuelve el problema correctamente, pero el trabajo de ordenar crece más rápido que de forma proporcional a la cantidad de números, así que no cumple con la exigencia de eficiencia que casi siempre se pide de forma explícita en este problema.

Otro error frecuente es dejar que cualquier número, no solo los que están al frente de su fila, dispare un conteo completo hacia arriba. Si haces eso, una fila muy larga terminaría contándose una y otra vez, una vez por cada uno de sus miembros, y el trabajo total se dispararía muchísimo más de lo permitido. Vale la pena explicar en la entrevista que el filtro de "solo cuenta el que está al frente" es precisamente lo que evita ese trabajo repetido.

También hay que tener cuidado con los números repetidos: como no alargan la fila, conviene usar una estructura que los funda automáticamente en una sola copia, en lugar de contar cuántas veces aparece cada número, que sería trabajo de más sin ningún beneficio.

Por último, no olvides mencionar los casos raros: si el montón de números viene vacío, la respuesta correcta es cero, porque no hay ninguna fila que contar; y los números negativos no representan ningún problema especial, porque al algoritmo no le importa el signo de los números, solamente le importa si un número más es o no el siguiente en la secuencia.
