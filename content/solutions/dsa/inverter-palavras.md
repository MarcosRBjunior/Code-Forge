## Ideia

O problema são os espaços extras: no começo, no fim e repetidos entre as palavras. A solução mais direta é primeiro separar a string em palavras ignorando qualquer quantidade de espaços, o que já descarta as pontas e as repetições, depois inverter a lista de palavras e juntá-la com um único espaço.

Cada palavra permanece intacta, então as letras dentro dela mantêm a ordem original. Só a ordem das palavras muda.

## Complexidade

Tempo O(n), com n o tamanho da string. Espaço O(n) para a lista de palavras e a saída.

## Python

```python
def reverse_words(s):
    return " ".join(reversed(s.split()))
```

## JavaScript

```javascript
function reverseWords(s) {
  return s.split(" ").filter((p) => p !== "").reverse().join(" ");
}
```

## TypeScript

```typescript
function reverseWords(s: string): string {
  return s.split(" ").filter((p) => p !== "").reverse().join(" ");
}
```

## Java

```java
class Solution {
    public String reverseWords(String s) {
        String[] palavras = s.trim().split(" +");
        StringBuilder sb = new StringBuilder();
        for (int i = palavras.length - 1; i >= 0; i--) {
            sb.append(palavras[i]);
            if (i > 0) sb.append(' ');
        }
        return sb.toString();
    }
}
```

## C++

```cpp
class Solution {
public:
    string reverseWords(string s) {
        istringstream entrada(s);
        vector<string> palavras;
        string palavra;
        while (entrada >> palavra) palavras.push_back(palavra);
        string resultado;
        for (int i = (int)palavras.size() - 1; i >= 0; i--) {
            resultado += palavras[i];
            if (i > 0) resultado += ' ';
        }
        return resultado;
    }
};
```

## C#

```csharp
public class Solution {
    public string ReverseWords(string s) {
        string[] palavras = s.Split(' ', StringSplitOptions.RemoveEmptyEntries);
        Array.Reverse(palavras);
        return string.Join(" ", palavras);
    }
}
```

## Go

```go
import "strings"

func reverseWords(s string) string {
	palavras := strings.Fields(s)
	for i, j := 0, len(palavras)-1; i < j; i, j = i+1, j-1 {
		palavras[i], palavras[j] = palavras[j], palavras[i]
	}
	return strings.Join(palavras, " ")
}
```
