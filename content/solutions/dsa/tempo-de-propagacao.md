## Ideia

O sinal chega a cada nó pelo caminho mais curto a partir de `k`, então o tempo em que todos o recebem é a maior entre as menores distâncias. Como os pesos não são negativos, o algoritmo de Dijkstra calcula essas distâncias: usamos uma fila de prioridade com pares (distância, nó) e, ao retirar o nó de menor distância, relaxamos as arestas que saem dele.

No fim, se algum nó continuou com distância infinita, ele nunca recebeu o sinal e a resposta é `-1`. Caso contrário, a resposta é a maior distância.

## Complexidade

Tempo O(E log E), com E ligações, pelas operações na fila de prioridade. Espaço O(n + E).

## Python

```python
import heapq


def network_delay_time(times, n, k):
    grafo = [[] for _ in range(n + 1)]
    for u, v, w in times:
        grafo[u].append((v, w))
    dist = [float("inf")] * (n + 1)
    dist[k] = 0
    fila = [(0, k)]
    while fila:
        d, u = heapq.heappop(fila)
        if d > dist[u]:
            continue
        for v, w in grafo[u]:
            if d + w < dist[v]:
                dist[v] = d + w
                heapq.heappush(fila, (dist[v], v))
    maior = max(dist[1:])
    return -1 if maior == float("inf") else maior
```

## JavaScript

```javascript
function networkDelayTime(times, n, k) {
  const grafo = Array.from({ length: n + 1 }, () => []);
  for (const [u, v, w] of times) grafo[u].push([v, w]);
  const dist = new Array(n + 1).fill(Infinity);
  dist[k] = 0;
  const visitado = new Array(n + 1).fill(false);
  // n <= 100: escolher o menor nó pendente por varredura é simples e suficiente.
  for (let rodada = 0; rodada < n; rodada++) {
    let u = -1;
    for (let i = 1; i <= n; i++) {
      if (!visitado[i] && (u === -1 || dist[i] < dist[u])) u = i;
    }
    if (u === -1 || dist[u] === Infinity) break;
    visitado[u] = true;
    for (const [v, w] of grafo[u]) {
      if (dist[u] + w < dist[v]) dist[v] = dist[u] + w;
    }
  }
  const maior = Math.max(...dist.slice(1));
  return maior === Infinity ? -1 : maior;
}
```

## TypeScript

```typescript
function networkDelayTime(times: number[][], n: number, k: number): number {
  const grafo: [number, number][][] = Array.from({ length: n + 1 }, () => []);
  for (const [u, v, w] of times) grafo[u].push([v, w]);
  const dist: number[] = new Array(n + 1).fill(Infinity);
  dist[k] = 0;
  const visitado: boolean[] = new Array(n + 1).fill(false);
  // n <= 100: escolher o menor nó pendente por varredura é simples e suficiente.
  for (let rodada = 0; rodada < n; rodada++) {
    let u = -1;
    for (let i = 1; i <= n; i++) {
      if (!visitado[i] && (u === -1 || dist[i] < dist[u])) u = i;
    }
    if (u === -1 || dist[u] === Infinity) break;
    visitado[u] = true;
    for (const [v, w] of grafo[u]) {
      if (dist[u] + w < dist[v]) dist[v] = dist[u] + w;
    }
  }
  const maior = Math.max(...dist.slice(1));
  return maior === Infinity ? -1 : maior;
}
```

## Java

```java
class Solution {
    public int networkDelayTime(int[][] times, int n, int k) {
        List<List<int[]>> grafo = new ArrayList<>();
        for (int i = 0; i <= n; i++) grafo.add(new ArrayList<>());
        for (int[] t : times) grafo.get(t[0]).add(new int[]{t[1], t[2]});
        int[] dist = new int[n + 1];
        Arrays.fill(dist, Integer.MAX_VALUE);
        dist[k] = 0;
        PriorityQueue<int[]> fila = new PriorityQueue<>((a, b) -> Integer.compare(a[0], b[0]));
        fila.add(new int[]{0, k});
        while (!fila.isEmpty()) {
            int[] atual = fila.poll();
            int d = atual[0], u = atual[1];
            if (d > dist[u]) continue;
            for (int[] aresta : grafo.get(u)) {
                int v = aresta[0], w = aresta[1];
                if (d + w < dist[v]) {
                    dist[v] = d + w;
                    fila.add(new int[]{dist[v], v});
                }
            }
        }
        int maior = 0;
        for (int i = 1; i <= n; i++) {
            if (dist[i] == Integer.MAX_VALUE) return -1;
            maior = Math.max(maior, dist[i]);
        }
        return maior;
    }
}
```

