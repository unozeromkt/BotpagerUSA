# Feria Effix 2026 · BotPager + Groovy

Implementación en español en **`/es/feriaEffix2026`**. Se reutilizan el proyecto Next.js, el isotipo de BotPager y la conexión de servidor `lib/integrations/highlevel.ts`. El chat general se oculta en esta ruta para mantener una sola acción principal. La microdemo es guiada, no usa IA real ni consume créditos de OpenAI.

El usuario aprobó **50% sobre la implementación inicial**, para contrataciones **del 14 al 30 de octubre de 2026**, con cierre el **30 a las 23:59:59, America/Bogota**. Se usa `EFFIX50`, en lugar del 15% propuesto inicialmente en el MD. El registro de campaña utiliza la misma ventana. Esto no afirma que sean las fechas oficiales de la feria. El beneficio se confirma en pantalla después del guardado exitoso en el CRM, incluida la oportunidad y su autorización. La propuesta comercial define el alcance, precio regular, descuento, precio final y qué constituye contratación.

## Qué está implementado

- Sector y objetivo → ejemplo con dos respuestas seleccionables → formulario de tres datos y dos autorizaciones independientes.
- Teléfonos internacionales válidos mediante `libphonenumber-js/max`, Colombia inicial editable y normalización E.164 en servidor.
- Contacto compartido por teléfono, una oportunidad por negocio y campaña. El negocio se guarda en la oportunidad y en la nota; no se sobrescribe la empresa del contacto cuando representa varias empresas.
- Registro duradero de sector, objetivo, atribución, vendedor autorizado, versión y textos de consentimiento, fecha y condiciones del beneficio.
- Guardado, consulta de disponibilidad, reserva de 15 minutos y tarea para coordinar por WhatsApp mediante la API de GHL.
- Horarios reales, zona horaria detectada y editable, reconsulta al reservar y rechazo de horarios ocupados. Nombre y teléfono se reutilizan con el ID de contacto; nunca van en una URL.
- Reserva confirmada solo con ID, estado confirmado y tiempos válidos. Si GHL devuelve enlaces HTTPS de reunión/reprogramación se muestran; si no, se muestra el canal humano. No se inventan enlaces. Configurar los enlaces en las confirmaciones de GHL es parte del lanzamiento.
- Manejo de errores, campos conservados en memoria, recibos firmados de 24 horas, honeypot, control de origen, cuerpo máximo de 12 KB y límite por instancia.
- Eventos `landing_view`, `demo_start`, `demo_interaction`, `lead_submitted`, `benefit_activated`, `booking_opened`, `booking_confirmed`, `coordination_requested`, expuestos mediante `dataLayer` y `botpager:effix`. No se envían nombres, teléfonos, correos, respuestas ni parámetros arbitrarios de URL a la analítica. Un evento en `dataLayer` no equivale a tener una herramienta de analítica instalada.
- Aviso de privacidad de campaña en `/es/feriaEffix2026/privacidad`, basado en la identidad y canal de atención existentes. Revisar con el responsable antes de habilitar el registro.

## ¿Hace falta otra integración en GHL?

**Se reutiliza la Private Integration existente de BotPager**, si cuenta con los permisos necesarios. Effix usa `GHL_PRIVATE_INTEGRATION_TOKEN` y `GHL_USER_ID`, sin crear una integración nueva. Esta copia local no tiene el token. No se han creado ni modificado registros, calendarios, pipelines o workflows reales de GHL desde esta implementación.

El enlace proporcionado identifica la subcuenta **`ue94rPvevtVT7o7wCQt2`** y el pipeline de Oportunidades **`4o6WiPB5RnPKn70WzABN` (Feria Effix)**. Están configurados en `_lib/crm.ts`, únicamente para Effix; no alteran la ubicación global de los otros formularios. No crear otro pipeline ni usar un ID de Funnel de Sitios.

En **Settings → Private Integrations**, verificar los permisos de la integración de BotPager:

| Permiso | Uso |
| --- | --- |
| `contacts.readonly` y `contacts.write` | Contactos, notas, tags, consulta de citas, tareas y correo de invitación |
| `opportunities.readonly` y `opportunities.write` | Buscar, crear, completar y mover oportunidades |
| `calendars.readonly` | Disponibilidad real del calendario |
| `calendars/events.readonly` y `calendars/events.write` | Verificar y crear citas |

