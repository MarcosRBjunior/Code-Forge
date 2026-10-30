## Ideia

Ordene os balões pelo fim do trecho. O balão que termina mais cedo precisa ser estourado por alguma flecha, e o melhor lugar para ela é exatamente no fim desse balão: ali ela alcança o maior número possível de balões que começam antes ou nesse ponto.

Depois disso, percorra os demais em ordem. Se o início do próximo balão é menor ou igual à posição da última flecha, ele já foi estourado. Caso contrário, é preciso uma nova flecha, posicionada no fim dele. Comparamos sem subtrair, para não estourar o limite de inteiros de 32 bits.

## Complexidade

Tempo O(n log n), dominado pela ordenação. Espaço O(1) extra além da ordenação.

## Python

```python
def find_min_arrow_shots(points):
    flechas = 0
    posicao = None
    for inicio, fim in sorted(points, key=lambda p: p[1]):
        if posicao is None or inicio > posicao:
            flechas += 1
            posicao = fim
    return flechas
```

## JavaScript

```javascript
function findMinArrowShots(points) {
  const ordenados = [...points].sort((a, b) => (a[1] < b[1] ? -1 : a[1] > b[1] ? 1 : 0));
  let flechas = 0;
  let posicao = -Infinity;
  for (const [inicio, fim] of ordenados) {
    if (inicio > posicao) {
      flechas++;
      posicao = fim;
    }
  }
  return flechas;
}
```

## TypeScript

```typescript
function findMinArrowShots(points: number[][]): number {
  const ordenados = [...points].sort((a, b) => (a[1] < b[1] ? -1 : a[1] > b[1] ? 1 : 0));
  let flechas = 0;
  let posicao = -Infinity;
  for (const [inicio, fim] of ordenados) {
    if (inicio > posicao) {
      flechas++;
      posicao = fim;
    }
  }
  return flechas;
}
```

## Java

```java
class Solution {
    public int findMinArrowShots(int[][] points) {
        int[][] ordenados = points.clone();
        Arrays.sort(ordenados, (a, b) -> Integer.compare(a[1], b[1]));
        int flechas = 0;
        long posicao = Long.MIN_VALUE;
        for (int[] balao : ordenados) {
            if (balao[0] > posicao) {
                flechas++;
                posicao = balao[1];
            }
        }
        return flechas;
    }
}
```

## C++

```cpp
class Solution {
public:
    int findMinArrowShots(vector<vector<int>>& points) {
        vector<vector<int>> ordenados = points;
        sort(ordenados.begin(), ordenados.end(),
             [](const vector<int>& a, const vector<int>& b) { return a[1] < b[1]; });
        int flechas = 0;
        long long posicao = LLONG_MIN;
        for (const auto& balao : ordenados) {
            if (balao[0] > posicao) {
                flechas++;
                posicao = balao[1];
            }
        }
        return flechas;
    }
};
```

## C#

```csharp
public class Solution {
    public int FindMinArrowShots(int[][] points) {
        int[][] ordenados = (int[][])points.Clone();
        Array.Sort(ordenados, (a, b) => a[1].CompareTo(b[1]));
        int flechas = 0;
        long posicao = long.MinValue;
        foreach (int[] balao in ordenados) {
            if (balao[0] > posicao) {
                flechas++;
                posicao = balao[1];
            }
        }
        return flechas;
    }
}
```

## Go

```go
import "sort"

func findMinArrowShots(points [][]int) int {
	ordenados := make([][]int, len(points))
	copy(ordenados, points)
	sort.Slice(ordenados, func(i, j int) bool { return ordenados[i][1] < ordenados[j][1] })
	flechas := 0
	posicao := -1 << 62
	for _, balao := range ordenados {
		if balao[0] > posicao {
			flechas++
			posicao = balao[1]
		}
	}
	return flechas
}
```
