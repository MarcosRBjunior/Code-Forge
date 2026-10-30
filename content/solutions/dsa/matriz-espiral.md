## Ideia

Mantemos quatro fronteiras: `topo`, `base`, `esquerda` e `direita`. A cada volta, percorremos a borda superior da esquerda para a direita, a lateral direita de cima para baixo, a borda inferior da direita para a esquerda e a lateral esquerda de baixo para cima, encolhendo a fronteira correspondente depois de cada lado.

O cuidado está nas matrizes com uma única linha ou coluna restante: antes de percorrer a borda inferior e a lateral esquerda, verificamos se ainda sobram linhas e colunas, para não visitar elementos duas vezes.

## Complexidade

Tempo `O(m * n)`, pois cada célula é visitada uma vez. Espaço extra `O(1)`, além da lista de saída.

## Python

```python
def spiral_order(matrix):
    resultado = []
    if not matrix or not matrix[0]:
        return resultado
    topo, base = 0, len(matrix) - 1
    esquerda, direita = 0, len(matrix[0]) - 1
    while topo <= base and esquerda <= direita:
        for j in range(esquerda, direita + 1):
            resultado.append(matrix[topo][j])
        for i in range(topo + 1, base + 1):
            resultado.append(matrix[i][direita])
        if topo < base and esquerda < direita:
            for j in range(direita - 1, esquerda - 1, -1):
                resultado.append(matrix[base][j])
            for i in range(base - 1, topo, -1):
                resultado.append(matrix[i][esquerda])
        topo += 1
        base -= 1
        esquerda += 1
        direita -= 1
    return resultado
```

## JavaScript

```javascript
function spiralOrder(matrix) {
  const resultado = [];
  if (!matrix.length || !matrix[0].length) return resultado;
  let topo = 0;
  let base = matrix.length - 1;
  let esquerda = 0;
  let direita = matrix[0].length - 1;
  while (topo <= base && esquerda <= direita) {
    for (let j = esquerda; j <= direita; j++) resultado.push(matrix[topo][j]);
    for (let i = topo + 1; i <= base; i++) resultado.push(matrix[i][direita]);
    if (topo < base && esquerda < direita) {
      for (let j = direita - 1; j >= esquerda; j--) resultado.push(matrix[base][j]);
      for (let i = base - 1; i > topo; i--) resultado.push(matrix[i][esquerda]);
    }
    topo++;
    base--;
    esquerda++;
    direita--;
  }
  return resultado;
}
```

## TypeScript

```typescript
function spiralOrder(matrix: number[][]): number[] {
  const resultado: number[] = [];
  if (!matrix.length || !matrix[0].length) return resultado;
  let topo = 0;
  let base = matrix.length - 1;
  let esquerda = 0;
  let direita = matrix[0].length - 1;
  while (topo <= base && esquerda <= direita) {
    for (let j = esquerda; j <= direita; j++) resultado.push(matrix[topo][j]);
    for (let i = topo + 1; i <= base; i++) resultado.push(matrix[i][direita]);
    if (topo < base && esquerda < direita) {
      for (let j = direita - 1; j >= esquerda; j--) resultado.push(matrix[base][j]);
      for (let i = base - 1; i > topo; i--) resultado.push(matrix[i][esquerda]);
    }
    topo++;
    base--;
    esquerda++;
    direita--;
  }
  return resultado;
}
```

## Java

```java
class Solution {
    public int[] spiralOrder(int[][] matrix) {
        if (matrix.length == 0 || matrix[0].length == 0) return new int[0];
        int[] resultado = new int[matrix.length * matrix[0].length];
        int k = 0;
        int topo = 0, base = matrix.length - 1;
        int esquerda = 0, direita = matrix[0].length - 1;
        while (topo <= base && esquerda <= direita) {
            for (int j = esquerda; j <= direita; j++) resultado[k++] = matrix[topo][j];
            for (int i = topo + 1; i <= base; i++) resultado[k++] = matrix[i][direita];
            if (topo < base && esquerda < direita) {
                for (int j = direita - 1; j >= esquerda; j--) resultado[k++] = matrix[base][j];
                for (int i = base - 1; i > topo; i--) resultado[k++] = matrix[i][esquerda];
            }
            topo++;
            base--;
            esquerda++;
            direita--;
        }
        return resultado;
    }
}
```

## C++

```cpp
class Solution {
public:
    vector<int> spiralOrder(vector<vector<int>>& matrix) {
        vector<int> resultado;
        if (matrix.empty() || matrix[0].empty()) return resultado;
        int topo = 0, base = matrix.size() - 1;
        int esquerda = 0, direita = matrix[0].size() - 1;
        while (topo <= base && esquerda <= direita) {
            for (int j = esquerda; j <= direita; j++) resultado.push_back(matrix[topo][j]);
            for (int i = topo + 1; i <= base; i++) resultado.push_back(matrix[i][direita]);
            if (topo < base && esquerda < direita) {
                for (int j = direita - 1; j >= esquerda; j--) resultado.push_back(matrix[base][j]);
                for (int i = base - 1; i > topo; i--) resultado.push_back(matrix[i][esquerda]);
            }
            topo++;
            base--;
            esquerda++;
            direita--;
        }
        return resultado;
    }
};
```

## C#

```csharp
public class Solution {
    public int[] SpiralOrder(int[][] matrix) {
        var resultado = new List<int>();
        if (matrix.Length == 0 || matrix[0].Length == 0) return resultado.ToArray();
        int topo = 0, base_ = matrix.Length - 1;
        int esquerda = 0, direita = matrix[0].Length - 1;
        while (topo <= base_ && esquerda <= direita) {
            for (int j = esquerda; j <= direita; j++) resultado.Add(matrix[topo][j]);
            for (int i = topo + 1; i <= base_; i++) resultado.Add(matrix[i][direita]);
            if (topo < base_ && esquerda < direita) {
                for (int j = direita - 1; j >= esquerda; j--) resultado.Add(matrix[base_][j]);
                for (int i = base_ - 1; i > topo; i--) resultado.Add(matrix[i][esquerda]);
            }
            topo++;
            base_--;
            esquerda++;
            direita--;
        }
        return resultado.ToArray();
    }
}
```

## Go

```go
func spiralOrder(matrix [][]int) []int {
	resultado := []int{}
	if len(matrix) == 0 || len(matrix[0]) == 0 {
		return resultado
	}
	topo, base := 0, len(matrix)-1
	esquerda, direita := 0, len(matrix[0])-1
	for topo <= base && esquerda <= direita {
		for j := esquerda; j <= direita; j++ {
			resultado = append(resultado, matrix[topo][j])
		}
		for i := topo + 1; i <= base; i++ {
			resultado = append(resultado, matrix[i][direita])
		}
		if topo < base && esquerda < direita {
			for j := direita - 1; j >= esquerda; j-- {
				resultado = append(resultado, matrix[base][j])
			}
			for i := base - 1; i > topo; i-- {
				resultado = append(resultado, matrix[i][esquerda])
			}
		}
		topo++
		base--
		esquerda++
		direita--
	}
	return resultado
}
```
