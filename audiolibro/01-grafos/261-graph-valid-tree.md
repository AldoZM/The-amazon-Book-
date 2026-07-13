# 261. Graph Valid Tree

Dificultad: Media.

## El problema, en palabras simples

Nos dan una cierta cantidad de nodos, numerados desde el cero, y una lista de conexiones entre parejas de nodos, donde cada conexión funciona en ambos sentidos, no tiene una dirección fija. Lo que se pregunta es si, con esas conexiones, se forma un árbol válido. Para que cuente como árbol tienen que cumplirse dos cosas al mismo tiempo: que absolutamente todos los nodos queden conectados entre sí, sin que se forme ningún grupo separado del resto, y que en ningún momento se cierre un lazo, es decir, que no exista una forma de salir de un nodo y regresar a él mismo siguiendo un camino distinto de conexiones sin repetir ninguna.

## La idea central

Piensa en una cadena de mensajes de alerta, de esas que se usan en algunas comunidades: la primera persona le llama por teléfono a dos o tres personas, cada una de esas le llama a otras más, y así sucesivamente, hasta que el mensaje llega a todo el mundo. Para que esa cadena funcione perfectamente como debe ser, tienen que pasar dos cosas: primero, que absolutamente todos reciban la llamada, nadie se puede quedar fuera; y segundo, que nadie reciba la misma llamada dos veces por dos caminos distintos, porque eso significaría que hay una conexión de más, sobrando en la cadena, formando un lazo innecesario. Si alguien recibe dos llamadas distintas que terminan llegándole por caminos diferentes, ya sabes que la cadena no es una cadena limpia, sino que tiene un atajo escondido que la vuelve redundante.

Hay un atajo de conteo muy útil aquí: una cadena de este tipo, con una cierta cantidad de personas, necesita usar exactamente una conexión menos que la cantidad de personas. Si hay menos conexiones que eso, es matemáticamente imposible que todos queden conectados. Si hay más conexiones que eso, forzosamente sobra alguna que cierra un lazo. Entonces, antes de complicarnos, primero contamos las conexiones, y solamente si el número es el correcto nos ponemos a revisar con cuidado si alguna de ellas cierra un lazo.

## Cómo funciona el algoritmo, paso a paso

Primero contamos cuántas conexiones nos dieron en total. Si esa cantidad no es exactamente igual a la cantidad de nodos menos uno, entonces ya sabemos que no puede ser un árbol válido, y respondemos que no de inmediato, sin revisar nada más.

Si la cantidad de conexiones sí es la correcta, entonces le asignamos a cada nodo su propio grupo, de manera que al principio cada nodo forma un grupo de una sola persona, y cada grupo tiene su propio representante, que empieza siendo el mismo nodo.

Después recorremos las conexiones una por una. Para cada conexión, buscamos quién es el representante del grupo del primer nodo y quién es el representante del grupo del segundo nodo, siguiendo la cadena de representantes hacia arriba hasta llegar al que ya no tiene a nadie más arriba.

Si resulta que los dos nodos de esa conexión ya comparten el mismo representante, quiere decir que ya estaban conectados entre sí por otro camino desde antes, y esta conexión nueva estaría cerrando un lazo. En ese caso respondemos que no es un árbol válido, de inmediato.

Si tienen representantes distintos, entonces fusionamos los dos grupos en uno solo, haciendo que el representante de uno de los grupos pase a depender del representante del otro grupo, y seguimos con la siguiente conexión.

Si logramos recorrer todas las conexiones sin encontrar ningún par que ya compartiera representante, entonces sí se trata de un árbol válido, porque ya sabemos que la cantidad de conexiones era la correcta y que ninguna de ellas cerró un lazo.

## Por qué esta complejidad

En cuanto al tiempo, tocamos cada nodo una sola vez al principio para asignarle su propio grupo, y tocamos cada conexión una sola vez para revisar y, si hace falta, fusionar sus dos grupos. Buscar al representante de un grupo es una operación que, gracias a dos trucos —acortar el camino hacia el representante cada vez que lo buscamos, y siempre colgar el grupo más chico del más grande— termina siendo prácticamente instantánea, sin importar cuántos nodos haya. Por eso el tiempo total crece de forma casi proporcional a la cantidad de nodos más la cantidad de conexiones, nada más.

En cuanto al espacio, solamente necesitamos guardar, para cada nodo, quién es su representante actual y qué tan alto es su grupo, así que el espacio crece de forma proporcional a la cantidad de nodos.

## Errores comunes y tips de entrevista

Un error frecuente es lanzarse directamente a revisar lazos sin antes contar las conexiones. El atajo de contar primero descarta de un solo golpe la mayoría de los casos que ya son imposibles, sin necesidad de procesar nada más, y mencionarlo en la entrevista muestra que piensas en optimizar antes de programar a ciegas.

Otro error es olvidar los dos trucos que mantienen rápida la búsqueda del representante de un grupo. Sin acortar el camino hacia el representante y sin cuidar cuál grupo cuelga de cuál, en el peor de los casos la cadena de representantes podría volverse larguísima, y las búsquedas dejarían de ser rápidas.

También es fácil pasar por alto los casos raros: un solo nodo sin ninguna conexión ya es, por sí mismo, un árbol válido; un grafo partido en dos o más pedazos sueltos nunca es válido, aunque ninguno de los pedazos tenga lazos por dentro; y una conexión repetida entre los mismos dos nodos cuenta como si cerrara un lazo, aunque a simple vista parezca inofensiva.

Por último, conviene explicar en la entrevista por qué revisar solamente "no tiene lazos" no basta por sí solo, y por qué revisar solamente "está todo conectado" tampoco basta por sí solo: se necesitan las dos condiciones juntas, y el atajo de contar conexiones es lo que te permite comprobar la segunda casi gratis en cuanto compruebas la primera.
