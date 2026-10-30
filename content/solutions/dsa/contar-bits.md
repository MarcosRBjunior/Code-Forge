## Ideia

O número de bits 1 de `i` se relaciona com o de um número menor: deslocar `i` um bit para a direita remove o último bit, então `i >> 1` tem os mesmos bits 1, exceto talvez o último. Logo `ans[i] = ans[i >> 1] + (i & 1)`.

Como `i >> 1` é sempre menor que `i` (para `i` maior que 0), o valor já foi calculado quando chegamos em `i`. Isso é uma programação dinâmica simples que evita contar os bits de cada número do zero.

## Complexidade

Tempo O(n), com uma operação constante por número. Espaço O(n) para a resposta.

## Python

```python
def count_bits(n):
    ans = [0] * (n + 1)
    for i in range(1, n + 1):
        ans[i] = ans[i >> 1] + (i & 1)
    return ans
```

## JavaScript

```javascript
function countBits(n) {
  const ans = new Array(n + 1).fill(0);
  for (let i = 1; i <= n; i++) {
    ans[i] = ans[i >> 1] + (i & 1);
  }
  return ans;
}
```

## TypeScript

```typescript
function countBits(n: number): number[] {
  const ans: number[] = new Array(n + 1).fill(0);
  for (let i = 1; i <= n; i++) {
    ans[i] = ans[i >> 1] + (i & 1);
  }
  return ans;
}
```

## Java

```java
class Solution {
    public int[] countBits(int n) {
        int[] ans = new int[n + 1];
        for (int i = 1; i <= n; i++) {
            ans[i] = ans[i >> 1] + (i & 1);
        }
        return ans;
    }
}
```

## C++

```cpp
class Solution {
public:
    vector<int> countBits(int n) {
        vector<int> ans(n + 1, 0);
        for (int i = 1; i <= n; i++) {
            ans[i] = ans[i >> 1] + (i & 1);
        }
        return ans;
    }
};
```

## C#

```csharp
public class Solution {
    public int[] CountBits(int n) {
        var ans = new int[n + 1];
        for (int i = 1; i <= n; i++) {
            ans[i] = ans[i >> 1] + (i & 1);
        }
        return ans;
    }
}
```

## Go

```go
func countBits(n int) []int {
	ans := make([]int, n+1)
	for i := 1; i <= n; i++ {
		ans[i] = ans[i>>1] + (i & 1)
	}
	return ans
}
```
