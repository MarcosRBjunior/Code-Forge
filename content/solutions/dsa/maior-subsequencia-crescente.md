## Ideia

Mantemos uma lista `caudas`, onde `caudas[k]` é o menor valor possível para o final de uma subsequência estritamente crescente de tamanho `k + 1`. Essa lista é sempre crescente. Para cada número `x`, procuramos por busca binária a primeira posição com valor maior ou igual a `x`: se existir, `x` substitui esse valor (um final menor deixa mais espaço para crescer depois); se não, `x` estende a lista.

A lista não é a subsequência em si, mas seu tamanho é o comprimento da maior subsequência crescente. Usar a primeira posição com valor maior ou igual garante que repetidos não aumentem o tamanho (a subsequência é estrita).

## Complexidade

Tempo `O(n log n)`, espaço `O(n)`.

## Python

```python
from bisect import bisect_left


def length_of_lis(nums):
    caudas = []
    for x in nums:
        pos = bisect_left(caudas, x)
        if pos == len(caudas):
            caudas.append(x)
        else:
            caudas[pos] = x
    return len(caudas)
```

## JavaScript

```javascript
function lengthOfLIS(nums) {
  const caudas = [];
  for (const x of nums) {
    let esquerda = 0;
    let direita = caudas.length;
    while (esquerda < direita) {
      const meio = (esquerda + direita) >> 1;
      if (caudas[meio] < x) esquerda = meio + 1;
      else direita = meio;
    }
    caudas[esquerda] = x;
  }
  return caudas.length;
}
```

## TypeScript

```typescript
function lengthOfLIS(nums: number[]): number {
  const caudas: number[] = [];
  for (const x of nums) {
    let esquerda = 0;
    let direita = caudas.length;
    while (esquerda < direita) {
      const meio = (esquerda + direita) >> 1;
      if (caudas[meio] < x) esquerda = meio + 1;
      else direita = meio;
    }
    caudas[esquerda] = x;
  }
  return caudas.length;
}
```

## Java

```java
class Solution {
    public int lengthOfLIS(int[] nums) {
        int[] caudas = new int[nums.length];
        int tamanho = 0;
        for (int x : nums) {
            int esquerda = 0, direita = tamanho;
            while (esquerda < direita) {
                int meio = (esquerda + direita) / 2;
                if (caudas[meio] < x) esquerda = meio + 1;
                else direita = meio;
            }
            caudas[esquerda] = x;
            if (esquerda == tamanho) tamanho++;
        }
        return tamanho;
    }
}
```

## C++

```cpp
class Solution {
public:
    int lengthOfLIS(vector<int>& nums) {
        vector<int> caudas;
        for (int x : nums) {
            auto it = lower_bound(caudas.begin(), caudas.end(), x);
            if (it == caudas.end()) caudas.push_back(x);
            else *it = x;
        }
        return caudas.size();
    }
};
```

## C#

```csharp
public class Solution {
    public int LengthOfLIS(int[] nums) {
        int[] caudas = new int[nums.Length];
        int tamanho = 0;
        foreach (int x in nums) {
            int esquerda = 0, direita = tamanho;
            while (esquerda < direita) {
                int meio = (esquerda + direita) / 2;
                if (caudas[meio] < x) esquerda = meio + 1;
                else direita = meio;
            }
            caudas[esquerda] = x;
            if (esquerda == tamanho) tamanho++;
        }
        return tamanho;
    }
}
```

## Go

```go
import "sort"

func lengthOfLIS(nums []int) int {
	caudas := []int{}
	for _, x := range nums {
		pos := sort.SearchInts(caudas, x)
		if pos == len(caudas) {
			caudas = append(caudas, x)
		} else {
			caudas[pos] = x
		}
	}
	return len(caudas)
}
```
