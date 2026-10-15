# AuditoríaEffix · Groovy + BotPager

Ruta independiente: `/es/AuditoríaEffix`. `/es/AuditoriaEffix` redirige a la misma ruta. La auditoría termina en su reporte y resumen de soluciones; el acceso a `/es/experienciaEffix` es un enlace opcional. El formulario final anuncia 50% OFF en la contratación de todos los servicios por estar en Feria Effix.

## Diagnóstico digital

`diagnostic/journey.tsx` coordina búsqueda, confirmación, preguntas, pre-reporte, contacto y reporte independiente. `scoring.ts` calcula una nota determinista, sin delegar la puntuación a un modelo. `report.tsx` muestra un resumen comercial con servicios y tecnologías; conserva fuentes, estados y metodología en un HTML descargable independiente. El reporte vive en memoria durante la sesión: recargar reinicia el diagnóstico. El CRM recibe el contacto mediante el flujo existente; no almacena automáticamente este reporte.

### Conexiones

Guardar las claves reales en `.env.local` (o variables del servidor), nunca en `.env.example` ni con prefijo `NEXT_PUBLIC_`.

- `OPENAI_API_KEY`: búsqueda web de identidades y generación visual existente. `EFFIX_DISCOVERY_MODEL` permite elegir el modelo; por defecto `gpt-5.4` con razonamiento bajo. La búsqueda usa Responses + `web_search`, solicita fuentes y descarta candidatos sin una URL respaldada por el proveedor. Fuente técnica: https://developers.openai.com/api/docs/guides/tools-web-search
- `GOOGLE_PLACES_API_KEY`: opcional, habilita Text Search (New) y Place Details (New) para ficha, estrellas, número de valoraciones, teléfono y horarios. Requiere Places API habilitada en el proyecto de Google. Una identidad debe confirmarse antes de consultar sus detalles. Con entrada web, el enlace automático exige coincidencia única de nombre y dominio. Sin credencial o coincidencia, se informa pendiente. Los datos muestran enlaces a Google Maps.
- `PAGESPEED_API_KEY`: opcional, utiliza el análisis móvil ya disponible en el proyecto. Sin respuesta válida, rendimiento queda pendiente.
- Seguidores y cantidad de publicaciones recientes de Instagram/TikTok quedan pendientes: esta versión no conecta sus cuentas ni inventa cifras de resultados de búsqueda. La continuidad del contenido se declara por el visitante.
- Se detectan señales públicas de chat, pero el uso de IA solo puede declararlo el negocio. La indexación exacta requiere Search Console; el rastreo público revisa señales básicas.

### Nota y evidencia

Pesos: Dirección creativa 15, Marketing de contenidos 15, Presencia Online y Posicionamiento de marca 15, Smart Website 20, SEO Local 10, ChatBot con IA 15, CRM y Automatización 10. La dirección creativa considera la oferta y la coherencia de identidad declarada; contenido considera continuidad; presencia considera canales y señales técnicas de descubrimiento; web considera acceso, móvil, contacto y rendimiento; SEO Local considera ficha, datos y reseñas; atención considera respuesta útil fuera de horario; CRM considera seguimiento. Estados: verificado, declarado, pendiente y no aplica. Los pendientes se excluyen del numerador y denominador; la nota global requiere 60% de cobertura. Las categorías no aplicables se excluyen. Si no existe web, se puntúa su ausencia una sola vez y se excluyen sus controles técnicos; SEO Local se conserva si el negocio atiende un mercado local. Un sitemap no localizado queda pendiente porque puede existir en otra ruta. Seguidores y tipo de chatbot son informativos; no usar IA no penaliza.

Las prioridades se ordenan por brecha ponderada y objetivo, hasta un máximo de tres servicios diferentes. Las proyecciones del recorrido siguen siendo simulaciones separadas de las evidencias del diagnóstico.

### Límites y verificación

El rastreo consulta hasta cuatro páginas públicas, valida DNS e IP en cada redirección y conecta a la dirección validada conservando la identidad TLS. No acepta redes privadas, credenciales en URLs ni puertos no estándar. El análisis HTML puede no ver contenido renderizado mediante JavaScript. Las API tienen límites de cuerpo, tiempos y concurrencia; el contador de solicitudes es local al proceso y se reinicia con él (para varios servidores se necesita un límite compartido).

Pruebas: `node --test app/es/experienciaEffix/tests/*.test.cjs app/es/AuditoríaEffix/tests/*.test.cjs app/es/feriaEffix2026/tests/flow.test.cjs`. Incluyen puntuación, datos pendientes, identidad/fuentes, errores de proveedores, origen, protección de URLs, audio, mockups y regresiones del CRM. Se verificó además el recorrido en navegador, una web pública real y la descarga HTML, sin crear contactos reales.

### Redes y presentación del resultado

Al identificar una web se consulta su portada antes de mostrar la confirmación. Se extraen Instagram, TikTok, Facebook, LinkedIn, YouTube, X y WhatsApp de encabezados, pies de página, enlaces, `sameAs` y URLs en datos de hidratación. Se reconocen dominios móviles y se descartan enlaces para compartir, publicaciones y hosts que solo imitan el nombre de una red. El análisis posterior agrega enlaces de hasta cuatro páginas. No se ejecuta JavaScript externo: perfiles cargados únicamente por solicitudes posteriores pueden requerir confirmación manual.

Los enlaces aparecen en tarjetas con íconos y rellenan los campos de Instagram/TikTok. Antes de la calificación se muestra una transición de unos tres segundos; si la consulta sigue activa, se puede continuar con datos parciales. La animación organiza las áreas, sin inventar resultados de consulta. El cierre muestra hasta tres servicios recomendados, palabras clave y tecnologías/canales posibles, con los demás servicios como opciones complementarias. Los íconos no significan que esas integraciones estén activadas en el negocio.

Verificación del ajuste: al buscar «Portada inmobiliaria sas», la confirmación rellenó Instagram `portadainmobiliariasas`, TikTok `@portadainmobiliaria` y mostró el contacto de WhatsApp extraído de su web. Se verificaron la animación, las siete categorías, el resumen comercial y el diseño móvil; 49 pruebas automatizadas correctas. Las respuestas usadas para comprobar el score fueron datos de prueba, no una evaluación real de esa empresa.

La carpeta `app/es/AuditoríaEffix` contiene el recorrido y su lógica. `app/es/AuditoriaEffix` sirve de entrada técnica para Next.js; una reescritura conserva la URL pública con tilde. La variante sin tilde redirige a la URL pública.
