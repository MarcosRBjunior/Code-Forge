## Ideia

Faça o XOR de todos os índices de `0` a `n` com todos os valores do array. Cada número presente aparece duas vezes (uma como índice, outra como valor) e se cancela, pois `x ^ x = 0`. Só o número ausente aparece uma vez, e ele sobra no resultado.

Uma alternativa equivalente é calcular a soma esperada `n * (n + 1) / 2` e subtrair a soma real dos elementos.

## Complexidade

Tempo O(n), uma passada. Espaço O(1).

## Python

```python
def missing_number(nums):
    resultado = len(nums)
    for i, x in enumerate(nums):
        resultado ^= i ^ x
    return resultado
```

## JavaScript

```javascript
function missingNumber(nums) {
  let resultado = nums.length;
  for (let i = 0; i < nums.length; i++) resultado ^= i ^ nums[i];
  return resultado;
}
```

## TypeScript

```typescript
function missingNumber(nums: number[]): number {
  let resultado = nums.length;
  for (let i = 0; i < nums.length; i++) resultado ^= i ^ nums[i];
  return resultado;
}
```

## Java

```java
class Solution {
    public int missingNumber(int[] nums) {
        int resultado = nums.length;
        for (int i = 0; i < nums.length; i++) resultado ^= i ^ nums[i];
        return resultado;
    }
}
```

## C++

```cpp
class Solution {
public:
    int missingNumber(vector<int>& nums) {
        int resultado = nums.size();
        for (int i = 0; i < (int)nums.size(); i++) resultado ^= i ^ nums[i];
        return resultado;
    }
};
```

## C#

```csharp
public class Solution {
    public int MissingNumber(int[] nums) {
        int resultado = nums.Length;
        for (int i = 0; i < nums.Length; i++) resultado ^= i ^ nums[i];
        return resultado;
    }
}
```

## Go

```go
func missingNumber(nums []int) int {
	resultado := len(nums)
	for i, x := range nums {
		resultado ^= i ^ x
	}
	return resultado
}
```
