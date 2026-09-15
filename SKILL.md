# Skill: Creación de Producto en ChateaPro con IA

Este skill define el proceso completo para que un nuevo usuario clone el repo desde GitHub, configure el entorno y cree productos en ChateaPro con IA.

---

## PASO 0 — Primer arranque (el usuario clonó el repo)

### 0.1 Clonar e instalar

```bash
git clone https://github.com/FaidersAltamar/cmp-chateapro-mcp.git
cd cmp-chateapro-mcp
cp .env.sample .env
```

### 0.2 Editar .env con las credenciales

```env
CHATEAPRO_API_TOKEN=token-de-chateapro
BRAVE_API_KEY=key-de-brave-search
```

- **CHATEAPRO_API_TOKEN**: obligatorio. Se obtiene en https://chateapro.app → Workspace Settings
- **BRAVE_API_KEY**: opcional. Se obtiene en https://brave.com/search/api/. Sin esto, las tools de Brave no aparecen.

### 0.3 Instalar dependencias

```bash
cd unified-mcp-server && npm install && cd ..
```

### 0.4 Conectar al cliente MCP

Agregar al archivo de configuración del cliente MCP (Claude Desktop, OpenCode, Cursor, etc.):

```json
{
  "mcpServers": {
    "unified": {
      "command": "node",
      "args": ["<ruta>/cmp-chateapro-mcp/unified-mcp-server/index.js"],
      "env": {
        "CHATEAPRO_API_TOKEN": "token-de-chateapro",
        "BRAVE_API_KEY": "key-de-brave-search"
      }
    }
  }
}
```

### 0.5 Validar que todo funciona

```
user_info     → debe devolver {id, name, email}
team_info     → debe mostrar el workspace activo
```

---

## PASO 1 — Recibir los datos del producto

El usuario proporciona los datos manualmente. Pedir siempre:

| Dato | Obligatorio | Ejemplo |
|---|---|---|
| **Nombre del producto** | Sí | `Hydrocare - Gel Hidratante con Ácido Hialurónico` |
| **Precio** | Sí | `41000` (número entero, sin decimales para ChateaPro) |
| **Moneda** | Sí | `COP`, `USD`, etc. **NUNCA asumir. Preguntar siempre.** |
| **Imagen principal** (URL) | Sí | `https://d39ru7awumhhs2.cloudfront.net/.../HYDROCARE.png` |
| **ID de Dropi** (si aplica) | No | `915488` |
| **Tipo de producto** | Sí | `fisico` o `digital` |
| **Nombre del asesor** | Sí | `Wilson` |
| **Categoría** | No | `Belleza`, `Limpieza`, etc. |
| **Descripción** | No | Texto con características y beneficios |
| **SKU** | No | `7708679955630` |
| **Stock** | No | `2000` |
| **Bodega / Ciudad** | No | `Cali` |

### Reglas para recolectar datos

1. **Moneda: NUNCA asumir.** Si el usuario no la especifica, preguntar explícitamente: "¿En qué moneda está el precio? ¿COP, USD...?".
2. **Precio: siempre preguntar el precio de venta sugerido**, no el costo del proveedor.
3. **Imagen: debe ser URL pública accesible desde internet.** Si la imagen viene de Dropi, usar la URL original de Dropi. Si el usuario la sube a ChateaPro, usar la URL de ChateaPro.
4. **Asesor: siempre preguntar el nombre.** Define el tono de toda la conversación.
5. **Si un dato no fue proporcionado, preguntar.** No inventar ni deducir valores.

---

## PASO 2 — Investigar el producto (enriquecimiento opcional)

Si el usuario tiene `BRAVE_API_KEY` configurado, usar Brave Search para enriquecer:

```
brave_web_search   → investigar mercado, competencia, precios de referencia
brave_image_search → buscar imágenes similares del producto
```

Si no tiene Brave, saltar este paso y usar solo los datos del usuario.

