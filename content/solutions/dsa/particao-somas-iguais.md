## Ideia

Se a soma total for ímpar, não há como dividir em duas metades iguais. Caso contrário, basta descobrir se existe um subconjunto cuja soma seja exatamente metade do total: o que sobra forma o outro grupo.

Isso é uma mochila 0/1 booleana. Mantenha um vetor `alcanca` em que `alcanca[s]` indica se alguma seleção de elementos já vistos soma `s`. Para cada número, percorra as somas de trás para a frente e marque `alcanca[s]` se `alcanca[s - x]` era verdadeiro. A ordem decrescente garante que cada elemento seja usado no máximo uma vez.

## Complexidade

Tempo O(n · S), com S a metade da soma total. Espaço O(S).

## Python

```python
def can_partition(nums):
    total = sum(nums)
    if total % 2:
        return False
    alvo = total // 2
    alcanca = [False] * (alvo + 1)
    alcanca[0] = True
    for x in nums:
        for s in range(alvo, x - 1, -1):
            if alcanca[s - x]:
                alcanca[s] = True
    return alcanca[alvo]
```

## JavaScript

```javascript
function canPartition(nums) {
  const total = nums.reduce((a, b) => a + b, 0);
  if (total % 2) return false;
  const alvo = total / 2;
  const alcanca = new Array(alvo + 1).fill(false);
  alcanca[0] = true;
  for (const x of nums) {
    for (let s = alvo; s >= x; s--) {
      if (alcanca[s - x]) alcanca[s] = true;
    }
  }
  return alcanca[alvo];
}
```

## TypeScript

```typescript
function canPartition(nums: number[]): boolean {
  const total = nums.reduce((a, b) => a + b, 0);
  if (total % 2) return false;
  const alvo = total / 2;
  const alcanca: boolean[] = new Array(alvo + 1).fill(false);
  alcanca[0] = true;
  for (const x of nums) {
    for (let s = alvo; s >= x; s--) {
      if (alcanca[s - x]) alcanca[s] = true;
    }
  }
  return alcanca[alvo];
}
```

## Java

```java
class Solution {
    public boolean canPartition(int[] nums) {
        int total = 0;
        for (int x : nums) total += x;
        if (total % 2 != 0) return false;
        int alvo = total / 2;
        boolean[] alcanca = new boolean[alvo + 1];
        alcanca[0] = true;
        for (int x : nums) {
            for (int s = alvo; s >= x; s--) {
                if (alcanca[s - x]) alcanca[s] = true;
            }
        }
        return alcanca[alvo];
    }
}
```

## C++

```cpp
class Solution {
public:
    bool canPartition(vector<int>& nums) {
        int total = accumulate(nums.begin(), nums.end(), 0);
        if (total % 2) return false;
        int alvo = total / 2;
        vector<bool> alcanca(alvo + 1, false);
        alcanca[0] = true;
        for (int x : nums) {
            for (int s = alvo; s >= x; s--) {
                if (alcanca[s - x]) alcanca[s] = true;
            }
        }
        return alcanca[alvo];
    }
};
```

## C#

```csharp
public class Solution {
    public bool CanPartition(int[] nums) {
        int total = nums.Sum();
        if (total % 2 != 0) return false;
        int alvo = total / 2;
        var alcanca = new bool[alvo + 1];
        alcanca[0] = true;
        foreach (int x in nums) {
            for (int s = alvo; s >= x; s--) {
                if (alcanca[s - x]) alcanca[s] = true;
            }
        }
        return alcanca[alvo];
    }
}
```

## Go

```go
func canPartition(nums []int) bool {
	total := 0
	for _, x := range nums {
		total += x
	}
	if total%2 != 0 {
		return false
	}
	alvo := total / 2
	alcanca := make([]bool, alvo+1)
	alcanca[0] = true
	for _, x := range nums {
		for s := alvo; s >= x; s-- {
			if alcanca[s-x] {
				alcanca[s] = true
			}
		}
	}
	return alcanca[alvo]
}
```
