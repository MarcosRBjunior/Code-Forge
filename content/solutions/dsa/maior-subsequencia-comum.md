## Ideia

Seja `dp[i][j]` o tamanho da maior subsequência comum entre os primeiros `i` caracteres de `text1` e os primeiros `j` de `text2`. Se os últimos caracteres (`text1[i-1]` e `text2[j-1]`) são iguais, eles entram na subsequência: `dp[i][j] = dp[i-1][j-1] + 1`. Caso contrário, descartamos um dos dois: `dp[i][j] = max(dp[i-1][j], dp[i][j-1])`.

A linha `i` só depende da linha `i - 1`, então guardamos apenas duas linhas e reduzimos o espaço.

## Complexidade

Tempo `O(m * n)`, espaço `O(n)`, onde `m` e `n` são os tamanhos das strings.

## Python

```python
def longest_common_subsequence(text1, text2):
    anterior = [0] * (len(text2) + 1)
    for a in text1:
        atual = [0] * (len(text2) + 1)
        for j, b in enumerate(text2, 1):
            if a == b:
                atual[j] = anterior[j - 1] + 1
            else:
                atual[j] = max(anterior[j], atual[j - 1])
        anterior = atual
    return anterior[-1]
```

## JavaScript

```javascript
function longestCommonSubsequence(text1, text2) {
  const n = text2.length;
  let anterior = new Array(n + 1).fill(0);
  for (let i = 0; i < text1.length; i++) {
    const atual = new Array(n + 1).fill(0);
    for (let j = 1; j <= n; j++) {
      if (text1[i] === text2[j - 1]) atual[j] = anterior[j - 1] + 1;
      else atual[j] = Math.max(anterior[j], atual[j - 1]);
    }
    anterior = atual;
  }
  return anterior[n];
}
```

## TypeScript

```typescript
function longestCommonSubsequence(text1: string, text2: string): number {
  const n = text2.length;
  let anterior: number[] = new Array(n + 1).fill(0);
  for (let i = 0; i < text1.length; i++) {
    const atual: number[] = new Array(n + 1).fill(0);
    for (let j = 1; j <= n; j++) {
      if (text1[i] === text2[j - 1]) atual[j] = anterior[j - 1] + 1;
      else atual[j] = Math.max(anterior[j], atual[j - 1]);
    }
    anterior = atual;
  }
  return anterior[n];
}
```

## Java

```java
class Solution {
    public int longestCommonSubsequence(String text1, String text2) {
        int n = text2.length();
        int[] anterior = new int[n + 1];
        for (int i = 0; i < text1.length(); i++) {
            int[] atual = new int[n + 1];
            for (int j = 1; j <= n; j++) {
                if (text1.charAt(i) == text2.charAt(j - 1)) atual[j] = anterior[j - 1] + 1;
                else atual[j] = Math.max(anterior[j], atual[j - 1]);
            }
            anterior = atual;
        }
        return anterior[n];
    }
}
```

## C++

```cpp
class Solution {
public:
    int longestCommonSubsequence(string text1, string text2) {
        int n = text2.size();
        vector<int> anterior(n + 1, 0);
        for (char a : text1) {
            vector<int> atual(n + 1, 0);
            for (int j = 1; j <= n; j++) {
                if (a == text2[j - 1]) atual[j] = anterior[j - 1] + 1;
                else atual[j] = max(anterior[j], atual[j - 1]);
            }
            anterior = atual;
        }
        return anterior[n];
    }
};
```

## C#

```csharp
public class Solution {
    public int LongestCommonSubsequence(string text1, string text2) {
        int n = text2.Length;
        int[] anterior = new int[n + 1];
        foreach (char a in text1) {
            int[] atual = new int[n + 1];
            for (int j = 1; j <= n; j++) {
                if (a == text2[j - 1]) atual[j] = anterior[j - 1] + 1;
                else atual[j] = Math.Max(anterior[j], atual[j - 1]);
            }
            anterior = atual;
        }
        return anterior[n];
    }
}
```

## Go

```go
func longestCommonSubsequence(text1 string, text2 string) int {
	n := len(text2)
	anterior := make([]int, n+1)
	for i := 0; i < len(text1); i++ {
		atual := make([]int, n+1)
		for j := 1; j <= n; j++ {
			if text1[i] == text2[j-1] {
				atual[j] = anterior[j-1] + 1
			} else {
				atual[j] = max(anterior[j], atual[j-1])
			}
		}
		anterior = atual
	}
	return anterior[n]
}
```
