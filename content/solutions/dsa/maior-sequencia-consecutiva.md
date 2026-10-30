## Ideia

Colocamos todos os números num conjunto. Uma sequência consecutiva começa em um número `x` tal que `x - 1` não está no conjunto. Só a partir desses inícios contamos para frente (`x + 1`, `x + 2`, ...) enquanto os valores existirem.

Como cada sequência é percorrida apenas a partir do seu início, cada número é visitado no máximo duas vezes no total, e o algoritmo é linear, sem precisar ordenar. Duplicatas desaparecem naturalmente no conjunto.

## Complexidade

Tempo `O(n)` esperado e espaço `O(n)` para o conjunto.

## Python

```python
def longest_consecutive(nums):
    conjunto = set(nums)
    melhor = 0
    for x in conjunto:
        if x - 1 not in conjunto:
            fim = x
            while fim + 1 in conjunto:
                fim += 1
            melhor = max(melhor, fim - x + 1)
    return melhor
```

## JavaScript

```javascript
function longestConsecutive(nums) {
  const conjunto = new Set(nums);
  let melhor = 0;
  for (const x of conjunto) {
    if (!conjunto.has(x - 1)) {
      let fim = x;
      while (conjunto.has(fim + 1)) fim++;
      melhor = Math.max(melhor, fim - x + 1);
    }
  }
  return melhor;
}
```

## TypeScript

```typescript
function longestConsecutive(nums: number[]): number {
  const conjunto = new Set<number>(nums);
  let melhor = 0;
  for (const x of conjunto) {
    if (!conjunto.has(x - 1)) {
      let fim = x;
      while (conjunto.has(fim + 1)) fim++;
      melhor = Math.max(melhor, fim - x + 1);
    }
  }
  return melhor;
}
```

## Java

```java
class Solution {
    public int longestConsecutive(int[] nums) {
        Set<Integer> conjunto = new HashSet<>();
        for (int x : nums) conjunto.add(x);
        int melhor = 0;
        for (int x : conjunto) {
            if (!conjunto.contains(x - 1)) {
                int fim = x;
                while (conjunto.contains(fim + 1)) fim++;
                melhor = Math.max(melhor, fim - x + 1);
            }
        }
        return melhor;
    }
}
```

## C++

```cpp
class Solution {
public:
    int longestConsecutive(vector<int>& nums) {
        unordered_set<int> conjunto(nums.begin(), nums.end());
        int melhor = 0;
        for (int x : conjunto) {
            if (!conjunto.count(x - 1)) {
                int fim = x;
                while (conjunto.count(fim + 1)) fim++;
                melhor = max(melhor, fim - x + 1);
            }
        }
        return melhor;
    }
};
```

## C#

```csharp
public class Solution {
    public int LongestConsecutive(int[] nums) {
        var conjunto = new HashSet<int>(nums);
        int melhor = 0;
        foreach (int x in conjunto) {
            if (!conjunto.Contains(x - 1)) {
                int fim = x;
                while (conjunto.Contains(fim + 1)) fim++;
                melhor = Math.Max(melhor, fim - x + 1);
            }
        }
        return melhor;
    }
}
```

## Go

```go
func longestConsecutive(nums []int) int {
	conjunto := map[int]bool{}
	for _, x := range nums {
		conjunto[x] = true
	}
	melhor := 0
	for x := range conjunto {
		if !conjunto[x-1] {
			fim := x
			for conjunto[fim+1] {
				fim++
			}
			if fim-x+1 > melhor {
				melhor = fim - x + 1
			}
		}
	}
	return melhor
}
```
