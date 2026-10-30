## Ideia

Para comparar distâncias à origem não é preciso tirar raiz: `x² + y²` preserva a ordem. Mantenha um heap máximo com no máximo `k` pontos, ordenado pela distância ao quadrado. Cada ponto novo entra no heap; se o tamanho passa de `k`, sai o mais distante, que está no topo.

No fim, o heap contém exatamente os `k` pontos mais próximos. Os testes garantem que não há empate na fronteira, então a resposta é única.

## Complexidade

Tempo O(n log k), pois cada ponto faz no máximo uma inserção e uma remoção num heap de tamanho `k`. Espaço O(k).

## Python

```python
import heapq

def k_closest(points, k):
    heap = []  # heap máximo simulado com distância negativa
    for x, y in points:
        heapq.heappush(heap, (-(x * x + y * y), x, y))
        if len(heap) > k:
            heapq.heappop(heap)
    return [[x, y] for _, x, y in heap]
```

## JavaScript

```javascript
function kClosest(points, k) {
  // sem heap nativo: ordenar pela distância ao quadrado e cortar os k primeiros
  const dist = (p) => p[0] * p[0] + p[1] * p[1];
  return [...points].sort((a, b) => dist(a) - dist(b)).slice(0, k);
}
```

## TypeScript

```typescript
function kClosest(points: number[][], k: number): number[][] {
  // sem heap nativo: ordenar pela distância ao quadrado e cortar os k primeiros
  const dist = (p: number[]): number => p[0] * p[0] + p[1] * p[1];
  return [...points].sort((a, b) => dist(a) - dist(b)).slice(0, k);
}
```

## Java

```java
class Solution {
    public int[][] kClosest(int[][] points, int k) {
        PriorityQueue<int[]> heap = new PriorityQueue<>(
            (a, b) -> Integer.compare(b[0] * b[0] + b[1] * b[1], a[0] * a[0] + a[1] * a[1]));
        for (int[] p : points) {
            heap.add(p);
            if (heap.size() > k) heap.poll();
        }
        return heap.toArray(new int[0][]);
    }
}
```

## C++

```cpp
class Solution {
public:
    vector<vector<int>> kClosest(vector<vector<int>>& points, int k) {
        priority_queue<pair<long long, int>> heap;  // (distância², índice), máximo no topo
        for (int i = 0; i < (int)points.size(); i++) {
            long long x = points[i][0], y = points[i][1];
            heap.push({x * x + y * y, i});
            if ((int)heap.size() > k) heap.pop();
        }
        vector<vector<int>> resposta;
        while (!heap.empty()) {
            resposta.push_back(points[heap.top().second]);
            heap.pop();
        }
        return resposta;
    }
};
```

## C#

```csharp
public class Solution {
    public int[][] KClosest(int[][] points, int k) {
        return points
            .OrderBy(p => (long)p[0] * p[0] + (long)p[1] * p[1])
            .Take(k)
            .ToArray();
    }
}
```

## Go

```go
import "sort"

func kClosest(points [][]int, k int) [][]int {
	copia := make([][]int, len(points))
	copy(copia, points)
	sort.Slice(copia, func(i, j int) bool {
		di := copia[i][0]*copia[i][0] + copia[i][1]*copia[i][1]
		dj := copia[j][0]*copia[j][0] + copia[j][1]*copia[j][1]
		return di < dj
	})
	return copia[:k]
}
```
