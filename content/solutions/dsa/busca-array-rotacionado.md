## Ideia

Mesmo rotacionado, ao cortar o intervalo ao meio, pelo menos uma das metades continua em ordem crescente. Compare `nums[lo]` com `nums[meio]` para descobrir qual: se `nums[lo] <= nums[meio]`, a metade esquerda está ordenada; senão, a direita está.

Com a metade ordenada identificada, basta testar se `target` cabe entre os extremos dela. Se couber, descarte a outra metade; se não couber, descarte esta. A cada passo o intervalo cai pela metade, como numa busca binária comum.

## Complexidade

Tempo `O(log n)`, o intervalo é dividido ao meio a cada iteração. Espaço `O(1)`.

## Python

```python
def search_rotated(nums, target):
    lo, hi = 0, len(nums) - 1
    while lo <= hi:
        meio = (lo + hi) // 2
        if nums[meio] == target:
            return meio
        if nums[lo] <= nums[meio]:
            if nums[lo] <= target < nums[meio]:
                hi = meio - 1
            else:
                lo = meio + 1
        else:
            if nums[meio] < target <= nums[hi]:
                lo = meio + 1
            else:
                hi = meio - 1
    return -1
```

## JavaScript

```javascript
function searchRotated(nums, target) {
  let lo = 0;
  let hi = nums.length - 1;
  while (lo <= hi) {
    const meio = Math.floor((lo + hi) / 2);
    if (nums[meio] === target) return meio;
    if (nums[lo] <= nums[meio]) {
      if (nums[lo] <= target && target < nums[meio]) hi = meio - 1;
      else lo = meio + 1;
    } else {
      if (nums[meio] < target && target <= nums[hi]) lo = meio + 1;
      else hi = meio - 1;
    }
  }
  return -1;
}
```

## TypeScript

```typescript
function searchRotated(nums: number[], target: number): number {
  let lo = 0;
  let hi = nums.length - 1;
  while (lo <= hi) {
    const meio = Math.floor((lo + hi) / 2);
    if (nums[meio] === target) return meio;
    if (nums[lo] <= nums[meio]) {
      if (nums[lo] <= target && target < nums[meio]) hi = meio - 1;
      else lo = meio + 1;
    } else {
      if (nums[meio] < target && target <= nums[hi]) lo = meio + 1;
      else hi = meio - 1;
    }
  }
  return -1;
}
```

## Java

```java
class Solution {
    public int searchRotated(int[] nums, int target) {
        int lo = 0, hi = nums.length - 1;
        while (lo <= hi) {
            int meio = lo + (hi - lo) / 2;
            if (nums[meio] == target) return meio;
            if (nums[lo] <= nums[meio]) {
                if (nums[lo] <= target && target < nums[meio]) hi = meio - 1;
                else lo = meio + 1;
            } else {
                if (nums[meio] < target && target <= nums[hi]) lo = meio + 1;
                else hi = meio - 1;
            }
        }
        return -1;
    }
}
```

## C++

```cpp
class Solution {
public:
    int searchRotated(vector<int>& nums, int target) {
        int lo = 0, hi = (int)nums.size() - 1;
        while (lo <= hi) {
            int meio = lo + (hi - lo) / 2;
            if (nums[meio] == target) return meio;
            if (nums[lo] <= nums[meio]) {
                if (nums[lo] <= target && target < nums[meio]) hi = meio - 1;
                else lo = meio + 1;
            } else {
                if (nums[meio] < target && target <= nums[hi]) lo = meio + 1;
                else hi = meio - 1;
            }
        }
        return -1;
    }
};
```

## C#

```csharp
public class Solution {
    public int SearchRotated(int[] nums, int target) {
        int lo = 0, hi = nums.Length - 1;
        while (lo <= hi) {
            int meio = lo + (hi - lo) / 2;
            if (nums[meio] == target) return meio;
            if (nums[lo] <= nums[meio]) {
                if (nums[lo] <= target && target < nums[meio]) hi = meio - 1;
                else lo = meio + 1;
            } else {
                if (nums[meio] < target && target <= nums[hi]) lo = meio + 1;
                else hi = meio - 1;
            }
        }
        return -1;
    }
}
```

## Go

```go
func searchRotated(nums []int, target int) int {
	lo, hi := 0, len(nums)-1
	for lo <= hi {
		meio := lo + (hi-lo)/2
		if nums[meio] == target {
			return meio
		}
		if nums[lo] <= nums[meio] {
			if nums[lo] <= target && target < nums[meio] {
				hi = meio - 1
			} else {
				lo = meio + 1
			}
		} else {
			if nums[meio] < target && target <= nums[hi] {
				lo = meio + 1
			} else {
				hi = meio - 1
			}
		}
	}
	return -1
}
```
