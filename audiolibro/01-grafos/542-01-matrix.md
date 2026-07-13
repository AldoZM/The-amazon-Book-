# 542. 01 Matrix

Dificultad: Media.

## El problema, en palabras simples

Imagina una cuadrícula donde cada casilla tiene el valor cero o el valor uno. Lo que se pide es construir un nuevo mapa, del mismo tamaño, donde cada casilla contenga la distancia hasta el cero más cercano, contando solamente pasos hacia arriba, abajo, izquierda o derecha, y donde moverse de una casilla a su vecina pegada cuenta como un paso. Las casillas que ya tienen un cero, por supuesto, tienen distancia cero.

## La idea central

Piensa en una cuadrícula llena de charcos, donde cada casilla marcada con cero es un charco, y el resto son terrenos secos. Ahora imagina que, exactamente al mismo tiempo, empieza a llover con muchísima fuerza en todos los charcos a la vez, y el agua comienza a extenderse desde cada charco hacia las casillas secas de al lado, como una onda que avanza un paso por minuto. La primera vez que la onda de agua toca una casilla seca, forzosamente viene del charco más cercano posible, porque si hubiera un charco más cerca, la onda de ese charco la habría tocado antes. Entonces, el minuto exacto en que una casilla se moja por primera vez es justo su distancia al charco más próximo. La estrategia, entonces, no es salir desde cada casilla seca a buscar su cero más cercano uno por uno, que sería lentísimo, sino soltar todas las ondas de agua al mismo tiempo desde todos los charcos, y dejar que se expandan juntas, capa por capa.

## Cómo funciona el algoritmo, paso a paso

Primero, recorremos la cuadrícula completa una vez, y a cada casilla que tiene el valor cero le asignamos distancia cero de inmediato, y la anotamos como punto de partida de la expansión. A cada casilla que tiene el valor uno le asignamos, por ahora, una distancia desconocida, como si dijéramos "todavía no sé qué tan lejos está".

Después, organizamos todos esos puntos de partida en una cola, que es una fila de espera donde el primero en entrar es el primero en salir, y empezamos a procesarla en orden, capa por capa, siguiendo la técnica de exploración en anchura, o Breadth-First Search, conocida también como BFS. Como aquí arrancamos desde muchos puntos de partida a la vez, en lugar de uno solo, a esta variante se le llama BFS multi-fuente.

En cada paso, sacamos de la cola la casilla que está al frente, y miramos a sus cuatro vecinas: arriba, abajo, izquierda y derecha. Para cada vecina, revisamos si llegar a ella pasando por la casilla actual le da una distancia mejor que la que tenía anotada hasta ahora, es decir, si la distancia de la casilla actual más uno es menor a lo que la vecina tenía guardado. Si es así, le asignamos esa nueva distancia mejorada a la vecina, y la agregamos al final de la cola para que, más adelante, ella también pueda propagar la onda hacia sus propias vecinas.

Este proceso continúa hasta que la cola se vacía por completo, momento en el cual ya no queda ninguna casilla a la que se le pueda mejorar su distancia. Cuando eso ocurre, el mapa de distancias que construimos es exactamente la respuesta.

## Por qué esta complejidad

En cuanto al tiempo, cada casilla entra a la cola de espera una única vez, porque en el momento en que le asignamos su distancia definitiva ya no vuelve a mejorar, así que no se procesa dos veces. Como recorremos primero la cuadrícula completa para encontrar los ceros iniciales, y después cada casilla se procesa una sola vez más durante la expansión, el trabajo total depende solamente del número total de casillas, es decir, filas multiplicado por columnas.

En cuanto al espacio, necesitamos un mapa del mismo tamaño que la cuadrícula para guardar las distancias que vamos calculando, y también necesitamos la cola de espera, que en el peor de los casos —una cuadrícula con muchísimos ceros repartidos— puede llegar a contener una cantidad de casillas comparable al tamaño total del mapa.

## Errores comunes y tips de entrevista

Un error frecuente es intentar resolver el problema calculando, para cada casilla con valor uno, la distancia a todos los ceros por separado; esto funciona para mapas pequeños, pero se vuelve muy lento cuando el mapa crece, porque se repite trabajo una y otra vez para casillas que están cerca unas de otras.

Otro error común es olvidar arrancar la expansión desde todos los ceros al mismo tiempo, y en cambio hacerlo desde uno solo primero y luego desde otro; eso rompe la garantía de que la primera vez que una casilla se toca sea justamente por su cero más cercano, y puede dar distancias incorrectas.

También conviene explicar en la entrevista, en voz alta, por qué funciona la garantía de "primera vez que se toca, distancia correcta": como todas las ondas avanzan al mismo ritmo, un paso por turno, la onda que llega primero a una casilla necesariamente recorrió el camino más corto posible.

Por último, vale la pena mencionar que existe una alternativa sin cola, resolviendo el problema con programación dinámica en dos pasadas —una revisando el mapa de arriba hacia abajo y de izquierda a derecha, y otra en el sentido contrario—, combinando en cada pasada la mejor distancia posible usando lo ya calculado; es una buena forma de mostrar que conoces más de un camino para resolver el mismo problema.
