## Ideia

Mantemos uma pilha com os índices dos dias que ainda esperam por um dia mais quente. As temperaturas desses dias na pilha são não crescentes, do fundo para o topo. Quando chega o dia `i`, enquanto a temperatura dele for maior que a do dia no topo, esse dia do topo foi resolvido: a resposta dele é `i - topo`. Depois empilhamos `i`.

Cada índice entra e sai da pilha no máximo uma vez, então não há comparações repetidas. Dias que sobram na pilha ficam com resposta `0`.

## Complexidade

Tempo O(n), pois cada índice é empilhado e desempilhado uma vez. Espaço O(n) para a pilha e o resultado.

## Python

```python
def daily_temperatures(temperatures):
    resposta = [0] * len(temperatures)
    pilha = []
    for i, t in enumerate(temperatures):
        while pilha and temperatures[pilha[-1]] < t:
            j = pilha.pop()
            resposta[j] = i - j
        pilha.append(i)
    return resposta
```

## JavaScript

```javascript
function dailyTemperatures(temperatures) {
  const resposta = new Array(temperatures.length).fill(0);
  const pilha = [];
  for (let i = 0; i < temperatures.length; i++) {
    while (pilha.length && temperatures[pilha[pilha.length - 1]] < temperatures[i]) {
      const j = pilha.pop();
      resposta[j] = i - j;
    }
    pilha.push(i);
  }
  return resposta;
}
```

## TypeScript

```typescript
function dailyTemperatures(temperatures: number[]): number[] {
  const resposta: number[] = new Array(temperatures.length).fill(0);
  const pilha: number[] = [];
  for (let i = 0; i < temperatures.length; i++) {
    while (pilha.length && temperatures[pilha[pilha.length - 1]] < temperatures[i]) {
      const j = pilha.pop()!;
      resposta[j] = i - j;
    }
    pilha.push(i);
  }
  return resposta;
}
```

## Java

```java
class Solution {
    public int[] dailyTemperatures(int[] temperatures) {
        int n = temperatures.length;
        int[] resposta = new int[n];
        Deque<Integer> pilha = new ArrayDeque<>();
        for (int i = 0; i < n; i++) {
            while (!pilha.isEmpty() && temperatures[pilha.peek()] < temperatures[i]) {
                int j = pilha.pop();
                resposta[j] = i - j;
            }
            pilha.push(i);
        }
        return resposta;
    }
}
```

## C++

```cpp
class Solution {
public:
    vector<int> dailyTemperatures(vector<int>& temperatures) {
        int n = temperatures.size();
        vector<int> resposta(n, 0);
        vector<int> pilha;
        for (int i = 0; i < n; i++) {
            while (!pilha.empty() && temperatures[pilha.back()] < temperatures[i]) {
                int j = pilha.back();
                pilha.pop_back();
                resposta[j] = i - j;
            }
            pilha.push_back(i);
        }
        return resposta;
    }
};
```

## C#

```csharp
public class Solution {
    public int[] DailyTemperatures(int[] temperatures) {
        int n = temperatures.Length;
        int[] resposta = new int[n];
        var pilha = new Stack<int>();
        for (int i = 0; i < n; i++) {
            while (pilha.Count > 0 && temperatures[pilha.Peek()] < temperatures[i]) {
                int j = pilha.Pop();
                resposta[j] = i - j;
            }
            pilha.Push(i);
        }
        return resposta;
    }
}
```

## Go

```go
func dailyTemperatures(temperatures []int) []int {
	resposta := make([]int, len(temperatures))
	pilha := []int{}
	for i, t := range temperatures {
		for len(pilha) > 0 && temperatures[pilha[len(pilha)-1]] < t {
			j := pilha[len(pilha)-1]
			pilha = pilha[:len(pilha)-1]
			resposta[j] = i - j
		}
		pilha = append(pilha, i)
	}
	return resposta
}
```
