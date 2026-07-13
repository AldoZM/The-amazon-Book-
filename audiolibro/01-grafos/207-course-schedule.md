# 207. Course Schedule

Dificultad: Media.

## El problema, en palabras simples

Imagina que existe un total de cursos, numerados desde el cero, y una lista de reglas de prerrequisito: cada regla dice algo como "para poder tomar tal curso, primero hay que haber tomado tal otro". Puede haber muchas reglas, y algunas se encadenan unas con otras, formando cadenas largas de dependencias. Lo que se pide es responder una sola pregunta: ¿existe alguna manera de tomar absolutamente todos los cursos, respetando todas las reglas, sin quedarte nunca atorado esperando algo que jamás se va a poder cumplir?

## La idea central

Piensa en un corcho de oficina, de esos que se usan para planear un proyecto, lleno de tarjetas de tareas pegadas con tachuelas, y con hilos de estambre que conectan unas tarjetas con otras. Cada hilo significa "esta tarea no puede empezar hasta que termine aquella otra a la que apunta el hilo". Si te paras frente al corcho y buscas una tarjeta que no tiene ningún hilo llegando a ella, la puedes arrancar sin ningún problema, porque no depende de nada más. Pero si te fijas en un grupo de tarjetas que se apuntan entre sí formando un círculo cerrado —la tarjeta uno apunta a la dos, la dos apunta a la tres, y la tres apunta de regreso a la uno— entonces ninguna de esas tres se puede arrancar jamás, porque cada una está esperando a que otra termine primero, y ninguna termina nunca. Ese círculo cerrado es justamente lo que vuelve imposible el plan completo. Entonces la estrategia natural es: ir arrancando del corcho, una por una, todas las tarjetas que ya se quedaron sin ningún hilo llegándoles, y comprobar si al final logramos arrancarlas absolutamente todas.

## Cómo funciona el algoritmo, paso a paso

Primero recorremos toda la lista de reglas y, para cada curso, anotamos dos cosas: cuáles son los cursos que dependen directamente de él, y cuántos prerrequisitos le hacen falta todavía para poder tomarse, es decir, cuántos hilos le llegan en este momento.

Después juntamos, en una cola de espera, a todos los cursos que desde el principio no tienen ningún prerrequisito pendiente, porque esos se pueden tomar de inmediato, sin esperar nada.

Luego empezamos a sacar cursos de la cola de espera, uno a la vez. Cada vez que sacamos un curso, lo marcamos como tomado y sumamos uno a un contador de cursos completados. A continuación, revisamos la lista de cursos que dependían directamente de este que acabamos de tomar, y a cada uno de ellos le restamos uno a su cantidad de prerrequisitos pendientes. Si algún curso, después de restarle, se queda sin ningún prerrequisito pendiente, lo metemos a la cola de espera para procesarlo más adelante.

Repetimos este mismo proceso —sacar un curso, marcarlo como tomado, sumar al contador, y liberar a sus dependientes— hasta que la cola de espera se quede completamente vacía.

Al final, comparamos el contador de cursos completados contra el número total de cursos que existían desde el inicio. Si los dos números coinciden, quiere decir que logramos tomar absolutamente todos los cursos, así que la respuesta es que sí es posible. Si el contador se quedó corto, quiere decir que algunos cursos nunca lograron quedarse sin prerrequisitos pendientes, porque estaban atrapados en un círculo de dependencias que se piden entre sí, y entonces la respuesta es que no es posible.

## Por qué esta complejidad

En cuanto al tiempo, revisamos cada curso una sola vez para meterlo o sacarlo de la cola de espera, y revisamos cada regla de prerrequisito una sola vez, justo en el momento en que liberamos al curso que depende de ella. Como no repetimos ese trabajo en ningún momento, el tiempo total crece de forma proporcional a la cantidad de cursos más la cantidad de reglas, y no se puede hacer más rápido que eso, porque cuando menos hay que leer todas las reglas una vez para descubrir si existe algún círculo escondido entre ellas.

En cuanto al espacio, necesitamos guardar, para cada curso, la lista de quiénes dependen de él y cuántos prerrequisitos pendientes tiene en este momento, así que el espacio que usamos también crece de forma proporcional a la cantidad de cursos más la cantidad de reglas.

## Errores comunes y tips de entrevista

Un error muy común es confundir la dirección de la dependencia: si para tomar un curso hace falta otro, el hilo debe apuntar desde el prerrequisito hacia el curso que lo necesita, y no al revés. Si se te invierte esa dirección en algún momento del código, el resultado sale mal aunque el resto de la lógica esté perfecta.

Otro error frecuente es olvidar el caso en el que no hay ninguna regla de prerrequisito: ahí la respuesta siempre es que sí se puede tomar todo, porque cada curso ya nace sin ningún hilo llegándole.

También vale la pena mencionar, en la entrevista, que este mismo problema se puede resolver de dos maneras distintas: yendo curso por curso liberando prerrequisitos con una cola, como hicimos aquí, o explorando el dibujo de dependencias hacia el fondo y marcando con colores a los cursos que estás visitando en ese momento, para detectar si te vuelves a topar con uno que ya estabas visitando —eso sería el círculo cerrado—. Explicar las dos formas y por qué eligen una u otra muestra que entiendes el problema más allá de memorizar un solo camino.

Por último, no olvides comentar en voz alta los casos raros: un curso que no tiene ningún prerrequisito y del que tampoco depende nadie más, un círculo cerrado que atrapa solamente a un grupo pequeño de cursos mientras el resto sí se puede tomar sin problema, y la posibilidad de que la misma regla de prerrequisito aparezca repetida en la lista.
