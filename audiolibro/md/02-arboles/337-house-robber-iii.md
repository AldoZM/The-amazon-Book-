# 337. House Robber III

Dificultad: Media.

## El problema, en palabras simples

Imagina un vecindario de casas donde las conexiones entre casas no forman calles en línea recta, sino un árbol: hay una casa principal, de ella cuelgan hasta dos casas, y de cada una de esas cuelgan hasta otras dos, y así sucesivamente hacia abajo. Cada casa tiene una cantidad de dinero adentro. Un ladrón quiere robar el máximo dinero posible, pero con una regla estricta: si roba una casa, no puede robar ninguna de las casas que cuelgan directamente de ella, porque esas dos casas están conectadas por una alarma compartida. Sí puede robar, en cambio, una casa y las casas de sus nietos, porque esas ya no están conectadas directamente. Lo que se pide es calcular cuál es la cantidad máxima de dinero que el ladrón puede llevarse sin que dos casas robadas estén conectadas directamente.

## La idea central

Piensa en esto como planear una fiesta de la empresa, donde ningún empleado quiere estar en la misma fiesta que su jefe directo, pero no le importa estar con su jefe dos niveles arriba. Si armas la lista de invitados jefe por jefe, para cada uno tienes que decidir con la información completa de lo que decidiste con sus subordinados directos. Entonces conviene resolver esto de abajo hacia arriba: primero decides con los empleados de más abajo en el organigrama, que no tienen a nadie debajo de ellos y por lo tanto la decisión es trivial, y vas subiendo. En cada nivel, cada persona necesita saber dos cosas de cada uno de sus subordinados directos: cuánto se ganaría el grupo si esa persona sí viene a la fiesta, y cuánto se ganaría si esa persona no viene. Con esos dos números de cada hijo directo, cualquier persona puede calcular sus propios dos números sin tener que volver a pensar en todo el árbol de nuevo.

## Cómo funciona el algoritmo, paso a paso

Recorremos el árbol de abajo hacia arriba, es decir, primero procesamos los hijos y hasta el final procesamos al padre; a este orden se le llama post-order, glosa de post-order.

Para cada nodo, primero preguntamos a su hijo izquierdo cuáles son sus dos resultados: el máximo dinero que se puede sacar de su subárbol si no se roba ese hijo, y el máximo dinero si sí se roba ese hijo. Hacemos exactamente la misma pregunta al hijo derecho.

Cuando un nodo es vacío, es decir, no existe, sus dos resultados son cero y cero, porque no hay ninguna casa ahí que robar.

Ya con los dos resultados del hijo izquierdo y los dos resultados del hijo derecho, calculamos los dos resultados del nodo actual.

El resultado de robar el nodo actual es el dinero de esa casa, más el resultado de no robar el hijo izquierdo, más el resultado de no robar el hijo derecho. Esto es así porque si robamos esta casa, la alarma nos prohíbe robar a sus hijos directos, así que forzosamente tomamos la opción de no robarlos, aunque más abajo sí podamos robar a los nietos.

El resultado de no robar el nodo actual es la suma, para cada hijo, de lo mejor entre sus dos opciones. Como no robamos esta casa, quedamos libres de decidir para cada hijo lo que le convenga más: robarlo o no robarlo, lo que sea que le dé más dinero al grupo.

Repetimos este cálculo subiendo nodo por nodo hasta llegar a la casa principal, que es la raíz del árbol.

Al final, la respuesta del problema completo es la mejor de las dos opciones de la raíz: el máximo entre robar la raíz y no robar la raíz.

## Por qué esta complejidad

En cuanto al tiempo, cada casa se visita exactamente una vez, y en esa única visita se hace una cantidad fija de trabajo: calcular dos números a partir de los dos números de cada hijo. Como no hay que volver a visitar ninguna casa ni recalcular nada, el tiempo total crece de forma proporcional al número total de casas del vecindario.

En cuanto al espacio, la parte que ocupa memoria es la cadena de llamadas que va bajando por el árbol antes de empezar a regresar resultados hacia arriba. Esa cadena de llamadas nunca es más larga que la altura del árbol, es decir, cuántos niveles hay desde la casa principal hasta la casa más profunda. En un árbol muy desbalanceado, esa altura puede acercarse al número total de casas, pero en un árbol razonablemente equilibrado es mucho menor.

## Errores comunes y tips de entrevista

Un error muy común es intentar resolver esto probando robar o no robar cada casa por separado, de forma ingenua, sin guardar las dos respuestas juntas; eso obliga a recalcular una y otra vez los mismos subárboles, y el trabajo total se dispara de forma exponencial en vez de crecer de forma proporcional al tamaño del árbol.

Otro error es olvidar que, cuando decidimos no robar una casa, no significa que tampoco robemos a sus hijos: significa que somos libres de decidir lo mejor para cada hijo, que puede ser robarlo o no robarlo, lo que convenga más.

También es fácil confundir hijos directos con nietos: la regla de la alarma solo prohíbe robar una casa y sus hijos inmediatos, pero no prohíbe nada respecto a los nietos, así que un ladrón inteligente sí puede robar una casa y las casas de sus nietos al mismo tiempo.

En la entrevista, vale la pena explicar en voz alta por qué conviene que cada nodo devuelva dos respuestas en vez de una: es la clave para evitar recalcular trabajo, y mostrar que entiendes por qué se necesitan exactamente esos dos estados, y no uno solo, es lo que distingue una solución ingenua de una solución eficiente.

Por último, conviene mencionar el caso de un árbol vacío, donde la respuesta correcta es cero, y el caso de un árbol de una sola casa, donde la respuesta es simplemente el dinero de esa única casa.
