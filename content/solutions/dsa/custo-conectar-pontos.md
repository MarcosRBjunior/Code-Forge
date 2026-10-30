## Ideia

Conectar todos os pontos pelo menor custo total, com custo igual à distância de Manhattan, é encontrar uma árvore geradora mínima num grafo completo. Como todo par de pontos tem aresta, o algoritmo de Prim em versão densa, sem heap, é suficiente.

Mantenha, para cada ponto fora da árvore, a menor distância até algum ponto já dentro dela. A cada passo, escolha o ponto fora da árvore com a menor dessas distâncias, some-a ao custo e atualize as distâncias dos demais usando o ponto recém-incluído.

## Complexidade

Tempo O(n²), pois cada um dos `n` passos varre os `n` pontos. Espaço O(n).

## Python

```python
def min_cost_connect_points(points):
    n = len(points)
    INF = float("inf")
    dist = [INF] * n
    dentro = [False] * n
    dist[0] = 0
    total = 0
    for _ in range(n):
        u = -1
        for i in range(n):
            if not dentro[i] and (u == -1 or dist[i] < dist[u]):
                u = i
        dentro[u] = True
        total += dist[u]
        for v in range(n):
            if not dentro[v]:
                d = abs(points[u][0] - points[v][0]) + abs(points[u][1] - points[v][1])
                if d < dist[v]:
                    dist[v] = d
    return total
```

## JavaScript

```javascript
function minCostConnectPoints(points) {
  const n = points.length;
  const dist = new Array(n).fill(Infinity);
  const dentro = new Array(n).fill(false);
  dist[0] = 0;
  let total = 0;
  for (let k = 0; k < n; k++) {
    let u = -1;
    for (let i = 0; i < n; i++) {
      if (!dentro[i] && (u === -1 || dist[i] < dist[u])) u = i;
    }
    dentro[u] = true;
    total += dist[u];
    for (let v = 0; v < n; v++) {
      if (!dentro[v]) {
        const d = Math.abs(points[u][0] - points[v][0]) + Math.abs(points[u][1] - points[v][1]);
        if (d < dist[v]) dist[v] = d;
      }
    }
  }
  return total;
}
```

## TypeScript

```typescript
function minCostConnectPoints(points: number[][]): number {
  const n = points.length;
  const dist: number[] = new Array(n).fill(Infinity);
  const dentro: boolean[] = new Array(n).fill(false);
  dist[0] = 0;
  let total = 0;
  for (let k = 0; k < n; k++) {
    let u = -1;
    for (let i = 0; i < n; i++) {
      if (!dentro[i] && (u === -1 || dist[i] < dist[u])) u = i;
    }
    dentro[u] = true;
    total += dist[u];
    for (let v = 0; v < n; v++) {
      if (!dentro[v]) {
        const d = Math.abs(points[u][0] - points[v][0]) + Math.abs(points[u][1] - points[v][1]);
        if (d < dist[v]) dist[v] = d;
      }
    }
  }
  return total;
}
```

## Java

```java
class Solution {
    public int minCostConnectPoints(int[][] points) {
        int n = points.length;
        int[] dist = new int[n];
        Arrays.fill(dist, Integer.MAX_VALUE);
        boolean[] dentro = new boolean[n];
        dist[0] = 0;
        int total = 0;
        for (int k = 0; k < n; k++) {
            int u = -1;
            for (int i = 0; i < n; i++) {
                if (!dentro[i] && (u == -1 || dist[i] < dist[u])) u = i;
            }
            dentro[u] = true;
            total += dist[u];
            for (int v = 0; v < n; v++) {
                if (!dentro[v]) {
                    int d = Math.abs(points[u][0] - points[v][0]) + Math.abs(points[u][1] - points[v][1]);
                    if (d < dist[v]) dist[v] = d;
                }
            }
        }
        return total;
    }
}
```

## C++

```cpp
class Solution {
public:
    int minCostConnectPoints(vector<vector<int>>& points) {
        int n = points.size();
        vector<int> dist(n, INT_MAX);
        vector<bool> dentro(n, false);
        dist[0] = 0;
        int total = 0;
        for (int k = 0; k < n; k++) {
            int u = -1;
            for (int i = 0; i < n; i++) {
                if (!dentro[i] && (u == -1 || dist[i] < dist[u])) u = i;
            }
            dentro[u] = true;
            total += dist[u];
            for (int v = 0; v < n; v++) {
                if (!dentro[v]) {
                    int d = abs(points[u][0] - points[v][0]) + abs(points[u][1] - points[v][1]);
                    if (d < dist[v]) dist[v] = d;
                }
            }
        }
        return total;
    }
};
```

## C#

```csharp
public class Solution {
    public int MinCostConnectPoints(int[][] points) {
        int n = points.Length;
        var dist = new int[n];
        Array.Fill(dist, int.MaxValue);
        var dentro = new bool[n];
        dist[0] = 0;
        int total = 0;
        for (int k = 0; k < n; k++) {
            int u = -1;
            for (int i = 0; i < n; i++) {
                if (!dentro[i] && (u == -1 || dist[i] < dist[u])) u = i;
            }
            dentro[u] = true;
            total += dist[u];
            for (int v = 0; v < n; v++) {
                if (!dentro[v]) {
                    int d = Math.Abs(points[u][0] - points[v][0]) + Math.Abs(points[u][1] - points[v][1]);
                    if (d < dist[v]) dist[v] = d;
                }
            }
        }
        return total;
    }
}
```

## Go

```go
import "math"

func minCostConnectPoints(points [][]int) int {
	n := len(points)
	dist := make([]int, n)
	for i := range dist {
		dist[i] = math.MaxInt32
	}
	dentro := make([]bool, n)
	dist[0] = 0
	total := 0
	abs := func(x int) int {
		if x < 0 {
			return -x
		}
		return x
	}
	for k := 0; k < n; k++ {
		u := -1
		for i := 0; i < n; i++ {
			if !dentro[i] && (u == -1 || dist[i] < dist[u]) {
				u = i
			}
		}
		dentro[u] = true
		total += dist[u]
		for v := 0; v < n; v++ {
			if !dentro[v] {
				d := abs(points[u][0]-points[v][0]) + abs(points[u][1]-points[v][1])
				if d < dist[v] {
					dist[v] = d
				}
			}
		}
	}
	return total
}
```
