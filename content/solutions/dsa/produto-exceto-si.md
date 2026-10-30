## Ideia

O produto de todos os elementos exceto `nums[i]` é o produto de tudo à esquerda de `i` vezes o produto de tudo à direita. Isso dispensa a divisão, que falharia com zeros.

Faça duas passadas sobre o mesmo array de resposta. Na ida, guarde em `resposta[i]` o produto dos elementos anteriores a `i`. Na volta, mantenha um acumulador com o produto dos elementos posteriores e multiplique-o em cada posição.

## Complexidade

Tempo O(n), com duas passadas. Espaço O(1) extra, sem contar o array de resposta.

## Python

```python
def product_except_self(nums):
    n = len(nums)
    resposta = [1] * n
    esquerda = 1
    for i in range(n):
        resposta[i] = esquerda
        esquerda *= nums[i]
    direita = 1
    for i in range(n - 1, -1, -1):
        resposta[i] *= direita
        direita *= nums[i]
    return resposta
```

## JavaScript

```javascript
function productExceptSelf(nums) {
  const n = nums.length;
  const resposta = new Array(n).fill(1);
  let esquerda = 1;
  for (let i = 0; i < n; i++) {
    resposta[i] = esquerda;
    esquerda *= nums[i];
  }
  let direita = 1;
  for (let i = n - 1; i >= 0; i--) {
    resposta[i] *= direita;
    direita *= nums[i];
  }
  return resposta;
}
```

## TypeScript

```typescript
function productExceptSelf(nums: number[]): number[] {
  const n = nums.length;
  const resposta: number[] = new Array(n).fill(1);
  let esquerda = 1;
  for (let i = 0; i < n; i++) {
    resposta[i] = esquerda;
    esquerda *= nums[i];
  }
  let direita = 1;
  for (let i = n - 1; i >= 0; i--) {
    resposta[i] *= direita;
    direita *= nums[i];
  }
  return resposta;
}
```

## Java

```java
class Solution {
    public int[] productExceptSelf(int[] nums) {
        int n = nums.length;
        int[] resposta = new int[n];
        int esquerda = 1;
        for (int i = 0; i < n; i++) {
            resposta[i] = esquerda;
            esquerda *= nums[i];
        }
        int direita = 1;
        for (int i = n - 1; i >= 0; i--) {
            resposta[i] *= direita;
            direita *= nums[i];
        }
        return resposta;
    }
}
```

## C++

```cpp
class Solution {
public:
    vector<int> productExceptSelf(vector<int>& nums) {
        int n = nums.size();
        vector<int> resposta(n, 1);
        int esquerda = 1;
        for (int i = 0; i < n; i++) {
            resposta[i] = esquerda;
            esquerda *= nums[i];
        }
        int direita = 1;
        for (int i = n - 1; i >= 0; i--) {
            resposta[i] *= direita;
            direita *= nums[i];
        }
        return resposta;
    }
};
```

## C#

```csharp
public class Solution {
    public int[] ProductExceptSelf(int[] nums) {
        int n = nums.Length;
        var resposta = new int[n];
        int esquerda = 1;
        for (int i = 0; i < n; i++) {
            resposta[i] = esquerda;
            esquerda *= nums[i];
        }
        int direita = 1;
        for (int i = n - 1; i >= 0; i--) {
            resposta[i] *= direita;
            direita *= nums[i];
        }
        return resposta;
    }
}
```

## Go

```go
func productExceptSelf(nums []int) []int {
	n := len(nums)
	resposta := make([]int, n)
	esquerda := 1
	for i := 0; i < n; i++ {
		resposta[i] = esquerda
		esquerda *= nums[i]
	}
	direita := 1
	for i := n - 1; i >= 0; i-- {
		resposta[i] *= direita
		direita *= nums[i]
	}
	return resposta
}
```
