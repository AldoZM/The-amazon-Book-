# 1094. Car Pooling

Dificultad: Media.

## El problema, en palabras simples

Manejas un coche con un número fijo de asientos disponibles, y siempre avanzas hacia adelante por el camino, nunca hacia atrás. Nos dan una lista de viajes, y cada viaje indica cuántos pasajeros suben, en qué punto del camino suben, y en qué punto se bajan. Lo que se pide es averiguar si en algún momento del recorrido el número de pasajeros dentro del coche supera la capacidad disponible; si eso llega a pasar en cualquier tramo del camino, la respuesta es que no se puede completar el plan, y si nunca pasa, la respuesta es que sí se puede.

## La idea central

Imagina que manejas para una app de viajes compartidos entre compañeros de universidad, y en vez de llevar la cuenta de cada pasajero individualmente, te conviene pensar en el camino como una carretera dividida en kilómetros, donde en cada kilómetro simplemente anotas cuántas personas suben ahí y cuántas se bajan ahí. No necesitas simular el viaje completo pasajero por pasajero: basta con anotar esos cambios netos en cada punto del camino, y después ir sumándolos en orden, de la salida hacia el destino final, para saber en todo momento cuántas personas van sentadas en el coche.

## Cómo funciona el algoritmo, paso a paso

Primero, creamos un registro por cada punto posible del camino, empezando todos en cero, que representa cuántos pasajeros suben o bajan justo ahí.

Después, recorremos la lista de viajes, y por cada uno anotamos en el registro del punto donde suben los pasajeros que se suman ahí, y en el registro del punto donde bajan restamos esa misma cantidad, porque ahí dejan de ocupar un asiento.

Una vez que terminamos de anotar todos los viajes, recorremos el camino completo desde el punto más temprano hasta el más tardío, llevando una cuenta acumulada de pasajeros que va sumando, en cada punto, lo que anotamos en el registro de ese punto.

En cada punto del camino, revisamos si esa cuenta acumulada superó la capacidad del coche. En cuanto eso ocurre en cualquier punto, sabemos que el plan no es viable, y podemos responder de inmediato que no se puede completar.

Si llegamos al final del camino sin que la cuenta acumulada haya superado nunca la capacidad, entonces el plan sí es viable, y respondemos que sí se puede completar.

## Por qué esta complejidad

Anotar los cambios de cada viaje toma un tiempo proporcional al número de viajes, porque cada uno solo requiere dos anotaciones, una donde suben y otra donde bajan. Recorrer después el camino completo para acumular esos cambios toma un tiempo proporcional al rango total de posiciones que puede tener el camino, que en este problema está acotado por un límite fijo, así que en la práctica el algoritmo se comporta como si fuera lineal respecto al número de viajes.

En cuanto al espacio, el registro que usamos tiene un tamaño fijo, determinado por el rango máximo de posiciones del camino, sin importar cuántos viajes nos den, así que el espacio adicional no depende del número de viajes sino de ese rango.

## Errores comunes y tips de entrevista

Un error muy común es restar el cambio de pasajeros en el punto anterior a donde realmente se bajan, pensando que hay que "incluir" el último tramo que ocuparon; pero el enunciado dice que los pasajeros bajan justo en ese punto de destino, así que ese punto ya no debe contarlos como ocupando un asiento.

Otro punto que conviene mencionar en la entrevista es que este mismo patrón, de anotar cambios en los extremos de un rango y después acumularlos en una sola pasada, sirve para cualquier problema donde se aplican muchos cambios a rangos distintos y solo interesa el valor final en cada punto, sin necesidad de recorrer cada rango por separado uno por uno.

Por último, vale la pena aclarar qué pasaría si el rango de posiciones del camino no viniera acotado por el problema: en ese caso, en vez de un registro de tamaño fijo, se puede usar una estructura ordenada que solo guarde los puntos donde realmente ocurre algún cambio, manteniendo la misma idea de sumar al subir y restar al bajar.
