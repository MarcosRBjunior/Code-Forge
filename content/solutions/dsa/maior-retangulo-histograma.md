## Ideia

Cada barra pode ser a mais baixa de algum retângulo: esse retângulo se estende para os dois lados enquanto as barras vizinhas forem pelo menos tão altas. Para achar esses limites de forma eficiente, usamos uma pilha de índices com alturas estritamente crescentes.

Ao ler uma barra menor que o topo da pilha, o topo não pode mais se estender para a direita: desempilhamos e calculamos a área dele, com altura igual à dele e largura entre o novo topo da pilha (limite esquerdo) e o índice atual (limite direito). Um sentinela de altura 0 no final força o esvaziamento da pilha. Cada índice entra e sai uma vez.

## Complexidade

Tempo `O(n)`, espaço `O(n)` para a pilha.

## Python

```python
def largest_rectangle_area(heights):
    pilha = []  # índices com alturas crescentes
    melhor = 0
    for i, h in enumerate(heights + [0]):
        while pilha and heights[pilha[-1]] > h:
            altura = heights[pilha.pop()]
            esquerda = pilha[-1] if pilha else -1
            melhor = max(melhor, altura * (i - esquerda - 1))
        pilha.append(i)
    return melhor
```

## JavaScript

```javascript
function largestRectangleArea(heights) {
  const pilha = [];
  let melhor = 0;
  const n = heights.length;
  for (let i = 0; i <= n; i++) {
    const h = i === n ? 0 : heights[i];
    while (pilha.length && heights[pilha[pilha.length - 1]] > h) {
      const altura = heights[pilha.pop()];
      const esquerda = pilha.length ? pilha[pilha.length - 1] : -1;
      melhor = Math.max(melhor, altura * (i - esquerda - 1));
    }
    pilha.push(i);
  }
  return melhor;
}
```

## TypeScript

```typescript
function largestRectangleArea(heights: number[]): number {
  const pilha: number[] = [];
  let melhor = 0;
  const n = heights.length;
  for (let i = 0; i <= n; i++) {
    const h = i === n ? 0 : heights[i];
    while (pilha.length && heights[pilha[pilha.length - 1]] > h) {
      const altura = heights[pilha.pop() as number];
      const esquerda = pilha.length ? pilha[pilha.length - 1] : -1;
      melhor = Math.max(melhor, altura * (i - esquerda - 1));
    }
    pilha.push(i);
  }
  return melhor;
}
```

## Java

```java
class Solution {
    public int largestRectangleArea(int[] heights) {
        Deque<Integer> pilha = new ArrayDeque<>();
        int melhor = 0, n = heights.length;
        for (int i = 0; i <= n; i++) {
            int h = i == n ? 0 : heights[i];
            while (!pilha.isEmpty() && heights[pilha.peek()] > h) {
                int altura = heights[pilha.pop()];
                int esquerda = pilha.isEmpty() ? -1 : pilha.peek();
                melhor = Math.max(melhor, altura * (i - esquerda - 1));
            }
            pilha.push(i);
        }
        return melhor;
    }
}
```

## C++

```cpp
class Solution {
public:
    int largestRectangleArea(vector<int>& heights) {
        vector<int> pilha;
        int melhor = 0, n = heights.size();
        for (int i = 0; i <= n; i++) {
            int h = i == n ? 0 : heights[i];
            while (!pilha.empty() && heights[pilha.back()] > h) {
                int altura = heights[pilha.back()];
                pilha.pop_back();
                int esquerda = pilha.empty() ? -1 : pilha.back();
                melhor = max(melhor, altura * (i - esquerda - 1));
            }
            pilha.push_back(i);
        }
        return melhor;
    }
};
```

## C#

```csharp
public class Solution {
    public int LargestRectangleArea(int[] heights) {
        var pilha = new Stack<int>();
        int melhor = 0, n = heights.Length;
        for (int i = 0; i <= n; i++) {
            int h = i == n ? 0 : heights[i];
            while (pilha.Count > 0 && heights[pilha.Peek()] > h) {
                int altura = heights[pilha.Pop()];
                int esquerda = pilha.Count == 0 ? -1 : pilha.Peek();
                melhor = Math.Max(melhor, altura * (i - esquerda - 1));
            }
            pilha.Push(i);
        }
        return melhor;
    }
}
```

## Go

```go
func largestRectangleArea(heights []int) int {
	pilha := []int{}
	melhor := 0
	n := len(heights)
	for i := 0; i <= n; i++ {
		h := 0
		if i < n {
			h = heights[i]
		}
		for len(pilha) > 0 && heights[pilha[len(pilha)-1]] > h {
			altura := heights[pilha[len(pilha)-1]]
			pilha = pilha[:len(pilha)-1]
			esquerda := -1
			if len(pilha) > 0 {
				esquerda = pilha[len(pilha)-1]
			}
			if area := altura * (i - esquerda - 1); area > melhor {
				melhor = area
			}
		}
		pilha = append(pilha, i)
	}
	return melhor
}
```
