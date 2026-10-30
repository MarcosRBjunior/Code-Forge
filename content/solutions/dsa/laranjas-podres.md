## Ideia

A podridão se espalha por camadas, um minuto por vez, a partir de todas as laranjas podres ao mesmo tempo. Isso é uma BFS multi-fonte: coloque todas as podres (valor `2`) na fila e, a cada rodada, apodreça as vizinhas frescas (valor `1`) nas quatro direções, contando um minuto por rodada que realmente contaminou alguma laranja.

Mantenha a contagem de frescas. Ao final, se sobrou alguma, ela era inalcançável e a resposta é `-1`; caso contrário, é o número de minutos. Para não alterar o argumento do chamador, trabalhamos numa cópia da grade.

## Complexidade

Tempo `O(m * n)`, pois cada célula entra na fila no máximo uma vez. Espaço `O(m * n)` para a fila e a cópia.

## Python

```python
from collections import deque


def oranges_rotting(grid):
    linhas, colunas = len(grid), len(grid[0])
    g = [linha[:] for linha in grid]
    fila = deque()
    frescas = 0
    for i in range(linhas):
        for j in range(colunas):
            if g[i][j] == 2:
                fila.append((i, j))
            elif g[i][j] == 1:
                frescas += 1

    minutos = 0
    while fila and frescas:
        for _ in range(len(fila)):
            i, j = fila.popleft()
            for di, dj in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                ni, nj = i + di, j + dj
                if 0 <= ni < linhas and 0 <= nj < colunas and g[ni][nj] == 1:
                    g[ni][nj] = 2
                    frescas -= 1
                    fila.append((ni, nj))
        minutos += 1
    return -1 if frescas else minutos
```

## JavaScript

```javascript
function orangesRotting(grid) {
  const linhas = grid.length;
  const colunas = grid[0].length;
  const g = grid.map((linha) => linha.slice());
  let fila = [];
  let frescas = 0;
  for (let i = 0; i < linhas; i++) {
    for (let j = 0; j < colunas; j++) {
      if (g[i][j] === 2) fila.push([i, j]);
      else if (g[i][j] === 1) frescas++;
    }
  }

  const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  let minutos = 0;
  while (fila.length && frescas) {
    const proxima = [];
    for (const [i, j] of fila) {
      for (const [di, dj] of dirs) {
        const ni = i + di;
        const nj = j + dj;
        if (ni >= 0 && ni < linhas && nj >= 0 && nj < colunas && g[ni][nj] === 1) {
          g[ni][nj] = 2;
          frescas--;
          proxima.push([ni, nj]);
        }
      }
    }
    fila = proxima;
    minutos++;
  }
  return frescas ? -1 : minutos;
}
```

## TypeScript

```typescript
function orangesRotting(grid: number[][]): number {
  const linhas = grid.length;
  const colunas = grid[0].length;
  const g = grid.map((linha) => linha.slice());
  let fila: number[][] = [];
  let frescas = 0;
  for (let i = 0; i < linhas; i++) {
    for (let j = 0; j < colunas; j++) {
      if (g[i][j] === 2) fila.push([i, j]);
      else if (g[i][j] === 1) frescas++;
    }
  }

  const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  let minutos = 0;
  while (fila.length && frescas) {
    const proxima: number[][] = [];
    for (const [i, j] of fila) {
      for (const [di, dj] of dirs) {
        const ni = i + di;
        const nj = j + dj;
        if (ni >= 0 && ni < linhas && nj >= 0 && nj < colunas && g[ni][nj] === 1) {
          g[ni][nj] = 2;
          frescas--;
          proxima.push([ni, nj]);
        }
      }
    }
    fila = proxima;
    minutos++;
  }
  return frescas ? -1 : minutos;
}
```

## Java

