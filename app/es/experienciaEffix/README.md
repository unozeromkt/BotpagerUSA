# experienciaEffix · Groovy + BotPager

Ruta de la experiencia animada: `/es/experienciaEffix` (nombre corregido).
La ruta `/es/feriaEffix2026` y su recorrido anterior siguen disponibles.

## Uso durante la feria

1. Abrir `/es/experienciaEffix`, escribir el negocio y añadir opcionalmente su descripción y logo.
2. Pulsar «Ver mi negocio en acción» para la animación con audio, o elegir el modo paso a paso.
3. Explorar los mockups finales, la comparación antes/después y la oferta del 50% OFF. A los cinco segundos se propone el formulario con el desplazamiento existente.

La auditoría es un recorrido independiente en `/es/AuditoríaEffix`, con su código y API en `app/es/AuditoríaEffix`. La URL anterior `/ExperieciaEffix` redirige a la experiencia animada corregida.

Los parámetros existentes `utm_source`, `utm_medium`, `utm_campaign`, `utm_content` y `tag_id` se conservan para atribución. No añadir nombres, teléfonos ni correos a la URL.

## Código y recursos

- `experience.tsx`: entrada, controles, accesibilidad, pausa por visibilidad y reloj único con `requestAnimationFrame`.
- `timeline.ts`: nueve fases y tiempos 0–9–19–30–40–49–60–71–81–96. Cada fase identifica su responsable: Groovy, BotPager o ambos.
- `brand-scenes.tsx`: antes/después de la identidad, plan digital y embudo de ejemplo calculado a partir de supuestos explícitos.
- `scenes.tsx`: estudio SVG multicapa, equipo creativo, set, edición, dos reels con interfaz de reproducción, imágenes en formato cuadrado/carrusel, publicación, web, documentos, chat y CRM.
- `experience.module.css`: profundidad, encuadres responsive y transformaciones entre objetos. La ficha de cliente se conserva entre el chat y el CRM. View Transitions conecta el escenario con el formulario en navegadores compatibles; hay transición simple de respaldo.
- `contact.tsx`: formulario y adaptador a las API existentes de lead, agenda, reserva y coordinación.
- Logos locales reutilizados: `public/es/experienciaEffix/groovy-logo-transparent.png` (PNG transparente proporcionado por el usuario) y `public/images/botpager-isotype.png`. No se descargan imágenes de terceros al reproducir. Si se añade un logo y la IA está disponible, la generación comienza en segundo plano al iniciar el recorrido.

Las escenas son ilustrativas y no realizan solicitudes a las API del CRM. «Cliente de ejemplo» es el comprador; el negocio del visitante es propietario del CRM. El cierre simulado requiere la decisión del cliente y la confirmación del equipo.

## Logo, mockups e IA generativa

- `brand-assets.tsx`: carga de logo/foto, normalización PNG (máximo 1.000 px por lado), eliminación de metadatos al redibujar y un color dominante. Entrada de hasta 12 MB; se rechazan SVG/HEIC y archivos que el navegador no puede decodificar. El selector de cámara usa `capture="environment"`; depende del móvil y no se ha verificado en un teléfono físico.
- `mockups.tsx`: reel vertical animado, feed de nueve piezas y merchandising (bolsa, taza y tarjetas). Los mockups deterministas usan el logo exacto y están identificados como composiciones sin IA. «Antes / Después» compara la imagen original con sus aplicaciones y pausa la reproducción para explorarlas. No genera un archivo de video final.
- `generation.ts` y `api/mockups/route.ts`: OpenAI Images Edit API, reutiliza `OPENAI_API_KEY` del servidor. Modelo configurable con `EFFIX_IMAGE_MODEL`, por defecto `gpt-image-1.5`; una imagen WebP con tres paneles para las aplicaciones. Se usa como fondo sin reemplazar el logo original de las capas de interfaz. El modelo puede reinterpretar detalles dentro de la imagen generada: es un concepto visual para revisión.
- No hay casilla ni botón de generación: la pantalla de entrada avisa que, al iniciar con un logo, se enviarán el nombre, la descripción opcional y la imagen a OpenAI. La generación corre durante el recorrido y la propuesta aparece solo al final. Si termina después de la animación, el cierre espera a que esté lista y la carga de la imagen visible antes de contar sus cinco segundos de lectura. La respuesta no se guarda en disco ni en el CRM; vive en la sesión del navegador. Cambiar nombre/descripción/logo cancela la solicitud anterior y evita mostrar resultados de otro negocio. Cancelar una solicitud ya aceptada por el proveedor no garantiza evitar su coste.
- Sin clave se ofrece la experiencia con composiciones locales y un mensaje explícito de disponibilidad. Nunca se atribuye generación de IA a estos mockups. Timeout de 150 segundos, error recuperable, sin reintentos automáticos ni porcentajes ficticios de avance.
- Límites por instancia: dos generaciones simultáneas, treinta inicios por hora y cuerpo limitado a 2,8 MB, incluso en streaming. Son defensas del servidor local de feria; antes de exposición pública con varias instancias, usar autenticación de operador y límites compartidos en el proveedor/plataforma. No se ha publicado este endpoint.

