# 103. Binary Tree Zigzag Level Order Traversal

Dificultad: Media.

## El problema, en palabras simples

Nos dan la raíz de un árbol binario y queremos recorrerlo nivel por nivel, agrupando en una lista los valores de cada nivel. Un nivel es todo lo que está a la misma altura dentro del árbol: la raíz sola forma el nivel cero, sus hijos directos forman el nivel uno, los hijos de esos hijos forman el nivel dos, y así sucesivamente. Lo particular de este problema es que la dirección en que leemos cada nivel se alterna: el nivel cero se lee de izquierda a derecha, el siguiente nivel se lee de derecha a izquierda, el nivel después de ese vuelve a leerse de izquierda a derecha, y así el patrón continúa alternando como una serpiente que va y viene. El resultado final es una lista de listas, una por cada nivel, respetando esa dirección alternada en cada una.

## La idea central

Piensa en leer un edificio piso por piso, pero con una regla rara: en la planta baja lees los locales de izquierda a derecha, en el primer piso los lees de derecha a izquierda, en el segundo piso otra vez de izquierda a derecha, y así te vas turnando de dirección en cada piso que subes. Esa forma de recorrer un árbol nivel por nivel, como pisos de un edificio, se llama recorrido en anchura, porque avanzamos completando toda una fila antes de pasar a la siguiente, en lugar de irnos por un solo camino hasta el fondo.

Para hacer este recorrido usamos una fila de espera, igual que la fila del supermercado, donde el primero que entra es el primero que se atiende. La única diferencia respecto a un recorrido en anchura normal es la dirección alternada de lectura. Y aquí hay un truco útil: en lugar de leer cada piso siempre en el mismo orden y después voltear la lista cuando toca ir al revés, podemos ahorrarnos ese paso extra colocando cada valor directamente en la posición que le corresponde dentro de la lista del piso, ya sea contando desde el principio o contando desde el final, según la dirección que toque en ese piso.

## Cómo funciona el algoritmo, paso a paso

Primero, si el árbol está completamente vacío, devolvemos de inmediato una lista vacía, porque no hay ningún piso que recorrer.

Si el árbol tiene al menos un nodo, metemos la raíz en la fila de espera, y preparamos un interruptor que empieza apagado, indicando que el primer nivel se va a leer de izquierda a derecha.

Mientras la fila de espera no esté vacía, repetimos lo siguiente para procesar un piso completo. Primero, contamos cuántos nodos hay en este momento dentro de la fila de espera: esa cantidad es exactamente cuántos nodos pertenecen al piso actual, ni uno más ni uno menos, porque todavía no hemos metido a los hijos de este piso.

Preparamos una lista vacía del tamaño de ese piso para ir guardando sus valores. Luego, sacamos de la fila exactamente esa cantidad de nodos, uno por uno, en el orden en que estaban esperando. Para cada nodo que sacamos, decidimos en qué posición de la lista del piso va su valor: si el interruptor está apagado, lo colocamos contando normalmente desde el principio; si el interruptor está encendido, lo colocamos contando desde el final hacia el principio, de modo que el último nodo sacado termine ocupando la primera posición de la lista y el primero termine en la última posición, logrando así el efecto de leer ese piso al revés.

Después de guardar el valor de cada nodo en su posición correspondiente, revisamos si ese nodo tiene hijo izquierdo o hijo derecho, y si los tiene, los metemos al final de la fila de espera para que formen parte del siguiente piso.

Cuando terminamos de sacar y procesar todos los nodos de este piso, agregamos la lista de ese piso, ya completa y en el orden correcto, al resultado final. Después, cambiamos el interruptor de dirección: si estaba apagado lo encendemos, y si estaba encendido lo apagamos, para que el siguiente piso se lea en la dirección contraria a este.

Este proceso se repite piso tras piso hasta que la fila de espera se vacía por completo, momento en el cual ya no quedan más nodos que procesar y devolvemos la lista de todos los pisos que fuimos acumulando.

## Por qué esta complejidad

En cuanto al tiempo, cada nodo del árbol entra a la fila de espera exactamente una vez y se procesa exactamente una vez, así que el trabajo total depende únicamente de cuántos nodos tiene el árbol en total.

En cuanto al espacio, en el peor de los casos la fila de espera y la lista de resultados juntas pueden llegar a contener una cantidad de valores comparable al número total de nodos del árbol, por ejemplo cuando el piso más ancho del árbol contiene una fracción grande de todos sus nodos, así que el espacio necesario también depende del número total de nodos.

## Errores comunes y tips de entrevista

Un error común, aunque no incorrecto, es leer cada piso siempre en el mismo orden y después invertir la lista completa con una operación aparte cuando toca ir al revés. Esto funciona, pero hace trabajo de más: colocar cada valor directamente en la posición final que le corresponde, contando desde el principio o desde el final según la dirección del piso, evita esa vuelta extra y demuestra que entiendes bien cómo está armado cada piso desde el principio.

Otro descuido frecuente es contar el tamaño del piso en el momento equivocado. Es fundamental medir cuántos nodos hay en la fila de espera justo antes de empezar a sacar nodos de ese piso, porque si mides después de haber metido a algunos de sus hijos, el conteo queda mezclado entre dos niveles distintos y el resultado sale mal.

También vale la pena mencionar, como alternativa, que este mismo problema se puede resolver con dos pilas en lugar de una fila de espera, una pila para cada dirección de lectura, intercambiando entre ellas en cada piso. No es necesario implementarla, pero mencionarla en la entrevista muestra que conoces más de una forma de resolver el mismo patrón.

Por último, conviene aclarar los casos raros antes de programar: un árbol vacío debe devolver una lista vacía sin ningún piso dentro; un árbol de un solo nodo debe devolver una lista con un único piso que contiene ese solo valor, sin necesidad de invertir nada; y árboles muy torcidos, donde algún piso tiene un único nodo, deben seguir funcionando igual de bien porque el algoritmo no depende de que los pisos tengan una forma particular.
