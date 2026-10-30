## Ideia

Use a votação de Boyer-Moore. Mantenha um candidato e um contador. Ao ver o próprio candidato, some um; ao ver outro valor, subtraia um. Quando o contador chega a zero, o próximo elemento vira o novo candidato.

Cada voto contrário cancela um voto a favor. Como o elemento majoritário tem mais votos que todos os outros juntos, ele não pode ser totalmente cancelado e é o candidato que sobra no fim. Como a existência dele é garantida, não é preciso verificar.

## Complexidade

Tempo O(n), com uma passada. Espaço O(1).

## Python

```python
def majority_element(nums):
    candidato = None
    votos = 0
    for x in nums:
        if votos == 0:
            candidato = x
        votos += 1 if x == candidato else -1
    return candidato
```

## JavaScript

```javascript
function majorityElement(nums) {
  let candidato = null;
  let votos = 0;
  for (const x of nums) {
    if (votos === 0) candidato = x;
    votos += x === candidato ? 1 : -1;
  }
  return candidato;
}
```

## TypeScript

```typescript
function majorityElement(nums: number[]): number {
  let candidato = 0;
  let votos = 0;
  for (const x of nums) {
    if (votos === 0) candidato = x;
    votos += x === candidato ? 1 : -1;
  }
  return candidato;
}
```

## Java

```java
class Solution {
    public int majorityElement(int[] nums) {
        int candidato = 0, votos = 0;
        for (int x : nums) {
            if (votos == 0) candidato = x;
            votos += (x == candidato) ? 1 : -1;
        }
        return candidato;
    }
}
```

## C++

```cpp
class Solution {
public:
    int majorityElement(vector<int>& nums) {
        int candidato = 0, votos = 0;
        for (int x : nums) {
            if (votos == 0) candidato = x;
            votos += (x == candidato) ? 1 : -1;
        }
        return candidato;
    }
};
```

## C#

```csharp
public class Solution {
    public int MajorityElement(int[] nums) {
        int candidato = 0, votos = 0;
        foreach (int x in nums) {
            if (votos == 0) candidato = x;
            votos += (x == candidato) ? 1 : -1;
        }
        return candidato;
    }
}
```

## Go

```go
func majorityElement(nums []int) int {
	candidato, votos := 0, 0
	for _, x := range nums {
		if votos == 0 {
			candidato = x
		}
		if x == candidato {
			votos++
		} else {
			votos--
		}
	}
	return candidato
}
```
