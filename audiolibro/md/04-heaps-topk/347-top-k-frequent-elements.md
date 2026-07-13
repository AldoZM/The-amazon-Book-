# 347. Top K Frequent Elements

Dificultad: Media.

## El problema, en palabras simples

Nos dan una lista de números, algunos repetidos, y un número k. Queremos encontrar los k valores que más veces aparecen en esa lista. No importa en qué orden entreguemos la respuesta, y se nos garantiza que no hay empates confusos justo en el límite de la posición k.

## La idea central

Piensa en la sección de "lo más vendido" de una tienda en línea. Al final del mes, la tienda quiere saber cuáles fueron los k productos que más se vendieron, sin importarle el orden exacto en que se hicieron las ventas durante el mes. Lo primero que hace la tienda es contar cuántas unidades se vendieron de cada producto. Después, en vez de ordenar cuidadosamente todos los productos de la tienda entera de mayor a menor número de ventas, hace algo más directo: agrupa los productos en casilleros según cuántas unidades vendieron. Un casillero junta a todos los productos que vendieron exactamente una unidad, otro casillero junta a los que vendieron exactamente dos unidades, y así sucesivamente. Como ningún producto puede haber vendido más unidades que el total de ventas del mes, la cantidad de casilleros posibles está limitada de antemano. Para armar el top k, la tienda solo tiene que revisar los casilleros empezando por el que tiene más ventas y bajando, sacando productos de ahí hasta juntar k de ellos.

## Cómo funciona el algoritmo, paso a paso

Primero, recorremos la lista completa de números y contamos cuántas veces aparece cada valor distinto, guardando esa cuenta en algo parecido a una libreta de conteo.

Después, preparamos una fila de casilleros vacíos. La cantidad de casilleros que preparamos es uno más que el tamaño de la lista original, porque en el peor de los casos un solo valor podría repetirse tantas veces como elementos tiene la lista entera.

Luego recorremos la libreta de conteo, y por cada valor distinto que anotamos ahí, lo colocamos en el casillero correspondiente a su número de repeticiones. Por ejemplo, si un valor apareció cinco veces, ese valor se va directo al casillero número cinco.

Una vez que todos los valores distintos están acomodados en su casillero correspondiente, empezamos a recorrer los casilleros desde el que representa más repeticiones hacia el que representa menos repeticiones.

Por cada casillero que visitamos, vamos sacando los valores que contiene y agregándolos a nuestra respuesta final, hasta que la respuesta junte exactamente k valores. En cuanto llegamos a esa cantidad, nos detenemos, sin importar que todavía queden casilleros por revisar.

## Por qué esta complejidad

Contar cuántas veces aparece cada valor toma un tiempo proporcional al tamaño de la lista original, porque revisamos cada número una sola vez. Colocar cada valor distinto en su casillero también toma un tiempo proporcional a la cantidad de valores distintos, que como mucho es el tamaño de la lista. Y recorrer los casilleros de mayor a menor, en el peor caso, también toma un tiempo proporcional al tamaño de la lista, porque cada valor distinto vive en exactamente un casillero y lo visitamos una sola vez. Sumando todo, el trabajo total crece de forma directamente proporcional al tamaño de la lista, sin ningún costo extra por comparaciones ni por mantener algo ordenado. En cuanto al espacio, necesitamos tanto la libreta de conteo como la fila de casilleros, y ambas crecen proporcionalmente al tamaño de la lista original.

## Errores comunes y tips de entrevista

Un error común es intentar ordenar todos los valores distintos por su frecuencia usando un ordenamiento genérico, lo cual funciona pero es más lento de lo necesario cuando el rango de frecuencias posibles está tan acotado como aquí.

Otro error es olvidar detenerse justo al llegar a k elementos: si sigues vaciando el casillero actual sin control, puedes terminar agregando más valores de los que se piden.

También conviene aclarar en voz alta que el orden de la respuesta no está garantizado por este método: dos valores con la misma frecuencia pueden salir en cualquier orden entre ellos, y eso es perfectamente válido según el enunciado, así que no hay que perder tiempo intentando forzar un orden particular entre empates.

Por último, si te preguntan por una alternativa a este método de casilleros, puedes mencionar el uso de un montículo mínimo de tamaño k basado en la frecuencia de cada valor, siguiendo el mismo patrón que se usa para encontrar el k-ésimo elemento más grande de un arreglo; esa alternativa es un poco más lenta en teoría, pero es más fácil de adaptar si después te piden mantener el top k actualizado conforme llegan números nuevos, uno a la vez.
