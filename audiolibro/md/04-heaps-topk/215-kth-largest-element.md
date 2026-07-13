# 215. Kth Largest Element in an Array

Dificultad: Media.

## El problema, en palabras simples

Tenemos un montón de números revueltos, sin ningún orden, y un número k. Queremos saber cuál es el k-ésimo número más grande si los acomodáramos de mayor a menor. Si el número que buscamos aparece repetido en la lista, cada aparición cuenta como su propio lugar, no se agrupan los repetidos en uno solo.

## La idea central

Imagina que estás calificando exámenes de un salón enorme y solo te interesa saber cuál fue la calificación que quedó en, digamos, quinto lugar del salón, de mayor a menor. No necesitas ordenar las doscientas boletas de calificación completas para saber eso. Te basta con ir guardando, en una charola pequeña, únicamente las mejores calificaciones que has visto hasta el momento, y en cuanto la charola se llena más de la cuenta, tiras la peor calificación de esa charola, porque ya sabes que no puede quedar entre los primeros lugares que te interesan. Esa charola pequeña, que siempre te deja ver de un vistazo cuál es la peor calificación que guarda, es justamente lo que en programación llamamos un min-heap, que en español podemos entender como un montículo mínimo: una estructura que organiza sus elementos de forma que siempre puedas consultar el más chico de ellos casi al instante.

## Cómo funciona el algoritmo, paso a paso

Primero, preparamos una charola vacía, es decir, un montículo mínimo vacío que va a contener como máximo k calificaciones a la vez.

Luego recorremos la lista completa de números, uno por uno. Cada número que encontramos lo metemos a la charola, sin pensarlo demasiado.

Después de meter cada número, revisamos el tamaño de la charola. Si la charola tiene más de k elementos, entonces sacamos de ahí el número más pequeño que contiene, porque en ese momento ya sobra: no puede formar parte de los k números más grandes de toda la lista, dado que ya hay al menos k números mejores que él guardados junto a él.

Repetimos ese proceso, meter y quizás sacar el más chico, hasta terminar de recorrer toda la lista original.

Cuando terminamos, la charola contiene exactamente los k números más grandes de toda la lista, ni uno más ni uno menos. Y como la charola siempre nos deja ver su elemento más pequeño de forma inmediata, ese elemento más pequeño de la charola es exactamente la respuesta que buscamos: el k-ésimo número más grande de todos.

## Por qué esta complejidad

Recorremos cada número de la lista original exactamente una vez, así que ese trabajo depende directamente del tamaño de la lista completa. Pero cada vez que metemos o sacamos algo de la charola, ese trabajo no depende del tamaño de la lista completa, sino del tamaño de la charola misma, que nunca crece más allá de k elementos. Como meter o sacar de una estructura de este tipo cuesta un tiempo que crece muy lentamente conforme crece su tamaño, el costo total termina siendo el tamaño de la lista completa multiplicado por ese costo pequeño relacionado con k, en vez de multiplicado por el tamaño de toda la lista. En cuanto al espacio, solo necesitamos guardar hasta k números a la vez en la charola, sin importar qué tan grande sea la lista original.

## Errores comunes y tips de entrevista

Un error común es usar la charola equivocada: si en vez de guardar los más grandes y descartar al más chico, alguien intenta guardar los más chicos y descartar al más grande, termina resolviendo un problema distinto. Conviene decir en voz alta por qué se elige guardar los k más grandes y no los k más chicos.

Otro error frecuente es olvidar que los valores repetidos cuentan por separado. Si alguien agrupa mentalmente los números repetidos como si fueran uno solo, puede terminar contando mal la posición k.

También es común que pregunten por una alternativa: existe una técnica llamada quickselect, basada en la misma idea de partición que usa el ordenamiento rápido, que en promedio es más veloz, pero que en el peor de los casos puede volverse lenta. Mencionar esa alternativa, y explicar el cambio entre velocidad promedio y garantía en el peor caso, suele dejar buena impresión en una entrevista de este tipo.

Por último, aclara qué pasa si k es igual al tamaño completo de la lista: en ese caso la respuesta es simplemente el número más pequeño de toda la lista, y es una buena forma de mostrar que entiendes los casos límite antes de que te los pregunten.
