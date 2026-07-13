# 126. Word Ladder II

Dificultad: Difícil.

## El problema, en palabras simples

Este problema es primo hermano del anterior, Word Ladder. Otra vez nos dan una palabra inicial, una palabra final y una lista de palabras permitidas, y otra vez la regla es que cada paso cambia exactamente una letra y la palabra resultante tiene que existir en la lista. Pero aquí ya no basta con saber cuántos pasos tiene el camino más corto: ahora se nos pide devolver todas y cada una de las secuencias de transformación que logran esa longitud mínima, ni una más larga ni una más corta. Si hay varias formas distintas de llegar de la palabra inicial a la final en el mismo número mínimo de pasos, hay que entregarlas todas. Si la palabra final resulta inalcanzable, la respuesta es una lista vacía.

## La idea central

Piensa otra vez en el juego de mesa de casillas conectadas cuando dos palabras se diferencian en una sola letra, pero ahora imagina que en vez de un solo jugador buscando la ruta más corta, hay un grupo entero de corredores que salen todos desde la misma casilla inicial y avanzan juntos, en oleadas, exactamente igual que en el problema anterior. La diferencia está en lo que anotamos: cada vez que un corredor llega a una casilla nueva, apuntamos de qué casilla venía, como si anotáramos quién es su padre en un árbol genealógico. Como una misma casilla puede ser alcanzada, en la misma oleada, desde varias casillas distintas de la oleada anterior, una palabra puede terminar teniendo varios padres, no solo uno. Cuando la exploración termina, tenemos armado un árbol genealógico completo de cómo se llegó a cada palabra. Para obtener todos los caminos más cortos, entonces, ya no hace falta seguir explorando: solo hay que empezar en la palabra final y caminar hacia atrás, siguiendo cada uno de los padres posibles, hasta llegar de regreso a la palabra inicial. Como solo anotamos padres que pertenecen a la oleada inmediatamente anterior, cualquier camino que arme siguiendo esos padres tiene garantizado ser de la longitud mínima.

## Cómo funciona el algoritmo, paso a paso

Este algoritmo tiene dos fases muy distintas: primero exploramos por oleadas anotando padres, y después reconstruimos los caminos completos caminando hacia atrás desde esos padres.

En la primera fase, empezamos la exploración desde la palabra inicial, tratándola como la única palabra de la primera oleada. Antes de procesar cada oleada, quitamos de la lista de palabras disponibles a todas las palabras que forman parte de esa oleada, para que ninguna oleada futura pueda regresar hacia ellas; si una oleada más lejana pudiera regresar a una palabra ya alcanzada, esa palabra dejaría de representar el camino más corto hacia ella.

Luego, para cada palabra de la oleada actual, generamos todas sus posibles variantes cambiando, una por una, cada posición de la palabra por cada letra del abecedario. Cada variante que resulte válida, es decir, que todavía esté disponible en la lista de palabras, la agregamos a la siguiente oleada, y anotamos en nuestra libreta de padres que esa variante puede alcanzarse desde la palabra actual. Si varias palabras de la oleada actual logran llegar a la misma variante, todas ellas quedan anotadas como padres de esa variante, sin descartar ninguna.

Si en algún momento una de esas variantes resulta ser justamente la palabra final, marcamos que ya la encontramos, pero no nos detenemos de inmediato: terminamos de procesar toda la oleada actual, porque podría haber más de un padre que también llegue a la palabra final en esa misma oleada, y no queremos perdernos ninguno.

Repetimos este proceso, oleada tras oleada, hasta que encontremos la palabra final, o hasta que una oleada salga completamente vacía, lo cual significaría que resulta imposible llegar hasta ella.

En la segunda fase, si sí logramos encontrar la palabra final, reconstruimos los caminos. Empezamos parados en la palabra final y vamos retrocediendo: en cada palabra, revisamos su lista de padres y, para cada uno de ellos, probamos seguir retrocediendo por esa rama hasta llegar a la palabra inicial. Cuando por fin llegamos hasta la palabra inicial siguiendo alguna rama, ese recorrido completo se guarda como uno de los caminos válidos. Cuando terminamos de explorar todas las ramas posibles de un padre, regresamos un paso para intentar la siguiente rama, exactamente con el mismo espíritu de probar, retroceder e intentar otra opción que se usa en backtracking. Como armamos cada camino yendo de la palabra final hacia la inicial, al terminar cada uno lo volteamos, para que quede en el orden correcto, de inicio a fin.

## Por qué esta complejidad

En cuanto al tiempo, la primera fase, la de explorar por oleadas, cuesta exactamente lo mismo que en el problema anterior: para cada palabra probamos cambiar cada una de sus letras por cada letra del abecedario, y eso se repite para todas las palabras de la lista. A ese costo hay que sumarle el trabajo de reconstruir todos los caminos en la segunda fase, y ese trabajo puede crecer muchísimo cuando existen muchas bifurcaciones distintas, porque cada bifurcación multiplica la cantidad de caminos posibles. Esa parte no es un defecto de nuestra manera de resolverlo, sino algo inherente al problema: si en verdad existen muchísimos caminos más cortos distintos, no hay forma de evitar el trabajo de escribirlos todos, porque se nos pide devolverlos todos.

En cuanto al espacio, necesitamos guardar la lista de palabras disponibles y la libreta de padres, que en el peor caso ocupa un espacio proporcional a la cantidad de palabras multiplicada por la longitud de cada una.

## Errores comunes y tips de entrevista

En una entrevista de Amazon, este problema suele plantearse justo después del anterior, como "ya encontraste la longitud del camino más corto, ahora dame todos los caminos". La clave que buscan que descubras es que anotar un solo padre por palabra pierde caminos igual de cortos que existen en paralelo; hay que permitir que una palabra tenga varios padres cuando varias palabras de la misma oleada logran alcanzarla.

Un error muy común es borrar las palabras usadas de la lista disponible una por una, en el momento en que se usan, en lugar de esperar a terminar toda la oleada. Si borras antes de tiempo, puedes impedir que otra palabra de esa misma oleada también llegue a esa variante, y terminas perdiendo caminos válidos que deberían haberse contado.

Otro error es intentar generar directamente todos los caminos con una búsqueda de tipo Depth-First Search desde el principio, sin apoyarte primero en la exploración por oleadas. Esa estrategia puede funcionar en teoría, pero se vuelve terriblemente lenta, porque explora muchísimos caminos que ni siquiera son los más cortos.

También hay que tener cuidado con detenerse demasiado pronto en cuanto se encuentra la palabra final: si paras a mitad de una oleada, puedes perderte otros padres válidos que llegan a la palabra final en esa misma oleada, y tu respuesta quedaría incompleta.

No olvides mencionar los casos raros: cuando la palabra final no está en la lista de palabras permitidas, la respuesta es una lista vacía; la palabra inicial no necesita estar en la lista, porque solo sirve como punto de partida de la cadena; y cuando solo existe un único camino más corto, sin ninguna bifurcación, el algoritmo debe seguir funcionando igual de bien y devolver ese único camino.
