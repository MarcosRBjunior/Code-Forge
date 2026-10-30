## Ideia

Girar uma matriz 90 graus no sentido horário é o mesmo que transpor a matriz (trocar `matrix[i][j]` com `matrix[j][i]`) e depois inverter cada linha. A transposição reflete a imagem em torno da diagonal principal, e a inversão das linhas completa o giro.

Cada troca envolve só dois elementos, então tudo acontece na própria matriz, sem criar uma segunda.

## Complexidade

Tempo O(n²), pois cada célula é tocada um número constante de vezes. Espaço O(1) extra.

## Python

```python
def rotate_image(matrix):
    n = len(matrix)
    for i in range(n):
        for j in range(i + 1, n):
            matrix[i][j], matrix[j][i] = matrix[j][i], matrix[i][j]
    for linha in matrix:
        linha.reverse()
```

## JavaScript

```javascript
function rotateImage(matrix) {
  const n = matrix.length;
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      [matrix[i][j], matrix[j][i]] = [matrix[j][i], matrix[i][j]];
    }
  }
  for (const linha of matrix) linha.reverse();
}
```

## TypeScript

```typescript
function rotateImage(matrix: number[][]): void {
  const n = matrix.length;
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      [matrix[i][j], matrix[j][i]] = [matrix[j][i], matrix[i][j]];
    }
  }
  for (const linha of matrix) linha.reverse();
}
```

## Java

```java
class Solution {
    public void rotateImage(int[][] matrix) {
        int n = matrix.length;
        for (int i = 0; i < n; i++) {
            for (int j = i + 1; j < n; j++) {
                int t = matrix[i][j];
                matrix[i][j] = matrix[j][i];
                matrix[j][i] = t;
            }
        }
        for (int[] linha : matrix) {
            for (int a = 0, b = n - 1; a < b; a++, b--) {
                int t = linha[a];
                linha[a] = linha[b];
                linha[b] = t;
            }
        }
    }
}
```

## C++

```cpp
class Solution {
public:
    void rotateImage(vector<vector<int>>& matrix) {
        int n = matrix.size();
        for (int i = 0; i < n; i++) {
            for (int j = i + 1; j < n; j++) {
                swap(matrix[i][j], matrix[j][i]);
            }
        }
        for (auto& linha : matrix) reverse(linha.begin(), linha.end());
    }
};
```

## C#

```csharp
public class Solution {
    public void RotateImage(int[][] matrix) {
        int n = matrix.Length;
        for (int i = 0; i < n; i++) {
            for (int j = i + 1; j < n; j++) {
                int t = matrix[i][j];
                matrix[i][j] = matrix[j][i];
                matrix[j][i] = t;
            }
        }
        foreach (var linha in matrix) Array.Reverse(linha);
    }
}
```

## Go

```go
func rotateImage(matrix [][]int) {
	n := len(matrix)
	for i := 0; i < n; i++ {
		for j := i + 1; j < n; j++ {
			matrix[i][j], matrix[j][i] = matrix[j][i], matrix[i][j]
		}
	}
	for _, linha := range matrix {
		for a, b := 0, n-1; a < b; a, b = a+1, b-1 {
			linha[a], linha[b] = linha[b], linha[a]
		}
	}
}
```
