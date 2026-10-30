## Ideia

Calcule a soma total do array uma vez. Ao percorrer da esquerda para a direita mantendo a soma dos elementos já vistos (`esquerda`), a soma à direita do índice `i` é `total - esquerda - nums[i]`, sem precisar de outro laço.

O índice `i` é pivô quando `esquerda == total - esquerda - nums[i]`. Como o percorrido é da esquerda para a direita, o primeiro pivô encontrado já é o mais à esquerda.

## Complexidade

Tempo O(n), com duas passagens simples pelo array. Espaço O(1).

## Python

```python
def pivot_index(nums):
    total = sum(nums)
    esquerda = 0
    for i, x in enumerate(nums):
        if esquerda == total - esquerda - x:
            return i
        esquerda += x
    return -1
```

## JavaScript

```javascript
function pivotIndex(nums) {
  const total = nums.reduce((soma, x) => soma + x, 0);
  let esquerda = 0;
  for (let i = 0; i < nums.length; i++) {
    if (esquerda === total - esquerda - nums[i]) return i;
    esquerda += nums[i];
  }
  return -1;
}
```

## TypeScript

```typescript
function pivotIndex(nums: number[]): number {
  const total = nums.reduce((soma, x) => soma + x, 0);
  let esquerda = 0;
  for (let i = 0; i < nums.length; i++) {
    if (esquerda === total - esquerda - nums[i]) return i;
    esquerda += nums[i];
  }
  return -1;
}
```

## Java

```java
class Solution {
    public int pivotIndex(int[] nums) {
        int total = 0;
        for (int x : nums) total += x;
        int esquerda = 0;
        for (int i = 0; i < nums.length; i++) {
            if (esquerda == total - esquerda - nums[i]) return i;
            esquerda += nums[i];
        }
        return -1;
    }
}
```

## C++

```cpp
class Solution {
public:
    int pivotIndex(vector<int>& nums) {
        int total = accumulate(nums.begin(), nums.end(), 0);
        int esquerda = 0;
        for (int i = 0; i < (int)nums.size(); i++) {
            if (esquerda == total - esquerda - nums[i]) return i;
            esquerda += nums[i];
        }
        return -1;
    }
};
```

## C#

```csharp
public class Solution {
    public int PivotIndex(int[] nums) {
        int total = nums.Sum();
        int esquerda = 0;
        for (int i = 0; i < nums.Length; i++) {
            if (esquerda == total - esquerda - nums[i]) return i;
            esquerda += nums[i];
        }
        return -1;
    }
}
```

## Go

```go
func pivotIndex(nums []int) int {
	total := 0
	for _, x := range nums {
		total += x
	}
	esquerda := 0
	for i, x := range nums {
		if esquerda == total-esquerda-x {
			return i
		}
		esquerda += x
	}
	return -1
}
```
