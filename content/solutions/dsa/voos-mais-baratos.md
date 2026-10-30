## Ideia

Com no máximo `k` escalas podemos usar até `k + 1` voos. Aplicamos Bellman-Ford limitado: `dist[c]` guarda o menor preço conhecido para chegar à cidade `c`, começando com `0` na origem. A cada uma das `k + 1` rodadas, relaxamos todos os voos usando uma cópia das distâncias da rodada anterior.

A cópia é essencial: sem ela, uma mesma rodada poderia encadear vários voos e ultrapassar o limite. Depois da rodada `i`, `dist` representa o melhor preço usando no máximo `i` voos. Se o destino continua infinito no fim, a resposta é `-1`.

## Complexidade

Tempo O((k + 1) * E), com E voos. Espaço O(n).

## Python

```python
def find_cheapest_price(n, flights, src, dst, k):
    inf = float("inf")
    dist = [inf] * n
    dist[src] = 0
    for _ in range(k + 1):
        nova = dist[:]
        for de, para, preco in flights:
            if dist[de] + preco < nova[para]:
                nova[para] = dist[de] + preco
        dist = nova
    return -1 if dist[dst] == inf else dist[dst]
```

## JavaScript

```javascript
function findCheapestPrice(n, flights, src, dst, k) {
  let dist = new Array(n).fill(Infinity);
  dist[src] = 0;
  for (let i = 0; i <= k; i++) {
    const nova = [...dist];
    for (const [de, para, preco] of flights) {
      if (dist[de] + preco < nova[para]) nova[para] = dist[de] + preco;
    }
    dist = nova;
  }
  return dist[dst] === Infinity ? -1 : dist[dst];
}
```

## TypeScript

```typescript
function findCheapestPrice(n: number, flights: number[][], src: number, dst: number, k: number): number {
  let dist: number[] = new Array(n).fill(Infinity);
  dist[src] = 0;
  for (let i = 0; i <= k; i++) {
    const nova = [...dist];
    for (const [de, para, preco] of flights) {
      if (dist[de] + preco < nova[para]) nova[para] = dist[de] + preco;
    }
    dist = nova;
  }
  return dist[dst] === Infinity ? -1 : dist[dst];
}
```

## Java

```java
class Solution {
    public int findCheapestPrice(int n, int[][] flights, int src, int dst, int k) {
        final int INF = Integer.MAX_VALUE / 2;
        int[] dist = new int[n];
        Arrays.fill(dist, INF);
        dist[src] = 0;
        for (int i = 0; i <= k; i++) {
            int[] nova = dist.clone();
            for (int[] voo : flights) {
                if (dist[voo[0]] + voo[2] < nova[voo[1]]) nova[voo[1]] = dist[voo[0]] + voo[2];
            }
            dist = nova;
        }
        return dist[dst] >= INF ? -1 : dist[dst];
    }
}
```

## C++

```cpp
class Solution {
public:
    int findCheapestPrice(int n, vector<vector<int>>& flights, int src, int dst, int k) {
        const int INF = INT_MAX / 2;
        vector<int> dist(n, INF);
        dist[src] = 0;
        for (int i = 0; i <= k; i++) {
            vector<int> nova = dist;
            for (auto& voo : flights) {
                if (dist[voo[0]] + voo[2] < nova[voo[1]]) nova[voo[1]] = dist[voo[0]] + voo[2];
            }
            dist = nova;
        }
        return dist[dst] >= INF ? -1 : dist[dst];
    }
};
```

## C#

```csharp
public class Solution {
    public int FindCheapestPrice(int n, int[][] flights, int src, int dst, int k) {
        const int INF = int.MaxValue / 2;
        int[] dist = new int[n];
        Array.Fill(dist, INF);
        dist[src] = 0;
        for (int i = 0; i <= k; i++) {
            int[] nova = (int[])dist.Clone();
            foreach (var voo in flights) {
                if (dist[voo[0]] + voo[2] < nova[voo[1]]) nova[voo[1]] = dist[voo[0]] + voo[2];
            }
            dist = nova;
        }
        return dist[dst] >= INF ? -1 : dist[dst];
    }
}
```

## Go

```go
func findCheapestPrice(n int, flights [][]int, src int, dst int, k int) int {
	const inf = 1 << 60
	dist := make([]int, n)
	for i := range dist {
		dist[i] = inf
	}
	dist[src] = 0
	for i := 0; i <= k; i++ {
		nova := append([]int(nil), dist...)
		for _, voo := range flights {
			if dist[voo[0]]+voo[2] < nova[voo[1]] {
				nova[voo[1]] = dist[voo[0]] + voo[2]
			}
		}
		dist = nova
	}
	if dist[dst] >= inf {
		return -1
	}
	return dist[dst]
}
```
