## Ideia

Em vez de contar o que remover, contamos o máximo que dá para manter. Ordenando os intervalos pelo fim, a escolha gulosa é sempre ficar com o que termina mais cedo: ele deixa o maior espaço livre para os próximos, e nenhuma outra escolha pode manter mais intervalos.

Percorra em ordem de fim guardando o fim do último intervalo mantido. Se o início do atual é maior ou igual a esse fim, não há sobreposição (tocar não conta) e ele é mantido. Caso contrário, é removido. A resposta é o total menos os mantidos.

## Complexidade

Tempo O(n log n) pela ordenação. Espaço O(1) extra além da ordenação.

## Python

```python
def erase_overlap_intervals(intervals):
    removidos = 0
    fim_anterior = None
    for inicio, fim in sorted(intervals, key=lambda p: p[1]):
        if fim_anterior is None or inicio >= fim_anterior:
            fim_anterior = fim
        else:
            removidos += 1
    return removidos
```

## JavaScript

```javascript
function eraseOverlapIntervals(intervals) {
  const ordenados = [...intervals].sort((a, b) => a[1] - b[1]);
  let removidos = 0;
  let fimAnterior = -Infinity;
  for (const [inicio, fim] of ordenados) {
    if (inicio >= fimAnterior) fimAnterior = fim;
    else removidos++;
  }
  return removidos;
}
```

## TypeScript

```typescript
function eraseOverlapIntervals(intervals: number[][]): number {
  const ordenados = [...intervals].sort((a, b) => a[1] - b[1]);
  let removidos = 0;
  let fimAnterior = -Infinity;
  for (const [inicio, fim] of ordenados) {
    if (inicio >= fimAnterior) fimAnterior = fim;
    else removidos++;
  }
  return removidos;
}
```

## Java

```java
class Solution {
    public int eraseOverlapIntervals(int[][] intervals) {
        int[][] ordenados = intervals.clone();
        Arrays.sort(ordenados, (a, b) -> Integer.compare(a[1], b[1]));
        int removidos = 0;
        int fimAnterior = Integer.MIN_VALUE;
        for (int[] intervalo : ordenados) {
            if (intervalo[0] >= fimAnterior) fimAnterior = intervalo[1];
            else removidos++;
        }
        return removidos;
    }
}
```

## C++

```cpp
class Solution {
public:
    int eraseOverlapIntervals(vector<vector<int>>& intervals) {
        vector<vector<int>> ordenados = intervals;
        sort(ordenados.begin(), ordenados.end(),
             [](const vector<int>& a, const vector<int>& b) { return a[1] < b[1]; });
        int removidos = 0;
        int fimAnterior = INT_MIN;
        for (const auto& intervalo : ordenados) {
            if (intervalo[0] >= fimAnterior) fimAnterior = intervalo[1];
            else removidos++;
        }
        return removidos;
    }
};
```

## C#

```csharp
public class Solution {
    public int EraseOverlapIntervals(int[][] intervals) {
        int[][] ordenados = (int[][])intervals.Clone();
        Array.Sort(ordenados, (a, b) => a[1].CompareTo(b[1]));
        int removidos = 0;
        int fimAnterior = int.MinValue;
        foreach (int[] intervalo in ordenados) {
            if (intervalo[0] >= fimAnterior) fimAnterior = intervalo[1];
            else removidos++;
        }
        return removidos;
    }
}
```

## Go

```go
import "sort"

func eraseOverlapIntervals(intervals [][]int) int {
	ordenados := make([][]int, len(intervals))
	copy(ordenados, intervals)
	sort.Slice(ordenados, func(i, j int) bool { return ordenados[i][1] < ordenados[j][1] })
	removidos := 0
	fimAnterior := -1 << 62
	for _, intervalo := range ordenados {
		if intervalo[0] >= fimAnterior {
			fimAnterior = intervalo[1]
		} else {
			removidos++
		}
	}
	return removidos
}
```
