## Ideia

Mantenha uma pilha com os índices que ainda esperam por um elemento maior à direita. Ao ler `nums[i]`, enquanto o topo da pilha apontar para um valor menor que `nums[i]`, esse valor encontrou o seu próximo maior: grave `nums[i]` na resposta daquele índice e desempilhe.

Depois, empilhe `i`. Os índices que sobram na pilha no final não têm nenhum maior à direita e ficam com `-1`. Cada índice entra e sai da pilha no máximo uma vez.

## Complexidade

Tempo O(n), pelo argumento de que cada índice é empilhado e desempilhado uma vez. Espaço O(n) para a pilha e a resposta.

## Python

```python
def next_greater(nums):
    resposta = [-1] * len(nums)
    pilha = []  # índices aguardando um maior
    for i, x in enumerate(nums):
        while pilha and nums[pilha[-1]] < x:
            resposta[pilha.pop()] = x
        pilha.append(i)
    return resposta
```

## JavaScript

```javascript
function nextGreater(nums) {
  const resposta = new Array(nums.length).fill(-1);
  const pilha = [];
  for (let i = 0; i < nums.length; i++) {
    while (pilha.length && nums[pilha[pilha.length - 1]] < nums[i]) {
      resposta[pilha.pop()] = nums[i];
    }
    pilha.push(i);
  }
  return resposta;
}
```

## TypeScript

```typescript
function nextGreater(nums: number[]): number[] {
  const resposta: number[] = new Array(nums.length).fill(-1);
  const pilha: number[] = [];
  for (let i = 0; i < nums.length; i++) {
    while (pilha.length && nums[pilha[pilha.length - 1]] < nums[i]) {
      resposta[pilha.pop()!] = nums[i];
    }
    pilha.push(i);
  }
  return resposta;
}
```

## Java

```java
class Solution {
    public int[] nextGreater(int[] nums) {
        int[] resposta = new int[nums.length];
        Arrays.fill(resposta, -1);
        Deque<Integer> pilha = new ArrayDeque<>();
        for (int i = 0; i < nums.length; i++) {
            while (!pilha.isEmpty() && nums[pilha.peek()] < nums[i]) {
                resposta[pilha.pop()] = nums[i];
            }
            pilha.push(i);
        }
        return resposta;
    }
}
```

## C++

```cpp
class Solution {
public:
    vector<int> nextGreater(vector<int>& nums) {
        vector<int> resposta(nums.size(), -1);
        stack<int> pilha;
        for (int i = 0; i < (int)nums.size(); i++) {
            while (!pilha.empty() && nums[pilha.top()] < nums[i]) {
                resposta[pilha.top()] = nums[i];
                pilha.pop();
            }
            pilha.push(i);
        }
        return resposta;
    }
};
```

## C#

```csharp
public class Solution {
    public int[] NextGreater(int[] nums) {
        var resposta = new int[nums.Length];
        Array.Fill(resposta, -1);
        var pilha = new Stack<int>();
        for (int i = 0; i < nums.Length; i++) {
            while (pilha.Count > 0 && nums[pilha.Peek()] < nums[i]) {
                resposta[pilha.Pop()] = nums[i];
            }
            pilha.Push(i);
        }
        return resposta;
    }
}
```

## Go

```go
func nextGreater(nums []int) []int {
	resposta := make([]int, len(nums))
	for i := range resposta {
		resposta[i] = -1
	}
	pilha := []int{}
	for i, x := range nums {
		for len(pilha) > 0 && nums[pilha[len(pilha)-1]] < x {
			resposta[pilha[len(pilha)-1]] = x
			pilha = pilha[:len(pilha)-1]
		}
		pilha = append(pilha, i)
	}
	return resposta
}
```
