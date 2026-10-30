## Ideia

Dois textos são anagramas quando cada letra aparece o mesmo número de vezes em ambos. Se os tamanhos diferem, já não são. Caso contrário, conte as letras de `s` somando um e as de `t` subtraindo um: se tudo terminar em zero, as contagens são iguais.

Como as strings só têm letras minúsculas, um vetor de 26 posições basta e evita ordenar. Mesmo assim, um dicionário de contagens funcionaria igualmente.

## Complexidade

Tempo `O(n)`, uma passada por cada string. Espaço `O(1)`, pois o vetor de contagem tem tamanho fixo.

## Python

```python
def is_anagram(s, t):
    if len(s) != len(t):
        return False
    contagem = [0] * 26
    for a, b in zip(s, t):
        contagem[ord(a) - ord("a")] += 1
        contagem[ord(b) - ord("a")] -= 1
    return all(c == 0 for c in contagem)
```

## JavaScript

```javascript
function isAnagram(s, t) {
  if (s.length !== t.length) return false;
  const contagem = new Array(26).fill(0);
  for (let i = 0; i < s.length; i++) {
    contagem[s.charCodeAt(i) - 97]++;
    contagem[t.charCodeAt(i) - 97]--;
  }
  return contagem.every((c) => c === 0);
}
```

## TypeScript

```typescript
function isAnagram(s: string, t: string): boolean {
  if (s.length !== t.length) return false;
  const contagem: number[] = new Array(26).fill(0);
  for (let i = 0; i < s.length; i++) {
    contagem[s.charCodeAt(i) - 97]++;
    contagem[t.charCodeAt(i) - 97]--;
  }
  return contagem.every((c) => c === 0);
}
```

## Java

```java
class Solution {
    public boolean isAnagram(String s, String t) {
        if (s.length() != t.length()) return false;
        int[] contagem = new int[26];
        for (int i = 0; i < s.length(); i++) {
            contagem[s.charAt(i) - 'a']++;
            contagem[t.charAt(i) - 'a']--;
        }
        for (int c : contagem) {
            if (c != 0) return false;
        }
        return true;
    }
}
```

## C++

```cpp
class Solution {
public:
    bool isAnagram(string s, string t) {
        if (s.size() != t.size()) return false;
        int contagem[26] = {0};
        for (size_t i = 0; i < s.size(); i++) {
            contagem[s[i] - 'a']++;
            contagem[t[i] - 'a']--;
        }
        for (int c : contagem) {
            if (c != 0) return false;
        }
        return true;
    }
};
```

## C#

```csharp
public class Solution {
    public bool IsAnagram(string s, string t) {
        if (s.Length != t.Length) return false;
        var contagem = new int[26];
        for (int i = 0; i < s.Length; i++) {
            contagem[s[i] - 'a']++;
            contagem[t[i] - 'a']--;
        }
        return contagem.All(c => c == 0);
    }
}
```

## Go

```go
func isAnagram(s string, t string) bool {
	if len(s) != len(t) {
		return false
	}
	var contagem [26]int
	for i := 0; i < len(s); i++ {
		contagem[s[i]-'a']++
		contagem[t[i]-'a']--
	}
	for _, c := range contagem {
		if c != 0 {
			return false
		}
	}
	return true
}
```
