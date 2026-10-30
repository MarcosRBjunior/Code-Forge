## Ideia

A água sobre a posição `i` tem altura igual ao menor entre a maior barra à esquerda e a maior barra à direita, menos a altura da própria barra. Calcular os dois máximos para cada posição custaria `O(n²)`, mas dá para fazer com dois ponteiros.

Mantenha um ponteiro em cada ponta e o maior valor visto de cada lado. Avance sempre o lado cujo máximo é menor: para esse lado, o limite verdadeiro é o seu próprio máximo, porque o outro lado já tem uma barra pelo menos igual a ele. Então a água naquela posição é o máximo do lado menos a altura atual, e o ponteiro anda.

## Complexidade

Tempo `O(n)`, cada posição é visitada uma vez. Espaço `O(1)`.

## Python

```python
def trap(height):
    esq, dir = 0, len(height) - 1
    max_esq = max_dir = 0
    total = 0
    while esq < dir:
        if height[esq] < height[dir]:
            max_esq = max(max_esq, height[esq])
            total += max_esq - height[esq]
            esq += 1
        else:
            max_dir = max(max_dir, height[dir])
            total += max_dir - height[dir]
            dir -= 1
    return total
```

## JavaScript

```javascript
function trap(height) {
  let esq = 0;
  let dir = height.length - 1;
  let maxEsq = 0;
  let maxDir = 0;
  let total = 0;
  while (esq < dir) {
    if (height[esq] < height[dir]) {
      maxEsq = Math.max(maxEsq, height[esq]);
      total += maxEsq - height[esq];
      esq++;
    } else {
      maxDir = Math.max(maxDir, height[dir]);
      total += maxDir - height[dir];
      dir--;
    }
  }
  return total;
}
```

## TypeScript

```typescript
function trap(height: number[]): number {
  let esq = 0;
  let dir = height.length - 1;
  let maxEsq = 0;
  let maxDir = 0;
  let total = 0;
  while (esq < dir) {
    if (height[esq] < height[dir]) {
      maxEsq = Math.max(maxEsq, height[esq]);
      total += maxEsq - height[esq];
      esq++;
    } else {
      maxDir = Math.max(maxDir, height[dir]);
      total += maxDir - height[dir];
      dir--;
    }
  }
  return total;
}
```

## Java

```java
class Solution {
    public int trap(int[] height) {
        int esq = 0, dir = height.length - 1;
        int maxEsq = 0, maxDir = 0;
        int total = 0;
        while (esq < dir) {
            if (height[esq] < height[dir]) {
                maxEsq = Math.max(maxEsq, height[esq]);
                total += maxEsq - height[esq];
                esq++;
            } else {
                maxDir = Math.max(maxDir, height[dir]);
                total += maxDir - height[dir];
                dir--;
            }
        }
        return total;
    }
}
```

## C++

```cpp
class Solution {
public:
    int trap(vector<int>& height) {
        int esq = 0, dir = (int)height.size() - 1;
        int maxEsq = 0, maxDir = 0;
        int total = 0;
        while (esq < dir) {
            if (height[esq] < height[dir]) {
                maxEsq = max(maxEsq, height[esq]);
                total += maxEsq - height[esq];
                esq++;
            } else {
                maxDir = max(maxDir, height[dir]);
                total += maxDir - height[dir];
                dir--;
            }
        }
        return total;
    }
};
```

## C#

```csharp
public class Solution {
    public int Trap(int[] height) {
        int esq = 0, dir = height.Length - 1;
        int maxEsq = 0, maxDir = 0;
        int total = 0;
        while (esq < dir) {
            if (height[esq] < height[dir]) {
                maxEsq = Math.Max(maxEsq, height[esq]);
                total += maxEsq - height[esq];
                esq++;
            } else {
                maxDir = Math.Max(maxDir, height[dir]);
                total += maxDir - height[dir];
                dir--;
            }
        }
        return total;
    }
}
```

## Go

```go
func trap(height []int) int {
	esq, dir := 0, len(height)-1
	maxEsq, maxDir := 0, 0
	total := 0
	for esq < dir {
		if height[esq] < height[dir] {
			maxEsq = max(maxEsq, height[esq])
			total += maxEsq - height[esq]
			esq++
		} else {
			maxDir = max(maxDir, height[dir])
			total += maxDir - height[dir]
			dir--
		}
	}
	return total
}
```
