## Ideia

Simular a água descendo a partir de cada célula repete muito trabalho. Inverta o problema: parta das bordas de cada oceano e suba, visitando vizinhas com altura maior ou igual à da célula atual. Tudo que for alcançado a partir das bordas do Pacífico drena para o Pacífico; o mesmo vale para o Atlântico.

A resposta é a interseção dos dois conjuntos de células alcançadas. Como cada busca visita cada célula no máximo uma vez, o custo total é linear no tamanho da matriz.

## Complexidade

Tempo O(L·C), pois cada oceano percorre cada célula uma vez. Espaço O(L·C) para as marcações e a pilha da busca.

## Python

```python
def pacific_atlantic(heights):
    linhas, colunas = len(heights), len(heights[0])

    def alcanca(inicios):
        visto = set(inicios)
        pilha = list(inicios)
        while pilha:
            r, c = pilha.pop()
            for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                nr, nc = r + dr, c + dc
                if (0 <= nr < linhas and 0 <= nc < colunas
                        and (nr, nc) not in visto
                        and heights[nr][nc] >= heights[r][c]):
                    visto.add((nr, nc))
                    pilha.append((nr, nc))
        return visto

    pacifico = [(0, c) for c in range(colunas)] + [(r, 0) for r in range(linhas)]
    atlantico = [(linhas - 1, c) for c in range(colunas)] + [(r, colunas - 1) for r in range(linhas)]
    ambos = alcanca(pacifico) & alcanca(atlantico)
    return [[r, c] for r, c in sorted(ambos)]
```

## JavaScript

```javascript
function pacificAtlantic(heights) {
  const linhas = heights.length, colunas = heights[0].length;
  const alcanca = (inicios) => {
    const visto = Array.from({ length: linhas }, () => new Array(colunas).fill(false));
    const pilha = [];
    for (const [r, c] of inicios) {
      if (!visto[r][c]) { visto[r][c] = true; pilha.push([r, c]); }
    }
    while (pilha.length) {
      const [r, c] = pilha.pop();
      for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nr = r + dr, nc = c + dc;
        if (nr >= 0 && nr < linhas && nc >= 0 && nc < colunas &&
            !visto[nr][nc] && heights[nr][nc] >= heights[r][c]) {
          visto[nr][nc] = true;
          pilha.push([nr, nc]);
        }
      }
    }
    return visto;
  };
  const pacifico = [], atlantico = [];
  for (let c = 0; c < colunas; c++) { pacifico.push([0, c]); atlantico.push([linhas - 1, c]); }
  for (let r = 0; r < linhas; r++) { pacifico.push([r, 0]); atlantico.push([r, colunas - 1]); }
  const a = alcanca(pacifico), b = alcanca(atlantico);
  const resposta = [];
  for (let r = 0; r < linhas; r++)
    for (let c = 0; c < colunas; c++)
      if (a[r][c] && b[r][c]) resposta.push([r, c]);
  return resposta;
}
```

## TypeScript

```typescript
function pacificAtlantic(heights: number[][]): number[][] {
  const linhas = heights.length, colunas = heights[0].length;
  const alcanca = (inicios: number[][]): boolean[][] => {
    const visto: boolean[][] = Array.from({ length: linhas }, () => new Array(colunas).fill(false));
    const pilha: number[][] = [];
    for (const [r, c] of inicios) {
      if (!visto[r][c]) { visto[r][c] = true; pilha.push([r, c]); }
    }
    while (pilha.length) {
      const [r, c] = pilha.pop()!;
      for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nr = r + dr, nc = c + dc;
        if (nr >= 0 && nr < linhas && nc >= 0 && nc < colunas &&
            !visto[nr][nc] && heights[nr][nc] >= heights[r][c]) {
          visto[nr][nc] = true;
          pilha.push([nr, nc]);
        }
      }
    }
    return visto;
  };
  const pacifico: number[][] = [], atlantico: number[][] = [];
  for (let c = 0; c < colunas; c++) { pacifico.push([0, c]); atlantico.push([linhas - 1, c]); }
  for (let r = 0; r < linhas; r++) { pacifico.push([r, 0]); atlantico.push([r, colunas - 1]); }
  const a = alcanca(pacifico), b = alcanca(atlantico);
  const resposta: number[][] = [];
  for (let r = 0; r < linhas; r++)
    for (let c = 0; c < colunas; c++)
      if (a[r][c] && b[r][c]) resposta.push([r, c]);
  return resposta;
}
```

## Java

```java
class Solution {
    private int[][] h;
    private int linhas, colunas;

    private void dfs(int r, int c, boolean[][] visto) {
        visto[r][c] = true;
        int[][] dirs = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};
        for (int[] d : dirs) {
            int nr = r + d[0], nc = c + d[1];
            if (nr >= 0 && nr < linhas && nc >= 0 && nc < colunas
                    && !visto[nr][nc] && h[nr][nc] >= h[r][c]) {
                dfs(nr, nc, visto);
            }
        }
    }

    public int[][] pacificAtlantic(int[][] heights) {
        h = heights;
        linhas = heights.length;
        colunas = heights[0].length;
        boolean[][] pac = new boolean[linhas][colunas];
        boolean[][] atl = new boolean[linhas][colunas];
        for (int c = 0; c < colunas; c++) {
            if (!pac[0][c]) dfs(0, c, pac);
            if (!atl[linhas - 1][c]) dfs(linhas - 1, c, atl);
        }
        for (int r = 0; r < linhas; r++) {
            if (!pac[r][0]) dfs(r, 0, pac);
            if (!atl[r][colunas - 1]) dfs(r, colunas - 1, atl);
        }
        List<int[]> resposta = new ArrayList<>();
        for (int r = 0; r < linhas; r++)
            for (int c = 0; c < colunas; c++)
                if (pac[r][c] && atl[r][c]) resposta.add(new int[]{r, c});
        return resposta.toArray(new int[0][]);
    }
}
```