---

## PASO 3 — Buscar en AliExpress por imagen (OBLIGATORIO para multimedia)

```
aliexpress_image_search  imageUrl="<URL de la imagen principal>"
```

**REGLA: Buscar con MÚLTIPLES imágenes del producto para maximizar resultados.**
Usar al menos 3 URLs diferentes del producto (principal, cápsulas, empaque, sistema, etc.). Combinar todas las imágenes únicas obtenidas.

**Objetivo: recolectar al menos 10 imágenes adicionales de AliExpress** para enriquecer el array `multimedia` en `embudo_de_ventas`.

Devuelve hasta 8 productos por búsqueda, cada uno con múltiples imágenes. Ejecutar `aliexpress_image_search` para cada URL de imagen del producto y unificar los resultados eliminando duplicados.

---

## PASO 4 — Construir la estructura JSON del producto

Armar un JSON con estas **10 secciones** (plantilla ChateaPro actual). Se inyecta en UN SOLO bot field.

### Estructura obligatoria

```json
{
    "activadores_del_flujo": {
        "ids_de_anuncio": ",,,,,,",
        "palabras_clave": ""
    },
    "embudo_de_ventas": {
        "mensaje_inicial": "",
        "multimedia": [],
        "pregunta_de_entrada": ""
    },
    "informacion_de_producto": {
        "dta_prompt": "",
        "estado": "activo",
        "id_dropi": "",
        "imagen": "",
        "moneda": "COP",
        "nombre": "",
        "precio": "",
        "tipo": "fisico",
        "variable": "SIMPLE"
    },
    "meta_conversion": {
        "aud_id": "",
        "habilitado": false,
        "id": "",
        "por_defecto": true
    },
    "prompt": {
        "indice_variables": "",
        "prompt_guiado_contextualizacion": "",
        "prompt_guiado_ficha_tecnica": "",
        "prompt_guiado_guion_conversacional": "",
        "prompt_guiado_posibles_situaciones": "",
        "prompt_guiado_reglas": "",
        "prompt_libre": "",
        "tipo_de_prompt": "libre"
    },
    "recordatorios": {
        "activar_1": "si",
        "activar_2": "si",
        "activar_rango": "no",
        "hora_max": "22:00",
        "hora_min": "08:00",
        "mensaje_1": "",
        "mensaje_2": "",
        "tiempo_1": "30 minutos",
        "tiempo_2": "2 horas"
    },
    "remarketing": {
        "activar_1": "si",
        "activar_2": "si",
        "hora_max": "",
        "hora_min": "",
        "plantilla_1": { "lang": "", "name": "", "namespace": "" },
        "plantilla_2": { "lang": "", "name": "", "namespace": "" },
        "prompt_1": "",
        "prompt_2": "",
        "tiempo_1": "3 dias",
        "tiempo_2": "5 dias"
    },
    "source": "marketplace",
    "upsells": {
        "1": {
            "activo": "no",
            "boton": "",
            "descripcion": "",
            "id_dropi": "",
            "imagen": "",
            "momento": "compra realizada",
            "nombre": "",
            "precio": "",
            "titulo": "",
            "variaciones": "SIMPLE"
        },
        "2": {
            "activo": "no",
            "boton": "",
            "descripcion": "",
            "id_dropi": "",
            "imagen": "",
            "momento": "compra realizada",
            "nombre": "",
            "precio": "",
            "titulo": "",
            "variaciones": "SIMPLE"
        }
    },
    "voz_con_ia": {
        "api_key": "",
        "estabilidad": 0.3,
        "estilo": 0.5,
        "habilitar": "no",
        "id": "",
        "proveedor": "chatea_pro",
        "reglas": {
            "cantidadMaximaDeAudio": "0",
            "probabilidadRespuestaAudio": "100",
            "responderAudioConAudio": "no"
        },
        "similaridad": 0.7,
        "speaker_boost": false,
        "velocidad": 1
    }
}
```

