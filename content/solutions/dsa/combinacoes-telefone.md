## Ideia

Cada dígito oferece um conjunto de letras, e uma palavra completa escolhe uma letra por dígito. Isso é um backtracking natural: mantenha o prefixo construído até agora e, para o dígito da posição atual, tente cada uma das suas letras, descendo para a posição seguinte.

Quando o prefixo tem o mesmo tamanho de `digits`, ele é uma palavra completa e vai para o resultado. O caso de `digits` vazio é tratado à parte, devolvendo lista vazia em vez de uma lista com a string vazia.

## Complexidade

Tempo `O(4^n * n)` no pior caso, pois há até `4^n` palavras de tamanho `n`. Espaço `O(n)` além do resultado.

## Python

```python
def letter_combinations(digits):
    if not digits:
        return []
    letras = {"2": "abc", "3": "def", "4": "ghi", "5": "jkl",
              "6": "mno", "7": "pqrs", "8": "tuv", "9": "wxyz"}
    resultado = []

    def montar(pos, prefixo):
        if pos == len(digits):
            resultado.append(prefixo)
            return
        for letra in letras[digits[pos]]:
            montar(pos + 1, prefixo + letra)

    montar(0, "")
    return resultado
```

## JavaScript

```javascript
function letterCombinations(digits) {
  if (digits.length === 0) return [];
  const letras = {
    2: "abc", 3: "def", 4: "ghi", 5: "jkl",
    6: "mno", 7: "pqrs", 8: "tuv", 9: "wxyz",
  };
  const resultado = [];

  const montar = (pos, prefixo) => {
    if (pos === digits.length) {
      resultado.push(prefixo);
      return;
    }
    for (const letra of letras[digits[pos]]) montar(pos + 1, prefixo + letra);
  };

  montar(0, "");
  return resultado;
}
```

## TypeScript

```typescript
function letterCombinations(digits: string): string[] {
  if (digits.length === 0) return [];
  const letras: Record<string, string> = {
    "2": "abc", "3": "def", "4": "ghi", "5": "jkl",
    "6": "mno", "7": "pqrs", "8": "tuv", "9": "wxyz",
  };
  const resultado: string[] = [];

  const montar = (pos: number, prefixo: string): void => {
    if (pos === digits.length) {
      resultado.push(prefixo);
      return;
    }
    for (const letra of letras[digits[pos]]) montar(pos + 1, prefixo + letra);
  };

  montar(0, "");
  return resultado;
}
```

## Java

```java
class Solution {
    private static final String[] LETRAS = {
        "", "", "abc", "def", "ghi", "jkl", "mno", "pqrs", "tuv", "wxyz"
    };

    public String[] letterCombinations(String digits) {
        List<String> resultado = new ArrayList<>();
        if (!digits.isEmpty()) montar(digits, 0, new StringBuilder(), resultado);
        return resultado.toArray(new String[0]);
    }

    private void montar(String digits, int pos, StringBuilder prefixo, List<String> resultado) {
        if (pos == digits.length()) {
            resultado.add(prefixo.toString());
            return;
        }
        for (char letra : LETRAS[digits.charAt(pos) - '0'].toCharArray()) {
            prefixo.append(letra);
            montar(digits, pos + 1, prefixo, resultado);
            prefixo.deleteCharAt(prefixo.length() - 1);
        }
    }
}
```

## C++

```cpp
class Solution {
    void montar(const string& digits, size_t pos, string& prefixo, vector<string>& resultado) {
        static const vector<string> letras = {
            "", "", "abc", "def", "ghi", "jkl", "mno", "pqrs", "tuv", "wxyz"
        };
        if (pos == digits.size()) {
            resultado.push_back(prefixo);
            return;
        }
        for (char letra : letras[digits[pos] - '0']) {
            prefixo.push_back(letra);
            montar(digits, pos + 1, prefixo, resultado);
            prefixo.pop_back();
        }
    }

public:
    vector<string> letterCombinations(string digits) {
        vector<string> resultado;
        if (digits.empty()) return resultado;
        string prefixo;
        montar(digits, 0, prefixo, resultado);
        return resultado;
    }
};
```

## C#

```csharp
public class Solution {
    private static readonly string[] Letras = {
        "", "", "abc", "def", "ghi", "jkl", "mno", "pqrs", "tuv", "wxyz"
    };

    public string[] LetterCombinations(string digits) {
        var resultado = new List<string>();
        if (digits.Length > 0) Montar(digits, 0, new StringBuilder(), resultado);
        return resultado.ToArray();
    }

    private void Montar(string digits, int pos, StringBuilder prefixo, List<string> resultado) {
        if (pos == digits.Length) {
            resultado.Add(prefixo.ToString());
            return;
        }
        foreach (char letra in Letras[digits[pos] - '0']) {
            prefixo.Append(letra);
            Montar(digits, pos + 1, prefixo, resultado);
            prefixo.Length--;
        }
    }
}
```

## Go

```go
func letterCombinations(digits string) []string {
	resultado := []string{}
	if len(digits) == 0 {
		return resultado
	}
	letras := []string{"", "", "abc", "def", "ghi", "jkl", "mno", "pqrs", "tuv", "wxyz"}

	var montar func(pos int, prefixo []byte)
	montar = func(pos int, prefixo []byte) {
		if pos == len(digits) {
			resultado = append(resultado, string(prefixo))
			return
		}
		for _, letra := range []byte(letras[digits[pos]-'0']) {
			montar(pos+1, append(prefixo, letra))
		}
	}

	montar(0, []byte{})
	return resultado
}
```
