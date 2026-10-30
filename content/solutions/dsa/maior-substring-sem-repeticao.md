## Ideia

Usamos uma janela deslizante `[inicio, i]` que nunca contém caracteres repetidos. Guardamos, para cada caractere, a última posição em que apareceu. Ao ler `s[i]`, se ele já apareceu dentro da janela atual, empurramos `inicio` para logo depois dessa ocorrência; assim a janela volta a ser válida sem recomeçar do zero.

A cada passo, o tamanho `i - inicio + 1` é candidato à resposta. O `inicio` nunca recua, por isso cada caractere é processado uma vez.

## Complexidade

Tempo `O(n)`, espaço `O(k)` para o mapa, onde `k` é o tamanho do alfabeto.

## Python

```python
def maior_substring(s):
    ultima = {}
    inicio = 0
    melhor = 0
    for i, c in enumerate(s):
        if c in ultima and ultima[c] >= inicio:
            inicio = ultima[c] + 1
        ultima[c] = i
        melhor = max(melhor, i - inicio + 1)
    return melhor
```

## JavaScript

```javascript
function maiorSubstring(s) {
  const ultima = new Map();
  let inicio = 0;
  let melhor = 0;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (ultima.has(c) && ultima.get(c) >= inicio) inicio = ultima.get(c) + 1;
    ultima.set(c, i);
    melhor = Math.max(melhor, i - inicio + 1);
  }
  return melhor;
}
```

## TypeScript

```typescript
function maiorSubstring(s: string): number {
  const ultima = new Map<string, number>();
  let inicio = 0;
  let melhor = 0;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    const anterior = ultima.get(c);
    if (anterior !== undefined && anterior >= inicio) inicio = anterior + 1;
    ultima.set(c, i);
    melhor = Math.max(melhor, i - inicio + 1);
  }
  return melhor;
}
```

## Java

```java
class Solution {
    public int maiorSubstring(String s) {
        Map<Character, Integer> ultima = new HashMap<>();
        int inicio = 0, melhor = 0;
        for (int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);
            Integer anterior = ultima.get(c);
            if (anterior != null && anterior >= inicio) inicio = anterior + 1;
            ultima.put(c, i);
            melhor = Math.max(melhor, i - inicio + 1);
        }
        return melhor;
    }
}
```

## C++

```cpp
class Solution {
public:
    int maiorSubstring(string s) {
        unordered_map<char, int> ultima;
        int inicio = 0, melhor = 0;
        for (int i = 0; i < (int)s.size(); i++) {
            auto it = ultima.find(s[i]);
            if (it != ultima.end() && it->second >= inicio) inicio = it->second + 1;
            ultima[s[i]] = i;
            melhor = max(melhor, i - inicio + 1);
        }
        return melhor;
    }
};
```

## C#

```csharp
public class Solution {
    public int MaiorSubstring(string s) {
        var ultima = new Dictionary<char, int>();
        int inicio = 0, melhor = 0;
        for (int i = 0; i < s.Length; i++) {
            if (ultima.TryGetValue(s[i], out int anterior) && anterior >= inicio) inicio = anterior + 1;
            ultima[s[i]] = i;
            melhor = Math.Max(melhor, i - inicio + 1);
        }
        return melhor;
    }
}
```

## Go

```go
func maiorSubstring(s string) int {
	ultima := map[byte]int{}
	inicio, melhor := 0, 0
	for i := 0; i < len(s); i++ {
		if anterior, ok := ultima[s[i]]; ok && anterior >= inicio {
			inicio = anterior + 1
		}
		ultima[s[i]] = i
		melhor = max(melhor, i-inicio+1)
	}
	return melhor
}
```
