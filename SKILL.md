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
| **Moneda** | Sí | `COP` |
| **Imagen principal** (URL) | Sí | `https://d39ru7awumhhs2.cloudfront.net/.../HYDROCARE.png` |
| **ID de Dropi** (si aplica) | No | `915488` |
| **Tipo de producto** | Sí | `fisico` o `digital` |
| **Nombre del asesor** | Sí | `Wilson` |
| **Categoría** | No | `Belleza`, `Limpieza`, etc. |
| **Descripción** | No | Texto con características y beneficios |
| **SKU** | No | `7708679955630` |
| **Stock** | No | `2000` |
| **Bodega / Ciudad** | No | `Cali` |

---

## PASO 2 — Investigar el producto (enriquecimiento opcional)

Si el usuario tiene `BRAVE_API_KEY` configurado, usar Brave Search para enriquecer:

```
brave_web_search   → investigar mercado, competencia, precios de referencia
brave_image_search → buscar imágenes similares del producto
```

Si no tiene Brave, saltar este paso y usar solo los datos del usuario.

---

## PASO 3 — Buscar en AliExpress por imagen (enriquecimiento opcional)

```
aliexpress_image_search  imageUrl="<URL de la imagen principal>"
```

Devuelve hasta 8 productos similares con título, precio, rating y órdenes. Usar esta información para:
- Confirmar que el precio es competitivo
- Obtener palabras clave alternativas
- Inspirar la descripción del producto

Si la imagen no es accesible públicamente o AliExpress no devuelve resultados, continuar sin este paso.

---

## PASO 4 — Construir la estructura JSON del producto

Armar un JSON con exactamente estas 8 secciones. Este JSON se inyecta en UN SOLO campo de ChateaPro.

### Estructura obligatoria

```json
{
    "informacion_de_producto": {
        "id": "",
        "nombre": "",
        "precio": "",
        "moneda": "",
        "id_dropi": "",
        "tipo": "",
        "variable": "",
        "imagen": "",
        "estado": "",
        "dta_prompt": ""
    },
    "embudo_de_ventas": {
        "mensaje_inicial": "",
        "multimedia": [],
        "pregunta_de_entrada": ""
    },
    "prompt": {
        "tipo_de_prompt": "",
        "prompt_libre": "",
        "prompt_guiado_contextualizacion": "",
        "prompt_guiado_ficha_tecnica": "",
        "prompt_guiado_guion_conversacional": "",
        "prompt_guiado_posibles_situaciones": "",
        "prompt_guiado_reglas": ""
    },
    "voz_con_ia": {
        "id": "",
        "api_key": "",
        "estabilidad": "",
        "similaridad": "",
        "estilo": "",
        "speaker_boost": "",
        "habilitar": "",
        "reglas": {}
    },
    "recordatorios": {
        "tiempo_1": "",
        "mensaje_1": "",
        "tiempo_2": "",
        "mensaje_2": "",
        "hora_min": "",
        "hora_max": ""
    },
    "remarketing": {
        "tiempo_1": "",
        "plantilla_1": {"namespace": "", "name": "", "lang": ""},
        "tiempo_2": "",
        "plantilla_2": {"namespace": "", "name": "", "lang": ""},
        "hora_min": "",
        "hora_max": ""
    },
    "activadores_del_flujo": {
        "palabras_clave": "",
        "ids_de_anuncio": ""
    },
    "meta_conversion": {
        "habilitado": false,
        "por_defecto": false,
        "id": "",
        "aud_id": ""
    }
}
```

### Reglas para llenar cada sección

**informacion_de_producto:**
- `nombre`: exactamente como lo dio el usuario
- `precio`: en formato string con decimales `"41000.00"`
- `moneda`: `"COP"` por defecto
- `id_dropi`: el ID de Dropi si aplica, si no `""`
- `tipo`: `"fisico"` o `"digital"`
- `variable`: `"SIMPLE"` (si no tiene variantes)
- `imagen`: URL pública de la imagen principal
- `estado`: `"activo"`
- `dta_prompt`: dejar `""`

**embudo_de_ventas:**
- `mensaje_inicial`: "Hola, soy {asesor}. ¿Te interesa conocer más sobre nuestro {producto}?"
- `multimedia`: array con URLs de imágenes
- `pregunta_de_entrada`: una pregunta para calificar al lead según el tipo de producto

**prompt:**
- `tipo_de_prompt`: `"libre"` o `"guiado"`
- `prompt_libre`: el prompt completo si es libre. Debe incluir 5 etapas:
  1. CONTEXTUALIZACIÓN (asesor, rol, audiencia, lenguaje)
  2. FICHA TÉCNICA (nombre, precio, envío, características, beneficios, imagen)
  3. GUION CONVERSACIONAL (ejemplo de diálogo cliente-asistente)
  4. POSIBLES SITUACIONES (preguntas frecuentes y respuestas)
  5. REGLAS (normas de comportamiento del asistente)
- Los campos `prompt_guiado_*` se dejan vacíos si el prompt es libre

**voz_con_ia:**
- Mantener los valores por defecto del ejemplo (ElevenLabs)
- `habilitar`: `"no"` por defecto

**recordatorios:**
- `tiempo_1`: `"10 minutos"`
- `mensaje_1`: `"Me dejaste en visto."`
- `tiempo_2`: `"20 minutos"`
- `mensaje_2`: mensaje de urgencia/empatía
- `hora_min`: `"08:00"`, `hora_max`: `"22:00"`

**remarketing:**
- Dejar vacío por defecto. Se configura después en el dashboard.

**activadores_del_flujo:**
- `palabras_clave`: lista separada por comas con el nombre del producto y variaciones
- `ids_de_anuncio`: dejar con comas vacías `",,,,,,"`

**meta_conversion:**
- `habilitado`: `false` por defecto

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
        ├─→ AliExpress (opcional) → similares, precios ref
        │
        ├─→ Construir JSON con 8 secciones
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
4. **Brave y AliExpress son opcionales.** Si no hay `BRAVE_API_KEY`, saltar esos pasos. El producto se crea igual con los datos del usuario.
5. **Sin conexión a Dropi.** Los datos del producto siempre los da el usuario manualmente. No intentar conectar a la API de Dropi.
6. **Borrar antes de reintentar.** Si algo sale mal, usar `flow_delete_bot_field` y `shop_delete_product` para limpiar antes de volver a crear.
