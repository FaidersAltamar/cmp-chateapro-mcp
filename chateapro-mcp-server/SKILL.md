# Skill: MCP Setup Validator - Chatea Pro

Este skill guía al usuario desde que descarga el MCP hasta tener todo funcionando.

---

## PASO 1 — Validar Token

```
GET /me
```

✅ Si responde `{id, name, email}` → Token válido, continuar.
❌ Si responde 401 → Pedir nuevo token al usuario.

---

## PASO 2 — Validar Integración Dropi

```
GET /integration/dropi
```

✅ Si `status = verified` y `api_key` no vacío → OK.
❌ Si no → Configurar integración en Chatea Pro.

---

## PASO 3 — Info del Workspace

```
GET /team-info
GET /team-flows
```

Confirma que hay workspace activo y al menos un flow.

---

## PASO 4 — Revisar Productos

```
GET /shop/products
```

✅ Si hay productos → Mostrar catálogo actual.
❌ Si está vacío → Preguntar al usuario qué productos de Dropi quiere importar.

---

## PASO 5 — Importar Producto

Para cada Dropi ID que el usuario indique:

```
POST /shop/products/create
```

Campos requeridos: `name`, `price`, `status`, `type`, `image`, `variants`

Luego verificar:
```
GET /shop/products/{id}/get-info
```

---

## Catálogo actual

| Chatea ID | Nombre | Dropi ID | Precio |
|-----------|--------|----------|--------|
| 576451 | Foam Cleaner All-In-One | 915488 | $59,700 |
| 576453 | Pendiente | 1583543 | — |

---

## Productos pendientes de importar

| Dropi ID | Estado |
|----------|--------|
| 1583543 | Sin datos — preguntar nombre, precio, imagen |
