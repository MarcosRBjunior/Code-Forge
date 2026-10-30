## Ideia

Percorra todas as células. Ao encontrar terra ainda não visitada, você achou uma ilha nova: explore-a inteira, contando as células, e compare a contagem com a maior já vista.

A exploração usa uma pilha explícita em vez de recursão, porque uma ilha pode ter até 2500 células em fila e a recursão ficaria profunda. Cada célula de terra é marcada como visitada (virando `0` na própria matriz) ao entrar na pilha, assim nunca é contada duas vezes. Só os quatro vizinhos ortogonais são considerados.

## Complexidade

Tempo `O(L * C)`, cada célula é processada uma vez. Espaço `O(L * C)` no pior caso, pela pilha.

## Python

```python
def max_area_of_island(grid):
    linhas, colunas = len(grid), len(grid[0])
    melhor = 0
    for i in range(linhas):
        for j in range(colunas):
            if grid[i][j] != 1:
                continue
            grid[i][j] = 0
            pilha = [(i, j)]
            area = 0
            while pilha:
                x, y = pilha.pop()
                area += 1
                for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    nx, ny = x + dx, y + dy
                    if 0 <= nx < linhas and 0 <= ny < colunas and grid[nx][ny] == 1:
                        grid[nx][ny] = 0
                        pilha.append((nx, ny))
            melhor = max(melhor, area)
    return melhor
```

## JavaScript

```javascript
function maxAreaOfIsland(grid) {
  const linhas = grid.length;
  const colunas = grid[0].length;
  const direcoes = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  let melhor = 0;
  for (let i = 0; i < linhas; i++) {
    for (let j = 0; j < colunas; j++) {
      if (grid[i][j] !== 1) continue;
      grid[i][j] = 0;
      const pilha = [[i, j]];
      let area = 0;
      while (pilha.length > 0) {
        const [x, y] = pilha.pop();
        area++;
        for (const [dx, dy] of direcoes) {
          const nx = x + dx;
          const ny = y + dy;
          if (nx >= 0 && nx < linhas && ny >= 0 && ny < colunas && grid[nx][ny] === 1) {
            grid[nx][ny] = 0;
            pilha.push([nx, ny]);
          }
        }
      }
      melhor = Math.max(melhor, area);
    }
  }
  return melhor;
}
```

## TypeScript

```typescript
function maxAreaOfIsland(grid: number[][]): number {
  const linhas = grid.length;
  const colunas = grid[0].length;
  const direcoes: number[][] = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  let melhor = 0;
  for (let i = 0; i < linhas; i++) {
    for (let j = 0; j < colunas; j++) {
      if (grid[i][j] !== 1) continue;
      grid[i][j] = 0;
      const pilha: number[][] = [[i, j]];
      let area = 0;
      while (pilha.length > 0) {
        const [x, y] = pilha.pop()!;
        area++;
        for (const [dx, dy] of direcoes) {
          const nx = x + dx;
          const ny = y + dy;
          if (nx >= 0 && nx < linhas && ny >= 0 && ny < colunas && grid[nx][ny] === 1) {
            grid[nx][ny] = 0;
            pilha.push([nx, ny]);
          }
        }
      }
      melhor = Math.max(melhor, area);
    }
  }
  return melhor;
}
```

## Java

```java
class Solution {
    public int maxAreaOfIsland(int[][] grid) {
        int linhas = grid.length, colunas = grid[0].length;
        int[][] direcoes = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};
        int melhor = 0;
        for (int i = 0; i < linhas; i++) {
            for (int j = 0; j < colunas; j++) {
                if (grid[i][j] != 1) continue;
                grid[i][j] = 0;
                Deque<int[]> pilha = new ArrayDeque<>();
                pilha.push(new int[]{i, j});
                int area = 0;
                while (!pilha.isEmpty()) {
                    int[] atual = pilha.pop();
                    area++;
                    for (int[] d : direcoes) {
                        int nx = atual[0] + d[0], ny = atual[1] + d[1];
                        if (nx >= 0 && nx < linhas && ny >= 0 && ny < colunas && grid[nx][ny] == 1) {
                            grid[nx][ny] = 0;
                            pilha.push(new int[]{nx, ny});
                        }
                    }
                }
                melhor = Math.max(melhor, area);
            }
        }
        return melhor;
    }
}
```

## C++

```cpp
class Solution {
public:
    int maxAreaOfIsland(vector<vector<int>>& grid) {
        int linhas = grid.size(), colunas = grid[0].size();
        int dx[] = {1, -1, 0, 0};
        int dy[] = {0, 0, 1, -1};
        int melhor = 0;
        for (int i = 0; i < linhas; i++) {
            for (int j = 0; j < colunas; j++) {
                if (grid[i][j] != 1) continue;
                grid[i][j] = 0;
                vector<pair<int, int>> pilha = {{i, j}};
                int area = 0;
                while (!pilha.empty()) {
                    auto [x, y] = pilha.back();
                    pilha.pop_back();
                    area++;
                    for (int k = 0; k < 4; k++) {
                        int nx = x + dx[k], ny = y + dy[k];
                        if (nx >= 0 && nx < linhas && ny >= 0 && ny < colunas && grid[nx][ny] == 1) {
                            grid[nx][ny] = 0;
                            pilha.push_back({nx, ny});
                        }
                    }
                }
                melhor = max(melhor, area);
            }
        }
        return melhor;
    }
};
```

## C#

```csharp
public class Solution {
    public int MaxAreaOfIsland(int[][] grid) {
        int linhas = grid.Length, colunas = grid[0].Length;
        int[] dx = {1, -1, 0, 0};
        int[] dy = {0, 0, 1, -1};
        int melhor = 0;
        for (int i = 0; i < linhas; i++) {
            for (int j = 0; j < colunas; j++) {
                if (grid[i][j] != 1) continue;
                grid[i][j] = 0;
                var pilha = new Stack<(int, int)>();
                pilha.Push((i, j));
                int area = 0;
                while (pilha.Count > 0) {
                    var (x, y) = pilha.Pop();
                    area++;
                    for (int k = 0; k < 4; k++) {
                        int nx = x + dx[k], ny = y + dy[k];
                        if (nx >= 0 && nx < linhas && ny >= 0 && ny < colunas && grid[nx][ny] == 1) {
                            grid[nx][ny] = 0;
                            pilha.Push((nx, ny));
                        }
                    }
                }
                melhor = Math.Max(melhor, area);
            }
        }
        return melhor;
    }
}
```

## Go

```go
func maxAreaOfIsland(grid [][]int) int {
	linhas, colunas := len(grid), len(grid[0])
	dx := []int{1, -1, 0, 0}
	dy := []int{0, 0, 1, -1}
	melhor := 0
	for i := 0; i < linhas; i++ {
		for j := 0; j < colunas; j++ {
			if grid[i][j] != 1 {
				continue
			}
			grid[i][j] = 0
			pilha := [][2]int{{i, j}}
			area := 0
			for len(pilha) > 0 {
				atual := pilha[len(pilha)-1]
				pilha = pilha[:len(pilha)-1]
				area++
				for k := 0; k < 4; k++ {
					nx, ny := atual[0]+dx[k], atual[1]+dy[k]
					if nx >= 0 && nx < linhas && ny >= 0 && ny < colunas && grid[nx][ny] == 1 {
						grid[nx][ny] = 0
						pilha = append(pilha, [2]int{nx, ny})
					}
				}
			}
			if area > melhor {
				melhor = area
			}
		}
	}
	return melhor
}
```
