# Algoritmo de emparejamiento

Este documento describe cómo SC Mascotas decide si un avistamiento podría
corresponder a una mascota perdida reportada.

## Objetivo

- **Alta sensibilidad:** no queremos perdernos reencuentros.
- **Precisión razonable:** no saturar a los dueños con falsas alarmas.
- **Costo bajo:** sólo se ejecutan señales baratas (SQL + cálculo en memoria).
  Las señales caras (embeddings de imagen) se reservan para Sprint 5.

## Señales y pesos

| Señal | Puntos | Descripción |
|---|---|---|
| Misma especie | 40 | Perro/gato/otro. Si no coincide, puntuación total = 0. |
| Misma colonia | 30 | `coloniaId` idéntico. |
| Color similar | 10 | Grupos de sinónimos en español (con normalización de acentos). |
| Mismo tamaño | 10 | `small` / `medium` / `large`. |
| Avistamiento reciente | 10 | Diferencia ≤ 30 días entre `createdAt` del avistamiento y `lastSeenAt` de la mascota. |
| **Máximo** | **100** | |

## Umbrales

| Puntuación | Acción |
|---|---|
| < 30 | Descartado — no se guarda en `match_results` |
| 30–59 | Se muestra como sugerencia débil (anillo gris) |
| ≥ 60 | Se muestra con indicador fuerte (anillo ámbar) |

## Normalización de color

El campo `color` es texto libre ("negro con manchas blancas", "café", "marrón oscuro").
En lugar de distancia fuzzy, agrupamos sinónimos del español y verificamos si algún
grupo se superpone. Los acentos se eliminan antes de comparar para que "café" = "cafe".

Los grupos están definidos en `color-normalize.ts`. Ejemplos:
- Grupo negro: negro, negra, oscuro, oscura, prieto
- Grupo café: cafe, marron, castano, chocolate, canela, miel, pardo…
- Grupo manchas: manchas, manchado, manchada, moteado

## Cómo proponer un cambio

1. Abre un issue describiendo el caso que el algoritmo no resuelve bien.
2. Discute en el issue si el fix es: cambio de peso, nueva señal, o cambio de umbral.
3. Tu PR debe incluir:
   - Cambio en `score.ts` con tests nuevos en `score.test.ts`
   - Resultado antes/después en al menos 3 casos de prueba
4. Quien mantiene el repo revisa. Datos de producción anonimizados pueden
   informar la decisión.

## Calibración actual

(Se llenará con datos de producción anonimizados después del lanzamiento suave.)
