## Ideia

Seja `dp[v]` o número de combinações que formam o valor `v`. Começamos com `dp[0] = 1`: há uma única forma de pagar zero, que é não usar moeda alguma.

O truque para contar combinações, e não sequências, está na ordem dos laços. Com o laço externo nas moedas e o interno nos valores, cada moeda é "liberada" uma de cada vez: ao processar a moeda `c`, fazemos `dp[v] += dp[v - c]`, e as combinações só podem usar moedas já liberadas, sempre na mesma ordem. Assim `1 + 2` e `2 + 1` nunca são contadas como duas formas distintas.

## Complexidade

Tempo O(amount × número de moedas). Espaço O(amount).

## Python

```python
def count_change(amount, coins):
    formas = [0] * (amount + 1)
    formas[0] = 1
    for moeda in coins:
        for valor in range(moeda, amount + 1):
            formas[valor] += formas[valor - moeda]
    return formas[amount]
```

## JavaScript

```javascript
function countChange(amount, coins) {
  const formas = new Array(amount + 1).fill(0);
  formas[0] = 1;
  for (const moeda of coins) {
    for (let valor = moeda; valor <= amount; valor++) {
      formas[valor] += formas[valor - moeda];
    }
  }
  return formas[amount];
}
```

## TypeScript

```typescript
function countChange(amount: number, coins: number[]): number {
  const formas: number[] = new Array(amount + 1).fill(0);
  formas[0] = 1;
  for (const moeda of coins) {
    for (let valor = moeda; valor <= amount; valor++) {
      formas[valor] += formas[valor - moeda];
    }
  }
  return formas[amount];
}
```

## Java

```java
class Solution {
    public int countChange(int amount, int[] coins) {
        int[] formas = new int[amount + 1];
        formas[0] = 1;
        for (int moeda : coins) {
            for (int valor = moeda; valor <= amount; valor++) {
                formas[valor] += formas[valor - moeda];
            }
        }
        return formas[amount];
    }
}
```

## C++

```cpp
class Solution {
public:
    int countChange(int amount, vector<int>& coins) {
        vector<int> formas(amount + 1, 0);
        formas[0] = 1;
        for (int moeda : coins) {
            for (int valor = moeda; valor <= amount; valor++) {
                formas[valor] += formas[valor - moeda];
            }
        }
        return formas[amount];
    }
};
```

## C#

```csharp
public class Solution {
    public int CountChange(int amount, int[] coins) {
        int[] formas = new int[amount + 1];
        formas[0] = 1;
        foreach (int moeda in coins) {
            for (int valor = moeda; valor <= amount; valor++) {
                formas[valor] += formas[valor - moeda];
            }
        }
        return formas[amount];
    }
}
```

## Go

```go
func countChange(amount int, coins []int) int {
	formas := make([]int, amount+1)
	formas[0] = 1
	for _, moeda := range coins {
		for valor := moeda; valor <= amount; valor++ {
			formas[valor] += formas[valor-moeda]
		}
	}
	return formas[amount]
}
```
