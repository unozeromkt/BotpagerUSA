# Pista única · Groovy + BotPager

Pista recibida: **experiencia_effix combinado.mp3**, incorporada como `public/es/experienciaEffix/recorrido.mp3`. Duración: **74,214 segundos**; MP3 estéreo a 44.100 Hz. Se conserva el archivo original, sin modificar voz, velocidad ni mezcla.

La guía original contempla **96 segundos**; la pista recibida dirige la reproducción y fija la entrada de Web + IA en el segundo 45, señalado por el usuario. Los demás cambios se interpolan a cada lado de esa marca. Evitar el nombre de un negocio concreto: el nombre y el logo cambian con cada visitante. Mantener la voz claramente por encima de la música.

La reproducción comienza al iniciar el recorrido. La pista predeterminada tiene sonido habilitado; solo empieza al pulsar «Ver mi negocio en acción». La entrada ofrece «Reproducir con música y locución» para empezar sin sonido, y durante el recorrido se puede silenciar o activar. Pausar, repetir o elegir una etapa mueve también la pista. En modo paso a paso el audio permanece detenido. Al ocultar la pestaña se detienen ambos relojes.

## Guía de tiempos y locución sugerida

| Tiempo | Etapa | Locución orientativa |
| --- | --- | --- |
| 00:00–00:09 | Propuesta | Toda gran marca empieza con una idea. Groovy te ayuda a definir qué ofreces, a quién ayudas y qué te hace diferente. |
| 00:09–00:19 | Branding | Tu identidad toma forma: colores, tipografía y una voz propia. El mismo negocio, con una presencia coherente que se reconoce y se recuerda. |
| 00:19–00:30 | Estrategia | Diseñamos una estrategia digital: a quién hablar, qué contar y dónde estar. Publicamos, medimos y ajustamos para acercarte a las personas indicadas. |
| 00:30–00:40 | Producción | Mira las posibilidades de tu marca: un reel, un feed con identidad y merchandising. Ideas visuales para conectar dentro y fuera de la pantalla. |
| 00:40–00:49 | Difusión | Con contenido y campañas, Groovy lleva tu propuesta a nuevas personas. Cuando alguien quiere saber más, comienza el siguiente paso. |
| 00:49–01:00 | Web + IA | Aquí entra BotPager: una web con tu identidad y un agente que utiliza la información de tu negocio para recibir y orientar cada consulta. |
| 01:00–01:11 | Atención | Cada conversación puede convertirse en una oportunidad. BotPager recibe la consulta, organiza los datos y facilita el seguimiento para que tu equipo continúe. |
| 01:11–01:21 | CRM | En el CRM, tu equipo ve las oportunidades y retoma las conversaciones con contexto. La decisión del cliente y el trabajo comercial completan el recorrido. |
| 01:21–01:36 | Crecimiento y cierre | Marca, estrategia y seguimiento conectados. Estas cifras son una simulación, no una promesa. Imagina el siguiente paso para tu negocio: solo por feria, cincuenta por ciento de descuento en la contratación de todos los servicios. |

Los textos son una guía de grabación, no audio incorporado. Ajustar el ritmo y las pausas al grabar; no acelerar artificialmente la voz para entrar en una ventana.

## Incorporación

- Para probar: «Preparar música y locución» en la entrada permite cargar MP3, M4A, WAV u OGG, hasta 30 MB. Se usa una URL temporal local; el archivo no se sube al servidor y se libera al salir.
- Para dejar una pista predeterminada: colocar el MP3 final en `public/es/experienciaEffix/recorrido.mp3`. La página detecta ese archivo al renderizar; incluirlo en la siguiente compilación/despliegue.
- Si la duración es distinta, el recorrido sigue el reloj real del audio y distribuye proporcionalmente los nueve tramos. Esto evita deriva de reproducción, pero no identifica las palabras: hay que revisar los puntos de cambio frente a la locución y ajustar `timeline.ts` si el guion tiene otras pausas.
- La preferencia de movimiento reducido conserva el modo manual. No se reproduce sonido automáticamente sin una acción del visitante.

La pista definitiva ya está incluida. El ancla de web está en **00:45**; los demás inicios se interpolan a cada lado, no se obtuvieron de una transcripción: 0,00; 8,27; 17,45; 27,55; 36,73; **45,00**; 51,84; 58,67 y 64,89 segundos. Termina con la pista a los 74,21 segundos. `timelineToAudio` y `audioToTimeline` comparten ese ancla para que los saltos, pausas y reanudaciones conserven la sincronía. Una pista alternativa cargada por el visitante utiliza la distribución proporcional original, porque no conocemos sus marcas.
