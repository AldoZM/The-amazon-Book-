# 133. Clone Graph

Dificultad: Media.

## El problema, en palabras simples

Nos dan un nodo cualquiera de un grafo no dirigido, donde todos los nodos están conectados entre sí de alguna forma, sin ningún nodo aislado. Cada nodo tiene un valor y una lista de nodos vecinos con los que está directamente conectado. Lo que se pide es construir una copia completamente nueva de todo ese grafo, empezando desde el nodo que nos dieron: cada nodo de la copia tiene que ser un objeto distinto, recién creado, pero con el mismo valor que su nodo original correspondiente, y conectado exactamente a las mismas copias que reflejan las conexiones del grafo original. No basta con señalar hacia los nodos originales, hay que fabricar nodos nuevos de verdad.

## La idea central

Imagina que tienes dibujado un grupo de amigos, unidos por líneas que muestran quién conoce a quién, y te piden hacer una copia completa de ese grupo: personas nuevas, de carne y hueso, con los mismos nombres y exactamente las mismas amistades que las personas originales. A eso se le llama una copia profunda, porque no vale con señalar a los amigos que ya existen, hay que crear a cada uno desde cero. Para recorrer el grupo entero, usamos Depth-First Search, que consiste en meternos por un amigo, luego por un amigo de ese amigo, y así sucesivamente hasta el fondo, antes de regresar a explorar otras amistades. El problema es que las amistades casi siempre forman ciclos: si Ana conoce a Beto y Beto conoce a Ana, y no tenemos ningún cuidado especial, terminaríamos clonando a Ana, después a Beto, después a Ana otra vez, después a Beto otra vez, sin parar nunca. La solución es llevar una especie de libreta de contactos que va anotando, para cada persona original, cuál es la copia que ya le hicimos. En cuanto empezamos a clonar a alguien, apuntamos su copia en la libreta de inmediato, incluso antes de ponernos a visitar a sus amigos; así, si en algún momento volvemos a toparnos con esa misma persona por otro camino, en vez de crearla de nuevo simplemente consultamos la libreta y reutilizamos la copia que ya hicimos.

## Cómo funciona el algoritmo, paso a paso

Primero revisamos si el nodo que nos dieron para empezar está vacío. Si el grafo entero está vacío, la copia también debe estar vacía, así que ahí termina el proceso.

Si sí hay un nodo de inicio, preparamos nuestra libreta de contactos vacía, que va a relacionar cada nodo original con la copia que le corresponde, y arrancamos el proceso de clonado desde ese nodo inicial.

El proceso de clonar un nodo funciona así: primero preguntamos en la libreta si este nodo original ya tiene una copia hecha. Si ya la tiene, devolvemos directamente esa copia guardada, sin crear nada nuevo. Este chequeo es justamente lo que evita que nos quedemos dando vueltas en un ciclo para siempre, porque en cuanto reconocemos que ya pasamos por aquí, dejamos de insistir.

Si todavía no tiene copia, creamos un nodo nuevo con el mismo valor que el original, y de inmediato anotamos en la libreta que este nodo original corresponde a esta copia recién creada, antes de tocar siquiera a sus vecinos. Anotarlo tan pronto es fundamental, porque si algún vecino nos lleva de regreso a este mismo nodo mientras seguimos explorando, la libreta ya tendrá la respuesta lista y no entraremos en un bucle infinito.

Después, recorremos uno por uno a los vecinos del nodo original. Para cada vecino, repetimos exactamente este mismo proceso de clonado, y agregamos la copia que resulte a la lista de vecinos de nuestra copia actual. De este modo, la copia va quedando conectada exactamente a las mismas copias que reflejan las conexiones del grafo original.

Cuando terminamos de procesar a todos los vecinos, devolvemos la copia ya completamente armada, con su valor y todos sus vecinos correctamente conectados. Al terminar de clonar el nodo inicial, tenemos entre manos la raíz de una copia completa de todo el grafo.

## Por qué esta complejidad

En cuanto al tiempo, tocamos cada nodo del grafo exactamente una vez, gracias a la libreta que evita que lo volvamos a procesar, y además recorremos cada conexión entre dos nodos también una sola vez, al momento de construir la lista de vecinos de cada copia. Como no hay forma de copiar el grupo entero sin al menos mirar una vez cada persona y cada amistad, el trabajo total crece de forma proporcional a la cantidad de nodos más la cantidad de conexiones entre ellos.

En cuanto al espacio, la libreta guarda una entrada por cada nodo del grafo, y a eso hay que sumarle el espacio que ocupan las llamadas mientras la exploración está en marcha, que en el peor de los casos también puede llegar a ser proporcional a la cantidad de nodos.

## Errores comunes y tips de entrevista

El error más típico, con diferencia, es anotar la copia de un nodo en la libreta después de haber recorrido a sus vecinos, en lugar de anotarla antes. Como el grafo es no dirigido, casi siempre existe algún ciclo, y si anotas la copia demasiado tarde, la exploración puede volver a toparse con ese mismo nodo antes de que la libreta sepa que ya tiene copia, y eso provoca que la exploración se repita para siempre sin nunca terminar.

Otro punto que vale la pena mencionar en la entrevista es que existe una versión alternativa usando Breadth-First Search en lugar de Depth-First Search: la idea de la libreta de contactos es exactamente la misma, pero en vez de ir metiéndose por un amigo tras otro, se usa una cola para ir procesando nodo por nodo en oleadas. Esta versión resulta útil cuando te preocupa que el grafo sea tan grande que las llamadas repetidas de la exploración profunda puedan agotar la memoria disponible.

También hay que tener presentes los casos raros: si el nodo que nos dan para empezar está vacío, la respuesta correcta es devolver también un grafo vacío; si el grafo tiene un solo nodo sin ningún vecino, la copia debe ser igual de simple, un solo nodo también sin vecinos.

Por último, en una entrevista de Amazon es buena señal comprobar, o al menos mencionar en voz alta, que las copias son objetos genuinamente nuevos y no simples apodos que apuntan al mismo lugar que el original: si comparas las direcciones de memoria del nodo original y de su copia, deben ser distintas, aunque los valores y las conexiones sean idénticos.
