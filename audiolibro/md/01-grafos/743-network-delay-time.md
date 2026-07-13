# 743. Network Delay Time

Dificultad: Media.

## El problema, en palabras simples

Imagina que existen varios nodos, numerados desde el uno hasta un total dado, y que están conectados por conexiones que solamente funcionan en un sentido: de un nodo hacia otro, nunca al revés, y cada conexión tiene un tiempo distinto que tarda en atravesarse. Nos dicen desde qué nodo se envía una señal inicial. Lo que se pide es calcular cuánto tiempo tiene que pasar para que esa señal termine llegando a absolutamente todos los nodos, tomando siempre el camino más rápido posible para llegar a cada uno; y si existe algún nodo al que la señal jamás pueda llegar, la respuesta correcta es indicar que resulta imposible.

## La idea central

Imagina que quieres avisarle una noticia urgente a todo un equipo de trabajo, y decides llamar primero a una sola persona. Esa persona, en cuanto recibe la llamada, empieza a llamar a sus propios contactos, y cada uno de ellos, apenas se entera, llama a los suyos. El detalle importante es que no todas las llamadas duran lo mismo: unas personas contestan y transmiten el mensaje casi al instante, y otras se tardan bastante en contestar el teléfono. Lo que queremos saber es en qué momento exacto se entera la última persona del equipo, porque ese es el momento en que podemos decir que todo el equipo ya está al tanto. La clave para resolver esto bien es no avanzar simplemente "por número de llamadas", sino siempre atender primero, entre todas las llamadas pendientes, a la persona que se va a enterar más temprano en el tiempo real. Para lograr eso usamos una fila de espera muy particular, que en lugar de atender en el orden en que llegaron las llamadas, siempre dejar pasar primero a quien tiene el tiempo de espera más corto; a esa fila de espera especial se le llama min-heap, o cola de prioridad, y a la técnica completa de ir confirmando, uno por uno, el tiempo más rápido posible de enterarse de cada persona, se le conoce como el algoritmo de Dijkstra.

## Cómo funciona el algoritmo, paso a paso

Primero, guardamos, para cada nodo, el mejor tiempo conocido hasta ahora en que la señal podría llegar a él. Al inicio, no sabemos absolutamente nada, así que le asignamos a cada nodo un tiempo enorme que representa "todavía no tengo ni idea", excepto al nodo de donde sale la señal original, al cual le asignamos tiempo cero, porque ahí la señal ya está presente desde el principio.

Después, colocamos ese nodo inicial, junto con su tiempo cero, dentro de la cola de prioridad especial que siempre entrega primero al elemento con el tiempo más pequeño.

Mientras la cola de prioridad no esté vacía, sacamos de ella al nodo que tiene el tiempo más pequeño en ese momento. Antes de hacer cualquier otra cosa, comparamos ese tiempo con el que tenemos guardado como el mejor conocido para ese nodo; si el tiempo con el que salió de la cola ya es peor que uno que encontramos después por otro camino, simplemente lo descartamos y seguimos con el siguiente de la fila, porque esa entrada ya quedó obsoleta.

Si el tiempo sigue siendo válido, entonces revisamos, uno por uno, todos los nodos a los que este nodo actual tiene una conexión directa de salida. Para cada uno de esos vecinos, calculamos cuánto tardaría la señal en llegar a él si pasara justo por el nodo actual, sumando el tiempo acumulado hasta aquí más el tiempo que dura esa conexión en particular. Si ese tiempo calculado resulta menor al mejor tiempo que teníamos guardado para ese vecino, actualizamos su tiempo con este valor mejor, y lo agregamos también a la cola de prioridad, para que más adelante, cuando le toque su turno, también pueda intentar mejorar el tiempo de sus propios vecinos. A esta operación de encontrar un camino mejor y actualizar el valor guardado se le llama relajar una conexión.

Este proceso continúa, sacando siempre al nodo con el menor tiempo pendiente, hasta que la cola de prioridad se queda completamente vacía. La razón por la que este método funciona correctamente es que, como ninguna conexión tarda un tiempo negativo, la primera vez que un nodo sale de la cola con un tiempo válido, ese tiempo ya es definitivo: cualquier otro camino alternativo tendría que pasar por nodos que se enteran igual o más tarde, y sumarle tiempo adicional solamente empeoraría el resultado, nunca lo mejoraría.

Al final, revisamos el tiempo guardado para cada uno de los nodos. Si algún nodo se quedó con ese tiempo enorme inicial, significa que la señal nunca logró llegar hasta él, así que la respuesta es que resulta imposible. Si, en cambio, todos los nodos terminaron con un tiempo real y concreto, la respuesta es el mayor de todos esos tiempos, porque el equipo completo solamente termina de enterarse hasta que se entera la persona más lenta de todas.

## Por qué esta complejidad

En cuanto al tiempo, revisamos cada conexión del sistema al menos una vez para intentar relajarla, y cada vez que un nodo entra o sale de la cola de prioridad, mantener esa fila ordenada tiene un costo pequeño que crece muy lentamente conforme aumenta el número de nodos. En términos generales, el trabajo total es casi tan rápido como recorrer todas las conexiones una sola vez, con un costo extra pequeño por mantener siempre ordenada la fila de espera según el tiempo más próximo.

En cuanto al espacio, necesitamos guardar el mejor tiempo conocido para cada nodo, la lista de conexiones que sale de cada nodo, y el contenido de la cola de prioridad en un momento dado, así que el espacio usado crece con el número de nodos más el número de conexiones del sistema.

## Errores comunes y tips de entrevista

Un error muy común es pensar que el camino con menos llamadas o menos conexiones es siempre el más rápido en tiempo real; eso solo es cierto cuando todas las conexiones tardan exactamente lo mismo, pero aquí cada conexión tiene su propio tiempo, así que hay que comparar siempre el tiempo acumulado real, no la cantidad de pasos.

Otro error frecuente es olvidar descartar las entradas obsoletas que quedan dentro de la cola de prioridad; como un mismo nodo puede entrar varias veces a la fila con distintos tiempos conforme se van encontrando caminos mejores, hay que comparar siempre el tiempo con el que sale contra el mejor tiempo confirmado hasta ese momento, y si ya no coincide, se ignora esa entrada.

También conviene explicar en voz alta por qué el algoritmo necesita que ninguna conexión tenga un tiempo negativo: la garantía de que "la primera vez que confirmamos un nodo, su tiempo ya es el definitivo" depende completamente de que sumar más conexiones nunca pueda hacer que un camino se vuelva más corto. Si existieran tiempos negativos, esa garantía se rompe, y haría falta un algoritmo distinto, conocido como Bellman-Ford.

Por último, no olvides los casos extremos: si solo existe un nodo, la señal ya está ahí desde el principio y el tiempo es cero; si existe algún nodo al que ninguna conexión llega, ese nodo nunca podrá enterarse sin importar cuánto tiempo pase, y la respuesta correcta es indicar que resulta imposible.
