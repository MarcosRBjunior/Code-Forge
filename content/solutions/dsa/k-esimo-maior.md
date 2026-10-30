## Ideia

O k-ésimo maior elemento é o que ocupa a posição `k - 1` quando o array está em ordem decrescente. Ordenar e indexar resolve direto, e valores repetidos contam separadamente justamente porque a ordenação os mantém todos.

Uma alternativa é manter um heap mínimo com os `k` maiores vistos até agora: o topo do heap é sempre o menor deles, ou seja, o k-ésimo maior. Ela é melhor quando `k` é pequeno, mas aqui a ordenação é mais curta e igualmente aceitável.

## Complexidade

Tempo `O(n log n)` pela ordenação. Espaço `O(n)` na cópia ordenada.

## Python

```python
def find_kth_largest(nums, k):
    return sorted(nums, reverse=True)[k - 1]
```

## JavaScript

```javascript
function findKthLargest(nums, k) {
  const ordenado = [...nums].sort((a, b) => b - a);
  return ordenado[k - 1];
}
```

## TypeScript

```typescript
function findKthLargest(nums: number[], k: number): number {
  const ordenado = [...nums].sort((a, b) => b - a);
  return ordenado[k - 1];
}
```

## Java

```java
class Solution {
    public int findKthLargest(int[] nums, int k) {
        int[] copia = nums.clone();
        Arrays.sort(copia);
        return copia[copia.length - k];
    }
}
```

## C++

```cpp
class Solution {
public:
    int findKthLargest(vector<int>& nums, int k) {
        vector<int> copia = nums;
        sort(copia.begin(), copia.end(), greater<int>());
        return copia[k - 1];
    }
};
```

## C#

```csharp
public class Solution {
    public int FindKthLargest(int[] nums, int k) {
        int[] copia = (int[])nums.Clone();
        Array.Sort(copia);
        return copia[copia.Length - k];
    }
}
```

## Go

```go
import "sort"

func findKthLargest(nums []int, k int) int {
	copia := append([]int(nil), nums...)
	sort.Sort(sort.Reverse(sort.IntSlice(copia)))
	return copia[k-1]
}
```
