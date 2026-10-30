## Ideia

Seja `dp[i][j]` o menor número de operações para transformar os primeiros `i` caracteres de `word1` nos primeiros `j` de `word2`. Se os caracteres `word1[i-1]` e `word2[j-1]` são iguais, nada precisa ser feito: `dp[i][j] = dp[i-1][j-1]`.

Caso contrário, escolha a melhor entre três operações, cada uma custando 1: substituir (`dp[i-1][j-1]`), apagar de `word1` (`dp[i-1][j]`) ou inserir em `word1` (`dp[i][j-1]`). Os casos base são transformar um prefixo no vazio, que custa o próprio tamanho. Como cada linha só depende da anterior, guardamos duas linhas.

## Complexidade

Tempo O(m * n), com `m` e `n` os tamanhos das palavras. Espaço O(n) com duas linhas.

## Python

```python
def min_distance(word1, word2):
    m, n = len(word1), len(word2)
    anterior = list(range(n + 1))
    for i in range(1, m + 1):
        atual = [i] + [0] * n
        for j in range(1, n + 1):
            if word1[i - 1] == word2[j - 1]:
                atual[j] = anterior[j - 1]
            else:
                atual[j] = 1 + min(anterior[j - 1], anterior[j], atual[j - 1])
        anterior = atual
    return anterior[n]
```

## JavaScript

```javascript
function minDistance(word1, word2) {
  const m = word1.length;
  const n = word2.length;
  let anterior = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) {
    const atual = new Array(n + 1).fill(0);
    atual[0] = i;
    for (let j = 1; j <= n; j++) {
      if (word1[i - 1] === word2[j - 1]) {
        atual[j] = anterior[j - 1];
      } else {
        atual[j] = 1 + Math.min(anterior[j - 1], anterior[j], atual[j - 1]);
      }
    }
    anterior = atual;
  }
  return anterior[n];
}
```

## TypeScript

```typescript
function minDistance(word1: string, word2: string): number {
  const m = word1.length;
  const n = word2.length;
  let anterior: number[] = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) {
    const atual: number[] = new Array(n + 1).fill(0);
    atual[0] = i;
    for (let j = 1; j <= n; j++) {
      if (word1[i - 1] === word2[j - 1]) {
        atual[j] = anterior[j - 1];
      } else {
        atual[j] = 1 + Math.min(anterior[j - 1], anterior[j], atual[j - 1]);
      }
    }
    anterior = atual;
  }
  return anterior[n];
}
```

## Java

```java
class Solution {
    public int minDistance(String word1, String word2) {
        int m = word1.length(), n = word2.length();
        int[] anterior = new int[n + 1];
        for (int j = 0; j <= n; j++) anterior[j] = j;
        for (int i = 1; i <= m; i++) {
            int[] atual = new int[n + 1];
            atual[0] = i;
            for (int j = 1; j <= n; j++) {
                if (word1.charAt(i - 1) == word2.charAt(j - 1)) {
                    atual[j] = anterior[j - 1];
                } else {
                    atual[j] = 1 + Math.min(anterior[j - 1], Math.min(anterior[j], atual[j - 1]));
                }
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
    int minDistance(string word1, string word2) {
        int m = word1.size(), n = word2.size();
        vector<int> anterior(n + 1);
        iota(anterior.begin(), anterior.end(), 0);
        for (int i = 1; i <= m; i++) {
            vector<int> atual(n + 1, 0);
            atual[0] = i;
            for (int j = 1; j <= n; j++) {
                if (word1[i - 1] == word2[j - 1]) {
                    atual[j] = anterior[j - 1];
                } else {
                    atual[j] = 1 + min({anterior[j - 1], anterior[j], atual[j - 1]});
                }
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
    public int MinDistance(string word1, string word2) {
        int m = word1.Length, n = word2.Length;
        var anterior = new int[n + 1];
        for (int j = 0; j <= n; j++) anterior[j] = j;
        for (int i = 1; i <= m; i++) {
            var atual = new int[n + 1];
            atual[0] = i;
            for (int j = 1; j <= n; j++) {
                if (word1[i - 1] == word2[j - 1]) {
                    atual[j] = anterior[j - 1];
                } else {
                    atual[j] = 1 + Math.Min(anterior[j - 1], Math.Min(anterior[j], atual[j - 1]));
                }
            }
            anterior = atual;
        }
        return anterior[n];
    }
}
```

## Go

```go
func minDistance(word1 string, word2 string) int {
	m, n := len(word1), len(word2)
	anterior := make([]int, n+1)
	for j := range anterior {
		anterior[j] = j
	}
	for i := 1; i <= m; i++ {
		atual := make([]int, n+1)
		atual[0] = i
		for j := 1; j <= n; j++ {
			if word1[i-1] == word2[j-1] {
				atual[j] = anterior[j-1]
			} else {
				menor := anterior[j-1]
				if anterior[j] < menor {
					menor = anterior[j]
				}
				if atual[j-1] < menor {
					menor = atual[j-1]
				}
				atual[j] = 1 + menor
			}
		}
		anterior = atual
	}
	return anterior[n]
}
```
