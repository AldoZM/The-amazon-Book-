# 1192. Critical Connections in a Network

Dificultad: Difícil.

## El problema, en palabras simples

Imagina una red de servidores conectados entre sí por cables. Cada cable conecta dos servidores y se puede recorrer en cualquier dirección. La red completa está conectada, es decir, siempre existe alguna forma de llegar de cualquier servidor a cualquier otro, quizás pasando por varios cables intermedios. Lo que se pide es encontrar todos los cables que son absolutamente indispensables: aquellos que, si se quitaran, partirían la red en dos o más pedazos separados, dejando a algún grupo de servidores sin forma de comunicarse con el resto. A esos cables indispensables se les llama conexiones críticas, y hay que devolver la lista completa de todas ellas.

## La idea central

Piensa en una red de calles entre colonias de una ciudad. Si una calle forma parte de una zona con varias rutas alternativas, como un circuito o una plaza con salidas por todos lados, cerrar esa calle por obras no incomunica a nadie, porque la gente simplemente da la vuelta por otra calle. Pero si una calle es la única forma de llegar a una colonia que está al final de un camino sin salida, cerrar esa calle sí deja aislada a toda esa colonia. Esa calle tan importante es exactamente lo que buscamos: un cable, o una calle, que es la única conexión entre una parte de la red y el resto.

Para encontrar estos cables indispensables, recorremos la red metiéndonos lo más profundo posible por un camino antes de regresar, como quien explora un laberinto siempre avanzando hacia adelante hasta toparse con un callejón sin salida, y solo entonces retrocede. Durante ese recorrido, a cada servidor le vamos anotando dos números. El primero es simplemente el turno en que lo visitamos por primera vez, como el número que te dan al llegar a una fila: el primer servidor visitado tiene el turno cero, el segundo tiene el turno uno, y así sucesivamente, y ese número, una vez asignado, ya nunca cambia. El segundo número es más interesante: representa el turno más antiguo al que ese servidor, o cualquiera de los que cuelgan de él en el recorrido, puede regresar de un salto usando como mucho un atajo hacia algún servidor visitado antes. Este segundo número sí se va actualizando, y solo puede volverse más pequeño conforme el recorrido regresa desde los servidores más profundos hacia los más superficiales.

La idea clave es esta: si desde la parte de la red que cuelga de un servidor existe algún atajo que permite trepar de regreso hasta el servidor anterior o incluso más arriba, entonces esa parte de la red tiene otra cuerda que la sostiene, y el cable que la conecta al servidor anterior no es indispensable. Pero si no existe ningún atajo así, ese cable es la única entrada y salida de esa parte de la red, y por lo tanto sí es una conexión crítica.

## Cómo funciona el algoritmo, paso a paso

Primero, construimos una representación de la red donde, para cada servidor, sabemos con qué otros servidores está conectado directamente por un cable.

Después, preparamos dos listas vacías, una para el turno de descubrimiento de cada servidor y otra para el turno más antiguo alcanzable, y las llenamos con un valor que indica que todavía no hemos visitado a nadie. También preparamos un contador de turnos que empieza en cero.

Elegimos cualquier servidor como punto de partida, ya que la red entera está conectada, así que empezar en cualquiera basta para recorrerla toda. Comenzamos el recorrido profundo desde ese servidor, recordando también quién es su servidor anterior en el recorrido, que al inicio no existe.

Cada vez que llegamos a un servidor por primera vez, le anotamos el turno actual como su valor de descubrimiento, le anotamos ese mismo turno como su valor de retorno más antiguo por ahora, y avanzamos el contador de turnos en uno.

Luego, revisamos uno por uno a todos los vecinos de ese servidor. Si un vecino es precisamente el servidor anterior por el que acabamos de llegar, lo ignoramos, porque no queremos regresar inmediatamente por el mismo cable que acabamos de cruzar.

Si el vecino todavía no ha sido visitado, entonces es un servidor nuevo que cuelga de este, así que continuamos el recorrido profundo desde ese vecino, marcando al servidor actual como su anterior. Cuando ese recorrido más profundo termina y regresamos, actualizamos el valor de retorno más antiguo del servidor actual, comparándolo con el valor de retorno más antiguo que trajo el vecino, y quedándonos con el más pequeño de los dos. Justo después de esa actualización, revisamos la condición clave: si el valor de retorno más antiguo del vecino resulta ser mayor que el turno de descubrimiento del servidor actual, eso significa que desde todo lo que cuelga de ese vecino es imposible trepar de regreso hasta el servidor actual sin usar el cable que los une, así que ese cable es una conexión crítica y lo agregamos a la lista de respuestas.

Si en cambio el vecino ya había sido visitado antes, y no es el servidor anterior, entonces encontramos un atajo hacia un servidor ya conocido. En ese caso, actualizamos el valor de retorno más antiguo del servidor actual comparándolo con el turno de descubrimiento de ese vecino, y nos quedamos con el más pequeño de los dos. Es importante usar el turno de descubrimiento del vecino en este caso, y no su valor de retorno más antiguo, porque de lo contrario estaríamos inventando atajos que en realidad no existen en el recorrido.

Repetimos este proceso hasta terminar de explorar toda la red. Al final, la lista de conexiones críticas que fuimos acumulando es la respuesta completa.

## Por qué esta complejidad

En cuanto al tiempo, el recorrido profundo visita cada servidor exactamente una vez y revisa cada cable exactamente una vez desde cada uno de sus dos extremos, así que el trabajo total depende únicamente de la cantidad de servidores más la cantidad de cables que tiene la red, y no se puede hacer más rápido, porque para estar seguros de haber encontrado todas las conexiones críticas hace falta examinar la red completa al menos una vez.

En cuanto al espacio, necesitamos guardar la representación de la red completa, más dos números por cada servidor para los turnos de descubrimiento y de retorno, más el espacio que ocupa el propio recorrido profundo mientras está activo, que en el peor caso puede llegar a ser tan grande como toda la red si el recorrido se convierte en una cadena muy larga.

## Errores comunes y tips de entrevista

El error más delicado es, al encontrar un atajo hacia un servidor ya visitado, actualizar el valor de retorno más antiguo usando el valor de retorno de ese servidor en lugar de su turno de descubrimiento. Esa confusión parece inofensiva, pero puede inventar caminos de regreso que en realidad no existen en el recorrido, y arruina el resultado final sin que sea obvio por qué.

Otro descuido común es olvidar ignorar al servidor anterior cuando revisamos los vecinos. Si no lo hacemos, el algoritmo interpreta el cable que acabamos de cruzar como si fuera un atajo hacia atrás, y ningún cable termina siendo detectado como crítico, porque cada uno parece tener siempre una forma de regresar.

También conviene aclarar en la entrevista qué pasaría si existieran dos cables distintos conectando exactamente a los mismos dos servidores. En ese caso, comparar solamente contra el servidor anterior ya no bastaría para evitar contar el cable equivocado como un atajo falso, y habría que distinguir los cables por su identidad individual en lugar de por los servidores que conectan. Vale la pena mencionar que el enunciado de este problema garantiza que eso no ocurre, pero es una buena señal reconocer la limitación.

Por último, describe los casos extremos antes de programar: una red con un solo servidor y ningún cable no tiene conexiones críticas posibles porque no hay ningún cable que quitar, y una red que forma un árbol puro, sin ningún ciclo en absoluto, tiene la propiedad de que absolutamente todos sus cables son conexiones críticas, porque ninguno tiene una ruta alterna que lo respalde.
