## Ideia

Ao vender no dia `i`, o melhor é ter comprado no dia mais barato anterior. Então basta percorrer os preços uma vez guardando o menor preço visto até agora: para cada dia, o lucro possível é o preço de hoje menos esse mínimo, e a resposta é o maior desses lucros.

Se os preços só caem, nenhum lucro é positivo e a resposta fica em `0`, que é o valor inicial.

## Complexidade

Tempo O(n), uma passada. Espaço O(1).

## Python

```python
def max_profit(prices):
    menor = float("inf")
    melhor = 0
    for preco in prices:
        menor = min(menor, preco)
        melhor = max(melhor, preco - menor)
    return melhor
```

## JavaScript

```javascript
function maxProfit(prices) {
  let menor = Infinity, melhor = 0;
  for (const preco of prices) {
    menor = Math.min(menor, preco);
    melhor = Math.max(melhor, preco - menor);
  }
  return melhor;
}
```

## TypeScript

```typescript
function maxProfit(prices: number[]): number {
  let menor = Infinity, melhor = 0;
  for (const preco of prices) {
    menor = Math.min(menor, preco);
    melhor = Math.max(melhor, preco - menor);
  }
  return melhor;
}
```

## Java

```java
class Solution {
    public int maxProfit(int[] prices) {
        int menor = Integer.MAX_VALUE, melhor = 0;
        for (int preco : prices) {
            menor = Math.min(menor, preco);
            melhor = Math.max(melhor, preco - menor);
        }
        return melhor;
    }
}
```

## C++

```cpp
class Solution {
public:
    int maxProfit(vector<int>& prices) {
        int menor = INT_MAX, melhor = 0;
        for (int preco : prices) {
            menor = min(menor, preco);
            melhor = max(melhor, preco - menor);
        }
        return melhor;
    }
};
```

## C#

```csharp
public class Solution {
    public int MaxProfit(int[] prices) {
        int menor = int.MaxValue, melhor = 0;
        foreach (int preco in prices) {
            menor = Math.Min(menor, preco);
            melhor = Math.Max(melhor, preco - menor);
        }
        return melhor;
    }
}
```

## Go

```go
func maxProfit(prices []int) int {
	menor, melhor := prices[0], 0
	for _, preco := range prices {
		if preco < menor {
			menor = preco
		}
		if preco-menor > melhor {
			melhor = preco - menor
		}
	}
	return melhor
}
```
