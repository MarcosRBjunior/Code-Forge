## Ideia

Pegar sempre a maior moeda não funciona, então calculamos a resposta para todos os valores de 0 até `amount`. Seja `dp[v]` o menor número de moedas que somam exatamente `v`. Com `dp[0] = 0`, para cada `v` testamos cada moeda `c <= v` e usamos `dp[v - c] + 1`, ficando com o mínimo.

Valores inalcançáveis ficam marcados com um número grande (infinito). Se `dp[amount]` continuar infinito, a resposta é `-1`. Moedas maiores que `amount` nunca servem e são ignoradas.

## Complexidade

Tempo O(amount * m), com m moedas. Espaço O(amount).

## Python

```python
def coin_change(coins, amount):
    inf = amount + 1
    dp = [0] + [inf] * amount
    for v in range(1, amount + 1):
        for c in coins:
            if c <= v and dp[v - c] + 1 < dp[v]:
                dp[v] = dp[v - c] + 1
    return dp[amount] if dp[amount] != inf else -1
```

## JavaScript

```javascript
function coinChange(coins, amount) {
  const inf = amount + 1;
  const dp = new Array(amount + 1).fill(inf);
  dp[0] = 0;
  for (let v = 1; v <= amount; v++) {
    for (const c of coins) {
      if (c <= v && dp[v - c] + 1 < dp[v]) dp[v] = dp[v - c] + 1;
    }
  }
  return dp[amount] !== inf ? dp[amount] : -1;
}
```

## TypeScript

```typescript
function coinChange(coins: number[], amount: number): number {
  const inf = amount + 1;
  const dp: number[] = new Array(amount + 1).fill(inf);
  dp[0] = 0;
  for (let v = 1; v <= amount; v++) {
    for (const c of coins) {
      if (c <= v && dp[v - c] + 1 < dp[v]) dp[v] = dp[v - c] + 1;
    }
  }
  return dp[amount] !== inf ? dp[amount] : -1;
}
```

## Java

```java
class Solution {
    public int coinChange(int[] coins, int amount) {
        int inf = amount + 1;
        int[] dp = new int[amount + 1];
        Arrays.fill(dp, inf);
        dp[0] = 0;
        for (int v = 1; v <= amount; v++) {
            for (int c : coins) {
                if (c <= v && dp[v - c] + 1 < dp[v]) dp[v] = dp[v - c] + 1;
            }
        }
        return dp[amount] != inf ? dp[amount] : -1;
    }
}
```

## C++

```cpp
class Solution {
public:
    int coinChange(vector<int>& coins, int amount) {
        int inf = amount + 1;
        vector<int> dp(amount + 1, inf);
        dp[0] = 0;
        for (int v = 1; v <= amount; v++) {
            for (int c : coins) {
                if (c <= v && dp[v - c] + 1 < dp[v]) dp[v] = dp[v - c] + 1;
            }
        }
        return dp[amount] != inf ? dp[amount] : -1;
    }
};
```

## C#

```csharp
public class Solution {
    public int CoinChange(int[] coins, int amount) {
        int inf = amount + 1;
        int[] dp = new int[amount + 1];
        Array.Fill(dp, inf);
        dp[0] = 0;
        for (int v = 1; v <= amount; v++) {
            foreach (int c in coins) {
                if (c <= v && dp[v - c] + 1 < dp[v]) dp[v] = dp[v - c] + 1;
            }
        }
        return dp[amount] != inf ? dp[amount] : -1;
    }
}
```

## Go

```go
func coinChange(coins []int, amount int) int {
	inf := amount + 1
	dp := make([]int, amount+1)
	for i := 1; i <= amount; i++ {
		dp[i] = inf
	}
	for v := 1; v <= amount; v++ {
		for _, c := range coins {
			if c <= v && dp[v-c]+1 < dp[v] {
				dp[v] = dp[v-c] + 1
			}
		}
	}
	if dp[amount] != inf {
		return dp[amount]
	}
	return -1
}
```
