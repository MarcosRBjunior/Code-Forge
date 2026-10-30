## Ideia

Seja `dp[c]` o maior valor que cabe numa mochila de capacidade `c` usando os itens já processados. Ao considerar um item de peso `p` e valor `v`, cada capacidade `c` tem duas opções: deixar o item (fica `dp[c]`) ou levá-lo (fica `dp[c - p] + v`). Guarda-se o maior dos dois.

Usando um único vetor, é preciso atualizar as capacidades de trás para a frente: assim `dp[c - p]` ainda reflete o estado antes deste item, e ele não é contado duas vezes. Se a atualização fosse da esquerda para a direita, o item poderia ser reutilizado, o que resolveria a mochila ilimitada.

## Complexidade

Tempo O(n * capacidade). Espaço O(capacidade).

## Python

```python
def knapsack(weights, values, capacity):
    dp = [0] * (capacity + 1)
    for peso, valor in zip(weights, values):
        for c in range(capacity, peso - 1, -1):
            dp[c] = max(dp[c], dp[c - peso] + valor)
    return dp[capacity]
```

## JavaScript

```javascript
function knapsack(weights, values, capacity) {
  const dp = new Array(capacity + 1).fill(0);
  for (let i = 0; i < weights.length; i++) {
    for (let c = capacity; c >= weights[i]; c--) {
      dp[c] = Math.max(dp[c], dp[c - weights[i]] + values[i]);
    }
  }
  return dp[capacity];
}
```

## TypeScript

```typescript
function knapsack(weights: number[], values: number[], capacity: number): number {
  const dp: number[] = new Array(capacity + 1).fill(0);
  for (let i = 0; i < weights.length; i++) {
    for (let c = capacity; c >= weights[i]; c--) {
      dp[c] = Math.max(dp[c], dp[c - weights[i]] + values[i]);
    }
  }
  return dp[capacity];
}
```

## Java

```java
class Solution {
    public int knapsack(int[] weights, int[] values, int capacity) {
        int[] dp = new int[capacity + 1];
        for (int i = 0; i < weights.length; i++) {
            for (int c = capacity; c >= weights[i]; c--) {
                dp[c] = Math.max(dp[c], dp[c - weights[i]] + values[i]);
            }
        }
        return dp[capacity];
    }
}
```

## C++

```cpp
class Solution {
public:
    int knapsack(vector<int>& weights, vector<int>& values, int capacity) {
        vector<int> dp(capacity + 1, 0);
        for (size_t i = 0; i < weights.size(); i++) {
            for (int c = capacity; c >= weights[i]; c--) {
                dp[c] = max(dp[c], dp[c - weights[i]] + values[i]);
            }
        }
        return dp[capacity];
    }
};
```

## C#

```csharp
public class Solution {
    public int Knapsack(int[] weights, int[] values, int capacity) {
        var dp = new int[capacity + 1];
        for (int i = 0; i < weights.Length; i++) {
            for (int c = capacity; c >= weights[i]; c--) {
                dp[c] = Math.Max(dp[c], dp[c - weights[i]] + values[i]);
            }
        }
        return dp[capacity];
    }
}
```

## Go

```go
func knapsack(weights []int, values []int, capacity int) int {
	dp := make([]int, capacity+1)
	for i := range weights {
		for c := capacity; c >= weights[i]; c-- {
			if v := dp[c-weights[i]] + values[i]; v > dp[c] {
				dp[c] = v
			}
		}
	}
	return dp[capacity]
}
```
