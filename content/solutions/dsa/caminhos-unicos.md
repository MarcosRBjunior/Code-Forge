## Ideia

Só se chega a uma célula vindo de cima ou da esquerda, então o número de caminhos até ela é a soma dos números de caminhos dessas duas vizinhas. A primeira linha e a primeira coluna têm exatamente um caminho cada.

Basta manter uma linha de contagens, inicializada com `1`. Para cada linha seguinte, `caminhos[j] += caminhos[j - 1]`: o valor antigo de `caminhos[j]` é o que vem de cima e `caminhos[j - 1]` já é o que vem da esquerda.

## Complexidade

Tempo `O(m * n)`. Espaço `O(n)`.

## Python

```python
def unique_paths(m, n):
    caminhos = [1] * n
    for _ in range(1, m):
        for j in range(1, n):
            caminhos[j] += caminhos[j - 1]
    return caminhos[-1]
```

## JavaScript

```javascript
function uniquePaths(m, n) {
  const caminhos = new Array(n).fill(1);
  for (let i = 1; i < m; i++) {
    for (let j = 1; j < n; j++) {
      caminhos[j] += caminhos[j - 1];
    }
  }
  return caminhos[n - 1];
}
```

## TypeScript

```typescript
function uniquePaths(m: number, n: number): number {
  const caminhos: number[] = new Array(n).fill(1);
  for (let i = 1; i < m; i++) {
    for (let j = 1; j < n; j++) {
      caminhos[j] += caminhos[j - 1];
    }
  }
  return caminhos[n - 1];
}
```

## Java

```java
class Solution {
    public int uniquePaths(int m, int n) {
        int[] caminhos = new int[n];
        Arrays.fill(caminhos, 1);
        for (int i = 1; i < m; i++) {
            for (int j = 1; j < n; j++) {
                caminhos[j] += caminhos[j - 1];
            }
        }
        return caminhos[n - 1];
    }
}
```

## C++

```cpp
class Solution {
public:
    int uniquePaths(int m, int n) {
        vector<int> caminhos(n, 1);
        for (int i = 1; i < m; i++) {
            for (int j = 1; j < n; j++) {
                caminhos[j] += caminhos[j - 1];
            }
        }
        return caminhos[n - 1];
    }
};
```

## C#

```csharp
public class Solution {
    public int UniquePaths(int m, int n) {
        var caminhos = new int[n];
        Array.Fill(caminhos, 1);
        for (int i = 1; i < m; i++) {
            for (int j = 1; j < n; j++) {
                caminhos[j] += caminhos[j - 1];
            }
        }
        return caminhos[n - 1];
    }
}
```

## Go

```go
func uniquePaths(m int, n int) int {
	caminhos := make([]int, n)
	for j := range caminhos {
		caminhos[j] = 1
	}
	for i := 1; i < m; i++ {
		for j := 1; j < n; j++ {
			caminhos[j] += caminhos[j-1]
		}
	}
	return caminhos[n-1]
}
```
