## Ideia

Como todos os números são positivos, estender a janela sempre aumenta a soma e encolhê-la sempre diminui. Isso permite uma janela deslizante: avance a ponta direita somando valores e, sempre que a soma atingir `target`, registre o tamanho da janela e encolha pela esquerda enquanto a soma continuar suficiente.

Cada índice entra na janela uma vez e sai no máximo uma vez, então o trabalho total é linear. Se nenhuma janela chegou a atingir o alvo, o tamanho mínimo continua infinito e a resposta é `0`.

## Complexidade

Tempo O(n), pois cada ponteiro percorre o array uma vez. Espaço O(1).

## Python

```python
def min_sub_array_len(target, nums):
    melhor = len(nums) + 1
    soma = 0
    esq = 0
    for dir_, x in enumerate(nums):
        soma += x
        while soma >= target:
            melhor = min(melhor, dir_ - esq + 1)
            soma -= nums[esq]
            esq += 1
    return 0 if melhor > len(nums) else melhor
```

## JavaScript

```javascript
function minSubArrayLen(target, nums) {
  let melhor = nums.length + 1, soma = 0, esq = 0;
  for (let dir = 0; dir < nums.length; dir++) {
    soma += nums[dir];
    while (soma >= target) {
      melhor = Math.min(melhor, dir - esq + 1);
      soma -= nums[esq++];
    }
  }
  return melhor > nums.length ? 0 : melhor;
}
```

## TypeScript

```typescript
function minSubArrayLen(target: number, nums: number[]): number {
  let melhor = nums.length + 1, soma = 0, esq = 0;
  for (let dir = 0; dir < nums.length; dir++) {
    soma += nums[dir];
    while (soma >= target) {
      melhor = Math.min(melhor, dir - esq + 1);
      soma -= nums[esq++];
    }
  }
  return melhor > nums.length ? 0 : melhor;
}
```

## Java

```java
class Solution {
    public int minSubArrayLen(int target, int[] nums) {
        int melhor = nums.length + 1;
        long soma = 0;
        int esq = 0;
        for (int dir = 0; dir < nums.length; dir++) {
            soma += nums[dir];
            while (soma >= target) {
                melhor = Math.min(melhor, dir - esq + 1);
                soma -= nums[esq++];
            }
        }
        return melhor > nums.length ? 0 : melhor;
    }
}
```

## C++

```cpp
class Solution {
public:
    int minSubArrayLen(int target, vector<int>& nums) {
        int n = nums.size(), melhor = n + 1, esq = 0;
        long long soma = 0;
        for (int dir = 0; dir < n; dir++) {
            soma += nums[dir];
            while (soma >= target) {
                melhor = min(melhor, dir - esq + 1);
                soma -= nums[esq++];
            }
        }
        return melhor > n ? 0 : melhor;
    }
};
```

## C#

```csharp
public class Solution {
    public int MinSubArrayLen(int target, int[] nums) {
        int melhor = nums.Length + 1, esq = 0;
        long soma = 0;
        for (int dir = 0; dir < nums.Length; dir++) {
            soma += nums[dir];
            while (soma >= target) {
                melhor = Math.Min(melhor, dir - esq + 1);
                soma -= nums[esq++];
            }
        }
        return melhor > nums.Length ? 0 : melhor;
    }
}
```

## Go

```go
func minSubArrayLen(target int, nums []int) int {
	melhor := len(nums) + 1
	soma, esq := 0, 0
	for dir, x := range nums {
		soma += x
		for soma >= target {
			if dir-esq+1 < melhor {
				melhor = dir - esq + 1
			}
			soma -= nums[esq]
			esq++
		}
	}
	if melhor > len(nums) {
		return 0
	}
	return melhor
}
```
