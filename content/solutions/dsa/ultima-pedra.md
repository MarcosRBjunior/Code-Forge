## Ideia

A operação pede sempre as duas pedras mais pesadas e, às vezes, a devolução de uma pedra nova. Um max-heap faz isso em tempo logarítmico: retiramos as duas maiores, e se os pesos forem diferentes inserimos a diferença de volta.

O jogo acaba quando o heap tem no máximo um elemento; a resposta é esse elemento ou `0` se estiver vazio.

## Complexidade

Tempo O(n log n), pois há no máximo n rodadas e cada uma faz operações de heap em O(log n). Espaço O(n).

## Python

```python
import heapq


def last_stone_weight(stones):
    heap = [-p for p in stones]
    heapq.heapify(heap)
    while len(heap) > 1:
        a = -heapq.heappop(heap)
        b = -heapq.heappop(heap)
        if a != b:
            heapq.heappush(heap, -(a - b))
    return -heap[0] if heap else 0
```

## JavaScript

```javascript
function lastStoneWeight(stones) {
  // n <= 30: manter o array ordenado é simples e suficiente.
  const pedras = [...stones].sort((a, b) => a - b);
  while (pedras.length > 1) {
    const a = pedras.pop();
    const b = pedras.pop();
    if (a !== b) {
      const resto = a - b;
      let i = pedras.length;
      while (i > 0 && pedras[i - 1] > resto) i--;
      pedras.splice(i, 0, resto);
    }
  }
  return pedras.length ? pedras[0] : 0;
}
```

## TypeScript

```typescript
function lastStoneWeight(stones: number[]): number {
  // n <= 30: manter o array ordenado é simples e suficiente.
  const pedras: number[] = [...stones].sort((a, b) => a - b);
  while (pedras.length > 1) {
    const a = pedras.pop()!;
    const b = pedras.pop()!;
    if (a !== b) {
      const resto = a - b;
      let i = pedras.length;
      while (i > 0 && pedras[i - 1] > resto) i--;
      pedras.splice(i, 0, resto);
    }
  }
  return pedras.length ? pedras[0] : 0;
}
```

## Java

```java
class Solution {
    public int lastStoneWeight(int[] stones) {
        PriorityQueue<Integer> heap = new PriorityQueue<>(Collections.reverseOrder());
        for (int p : stones) heap.add(p);
        while (heap.size() > 1) {
            int a = heap.poll();
            int b = heap.poll();
            if (a != b) heap.add(a - b);
        }
        return heap.isEmpty() ? 0 : heap.peek();
    }
}
```

## C++

```cpp
class Solution {
public:
    int lastStoneWeight(vector<int>& stones) {
        priority_queue<int> heap(stones.begin(), stones.end());
        while (heap.size() > 1) {
            int a = heap.top();
            heap.pop();
            int b = heap.top();
            heap.pop();
            if (a != b) heap.push(a - b);
        }
        return heap.empty() ? 0 : heap.top();
    }
};
```

## C#

```csharp
public class Solution {
    public int LastStoneWeight(int[] stones) {
        // n <= 30: manter a lista ordenada é simples e suficiente.
        var pedras = new List<int>(stones);
        pedras.Sort();
        while (pedras.Count > 1) {
            int a = pedras[pedras.Count - 1];
            int b = pedras[pedras.Count - 2];
            pedras.RemoveRange(pedras.Count - 2, 2);
            if (a != b) {
                int pos = pedras.BinarySearch(a - b);
                if (pos < 0) pos = ~pos;
                pedras.Insert(pos, a - b);
            }
        }
        return pedras.Count == 0 ? 0 : pedras[0];
    }
}
```

## Go

```go
import "sort"

func lastStoneWeight(stones []int) int {
	// n <= 30: manter o slice ordenado é simples e suficiente.
	pedras := append([]int(nil), stones...)
	sort.Ints(pedras)
	for len(pedras) > 1 {
		n := len(pedras)
		a, b := pedras[n-1], pedras[n-2]
		pedras = pedras[:n-2]
		if a != b {
			resto := a - b
			pos := sort.SearchInts(pedras, resto)
			pedras = append(pedras, 0)
			copy(pedras[pos+1:], pedras[pos:])
			pedras[pos] = resto
		}
	}
	if len(pedras) == 0 {
		return 0
	}
	return pedras[0]
}
```
