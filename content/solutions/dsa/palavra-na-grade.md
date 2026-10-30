## Ideia

Tente cada célula como início e explore em profundidade. Em cada passo, a célula atual precisa conter a letra esperada da palavra; se contiver, marque-a como em uso e tente as quatro vizinhas para a próxima letra. Ao voltar, desmarque a célula para que outros caminhos possam usá-la.

Esse marcar e desmarcar é o backtracking: cada caminho vê apenas as células que ele próprio ainda não usou. Se o índice chega ao tamanho da palavra, todas as letras foram casadas.

## Complexidade

Tempo O(L·C·3^K) no pior caso, com K o tamanho da palavra, pois depois do primeiro passo restam no máximo três direções. Espaço O(K) para a recursão.

## Python

```python
def exist(board, word):
    linhas, colunas = len(board), len(board[0])

    def busca(r, c, i):
        if i == len(word):
            return True
        if not (0 <= r < linhas and 0 <= c < colunas) or board[r][c] != word[i]:
            return False
        letra = board[r][c]
        board[r][c] = None  # em uso
        achou = (busca(r + 1, c, i + 1) or busca(r - 1, c, i + 1)
                 or busca(r, c + 1, i + 1) or busca(r, c - 1, i + 1))
        board[r][c] = letra
        return achou

    return any(busca(r, c, 0) for r in range(linhas) for c in range(colunas))
```

## JavaScript

```javascript
function exist(board, word) {
  const linhas = board.length, colunas = board[0].length;
  const busca = (r, c, i) => {
    if (i === word.length) return true;
    if (r < 0 || r >= linhas || c < 0 || c >= colunas || board[r][c] !== word[i]) return false;
    const letra = board[r][c];
    board[r][c] = null;
    const achou = busca(r + 1, c, i + 1) || busca(r - 1, c, i + 1) ||
                  busca(r, c + 1, i + 1) || busca(r, c - 1, i + 1);
    board[r][c] = letra;
    return achou;
  };
  for (let r = 0; r < linhas; r++)
    for (let c = 0; c < colunas; c++)
      if (busca(r, c, 0)) return true;
  return false;
}
```

## TypeScript

```typescript
function exist(board: string[][], word: string): boolean {
  const linhas = board.length, colunas = board[0].length;
  const usada: boolean[][] = Array.from({ length: linhas }, () => new Array(colunas).fill(false));
  const busca = (r: number, c: number, i: number): boolean => {
    if (i === word.length) return true;
    if (r < 0 || r >= linhas || c < 0 || c >= colunas) return false;
    if (usada[r][c] || board[r][c] !== word[i]) return false;
    usada[r][c] = true;
    const achou = busca(r + 1, c, i + 1) || busca(r - 1, c, i + 1) ||
                  busca(r, c + 1, i + 1) || busca(r, c - 1, i + 1);
    usada[r][c] = false;
    return achou;
  };
  for (let r = 0; r < linhas; r++)
    for (let c = 0; c < colunas; c++)
      if (busca(r, c, 0)) return true;
  return false;
}
```

## Java

```java
class Solution {
    private boolean busca(String[][] b, boolean[][] usada, String w, int r, int c, int i) {
        if (i == w.length()) return true;
        if (r < 0 || r >= b.length || c < 0 || c >= b[0].length) return false;
        if (usada[r][c] || !b[r][c].equals(String.valueOf(w.charAt(i)))) return false;
        usada[r][c] = true;
        boolean achou = busca(b, usada, w, r + 1, c, i + 1) || busca(b, usada, w, r - 1, c, i + 1)
                || busca(b, usada, w, r, c + 1, i + 1) || busca(b, usada, w, r, c - 1, i + 1);
        usada[r][c] = false;
        return achou;
    }

    public boolean exist(String[][] board, String word) {
        boolean[][] usada = new boolean[board.length][board[0].length];
        for (int r = 0; r < board.length; r++)
            for (int c = 0; c < board[0].length; c++)
                if (busca(board, usada, word, r, c, 0)) return true;
        return false;
    }
}
```

## C++

```cpp
class Solution {
    bool busca(vector<vector<string>>& b, vector<vector<bool>>& usada, const string& w, int r, int c, int i) {
        if (i == (int)w.size()) return true;
        if (r < 0 || r >= (int)b.size() || c < 0 || c >= (int)b[0].size()) return false;
        if (usada[r][c] || b[r][c] != string(1, w[i])) return false;
        usada[r][c] = true;
        bool achou = busca(b, usada, w, r + 1, c, i + 1) || busca(b, usada, w, r - 1, c, i + 1)
                  || busca(b, usada, w, r, c + 1, i + 1) || busca(b, usada, w, r, c - 1, i + 1);
        usada[r][c] = false;
        return achou;
    }

public:
    bool exist(vector<vector<string>>& board, string word) {
        vector<vector<bool>> usada(board.size(), vector<bool>(board[0].size(), false));
        for (int r = 0; r < (int)board.size(); r++)
            for (int c = 0; c < (int)board[0].size(); c++)
                if (busca(board, usada, word, r, c, 0)) return true;
        return false;
    }
};
```

## C#

```csharp
public class Solution {
    private bool Busca(string[][] b, bool[,] usada, string w, int r, int c, int i) {
        if (i == w.Length) return true;
        if (r < 0 || r >= b.Length || c < 0 || c >= b[0].Length) return false;
        if (usada[r, c] || b[r][c] != w[i].ToString()) return false;
        usada[r, c] = true;
        bool achou = Busca(b, usada, w, r + 1, c, i + 1) || Busca(b, usada, w, r - 1, c, i + 1)
                  || Busca(b, usada, w, r, c + 1, i + 1) || Busca(b, usada, w, r, c - 1, i + 1);
        usada[r, c] = false;
        return achou;
    }

    public bool Exist(string[][] board, string word) {
        var usada = new bool[board.Length, board[0].Length];
        for (int r = 0; r < board.Length; r++)
            for (int c = 0; c < board[0].Length; c++)
                if (Busca(board, usada, word, r, c, 0)) return true;
        return false;
    }
}
```

## Go

```go
func exist(board [][]string, word string) bool {
	linhas, colunas := len(board), len(board[0])
	usada := make([][]bool, linhas)
	for i := range usada {
		usada[i] = make([]bool, colunas)
	}
	var busca func(r, c, i int) bool
	busca = func(r, c, i int) bool {
		if i == len(word) {
			return true
		}
		if r < 0 || r >= linhas || c < 0 || c >= colunas {
			return false
		}
		if usada[r][c] || board[r][c] != string(word[i]) {
			return false
		}
		usada[r][c] = true
		achou := busca(r+1, c, i+1) || busca(r-1, c, i+1) ||
			busca(r, c+1, i+1) || busca(r, c-1, i+1)
		usada[r][c] = false
		return achou
	}
	for r := 0; r < linhas; r++ {
		for c := 0; c < colunas; c++ {
			if busca(r, c, 0) {
				return true
			}
		}
	}
	return false
}
```
