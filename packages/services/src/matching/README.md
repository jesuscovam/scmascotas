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

---

## Sprint 5: Similitud visual (embeddings CLIP)

### Modelo

**CLIP ViT-L/14** vía [andreasjansson/clip-features](https://replicate.com/andreasjansson/clip-features) en Replicate.
- Salida: `vector(768)` — 768 valores float32 por imagen
- Almacenado en: `pet_photos.embedding` y `spotted_pets.embedding` (nullable — filas antiguas tienen `NULL`)

### Puntos adicionales

El puntaje visual **sólo se activa** cuando tanto el avistamiento como la mascota candidata tienen embedding.

| Similitud coseno | Puntos |
|---|---|
| ≥ 0.90 | +20 |
| 0.80–0.89 | +15 |
| 0.70–0.79 | +10 |
| 0.60–0.69 | +5 |
| < 0.60 | 0 |

Puntuación máxima con visual: **120 pts** (100 estructurado + 20 visual).
El umbral de 30 pts no cambia.

### Costo

Replicate CLIP cuesta ~$0.000115 por predicción (a 2026-05).
Plan gratuito: 500 predicciones/mes.
A ~50 reportes nuevos/mes (escala actual): ~$0.006/mes.

**Monitorear:** [Panel de facturación de Replicate](https://replicate.com/account/billing).
Configurar alerta en $1/mes; investigar si se supera.

### Calibración de umbrales (diferida)

Sprint 4 lanzó el endpoint `POST /api/matches/[id]/verdict`.
Una vez que haya 50+ filas `human_verdict` en producción, re-calibrar con:

```sql
SELECT score,
       COUNT(*) FILTER (WHERE human_verdict = 'match')    AS verdaderos_positivos,
       COUNT(*) FILTER (WHERE human_verdict = 'no_match') AS falsos_positivos
FROM match_results
WHERE human_verdict IS NOT NULL
GROUP BY score
ORDER BY score DESC;
```

Actualizar `MATCH_THRESHOLD` en `packages/services/src/matches.ts` y los
umbrales de `visualScore()` en `packages/services/src/matching/cosine.ts`.
