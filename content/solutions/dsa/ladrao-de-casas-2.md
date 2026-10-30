## Ideia

Como a primeira e a última casa são vizinhas, nunca se pode roubar as duas. Isso reduz o problema a dois cenários lineares: roubar apenas as casas de `0` até `n - 2`, ou apenas as de `1` até `n - 1`. A resposta é o maior dos dois, e cada um é o problema linear clássico resolvido com duas variáveis.

O caso de uma única casa precisa de tratamento à parte, pois os dois cenários ficariam vazios: a resposta é o próprio valor.

## Complexidade

Tempo `O(n)`, espaço `O(1)`.

## Python

```python
def rob_circle(nums):
    if len(nums) == 1:
        return nums[0]

    def linear(casas):
        anterior, atual = 0, 0
        for x in casas:
            anterior, atual = atual, max(atual, anterior + x)
        return atual

    return max(linear(nums[:-1]), linear(nums[1:]))
```

## JavaScript

```javascript
function robCircle(nums) {
  if (nums.length === 1) return nums[0];

  function linear(casas) {
    let anterior = 0;
    let atual = 0;
    for (const x of casas) {
      [anterior, atual] = [atual, Math.max(atual, anterior + x)];
    }
    return atual;
  }

  return Math.max(linear(nums.slice(0, -1)), linear(nums.slice(1)));
}
```

## TypeScript

```typescript
function robCircle(nums: number[]): number {
  if (nums.length === 1) return nums[0];

  function linear(casas: number[]): number {
    let anterior = 0;
    let atual = 0;
    for (const x of casas) {
      [anterior, atual] = [atual, Math.max(atual, anterior + x)];
    }
    return atual;
  }

  return Math.max(linear(nums.slice(0, -1)), linear(nums.slice(1)));
}
```

## Java

```java
class Solution {
    public int robCircle(int[] nums) {
        int n = nums.length;
        if (n == 1) return nums[0];
        return Math.max(linear(nums, 0, n - 2), linear(nums, 1, n - 1));
    }

    private int linear(int[] nums, int de, int ate) {
        int anterior = 0, atual = 0;
        for (int i = de; i <= ate; i++) {
            int novo = Math.max(atual, anterior + nums[i]);
            anterior = atual;
            atual = novo;
        }
        return atual;
    }
}
```

## C++

```cpp
class Solution {
public:
    int robCircle(vector<int>& nums) {
        int n = nums.size();
        if (n == 1) return nums[0];
        return max(linear(nums, 0, n - 2), linear(nums, 1, n - 1));
    }

private:
    int linear(const vector<int>& nums, int de, int ate) {
        int anterior = 0, atual = 0;
        for (int i = de; i <= ate; i++) {
            int novo = max(atual, anterior + nums[i]);
            anterior = atual;
            atual = novo;
        }
        return atual;
    }
};
```

## C#

```csharp
public class Solution {
    public int RobCircle(int[] nums) {
        int n = nums.Length;
        if (n == 1) return nums[0];
        return Math.Max(Linear(nums, 0, n - 2), Linear(nums, 1, n - 1));
    }

    private int Linear(int[] nums, int de, int ate) {
        int anterior = 0, atual = 0;
        for (int i = de; i <= ate; i++) {
            int novo = Math.Max(atual, anterior + nums[i]);
            anterior = atual;
            atual = novo;
        }
        return atual;
    }
}
```

## Go

```go
func robCircle(nums []int) int {
	n := len(nums)
	if n == 1 {
		return nums[0]
	}
	linear := func(casas []int) int {
		anterior, atual := 0, 0
		for _, x := range casas {
			novo := atual
			if anterior+x > novo {
				novo = anterior + x
			}
			anterior, atual = atual, novo
		}
		return atual
	}
	a, b := linear(nums[:n-1]), linear(nums[1:])
	if a > b {
		return a
	}
	return b
}
```
