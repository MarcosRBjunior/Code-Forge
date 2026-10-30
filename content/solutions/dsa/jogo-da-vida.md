## Ideia

A próxima geração depende do estado antigo de todas as vizinhas, então não podemos simplesmente sobrescrever as células. Em vez de uma cópia do tabuleiro, guardamos o estado novo no segundo bit de cada célula: o bit 0 continua sendo o estado atual e o bit 1 recebe o estado da próxima geração.

Na primeira passagem, contamos as vizinhas vivas lendo apenas o bit 0 (`valor & 1`) e, se a regra manda a célula viver, ligamos o bit 1 somando `2`. Na segunda passagem, deslocamos todos os valores um bit para a direita, o que descarta o estado antigo e deixa o novo.

## Complexidade

Tempo O(linhas × colunas), com 8 vizinhas por célula. Espaço O(1) extra, pois a atualização é feita no próprio tabuleiro.

## Python

```python
def game_of_life(board):
    linhas, colunas = len(board), len(board[0])
    for i in range(linhas):
        for j in range(colunas):
            vizinhas = 0
            for di in (-1, 0, 1):
                for dj in (-1, 0, 1):
                    if di == 0 and dj == 0:
                        continue
                    ni, nj = i + di, j + dj
                    if 0 <= ni < linhas and 0 <= nj < colunas:
                        vizinhas += board[ni][nj] & 1
            viva = board[i][j] & 1
            if (viva and vizinhas in (2, 3)) or (not viva and vizinhas == 3):
                board[i][j] |= 2
    for i in range(linhas):
        for j in range(colunas):
            board[i][j] >>= 1
```

## JavaScript

```javascript
function gameOfLife(board) {
  const linhas = board.length;
  const colunas = board[0].length;
  for (let i = 0; i < linhas; i++) {
    for (let j = 0; j < colunas; j++) {
      let vizinhas = 0;
      for (let di = -1; di <= 1; di++) {
        for (let dj = -1; dj <= 1; dj++) {
          if (di === 0 && dj === 0) continue;
          const ni = i + di;
          const nj = j + dj;
          if (ni >= 0 && ni < linhas && nj >= 0 && nj < colunas) vizinhas += board[ni][nj] & 1;
        }
      }
      const viva = board[i][j] & 1;
      if ((viva && (vizinhas === 2 || vizinhas === 3)) || (!viva && vizinhas === 3)) {
        board[i][j] |= 2;
      }
    }
  }
  for (let i = 0; i < linhas; i++) {
    for (let j = 0; j < colunas; j++) board[i][j] >>= 1;
  }
}
```

## TypeScript

```typescript
function gameOfLife(board: number[][]): void {
  const linhas = board.length;
  const colunas = board[0].length;
  for (let i = 0; i < linhas; i++) {
    for (let j = 0; j < colunas; j++) {
      let vizinhas = 0;
      for (let di = -1; di <= 1; di++) {
        for (let dj = -1; dj <= 1; dj++) {
          if (di === 0 && dj === 0) continue;
          const ni = i + di;
          const nj = j + dj;
          if (ni >= 0 && ni < linhas && nj >= 0 && nj < colunas) vizinhas += board[ni][nj] & 1;
        }
      }
      const viva = board[i][j] & 1;
      if ((viva && (vizinhas === 2 || vizinhas === 3)) || (!viva && vizinhas === 3)) {
        board[i][j] |= 2;
      }
    }
  }
  for (let i = 0; i < linhas; i++) {
    for (let j = 0; j < colunas; j++) board[i][j] >>= 1;
  }
}
```

## Java

```java
class Solution {
    public void gameOfLife(int[][] board) {
        int linhas = board.length, colunas = board[0].length;
        for (int i = 0; i < linhas; i++) {
            for (int j = 0; j < colunas; j++) {
                int vizinhas = 0;
                for (int di = -1; di <= 1; di++) {
                    for (int dj = -1; dj <= 1; dj++) {
                        if (di == 0 && dj == 0) continue;
                        int ni = i + di, nj = j + dj;
                        if (ni >= 0 && ni < linhas && nj >= 0 && nj < colunas) vizinhas += board[ni][nj] & 1;
                    }
                }
                int viva = board[i][j] & 1;
                if ((viva == 1 && (vizinhas == 2 || vizinhas == 3)) || (viva == 0 && vizinhas == 3)) {
                    board[i][j] |= 2;
                }
            }
        }
        for (int i = 0; i < linhas; i++) {
            for (int j = 0; j < colunas; j++) board[i][j] >>= 1;
        }
    }
}
```

## C++

```cpp
class Solution {
public:
    void gameOfLife(vector<vector<int>>& board) {
        int linhas = board.size(), colunas = board[0].size();
        for (int i = 0; i < linhas; i++) {
            for (int j = 0; j < colunas; j++) {
                int vizinhas = 0;
                for (int di = -1; di <= 1; di++) {
                    for (int dj = -1; dj <= 1; dj++) {
                        if (di == 0 && dj == 0) continue;
                        int ni = i + di, nj = j + dj;
                        if (ni >= 0 && ni < linhas && nj >= 0 && nj < colunas) vizinhas += board[ni][nj] & 1;
                    }
                }
                int viva = board[i][j] & 1;
                if ((viva == 1 && (vizinhas == 2 || vizinhas == 3)) || (viva == 0 && vizinhas == 3)) {
                    board[i][j] |= 2;
                }
            }
        }
        for (int i = 0; i < linhas; i++) {
            for (int j = 0; j < colunas; j++) board[i][j] >>= 1;
        }
    }
};
```

## C#

```csharp
public class Solution {
    public void GameOfLife(int[][] board) {
        int linhas = board.Length, colunas = board[0].Length;
        for (int i = 0; i < linhas; i++) {
            for (int j = 0; j < colunas; j++) {
                int vizinhas = 0;
                for (int di = -1; di <= 1; di++) {
                    for (int dj = -1; dj <= 1; dj++) {
                        if (di == 0 && dj == 0) continue;
                        int ni = i + di, nj = j + dj;
                        if (ni >= 0 && ni < linhas && nj >= 0 && nj < colunas) vizinhas += board[ni][nj] & 1;
                    }
                }
                int viva = board[i][j] & 1;
                if ((viva == 1 && (vizinhas == 2 || vizinhas == 3)) || (viva == 0 && vizinhas == 3)) {
                    board[i][j] |= 2;
                }
            }
        }
        for (int i = 0; i < linhas; i++) {
            for (int j = 0; j < colunas; j++) board[i][j] >>= 1;
        }
    }
}
```

## Go

```go
func gameOfLife(board [][]int) {
	linhas, colunas := len(board), len(board[0])
	for i := 0; i < linhas; i++ {
		for j := 0; j < colunas; j++ {
			vizinhas := 0
			for di := -1; di <= 1; di++ {
				for dj := -1; dj <= 1; dj++ {
					if di == 0 && dj == 0 {
						continue
					}
					ni, nj := i+di, j+dj
					if ni >= 0 && ni < linhas && nj >= 0 && nj < colunas {
						vizinhas += board[ni][nj] & 1
					}
				}
			}
			viva := board[i][j] & 1
			if (viva == 1 && (vizinhas == 2 || vizinhas == 3)) || (viva == 0 && vizinhas == 3) {
				board[i][j] |= 2
			}
		}
	}
	for i := 0; i < linhas; i++ {
		for j := 0; j < colunas; j++ {
			board[i][j] >>= 1
		}
	}
}
```
