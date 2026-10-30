## Ideia

O melhor trecho num círculo ou não cruza a emenda (é um subarray comum) ou cruza, e então o que sobra fora dele é um subarray comum de soma mínima. Assim, a resposta é o maior entre a soma máxima de um subarray comum e `total - soma mínima de um subarray comum`. Ambos saem do algoritmo de Kadane, rodado em uma única passada.

Há um caso especial: se todos os números forem negativos, o subarray de soma mínima é o array inteiro e `total - minimo` daria zero (trecho vazio, proibido). Nesse caso, a resposta é simplesmente a soma máxima comum, que é o maior elemento.

## Complexidade

Tempo O(n), uma passada. Espaço O(1).

## Python

```python
def max_subarray_sum_circular(nums):
    total = 0
    atual_max = atual_min = 0
    melhor_max = nums[0]
    melhor_min = nums[0]
    for x in nums:
        total += x
        atual_max = max(atual_max + x, x)
        melhor_max = max(melhor_max, atual_max)
        atual_min = min(atual_min + x, x)
        melhor_min = min(melhor_min, atual_min)
    if melhor_max < 0:
        return melhor_max
    return max(melhor_max, total - melhor_min)
```

## JavaScript

```javascript
function maxSubarraySumCircular(nums) {
  let total = 0;
  let atualMax = 0;
  let atualMin = 0;
  let melhorMax = nums[0];
  let melhorMin = nums[0];
  for (const x of nums) {
    total += x;
    atualMax = Math.max(atualMax + x, x);
    melhorMax = Math.max(melhorMax, atualMax);
    atualMin = Math.min(atualMin + x, x);
    melhorMin = Math.min(melhorMin, atualMin);
  }
  if (melhorMax < 0) return melhorMax;
  return Math.max(melhorMax, total - melhorMin);
}
```

## TypeScript

```typescript
function maxSubarraySumCircular(nums: number[]): number {
  let total = 0;
  let atualMax = 0;
  let atualMin = 0;
  let melhorMax = nums[0];
  let melhorMin = nums[0];
  for (const x of nums) {
    total += x;
    atualMax = Math.max(atualMax + x, x);
    melhorMax = Math.max(melhorMax, atualMax);
    atualMin = Math.min(atualMin + x, x);
    melhorMin = Math.min(melhorMin, atualMin);
  }
  if (melhorMax < 0) return melhorMax;
  return Math.max(melhorMax, total - melhorMin);
}
```

## Java

```java
class Solution {
    public int maxSubarraySumCircular(int[] nums) {
        int total = 0, atualMax = 0, atualMin = 0;
        int melhorMax = nums[0], melhorMin = nums[0];
        for (int x : nums) {
            total += x;
            atualMax = Math.max(atualMax + x, x);
            melhorMax = Math.max(melhorMax, atualMax);
            atualMin = Math.min(atualMin + x, x);
            melhorMin = Math.min(melhorMin, atualMin);
        }
        if (melhorMax < 0) return melhorMax;
        return Math.max(melhorMax, total - melhorMin);
    }
}
```

## C++

```cpp
class Solution {
public:
    int maxSubarraySumCircular(vector<int>& nums) {
        int total = 0, atualMax = 0, atualMin = 0;
        int melhorMax = nums[0], melhorMin = nums[0];
        for (int x : nums) {
            total += x;
            atualMax = max(atualMax + x, x);
            melhorMax = max(melhorMax, atualMax);
            atualMin = min(atualMin + x, x);
            melhorMin = min(melhorMin, atualMin);
        }
        if (melhorMax < 0) return melhorMax;
        return max(melhorMax, total - melhorMin);
    }
};
```

## C#

```csharp
public class Solution {
    public int MaxSubarraySumCircular(int[] nums) {
        int total = 0, atualMax = 0, atualMin = 0;
        int melhorMax = nums[0], melhorMin = nums[0];
        foreach (int x in nums) {
            total += x;
            atualMax = Math.Max(atualMax + x, x);
            melhorMax = Math.Max(melhorMax, atualMax);
            atualMin = Math.Min(atualMin + x, x);
            melhorMin = Math.Min(melhorMin, atualMin);
        }
        if (melhorMax < 0) return melhorMax;
        return Math.Max(melhorMax, total - melhorMin);
    }
}
```

## Go

```go
func maxSubarraySumCircular(nums []int) int {
	total, atualMax, atualMin := 0, 0, 0
	melhorMax, melhorMin := nums[0], nums[0]
	for _, x := range nums {
		total += x
		atualMax = max(atualMax+x, x)
		melhorMax = max(melhorMax, atualMax)
		atualMin = min(atualMin+x, x)
		melhorMin = min(melhorMin, atualMin)
	}
	if melhorMax < 0 {
		return melhorMax
	}
	return max(melhorMax, total-melhorMin)
}
```
