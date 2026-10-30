## Ideia

Comece com `n` componentes, um por nó. Cada aresta que une dois nós de componentes diferentes funde os dois grupos e reduz a contagem em um. Uma estrutura Union-Find (conjuntos disjuntos) responde rapidamente "a que grupo este nó pertence?" e faz a fusão.

Se os dois extremos de uma aresta já têm a mesma raiz, a aresta só fecha um ciclo e a contagem não muda. No fim, o contador guarda exatamente o número de componentes.

## Complexidade

Tempo praticamente O(n + m), com `m` arestas, graças à compressão de caminho. Espaço O(n) para o vetor de pais.

## Python

```python
def count_components(n, edges):
    pai = list(range(n))

    def achar(x):
        while pai[x] != x:
            pai[x] = pai[pai[x]]
            x = pai[x]
        return x

    componentes = n
    for a, b in edges:
        ra, rb = achar(a), achar(b)
        if ra != rb:
            pai[ra] = rb
            componentes -= 1
    return componentes
```

## JavaScript

```javascript
function countComponents(n, edges) {
  const pai = Array.from({ length: n }, (_, i) => i);
  const achar = (x) => {
    while (pai[x] !== x) {
      pai[x] = pai[pai[x]];
      x = pai[x];
    }
    return x;
  };
  let componentes = n;
  for (const [a, b] of edges) {
    const ra = achar(a);
    const rb = achar(b);
    if (ra !== rb) {
      pai[ra] = rb;
      componentes--;
    }
  }
  return componentes;
}
```

## TypeScript

```typescript
function countComponents(n: number, edges: number[][]): number {
  const pai: number[] = Array.from({ length: n }, (_, i) => i);
  const achar = (x: number): number => {
    while (pai[x] !== x) {
      pai[x] = pai[pai[x]];
      x = pai[x];
    }
    return x;
  };
  let componentes = n;
  for (const [a, b] of edges) {
    const ra = achar(a);
    const rb = achar(b);
    if (ra !== rb) {
      pai[ra] = rb;
      componentes--;
    }
  }
  return componentes;
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

    public int countComponents(int n, int[][] edges) {
        pai = new int[n];
        for (int i = 0; i < n; i++) pai[i] = i;
        int componentes = n;
        for (int[] e : edges) {
            int ra = achar(e[0]), rb = achar(e[1]);
            if (ra != rb) {
                pai[ra] = rb;
                componentes--;
            }
        }
        return componentes;
    }
}
```

## C++

```cpp
class Solution {
public:
    int countComponents(int n, vector<vector<int>>& edges) {
        vector<int> pai(n);
        iota(pai.begin(), pai.end(), 0);
        function<int(int)> achar = [&](int x) {
            while (pai[x] != x) {
                pai[x] = pai[pai[x]];
                x = pai[x];
            }
            return x;
        };
        int componentes = n;
        for (auto& e : edges) {
            int ra = achar(e[0]), rb = achar(e[1]);
            if (ra != rb) {
                pai[ra] = rb;
                componentes--;
            }
        }
        return componentes;
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

    public int CountComponents(int n, int[][] edges) {
        pai = new int[n];
        for (int i = 0; i < n; i++) pai[i] = i;
        int componentes = n;
        foreach (var e in edges) {
            int ra = Achar(e[0]), rb = Achar(e[1]);
            if (ra != rb) {
                pai[ra] = rb;
                componentes--;
            }
        }
        return componentes;
    }
}
```

## Go

```go
func countComponents(n int, edges [][]int) int {
	pai := make([]int, n)
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
	componentes := n
	for _, e := range edges {
		ra, rb := achar(e[0]), achar(e[1])
		if ra != rb {
			pai[ra] = rb
			componentes--
		}
	}
	return componentes
}
```
