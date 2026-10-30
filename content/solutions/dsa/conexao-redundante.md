## Ideia

Como o grafo começou como uma árvore e ganhou uma única aresta extra, basta processar as arestas na ordem dada mantendo grupos de nós conectados com Union-Find. Enquanto as arestas ligam grupos diferentes, elas só constroem a árvore.

A primeira aresta cujos dois extremos já pertencem ao mesmo grupo fecha o ciclo, e é a resposta. Como as arestas anteriores a ela não formavam ciclo, essa é também a que aparece por último entre as arestas do ciclo.

## Complexidade

Tempo praticamente O(n), com compressão de caminho. Espaço O(n).

## Python

```python
def find_redundant_connection(edges):
    pai = list(range(len(edges) + 1))

    def achar(x):
        while pai[x] != x:
            pai[x] = pai[pai[x]]
            x = pai[x]
        return x

    for a, b in edges:
        ra, rb = achar(a), achar(b)
        if ra == rb:
            return [a, b]
        pai[ra] = rb
    return []
```

## JavaScript

```javascript
function findRedundantConnection(edges) {
  const pai = Array.from({ length: edges.length + 1 }, (_, i) => i);
  const achar = (x) => {
    while (pai[x] !== x) {
      pai[x] = pai[pai[x]];
      x = pai[x];
    }
    return x;
  };
  for (const [a, b] of edges) {
    const ra = achar(a);
    const rb = achar(b);
    if (ra === rb) return [a, b];
    pai[ra] = rb;
  }
  return [];
}
```

## TypeScript

```typescript
function findRedundantConnection(edges: number[][]): number[] {
  const pai: number[] = Array.from({ length: edges.length + 1 }, (_, i) => i);
  const achar = (x: number): number => {
    while (pai[x] !== x) {
      pai[x] = pai[pai[x]];
      x = pai[x];
    }
    return x;
  };
  for (const [a, b] of edges) {
    const ra = achar(a);
    const rb = achar(b);
    if (ra === rb) return [a, b];
    pai[ra] = rb;
  }
  return [];
}
```

## Java

```java
class Solution {
    private int[] pai;

    private int achar(int x) {
        while (pai[x] != x) {
            pai[x] = pai[pai[x]];
            x = pai[x];
        }
        return x;
    }

    public int[] findRedundantConnection(int[][] edges) {
        pai = new int[edges.length + 1];
        for (int i = 0; i < pai.length; i++) pai[i] = i;
        for (int[] e : edges) {
            int ra = achar(e[0]), rb = achar(e[1]);
            if (ra == rb) return new int[]{e[0], e[1]};
            pai[ra] = rb;
        }
        return new int[0];
    }
}
```

## C++

```cpp
class Solution {
public:
    vector<int> findRedundantConnection(vector<vector<int>>& edges) {
        vector<int> pai(edges.size() + 1);
        iota(pai.begin(), pai.end(), 0);
        function<int(int)> achar = [&](int x) {
            while (pai[x] != x) {
                pai[x] = pai[pai[x]];
                x = pai[x];
            }
            return x;
        };
        for (auto& e : edges) {
            int ra = achar(e[0]), rb = achar(e[1]);
            if (ra == rb) return {e[0], e[1]};
            pai[ra] = rb;
        }
        return {};
    }
};
```

## C#

```csharp
public class Solution {
    private int[] pai;

    private int Achar(int x) {
        while (pai[x] != x) {
            pai[x] = pai[pai[x]];
            x = pai[x];
        }
        return x;
    }

    public int[] FindRedundantConnection(int[][] edges) {
        pai = new int[edges.Length + 1];
        for (int i = 0; i < pai.Length; i++) pai[i] = i;
        foreach (var e in edges) {
            int ra = Achar(e[0]), rb = Achar(e[1]);
            if (ra == rb) return new int[]{e[0], e[1]};
            pai[ra] = rb;
        }
        return new int[0];
    }
}
```

## Go

```go
func findRedundantConnection(edges [][]int) []int {
	pai := make([]int, len(edges)+1)
	for i := range pai {
		pai[i] = i
	}
	achar := func(x int) int {
		for pai[x] != x {
			pai[x] = pai[pai[x]]
			x = pai[x]
		}
		return x
	}
	for _, e := range edges {
		ra, rb := achar(e[0]), achar(e[1])
		if ra == rb {
			return []int{e[0], e[1]}
		}
		pai[ra] = rb
	}
	return nil
}
```
