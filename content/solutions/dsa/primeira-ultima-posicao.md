## Ideia

Uma busca binária comum para ao achar o alvo, mas aqui queremos as bordas do trecho de repetidos. Defina uma busca que devolve o primeiro índice cujo valor é maior ou igual a um limite (o ponto de inserção à esquerda).

A primeira ocorrência de `target` é esse índice para `target`, se ali de fato estiver `target`. A última ocorrência é o índice para `target + 1` menos um. Duas buscas binárias independentes resolvem tudo em tempo logarítmico.

## Complexidade

Tempo O(log n), com duas buscas binárias. Espaço O(1).

## Python

```python
def search_range(nums, target):
    def primeiro_maior_igual(limite):
        lo, hi = 0, len(nums)
        while lo < hi:
            meio = (lo + hi) // 2
            if nums[meio] < limite:
                lo = meio + 1
            else:
                hi = meio
        return lo

    inicio = primeiro_maior_igual(target)
    if inicio == len(nums) or nums[inicio] != target:
        return [-1, -1]
    return [inicio, primeiro_maior_igual(target + 1) - 1]
```

## JavaScript

```javascript
function searchRange(nums, target) {
  const primeiroMaiorIgual = (limite) => {
    let lo = 0, hi = nums.length;
    while (lo < hi) {
      const meio = (lo + hi) >> 1;
      if (nums[meio] < limite) lo = meio + 1;
      else hi = meio;
    }
    return lo;
  };
  const inicio = primeiroMaiorIgual(target);
  if (inicio === nums.length || nums[inicio] !== target) return [-1, -1];
  return [inicio, primeiroMaiorIgual(target + 1) - 1];
}
```

## TypeScript

```typescript
function searchRange(nums: number[], target: number): number[] {
  const primeiroMaiorIgual = (limite: number): number => {
    let lo = 0, hi = nums.length;
    while (lo < hi) {
      const meio = (lo + hi) >> 1;
      if (nums[meio] < limite) lo = meio + 1;
      else hi = meio;
    }
    return lo;
  };
  const inicio = primeiroMaiorIgual(target);
  if (inicio === nums.length || nums[inicio] !== target) return [-1, -1];
  return [inicio, primeiroMaiorIgual(target + 1) - 1];
}
```

## Java

```java
class Solution {
    private int primeiroMaiorIgual(int[] nums, long limite) {
        int lo = 0, hi = nums.length;
        while (lo < hi) {
            int meio = (lo + hi) >>> 1;
            if (nums[meio] < limite) lo = meio + 1;
            else hi = meio;
        }
        return lo;
    }

    public int[] searchRange(int[] nums, int target) {
        int inicio = primeiroMaiorIgual(nums, target);
        if (inicio == nums.length || nums[inicio] != target) return new int[]{-1, -1};
        return new int[]{inicio, primeiroMaiorIgual(nums, (long) target + 1) - 1};
    }
}
```

## C++

```cpp
class Solution {
public:
    vector<int> searchRange(vector<int>& nums, int target) {
        int inicio = lower_bound(nums.begin(), nums.end(), target) - nums.begin();
        if (inicio == (int)nums.size() || nums[inicio] != target) return {-1, -1};
        int fim = upper_bound(nums.begin(), nums.end(), target) - nums.begin() - 1;
        return {inicio, fim};
    }
};
```

## C#

```csharp
public class Solution {
    private int PrimeiroMaiorIgual(int[] nums, long limite) {
        int lo = 0, hi = nums.Length;
        while (lo < hi) {
            int meio = lo + (hi - lo) / 2;
            if (nums[meio] < limite) lo = meio + 1;
            else hi = meio;
        }
        return lo;
    }

    public int[] SearchRange(int[] nums, int target) {
        int inicio = PrimeiroMaiorIgual(nums, target);
        if (inicio == nums.Length || nums[inicio] != target) return new int[]{-1, -1};
        return new int[]{inicio, PrimeiroMaiorIgual(nums, (long)target + 1) - 1};
    }
}
```

## Go

```go
func searchRange(nums []int, target int) []int {
	primeiroMaiorIgual := func(limite int) int {
		lo, hi := 0, len(nums)
		for lo < hi {
			meio := lo + (hi-lo)/2
			if nums[meio] < limite {
				lo = meio + 1
			} else {
				hi = meio
			}
		}
		return lo
	}
	inicio := primeiroMaiorIgual(target)
	if inicio == len(nums) || nums[inicio] != target {
		return []int{-1, -1}
	}
	return []int{inicio, primeiroMaiorIgual(target+1) - 1}
}
```
