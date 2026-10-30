## Ideia

O próximo elemento da resposta é sempre o menor entre as frentes das `k` sequências. Um min-heap guarda exatamente essas frentes: uma entrada por sequência não vazia, com o valor, o índice da sequência e a posição dentro dela.

Retire o menor do heap, acrescente-o à resposta e, se a sequência de onde ele veio ainda tem elementos, insira o próximo dela. Como o heap nunca passa de `k` entradas, cada passo custa O(log k).

## Complexidade

Tempo O(N log k), onde N é o total de elementos. Espaço O(k) para o heap, além da saída.

## Python

```python
import heapq


def merge_k_lists(lists):
    heap = [(seq[0], i, 0) for i, seq in enumerate(lists) if seq]
    heapq.heapify(heap)
    resultado = []
    while heap:
        valor, i, pos = heapq.heappop(heap)
        resultado.append(valor)
        if pos + 1 < len(lists[i]):
            heapq.heappush(heap, (lists[i][pos + 1], i, pos + 1))
    return resultado
```

## JavaScript

```javascript
function mergeKLists(lists) {
  const heap = [];
  const menor = (a, b) => a[0] < b[0] || (a[0] === b[0] && a[1] < b[1]);
  const push = (x) => {
    heap.push(x);
    let i = heap.length - 1;
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (!menor(heap[i], heap[p])) break;
      [heap[i], heap[p]] = [heap[p], heap[i]];
      i = p;
    }
  };
  const pop = () => {
    const topo = heap[0];
    const ultimo = heap.pop();
    if (heap.length > 0) {
      heap[0] = ultimo;
      let i = 0;
      for (;;) {
        let m = i;
        const l = 2 * i + 1, r = l + 1;
        if (l < heap.length && menor(heap[l], heap[m])) m = l;
        if (r < heap.length && menor(heap[r], heap[m])) m = r;
        if (m === i) break;
        [heap[i], heap[m]] = [heap[m], heap[i]];
        i = m;
      }
    }
    return topo;
  };

  lists.forEach((seq, i) => {
    if (seq.length > 0) push([seq[0], i, 0]);
  });
  const resultado = [];
  while (heap.length > 0) {
    const [valor, i, pos] = pop();
    resultado.push(valor);
    if (pos + 1 < lists[i].length) push([lists[i][pos + 1], i, pos + 1]);
  }
  return resultado;
}
```

## TypeScript

```typescript
function mergeKLists(lists: number[][]): number[] {
  type Item = [number, number, number];
  const heap: Item[] = [];
  const menor = (a: Item, b: Item): boolean =>
    a[0] < b[0] || (a[0] === b[0] && a[1] < b[1]);
  const push = (x: Item): void => {
    heap.push(x);
    let i = heap.length - 1;
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (!menor(heap[i], heap[p])) break;
      [heap[i], heap[p]] = [heap[p], heap[i]];
      i = p;
    }
  };
  const pop = (): Item => {
    const topo = heap[0];
    const ultimo = heap.pop() as Item;
    if (heap.length > 0) {
      heap[0] = ultimo;
      let i = 0;
      for (;;) {
        let m = i;
        const l = 2 * i + 1, r = l + 1;
        if (l < heap.length && menor(heap[l], heap[m])) m = l;
        if (r < heap.length && menor(heap[r], heap[m])) m = r;
        if (m === i) break;
        [heap[i], heap[m]] = [heap[m], heap[i]];
        i = m;
      }
    }
    return topo;
  };

  lists.forEach((seq, i) => {
    if (seq.length > 0) push([seq[0], i, 0]);
  });
  const resultado: number[] = [];
  while (heap.length > 0) {
    const [valor, i, pos] = pop();
    resultado.push(valor);
    if (pos + 1 < lists[i].length) push([lists[i][pos + 1], i, pos + 1]);
  }
  return resultado;
}
```

## Java

```java
class Solution {
    public int[] mergeKLists(int[][] lists) {
        PriorityQueue<int[]> heap = new PriorityQueue<>((a, b) -> Integer.compare(a[0], b[0]));
        int total = 0;
        for (int i = 0; i < lists.length; i++) {
            total += lists[i].length;
            if (lists[i].length > 0) heap.add(new int[]{lists[i][0], i, 0});
        }
        int[] resultado = new int[total];
        int k = 0;
        while (!heap.isEmpty()) {
            int[] topo = heap.poll();
            resultado[k++] = topo[0];
            int i = topo[1], pos = topo[2] + 1;
            if (pos < lists[i].length) heap.add(new int[]{lists[i][pos], i, pos});
        }
        return resultado;
    }
}
```

## C++

```cpp
class Solution {
public:
    vector<int> mergeKLists(vector<vector<int>>& lists) {
        using Item = tuple<int, int, int>;
        priority_queue<Item, vector<Item>, greater<Item>> heap;
        for (int i = 0; i < (int)lists.size(); i++)
            if (!lists[i].empty()) heap.push({lists[i][0], i, 0});
        vector<int> resultado;
        while (!heap.empty()) {
            auto [valor, i, pos] = heap.top();
            heap.pop();
            resultado.push_back(valor);
            if (pos + 1 < (int)lists[i].size())
                heap.push({lists[i][pos + 1], i, pos + 1});
        }
        return resultado;
    }
};
```

## C#

```csharp
public class Solution {
    public int[] MergeKLists(int[][] lists) {
        // Chave = valor deslocado * 20000 + indice da lista (unica por lista).
        const long DESLOC = 1000000000L;
        var frente = new SortedSet<long>();
        var pos = new int[lists.Length];
        for (int i = 0; i < lists.Length; i++)
            if (lists[i].Length > 0) frente.Add((lists[i][0] + DESLOC) * 20000 + i);
        var resultado = new List<int>();
        while (frente.Count > 0) {
            long chave = frente.Min;
            frente.Remove(chave);
            int i = (int)(chave % 20000);
            resultado.Add(lists[i][pos[i]]);
            pos[i]++;
            if (pos[i] < lists[i].Length)
                frente.Add((lists[i][pos[i]] + DESLOC) * 20000 + i);
        }
        return resultado.ToArray();
    }
}
```

## Go

```go
import "container/heap"

type item struct{ valor, i, pos int }
type filaMin []item

func (h filaMin) Len() int            { return len(h) }
func (h filaMin) Less(a, b int) bool  { return h[a].valor < h[b].valor }
func (h filaMin) Swap(a, b int)       { h[a], h[b] = h[b], h[a] }
func (h *filaMin) Push(x interface{}) { *h = append(*h, x.(item)) }
func (h *filaMin) Pop() interface{} {
	velho := *h
	n := len(velho)
	x := velho[n-1]
	*h = velho[:n-1]
	return x
}

func mergeKLists(lists [][]int) []int {
	h := &filaMin{}
	for i, seq := range lists {
		if len(seq) > 0 {
			*h = append(*h, item{seq[0], i, 0})
		}
	}
	heap.Init(h)
	resultado := []int{}
	for h.Len() > 0 {
		topo := heap.Pop(h).(item)
		resultado = append(resultado, topo.valor)
		if topo.pos+1 < len(lists[topo.i]) {
			heap.Push(h, item{lists[topo.i][topo.pos+1], topo.i, topo.pos + 1})
		}
	}
	return resultado
}
```