### Reglas para llenar cada sección

**informacion_de_producto:**
- `nombre`: exactamente como lo dio el usuario
- `precio`: string (`"41000"` COP o `"41.00"` USD)
- `moneda`: `"COP"` o `"USD"`
- `id_dropi`: ID Dropi si aplica
- `tipo`: `"fisico"` o `"digital"`
- `variable`: `"SIMPLE"` sin variantes
- `imagen`: URL pública principal
- `estado`: `"activo"`
- `dta_prompt`: `""`

**embudo_de_ventas:**
- `mensaje_inicial`: saludo con nombre de asesora
- `multimedia`: 10–20 URLs públicas (producto + AliExpress si aplica)
- `pregunta_de_entrada`: califica lead (para ti / regalo)

**prompt:**
- `tipo_de_prompt`: `"libre"` (recomendado) o `"guiado"`
- `prompt_libre` H2H con: ROL, FILOSOFÍA, 0-A seguridad, 0-B estado, ficha, Int.1–4, logística, upsell, post-cierre
- `indice_variables`: `""` si no editas variables en UI
- `prompt_guiado_*`: vacíos si es libre

**voz_con_ia:**
- `proveedor`: `"chatea_pro"` o `"elevenlabs"`
- `habilitar`: `"no"` por defecto; `speaker_boost` boolean

**recordatorios:**
- Incluir `activar_1` / `activar_2` / `activar_rango` (`"si"`/`"no"`)
- Ventana `hora_min`/`hora_max` (ej. 08:00–22:00)

**remarketing:**
- `activar_1`/`activar_2`, `prompt_1`/`prompt_2`, plantillas WA opcionales

**upsells:**
- Slots `"1"` y `"2"`; `activo: "si"` solo si hay producto real (nombre, precio, imagen, id_dropi)

**activadores_del_flujo:**
- `palabras_clave`: CSV con nombre + ganchos + variaciones + comas de padding
- `ids_de_anuncio`: IDs Meta o `",,,,,,"`

**meta_conversion:**
- `por_defecto: true`; `habilitado: false` hasta configurar pixel

**source:**
- `"marketplace"` (Hub EHB) o `"producto_sin_prompt"` (export UI)
---

## PASO 5 — Inyectar el JSON en ChateaPro

El JSON completo se guarda en **UN SOLO campo** de tipo bot field en ChateaPro.

### 5.1 Crear el campo

```
flow_create_bot_field
  name: "[Producto Ventas Wp] {numero}"
  var_type: "array"
  value: "<JSON completo como string>"
```

El `{numero}` es un identificador único para el producto. Usar el consecutivo más alto disponible. Ejemplo: `[Producto Ventas Wp] 109`.

### 5.2 Verificar que se guardó correctamente

```
flow_bot_fields   → confirmar que el campo aparece con name "[Producto Ventas Wp] {numero}"
```

---

## PASO 6 — Crear el producto en el shop de ChateaPro

```
shop_create_product
  name: "{nombre del producto}"
  price: {precio como entero}
  image: "{URL de la imagen}"
  status: "active"
  type: "{categoria}"
  vendor: "{nombre del asesor o vendedor}"
  sku: "{SKU si aplica}"
  use_variant: 0
  qty: {stock}
  tags: ["tag1", "tag2", ...]
```

### 6.1 Actualizar stock si es necesario

```
shop_update_product_variant
  track_stock: 1
  qty: {cantidad}
  allow_no_stock_sell: 0
```

### 6.2 Verificar

```
shop_product_get_info  productId={id}
```

---

## PASO 7 — Actualizar el catálogo (opcional)

Si existe el campo `[Skill] Product Catalog WP`, actualizarlo con el nuevo producto:

```
flow_set_bot_field
  var_ns: "ns-del-campo-catalog"
  value: "<JSON del catálogo actualizado>"
```

