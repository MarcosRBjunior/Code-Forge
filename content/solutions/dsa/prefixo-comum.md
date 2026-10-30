## Ideia

O prefixo comum nunca é maior que a menor string da lista. Compare as strings coluna por coluna: para cada posição `i`, olhe o caractere da primeira string e confira se todas as demais têm o mesmo caractere ali.

Na primeira posição em que alguma string termina ou diverge, devolva o trecho inicial da primeira string até aquele ponto. Se nenhuma coluna falhar, a primeira string inteira é o prefixo.

## Complexidade

Tempo O(S), com S o total de caracteres comparados, no pior caso a soma dos tamanhos das strings. Espaço O(1) além do resultado.

## Python

```python
def longest_common_prefix(strs):
    primeira = strs[0]
    for i, ch in enumerate(primeira):
        for outra in strs[1:]:
            if i >= len(outra) or outra[i] != ch:
                return primeira[:i]
    return primeira
```

## JavaScript

```javascript
function longestCommonPrefix(strs) {
  const primeira = strs[0];
  for (let i = 0; i < primeira.length; i++) {
    for (let j = 1; j < strs.length; j++) {
      if (i >= strs[j].length || strs[j][i] !== primeira[i]) return primeira.slice(0, i);
    }
  }
  return primeira;
}
```

## TypeScript

```typescript
function longestCommonPrefix(strs: string[]): string {
  const primeira = strs[0];
  for (let i = 0; i < primeira.length; i++) {
    for (let j = 1; j < strs.length; j++) {
      if (i >= strs[j].length || strs[j][i] !== primeira[i]) return primeira.slice(0, i);
    }
  }
  return primeira;
}
```

## Java

```java
class Solution {
    public String longestCommonPrefix(String[] strs) {
        String primeira = strs[0];
        for (int i = 0; i < primeira.length(); i++) {
            for (int j = 1; j < strs.length; j++) {
                if (i >= strs[j].length() || strs[j].charAt(i) != primeira.charAt(i)) {
                    return primeira.substring(0, i);
                }
            }
        }
        return primeira;
    }
}
```

## C++

```cpp
class Solution {
public:
    string longestCommonPrefix(vector<string>& strs) {
        const string& primeira = strs[0];
        for (int i = 0; i < (int)primeira.size(); i++) {
            for (int j = 1; j < (int)strs.size(); j++) {
                if (i >= (int)strs[j].size() || strs[j][i] != primeira[i]) {
                    return primeira.substr(0, i);
                }
            }
        }
        return primeira;
    }
};
```

## C#

```csharp
public class Solution {
    public string LongestCommonPrefix(string[] strs) {
        string primeira = strs[0];
        for (int i = 0; i < primeira.Length; i++) {
            for (int j = 1; j < strs.Length; j++) {
                if (i >= strs[j].Length || strs[j][i] != primeira[i]) {
                    return primeira.Substring(0, i);
                }
            }
        }
        return primeira;
    }
}
```

## Go

```go
func longestCommonPrefix(strs []string) string {
	primeira := strs[0]
	for i := 0; i < len(primeira); i++ {
		for _, outra := range strs[1:] {
			if i >= len(outra) || outra[i] != primeira[i] {
				return primeira[:i]
			}
		}
	}
	return primeira
}
```
