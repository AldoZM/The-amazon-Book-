# 994. Rotting Oranges

Dificultad: Media.

## El problema, en palabras simples

Imagina una caja dividida en casillas, y en cada casilla puede haber una naranja fresca, una naranja podrida, o nada. Cada minuto que pasa, cualquier naranja podrida pudre a las naranjas frescas que están justo pegadas a ella —arriba, abajo, izquierda o derecha—. Lo que se pide es averiguar cuántos minutos tienen que pasar para que todas las naranjas frescas se pudran, o decir que eso nunca va a pasar porque alguna naranja quedó aislada y ninguna podrida puede alcanzarla.

## La idea central

Piensa en un contagio que se propaga por contacto directo: alguien enfermo solo contagia a las personas que tiene justo al lado, y esas personas, al minuto siguiente, ya pueden contagiar a las suyas. El contagio avanza en oleadas, minuto a minuto, no de una persona directamente a alguien lejano. Así que la estrategia es: en lugar de revisar naranja por naranja al azar, empezamos por identificar todas las naranjas ya podridas desde el inicio, y las tratamos como el punto de partida de la oleada. Cada minuto, la oleada avanza un paso: todas las naranjas frescas pegadas a una podrida se pudren al mismo tiempo, y se convierten en el punto de partida de la siguiente oleada. Contamos cuántas oleadas hicieron falta hasta que ya no queden naranjas frescas alcanzables.

## Cómo funciona el algoritmo, paso a paso

Primero, recorremos toda la caja una vez para encontrar dos cosas: dónde están todas las naranjas ya podridas desde el inicio, y cuántas naranjas frescas hay en total.

Si desde el principio no hay ninguna naranja fresca, la respuesta es cero minutos, porque no hay nada que pudrir.

Si hay naranjas frescas pero ninguna podrida desde el inicio, entonces esas naranjas frescas nunca se van a pudrir, así que la respuesta es que resulta imposible.

Si hay de las dos, empezamos la propagación por oleadas. Juntamos todas las naranjas podridas iniciales como la primera oleada, y ponemos el contador de minutos en cero.

En cada oleada, revisamos, una por una, las naranjas podridas de esa oleada, y miramos sus cuatro vecinas: arriba, abajo, izquierda y derecha. Cada vecina que sea una naranja fresca se pudre en este momento, se resta uno del total de naranjas frescas que nos faltan, y esa naranja recién podrida pasa a formar parte de la siguiente oleada.

Cuando terminamos de revisar todas las naranjas podridas de la oleada actual, si la siguiente oleada no está vacía, sumamos uno al contador de minutos y repetimos el proceso con esa nueva oleada.

Esto continúa hasta que una oleada sale completamente vacía, es decir, ninguna naranja podrida de esa ronda encontró naranjas frescas nuevas para pudrir.

Al terminar, revisamos si todavía queda alguna naranja fresca sin pudrir. Si no queda ninguna, la respuesta es el contador de minutos que llevamos acumulado. Si todavía queda alguna fresca, esas naranjas estaban aisladas y nunca las alcanzó ninguna podrida, así que la respuesta es que resulta imposible.

## Por qué esta complejidad

En cuanto al tiempo, recorremos la caja una primera vez para encontrar las naranjas podridas iniciales y contar las frescas, y después cada naranja se procesa como máximo una vez durante toda la propagación, porque en cuanto se pudre deja de revisarse otra vez. Entonces el trabajo total depende solamente de cuántas casillas tiene la caja: filas por columnas.

En cuanto al espacio, necesitamos guardar, en cada oleada, cuáles son las naranjas podridas de ese momento, y en el peor caso —una caja llena de naranjas podridas desde el inicio— esa oleada inicial puede ser tan grande como la caja completa.

## Errores comunes y tips de entrevista

Un error muy común es pudrir las naranjas y sumarlas a la siguiente oleada en el mismo instante en que las revisamos, mezclando naranjas de distintos minutos dentro de la misma oleada; eso hace que el conteo de minutos salga mal, porque una naranja podrida en el minuto dos podría terminar contagiando en el mismo paso que una del minuto uno.

Otro error es olvidar el caso donde no hay ninguna naranja fresca desde el inicio: la respuesta correcta es cero, no uno, porque no pasó ningún minuto de contagio.

También es fácil olvidar revisar, al final, si quedaron naranjas frescas sin alcanzar; sin ese último chequeo, el algoritmo puede devolver un número de minutos que no refleja que en realidad el resultado debía ser imposible.

En la entrevista, vale la pena explicar por qué se recorre por oleadas completas y no naranja por naranja de forma individual: es lo que garantiza que el contador de minutos represente el tiempo real de contagio, y no solo el orden en que fuiste revisando casillas.
