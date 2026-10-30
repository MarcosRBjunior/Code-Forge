## Ideia

É uma busca com retrocesso (backtracking). Mantenha a combinação atual e o quanto ainda falta para chegar a `target`. Em cada passo, escolha um candidato a partir do índice atual em diante; como o mesmo número pode se repetir, a chamada recursiva continua no mesmo índice, e nunca volta para índices menores. Isso impede gerar `[2, 3, 2]` e `[2, 2, 3]` como combinações diferentes.

Quando o que falta chega a zero, a combinação é registrada. Se o candidato ultrapassa o que falta, o ramo é abandonado; ordenar os candidatos permite parar o laço logo na primeira ultrapassagem.

## Complexidade

Tempo exponencial no pior caso, limitado pelo número de combinações possíveis (cada ramo tem profundidade no máximo `target`). Espaço O(target) de recursão, fora a saída.

## Python

```python
def combination_sum(candidates, target):
    candidatos = sorted(candidates)
    resultado = []
    atual = []

    def buscar(inicio, falta):
        if falta == 0:
            resultado.append(atual[:])
            return
        for i in range(inicio, len(candidatos)):
            c = candidatos[i]
            if c > falta:
                break
            atual.append(c)
            buscar(i, falta - c)
            atual.pop()

    buscar(0, target)
    return resultado
```

## JavaScript

```javascript
function combinationSum(candidates, target) {
  const candidatos = [...candidates].sort((a, b) => a - b);
  const resultado = [];
  const atual = [];
  const buscar = (inicio, falta) => {
    if (falta === 0) {
      resultado.push([...atual]);
      return;
    }
    for (let i = inicio; i < candidatos.length; i++) {
      const c = candidatos[i];
      if (c > falta) break;
      atual.push(c);
      buscar(i, falta - c);
      atual.pop();
    }
  };
  buscar(0, target);
  return resultado;
}
```

## TypeScript

```typescript
function combinationSum(candidates: number[], target: number): number[][] {
  const candidatos = [...candidates].sort((a, b) => a - b);
  const resultado: number[][] = [];
  const atual: number[] = [];
  const buscar = (inicio: number, falta: number): void => {
    if (falta === 0) {
      resultado.push([...atual]);
      return;
    }
    for (let i = inicio; i < candidatos.length; i++) {
      const c = candidatos[i];
      if (c > falta) break;
      atual.push(c);
      buscar(i, falta - c);
      atual.pop();
    }
  };
  buscar(0, target);
  return resultado;
}
```

## Java

```java
class Solution {
    private int[] candidatos;
    private List<int[]> resultado = new ArrayList<>();
    private List<Integer> atual = new ArrayList<>();

    public int[][] combinationSum(int[] candidates, int target) {
        candidatos = candidates.clone();
        Arrays.sort(candidatos);
        resultado.clear();
        buscar(0, target);
        return resultado.toArray(new int[0][]);
    }

    private void buscar(int inicio, int falta) {
        if (falta == 0) {
            resultado.add(atual.stream().mapToInt(Integer::intValue).toArray());
            return;
        }
        for (int i = inicio; i < candidatos.length; i++) {
            int c = candidatos[i];
            if (c > falta) break;
            atual.add(c);
            buscar(i, falta - c);
            atual.remove(atual.size() - 1);
        }
    }
}
```

## C++

```cpp
class Solution {
    vector<int> candidatos;
    vector<vector<int>> resultado;
    vector<int> atual;

    void buscar(int inicio, int falta) {
        if (falta == 0) {
            resultado.push_back(atual);
            return;
        }
        for (int i = inicio; i < (int)candidatos.size(); i++) {
            int c = candidatos[i];
            if (c > falta) break;
            atual.push_back(c);
            buscar(i, falta - c);
            atual.pop_back();
        }
    }

public:
    vector<vector<int>> combinationSum(vector<int>& candidates, int target) {
        candidatos = candidates;
        sort(candidatos.begin(), candidatos.end());
        resultado.clear();
        atual.clear();
        buscar(0, target);
        return resultado;
    }
};
```

## C#

```csharp
public class Solution {
    private int[] candidatos;
    private List<int[]> resultado = new List<int[]>();
    private List<int> atual = new List<int>();

    public int[][] CombinationSum(int[] candidates, int target) {
        candidatos = (int[])candidates.Clone();
        Array.Sort(candidatos);
        resultado.Clear();
        Buscar(0, target);
        return resultado.ToArray();
    }

    private void Buscar(int inicio, int falta) {
        if (falta == 0) {
            resultado.Add(atual.ToArray());
            return;
        }
        for (int i = inicio; i < candidatos.Length; i++) {
            int c = candidatos[i];
            if (c > falta) break;
            atual.Add(c);
            Buscar(i, falta - c);
            atual.RemoveAt(atual.Count - 1);
        }
    }
}
```

## Go

```go
import "sort"

func combinationSum(candidates []int, target int) [][]int {
	candidatos := append([]int(nil), candidates...)
	sort.Ints(candidatos)
	resultado := [][]int{}
	atual := []int{}
	var buscar func(inicio, falta int)
	buscar = func(inicio, falta int) {
		if falta == 0 {
			resultado = append(resultado, append([]int(nil), atual...))
			return
		}
		for i := inicio; i < len(candidatos); i++ {
			c := candidatos[i]
			if c > falta {
				break
			}
			atual = append(atual, c)
			buscar(i, falta-c)
			atual = atual[:len(atual)-1]
		}
	}
	buscar(0, target)
	return resultado
}
```
