# 1644. Lowest Common Ancestor of a Binary Tree II

Dificultad: Media.

## El problema, en palabras simples

Imagina un árbol binario, como un árbol genealógico dibujado de cabeza, donde hasta arriba está el ancestro más lejano y hacia abajo van colgando sus descendientes. Se nos dan dos nodos específicos de ese árbol, y se pide encontrar su ancestro común más cercano, es decir, el pariente compartido más próximo a ambos, aquel del que los dos son descendientes y que está lo más abajo posible en el árbol. La diferencia importante respecto a la versión más sencilla de este mismo problema es que aquí no hay ninguna garantía de que los dos nodos buscados realmente existan dentro del árbol: puede que uno de los dos falte, o que falten los dos. Si alguno de los dos nodos no existe en el árbol, la respuesta correcta no es cualquier ancestro que hayamos encontrado por el camino, sino que no hay respuesta en absoluto.

## La idea central

Piensa en buscar, dentro de una lista completa de alumnos de una escuela organizada por salones y grados, a dos estudiantes específicos, para encontrar quién es su director de grado en común. Si en la versión sencilla del problema te aseguran que ambos estudiantes están inscritos, en cuanto encuentras al primero de los dos ya puedes confiar en que vas por buen camino y detener parte de tu búsqueda. Pero en esta versión nadie te asegura nada: podría ser que uno de los dos estudiantes, o los dos, simplemente no estén inscritos en la escuela. Si te detuvieras apenas encuentras al primero, y resulta que el segundo nunca existió, darías un director equivocado con toda confianza. La forma correcta de evitar ese error es revisar la lista completa de la escuela, sin excepción, y llevar un contador aparte que va sumando uno cada vez que efectivamente encuentras a uno de los dos estudiantes buscados. Solo si ese contador termina en dos, es decir, si de verdad confirmaste que ambos estudiantes existen, te permites confiar en la respuesta que habías encontrado por el camino. Si el contador se queda en uno o en cero, la respuesta correcta es que no hay ningún director en común que reportar.

## Cómo funciona el algoritmo, paso a paso

Usamos la misma técnica de bajar por el árbol y regresar respuestas hacia arriba que se usa en la versión sencilla del problema, pero con dos cambios importantes.

Llevamos un contador compartido, que empieza en cero, y que se puede consultar y modificar desde cualquier parte del recorrido.

Para cada nodo que visitamos, primero bajamos hacia su hijo izquierdo y esperamos su respuesta completa, y después bajamos hacia su hijo derecho y esperamos su respuesta completa. Es muy importante que nunca cortemos esta exploración antes de tiempo: siempre revisamos las dos ramas por completo, sin importar si ya encontramos algo prometedor en una de ellas. Esto garantiza que recorremos el árbol entero, de principio a fin.

Cuando el nodo que estamos visitando resulta ser uno de los dos nodos que estamos buscando, sumamos uno al contador compartido, porque acabamos de confirmar que ese nodo sí existe de verdad en el árbol, y marcamos a este nodo como un candidato a ser la respuesta.

Si el nodo actual no es ninguno de los dos que buscamos, entonces revisamos lo que nos devolvieron sus dos hijos. Si tanto el hijo izquierdo como el hijo derecho encontraron un candidato en sus respectivas ramas, entonces el nodo actual es, precisamente, el punto donde los caminos de ambos nodos buscados se separan, y por lo tanto este nodo actual se convierte en el nuevo candidato a respuesta, que se propaga hacia su propio padre. Si solamente uno de los dos hijos encontró un candidato, ese candidato simplemente se propaga hacia arriba sin cambios. Si ninguno de los dos hijos encontró nada, se propaga hacia arriba que no hay ningún candidato en esta rama.

Este proceso continúa subiendo nodo por nodo hasta terminar de procesar la raíz completa del árbol, momento en el cual ya tenemos tanto un candidato final a respuesta como el valor final del contador compartido.

Al terminar todo el recorrido, solo damos por válida la respuesta candidata si el contador compartido terminó valiendo exactamente dos, confirmando que ambos nodos buscados sí existen en el árbol. Si el contador terminó en uno o en cero, la respuesta correcta es que no existe tal ancestro, porque falta al menos uno de los dos nodos.

## Por qué esta complejidad

En cuanto al tiempo, como ya no podemos cortar la búsqueda apenas encontramos uno de los dos nodos, visitamos absolutamente todos los nodos del árbol exactamente una vez cada uno, para poder confirmar con certeza que ambos nodos buscados existen. El tiempo total crece de forma proporcional a la cantidad total de nodos del árbol.

En cuanto al espacio, lo que ocupa memoria es la cadena de llamadas que va bajando por el árbol mientras se procesa cada nodo, y esa cadena nunca es más larga que la altura del árbol, es decir, cuántos niveles hay entre la raíz y el nodo más profundo.

## Errores comunes y tips de entrevista

El error más importante de evitar, y el que un entrevistador de Amazon seguramente va a probar, es reutilizar directamente el atajo de la versión sencilla del problema, donde uno se detiene apenas encuentra a uno de los dos nodos buscados. Ese atajo asume que el otro nodo definitivamente existe en algún otro lugar del árbol, una suposición que aquí ya no es válida, y que puede producir una respuesta falsa con total confianza.

Otro error común es olvidar por completo el contador compartido, o llevarlo de forma que no se actualice correctamente entre las distintas ramas de la recursión; sin ese contador funcionando bien, no hay manera de distinguir entre un candidato válido y un candidato que en realidad corresponde a un nodo que nunca existió.

También es válido resolver este problema en dos pasadas separadas: una primera pasada solamente para confirmar que ambos nodos existen en el árbol, y una segunda pasada, idéntica a la versión sencilla del problema, para calcular el ancestro común. Esa alternativa funciona perfectamente bien y es más fácil de explicar en voz alta, aunque hace el doble de trabajo comparada con la solución de una sola pasada con contador compartido; mencionar ambas opciones y explicar la diferencia entre ellas deja muy buena impresión en la entrevista.

Por último, conviene repasar en voz alta los casos extremos antes de programar: que falte uno de los dos nodos, que falten los dos, que uno de los nodos buscados sea ancestro directo del otro, y el caso de un árbol de un solo nodo.
