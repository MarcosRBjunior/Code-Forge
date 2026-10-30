## Ideia

Se zerássemos durante a varredura, os zeros novos contaminariam o resto da matriz. Por isso fazemos duas fases: primeiro anotamos quais linhas e quais colunas contêm um zero original; depois zeramos toda célula cuja linha ou coluna foi anotada.

Aqui usamos dois vetores de marcação, o que custa memória O(m + n). Dá para reduzir para O(1) usando a primeira linha e a primeira coluna como marcadores, mas a versão com vetores é bem mais clara.

## Complexidade

Tempo O(m * n), duas passadas pela matriz. Espaço O(m + n) para as marcações.

## Python

```python
def set_zeroes(matrix):
    linhas = set()
    colunas = set()
    for i, linha in enumerate(matrix):
        for j, valor in enumerate(linha):
            if valor == 0:
                linhas.add(i)
                colunas.add(j)
    for i in range(len(matrix)):
        for j in range(len(matrix[0])):
            if i in linhas or j in colunas:
                matrix[i][j] = 0
```

## JavaScript

```javascript
function setZeroes(matrix) {
  const linhas = new Set();
  const colunas = new Set();
  for (let i = 0; i < matrix.length; i++) {
    for (let j = 0; j < matrix[0].length; j++) {
      if (matrix[i][j] === 0) {
        linhas.add(i);
        colunas.add(j);
      }
    }
  }
  for (let i = 0; i < matrix.length; i++) {
    for (let j = 0; j < matrix[0].length; j++) {
      if (linhas.has(i) || colunas.has(j)) matrix[i][j] = 0;
    }
  }
}
```

## TypeScript

```typescript
function setZeroes(matrix: number[][]): void {
  const linhas = new Set<number>();
  const colunas = new Set<number>();
  for (let i = 0; i < matrix.length; i++) {
    for (let j = 0; j < matrix[0].length; j++) {
      if (matrix[i][j] === 0) {
        linhas.add(i);
        colunas.add(j);
      }
    }
  }
  for (let i = 0; i < matrix.length; i++) {
    for (let j = 0; j < matrix[0].length; j++) {
      if (linhas.has(i) || colunas.has(j)) matrix[i][j] = 0;
    }
  }
}
```

## Java

```java
class Solution {
    public void setZeroes(int[][] matrix) {
        int m = matrix.length, n = matrix[0].length;
        boolean[] linhas = new boolean[m];
        boolean[] colunas = new boolean[n];
        for (int i = 0; i < m; i++) {
            for (int j = 0; j < n; j++) {
                if (matrix[i][j] == 0) {
                    linhas[i] = true;
                    colunas[j] = true;
                }
            }
        }
        for (int i = 0; i < m; i++) {
            for (int j = 0; j < n; j++) {
                if (linhas[i] || colunas[j]) matrix[i][j] = 0;
            }
        }
    }
}
```

## C++

```cpp
class Solution {
public:
    void setZeroes(vector<vector<int>>& matrix) {
        int m = matrix.size(), n = matrix[0].size();
        vector<bool> linhas(m, false), colunas(n, false);
        for (int i = 0; i < m; i++) {
            for (int j = 0; j < n; j++) {
                if (matrix[i][j] == 0) {
                    linhas[i] = true;
                    colunas[j] = true;
                }
            }
        }
        for (int i = 0; i < m; i++) {
            for (int j = 0; j < n; j++) {
                if (linhas[i] || colunas[j]) matrix[i][j] = 0;
            }
        }
    }
};
```

## C#

```csharp
public class Solution {
    public void SetZeroes(int[][] matrix) {
        int m = matrix.Length, n = matrix[0].Length;
        var linhas = new bool[m];
        var colunas = new bool[n];
        for (int i = 0; i < m; i++) {
            for (int j = 0; j < n; j++) {
                if (matrix[i][j] == 0) {
                    linhas[i] = true;
                    colunas[j] = true;
                }
            }
        }
        for (int i = 0; i < m; i++) {
            for (int j = 0; j < n; j++) {
                if (linhas[i] || colunas[j]) matrix[i][j] = 0;
            }
        }
    }
}
```

## Go

```go
func setZeroes(matrix [][]int) {
	m, n := len(matrix), len(matrix[0])
	linhas := make([]bool, m)
	colunas := make([]bool, n)
	for i := 0; i < m; i++ {
		for j := 0; j < n; j++ {
			if matrix[i][j] == 0 {
				linhas[i] = true
				colunas[j] = true
			}
		}
	}
	for i := 0; i < m; i++ {
		for j := 0; j < n; j++ {
			if linhas[i] || colunas[j] {
				matrix[i][j] = 0
			}
		}
	}
}
```
