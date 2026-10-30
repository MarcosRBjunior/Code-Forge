## Ideia

Como a lista já está ordenada e sem sobreposições, uma única passagem em três fases resolve. Primeiro, copiamos todos os intervalos que terminam antes do início do novo: eles não encostam nele. Depois, enquanto o início do intervalo atual for menor ou igual ao fim do novo, há sobreposição (ou toque), e fundimos tudo no novo intervalo, tomando o menor início e o maior fim. Por fim, o novo intervalo já fundido é adicionado e copiamos o restante, que começa depois dele.

A fusão só acontece na fase do meio, e a ordenação é preservada porque o bloco fundido ocupa o lugar exato dos intervalos que ele absorveu.

## Complexidade

Tempo O(n), com uma única passagem pela lista. Espaço O(n) para a lista de saída.

## Python

```python
def insert_interval(intervals, new_interval):
    resultado = []
    inicio, fim = new_interval
    i = 0
    n = len(intervals)
    while i < n and intervals[i][1] < inicio:
        resultado.append(intervals[i])
        i += 1
    while i < n and intervals[i][0] <= fim:
        inicio = min(inicio, intervals[i][0])
        fim = max(fim, intervals[i][1])
        i += 1
    resultado.append([inicio, fim])
    resultado.extend(intervals[i:])
    return resultado
```

## JavaScript

```javascript
function insertInterval(intervals, newInterval) {
  const resultado = [];
  let [inicio, fim] = newInterval;
  let i = 0;
  const n = intervals.length;
  while (i < n && intervals[i][1] < inicio) {
    resultado.push(intervals[i++]);
  }
  while (i < n && intervals[i][0] <= fim) {
    inicio = Math.min(inicio, intervals[i][0]);
    fim = Math.max(fim, intervals[i][1]);
    i++;
  }
  resultado.push([inicio, fim]);
  while (i < n) resultado.push(intervals[i++]);
  return resultado;
}
```

## TypeScript

```typescript
function insertInterval(intervals: number[][], newInterval: number[]): number[][] {
  const resultado: number[][] = [];
  let [inicio, fim] = newInterval;
  let i = 0;
  const n = intervals.length;
  while (i < n && intervals[i][1] < inicio) {
    resultado.push(intervals[i++]);
  }
  while (i < n && intervals[i][0] <= fim) {
    inicio = Math.min(inicio, intervals[i][0]);
    fim = Math.max(fim, intervals[i][1]);
    i++;
  }
  resultado.push([inicio, fim]);
  while (i < n) resultado.push(intervals[i++]);
  return resultado;
}
```

## Java

```java
class Solution {
    public int[][] insertInterval(int[][] intervals, int[] newInterval) {
        List<int[]> resultado = new ArrayList<>();
        int inicio = newInterval[0], fim = newInterval[1];
        int i = 0, n = intervals.length;
        while (i < n && intervals[i][1] < inicio) {
            resultado.add(intervals[i++]);
        }
        while (i < n && intervals[i][0] <= fim) {
            inicio = Math.min(inicio, intervals[i][0]);
            fim = Math.max(fim, intervals[i][1]);
            i++;
        }
        resultado.add(new int[]{inicio, fim});
        while (i < n) resultado.add(intervals[i++]);
        return resultado.toArray(new int[0][]);
    }
}
```

## C++

```cpp
class Solution {
public:
    vector<vector<int>> insertInterval(vector<vector<int>>& intervals, vector<int>& newInterval) {
        vector<vector<int>> resultado;
        int inicio = newInterval[0], fim = newInterval[1];
        int i = 0, n = intervals.size();
        while (i < n && intervals[i][1] < inicio) {
            resultado.push_back(intervals[i++]);
        }
        while (i < n && intervals[i][0] <= fim) {
            inicio = min(inicio, intervals[i][0]);
            fim = max(fim, intervals[i][1]);
            i++;
        }
        resultado.push_back({inicio, fim});
        while (i < n) resultado.push_back(intervals[i++]);
        return resultado;
    }
};
```

## C#

```csharp
public class Solution {
    public int[][] InsertInterval(int[][] intervals, int[] newInterval) {
        var resultado = new List<int[]>();
        int inicio = newInterval[0], fim = newInterval[1];
        int i = 0, n = intervals.Length;
        while (i < n && intervals[i][1] < inicio) {
            resultado.Add(intervals[i++]);
        }
        while (i < n && intervals[i][0] <= fim) {
            inicio = Math.Min(inicio, intervals[i][0]);
            fim = Math.Max(fim, intervals[i][1]);
            i++;
        }
        resultado.Add(new int[]{inicio, fim});
        while (i < n) resultado.Add(intervals[i++]);
        return resultado.ToArray();
    }
}
```

## Go

```go
func insertInterval(intervals [][]int, newInterval []int) [][]int {
	resultado := [][]int{}
	inicio, fim := newInterval[0], newInterval[1]
	i, n := 0, len(intervals)
	for i < n && intervals[i][1] < inicio {
		resultado = append(resultado, intervals[i])
		i++
	}
	for i < n && intervals[i][0] <= fim {
		if intervals[i][0] < inicio {
			inicio = intervals[i][0]
		}
		if intervals[i][1] > fim {
			fim = intervals[i][1]
		}
		i++
	}
	resultado = append(resultado, []int{inicio, fim})
	resultado = append(resultado, intervals[i:]...)
	return resultado
}
```