---

## Resumen del flujo

```
Usuario da: nombre, precio, imagen, asesor, tipo
        │
        ├─→ Brave Search (opcional) → mercado, keywords
        ├─→ AliExpress (OBLIGATORIO) → 3+ busquedas, 10+ imagenes
        │
        ├─→ Construir JSON con 10 secciones (incl. upsells + source)
        │
        ├─→ flow_create_bot_field → [Producto Ventas Wp] {N}
        │
        └─→ shop_create_product → producto en el shop
```

---

## Tools clave

| Tool | Qué hace |
|---|---|
| `user_info` | Validar token de ChateaPro |
| `brave_web_search` | Investigar mercado del producto |
| `aliexpress_image_search` | Buscar similares por imagen |
| `flow_create_bot_field` | Crear campo `[Producto Ventas Wp] {N}` |
| `flow_set_bot_field` | Actualizar valor de un campo |
| `flow_bot_fields` | Listar todos los campos |
| `flow_delete_bot_field` | Eliminar un campo |
| `shop_create_product` | Crear producto en el shop |
| `shop_update_product` | Actualizar producto |
| `shop_product_get_info` | Verificar producto creado |
| `shop_create_product_variant` | Actualizar stock del variant |

---

## Notas importantes

1. **Un solo campo por producto.** No crear múltiples campos. Toda la configuración del producto va en `[Producto Ventas Wp] {N}`.
2. **El número en el nombre es el identificador.** Usar números consecutivos. Si el último es 109, el siguiente es 110.
3. **El JSON se guarda como string.** `flow_create_bot_field` recibe el JSON serializado en el campo `value`.
4. **Brave es opcional. AliExpress es OBLIGATORIO para multimedia.** Si no hay `BRAVE_API_KEY`, saltar Brave. Pero AliExpress siempre debe ejecutarse con al menos 3 imágenes del producto para recolectar 10+ imágenes adicionales.
5. **Sin conexión a Dropi.** Los datos del producto siempre los da el usuario manualmente. No intentar conectar a la API de Dropi.
6. **Borrar antes de reintentar.** Si algo sale mal, usar `flow_delete_bot_field` y `shop_delete_product` para limpiar antes de volver a crear.
7. **NUNCA asumir moneda, precio, asesor ni ningún dato.** Si el usuario no lo especifica, preguntar. Ejemplo: "¿El precio está en COP o USD?".
8. **El precio en `shop_create_product` debe ser entero.** Redondear sin decimales (ej: 89.99 → 90). En el JSON del bot field va con decimales como string ("89.99").
9. **REGLA ABSOLUTA — El prompt debe ser ESTRUCTURA IDÉNTICA al template original.** Solo se reemplazan los datos del producto (nombre, precio, asesor, características, etc.). NO se puede acortar, resumir, ni omitir secciones. Si el template tiene 5 etapas (CONTEXTUAL, CONVERSACIONAL, POSIBLES SITUACIONES, REGLAS), el nuevo prompt debe tener exactamente las mismas 5 etapas con la misma densidad de contenido. Si el template tiene guion conversacional con diálogos de ejemplo, el nuevo debe tenerlos. Si el template tiene 12 objeciones, el nuevo debe tener 12 objeciones. NUNCA reducir. Si el modelo no puede generar un prompt de esta longitud y fidelidad, informar al usuario para que use otro modelo.
10. **REGLA — AliExpress: buscar con MÚLTIPLES imágenes siempre.** No buscar con una sola imagen. Usar al menos 3 URLs diferentes del producto (principal, empaque, cápsulas, sistema, etc.). Combinar todas las imágenes únicas de todas las búsquedas. El objetivo es recolectar mínimo 10 imágenes adicionales para el array `multimedia` del `embudo_de_ventas`. Las imágenes originales del usuario + las de AliExpress deben sumar al menos 15-20 en total.
