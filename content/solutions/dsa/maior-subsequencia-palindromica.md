## Ideia

Seja `dp[i][j]` o tamanho da maior subsequência palindrômica de `s[i..j]`. Se `s[i]` e `s[j]` são iguais, eles cercam a melhor subsequência do miolo: `dp[i][j] = dp[i+1][j-1] + 2`. Caso contrário, um deles fica de fora: `dp[i][j] = max(dp[i+1][j], dp[i][j-1])`. Todo caractere sozinho é um palindromo de tamanho 1.

Preenchemos a tabela com `i` decrescendo e `j` crescendo a partir de `i + 1`, de modo que as posições necessárias já estejam calculadas.

## Complexidade

Tempo `O(n²)`, espaço `O(n²)`.

## Python

```python
def longest_palindrome_subseq(s):
    n = len(s)
    dp = [[0] * n for _ in range(n)]
    for i in range(n - 1, -1, -1):
        dp[i][i] = 1
        for j in range(i + 1, n):
            if s[i] == s[j]:
                dp[i][j] = dp[i + 1][j - 1] + 2
            else:
                dp[i][j] = max(dp[i + 1][j], dp[i][j - 1])
    return dp[0][n - 1] if n else 0
```

## JavaScript

```javascript
function longestPalindromeSubseq(s) {
  const n = s.length;
  const dp = Array.from({ length: n }, () => new Array(n).fill(0));
  for (let i = n - 1; i >= 0; i--) {
    dp[i][i] = 1;
    for (let j = i + 1; j < n; j++) {
      if (s[i] === s[j]) dp[i][j] = dp[i + 1][j - 1] + 2;
      else dp[i][j] = Math.max(dp[i + 1][j], dp[i][j - 1]);
    }
  }
  return n ? dp[0][n - 1] : 0;
}
```

## TypeScript

```typescript
function longestPalindromeSubseq(s: string): number {
  const n = s.length;
  const dp: number[][] = Array.from({ length: n }, () => new Array(n).fill(0));
  for (let i = n - 1; i >= 0; i--) {
    dp[i][i] = 1;
    for (let j = i + 1; j < n; j++) {
      if (s[i] === s[j]) dp[i][j] = dp[i + 1][j - 1] + 2;
      else dp[i][j] = Math.max(dp[i + 1][j], dp[i][j - 1]);
    }
  }
  return n ? dp[0][n - 1] : 0;
}
```

## Java

```java
class Solution {
    public int longestPalindromeSubseq(String s) {
        int n = s.length();
        if (n == 0) return 0;
        int[][] dp = new int[n][n];
        for (int i = n - 1; i >= 0; i--) {
            dp[i][i] = 1;
            for (int j = i + 1; j < n; j++) {
                if (s.charAt(i) == s.charAt(j)) dp[i][j] = dp[i + 1][j - 1] + 2;
                else dp[i][j] = Math.max(dp[i + 1][j], dp[i][j - 1]);
            }
        }
        return dp[0][n - 1];
    }
}
```

## C++

```cpp
class Solution {
public:
    int longestPalindromeSubseq(string s) {
        int n = s.size();
        if (n == 0) return 0;
        vector<vector<int>> dp(n, vector<int>(n, 0));
        for (int i = n - 1; i >= 0; i--) {
            dp[i][i] = 1;
            for (int j = i + 1; j < n; j++) {
                if (s[i] == s[j]) dp[i][j] = dp[i + 1][j - 1] + 2;
                else dp[i][j] = max(dp[i + 1][j], dp[i][j - 1]);
            }
        }
        return dp[0][n - 1];
    }
};
```

## C#

```csharp
public class Solution {
    public int LongestPalindromeSubseq(string s) {
        int n = s.Length;
        if (n == 0) return 0;
        int[,] dp = new int[n, n];
        for (int i = n - 1; i >= 0; i--) {
            dp[i, i] = 1;
            for (int j = i + 1; j < n; j++) {
                if (s[i] == s[j]) dp[i, j] = dp[i + 1, j - 1] + 2;
                else dp[i, j] = Math.Max(dp[i + 1, j], dp[i, j - 1]);
            }
        }
        return dp[0, n - 1];
    }
}
```

## Go

```go
func longestPalindromeSubseq(s string) int {
	n := len(s)
	if n == 0 {
		return 0
	}
	dp := make([][]int, n)
	for i := range dp {
		dp[i] = make([]int, n)
	}
	for i := n - 1; i >= 0; i-- {
		dp[i][i] = 1
		for j := i + 1; j < n; j++ {
			if s[i] == s[j] {
				dp[i][j] = dp[i+1][j-1] + 2
			} else {
				dp[i][j] = max(dp[i+1][j], dp[i][j-1])
			}
		}
	}
	return dp[0][n-1]
}
```