La API sigue la [documentación oficial de edición de imágenes](https://developers.openai.com/api/reference/resources/images/methods/edit). La clave se configura en `.env.local` del servidor, no en `.env.example`. Las pruebas automatizadas usan un proveedor simulado. Se verificó además una generación real con el logo público de Groovy y una descripción de agencia creativa: la respuesta de 1.536 × 1.024 px mostró una campaña editorial y merchandising acordes al contexto. En el navegador se comprobó el audio activo durante la generación y el desplazamiento posterior al formulario (20 px del borde superior). `EFFIX_IMAGE_GENERATION_ENABLED=false` permite desactivarla.

## Música y locución

`audio-track.tsx` admite una pista única de música + voz. La pista proporcionada por el usuario ya está incluida en `public/es/experienciaEffix/recorrido.mp3` (74,214 s, 1.715.830 bytes). El visitante puede probar cinco segundos de sonido antes de iniciar. La reproducción comienza con volumen activo al pulsar el botón de inicio; se puede desmarcar «Reproducir con música y locución» o silenciar durante el recorrido. Su reloj dirige las escenas y acompaña pausa, saltos, repetición y pestaña oculta. Si el navegador tarda en cargar metadatos o bloquea la pista, el recorrido empieza igualmente y avanza con su propio reloj. El modo manual no reproduce la pista. No se incorpora música ficticia ni una locución sintetizada.

Ver `AUDIO.md` para el guion orientativo, tiempos y ruta del MP3 definitivo. La pista final ya está incorporada sin modificar la voz o la mezcla. La web entra al segundo 45 de la pista incluida. Los demás tramos se interpolan a ambos lados; no son marcas alineadas palabra a palabra. Las pruebas iniciales usaron un WAV silencioso temporal; la pista real se verifica también en el navegador.

## Marca, estrategia y oferta

Groovy participa en propuesta, branding, estrategia digital, producción y difusión. BotPager entra en la web con IA y continúa con atención y CRM. El cierre pertenece al equipo comercial del negocio. La comparación final presenta ambos aportes.

El resultado final incluye reels, feed social, merchandising, un chatbot y un panel CRM ilustrativo. Cuando se usa el componente sin diagnóstico, permanece a la vista cinco segundos y luego desplaza la página con una curva elástica hasta el formulario; el visitante puede ir allí antes o detener el desplazamiento explorando la página. La preferencia de movimiento reducido evita la animación.

El ejemplo usa 1.000 → 1.500 visitas, 2% → 3% de consultas y un cierre constante del 20%. El cálculo produce 20 → 45 consultas y 4 → 9 ventas: +50% en visitas y +125% en las otras dos medidas. Son supuestos del mismo período, no cifras de un cliente, una atribución causal demostrada ni resultados garantizados. Se identifican como simulación en pantalla y deben sustituirse por datos autorizados para presentar un caso real.

La pantalla final anuncia «Solo por feria · 50% OFF · En la contratación de todos los servicios · Groovy + BotPager», conforme a lo solicitado. Este mensaje no activa descuentos, cobros, contratos ni las automatizaciones de la campaña anterior.

## Integración y despliegue

Se reutiliza `/es/feriaEffix2026/api/*`, sin duplicar una aplicación ni credenciales. El origen `groovy-botpager`:

- No exige ni inventa sector/objetivo.
- Guarda el contexto «Groovy + BotPager: recorrido completo» y el consentimiento exacto en la nota existente.
- Conserva identificación por teléfono, oportunidad por negocio, atribución del vendedor, recibos firmados y recuperación de reintentos.
- Crea oportunidades abiertas en la primera etapa actual del pipeline Feria Effix, consultada en GHL en cada registro. No activa beneficios, no añade etiquetas que disparan la promoción anterior, no cambia una venta a ganada y no retrocede oportunidades existentes.
- Mantiene marketing opcional de BotPager separado del contacto por esta solicitud. No autoriza transferencia ni marketing de Groovy. Se amplió el aviso de privacidad existente con el alcance del nuevo recorrido.
- Confirma únicamente cuando la API devuelve un recibo real; agenda y coordinación requieren ese recibo.

Este entorno muestra **Modo demostración**: no está habilitado para guardar contactos reales. No se creó ningún contacto, oportunidad, cita ni campaña real durante la implementación. Las pruebas de éxito usan un simulador de GHL y no acreditan una prueba en producción.

Para habilitar la conexión, usar la configuración ya documentada en `../feriaEffix2026/README.md` y `.env.example` del repositorio: el mismo `GHL_PRIVATE_INTEGRATION_TOKEN` de BotPager, `GHL_USER_ID`, `EFFIX_RECEIPT_SECRET` de al menos 32 caracteres, `EFFIX_ENABLED=true` y `EFFIX_PRIVACY_APPROVED=true`. La subcuenta `ue94rPvevtVT7o7wCQt2` y el pipeline `4o6WiPB5RnPKn70WzABN` están configurados en `../feriaEffix2026/_lib/crm.ts`; la primera etapa se resuelve desde la API. No se necesitan variables con IDs de pipeline o etapa inicial. Este recorrido no depende de las fechas de la promoción original. Para agendar hacen falta calendario y etapa de reserva; para coordinar, la etapa de coordinación. No se reemplazan las credenciales ni la ubicación global de los demás formularios de BotPager.

Desde la raíz del repositorio:

```sh
npm run dev
# http://localhost:3000/es/experienciaEffix

npm run test:effix
npm run build
npm run start
```

El proyecto requiere un servidor Next.js/Node para guardar, firmar recibos y consultar GHL. No es un paquete puramente estático. No se cambió la configuración de exportación del sitio ni se publicó esta experiencia.

## Verificación · 13 de octubre de 2026

- Compilación de producción y TypeScript correctos.
- Nueve pruebas de mockups/API y tiempos: validación de nombre, logo y descripción, origen, tamaño de cuerpo, ausencia de clave, contrato del proveedor, errores, concurrencia y límites de etapas. Ejecutar `node --test app/es/experienciaEffix/tests/mockups.test.cjs`.
- 18 pruebas de integración correctas: incluye regresión del flujo anterior, validación de WhatsApp, consentimiento, nombre de 1/50 caracteres, atribución, reintentos, varias empresas por teléfono, reservas y coordinación con GHL simulado.
- Revisión visual en navegador de las nueve fases con «Café Aurora», reproducción automática, pausa/continuación, avance manual, salto, repetición y cambio de negocio.
- Carga del logo real de prueba, color extraído y comparación Antes/Después comprobadas. Reproductor probado con pista silenciosa de 96 s: carga, avance, pausa, salto al segundo 30 y mute sin reanudar una pausa.
- Prueba a 320 px y con 50 caracteres sin espacios: sin desbordamiento horizontal; nombre completo conservado en saludo y formulario. Se abrevia en piezas pequeñas.
- Comprobado el estado de integración ausente: error explícito, datos conservados, sin éxito ficticio.
- No se dispuso de teléfono físico ni de un CRM habilitado para un envío real. La preferencia del sistema y `visibilitychange` se implementaron; el modo manual se comprobó en navegador.

## Peso de carga

`load-budget.json` contiene el inventario medido mediante solicitudes HTTP locales al build de producción. `measure-load.cjs` permite repetirlo con el servidor iniciado:

```sh
node app/es/experienciaEffix/measure-load.cjs
```

La medición solicita gzip y cuenta los bytes efectivamente recibidos de cada cuerpo HTTP. Es una **cota conservadora**, no una captura de red de un teléfono: incluye todos los subconjuntos y formatos de fuentes referenciados por CSS, aunque el navegador solo descarga los que utiliza. Incluye también el runtime, CSS, fuentes compartidos con el sitio y la pista predeterminada completa. No incluye cabeceras HTTP.

Compilación final con audio: 103 recursos, **3.249.100 bytes transferidos (~3,25 MB)** y **3.976.453 bytes sin compresión (~3,98 MB)**. La cota conservadora incluye el MP3 completo, recursos compartidos y fuentes no utilizadas. Supera el objetivo inicial de 3 MB al incorporar el audio original; el navegador usa `preload="metadata"` y puede pedir rangos del MP3. Los logos locales y las imágenes generadas bajo demanda no forman parte de esa medición. No se incorporaron vídeos, fuentes ni motores 3D adicionales.
