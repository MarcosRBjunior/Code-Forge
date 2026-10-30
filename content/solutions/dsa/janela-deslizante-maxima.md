## Ideia

Mantemos um deque de índices cujos valores são decrescentes da frente para o fundo. Quando chega um novo elemento, tudo o que está no fundo e é menor ou igual a ele nunca mais poderá ser o máximo de nenhuma janela (o novo é maior e permanece na janela por mais tempo), então esses índices são descartados.

Assim, o índice da frente do deque é sempre o do maior elemento da janela atual. Antes de ler o máximo, removemos da frente o índice que saiu da janela, isto é, quando ele é menor ou igual a `i - k`. Cada índice entra e sai do deque no máximo uma vez.

## Complexidade

Tempo O(n), pois cada índice é inserido e removido uma vez. Espaço O(k) para o deque, além da saída.

## Python

```python
from collections import deque


def max_sliding_window(nums, k):
    candidatos = deque()
    resultado = []
    for i, x in enumerate(nums):
        while candidatos and nums[candidatos[-1]] <= x:
            candidatos.pop()
        candidatos.append(i)
        if candidatos[0] <= i - k:
            candidatos.popleft()
        if i >= k - 1:
            resultado.append(nums[candidatos[0]])
    return resultado
```

## JavaScript

```javascript
function maxSlidingWindow(nums, k) {
  const candidatos = new Array(nums.length);
  let inicio = 0;
  let fim = 0;
  const resultado = [];
  for (let i = 0; i < nums.length; i++) {
    while (fim > inicio && nums[candidatos[fim - 1]] <= nums[i]) fim--;
    candidatos[fim++] = i;
    if (candidatos[inicio] <= i - k) inicio++;
    if (i >= k - 1) resultado.push(nums[candidatos[inicio]]);
  }
  return resultado;
}
```

## TypeScript

```typescript
function maxSlidingWindow(nums: number[], k: number): number[] {
  const candidatos: number[] = new Array(nums.length);
  let inicio = 0;
  let fim = 0;
  const resultado: number[] = [];
  for (let i = 0; i < nums.length; i++) {
    while (fim > inicio && nums[candidatos[fim - 1]] <= nums[i]) fim--;
    candidatos[fim++] = i;
    if (candidatos[inicio] <= i - k) inicio++;
    if (i >= k - 1) resultado.push(nums[candidatos[inicio]]);
  }
  return resultado;
}
```

## Java

```java
class Solution {
    public int[] maxSlidingWindow(int[] nums, int k) {
        int n = nums.length;
        int[] resultado = new int[n - k + 1];
        Deque<Integer> candidatos = new ArrayDeque<>();
        for (int i = 0; i < n; i++) {
            while (!candidatos.isEmpty() && nums[candidatos.peekLast()] <= nums[i]) {
                candidatos.pollLast();
            }
            candidatos.addLast(i);
            if (candidatos.peekFirst() <= i - k) candidatos.pollFirst();
            if (i >= k - 1) resultado[i - k + 1] = nums[candidatos.peekFirst()];
        }
        return resultado;
    }
}
```

## C++

```cpp
class Solution {
public:
    vector<int> maxSlidingWindow(vector<int>& nums, int k) {
        int n = nums.size();
        vector<int> resultado;
        deque<int> candidatos;
        for (int i = 0; i < n; i++) {
            while (!candidatos.empty() && nums[candidatos.back()] <= nums[i]) {
                candidatos.pop_back();
            }
            candidatos.push_back(i);
            if (candidatos.front() <= i - k) candidatos.pop_front();
            if (i >= k - 1) resultado.push_back(nums[candidatos.front()]);
        }
        return resultado;
    }
};
```

## C#

```csharp
public class Solution {
    public int[] MaxSlidingWindow(int[] nums, int k) {
        int n = nums.Length;
        int[] resultado = new int[n - k + 1];
        int[] candidatos = new int[n];
        int inicio = 0, fim = 0;
        for (int i = 0; i < n; i++) {
            while (fim > inicio && nums[candidatos[fim - 1]] <= nums[i]) fim--;
            candidatos[fim++] = i;
            if (candidatos[inicio] <= i - k) inicio++;
            if (i >= k - 1) resultado[i - k + 1] = nums[candidatos[inicio]];
        }
        return resultado;
    }
}
```

## Go

```go
func maxSlidingWindow(nums []int, k int) []int {
	resultado := make([]int, 0, len(nums)-k+1)
	candidatos := []int{}
	for i, x := range nums {
		for len(candidatos) > 0 && nums[candidatos[len(candidatos)-1]] <= x {
			candidatos = candidatos[:len(candidatos)-1]
		}
		candidatos = append(candidatos, i)
		if candidatos[0] <= i-k {
			candidatos = candidatos[1:]
		}
		if i >= k-1 {
			resultado = append(resultado, nums[candidatos[0]])
		}
	}
	return resultado
}
```
