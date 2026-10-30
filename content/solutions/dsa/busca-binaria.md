## Ideia

Como o array está ordenado, olhar o elemento do meio do intervalo atual já diz de que lado o alvo pode estar. Se o elemento do meio é menor que `target`, tudo à esquerda dele também é menor e pode ser descartado; se é maior, descarta-se a direita.

Repetindo isso, o intervalo `[lo, hi]` encolhe pela metade a cada passo até achar o valor ou esvaziar (`lo > hi`), caso em que o alvo não existe e a resposta é `-1`.

## Complexidade

Tempo `O(log n)`. Espaço `O(1)`.

## Python

```python
def search(nums, target):
    lo, hi = 0, len(nums) - 1
    while lo <= hi:
        meio = (lo + hi) // 2
        if nums[meio] == target:
            return meio
        if nums[meio] < target:
            lo = meio + 1
        else:
            hi = meio - 1
    return -1
```

## JavaScript

```javascript
function search(nums, target) {
  let lo = 0;
  let hi = nums.length - 1;
  while (lo <= hi) {
    const meio = Math.floor((lo + hi) / 2);
    if (nums[meio] === target) return meio;
    if (nums[meio] < target) lo = meio + 1;
    else hi = meio - 1;
  }
  return -1;
}
```

## TypeScript

```typescript
function search(nums: number[], target: number): number {
  let lo = 0;
  let hi = nums.length - 1;
  while (lo <= hi) {
    const meio = Math.floor((lo + hi) / 2);
    if (nums[meio] === target) return meio;
    if (nums[meio] < target) lo = meio + 1;
    else hi = meio - 1;
  }
  return -1;
}
```

## Java

```java
class Solution {
    public int search(int[] nums, int target) {
        int lo = 0, hi = nums.length - 1;
        while (lo <= hi) {
            int meio = lo + (hi - lo) / 2;
            if (nums[meio] == target) return meio;
            if (nums[meio] < target) lo = meio + 1;
            else hi = meio - 1;
        }
        return -1;
    }
}
```

## C++

```cpp
class Solution {
public:
    int search(vector<int>& nums, int target) {
        int lo = 0, hi = (int)nums.size() - 1;
        while (lo <= hi) {
            int meio = lo + (hi - lo) / 2;
            if (nums[meio] == target) return meio;
            if (nums[meio] < target) lo = meio + 1;
            else hi = meio - 1;
        }
        return -1;
    }
};
```

## C#

```csharp
public class Solution {
    public int Search(int[] nums, int target) {
        int lo = 0, hi = nums.Length - 1;
        while (lo <= hi) {
            int meio = lo + (hi - lo) / 2;
            if (nums[meio] == target) return meio;
            if (nums[meio] < target) lo = meio + 1;
            else hi = meio - 1;
        }
        return -1;
    }
}
```

## Go

```go
func search(nums []int, target int) int {
	lo, hi := 0, len(nums)-1
	for lo <= hi {
		meio := lo + (hi-lo)/2
		if nums[meio] == target {
			return meio
		}
		if nums[meio] < target {
			lo = meio + 1
		} else {
			hi = meio - 1
		}
	}
	return -1
}
```
