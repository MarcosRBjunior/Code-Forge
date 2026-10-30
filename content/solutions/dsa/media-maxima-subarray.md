## Ideia

Como o tamanho `k` é fixo, maximizar a média equivale a maximizar a soma de uma janela de `k` elementos consecutivos. Calculamos a soma da primeira janela e, ao deslizá-la, somamos o elemento que entra e subtraímos o que sai, o que custa tempo constante por posição.

Guardamos a maior soma encontrada e dividimos por `k` só no final, o que mantém os cálculos em inteiros e evita acumular erro de ponto flutuante. O enunciado pede o resultado arredondado a 5 casas decimais, então arredondamos ao devolver.

## Complexidade

Tempo `O(n)`, espaço `O(1)`.

## Python

```python
def find_max_average(nums, k):
    soma = sum(nums[:k])
    melhor = soma
    for i in range(k, len(nums)):
        soma += nums[i] - nums[i - k]
        melhor = max(melhor, soma)
    return round(melhor / k, 5)
```

## JavaScript

```javascript
function findMaxAverage(nums, k) {
  let soma = 0;
  for (let i = 0; i < k; i++) soma += nums[i];
  let melhor = soma;
  for (let i = k; i < nums.length; i++) {
    soma += nums[i] - nums[i - k];
    melhor = Math.max(melhor, soma);
  }
  return Math.round((melhor / k) * 1e5) / 1e5;
}
```

## TypeScript

```typescript
function findMaxAverage(nums: number[], k: number): number {
  let soma = 0;
  for (let i = 0; i < k; i++) soma += nums[i];
  let melhor = soma;
  for (let i = k; i < nums.length; i++) {
    soma += nums[i] - nums[i - k];
    melhor = Math.max(melhor, soma);
  }
  return Math.round((melhor / k) * 1e5) / 1e5;
}
```

## Java

```java
class Solution {
    public double findMaxAverage(int[] nums, int k) {
        long soma = 0;
        for (int i = 0; i < k; i++) soma += nums[i];
        long melhor = soma;
        for (int i = k; i < nums.length; i++) {
            soma += nums[i] - nums[i - k];
            melhor = Math.max(melhor, soma);
        }
        return Math.round((double) melhor / k * 1e5) / 1e5;
    }
}
```

## C++

```cpp
class Solution {
public:
    double findMaxAverage(vector<int>& nums, int k) {
        long long soma = 0;
        for (int i = 0; i < k; i++) soma += nums[i];
        long long melhor = soma;
        for (int i = k; i < (int)nums.size(); i++) {
            soma += nums[i] - nums[i - k];
            melhor = max(melhor, soma);
        }
        return round((double)melhor / k * 1e5) / 1e5;
    }
};
```

## C#

```csharp
public class Solution {
    public double FindMaxAverage(int[] nums, int k) {
        long soma = 0;
        for (int i = 0; i < k; i++) soma += nums[i];
        long melhor = soma;
        for (int i = k; i < nums.Length; i++) {
            soma += nums[i] - nums[i - k];
            melhor = Math.Max(melhor, soma);
        }
        return Math.Round((double)melhor / k, 5);
    }
}
```

## Go

```go
import "math"

func findMaxAverage(nums []int, k int) float64 {
	soma := 0
	for i := 0; i < k; i++ {
		soma += nums[i]
	}
	melhor := soma
	for i := k; i < len(nums); i++ {
		soma += nums[i] - nums[i-k]
		melhor = max(melhor, soma)
	}
	return math.Round(float64(melhor)/float64(k)*1e5) / 1e5
}
```
