## Ideia

Não precisamos testar caminhos: basta acompanhar o índice mais distante que conseguimos alcançar. Para cada posição `i`, se ela está além desse alcance, o caminho foi cortado por um zero e a resposta é falsa. Caso contrário, atualizamos o alcance com `i + nums[i]`.

Isso funciona porque o conjunto de posições alcançáveis é sempre um intervalo contínuo começando em 0: se dá para chegar a um índice, dá para chegar a qualquer um antes dele saltando menos. Se o alcance cobre o último índice em algum momento, a resposta é verdadeira.

## Complexidade

Tempo O(n), com uma passagem. Espaço O(1).

## Python

```python
def can_jump(nums):
    alcance = 0
    for i, salto in enumerate(nums):
        if i > alcance:
            return False
        alcance = max(alcance, i + salto)
    return True
```

## JavaScript

```javascript
function canJump(nums) {
  let alcance = 0;
  for (let i = 0; i < nums.length; i++) {
    if (i > alcance) return false;
    alcance = Math.max(alcance, i + nums[i]);
  }
  return true;
}
```

## TypeScript

```typescript
function canJump(nums: number[]): boolean {
  let alcance = 0;
  for (let i = 0; i < nums.length; i++) {
    if (i > alcance) return false;
    alcance = Math.max(alcance, i + nums[i]);
  }
  return true;
}
```

## Java

```java
class Solution {
    public boolean canJump(int[] nums) {
        int alcance = 0;
        for (int i = 0; i < nums.length; i++) {
            if (i > alcance) return false;
            alcance = Math.max(alcance, i + nums[i]);
        }
        return true;
    }
}
```

## C++

```cpp
class Solution {
public:
    bool canJump(vector<int>& nums) {
        int alcance = 0;
        for (int i = 0; i < (int)nums.size(); i++) {
            if (i > alcance) return false;
            alcance = max(alcance, i + nums[i]);
        }
        return true;
    }
};
```

## C#

```csharp
public class Solution {
    public bool CanJump(int[] nums) {
        int alcance = 0;
        for (int i = 0; i < nums.Length; i++) {
            if (i > alcance) return false;
            alcance = Math.Max(alcance, i + nums[i]);
        }
        return true;
    }
}
```

## Go

```go
func canJump(nums []int) bool {
	alcance := 0
	for i, salto := range nums {
		if i > alcance {
			return false
		}
		if i+salto > alcance {
			alcance = i + salto
		}
	}
	return true
}
```
