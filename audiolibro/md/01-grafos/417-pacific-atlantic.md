# 417. Pacific Atlantic Water Flow

Dificultad: Media.

## El problema, en palabras simples

Imagina un terreno dibujado como una cuadrícula, donde cada casilla tiene una altura. El océano Pacífico baña todo el borde de arriba y todo el borde izquierdo del terreno; el océano Atlántico baña todo el borde de abajo y todo el borde derecho. El agua de lluvia que cae en una casilla puede escurrir hacia una casilla vecina —arriba, abajo, izquierda o derecha— solamente si esa vecina está a la misma altura o más baja, porque el agua nunca sube por sí sola. Lo que se pide es encontrar todas las casillas desde las cuales, si cae una gota de lluvia, esa gota puede terminar llegando tanto al Pacífico como al Atlántico.

## La idea central

Imagina dos equipos de rescate en una montaña llena de niebla, uno que arranca parado en la orilla del Pacífico y otro que arranca parado en la orilla del Atlántico. Cada equipo tiene una regla curiosa para subir: solo puede dar un paso hacia una casilla vecina si esa vecina está a la misma altura o más alta que donde está parado, nunca hacia abajo. Esa regla no es arbitraria: es exactamente la regla del agua, pero contada al revés. Si el agua puede bajar de una casilla vecina hacia la casilla donde estoy, entonces yo, parado en esa casilla y subiendo, sí puedo llegar hasta esa vecina. Entonces, en lugar de soltar una gota en cada una de las casillas del mapa y seguirle la pista hasta ver a qué mar llega —algo carísimo si el mapa es grande—, mandamos a los dos equipos de rescate a subir desde las orillas hacia el interior del terreno, marcando cada casilla que logran alcanzar. Al final, las casillas que ambos equipos lograron marcar son justo las casillas desde donde el agua, cayendo de verdad hacia abajo, alcanza los dos océanos.

## Cómo funciona el algoritmo, paso a paso

Primero, preparamos dos mapas de marcas del mismo tamaño que el terreno: uno para anotar qué casillas alcanza el equipo del Pacífico, y otro para anotar qué casillas alcanza el equipo del Atlántico.

Para arrancar al equipo del Pacífico, tomamos como punto de partida todas las casillas de la fila de arriba y todas las casillas de la columna de la izquierda, porque esas son las que tocan ese océano directamente, y las marcamos de inmediato.

Desde cada una de esas casillas de partida, el equipo explora hacia sus vecinas siguiendo un recorrido en profundidad, es decir, avanza por un camino hasta donde pueda y después regresa a intentar por otro lado; a esta forma de explorar se le llama Depth-First Search, o DFS. La regla para avanzar hacia una vecina es que esa vecina tenga una altura igual o mayor a la casilla actual, y que todavía no esté marcada. Cada vez que el equipo entra a una casilla nueva, la marca, y desde ahí vuelve a intentar avanzar hacia sus propias vecinas, repitiendo el mismo proceso una y otra vez hasta que ya no encuentra hacia dónde subir sin repetir terreno.

Hacemos exactamente lo mismo, por separado, para el equipo del Atlántico, pero esta vez arrancando desde la fila de abajo y la columna de la derecha, que son las que tocan ese segundo océano.

Cuando ambos equipos terminaron de explorar todo lo que podían alcanzar, recorremos el terreno completo una última vez, casilla por casilla, y nos quedamos únicamente con las casillas que quedaron marcadas por el equipo del Pacífico y también por el equipo del Atlántico al mismo tiempo. Esa lista final de casillas es la respuesta.

## Por qué esta complejidad

En cuanto al tiempo, cada equipo de rescate visita cada casilla del terreno como máximo una vez, porque en cuanto una casilla queda marcada nunca se vuelve a explorar desde ahí. Como son dos equipos independientes recorriendo el mismo terreno, el trabajo total es proporcional a dos veces el número de casillas, que en términos prácticos sigue siendo proporcional a filas por columnas del terreno, así que crece de forma directa con el tamaño del mapa.

En cuanto al espacio, necesitamos guardar las marcas de cada equipo para cada casilla del terreno, así que el espacio también crece de forma directa con filas por columnas. Además, como la exploración avanza llamándose a sí misma para seguir subiendo por las vecinas, esas llamadas pendientes ocupan espacio mientras siguen activas, y en el peor de los casos —un terreno completamente plano, por ejemplo— ese espacio puede llegar a ser tan grande como el terreno completo.

## Errores comunes y tips de entrevista

Un error muy frecuente es programar la regla de altura al revés: como estamos recorriendo el problema en reversa, es fácil confundirse y avanzar solo hacia vecinas más bajas, cuando en realidad el equipo de rescate debe subir, así que la vecina tiene que ser igual o más alta que la casilla actual.

Otro error común es intentar resolver el problema de la forma directa, soltando una gota desde cada casilla y siguiéndola hasta un océano; funciona, pero es mucho más lento, y en la entrevista conviene explicar por qué invertir el recorrido —partir de las orillas en vez de partir de cada casilla— es la clave que hace que el problema sea manejable.

También hay que tener cuidado con los casos extremos: un terreno de una sola casilla toca los cuatro bordes a la vez, así que siempre pertenece a la respuesta sin importar su altura; un terreno de una sola fila o de una sola columna hace que esa única fila o columna sea, al mismo tiempo, la orilla de los dos océanos.

Por último, no olvides las zonas completamente planas, donde varias casillas vecinas tienen exactamente la misma altura: como la regla dice "igual o más alta", el agua —y por lo tanto también el equipo de rescate— puede moverse libremente entre esas casillas sin ningún problema, y es un detalle que vale la pena mencionar en voz alta para mostrar que entendiste bien la condición del problema.
