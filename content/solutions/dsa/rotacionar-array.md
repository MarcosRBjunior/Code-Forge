## Ideia

Rotacionar `k` posições para a direita equivale a três inversões: inverta o array inteiro, depois inverta os primeiros `k` elementos e por fim os restantes. A primeira inversão leva o último bloco de `k` elementos para o começo (porém de trás para frente), e as duas seguintes colocam cada bloco na ordem correta.

Antes disso, reduza `k` módulo o tamanho do array, já que girar `n` vezes devolve o array original. Para arrays vazios, não há nada a fazer.

## Complexidade

Tempo O(n), pois cada elemento é trocado no máximo duas vezes. Espaço O(1).

## Python

```python
def rotate(nums, k):
    n = len(nums)
    if n == 0:
        return
    k %= n

    def inverter(i, j):
        while i < j:
            nums[i], nums[j] = nums[j], nums[i]
            i += 1
            j -= 1

    inverter(0, n - 1)
    inverter(0, k - 1)
    inverter(k, n - 1)
```

## JavaScript

```javascript
function rotate(nums, k) {
  const n = nums.length;
  if (n === 0) return;
  k %= n;
  const inverter = (i, j) => {
    while (i < j) {
      [nums[i], nums[j]] = [nums[j], nums[i]];
      i++;
      j--;
    }
  };
  inverter(0, n - 1);
  inverter(0, k - 1);
  inverter(k, n - 1);
}
```

## TypeScript

```typescript
function rotate(nums: number[], k: number): void {
  const n = nums.length;
  if (n === 0) return;
  k %= n;
  const inverter = (i: number, j: number): void => {
    while (i < j) {
      [nums[i], nums[j]] = [nums[j], nums[i]];
      i++;
      j--;
    }
  };
  inverter(0, n - 1);
  inverter(0, k - 1);
  inverter(k, n - 1);
}
```

## Java

```java
class Solution {
    public void rotate(int[] nums, int k) {
        int n = nums.length;
        if (n == 0) return;
        k %= n;
        inverter(nums, 0, n - 1);
        inverter(nums, 0, k - 1);
        inverter(nums, k, n - 1);
    }

    private void inverter(int[] nums, int i, int j) {
        while (i < j) {
            int t = nums[i];
            nums[i++] = nums[j];
            nums[j--] = t;
        }
    }
}
```

## C++

```cpp
class Solution {
public:
    void rotate(vector<int>& nums, int k) {
        int n = nums.size();
        if (n == 0) return;
        k %= n;
        reverse(nums.begin(), nums.end());
        reverse(nums.begin(), nums.begin() + k);
        reverse(nums.begin() + k, nums.end());
    }
};
```

## C#

```csharp
public class Solution {
    public void Rotate(int[] nums, int k) {
        int n = nums.Length;
        if (n == 0) return;
        k %= n;
        Array.Reverse(nums);
        Array.Reverse(nums, 0, k);
        Array.Reverse(nums, k, n - k);
    }
}
```

## Go

```go
func rotate(nums []int, k int) {
	n := len(nums)
	if n == 0 {
		return
	}
	k %= n
	inverter := func(i, j int) {
		for i < j {
			nums[i], nums[j] = nums[j], nums[i]
			i++
			j--
		}
	}
	inverter(0, n-1)
	inverter(0, k-1)
	inverter(k, n-1)
}
```
