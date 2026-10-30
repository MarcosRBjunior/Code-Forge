## Ideia

Depois de ordenar os intervalos pelo início, os que se sobrepõem ficam vizinhos. Percorra a lista mantendo o resultado parcial: se o início do intervalo atual é menor ou igual ao fim do último intervalo mesclado, eles se tocam ou se sobrepõem e o fim do último passa a ser o maior dos dois fins; caso contrário, o atual abre um novo intervalo.

Comparar apenas com o último intervalo basta porque, na ordem por início, nenhum intervalo anterior a ele pode alcançar além do que o último já cobre.

## Complexidade

Tempo O(n log n), dominado pela ordenação; a varredura é linear. Espaço O(n) para o resultado.

## Python

```python
def merge(intervals):
    resultado = []
    for inicio, fim in sorted(intervals):
        if resultado and inicio <= resultado[-1][1]:
            resultado[-1][1] = max(resultado[-1][1], fim)
        else:
            resultado.append([inicio, fim])
    return resultado
```

## JavaScript

```javascript
function merge(intervals) {
  const ordenados = [...intervals].sort((a, b) => a[0] - b[0]);
  const resultado = [];
  for (const [inicio, fim] of ordenados) {
    const ultimo = resultado[resultado.length - 1];
    if (ultimo && inicio <= ultimo[1]) ultimo[1] = Math.max(ultimo[1], fim);
    else resultado.push([inicio, fim]);
  }
  return resultado;
}
```

## TypeScript

```typescript
function merge(intervals: number[][]): number[][] {
  const ordenados = [...intervals].sort((a, b) => a[0] - b[0]);
  const resultado: number[][] = [];
  for (const [inicio, fim] of ordenados) {
    const ultimo = resultado[resultado.length - 1];
    if (ultimo && inicio <= ultimo[1]) ultimo[1] = Math.max(ultimo[1], fim);
    else resultado.push([inicio, fim]);
  }
  return resultado;
}
```

## Java

```java
class Solution {
    public int[][] merge(int[][] intervals) {
        int[][] ordenados = intervals.clone();
        Arrays.sort(ordenados, (a, b) -> Integer.compare(a[0], b[0]));
        List<int[]> resultado = new ArrayList<>();
        for (int[] atual : ordenados) {
            if (!resultado.isEmpty() && atual[0] <= resultado.get(resultado.size() - 1)[1]) {
                int[] ultimo = resultado.get(resultado.size() - 1);
                ultimo[1] = Math.max(ultimo[1], atual[1]);
            } else {
                resultado.add(new int[]{atual[0], atual[1]});
            }
        }
        return resultado.toArray(new int[0][]);
    }
}
```

## C++

```cpp
class Solution {
public:
    vector<vector<int>> merge(vector<vector<int>>& intervals) {
        vector<vector<int>> ordenados = intervals;
        sort(ordenados.begin(), ordenados.end());
        vector<vector<int>> resultado;
        for (auto& atual : ordenados) {
            if (!resultado.empty() && atual[0] <= resultado.back()[1])
                resultado.back()[1] = max(resultado.back()[1], atual[1]);
            else
                resultado.push_back({atual[0], atual[1]});
        }
        return resultado;
    }
};
```

## C#

```csharp
public class Solution {
    public int[][] Merge(int[][] intervals) {
        var ordenados = intervals.OrderBy(p => p[0]).ToList();
        var resultado = new List<int[]>();
        foreach (var atual in ordenados) {
            if (resultado.Count > 0 && atual[0] <= resultado[resultado.Count - 1][1])
                resultado[resultado.Count - 1][1] = Math.Max(resultado[resultado.Count - 1][1], atual[1]);
            else
                resultado.Add(new int[]{atual[0], atual[1]});
        }
        return resultado.ToArray();
    }
}
```

## Go

```go
import "sort"

func merge(intervals [][]int) [][]int {
	ordenados := make([][]int, len(intervals))
	copy(ordenados, intervals)
	sort.Slice(ordenados, func(a, b int) bool { return ordenados[a][0] < ordenados[b][0] })
	resultado := [][]int{}
	for _, atual := range ordenados {
		n := len(resultado)
		if n > 0 && atual[0] <= resultado[n-1][1] {
			if atual[1] > resultado[n-1][1] {
				resultado[n-1][1] = atual[1]
			}
		} else {
			resultado = append(resultado, []int{atual[0], atual[1]})
		}
	}
	return resultado
}
```
