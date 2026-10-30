## Ideia

Todo palíndromo tem um centro: um caractere (tamanho ímpar) ou o espaço entre dois (tamanho par). Para cada um dos `2n - 1` centros, expandimos para fora enquanto os dois lados forem iguais, e guardamos o maior trecho encontrado.

Para respeitar o desempate (o que começa primeiro), só trocamos o melhor quando o novo é estritamente maior; como varremos os centros da esquerda para a direita, palíndromos de mesmo tamanho aparecem em ordem crescente de início.

## Complexidade

Tempo O(n²) no pior caso, pois cada expansão pode custar O(n). Espaço O(1) além da resposta.

## Python

```python
def longest_palindrome(s):
    inicio, tamanho = 0, 1

    def expandir(esq, dir):
        while esq >= 0 and dir < len(s) and s[esq] == s[dir]:
            esq -= 1
            dir += 1
        return esq + 1, dir - esq - 1

    for i in range(len(s)):
        for a, b in (expandir(i, i), expandir(i, i + 1)):
            if b > tamanho:
                inicio, tamanho = a, b
    return s[inicio:inicio + tamanho]
```

## JavaScript

```javascript
function longestPalindrome(s) {
  let inicio = 0, tamanho = 1;
  const expandir = (esq, dir) => {
    while (esq >= 0 && dir < s.length && s[esq] === s[dir]) {
      esq--;
      dir++;
    }
    return [esq + 1, dir - esq - 1];
  };
  for (let i = 0; i < s.length; i++) {
    for (const [a, b] of [expandir(i, i), expandir(i, i + 1)]) {
      if (b > tamanho) {
        inicio = a;
        tamanho = b;
      }
    }
  }
  return s.slice(inicio, inicio + tamanho);
}
```

## TypeScript

```typescript
function longestPalindrome(s: string): string {
  let inicio = 0, tamanho = 1;
  const expandir = (esq: number, dir: number): [number, number] => {
    while (esq >= 0 && dir < s.length && s[esq] === s[dir]) {
      esq--;
      dir++;
    }
    return [esq + 1, dir - esq - 1];
  };
  for (let i = 0; i < s.length; i++) {
    for (const [a, b] of [expandir(i, i), expandir(i, i + 1)]) {
      if (b > tamanho) {
        inicio = a;
        tamanho = b;
      }
    }
  }
  return s.slice(inicio, inicio + tamanho);
}
```

## Java

```java
class Solution {
    public String longestPalindrome(String s) {
        int inicio = 0, tamanho = 1;
        for (int i = 0; i < s.length(); i++) {
            for (int par = 0; par < 2; par++) {
                int esq = i, dir = i + par;
                while (esq >= 0 && dir < s.length() && s.charAt(esq) == s.charAt(dir)) {
                    esq--;
                    dir++;
                }
                int comprimento = dir - esq - 1;
                if (comprimento > tamanho) {
                    inicio = esq + 1;
                    tamanho = comprimento;
                }
            }
        }
        return s.substring(inicio, inicio + tamanho);
    }
}
```

## C++

```cpp
class Solution {
public:
    string longestPalindrome(string s) {
        int n = s.size(), inicio = 0, tamanho = 1;
        for (int i = 0; i < n; i++) {
            for (int par = 0; par < 2; par++) {
                int esq = i, dir = i + par;
                while (esq >= 0 && dir < n && s[esq] == s[dir]) {
                    esq--;
                    dir++;
                }
                int comprimento = dir - esq - 1;
                if (comprimento > tamanho) {
                    inicio = esq + 1;
                    tamanho = comprimento;
                }
            }
        }
        return s.substr(inicio, tamanho);
    }
};
```

## C#

```csharp
public class Solution {
    public string LongestPalindrome(string s) {
        int inicio = 0, tamanho = 1;
        for (int i = 0; i < s.Length; i++) {
            for (int par = 0; par < 2; par++) {
                int esq = i, dir = i + par;
                while (esq >= 0 && dir < s.Length && s[esq] == s[dir]) {
                    esq--;
                    dir++;
                }
                int comprimento = dir - esq - 1;
                if (comprimento > tamanho) {
                    inicio = esq + 1;
                    tamanho = comprimento;
                }
            }
        }
        return s.Substring(inicio, tamanho);
    }
}
```

## Go

```go
func longestPalindrome(s string) string {
	inicio, tamanho := 0, 1
	for i := 0; i < len(s); i++ {
		for par := 0; par < 2; par++ {
			esq, dir := i, i+par
			for esq >= 0 && dir < len(s) && s[esq] == s[dir] {
				esq--
				dir++
			}
			comprimento := dir - esq - 1
			if comprimento > tamanho {
				inicio = esq + 1
				tamanho = comprimento
			}
		}
	}
	return s[inicio : inicio+tamanho]
}
```
