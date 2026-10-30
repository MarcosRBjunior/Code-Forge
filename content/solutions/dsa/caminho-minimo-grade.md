## Ideia

Como só dá para andar para a direita ou para baixo, o menor custo até uma célula é o valor dela mais o menor entre o custo até a vizinha de cima e o da vizinha da esquerda. A primeira linha e a primeira coluna só têm uma origem possível.

Em vez de uma tabela nova, reaproveita-se uma única linha de custos: `custo[j]` guarda o melhor custo até a coluna `j` da linha atual. Ao processar a célula `(i, j)`, `custo[j]` ainda contém o valor da linha de cima e `custo[j - 1]` já foi atualizado com o da esquerda.

## Complexidade

Tempo `O(L * C)`, uma visita por célula. Espaço `O(C)`, uma linha de custos.

## Python

```python
def min_path_sum(grid):
    colunas = len(grid[0])
    custo = [0] * colunas
    for i, linha in enumerate(grid):
        for j, valor in enumerate(linha):
            if i == 0 and j == 0:
                custo[j] = valor
            elif i == 0:
                custo[j] = custo[j - 1] + valor
            elif j == 0:
                custo[j] += valor
            else:
                custo[j] = min(custo[j], custo[j - 1]) + valor
    return custo[-1]
```

## JavaScript

```javascript
function minPathSum(grid) {
  const colunas = grid[0].length;
  const custo = new Array(colunas).fill(0);
  for (let i = 0; i < grid.length; i++) {
    for (let j = 0; j < colunas; j++) {
      const valor = grid[i][j];
      if (i === 0 && j === 0) custo[j] = valor;
      else if (i === 0) custo[j] = custo[j - 1] + valor;
      else if (j === 0) custo[j] += valor;
      else custo[j] = Math.min(custo[j], custo[j - 1]) + valor;
    }
  }
  return custo[colunas - 1];
}
```

## TypeScript

```typescript
function minPathSum(grid: number[][]): number {
  const colunas = grid[0].length;
  const custo: number[] = new Array(colunas).fill(0);
  for (let i = 0; i < grid.length; i++) {
    for (let j = 0; j < colunas; j++) {
      const valor = grid[i][j];
      if (i === 0 && j === 0) custo[j] = valor;
      else if (i === 0) custo[j] = custo[j - 1] + valor;
      else if (j === 0) custo[j] += valor;
      else custo[j] = Math.min(custo[j], custo[j - 1]) + valor;
    }
  }
  return custo[colunas - 1];
}
```

## Java

```java
class Solution {
    public int minPathSum(int[][] grid) {
        int colunas = grid[0].length;
        int[] custo = new int[colunas];
        for (int i = 0; i < grid.length; i++) {
            for (int j = 0; j < colunas; j++) {
                int valor = grid[i][j];
                if (i == 0 && j == 0) custo[j] = valor;
                else if (i == 0) custo[j] = custo[j - 1] + valor;
                else if (j == 0) custo[j] += valor;
                else custo[j] = Math.min(custo[j], custo[j - 1]) + valor;
            }
        }
        return custo[colunas - 1];
    }
}
```

## C++

```cpp
class Solution {
public:
    int minPathSum(vector<vector<int>>& grid) {
        int colunas = grid[0].size();
        vector<int> custo(colunas, 0);
        for (size_t i = 0; i < grid.size(); i++) {
            for (int j = 0; j < colunas; j++) {
                int valor = grid[i][j];
                if (i == 0 && j == 0) custo[j] = valor;
                else if (i == 0) custo[j] = custo[j - 1] + valor;
                else if (j == 0) custo[j] += valor;
                else custo[j] = min(custo[j], custo[j - 1]) + valor;
            }
        }
        return custo[colunas - 1];
    }
};
```

## C#

```csharp
public class Solution {
    public int MinPathSum(int[][] grid) {
        int colunas = grid[0].Length;
        var custo = new int[colunas];
        for (int i = 0; i < grid.Length; i++) {
            for (int j = 0; j < colunas; j++) {
                int valor = grid[i][j];
                if (i == 0 && j == 0) custo[j] = valor;
                else if (i == 0) custo[j] = custo[j - 1] + valor;
                else if (j == 0) custo[j] += valor;
                else custo[j] = Math.Min(custo[j], custo[j - 1]) + valor;
            }
        }
        return custo[colunas - 1];
    }
}
```

## Go

```go
func minPathSum(grid [][]int) int {
	colunas := len(grid[0])
	custo := make([]int, colunas)
	for i := range grid {
		for j := 0; j < colunas; j++ {
			valor := grid[i][j]
			switch {
			case i == 0 && j == 0:
				custo[j] = valor
			case i == 0:
				custo[j] = custo[j-1] + valor
			case j == 0:
				custo[j] += valor
			default:
				custo[j] = min(custo[j], custo[j-1]) + valor
			}
		}
	}
	return custo[colunas-1]
}
```
