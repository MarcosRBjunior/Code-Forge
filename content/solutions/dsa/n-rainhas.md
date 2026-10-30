## Ideia

Como cada linha precisa de exatamente uma rainha, o backtracking decide, linha por linha, em qual coluna colocá-la. Para saber em tempo constante se uma casa está atacada, guardam-se três conjuntos: colunas ocupadas, diagonais `linha - coluna` e anti-diagonais `linha + coluna`, pois cada uma dessas quantidades é constante ao longo de sua diagonal.

Se a casa é segura, coloque a rainha, marque os três conjuntos e avance para a linha seguinte; ao voltar, desfaça as marcas e tente a próxima coluna. Quando todas as `n` linhas foram preenchidas, o tabuleiro é convertido em strings e guardado.

## Complexidade

Tempo exponencial no pior caso, cerca de O(n!), mas a poda das casas atacadas reduz muito o espaço explorado. Espaço O(n) além da saída.

## Python

```python
def solve_n_queens(n):
    resultado = []
    colunas, diag1, diag2 = set(), set(), set()
    posicoes = []

    def colocar(linha):
        if linha == n:
            resultado.append(["." * c + "Q" + "." * (n - c - 1) for c in posicoes])
            return
        for c in range(n):
            if c in colunas or linha - c in diag1 or linha + c in diag2:
                continue
            colunas.add(c)
            diag1.add(linha - c)
            diag2.add(linha + c)
            posicoes.append(c)
            colocar(linha + 1)
            posicoes.pop()
            colunas.remove(c)
            diag1.remove(linha - c)
            diag2.remove(linha + c)

    colocar(0)
    return resultado
```

## JavaScript

```javascript
function solveNQueens(n) {
  const resultado = [];
  const colunas = new Set(), diag1 = new Set(), diag2 = new Set();
  const posicoes = [];

  function colocar(linha) {
    if (linha === n) {
      resultado.push(posicoes.map((c) => ".".repeat(c) + "Q" + ".".repeat(n - c - 1)));
      return;
    }
    for (let c = 0; c < n; c++) {
      if (colunas.has(c) || diag1.has(linha - c) || diag2.has(linha + c)) continue;
      colunas.add(c);
      diag1.add(linha - c);
      diag2.add(linha + c);
      posicoes.push(c);
      colocar(linha + 1);
      posicoes.pop();
      colunas.delete(c);
      diag1.delete(linha - c);
      diag2.delete(linha + c);
    }
  }

  colocar(0);
  return resultado;
}
```

## TypeScript

```typescript
function solveNQueens(n: number): string[][] {
  const resultado: string[][] = [];
  const colunas = new Set<number>(), diag1 = new Set<number>(), diag2 = new Set<number>();
  const posicoes: number[] = [];

  function colocar(linha: number): void {
    if (linha === n) {
      resultado.push(posicoes.map((c) => ".".repeat(c) + "Q" + ".".repeat(n - c - 1)));
      return;
    }
    for (let c = 0; c < n; c++) {
      if (colunas.has(c) || diag1.has(linha - c) || diag2.has(linha + c)) continue;
      colunas.add(c);
      diag1.add(linha - c);
      diag2.add(linha + c);
      posicoes.push(c);
      colocar(linha + 1);
      posicoes.pop();
      colunas.delete(c);
      diag1.delete(linha - c);
      diag2.delete(linha + c);
    }
  }

  colocar(0);
  return resultado;
}
```

## Java

```java
class Solution {
    private int n;
    private boolean[] colunas, diag1, diag2;
    private int[] posicoes;
    private List<String[]> resultado;

    public String[][] solveNQueens(int n) {
        this.n = n;
        colunas = new boolean[n];
        diag1 = new boolean[2 * n];
        diag2 = new boolean[2 * n];
        posicoes = new int[n];
        resultado = new ArrayList<>();
        colocar(0);
        return resultado.toArray(new String[0][]);
    }

    private void colocar(int linha) {
        if (linha == n) {
            String[] tabuleiro = new String[n];
            for (int r = 0; r < n; r++) {
                char[] cs = new char[n];
                Arrays.fill(cs, '.');
                cs[posicoes[r]] = 'Q';
                tabuleiro[r] = new String(cs);
            }
            resultado.add(tabuleiro);
            return;
        }
        for (int c = 0; c < n; c++) {
            int d1 = linha - c + n, d2 = linha + c;
            if (colunas[c] || diag1[d1] || diag2[d2]) continue;
            colunas[c] = diag1[d1] = diag2[d2] = true;
            posicoes[linha] = c;
            colocar(linha + 1);
            colunas[c] = diag1[d1] = diag2[d2] = false;
        }
    }
}
```

