## Ideia

A água entre duas linhas é a distância entre elas vezes a menor das duas alturas. Comece com os dois ponteiros nas pontas, que dão a maior largura possível, e calcule a área.

Depois mova o ponteiro da linha mais baixa para dentro. Mover a mais alta nunca ajuda: a largura diminui e a altura continua limitada pela linha baixa. Já mover a baixa abre a chance de encontrar uma linha maior. Assim nenhuma combinação promissora é descartada e basta uma passada.

## Complexidade

Tempo O(n), pois os ponteiros só andam para dentro. Espaço O(1).

## Python

```python
def max_area(height):
    esq, dir = 0, len(height) - 1
    melhor = 0
    while esq < dir:
        area = (dir - esq) * min(height[esq], height[dir])
        melhor = max(melhor, area)
        if height[esq] < height[dir]:
            esq += 1
        else:
            dir -= 1
    return melhor
```

## JavaScript

```javascript
function maxArea(height) {
  let esq = 0;
  let dir = height.length - 1;
  let melhor = 0;
  while (esq < dir) {
    const area = (dir - esq) * Math.min(height[esq], height[dir]);
    melhor = Math.max(melhor, area);
    if (height[esq] < height[dir]) esq++;
    else dir--;
  }
  return melhor;
}
```

## TypeScript

```typescript
function maxArea(height: number[]): number {
  let esq = 0;
  let dir = height.length - 1;
  let melhor = 0;
  while (esq < dir) {
    const area = (dir - esq) * Math.min(height[esq], height[dir]);
    melhor = Math.max(melhor, area);
    if (height[esq] < height[dir]) esq++;
    else dir--;
  }
  return melhor;
}
```

## Java

```java
class Solution {
    public int maxArea(int[] height) {
        int esq = 0, dir = height.length - 1, melhor = 0;
        while (esq < dir) {
            int area = (dir - esq) * Math.min(height[esq], height[dir]);
            melhor = Math.max(melhor, area);
            if (height[esq] < height[dir]) esq++;
            else dir--;
        }
        return melhor;
    }
}
```

## C++

```cpp
class Solution {
public:
    int maxArea(vector<int>& height) {
        int esq = 0, dir = (int)height.size() - 1, melhor = 0;
        while (esq < dir) {
            int area = (dir - esq) * min(height[esq], height[dir]);
            melhor = max(melhor, area);
            if (height[esq] < height[dir]) esq++;
            else dir--;
        }
        return melhor;
    }
};
```

## C#

```csharp
public class Solution {
    public int MaxArea(int[] height) {
        int esq = 0, dir = height.Length - 1, melhor = 0;
        while (esq < dir) {
            int area = (dir - esq) * Math.Min(height[esq], height[dir]);
            melhor = Math.Max(melhor, area);
            if (height[esq] < height[dir]) esq++;
            else dir--;
        }
        return melhor;
    }
}
```

## Go

```go
func maxArea(height []int) int {
	esq, dir, melhor := 0, len(height)-1, 0
	for esq < dir {
		h := height[esq]
		if height[dir] < h {
			h = height[dir]
		}
		if area := (dir - esq) * h; area > melhor {
			melhor = area
		}
		if height[esq] < height[dir] {
			esq++
		} else {
			dir--
		}
	}
	return melhor
}
```
