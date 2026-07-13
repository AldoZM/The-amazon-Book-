# 547. Number of Provinces

Dificultad: Media.

## El problema, en palabras simples

Imagina que existen varias ciudades, numeradas desde la primera hasta la última. Nos entregan una tabla cuadrada donde, para cada par de ciudades, se indica con un uno si esas dos ciudades están conectadas de forma directa, o con un cero si no lo están. Esta tabla es simétrica, es decir, si la ciudad uno está conectada con la ciudad dos, entonces la ciudad dos también aparece conectada con la ciudad uno, y además cada ciudad siempre aparece conectada consigo misma. Una provincia es un grupo de ciudades que están conectadas entre sí, ya sea de forma directa o pasando por otras ciudades intermedias, y que no tiene ninguna conexión con ciudades fuera de ese grupo. Lo que se pide es contar cuántas provincias distintas existen en total.

## La idea central

Piensa en un salón de fiestas donde hay varios grupos de amigos que no se conocen entre grupos. Dos personas son amigas directas si alguien te lo dice explícitamente, pero la amistad se contagia: si Ana conoce a Beto, y Beto conoce a Carla, entonces Ana, Beto y Carla forman parte del mismo grupo de amigos, aunque Ana nunca haya hablado directamente con Carla. Contar cuántas provincias hay es exactamente lo mismo que contar cuántos grupos de amigos separados hay en ese salón. La forma más rápida de organizar esto es que cada grupo elija, en secreto, a un representante, de manera que dos personas pertenecen al mismo grupo si y solo si comparten representante. Cada vez que descubrimos que dos personas se conocen y resulta que tenían representantes distintos, fusionamos sus dos grupos en uno solo, y elegimos un único representante para el grupo fusionado. Al final, contamos cuántos representantes distintos quedaron, y ese número es la cantidad de provincias.

## Cómo funciona el algoritmo, paso a paso

Al principio, como todavía no hemos revisado ninguna conexión, cada ciudad es su propio representante, y por lo tanto empezamos suponiendo que hay tantas provincias como ciudades existen.

Después, recorremos la tabla de conexiones. Como la tabla es simétrica, no hace falta revisarla completa: basta con revisar cada par de ciudades una sola vez, sin repetir la pareja al revés.

Cada vez que encontramos que dos ciudades distintas están conectadas de forma directa, buscamos quién es el representante actual de la primera ciudad, y quién es el representante actual de la segunda ciudad. Para encontrar al representante de una ciudad, seguimos la cadena de referencias desde esa ciudad hasta llegar a alguien que sea representante de sí mismo; y de paso, mientras seguimos esa cadena, vamos actualizando a cada ciudad que visitamos para que apunte directamente a ese representante final, de modo que la próxima vez que preguntemos por ella, la respuesta sea casi inmediata. A esta mejora se le llama compresión de caminos.

Si el representante de la primera ciudad y el representante de la segunda ciudad resultan ser distintos, entonces esas dos ciudades pertenecían a provincias diferentes que en realidad son una sola. Fusionamos los dos grupos, haciendo que el representante de un grupo pase a depender del representante del otro grupo, y restamos uno a nuestro contador de provincias, porque dos provincias que antes contábamos por separado ahora son una sola. Para que esta fusión no genere cadenas de referencias demasiado largas, siempre colgamos el grupo más pequeño debajo del grupo más grande, una mejora que se conoce como unión por rango.

Si el representante de ambas ciudades ya era el mismo, no hacemos nada, porque esas ciudades ya pertenecían a la misma provincia desde antes.

Repetimos este proceso para cada par de ciudades conectadas directamente en la tabla, y al terminar de recorrerla completa, el contador de provincias tiene la respuesta final.

## Por qué esta complejidad

En cuanto al tiempo, tenemos que recorrer la tabla completa de conexiones para saber quién está conectado con quién, y como la tabla tiene una fila y una columna por cada ciudad, el número de casillas que revisamos crece con el número de ciudades multiplicado por sí mismo. Buscar o fusionar representantes, gracias a la compresión de caminos y a la unión por rango, cuesta prácticamente un paso constante cada vez, así que ese costo extra es casi despreciable frente al costo de simplemente leer la tabla completa.

En cuanto al espacio, solamente necesitamos guardar, para cada ciudad, quién es su representante actual y una medida aproximada del tamaño de su grupo, así que el espacio usado crece de forma directa con el número de ciudades, sin depender del número de conexiones.

## Errores comunes y tips de entrevista

Un error común es recorrer la tabla completa de conexiones sin aprovechar que es simétrica, revisando cada pareja de ciudades dos veces; no está mal en cuanto al resultado, pero muestra que no te diste cuenta de una simplificación evidente, algo que en la entrevista conviene señalar en voz alta.

Otro error es olvidar la compresión de caminos al buscar representantes: sin ella, si las ciudades se van encadenando en una fila muy larga, cada búsqueda puede volverse lenta, y el algoritmo completo pierde la ventaja de velocidad que se supone debía tener.

También es útil mencionar que este mismo problema se puede resolver sin esta técnica, usando en su lugar un recorrido en profundidad o en anchura desde cada ciudad no visitada, tratando cada casilla marcada con uno en la tabla como si fuera una conexión entre nodos de un grafo; ambos enfoques llegan al mismo resultado, pero vale la pena poder explicar cuándo conviene uno sobre el otro, por ejemplo cuando las conexiones van llegando una por una a lo largo del tiempo en lugar de venir todas juntas desde el inicio.

Por último, ten presentes los casos extremos: si solo hay una ciudad, la respuesta es una sola provincia; si ninguna ciudad está conectada con otra, cada ciudad es su propia provincia; y si todas las ciudades están conectadas entre sí, la respuesta es una única provincia que las agrupa a todas.
