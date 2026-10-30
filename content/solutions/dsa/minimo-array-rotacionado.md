## Ideia

Em um array crescente rotacionado, o mínimo é o ponto em que a sequência "quebra". Compare o elemento do meio com o último do intervalo atual: se o meio é maior, a quebra (e portanto o mínimo) está estritamente à direita do meio; se o meio é menor ou igual, o trecho do meio até o fim está em ordem, então o mínimo é o próprio meio ou fica à esquerda dele.

Descartar metade do intervalo a cada passo, sem nunca perder o mínimo, leva a uma busca binária que termina quando os limites se encontram.

## Complexidade

Tempo O(log n). Espaço O(1).

## Python

```python
def find_min(nums):
    esq, dir_ = 0, len(nums) - 1
    while esq < dir_:
        meio = (esq + dir_) // 2
        if nums[meio] > nums[dir_]:
            esq = meio + 1
        else:
            dir_ = meio
    return nums[esq]
```

## JavaScript

```javascript
function findMin(nums) {
  let esq = 0, dir = nums.length - 1;
  while (esq < dir) {
    const meio = Math.floor((esq + dir) / 2);
    if (nums[meio] > nums[dir]) esq = meio + 1;
    else dir = meio;
  }
  return nums[esq];
}
```

## TypeScript

```typescript
function findMin(nums: number[]): number {
  let esq = 0, dir = nums.length - 1;
  while (esq < dir) {
    const meio = Math.floor((esq + dir) / 2);
    if (nums[meio] > nums[dir]) esq = meio + 1;
    else dir = meio;
  }
  return nums[esq];
}
```

## Java

```java
class Solution {
    public int findMin(int[] nums) {
        int esq = 0, dir = nums.length - 1;
        while (esq < dir) {
            int meio = (esq + dir) / 2;
            if (nums[meio] > nums[dir]) esq = meio + 1;
            else dir = meio;
        }
        return nums[esq];
    }
}
```

## C++

```cpp
class Solution {
public:
    int findMin(vector<int>& nums) {
        int esq = 0, dir = (int)nums.size() - 1;
        while (esq < dir) {
            int meio = (esq + dir) / 2;
            if (nums[meio] > nums[dir]) esq = meio + 1;
            else dir = meio;
        }
        return nums[esq];
    }
};
```

## C#

```csharp
public class Solution {
    public int FindMin(int[] nums) {
        int esq = 0, dir = nums.Length - 1;
        while (esq < dir) {
            int meio = (esq + dir) / 2;
            if (nums[meio] > nums[dir]) esq = meio + 1;
            else dir = meio;
        }
        return nums[esq];
    }
}
```

## Go

```go
func findMin(nums []int) int {
	esq, dir := 0, len(nums)-1
	for esq < dir {
		meio := (esq + dir) / 2
		if nums[meio] > nums[dir] {
			esq = meio + 1
		} else {
			dir = meio
		}
	}
	return nums[esq]
}
```