## C++

```cpp
class Solution {
    vector<vector<int>>* h;
    int linhas, colunas;

    void dfs(int r, int c, vector<vector<bool>>& visto) {
        visto[r][c] = true;
        int dr[] = {1, -1, 0, 0}, dc[] = {0, 0, 1, -1};
        for (int k = 0; k < 4; k++) {
            int nr = r + dr[k], nc = c + dc[k];
            if (nr >= 0 && nr < linhas && nc >= 0 && nc < colunas
                && !visto[nr][nc] && (*h)[nr][nc] >= (*h)[r][c]) {
                dfs(nr, nc, visto);
            }
        }
    }

public:
    vector<vector<int>> pacificAtlantic(vector<vector<int>>& heights) {
        h = &heights;
        linhas = heights.size();
        colunas = heights[0].size();
        vector<vector<bool>> pac(linhas, vector<bool>(colunas, false));
        vector<vector<bool>> atl(linhas, vector<bool>(colunas, false));
        for (int c = 0; c < colunas; c++) {
            if (!pac[0][c]) dfs(0, c, pac);
            if (!atl[linhas - 1][c]) dfs(linhas - 1, c, atl);
        }
        for (int r = 0; r < linhas; r++) {
            if (!pac[r][0]) dfs(r, 0, pac);
            if (!atl[r][colunas - 1]) dfs(r, colunas - 1, atl);
        }
        vector<vector<int>> resposta;
        for (int r = 0; r < linhas; r++)
            for (int c = 0; c < colunas; c++)
                if (pac[r][c] && atl[r][c]) resposta.push_back({r, c});
        return resposta;
    }
};
```

## C#

```csharp
public class Solution {
    private int[][] h;
    private int linhas, colunas;

    private void Dfs(int r, int c, bool[,] visto) {
        visto[r, c] = true;
        int[] dr = {1, -1, 0, 0};
        int[] dc = {0, 0, 1, -1};
        for (int k = 0; k < 4; k++) {
            int nr = r + dr[k], nc = c + dc[k];
            if (nr >= 0 && nr < linhas && nc >= 0 && nc < colunas
                && !visto[nr, nc] && h[nr][nc] >= h[r][c]) {
                Dfs(nr, nc, visto);
            }
        }
    }

    public int[][] PacificAtlantic(int[][] heights) {
        h = heights;
        linhas = heights.Length;
        colunas = heights[0].Length;
        var pac = new bool[linhas, colunas];
        var atl = new bool[linhas, colunas];
        for (int c = 0; c < colunas; c++) {
            if (!pac[0, c]) Dfs(0, c, pac);
            if (!atl[linhas - 1, c]) Dfs(linhas - 1, c, atl);
        }
        for (int r = 0; r < linhas; r++) {
            if (!pac[r, 0]) Dfs(r, 0, pac);
            if (!atl[r, colunas - 1]) Dfs(r, colunas - 1, atl);
        }
        var resposta = new List<int[]>();
        for (int r = 0; r < linhas; r++)
            for (int c = 0; c < colunas; c++)
                if (pac[r, c] && atl[r, c]) resposta.Add(new int[]{r, c});
        return resposta.ToArray();
    }
}
```

## Go

```go
func pacificAtlantic(heights [][]int) [][]int {
	linhas, colunas := len(heights), len(heights[0])
	var dfs func(r, c int, visto [][]bool)
	dfs = func(r, c int, visto [][]bool) {
		visto[r][c] = true
		dr := []int{1, -1, 0, 0}
		dc := []int{0, 0, 1, -1}
		for k := 0; k < 4; k++ {
			nr, nc := r+dr[k], c+dc[k]
			if nr >= 0 && nr < linhas && nc >= 0 && nc < colunas &&
				!visto[nr][nc] && heights[nr][nc] >= heights[r][c] {
				dfs(nr, nc, visto)
			}
		}
	}
	nova := func() [][]bool {
		m := make([][]bool, linhas)
		for i := range m {
			m[i] = make([]bool, colunas)
		}
		return m
	}
	pac, atl := nova(), nova()
	for c := 0; c < colunas; c++ {
		if !pac[0][c] {
			dfs(0, c, pac)
		}
		if !atl[linhas-1][c] {
			dfs(linhas-1, c, atl)
		}
	}
	for r := 0; r < linhas; r++ {
		if !pac[r][0] {
			dfs(r, 0, pac)
		}
		if !atl[r][colunas-1] {
			dfs(r, colunas-1, atl)
		}
	}
	resposta := [][]int{}
	for r := 0; r < linhas; r++ {
		for c := 0; c < colunas; c++ {
			if pac[r][c] && atl[r][c] {
				resposta = append(resposta, []int{r, c})
			}
		}
	}
	return resposta
}
```
