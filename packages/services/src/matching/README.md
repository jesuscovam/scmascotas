# Algoritmo de emparejamiento

Este documento describe cómo SC Mascotas decide si un avistamiento podría
corresponder a una mascota perdida reportada.

## Objetivo

- **Alta sensibilidad:** no queremos perdernos reencuentros.
- **Precisión razonable:** no saturar a los dueños con falsas alarmas.
- **Honestidad del puntaje:** un 90/100 debe significar 90/100, no "metadata
  feliz sin evidencia visual". El puntaje refleja la confianza real, no la
  suma de campos de formulario.
- **Costo bajo:** la similitud visual (CLIP) sólo se calcula cuando ambos
  lados tienen foto.

## Filtro previo: misma especie

`type` es **gatekeeper**, no señal. Si el avistamiento es de un perro y la
mascota perdida es un gato, la puntuación es 0 y se descarta antes de
cualquier otro cálculo. Misma especie es el piso mínimo para considerar
una pareja — no aporta puntos.

## Señales y pesos

El puntaje es siempre **0–100**, sin importar si hay foto o no. Hay dos
caminos de puntuación; el techo es el mismo para que un usuario nunca vea
"90/100" sin que la evidencia real lo respalde.

### Camino con foto (ambos lados tienen embedding)

| Señal | Puntos | Por qué |
|---|---|---|
| Similitud visual (CLIP) | **0–60** | Es la única señal que realmente prueba identidad visual. Domina. |
| Misma colonia | 0–15 | Restricción geográfica útil, pero los animales callejeros viajan. |
| Color similar | 0–10 | |
| Mismo tamaño | 0–8 | |
| Reciente (≤ 30 días) | 0–7 | |
| **Máximo** | **100** | |

### Camino sin foto (al menos un lado sin embedding)

Sin foto no hay forma de verificar visualmente. Las señales estructurales
se expanden para llenar la escala 0–100.

| Señal | Puntos |
|---|---|
| Misma colonia | 0–40 |
| Color similar | 0–25 |
| Mismo tamaño | 0–20 |
| Reciente (≤ 30 días) | 0–15 |
| **Máximo** | **100** |

## Umbrales

| Puntuación | Acción |
|---|---|
| < 30 | Descartado — no se guarda en `match_results` |
| 30–59 | Sugerencia débil (anillo gris) — vale la pena revisar |
| ≥ 60 | Sugerencia fuerte (anillo ámbar) — coincidencia probable |
| ≥ 85 | Coincidencia muy fuerte — generalmente requiere idéntica + metadata |

## Niveles de similitud visual (CLIP ViT-L/14)

Conservadores a propósito: CLIP rutinariamente devuelve 0.6–0.7 entre
dos gatos distintos en poses similares, así que el piso para mostrar
una insignia es 0.78 ("Parecido") y solo 0.92+ se muestra como "idéntica".

| Similitud coseno | Puntos | Insignia |
|---|---|---|
| ≥ 0.92 | 60 | ✦ Imagen idéntica |
| 0.85 – 0.91 | 45 | 👁 Muy similar |
| 0.78 – 0.84 | 25 | 👁 Parecido |
| 0.70 – 0.77 | 10 | (sin insignia — demasiado débil para afirmar parecido) |
| < 0.70 | 0 | — |

## Normalización de color

El campo `color` es texto libre ("negro con manchas blancas", "café",
"marrón oscuro"). En lugar de distancia fuzzy, agrupamos sinónimos del
español y verificamos si algún grupo se superpone. Los acentos se
eliminan antes de comparar para que "café" = "cafe".

Los grupos están definidos en `color-normalize.ts`. Ejemplos:
- Grupo negro: negro, negra, oscuro, oscura, prieto
- Grupo café: cafe, marron, castano, chocolate, canela, miel, pardo…
- Grupo manchas: manchas, manchado, manchada, moteado

## Cómo proponer un cambio

1. Abre un issue describiendo el caso que el algoritmo no resuelve bien.
2. Discute si el fix es cambio de peso, nueva señal, o cambio de umbral.
3. Tu PR debe incluir:
   - Cambio en `score.ts` con tests nuevos en `score.test.ts`
   - Resultado antes/después en al menos 3 casos de prueba
4. Datos de producción anonimizados pueden informar la decisión.

## Costo del modelo visual

Replicate CLIP ViT-L/14 cuesta ~$0.000115 por predicción (a 2026-05).
Plan gratuito: 500 predicciones/mes.
A ~50 reportes/mes (escala actual): ~$0.006/mes.

**Monitorear:** [Panel de facturación de Replicate](https://replicate.com/account/billing).
Configurar alerta en $1/mes; investigar si se supera.

## Calibración de umbrales (diferida)

Una vez que haya 50+ filas `human_verdict` en producción, re-calibrar:

```sql
SELECT score,
       visual_score,
       COUNT(*) FILTER (WHERE human_verdict = 'match')    AS verdaderos_positivos,
       COUNT(*) FILTER (WHERE human_verdict = 'no_match') AS falsos_positivos
FROM match_results
WHERE human_verdict IS NOT NULL
GROUP BY score, visual_score
ORDER BY score DESC;
```

Actualizar pesos en `score.ts` y umbrales de `visualScore()` en `cosine.ts`.
