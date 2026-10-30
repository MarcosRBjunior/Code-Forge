## Ideia

Pensar em qual balão estourar primeiro cria dependências difíceis, porque os vizinhos mudam. Inverta a pergunta: qual balão é o **último** a estourar dentro de um intervalo? Nesse caso, no momento do estouro final, seus vizinhos são exatamente as bordas do intervalo, que ainda existem.

Coloque um balão de valor 1 em cada ponta do array. Seja `dp[i][j]` o máximo de moedas estourando todos os balões estritamente entre `i` e `j`. Se `k` é o último estourado nesse intervalo, ganha-se `v[i] * v[k] * v[j]` mais `dp[i][k]` mais `dp[k][j]`. Tome o melhor `k` e calcule os intervalos por tamanho crescente.

## Complexidade

Tempo O(n³), com três laços aninhados. Espaço O(n²) para a tabela.

## Python

```python
def max_coins(nums):
    v = [1] + nums + [1]
    n = len(v)
    dp = [[0] * n for _ in range(n)]
    for tam in range(2, n):
        for i in range(n - tam):
            j = i + tam
            for k in range(i + 1, j):
                moedas = dp[i][k] + v[i] * v[k] * v[j] + dp[k][j]
                if moedas > dp[i][j]:
                    dp[i][j] = moedas
    return dp[0][n - 1]
```

## JavaScript

```javascript
function maxCoins(nums) {
  const v = [1, ...nums, 1];
  const n = v.length;
  const dp = Array.from({ length: n }, () => new Array(n).fill(0));
  for (let tam = 2; tam < n; tam++) {
    for (let i = 0; i + tam < n; i++) {
      const j = i + tam;
      for (let k = i + 1; k < j; k++) {
        const moedas = dp[i][k] + v[i] * v[k] * v[j] + dp[k][j];
        if (moedas > dp[i][j]) dp[i][j] = moedas;
      }
    }
  }
  return dp[0][n - 1];
}
```

## TypeScript

```typescript
function maxCoins(nums: number[]): number {
  const v: number[] = [1, ...nums, 1];
  const n = v.length;
  const dp: number[][] = Array.from({ length: n }, () => new Array(n).fill(0));
  for (let tam = 2; tam < n; tam++) {
    for (let i = 0; i + tam < n; i++) {
      const j = i + tam;
      for (let k = i + 1; k < j; k++) {
        const moedas = dp[i][k] + v[i] * v[k] * v[j] + dp[k][j];
        if (moedas > dp[i][j]) dp[i][j] = moedas;
      }
    }
  }
  return dp[0][n - 1];
}
```

## Java

```java
class Solution {
    public int maxCoins(int[] nums) {
        int n = nums.length + 2;
        int[] v = new int[n];
        v[0] = v[n - 1] = 1;
        for (int i = 0; i < nums.length; i++) v[i + 1] = nums[i];
        int[][] dp = new int[n][n];
        for (int tam = 2; tam < n; tam++) {
            for (int i = 0; i + tam < n; i++) {
                int j = i + tam;
                for (int k = i + 1; k < j; k++) {
                    int moedas = dp[i][k] + v[i] * v[k] * v[j] + dp[k][j];
                    if (moedas > dp[i][j]) dp[i][j] = moedas;
                }
            }
        }
        return dp[0][n - 1];
    }
}
```

## C++

```cpp
class Solution {
public:
    int maxCoins(vector<int>& nums) {
        vector<int> v;
        v.push_back(1);
        for (int x : nums) v.push_back(x);
        v.push_back(1);
        int n = v.size();
        vector<vector<int>> dp(n, vector<int>(n, 0));
        for (int tam = 2; tam < n; tam++) {
            for (int i = 0; i + tam < n; i++) {
                int j = i + tam;
                for (int k = i + 1; k < j; k++) {
                    int moedas = dp[i][k] + v[i] * v[k] * v[j] + dp[k][j];
                    if (moedas > dp[i][j]) dp[i][j] = moedas;
                }
            }
        }
        return dp[0][n - 1];
    }
};
```

## C#

```csharp
public class Solution {
    public int MaxCoins(int[] nums) {
        int n = nums.Length + 2;
        var v = new int[n];
        v[0] = v[n - 1] = 1;
        for (int i = 0; i < nums.Length; i++) v[i + 1] = nums[i];
        var dp = new int[n, n];
        for (int tam = 2; tam < n; tam++) {
            for (int i = 0; i + tam < n; i++) {
                int j = i + tam;
                for (int k = i + 1; k < j; k++) {
                    int moedas = dp[i, k] + v[i] * v[k] * v[j] + dp[k, j];
                    if (moedas > dp[i, j]) dp[i, j] = moedas;
                }
            }
        }
        return dp[0, n - 1];
    }
}
```

## Go

```go
func maxCoins(nums []int) int {
	v := append([]int{1}, nums...)
	v = append(v, 1)
	n := len(v)
	dp := make([][]int, n)
	for i := range dp {
		dp[i] = make([]int, n)
	}
	for tam := 2; tam < n; tam++ {
		for i := 0; i+tam < n; i++ {
			j := i + tam
			for k := i + 1; k < j; k++ {
				moedas := dp[i][k] + v[i]*v[k]*v[j] + dp[k][j]
				if moedas > dp[i][j] {
					dp[i][j] = moedas
				}
			}
		}
	}
	return dp[0][n-1]
}
```
