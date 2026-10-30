## Ideia

Seja `ok[i]` verdadeiro quando o prefixo de `s` com `i` caracteres pode ser dividido em palavras do dicionário. O prefixo vazio é válido (`ok[0]` é verdadeiro). Para um prefixo de tamanho `i`, procure um ponto de corte `j` tal que o prefixo de tamanho `j` já seja válido e o pedaço entre `j` e `i` seja uma palavra do dicionário.

Guardar as palavras num conjunto deixa cada consulta rápida. Como cada prefixo só depende de prefixos menores, uma única passada da esquerda para a direita resolve tudo, e a resposta é `ok[n]`.

## Complexidade

Tempo O(n² · m) no pior caso, onde `n` é o tamanho de `s` e `m` o custo de criar e hashear um pedaço. Espaço O(n) mais o conjunto de palavras.

## Python

```python
def word_break(s, word_dict):
    palavras = set(word_dict)
    n = len(s)
    ok = [False] * (n + 1)
    ok[0] = True
    for i in range(1, n + 1):
        for j in range(i):
            if ok[j] and s[j:i] in palavras:
                ok[i] = True
                break
    return ok[n]
```

## JavaScript

```javascript
function wordBreak(s, wordDict) {
  const palavras = new Set(wordDict);
  const n = s.length;
  const ok = new Array(n + 1).fill(false);
  ok[0] = true;
  for (let i = 1; i <= n; i++) {
    for (let j = 0; j < i; j++) {
      if (ok[j] && palavras.has(s.slice(j, i))) {
        ok[i] = true;
        break;
      }
    }
  }
  return ok[n];
}
```

## TypeScript

```typescript
function wordBreak(s: string, wordDict: string[]): boolean {
  const palavras = new Set<string>(wordDict);
  const n = s.length;
  const ok: boolean[] = new Array(n + 1).fill(false);
  ok[0] = true;
  for (let i = 1; i <= n; i++) {
    for (let j = 0; j < i; j++) {
      if (ok[j] && palavras.has(s.slice(j, i))) {
        ok[i] = true;
        break;
      }
    }
  }
  return ok[n];
}
```

## Java

```java
class Solution {
    public boolean wordBreak(String s, String[] wordDict) {
        Set<String> palavras = new HashSet<>(Arrays.asList(wordDict));
        int n = s.length();
        boolean[] ok = new boolean[n + 1];
        ok[0] = true;
        for (int i = 1; i <= n; i++) {
            for (int j = 0; j < i; j++) {
                if (ok[j] && palavras.contains(s.substring(j, i))) {
                    ok[i] = true;
                    break;
                }
            }
        }
        return ok[n];
    }
}
```

## C++

```cpp
class Solution {
public:
    bool wordBreak(string s, vector<string>& wordDict) {
        unordered_set<string> palavras(wordDict.begin(), wordDict.end());
        int n = s.size();
        vector<bool> ok(n + 1, false);
        ok[0] = true;
        for (int i = 1; i <= n; i++) {
            for (int j = 0; j < i; j++) {
                if (ok[j] && palavras.count(s.substr(j, i - j))) {
                    ok[i] = true;
                    break;
                }
            }
        }
        return ok[n];
    }
};
```

## C#

```csharp
public class Solution {
    public bool WordBreak(string s, string[] wordDict) {
        var palavras = new HashSet<string>(wordDict);
        int n = s.Length;
        var ok = new bool[n + 1];
        ok[0] = true;
        for (int i = 1; i <= n; i++) {
            for (int j = 0; j < i; j++) {
                if (ok[j] && palavras.Contains(s.Substring(j, i - j))) {
                    ok[i] = true;
                    break;
                }
            }
        }
        return ok[n];
    }
}
```

## Go

```go
func wordBreak(s string, wordDict []string) bool {
	palavras := map[string]bool{}
	for _, p := range wordDict {
		palavras[p] = true
	}
	n := len(s)
	ok := make([]bool, n+1)
	ok[0] = true
	for i := 1; i <= n; i++ {
		for j := 0; j < i; j++ {
			if ok[j] && palavras[s[j:i]] {
				ok[i] = true
				break
			}
		}
	}
	return ok[n]
}
```
