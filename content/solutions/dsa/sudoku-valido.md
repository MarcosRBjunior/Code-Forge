## Ideia

Uma só passada pelas 81 células basta. Para cada dígito não vazio, calculamos a linha, a coluna e o bloco 3x3 a que ele pertence (o bloco é `(linha / 3) * 3 + coluna / 3`) e conferimos se o dígito já apareceu naquela linha, coluna ou bloco. Se sim, o tabuleiro é inválido; se não, registramos o dígito nos três conjuntos.

Células vazias são ignoradas, e não precisamos tentar resolver o jogo.

## Complexidade

Tempo O(1), pois o tabuleiro tem tamanho fixo de 81 células (O(n²) para um tabuleiro n por n). Espaço O(1) para os 27 conjuntos.

## Python

```python
def is_valid_sudoku(board):
    linhas = [set() for _ in range(9)]
    colunas = [set() for _ in range(9)]
    blocos = [set() for _ in range(9)]
    for i in range(9):
        for j in range(9):
            d = board[i][j]
            if d == ".":
                continue
            b = (i // 3) * 3 + j // 3
            if d in linhas[i] or d in colunas[j] or d in blocos[b]:
                return False
            linhas[i].add(d)
            colunas[j].add(d)
            blocos[b].add(d)
    return True
```

## JavaScript

```javascript
function isValidSudoku(board) {
  const linhas = Array.from({ length: 9 }, () => new Set());
  const colunas = Array.from({ length: 9 }, () => new Set());
  const blocos = Array.from({ length: 9 }, () => new Set());
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      const d = board[i][j];
      if (d === ".") continue;
      const b = Math.floor(i / 3) * 3 + Math.floor(j / 3);
      if (linhas[i].has(d) || colunas[j].has(d) || blocos[b].has(d)) return false;
      linhas[i].add(d);
      colunas[j].add(d);
      blocos[b].add(d);
    }
  }
  return true;
}
```

## TypeScript

```typescript
function isValidSudoku(board: string[][]): boolean {
  const linhas: Set<string>[] = Array.from({ length: 9 }, () => new Set<string>());
  const colunas: Set<string>[] = Array.from({ length: 9 }, () => new Set<string>());
  const blocos: Set<string>[] = Array.from({ length: 9 }, () => new Set<string>());
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      const d = board[i][j];
      if (d === ".") continue;
      const b = Math.floor(i / 3) * 3 + Math.floor(j / 3);
      if (linhas[i].has(d) || colunas[j].has(d) || blocos[b].has(d)) return false;
      linhas[i].add(d);
      colunas[j].add(d);
      blocos[b].add(d);
    }
  }
  return true;
}
```

## Java

```java
class Solution {
    public boolean isValidSudoku(String[][] board) {
        boolean[][] linhas = new boolean[9][10];
        boolean[][] colunas = new boolean[9][10];
        boolean[][] blocos = new boolean[9][10];
        for (int i = 0; i < 9; i++) {
            for (int j = 0; j < 9; j++) {
                if (board[i][j].equals(".")) continue;
                int d = Integer.parseInt(board[i][j]);
                int b = (i / 3) * 3 + j / 3;
                if (linhas[i][d] || colunas[j][d] || blocos[b][d]) return false;
                linhas[i][d] = colunas[j][d] = blocos[b][d] = true;
            }
        }
        return true;
    }
}
```

## C++

```cpp
class Solution {
public:
    bool isValidSudoku(vector<vector<string>>& board) {
        bool linhas[9][10] = {}, colunas[9][10] = {}, blocos[9][10] = {};
        for (int i = 0; i < 9; i++) {
            for (int j = 0; j < 9; j++) {
                if (board[i][j] == ".") continue;
                int d = stoi(board[i][j]);
                int b = (i / 3) * 3 + j / 3;
                if (linhas[i][d] || colunas[j][d] || blocos[b][d]) return false;
                linhas[i][d] = colunas[j][d] = blocos[b][d] = true;
            }
        }
        return true;
    }
};
```

## C#

```csharp
public class Solution {
    public bool IsValidSudoku(string[][] board) {
        var linhas = new bool[9, 10];
        var colunas = new bool[9, 10];
        var blocos = new bool[9, 10];
        for (int i = 0; i < 9; i++) {
            for (int j = 0; j < 9; j++) {
                if (board[i][j] == ".") continue;
                int d = int.Parse(board[i][j]);
                int b = (i / 3) * 3 + j / 3;
                if (linhas[i, d] || colunas[j, d] || blocos[b, d]) return false;
                linhas[i, d] = colunas[j, d] = blocos[b, d] = true;
            }
        }
        return true;
    }
}
```

## Go

```go
func isValidSudoku(board [][]string) bool {
	var linhas, colunas, blocos [9][10]bool
	for i := 0; i < 9; i++ {
		for j := 0; j < 9; j++ {
			if board[i][j] == "." {
				continue
			}
			d := int(board[i][j][0] - '0')
			b := (i/3)*3 + j/3
			if linhas[i][d] || colunas[j][d] || blocos[b][d] {
				return false
			}
			linhas[i][d], colunas[j][d], blocos[b][d] = true, true, true
		}
	}
	return true
}
```
