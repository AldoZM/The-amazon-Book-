# 1091. Shortest Path in Binary Matrix

Dificultad: Media.

## El problema, en palabras simples

Imagina una cuadrícula cuadrada donde cada casilla tiene un cero o un uno. Un cero significa que la casilla está libre y se puede pisar; un uno significa que está bloqueada. Queremos ir de la esquina superior izquierda de la cuadrícula hasta la esquina inferior derecha, pisando únicamente casillas libres. A diferencia de otros problemas de cuadrículas, aquí sí podemos movernos en diagonal, así que desde cualquier casilla podemos avanzar hacia las ocho casillas que la rodean: arriba, abajo, izquierda, derecha, y las cuatro diagonales. La longitud del camino se mide contando cuántas casillas se pisaron en total, incluyendo la de salida y la de llegada. Lo que se pide es encontrar la longitud del camino más corto posible, o decir que resulta imposible si ninguna ruta libre conecta ambas esquinas.

## La idea central

Piensa en dejar caer una piedra en el centro de un estanque y observar cómo se expande el círculo de ondas hacia afuera, un anillo a la vez, tocando primero lo que está cerca y después lo que está lejos. Si sueltas la piedra exactamente en la esquina de salida y dejas que la onda se expanda por todas las casillas libres, la primera vez que esa onda toque la esquina de llegada, lo habrá hecho recorriendo la distancia más corta posible. No hay forma de que la onda llegue antes por otro camino, porque una onda que avanza de forma pareja siempre toca las casillas cercanas antes que las lejanas.

Como aquí el movimiento permite las ocho direcciones, es literalmente el mismo movimiento que hace el rey en el ajedrez: puede avanzar una casilla hacia cualquiera de sus ocho vecinas. Entonces la estrategia es soltar esa onda desde la esquina de salida y dejar que se propague usando ese movimiento de rey, capa por capa, hasta que toque la esquina de llegada o hasta que ya no le queden casillas nuevas por tocar.

## Cómo funciona el algoritmo, paso a paso

Primero, revisamos si la esquina de salida o la esquina de llegada están bloqueadas. Si cualquiera de las dos lo está, sabemos de inmediato que resulta imposible, y ahí termina todo.

Si ambas están libres, preparamos una fila de espera donde vamos a ir metiendo las casillas que la onda va tocando, respetando el orden en que llegaron: la primera casilla que entra es la primera que se procesa. Metemos ahí la esquina de salida, y le anotamos que su longitud de camino, hasta ahora, es de una sola casilla, porque ella misma ya cuenta.

Luego empezamos a procesar la fila de espera por capas. Cada capa representa un paso más de la onda. En cada capa, contamos cuántas casillas hay actualmente esperando en la fila, y esa cantidad nos dice cuántas casillas pertenecen a este paso de la onda. Sacamos justamente esa cantidad de casillas, una por una, y para cada una revisamos sus ocho vecinas.

Cuando una vecina existe dentro de la cuadrícula, está libre, y todavía no ha sido tocada por la onda antes, la marcamos como tocada para no volver a procesarla nunca más, le anotamos que su longitud de camino es la longitud de la casilla actual más una casilla adicional, y la metemos al final de la fila de espera para que forme parte de la siguiente capa.

Justo antes de sacar cualquier casilla de la fila, revisamos si esa casilla es la esquina de llegada. En cuanto la sacamos, si resulta ser la esquina de llegada, devolvemos inmediatamente su longitud de camino anotada, porque esa es la respuesta: la primera vez que la onda toca el destino es por el camino más corto.

Este proceso continúa, capa tras capa, hasta que o bien alcanzamos la esquina de llegada, o bien la fila de espera se vacía por completo sin que eso haya pasado. Si se vacía sin éxito, significa que la esquina de llegada estaba completamente aislada del resto por casillas bloqueadas, y la respuesta es que resulta imposible.

## Por qué esta complejidad

En cuanto al tiempo, cada casilla de la cuadrícula entra a la fila de espera como máximo una sola vez, porque en cuanto la marcamos como tocada nunca la volvemos a considerar. Como revisamos cada casilla y sus ocho vecinas una sola vez, el trabajo total depende de cuántas casillas tiene la cuadrícula en total, es decir, del número de filas multiplicado por el número de columnas.

En cuanto al espacio, en el peor de los casos la fila de espera puede llegar a contener una cantidad de casillas comparable al tamaño completo de la cuadrícula, así que el espacio necesario también depende del número de filas multiplicado por el número de columnas.

## Errores comunes y tips de entrevista

Un error frecuente es intentar resolver este problema explorando un solo camino hasta el fondo antes de probar otro, en lugar de expandirse por capas parejas. Ese enfoque puede encontrar algún camino válido, pero no garantiza que sea el más corto, porque no respeta la idea de tocar primero lo cercano y después lo lejano.

Otro error común es olvidar alguna de las ocho direcciones de movimiento, especialmente las diagonales, ya que en muchos otros problemas de cuadrículas solo se permiten cuatro direcciones y es fácil copiar ese hábito por costumbre.

También es importante marcar cada casilla como tocada en el momento exacto en que la metemos a la fila de espera, no cuando la sacamos. Si te tardas en marcarla, la misma casilla puede terminar entrando varias veces a la fila, lo cual desperdicia trabajo y puede complicar el conteo de capas.

En la entrevista, vale la pena mencionar de entrada los casos raros: que la esquina de salida o la de llegada estén bloqueadas desde el principio, lo cual da una respuesta inmediata de imposible, y el caso de una cuadrícula de una sola casilla libre, donde la respuesta correcta es que la longitud del camino es uno, porque no hace falta moverse a ningún lado.

Por último, si en la entrevista te preguntan qué pasaría si cada casilla tuviera un costo distinto de cruzar en lugar de valer todas lo mismo, es buen momento para mencionar que ahí ya no bastaría con la onda simple, y habría que recurrir a técnicas que sí toman en cuenta pesos distintos entre casillas.