## C++

```cpp
class Solution {
public:
    int networkDelayTime(vector<vector<int>>& times, int n, int k) {
        vector<vector<pair<int, int>>> grafo(n + 1);
        for (auto& t : times) grafo[t[0]].push_back({t[1], t[2]});
        vector<int> dist(n + 1, INT_MAX);
        dist[k] = 0;
        priority_queue<pair<int, int>, vector<pair<int, int>>, greater<>> fila;
        fila.push({0, k});
        while (!fila.empty()) {
            auto [d, u] = fila.top();
            fila.pop();
            if (d > dist[u]) continue;
            for (auto [v, w] : grafo[u]) {
                if (d + w < dist[v]) {
                    dist[v] = d + w;
                    fila.push({dist[v], v});
                }
            }
        }
        int maior = 0;
        for (int i = 1; i <= n; i++) {
            if (dist[i] == INT_MAX) return -1;
            maior = max(maior, dist[i]);
        }
        return maior;
    }
};
```

## C#

```csharp
public class Solution {
    public int NetworkDelayTime(int[][] times, int n, int k) {
        var dist = new int[n + 1];
        Array.Fill(dist, int.MaxValue);
        dist[k] = 0;
        var visitado = new bool[n + 1];
        // n <= 100: escolher o menor nó pendente por varredura é simples e suficiente.
        for (int rodada = 0; rodada < n; rodada++) {
            int u = -1;
            for (int i = 1; i <= n; i++) {
                if (!visitado[i] && (u == -1 || dist[i] < dist[u])) u = i;
            }
            if (u == -1 || dist[u] == int.MaxValue) break;
            visitado[u] = true;
            foreach (var t in times) {
                if (t[0] == u && dist[u] + t[2] < dist[t[1]]) dist[t[1]] = dist[u] + t[2];
            }
        }
        int maior = 0;
        for (int i = 1; i <= n; i++) {
            if (dist[i] == int.MaxValue) return -1;
            maior = Math.Max(maior, dist[i]);
        }
        return maior;
    }
}
```

## Go

```go
import "container/heap"

type itemFila struct{ dist, no int }
type filaPrioridade []itemFila

func (f filaPrioridade) Len() int            { return len(f) }
func (f filaPrioridade) Less(i, j int) bool  { return f[i].dist < f[j].dist }
func (f filaPrioridade) Swap(i, j int)       { f[i], f[j] = f[j], f[i] }
func (f *filaPrioridade) Push(x interface{}) { *f = append(*f, x.(itemFila)) }
func (f *filaPrioridade) Pop() interface{} {
	antigo := *f
	ultimo := antigo[len(antigo)-1]
	*f = antigo[:len(antigo)-1]
	return ultimo
}

func networkDelayTime(times [][]int, n int, k int) int {
	grafo := make([][][2]int, n+1)
	for _, t := range times {
		grafo[t[0]] = append(grafo[t[0]], [2]int{t[1], t[2]})
	}
	const inf = 1 << 60
	dist := make([]int, n+1)
	for i := range dist {
		dist[i] = inf
	}
	dist[k] = 0
	fila := &filaPrioridade{{0, k}}
	for fila.Len() > 0 {
		atual := heap.Pop(fila).(itemFila)
		if atual.dist > dist[atual.no] {
			continue
		}
		for _, aresta := range grafo[atual.no] {
			v, w := aresta[0], aresta[1]
			if atual.dist+w < dist[v] {
				dist[v] = atual.dist + w
				heap.Push(fila, itemFila{dist[v], v})
			}
		}
	}
	maior := 0
	for i := 1; i <= n; i++ {
		if dist[i] == inf {
			return -1
		}
		if dist[i] > maior {
			maior = dist[i]
		}
	}
	return maior
}
```