## C++

```cpp
class Solution {
    int n;
    vector<bool> colunas, diag1, diag2;
    vector<int> posicoes;
    vector<vector<string>> resultado;

    void colocar(int linha) {
        if (linha == n) {
            vector<string> tabuleiro(n, string(n, '.'));
            for (int r = 0; r < n; r++) tabuleiro[r][posicoes[r]] = 'Q';
            resultado.push_back(tabuleiro);
            return;
        }
        for (int c = 0; c < n; c++) {
            int d1 = linha - c + n, d2 = linha + c;
            if (colunas[c] || diag1[d1] || diag2[d2]) continue;
            colunas[c] = diag1[d1] = diag2[d2] = true;
            posicoes[linha] = c;
            colocar(linha + 1);
            colunas[c] = diag1[d1] = diag2[d2] = false;
        }
    }

public:
    vector<vector<string>> solveNQueens(int n) {
        this->n = n;
        colunas.assign(n, false);
        diag1.assign(2 * n, false);
        diag2.assign(2 * n, false);
        posicoes.assign(n, 0);
        resultado.clear();
        colocar(0);
        return resultado;
    }
};
```

## C#

```csharp
public class Solution {
    private int n;
    private bool[] colunas, diag1, diag2;
    private int[] posicoes;
    private List<string[]> resultado;

    public string[][] SolveNQueens(int n) {
        this.n = n;
        colunas = new bool[n];
        diag1 = new bool[2 * n];
        diag2 = new bool[2 * n];
        posicoes = new int[n];
        resultado = new List<string[]>();
        Colocar(0);
        return resultado.ToArray();
    }

    private void Colocar(int linha) {
        if (linha == n) {
            var tabuleiro = new string[n];
            for (int r = 0; r < n; r++) {
                var cs = new char[n];
                for (int k = 0; k < n; k++) cs[k] = '.';
                cs[posicoes[r]] = 'Q';
                tabuleiro[r] = new string(cs);
            }
            resultado.Add(tabuleiro);
            return;
        }
        for (int c = 0; c < n; c++) {
            int d1 = linha - c + n, d2 = linha + c;
            if (colunas[c] || diag1[d1] || diag2[d2]) continue;
            colunas[c] = diag1[d1] = diag2[d2] = true;
            posicoes[linha] = c;
            Colocar(linha + 1);
            colunas[c] = diag1[d1] = diag2[d2] = false;
        }
    }
}
```

## Go

```go
import "strings"

func solveNQueens(n int) [][]string {
	resultado := [][]string{}
	colunas := make([]bool, n)
	diag1 := make([]bool, 2*n)
	diag2 := make([]bool, 2*n)
	posicoes := make([]int, n)

	var colocar func(linha int)
	colocar = func(linha int) {
		if linha == n {
			tabuleiro := make([]string, n)
			for r := 0; r < n; r++ {
				tabuleiro[r] = strings.Repeat(".", posicoes[r]) + "Q" + strings.Repeat(".", n-posicoes[r]-1)
			}
			resultado = append(resultado, tabuleiro)
			return
		}
		for c := 0; c < n; c++ {
			d1, d2 := linha-c+n, linha+c
			if colunas[c] || diag1[d1] || diag2[d2] {
				continue
			}
			colunas[c], diag1[d1], diag2[d2] = true, true, true
			posicoes[linha] = c
			colocar(linha + 1)
			colunas[c], diag1[d1], diag2[d2] = false, false, false
		}
	}

	colocar(0)
	return resultado
}
```
