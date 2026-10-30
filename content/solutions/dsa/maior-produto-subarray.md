## Ideia

Num produto, um valor negativo troca o papel do maior e do menor: o menor produto até agora, multiplicado por um negativo, pode virar o maior. Por isso, em cada posição guardamos dois valores para os trechos que terminam ali: o maior produto e o menor produto.

Ao ler `x`, os candidatos são `x` sozinho (recomeçar), `maior * x` e `menor * x`. O novo maior é o máximo dos três e o novo menor é o mínimo. A resposta é o maior valor de `maior` visto ao longo do caminho. Zeros funcionam naturalmente: zeram os dois e o próximo elemento recomeça o trecho.

## Complexidade

Tempo `O(n)`, espaço `O(1)`.

## Python

```python
def max_product(nums):
    maior = menor = melhor = nums[0]
    for x in nums[1:]:
        candidatos = (x, maior * x, menor * x)
        maior = max(candidatos)
        menor = min(candidatos)
        melhor = max(melhor, maior)
    return melhor
```

## JavaScript

```javascript
function maxProduct(nums) {
  let maior = nums[0];
  let menor = nums[0];
  let melhor = nums[0];
  for (let i = 1; i < nums.length; i++) {
    const x = nums[i];
    const candidatos = [x, maior * x, menor * x];
    maior = Math.max(...candidatos);
    menor = Math.min(...candidatos);
    melhor = Math.max(melhor, maior);
  }
  return melhor;
}
```

## TypeScript

```typescript
function maxProduct(nums: number[]): number {
  let maior = nums[0];
  let menor = nums[0];
  let melhor = nums[0];
  for (let i = 1; i < nums.length; i++) {
    const x = nums[i];
    const candidatos = [x, maior * x, menor * x];
    maior = Math.max(...candidatos);
    menor = Math.min(...candidatos);
    melhor = Math.max(melhor, maior);
  }
  return melhor;
}
```

## Java

```java
class Solution {
    public int maxProduct(int[] nums) {
        int maior = nums[0], menor = nums[0], melhor = nums[0];
        for (int i = 1; i < nums.length; i++) {
            int x = nums[i];
            int a = maior * x, b = menor * x;
            maior = Math.max(x, Math.max(a, b));
            menor = Math.min(x, Math.min(a, b));
            melhor = Math.max(melhor, maior);
        }
        return melhor;
    }
}
```

## C++

```cpp
class Solution {
public:
    int maxProduct(vector<int>& nums) {
        int maior = nums[0], menor = nums[0], melhor = nums[0];
        for (int i = 1; i < (int)nums.size(); i++) {
            int x = nums[i];
            int a = maior * x, b = menor * x;
            maior = max({x, a, b});
            menor = min({x, a, b});
            melhor = max(melhor, maior);
        }
        return melhor;
    }
};
```

## C#

```csharp
public class Solution {
    public int MaxProduct(int[] nums) {
        int maior = nums[0], menor = nums[0], melhor = nums[0];
        for (int i = 1; i < nums.Length; i++) {
            int x = nums[i];
            int a = maior * x, b = menor * x;
            maior = Math.Max(x, Math.Max(a, b));
            menor = Math.Min(x, Math.Min(a, b));
            melhor = Math.Max(melhor, maior);
        }
        return melhor;
    }
}
```

## Go

```go
func maxProduct(nums []int) int {
	maior, menor, melhor := nums[0], nums[0], nums[0]
	for _, x := range nums[1:] {
		a, b := maior*x, menor*x
		maior = max(x, max(a, b))
		menor = min(x, min(a, b))
		melhor = max(melhor, maior)
	}
	return melhor
}
```
