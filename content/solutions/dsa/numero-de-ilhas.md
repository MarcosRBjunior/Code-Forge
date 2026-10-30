## Ideia

Percorra todas as células do mapa. Ao encontrar uma célula de terra ainda não visitada, você descobriu uma ilha nova: some um ao contador e "afunde" a ilha inteira, marcando como visitadas todas as células de terra ligadas a ela na horizontal e na vertical, para que nunca sejam contadas de novo.

O afundamento é feito com uma busca em largura usando uma fila (evitando recursão profunda em mapas grandes). Marcar a célula como visitada ao enfileirá-la, e não ao retirá-la, impede que ela entre na fila mais de uma vez.

## Complexidade

Tempo O(L * C), pois cada célula é enfileirada no máximo uma vez. Espaço O(L * C) para a matriz de visitadas e a fila.

## Python

```python
from collections import deque


def num_islands(grid):
    if not grid:
        return 0
    linhas, colunas = len(grid), len(grid[0])
    visitado = [[False] * colunas for _ in range(linhas)]
    ilhas = 0
    for i in range(linhas):
        for j in range(colunas):
            if grid[i][j] != "1" or visitado[i][j]:
                continue
            ilhas += 1
            visitado[i][j] = True
            fila = deque([(i, j)])
            while fila:
                x, y = fila.popleft()
                for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
                    if 0 <= nx < linhas and 0 <= ny < colunas \
                            and grid[nx][ny] == "1" and not visitado[nx][ny]:
                        visitado[nx][ny] = True
                        fila.append((nx, ny))
    return ilhas
```

## JavaScript

```javascript
function numIslands(grid) {
  const linhas = grid.length;
  if (linhas === 0) return 0;
  const colunas = grid[0].length;
  const visitado = Array.from({ length: linhas }, () => new Array(colunas).fill(false));
  const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  let ilhas = 0;
  for (let i = 0; i < linhas; i++) {
    for (let j = 0; j < colunas; j++) {
      if (grid[i][j] !== "1" || visitado[i][j]) continue;
      ilhas++;
      visitado[i][j] = true;
      const fila = [[i, j]];
      for (let k = 0; k < fila.length; k++) {
        const [x, y] = fila[k];
        for (const [dx, dy] of dirs) {
          const nx = x + dx, ny = y + dy;
          if (nx >= 0 && nx < linhas && ny >= 0 && ny < colunas &&
              grid[nx][ny] === "1" && !visitado[nx][ny]) {
            visitado[nx][ny] = true;
            fila.push([nx, ny]);
          }
        }
      }
    }
  }
  return ilhas;
}
```

## TypeScript

```typescript
function numIslands(grid: string[][]): number {
  const linhas = grid.length;
  if (linhas === 0) return 0;
  const colunas = grid[0].length;
  const visitado: boolean[][] = Array.from({ length: linhas }, () => new Array<boolean>(colunas).fill(false));
  const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  let ilhas = 0;
  for (let i = 0; i < linhas; i++) {
    for (let j = 0; j < colunas; j++) {
      if (grid[i][j] !== "1" || visitado[i][j]) continue;
      ilhas++;
      visitado[i][j] = true;
      const fila: number[][] = [[i, j]];
      for (let k = 0; k < fila.length; k++) {
        const [x, y] = fila[k];
        for (const [dx, dy] of dirs) {
          const nx = x + dx, ny = y + dy;
          if (nx >= 0 && nx < linhas && ny >= 0 && ny < colunas &&
              grid[nx][ny] === "1" && !visitado[nx][ny]) {
            visitado[nx][ny] = true;
            fila.push([nx, ny]);
          }
        }
      }
    }
  }
  return ilhas;
}
```

## Java

