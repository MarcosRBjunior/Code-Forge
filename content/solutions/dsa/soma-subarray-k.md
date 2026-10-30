## Ideia

Seja `prefixo` a soma dos elementos até a posição atual. Um subarray que termina aqui tem soma `k` exatamente quando existe um prefixo anterior igual a `prefixo - k`. Então basta guardar, num dicionário, quantas vezes cada valor de prefixo já ocorreu, e somar ao resultado a contagem de `prefixo - k` em cada passo.

O dicionário começa com o prefixo vazio (valor 0, uma ocorrência), para contar os subarrays que começam no início. Funciona com números negativos, pois não depende de janelas deslizantes.

## Complexidade

Tempo O(n), uma passada com consultas em tempo médio constante. Espaço O(n) para o dicionário.

## Python

```python
def subarray_sum(nums, k):
    contagem = {0: 1}
    prefixo = 0
    total = 0
    for x in nums:
        prefixo += x
        total += contagem.get(prefixo - k, 0)
        contagem[prefixo] = contagem.get(prefixo, 0) + 1
    return total
```

## JavaScript

```javascript
function subarraySum(nums, k) {
  const contagem = new Map([[0, 1]]);
  let prefixo = 0;
  let total = 0;
  for (const x of nums) {
    prefixo += x;
    total += contagem.get(prefixo - k) || 0;
    contagem.set(prefixo, (contagem.get(prefixo) || 0) + 1);
  }
  return total;
}
```

## TypeScript

```typescript
function subarraySum(nums: number[], k: number): number {
  const contagem = new Map<number, number>([[0, 1]]);
  let prefixo = 0;
  let total = 0;
  for (const x of nums) {
    prefixo += x;
    total += contagem.get(prefixo - k) ?? 0;
    contagem.set(prefixo, (contagem.get(prefixo) ?? 0) + 1);
  }
  return total;
}
```

## Java

```java
class Solution {
    public int subarraySum(int[] nums, int k) {
        Map<Integer, Integer> contagem = new HashMap<>();
        contagem.put(0, 1);
        int prefixo = 0, total = 0;
        for (int x : nums) {
            prefixo += x;
            total += contagem.getOrDefault(prefixo - k, 0);
            contagem.merge(prefixo, 1, Integer::sum);
        }
        return total;
    }
}
```

## C++

```cpp
class Solution {
public:
    int subarraySum(vector<int>& nums, int k) {
        unordered_map<int, int> contagem;
        contagem[0] = 1;
        int prefixo = 0, total = 0;
        for (int x : nums) {
            prefixo += x;
            auto it = contagem.find(prefixo - k);
            if (it != contagem.end()) total += it->second;
            contagem[prefixo]++;
        }
        return total;
    }
};
```

## C#

```csharp
public class Solution {
    public int SubarraySum(int[] nums, int k) {
        var contagem = new Dictionary<int, int>();
        contagem[0] = 1;
        int prefixo = 0, total = 0;
        foreach (int x in nums) {
            prefixo += x;
            int c;
            if (contagem.TryGetValue(prefixo - k, out c)) total += c;
            contagem.TryGetValue(prefixo, out c);
            contagem[prefixo] = c + 1;
        }
        return total;
    }
}
```

## Go

```go
func subarraySum(nums []int, k int) int {
	contagem := map[int]int{0: 1}
	prefixo, total := 0, 0
	for _, x := range nums {
		prefixo += x
		total += contagem[prefixo-k]
		contagem[prefixo]++
	}
	return total
}
```
