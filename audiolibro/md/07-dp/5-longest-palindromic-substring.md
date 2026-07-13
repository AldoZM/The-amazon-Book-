# 5. Longest Palindromic Substring

Dificultad: Media.

## El problema, en palabras simples

Te dan una cadena de texto, y necesitas encontrar el pedazo más largo de esa cadena, tomado de letras seguidas sin saltarse ninguna, que se lea exactamente igual empezando por el principio que empezando por el final. A ese tipo de pedazo se le llama palíndromo, como la palabra "reconocer" o el nombre "Ana".

## La idea central

Piensa en cómo revisarías a mano si una palabra es capicúa: no la lees de corrido de izquierda a derecha, sino que te fijas en el centro de la palabra y vas comparando la letra que está justo a la izquierda del centro con la que está justo a la derecha, y si coinciden, sigues abriendo la comparación una letra más hacia afuera de cada lado, y así sucesivamente, hasta que las letras dejan de coincidir o se te acaba la palabra. Ese centro puede caer exactamente sobre una sola letra, cuando el palíndromo tiene una cantidad impar de letras, o puede caer justo en el espacio entre dos letras consecutivas, cuando el palíndromo tiene una cantidad par de letras. La estrategia para resolver este problema es aplicar exactamente esa idea de abrirse desde el centro, pero probándola en todos los centros posibles de la cadena completa, y quedándote con el palíndromo más largo que encuentres en cualquiera de esos intentos.

## Cómo funciona el algoritmo, paso a paso

Primero, notamos que en una cadena de cierta longitud existen muchos centros posibles: uno por cada letra individual, y uno más por cada espacio entre dos letras consecutivas. Vamos a probar, uno por uno, todos esos centros posibles.

Para cada centro que probamos, colocamos dos marcadores, uno que representa el borde izquierdo del palíndromo que estamos formando y otro que representa el borde derecho. Si el centro es una sola letra, ambos marcadores arrancan sobre esa misma letra; si el centro es un espacio entre dos letras, un marcador arranca en la letra de la izquierda y el otro en la letra de la derecha.

Después, mientras los dos marcadores sigan dentro de los límites de la cadena y la letra donde está el marcador izquierdo coincida con la letra donde está el marcador derecho, vamos abriendo la comparación: el marcador izquierdo retrocede una posición y el marcador derecho avanza una posición, exactamente como cuando revisamos a mano una palabra capicúa expandiéndonos desde el centro hacia afuera.

En cuanto los marcadores salen de los límites de la cadena, o las letras donde están dejan de coincidir, nos detenemos, y el palíndromo válido más reciente es el que quedó justo antes de ese último paso fallido. Medimos su longitud, y si es más larga que la mejor que llevábamos guardada hasta ahora, actualizamos nuestra respuesta con este nuevo palíndromo.

Repetimos exactamente este mismo proceso para cada uno de los centros posibles de la cadena. Al terminar de probarlos todos, la respuesta guardada es el palíndromo más largo que existe en toda la cadena.

## Por qué esta complejidad

En cuanto al tiempo, hay una cantidad de centros posibles que crece de forma proporcional a la longitud de la cadena, y para cada centro, la expansión hacia afuera puede llegar a recorrer, en el peor de los casos, casi toda la cadena completa, por ejemplo cuando la cadena entera resulta ser un solo palíndromo gigante. Como probamos todos los centros y cada expansión puede costar hasta ese tamaño completo, el trabajo total crece como el cuadrado de la longitud de la cadena.

En cuanto al espacio, no necesitamos ninguna tabla ni estructura auxiliar que crezca con el tamaño de la cadena: solo usamos un puñado de variables, como los dos marcadores y los datos del mejor palíndromo encontrado hasta el momento. Por eso el espacio adicional que usamos es constante, sin contar el espacio que ocupa la respuesta final que se devuelve.

## Errores comunes y tips de entrevista

Un error muy común es olvidar por completo los centros que caen entre dos letras, y solo revisar los centros que caen exactamente sobre una letra. Si haces eso, el algoritmo nunca vas a encontrar correctamente palíndromos de longitud par, como una cadena donde las dos letras del medio son iguales pero no hay ninguna letra central única.

Otro punto que vale la pena mencionar en la entrevista es que este mismo problema se puede resolver con una tabla de dos dimensiones que registre, para cada posible inicio y fin, si ese pedazo de la cadena es un palíndromo. Esa solución también es correcta y es útil mencionarla, pero gasta mucho más espacio, porque la tabla completa crece como el cuadrado de la longitud de la cadena, mientras que la expansión desde el centro logra el mismo resultado sin necesitar esa tabla.

También conviene aclarar, antes de programar, qué se espera cuando hay más de un palíndromo distinto que comparten la misma longitud máxima: en ese caso, cualquiera de ellos se considera una respuesta correcta, no existe una única solución válida, y es bueno decirlo en voz alta para que quede claro que no se está pasando por alto ese detalle.
