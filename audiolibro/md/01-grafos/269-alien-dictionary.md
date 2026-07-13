# 269. Alien Dictionary

Dificultad: Difícil.

## El problema, en palabras simples

Nos dan una lista de palabras escritas con las letras de un alfabeto que no conocemos, de un idioma inventado. Lo único que sabemos con certeza es que esa lista ya viene ordenada de acuerdo con las reglas de orden alfabético de ese idioma extraño, aunque nosotros no sepamos todavía cuál letra va antes que cuál. A partir de esa lista tenemos que deducir un orden posible para las letras del alfabeto completo. Si la información de la lista se contradice a sí misma, de manera que ningún orden de letras podría explicar por qué esa lista quedó ordenada así, entonces devolvemos una cadena vacía, indicando que no existe ningún alfabeto posible que cuadre con esos datos.

## La idea central

Imagina que te entregan un cuaderno viejo con una lista de apellidos ya ordenada, pero escrita en un idioma que jamás has visto, con letras que ni siquiera reconoces. Tu trabajo es de detective: tienes que reconstruir el abecedario de ese idioma nada más viendo en qué orden quedaron los apellidos. La pista más simple que puedes sacar es comparar dos apellidos que están uno justo después del otro en la lista: los vas leyendo letra por letra, al mismo tiempo, hasta encontrar el primer punto donde dejan de coincidir. Esa primera letra distinta te dice, sin ninguna duda, que la letra del primer apellido va antes que la letra del segundo apellido en el abecedario de ese idioma. Todas las letras que vienen después de esa primera diferencia no te dicen absolutamente nada sobre el orden, así que las ignoras por completo. Vas juntando todas esas pistas, una por cada par de apellidos consecutivos, y al final intentas acomodar todas las letras del abecedario en una sola fila que respete cada una de las pistas que juntaste. Si lo logras, esa fila es tu respuesta. Si en algún momento dos pistas se contradicen entre sí, de forma que una letra tendría que ir antes y después de otra al mismo tiempo, entonces el cuaderno no tiene sentido y no existe ningún abecedario posible.

## Cómo funciona el algoritmo, paso a paso

Primero recorremos todas las palabras de la lista y anotamos, en un registro, cada letra distinta que aparece en cualquiera de ellas, sin repetir ninguna, porque necesitamos conocer de antemano el conjunto completo de letras del alfabeto misterioso.

Después comparamos cada palabra con la palabra que le sigue inmediatamente en la lista, una pareja a la vez. Para cada pareja, vamos leyendo letra por letra, en la misma posición de ambas palabras, buscando la primera posición en la que las letras sean distintas. En cuanto encontramos esa primera diferencia, anotamos una pista nueva: la letra de la primera palabra va antes que la letra de la segunda palabra. Y dejamos de comparar el resto de esa pareja de palabras, porque ya no aporta ninguna pista adicional.

Aquí hay que cuidar un caso especial: si llegamos al final de la palabra más corta sin encontrar ninguna diferencia, y resulta que la palabra más corta es la segunda de la pareja, entonces la lista original no puede estar bien ordenada, porque una palabra que es el principio exacto de otra siempre debe ir antes que esa palabra más larga. En ese caso, detenemos todo de inmediato y devolvemos una cadena vacía, sin seguir procesando nada más.

Una vez que terminamos de comparar todas las parejas de palabras consecutivas y juntamos todas las pistas, calculamos, para cada letra, cuántas otras letras tienen que ir obligatoriamente antes que ella, según las pistas que juntamos.

Después juntamos, en una cola de espera, a todas las letras que no tienen ninguna letra obligada antes de ellas.

Luego vamos sacando letras de la cola de espera, una por una. Cada vez que sacamos una letra, la agregamos al final de la respuesta que estamos construyendo. Después, revisamos las letras que, según nuestras pistas, debían ir después de esta que acabamos de sacar, y a cada una de ellas le restamos una de sus letras obligatorias pendientes. A la que se quede sin ninguna letra obligatoria pendiente, la metemos a la cola de espera.

Repetimos este proceso hasta que la cola de espera se quede vacía.

Al final, si logramos colocar en la respuesta absolutamente todas las letras del alfabeto que habíamos registrado al principio, esa respuesta es un orden de alfabeto válido. Si nos faltó alguna letra, quiere decir que algunas letras quedaron exigiéndose entre sí en un círculo cerrado de pistas contradictorias, y entonces devolvemos una cadena vacía.

## Por qué esta complejidad

En cuanto al tiempo, lo que más trabajo cuesta es leer todas las palabras para comparar cada pareja consecutiva letra por letra, así que el tiempo depende principalmente de la suma de las longitudes de todas las palabras de la lista. Acomodar después las letras del alfabeto es rapidísimo en comparación, porque un alfabeto normal tiene nada más unas cuantas decenas de letras distintas como máximo. No se puede ir más rápido que esto, porque cuando menos hay que leer cada palabra una vez para sacar las pistas que trae escondidas.

En cuanto al espacio, lo que guardamos es, para cada letra del alfabeto, la lista de letras que deben ir después de ella y cuántas letras le faltan por delante, y como la cantidad de letras distintas posibles está limitada de antemano, ese espacio se mantiene prácticamente constante, sin crecer con el tamaño de la lista de palabras.

## Errores comunes y tips de entrevista

El error más común, y el más fácil de pasar por alto, es olvidar el caso de la palabra que es el principio exacto de otra pero viene después de ella en la lista: por ejemplo, si una palabra larga aparece justo antes de su propio principio recortado. Ese caso rompe cualquier orden alfabético posible, y hay que detectarlo antes de ponerse a sacar pistas letra por letra.

Otro error frecuente es tomar más de una pista por cada pareja de palabras: solamente la primera letra en la que dos palabras se diferencian aporta información; cualquier otra letra que venga después de esa primera diferencia no dice absolutamente nada sobre el orden, y anotarla como pista adicional produce resultados incorrectos.

También es fácil olvidar que este problema es pariente cercano de los problemas de cursos con prerrequisitos: usa exactamente la misma técnica de ir sacando de una cola de espera a los elementos que ya no tienen nada pendiente. Mencionar ese parecido en la entrevista ayuda a mostrar que reconoces el patrón detrás de las palabras del enunciado.

Por último, recuerda aclarar que casi siempre existen varios órdenes de alfabeto igual de válidos, porque puede haber letras que ninguna pista relaciona entre sí, y esas letras sueltas se pueden acomodar en más de un lugar sin romper ninguna regla. Basta con entregar un orden que funcione, no hace falta encontrar "el" único orden.