```java
class Solution {
    public int numIslands(String[][] grid) {
        int linhas = grid.length;
        if (linhas == 0) return 0;
        int colunas = grid[0].length;
        boolean[][] visitado = new boolean[linhas][colunas];
        int[] dx = {1, -1, 0, 0}, dy = {0, 0, 1, -1};
        int ilhas = 0;
        for (int i = 0; i < linhas; i++) {
            for (int j = 0; j < colunas; j++) {
                if (!grid[i][j].equals("1") || visitado[i][j]) continue;
                ilhas++;
                visitado[i][j] = true;
                Deque<int[]> fila = new ArrayDeque<>();
                fila.add(new int[]{i, j});
                while (!fila.isEmpty()) {
                    int[] atual = fila.poll();
                    for (int d = 0; d < 4; d++) {
                        int nx = atual[0] + dx[d], ny = atual[1] + dy[d];
                        if (nx >= 0 && nx < linhas && ny >= 0 && ny < colunas
                                && grid[nx][ny].equals("1") && !visitado[nx][ny]) {
                            visitado[nx][ny] = true;
                            fila.add(new int[]{nx, ny});
                        }
                    }
                }
            }
        }
        return ilhas;
    }
}
```

## C++

```cpp
class Solution {
public:
    int numIslands(vector<vector<string>>& grid) {
        int linhas = grid.size();
        if (linhas == 0) return 0;
        int colunas = grid[0].size();
        vector<vector<bool>> visitado(linhas, vector<bool>(colunas, false));
        int dx[] = {1, -1, 0, 0}, dy[] = {0, 0, 1, -1};
        int ilhas = 0;
        for (int i = 0; i < linhas; i++) {
            for (int j = 0; j < colunas; j++) {
                if (grid[i][j] != "1" || visitado[i][j]) continue;
                ilhas++;
                visitado[i][j] = true;
                queue<pair<int, int>> fila;
                fila.push({i, j});
                while (!fila.empty()) {
                    auto [x, y] = fila.front();
                    fila.pop();
                    for (int d = 0; d < 4; d++) {
                        int nx = x + dx[d], ny = y + dy[d];
                        if (nx >= 0 && nx < linhas && ny >= 0 && ny < colunas
                                && grid[nx][ny] == "1" && !visitado[nx][ny]) {
                            visitado[nx][ny] = true;
                            fila.push({nx, ny});
                        }
                    }
                }
            }
        }
        return ilhas;
    }
};
```

## C#

```csharp
public class Solution {
    public int NumIslands(string[][] grid) {
        int linhas = grid.Length;
        if (linhas == 0) return 0;
        int colunas = grid[0].Length;
        var visitado = new bool[linhas, colunas];
        int[] dx = {1, -1, 0, 0}, dy = {0, 0, 1, -1};
        int ilhas = 0;
        for (int i = 0; i < linhas; i++) {
            for (int j = 0; j < colunas; j++) {
                if (grid[i][j] != "1" || visitado[i, j]) continue;
                ilhas++;
                visitado[i, j] = true;
                var fila = new Queue<int[]>();
                fila.Enqueue(new int[]{i, j});
                while (fila.Count > 0) {
                    var atual = fila.Dequeue();
                    for (int d = 0; d < 4; d++) {
                        int nx = atual[0] + dx[d], ny = atual[1] + dy[d];
                        if (nx >= 0 && nx < linhas && ny >= 0 && ny < colunas
                                && grid[nx][ny] == "1" && !visitado[nx, ny]) {
                            visitado[nx, ny] = true;
                            fila.Enqueue(new int[]{nx, ny});
                        }
                    }
                }
            }
        }
        return ilhas;
    }
}
```

## Go

```go
func numIslands(grid [][]string) int {
	linhas := len(grid)
	if linhas == 0 {
		return 0
	}
	colunas := len(grid[0])
	visitado := make([][]bool, linhas)
	for i := range visitado {
		visitado[i] = make([]bool, colunas)
	}
	dx := []int{1, -1, 0, 0}
	dy := []int{0, 0, 1, -1}
	ilhas := 0
	for i := 0; i < linhas; i++ {
		for j := 0; j < colunas; j++ {
			if grid[i][j] != "1" || visitado[i][j] {
				continue
			}
			ilhas++
			visitado[i][j] = true
			fila := [][2]int{{i, j}}
			for k := 0; k < len(fila); k++ {
				x, y := fila[k][0], fila[k][1]
				for d := 0; d < 4; d++ {
					nx, ny := x+dx[d], y+dy[d]
					if nx >= 0 && nx < linhas && ny >= 0 && ny < colunas &&
						grid[nx][ny] == "1" && !visitado[nx][ny] {
						visitado[nx][ny] = true
						fila = append(fila, [2]int{nx, ny})
					}
				}
			}
		}
	}
	return ilhas
}
```
