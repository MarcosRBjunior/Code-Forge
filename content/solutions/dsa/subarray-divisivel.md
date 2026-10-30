## Ideia

Um trecho entre duas posições tem soma divisível por `k` exatamente quando as somas de prefixo nessas duas posições deixam o mesmo resto na divisão por `k`. Então basta contar quantos prefixos já vistos têm cada resto: cada novo prefixo forma um trecho válido com todos os anteriores de mesmo resto.

O prefixo vazio (resto 0) conta como um prefixo visto. Em linguagens em que `%` pode dar resultado negativo, o resto é normalizado para o intervalo de 0 a `k - 1`.

## Complexidade

Tempo O(n + k). Espaço O(k) para a tabela de restos.

## Python

```python
def subarrays_div_by_k(nums, k):
    restos = [0] * k
    restos[0] = 1
    prefixo = 0
    total = 0
    for x in nums:
        prefixo = (prefixo + x) % k
        total += restos[prefixo]
        restos[prefixo] += 1
    return total
```

## JavaScript

```javascript
function subarraysDivByK(nums, k) {
  const restos = new Array(k).fill(0);
  restos[0] = 1;
  let prefixo = 0;
  let total = 0;
  for (const x of nums) {
    prefixo = (((prefixo + x) % k) + k) % k;
    total += restos[prefixo];
    restos[prefixo]++;
  }
  return total;
}
```

## TypeScript

```typescript
function subarraysDivByK(nums: number[], k: number): number {
  const restos: number[] = new Array(k).fill(0);
  restos[0] = 1;
  let prefixo = 0;
  let total = 0;
  for (const x of nums) {
    prefixo = (((prefixo + x) % k) + k) % k;
    total += restos[prefixo];
    restos[prefixo]++;
  }
  return total;
}
```

## Java

```java
class Solution {
    public int subarraysDivByK(int[] nums, int k) {
        int[] restos = new int[k];
        restos[0] = 1;
        int prefixo = 0, total = 0;
        for (int x : nums) {
            prefixo = ((prefixo + x) % k + k) % k;
            total += restos[prefixo];
            restos[prefixo]++;
        }
        return total;
    }
}
```

## C++

```cpp
class Solution {
public:
    int subarraysDivByK(vector<int>& nums, int k) {
        vector<int> restos(k, 0);
        restos[0] = 1;
        int prefixo = 0, total = 0;
        for (int x : nums) {
            prefixo = ((prefixo + x) % k + k) % k;
            total += restos[prefixo];
            restos[prefixo]++;
        }
        return total;
    }
};
```

## C#

```csharp
public class Solution {
    public int SubarraysDivByK(int[] nums, int k) {
        var restos = new int[k];
        restos[0] = 1;
        int prefixo = 0, total = 0;
        foreach (int x in nums) {
            prefixo = ((prefixo + x) % k + k) % k;
            total += restos[prefixo];
            restos[prefixo]++;
        }
        return total;
    }
}
```

## Go

```go
func subarraysDivByK(nums []int, k int) int {
	restos := make([]int, k)
	restos[0] = 1
	prefixo, total := 0, 0
	for _, x := range nums {
		prefixo = ((prefixo+x)%k + k) % k
		total += restos[prefixo]
		restos[prefixo]++
	}
	return total
}
```