Si el token actual no cubre esos permisos, ampliar o reemplazar la integración/token según lo permita GHL. No usar credenciales `NEXT_PUBLIC_*` para estas operaciones. Revisar las denominaciones de los scopes en la pantalla de integración y la [documentación oficial](https://marketplace.gohighlevel.com/docs/Authorization/Scopes/).

## Configuración del pipeline y calendario

Cada registro nuevo entra en **la primera etapa actual de Feria Effix**. El servidor consulta `GET /opportunities/pipelines` y resuelve la primera etapa según su posición; no usa un ID fijo ni requiere cambiar variables si se reordenan las etapas. Si el pipeline o su etapa inicial no se pueden consultar, el envío falla explícitamente antes de crear el contacto.

No se mueve automáticamente a «Beneficio activo» al registrarse. Los reintentos reutilizan oportunidades existentes y conservan una etapa comercial más avanzada. Las acciones posteriores siguen usando sus etapas configuradas:

- Demo agendada → `GHL_EFFIX_STAGE_BOOKED_ID`.
- Pendiente de coordinar → `GHL_EFFIX_STAGE_COORDINATION_ID`.
- Demo realizada, Propuesta enviada, Ganado / No continúa → actualización del asesor y workflows de GHL.

Una reserva o tarea se conserva aunque una actualización posterior de etapa falle: la respuesta incluye `stageSynced: false` y el servidor registra un aviso sin datos personales. Reconciliar esos casos en el piloto. El guardado del consentimiento y los campos precede a la etiqueta de activación de la campaña original.

En la subcuenta, configurar deduplicación de contactos por teléfono y permitir múltiples oportunidades para un contacto. El registro por negocio se distingue con una clave en el nombre de la oportunidad.

Reutilizar un calendario existente si ofrece **15 minutos**, disponibilidad y reuniones reales. En caso contrario crear uno para «Demo BotPager · Feria Effix». Conectar Google Meet/Zoom o una ubicación de reunión aprobada, zona horaria, asesor, buffers y el envío de confirmación con enlaces reales. No seleccionar una duración que no esté activa en el calendario. Copiar su ID a `GHL_EFFIX_CALENDAR_ID`.

Si necesita correo para la invitación, establecer `EFFIX_CALENDAR_REQUIRES_EMAIL=true`. El correo es obligatorio en el registro para confirmar el cupón; se reutiliza al reservar. La integración usa la configuración de reunión del calendario; no define una ubicación ficticia.

## Variables de entorno

Completar en `.env.local` y en el entorno del despliegue; los ejemplos vacíos están en `.env.example`:

```dotenv
GHL_PRIVATE_INTEGRATION_TOKEN=
GHL_USER_ID=
GHL_API_VERSION=v3
GHL_EFFIX_STAGE_BOOKED_ID=
GHL_EFFIX_STAGE_COORDINATION_ID=
GHL_EFFIX_CALENDAR_ID=
EFFIX_CALENDAR_REQUIRES_EMAIL=false
EFFIX_RECEIPT_SECRET=
EFFIX_SELLERS_JSON={}
GHL_EFFIX_FIELDS_JSON={}
EFFIX_PRIVACY_APPROVED=false
EFFIX_ENABLED=false
```

Generar `EFFIX_RECEIPT_SECRET` aleatorio, de al menos 32 caracteres. Guardarlo solo en el servidor. `GHL_USER_ID` es el asesor responsable y autor de las notas. No cambiar `GHL_API_VERSION` de las experiencias existentes sin comprobarlas. `GHL_LOCATION_ID` global no es necesario para Effix: usa la subcuenta indicada arriba. Las antiguas variables `GHL_EFFIX_PIPELINE_ID`, `GHL_EFFIX_STAGE_NEW_ID` y `GHL_EFFIX_STAGE_BENEFIT_ID` ya no se consultan. Aplicar las variables al entorno correcto de Vercel (Production o Preview) y volver a desplegar.

`EFFIX_SELLERS_JSON` es una tabla controlada por servidor, por ejemplo `{"gus_01":"Gustavo"}`. Solo un `tag_id` presente en esa tabla atribuye un vendedor; el resto queda «Sin atribuir». El tag identifica atribución, no elegibilidad.

## Campos de oportunidad para segmentar y automatizar

Crear los siguientes campos personalizados de **Oportunidad** y mapear sus IDs en `GHL_EFFIX_FIELDS_JSON`. Las notas ya conservan el contexto aunque este mapa esté vacío; **para automatizar WhatsApp con condiciones y variables, completar el mapa**. Mantener el contexto por oportunidad evita mezclar dos negocios de un mismo contacto.

| Clave del mapa | Campo propuesto | Valor |
| --- | --- | --- |
| `business` | EFFIX · Negocio | Nombre |
| `sector` | EFFIX · Sector | Etiqueta en español |
| `objective` | EFFIX · Objetivo | Etiqueta en español |
| `origin` | EFFIX · Origen | nfc / qr / enlace |
| `seller` | EFFIX · Vendedor | Vendedor de tabla autorizada |
| `contact_consent` | EFFIX · Autorización solicitud | Sí |
| `marketing_consent` | EFFIX · Autorización marketing | Sí / No |
| `consent_at` | EFFIX · Fecha autorización | ISO 8601 |
| `policy_version` | EFFIX · Versión aviso | effix-2026-v1 |
| `operation_id` | EFFIX · Operación | UUID |
| `benefit_code` | EFFIX · Código | EFFIX50 |
| `benefit_expires_at` | EFFIX · Vencimiento | 2026-10-31T00:00:00-05:00, exclusivo |

Usar campos de texto para estos valores y componer un JSON con las claves anteriores y sus IDs reales. Las autorizaciones históricas se guardan en notas; los campos reflejan la solicitud más reciente del negocio. Los tags `sector_*`/`objetivo_*` pertenecen al contacto y pueden acumularse; usar los campos de oportunidad para mensajes sobre un negocio concreto.

## Workflows que faltan configurar en GHL

La web **no envía WhatsApp directamente**. Crear y probar estos flujos con números autorizados, en la misma subcuenta:

| Disparador | Acción y condiciones |
| --- | --- |
| Etiqueta `effix_beneficio_activo` añadida por la campaña original, después del guardado completo | Confirmación de registro y enlace de agenda. Autorización de solicitud Sí, sin DND ni retiro. No usar la creación en la primera etapa como disparador; los recorridos conjuntos no añaden esta etiqueta. |
| 24 horas después sin demo ni coordinación | Un recordatorio del beneficio; omitir si ya respondió, rechazó, retiró autorización o venció la promoción. |
| Cita confirmada del calendario EFFIX | Confirmación con fecha, hora, zona, reunión y enlace real para reprogramar. Desduplicar por ID de cita. |
| 24 horas y 1 hora antes | Recordatorio si la cita sigue activa; omitir el de 24 h si se reservó con menos anticipación. |
| Cancelación, rechazo o retiro | Detener el seguimiento pertinente; no retirar el beneficio solo por no reservar. |
| Demo realizada / Propuesta enviada / Ganado | El asesor confirma el resultado. Estas etapas y métricas no las inventa la web. |

La opción «Prefiero coordinar por WhatsApp» **ya crea una tarea** al asesor. No agregar otra tarea igual desde un workflow. Reprogramaciones deben actualizar la cita existente; no contar cada cambio de horario como una demo nueva. Si alguien agenda después de pedir coordinación, cerrar la tarea de coordinación existente desde GHL.

Usar el canal WhatsApp que BotPager tenga conectado. Si no está conectado, esa conexión del proveedor sí es necesaria. Verificar plantillas, reglas de sesión y manejo de errores con el proveedor. Las novedades generales solo se permiten cuando marketing = Sí, con mecanismo de retiro. La autorización de solicitud no sustituye ese permiso. Una plantilla sugerida para registro:

> Hola, [nombre]. Soy [asesor] de BotPager. Gracias por conversar con nosotros en EFFIX. Tu beneficio EFFIX50 está activo: 50% en la implementación inicial al contratar del 14 al 30 de octubre de 2026, según las condiciones de campaña. Puedes reservar tu demo de 15 minutos aquí: [enlace]. Si prefieres coordinar por aquí, responde a este mensaje.

La llamada de reserva utiliza `toNotify: true`, así que GHL puede ejecutar sus notificaciones configuradas tras el envío del visitante. Revisar esos flujos antes de activar.

## NFC, QR y medición

Ejemplos de enlaces para grabar en tarjetas:

```text
https://botpager.com/es/feriaEffix2026?utm_source=effix&utm_medium=nfc&utm_campaign=effix2026&utm_content=tarjeta_gustavo&tag_id=gus_01
https://botpager.com/es/feriaEffix2026?utm_source=effix&utm_medium=qr&utm_campaign=effix2026&utm_content=tarjeta_gustavo&tag_id=gus_01
```

Usar enlaces bajo control de BotPager y probarlos en los dispositivos reales. Los parámetros solo atribuyen. Para una URL corta permanente, configurar una redirección en el dominio cuando se conozca el enlace definitivo; no se añadió otra ruta que pudiera competir con las demos existentes.

Si se usa GTM/analítica, enlazar los eventos de `dataLayer` con la herramienta existente. `demo_attended` y `deal_won` deben provenir del CRM después de confirmación humana. Reprogramar no debe incrementar `booking_confirmed` como una reserva nueva. Los eventos se deduplican durante la sesión; los informes finales deben deduplicar contactos y citas en el CRM.

## Marca y revisión

BotPager: #6633ff, #3366ff, #091e3f, #32ff78 y fondos claros. Poppins y Space Mono se sirven localmente. El manual pide Ivy Sans como principal; su archivo con licencia no estaba disponible, por eso se utiliza Poppins (secundaria oficial) en los encabezados. Groovy: logo original extraído de su manual, acentos #5f01d0, #da2754 y #ffba00. No se recreó el logo con tipografía. Mont no se incluyó porque tampoco se entregó su archivo; el nombre Groovy conserva su tipografía en el logo original. Groovy aparece como aliado de contenido, sin una oferta o formulario adicional.

## Verificación y activación

Ejecutar `npm run test:effix` y `npm run build`. Los tests usan GHL simulado; no crean contactos ni envían mensajes. Validan fechas, teléfonos, consentimientos, elegibilidad, reintentos, varios negocios por teléfono, sesiones firmadas, horarios ocupados, reservas y tareas reales solo tras una respuesta exitosa.

Después de completar GHL: revisar el aviso en español, marcar `EFFIX_PRIVACY_APPROVED=true`, establecer `EFFIX_ENABLED=true`, desplegar y probar con contactos autorizados dentro de la ventana. Probar errores de red, notas/campos, permisos y disponibilidad; revisar que un reintento no duplique oportunidad, nota, reserva o tarea. La página no tiene un parámetro público para saltarse las fechas.

Los bloqueos en memoria y las consultas al CRM cubren reintentos y concurrencia dentro de una instancia, pero no constituyen una transacción distribuida: dos instancias que creen simultáneamente el primer registro podrían competir. Antes de una campaña con múltiples réplicas, agregar un bloqueo/registro idempotente duradero con claves únicas por teléfono/negocio/acción, y rate limiting en el borde. No se introduce una base de datos ni un proveedor nuevo para el piloto. Si una operación externa se guarda pero su respuesta se pierde, se recupera consultando notas, oportunidades, tareas o citas en el siguiente intento.

No se han validado reservas, permisos ni workflows contra la cuenta real porque las credenciales no están configuradas. El enlace de Canva no fue accesible desde la herramienta de lectura; el diseño se basó en los manuales locales proporcionados.

## Confirmación del cupón por correo

Todos los formularios Effix requieren email y lo guardan en el contacto de HighLevel. El recorrido conjunto y la auditoría también activan EFFIX50 durante la ventana de campaña. El vencimiento exclusivo es `2026-10-31T00:00:00-05:00`: disponible hasta el 30 de octubre a las 23:59:59 en Colombia.

Configurar `GHL_EFFIX_COUPON_WORKFLOW_ID` con un workflow publicado de la misma subcuenta, con una sola acción de correo de confirmación, remitente configurado y **Allow Re-entry desactivado**. El servidor inscribe mediante `POST /contacts/:id/workflow/:id` (scope `contacts.write`) después de guardar contacto, oportunidad y consentimiento. Una nota durable evita repetir solicitudes confirmadas. Un fallo de envío no invalida el registro ni el cupón; se informa como pendiente. `requested` indica inscripción confirmada, no entrega en la bandeja. La confirmación del beneficio es independiente del consentimiento opcional de marketing.
