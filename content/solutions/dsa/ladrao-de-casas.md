## Ideia

Em cada casa `i` há duas opções: roubar (somando `nums[i]` ao melhor resultado até a casa `i - 2`) ou pular (ficando com o melhor até `i - 1`). O melhor resultado até `i` é o máximo das duas.

Como só dependemos das duas últimas respostas, bastam duas variáveis em vez de uma tabela inteira: `anterior` (melhor até `i - 2`) e `atual` (melhor até `i - 1`).

## Complexidade

Tempo `O(n)`, espaço `O(1)`.

## Python

```python
def rob(nums):
    anterior, atual = 0, 0
    for x in nums:
        anterior, atual = atual, max(atual, anterior + x)
    return atual
```

## JavaScript

```javascript
function rob(nums) {
  let anterior = 0;
  let atual = 0;
  for (const x of nums) {
    [anterior, atual] = [atual, Math.max(atual, anterior + x)];
  }
  return atual;
}
```

## TypeScript

```typescript
function rob(nums: number[]): number {
  let anterior = 0;
  let atual = 0;
  for (const x of nums) {
    [anterior, atual] = [atual, Math.max(atual, anterior + x)];
  }
  return atual;
}
```

## Java

```java
class Solution {
    public int rob(int[] nums) {
        int anterior = 0, atual = 0;
        for (int x : nums) {
            int novo = Math.max(atual, anterior + x);
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
    int rob(vector<int>& nums) {
        int anterior = 0, atual = 0;
        for (int x : nums) {
            int novo = max(atual, anterior + x);
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
    public int Rob(int[] nums) {
        int anterior = 0, atual = 0;
        foreach (int x in nums) {
            int novo = Math.Max(atual, anterior + x);
            anterior = atual;
            atual = novo;
        }
        return atual;
    }
}
```

## Go

```go
func rob(nums []int) int {
	anterior, atual := 0, 0
	for _, x := range nums {
		novo := atual
		if anterior+x > novo {
			novo = anterior + x
		}
		anterior, atual = atual, novo
	}
	return atual
}
```
