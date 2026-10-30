## Ideia

As duas propriedades juntas significam que, lendo a matriz linha por linha, todos os `m * n` elementos formam uma sequência única em ordem crescente. Então basta fazer uma busca binária nessa sequência imaginária, sem construí-la.

O índice `k` entre `0` e `m * n - 1` corresponde à linha `k // n` e à coluna `k % n`. A busca binária compara `matrix[k // n][k % n]` com `target` e ajusta os limites como de costume.

## Complexidade

Tempo `O(log(m * n))`. Espaço `O(1)`.

## Python

```python
def search_matrix(matrix, target):
    colunas = len(matrix[0])
    lo, hi = 0, len(matrix) * colunas - 1
    while lo <= hi:
        meio = (lo + hi) // 2
        valor = matrix[meio // colunas][meio % colunas]
        if valor == target:
            return True
        if valor < target:
            lo = meio + 1
        else:
            hi = meio - 1
    return False
```

## JavaScript

```javascript
function searchMatrix(matrix, target) {
  const colunas = matrix[0].length;
  let lo = 0;
  let hi = matrix.length * colunas - 1;
  while (lo <= hi) {
    const meio = Math.floor((lo + hi) / 2);
    const valor = matrix[Math.floor(meio / colunas)][meio % colunas];
    if (valor === target) return true;
    if (valor < target) lo = meio + 1;
    else hi = meio - 1;
  }
  return false;
}
```

## TypeScript

```typescript
function searchMatrix(matrix: number[][], target: number): boolean {
  const colunas = matrix[0].length;
  let lo = 0;
  let hi = matrix.length * colunas - 1;
  while (lo <= hi) {
    const meio = Math.floor((lo + hi) / 2);
    const valor = matrix[Math.floor(meio / colunas)][meio % colunas];
    if (valor === target) return true;
    if (valor < target) lo = meio + 1;
    else hi = meio - 1;
  }
  return false;
}
```

## Java

```java
class Solution {
    public boolean searchMatrix(int[][] matrix, int target) {
        int colunas = matrix[0].length;
        int lo = 0, hi = matrix.length * colunas - 1;
        while (lo <= hi) {
            int meio = lo + (hi - lo) / 2;
            int valor = matrix[meio / colunas][meio % colunas];
            if (valor == target) return true;
            if (valor < target) lo = meio + 1;
            else hi = meio - 1;
        }
        return false;
    }
}
```

## C++

```cpp
class Solution {
public:
    bool searchMatrix(vector<vector<int>>& matrix, int target) {
        int colunas = matrix[0].size();
        int lo = 0, hi = (int)matrix.size() * colunas - 1;
        while (lo <= hi) {
            int meio = lo + (hi - lo) / 2;
            int valor = matrix[meio / colunas][meio % colunas];
            if (valor == target) return true;
            if (valor < target) lo = meio + 1;
            else hi = meio - 1;
        }
        return false;
    }
};
```

## C#

```csharp
public class Solution {
    public bool SearchMatrix(int[][] matrix, int target) {
        int colunas = matrix[0].Length;
        int lo = 0, hi = matrix.Length * colunas - 1;
        while (lo <= hi) {
            int meio = lo + (hi - lo) / 2;
            int valor = matrix[meio / colunas][meio % colunas];
            if (valor == target) return true;
            if (valor < target) lo = meio + 1;
            else hi = meio - 1;
        }
        return false;
    }
}
```

## Go

```go
func searchMatrix(matrix [][]int, target int) bool {
	colunas := len(matrix[0])
	lo, hi := 0, len(matrix)*colunas-1
	for lo <= hi {
		meio := lo + (hi-lo)/2
		valor := matrix[meio/colunas][meio%colunas]
		if valor == target {
			return true
		}
		if valor < target {
			lo = meio + 1
		} else {
			hi = meio - 1
		}
	}
	return false
}
```