```java
class Solution {
    public int orangesRotting(int[][] grid) {
        int linhas = grid.length, colunas = grid[0].length;
        int[][] g = new int[linhas][];
        for (int i = 0; i < linhas; i++) g[i] = grid[i].clone();
        Deque<int[]> fila = new ArrayDeque<>();
        int frescas = 0;
        for (int i = 0; i < linhas; i++) {
            for (int j = 0; j < colunas; j++) {
                if (g[i][j] == 2) fila.add(new int[]{i, j});
                else if (g[i][j] == 1) frescas++;
            }
        }

        int[][] dirs = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};
        int minutos = 0;
        while (!fila.isEmpty() && frescas > 0) {
            for (int t = fila.size(); t > 0; t--) {
                int[] c = fila.poll();
                for (int[] d : dirs) {
                    int ni = c[0] + d[0], nj = c[1] + d[1];
                    if (ni >= 0 && ni < linhas && nj >= 0 && nj < colunas && g[ni][nj] == 1) {
                        g[ni][nj] = 2;
                        frescas--;
                        fila.add(new int[]{ni, nj});
                    }
                }
            }
            minutos++;
        }
        return frescas > 0 ? -1 : minutos;
    }
}
```

## C++

```cpp
class Solution {
public:
    int orangesRotting(vector<vector<int>>& grid) {
        int linhas = grid.size(), colunas = grid[0].size();
        vector<vector<int>> g = grid;
        queue<pair<int, int>> fila;
        int frescas = 0;
        for (int i = 0; i < linhas; i++) {
            for (int j = 0; j < colunas; j++) {
                if (g[i][j] == 2) fila.push({i, j});
                else if (g[i][j] == 1) frescas++;
            }
        }

        int dirs[4][2] = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};
        int minutos = 0;
        while (!fila.empty() && frescas > 0) {
            for (int t = fila.size(); t > 0; t--) {
                auto [i, j] = fila.front();
                fila.pop();
                for (auto& d : dirs) {
                    int ni = i + d[0], nj = j + d[1];
                    if (ni >= 0 && ni < linhas && nj >= 0 && nj < colunas && g[ni][nj] == 1) {
                        g[ni][nj] = 2;
                        frescas--;
                        fila.push({ni, nj});
                    }
                }
            }
            minutos++;
        }
        return frescas > 0 ? -1 : minutos;
    }
};
```

## C#

```csharp
public class Solution {
    public int OrangesRotting(int[][] grid) {
        int linhas = grid.Length, colunas = grid[0].Length;
        int[][] g = grid.Select(l => (int[])l.Clone()).ToArray();
        var fila = new Queue<(int, int)>();
        int frescas = 0;
        for (int i = 0; i < linhas; i++) {
            for (int j = 0; j < colunas; j++) {
                if (g[i][j] == 2) fila.Enqueue((i, j));
                else if (g[i][j] == 1) frescas++;
            }
        }

        int[][] dirs = { new[] {1, 0}, new[] {-1, 0}, new[] {0, 1}, new[] {0, -1} };
        int minutos = 0;
        while (fila.Count > 0 && frescas > 0) {
            for (int t = fila.Count; t > 0; t--) {
                var (i, j) = fila.Dequeue();
                foreach (var d in dirs) {
                    int ni = i + d[0], nj = j + d[1];
                    if (ni >= 0 && ni < linhas && nj >= 0 && nj < colunas && g[ni][nj] == 1) {
                        g[ni][nj] = 2;
                        frescas--;
                        fila.Enqueue((ni, nj));
                    }
                }
            }
            minutos++;
        }
        return frescas > 0 ? -1 : minutos;
    }
}
```

## Go

```go
func orangesRotting(grid [][]int) int {
	linhas, colunas := len(grid), len(grid[0])
	g := make([][]int, linhas)
	fila := [][2]int{}
	frescas := 0
	for i := range grid {
		g[i] = append([]int(nil), grid[i]...)
		for j, v := range g[i] {
			if v == 2 {
				fila = append(fila, [2]int{i, j})
			} else if v == 1 {
				frescas++
			}
		}
	}

	dirs := [][2]int{{1, 0}, {-1, 0}, {0, 1}, {0, -1}}
	minutos := 0
	for len(fila) > 0 && frescas > 0 {
		var proxima [][2]int
		for _, c := range fila {
			for _, d := range dirs {
				ni, nj := c[0]+d[0], c[1]+d[1]
				if ni >= 0 && ni < linhas && nj >= 0 && nj < colunas && g[ni][nj] == 1 {
					g[ni][nj] = 2
					frescas--
					proxima = append(proxima, [2]int{ni, nj})
				}
			}
		}
		fila = proxima
		minutos++
	}
	if frescas > 0 {
		return -1
	}
	return minutos
}
```
