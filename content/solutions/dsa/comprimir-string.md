## Ideia

Percorra a string com um índice `i` que marca o início de cada sequência e um índice `j` que avança enquanto o caractere for igual. Ao terminar a sequência, escreva o caractere e, se o tamanho for maior que 1, o número por extenso.

As peças vão para uma lista que é juntada no final, evitando concatenações repetidas. Por fim, compare os tamanhos: só devolva a versão comprimida se ela for estritamente menor que a original.

## Complexidade

Tempo O(n), com uma passada pela string. Espaço O(n) para o resultado.

## Python

```python
def compress(s):
    partes = []
    i = 0
    while i < len(s):
        j = i
        while j < len(s) and s[j] == s[i]:
            j += 1
        partes.append(s[i])
        if j - i > 1:
            partes.append(str(j - i))
        i = j
    comprimida = "".join(partes)
    return comprimida if len(comprimida) < len(s) else s
```

## JavaScript

```javascript
function compress(s) {
  const partes = [];
  let i = 0;
  while (i < s.length) {
    let j = i;
    while (j < s.length && s[j] === s[i]) j++;
    partes.push(s[i]);
    if (j - i > 1) partes.push(String(j - i));
    i = j;
  }
  const comprimida = partes.join("");
  return comprimida.length < s.length ? comprimida : s;
}
```

## TypeScript

```typescript
function compress(s: string): string {
  const partes: string[] = [];
  let i = 0;
  while (i < s.length) {
    let j = i;
    while (j < s.length && s[j] === s[i]) j++;
    partes.push(s[i]);
    if (j - i > 1) partes.push(String(j - i));
    i = j;
  }
  const comprimida = partes.join("");
  return comprimida.length < s.length ? comprimida : s;
}
```

## Java

```java
class Solution {
    public String compress(String s) {
        StringBuilder sb = new StringBuilder();
        int i = 0;
        while (i < s.length()) {
            int j = i;
            while (j < s.length() && s.charAt(j) == s.charAt(i)) j++;
            sb.append(s.charAt(i));
            if (j - i > 1) sb.append(j - i);
            i = j;
        }
        return sb.length() < s.length() ? sb.toString() : s;
    }
}
```

## C++

```cpp
class Solution {
public:
    string compress(string s) {
        string r;
        int n = s.size(), i = 0;
        while (i < n) {
            int j = i;
            while (j < n && s[j] == s[i]) j++;
            r += s[i];
            if (j - i > 1) r += to_string(j - i);
            i = j;
        }
        return r.size() < s.size() ? r : s;
    }
};
```

## C#

```csharp
public class Solution {
    public string Compress(string s) {
        var sb = new StringBuilder();
        int i = 0;
        while (i < s.Length) {
            int j = i;
            while (j < s.Length && s[j] == s[i]) j++;
            sb.Append(s[i]);
            if (j - i > 1) sb.Append(j - i);
            i = j;
        }
        return sb.Length < s.Length ? sb.ToString() : s;
    }
}
```

## Go

```go
import "strconv"

func compress(s string) string {
	var r []byte
	i := 0
	for i < len(s) {
		j := i
		for j < len(s) && s[j] == s[i] {
			j++
		}
		r = append(r, s[i])
		if j-i > 1 {
			r = strconv.AppendInt(r, int64(j-i), 10)
		}
		i = j
	}
	if len(r) < len(s) {
		return string(r)
	}
	return s
}
```
