# 42. Trapping Rain Water

Dificultad: Difícil.

## El problema, en palabras simples

Nos dan una fila de columnas, una junto a la otra, cada una con su propia altura. Después de que llueve, queremos saber cuánta agua en total queda atrapada entre esas columnas, sabiendo que el agua se acumula en los huecos que quedan entre columnas más altas, y se derrama por cualquier lado que sea más bajo.

## La idea central

Imagina una fila de edificios de distintas alturas, pegados unos a otros, vistos de perfil, un día de lluvia intensa. Sobre un edificio bajo que está entre dos edificios más altos, el agua se junta como en una alberca improvisada, pero esa alberca no puede llenarse más allá de la altura del más bajo de los dos edificios que la rodean, porque ahí es donde se desborda. Entonces, para saber cuánta agua queda sobre cualquier edificio, basta con mirar cuál es el edificio más alto a su izquierda, cuál es el edificio más alto a su derecha, quedarnos con el más bajo de esos dos, y restarle la altura del edificio en el que estamos parados. Si el resultado es negativo, ahí no se atrapa nada.

## Cómo funciona el algoritmo, paso a paso

La manera directa de resolver esto sería calcular, para cada edificio, cuál es el más alto a su izquierda y cuál es el más alto a su derecha, guardando esas dos listas completas. Funciona, pero gasta memoria extra. Hay una forma más elegante que usa dos punteros que caminan uno hacia el otro, uno empezando desde el extremo izquierdo de la fila y el otro desde el extremo derecho.

Primero, colocamos un marcador al principio de la fila y otro al final, y llevamos dos variables que representan el edificio más alto visto hasta ahora desde cada lado, ambas empezando en cero.

Mientras los dos marcadores no se hayan cruzado, comparamos la altura del edificio donde está el marcador izquierdo contra la altura del edificio donde está el marcador derecho.

Si el edificio del lado izquierdo es igual o más bajo que el del lado derecho, entonces sabemos algo importante sin necesidad de calcular nada más: como el edificio de la derecha ya es al menos tan alto como el de la izquierda, el edificio más alto que realmente limita el agua sobre la posición izquierda tiene que ser el más alto que hayamos visto hasta ahora caminando desde la izquierda, sin importar qué tan alto sea el máximo del lado derecho todavía por descubrir. Entonces, actualizamos el máximo visto por la izquierda si el edificio actual lo supera, sumamos al total la diferencia entre ese máximo y la altura del edificio actual, y avanzamos el marcador izquierdo un lugar hacia la derecha.

Si en cambio el edificio del lado derecho es el más bajo de los dos, hacemos exactamente lo mismo pero en espejo: actualizamos el máximo visto por la derecha, sumamos la diferencia correspondiente al total, y movemos el marcador derecho un lugar hacia la izquierda.

Repetimos esta comparación una y otra vez, siempre moviendo el marcador del lado con la altura menor, hasta que los dos marcadores se encuentran. En ese momento ya recorrimos toda la fila y el total acumulado es la respuesta final.

## Por qué esta complejidad

En cuanto al tiempo, en cada vuelta del ciclo movemos uno de los dos marcadores un lugar más cerca del otro, y nunca los movemos hacia atrás, así que entre los dos recorren la fila completa una sola vez en total. Eso hace que el trabajo crezca de forma proporcional a la cantidad de columnas.

En cuanto al espacio, no necesitamos guardar ninguna lista auxiliar de máximos por la izquierda o por la derecha: solo llevamos un puñado de variables sueltas, como los dos marcadores, los dos máximos vistos hasta ahora y el total acumulado. Por eso el espacio que usamos no depende del tamaño de la fila, es siempre el mismo puñado de variables.

## Errores comunes y tips de entrevista

Un error frecuente es intentar resolver esto calculando, para cada columna, su máximo a la izquierda y a la derecha usando dos listas auxiliares completas; esa solución también es válida y del mismo orden de tiempo, pero gasta memoria extra que se puede evitar, y en la entrevista conviene mencionar ambas versiones y explicar el ahorro de espacio de la versión con dos marcadores.

Otro error es no darse cuenta de por qué es seguro mover el marcador del lado más bajo sin conocer todavía el máximo real del otro lado: la garantía está en que ese máximo real, aunque no lo hayamos visto por completo, ya tiene que ser al menos tan grande como la altura que estamos comparando en ese momento, así que no puede convertirse en el factor limitante.

También conviene decir en voz alta los casos límite antes de programar: una fila vacía, o con muy pocas columnas, no puede atrapar nada de agua, porque hace falta al menos un valle entre dos paredes para que se forme una alberca.
