## Ideia

Seja `dp[i]` o número de formas de decodificar os primeiros `i` caracteres. O último trecho decodificado pode ser um dígito sozinho (de 1 a 9) ou dois dígitos (de 10 a 26). Então `dp[i]` soma `dp[i-1]` se o dígito atual não é `0`, e soma `dp[i-2]` se os dois últimos dígitos formam um número entre 10 e 26.

Um `0` isolado não decodifica nada, e por isso só conta como parte de `10` ou `20`. Como cada estado depende só dos dois anteriores, bastam duas variáveis em vez do vetor inteiro.

## Complexidade

Tempo O(n), com uma passada pela string. Espaço O(1).

## Python

```python
def num_decodings(s):
    if not s or s[0] == "0":
        return 0
    anterior, atual = 1, 1  # dp[i-2], dp[i-1]
    for i in range(1, len(s)):
        novo = 0
        if s[i] != "0":
            novo += atual
        if 10 <= int(s[i - 1:i + 1]) <= 26:
            novo += anterior
        anterior, atual = atual, novo
    return atual
```

## JavaScript

```javascript
function numDecodings(s) {
  if (s.length === 0 || s[0] === "0") return 0;
  let anterior = 1;
  let atual = 1;
  for (let i = 1; i < s.length; i++) {
    let novo = 0;
    if (s[i] !== "0") novo += atual;
    const dois = Number(s.slice(i - 1, i + 1));
    if (dois >= 10 && dois <= 26) novo += anterior;
    anterior = atual;
    atual = novo;
  }
  return atual;
}
```

## TypeScript

```typescript
function numDecodings(s: string): number {
  if (s.length === 0 || s[0] === "0") return 0;
  let anterior = 1;
  let atual = 1;
  for (let i = 1; i < s.length; i++) {
    let novo = 0;
    if (s[i] !== "0") novo += atual;
    const dois = Number(s.slice(i - 1, i + 1));
    if (dois >= 10 && dois <= 26) novo += anterior;
    anterior = atual;
    atual = novo;
  }
  return atual;
}
```

## Java

```java
class Solution {
    public int numDecodings(String s) {
        if (s.isEmpty() || s.charAt(0) == '0') return 0;
        int anterior = 1, atual = 1;
        for (int i = 1; i < s.length(); i++) {
            int novo = 0;
            if (s.charAt(i) != '0') novo += atual;
            int dois = (s.charAt(i - 1) - '0') * 10 + (s.charAt(i) - '0');
            if (dois >= 10 && dois <= 26) novo += anterior;
            anterior = atual;
            atual = novo;
        }
        return atual;
    }
}
```

## C++

```cpp
class Solution {
public:
    int numDecodings(string s) {
        if (s.empty() || s[0] == '0') return 0;
        int anterior = 1, atual = 1;
        for (int i = 1; i < (int)s.size(); i++) {
            int novo = 0;
            if (s[i] != '0') novo += atual;
            int dois = (s[i - 1] - '0') * 10 + (s[i] - '0');
            if (dois >= 10 && dois <= 26) novo += anterior;
            anterior = atual;
            atual = novo;
        }
        return atual;
    }
};
```

## C#

```csharp
public class Solution {
    public int NumDecodings(string s) {
        if (s.Length == 0 || s[0] == '0') return 0;
        int anterior = 1, atual = 1;
        for (int i = 1; i < s.Length; i++) {
            int novo = 0;
            if (s[i] != '0') novo += atual;
            int dois = (s[i - 1] - '0') * 10 + (s[i] - '0');
            if (dois >= 10 && dois <= 26) novo += anterior;
            anterior = atual;
            atual = novo;
        }
        return atual;
    }
}
```

## Go

```go
func numDecodings(s string) int {
	if len(s) == 0 || s[0] == '0' {
		return 0
	}
	anterior, atual := 1, 1
	for i := 1; i < len(s); i++ {
		novo := 0
		if s[i] != '0' {
			novo += atual
		}
		dois := int(s[i-1]-'0')*10 + int(s[i]-'0')
		if dois >= 10 && dois <= 26 {
			novo += anterior
		}
		anterior, atual = atual, novo
	}
	return atual
}
```
