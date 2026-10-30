## Ideia

Em cada posição, o melhor trecho que termina ali é o próprio elemento ou o melhor trecho que terminava na posição anterior estendido por ele. Se o acumulado anterior for negativo, ele só atrapalha, então descartamos e recomeçamos no elemento atual.

Basta guardar o melhor acumulado que termina na posição atual e o melhor valor visto até agora. Inicializar com o primeiro elemento (e não com zero) garante o resultado correto quando todos os números são negativos.

## Complexidade

Tempo `O(n)`, espaço `O(1)`.

## Python

```python
def max_sub_array(nums):
    atual = melhor = nums[0]
    for x in nums[1:]:
        atual = max(x, atual + x)
        melhor = max(melhor, atual)
    return melhor
```

## JavaScript

```javascript
function maxSubArray(nums) {
  let atual = nums[0];
  let melhor = nums[0];
  for (let i = 1; i < nums.length; i++) {
    atual = Math.max(nums[i], atual + nums[i]);
    melhor = Math.max(melhor, atual);
  }
  return melhor;
}
```

## TypeScript

```typescript
function maxSubArray(nums: number[]): number {
  let atual = nums[0];
  let melhor = nums[0];
  for (let i = 1; i < nums.length; i++) {
    atual = Math.max(nums[i], atual + nums[i]);
    melhor = Math.max(melhor, atual);
  }
  return melhor;
}
```

## Java

```java
class Solution {
    public int maxSubArray(int[] nums) {
        int atual = nums[0], melhor = nums[0];
        for (int i = 1; i < nums.length; i++) {
            atual = Math.max(nums[i], atual + nums[i]);
            melhor = Math.max(melhor, atual);
        }
        return melhor;
    }
}
```

## C++

```cpp
class Solution {
public:
    int maxSubArray(vector<int>& nums) {
        int atual = nums[0], melhor = nums[0];
        for (int i = 1; i < (int)nums.size(); i++) {
            atual = max(nums[i], atual + nums[i]);
            melhor = max(melhor, atual);
        }
        return melhor;
    }
};
```

## C#

```csharp
public class Solution {
    public int MaxSubArray(int[] nums) {
        int atual = nums[0], melhor = nums[0];
        for (int i = 1; i < nums.Length; i++) {
            atual = Math.Max(nums[i], atual + nums[i]);
            melhor = Math.Max(melhor, atual);
        }
        return melhor;
    }
}
```

## Go

```go
func maxSubArray(nums []int) int {
	atual, melhor := nums[0], nums[0]
	for _, x := range nums[1:] {
		atual = max(x, atual+x)
		melhor = max(melhor, atual)
	}
	return melhor
}
```
