# 76. Minimum Window Substring

Dificultad: Difícil.

## El problema, en palabras simples

Tenemos una cadena larga de texto y una segunda cadena más chica que funciona como una lista de caracteres que necesitamos reunir, contando repeticiones: si la lista pide dos veces la misma letra, hace falta encontrar esa letra dos veces. Queremos encontrar el tramo continuo más corto dentro de la cadena larga que, entre todos sus caracteres, contenga por lo menos esa cantidad de cada letra pedida. Si ningún tramo logra reunir la lista completa, la respuesta es una cadena vacía.

## La idea central

Piensa en armar una canasta de mercado mientras caminas en línea recta por un mercado muy largo, sin poder retroceder ni saltarte puestos: solo puedes ir avanzando puesto por puesto y decidir en qué momento cerrar la canasta. Tienes una lista de compras y vas metiendo a la canasta todo lo que encuentras en el camino. En cuanto notas que ya reuniste todo lo que pedía la lista, empiezas a sacar cosas de la canasta por el lado donde entraste primero, mientras la lista siga completa, para ver si puedes quedarte con un tramo más corto. En cuanto sacar algo más rompería la lista, te detienes, anotas ese tramo si fue el más corto hasta ahora, y sigues caminando hacia adelante para buscar la siguiente oportunidad.

## Cómo funciona el algoritmo, paso a paso

Primero, contamos cuántas veces aparece cada letra en la lista de compras, y anotamos cuántas letras distintas hay que cubrir en total.

Luego, empezamos a caminar con dos marcadores sobre la cadena larga: uno que marca el principio del tramo actual y otro que marca el final, y ambos arrancan al principio de la cadena.

El marcador del final va avanzando de a uno, y cada vez que se detiene en una letra, la agregamos a la canasta actual, sumando uno a su conteo dentro del tramo. Si esa letra era una de las que pedía la lista, y justo con esta agregada ya alcanzamos la cantidad exacta que se necesitaba de ella, entonces sumamos uno a un contador de cuántas letras de la lista ya quedaron completamente cubiertas.

Cuando ese contador de letras cubiertas llega a ser igual a la cantidad total de letras distintas que pedía la lista, sabemos que el tramo actual ya cumple con todo lo pedido. En ese momento, comparamos el tamaño de este tramo contra el mejor tramo que hayamos encontrado hasta ahora, y si es más corto, lo guardamos como la nueva mejor respuesta.

Después de guardar esa comparación, tratamos de encoger el tramo desde el marcador del principio: quitamos la letra donde está ese marcador, restamos uno a su conteo dentro del tramo, y si esa resta hace que una letra de la lista deje de estar cubierta, restamos uno al contador de letras cubiertas. Avanzamos el marcador del principio una posición y, si el tramo sigue estando completo, repetimos esta contracción una y otra vez, guardando cada vez que encontremos un tramo todavía más corto, hasta que quitar una letra más rompa la cobertura.

Cuando ya no se puede encoger más sin romper la lista, volvemos a mover el marcador del final hacia adelante y repetimos todo el proceso, hasta llegar al final de la cadena larga.

Al terminar, si nunca logramos cubrir la lista completa, la respuesta es una cadena vacía; si sí lo logramos, la respuesta es el tramo más corto que hayamos guardado en el camino.

## Por qué esta complejidad

En cuanto al tiempo, el marcador del final recorre la cadena larga una sola vez de principio a fin, y el marcador del principio, aunque se mueve dentro de varios ciclos de contracción, en total tampoco puede avanzar más posiciones que el tamaño de la cadena larga, porque nunca retrocede. Sumando ambos recorridos, el trabajo total crece de forma proporcional al tamaño de la cadena larga más el tamaño de la lista de compras, sin necesidad de repetir comparaciones desde cero para cada tramo posible.

En cuanto al espacio, lo que guardamos son dos conteos de letras: uno para lo que pide la lista de compras y otro para lo que hay actualmente en el tramo. Ambos conteos dependen de cuántas letras distintas puede haber, así que su tamaño está acotado por eso, no por el tamaño completo de la cadena larga.

## Errores comunes y tips de entrevista

Un error muy frecuente es tratar la lista de compras como si solo importara si una letra está presente o no, sin contar cuántas veces se necesita; esto falla en cuanto la lista pide una letra repetida, porque el tramo encontrado tendría menos ocurrencias de las necesarias.

Otro error es confundir el momento de guardar la mejor respuesta con el momento de intentar encoger el tramo: hay que guardar la comparación cada vez que el tramo está completo, no solo la primera vez que se completa, porque encoger el tramo puede seguir dando tramos válidos más cortos varias veces seguidas.

También conviene decir en voz alta, antes de programar, qué pasa en los casos límite: si cualquiera de las dos cadenas está vacía, la respuesta es una cadena vacía; y si la lista de compras pide más repeticiones de una letra de las que existen en toda la cadena larga, tampoco hay solución posible, y también se devuelve una cadena vacía. Mencionarlo desde el principio evita sorpresas al final de la entrevista.
