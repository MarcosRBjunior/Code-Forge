## Ideia

Percorra a string mantendo o texto que está sendo montado e o número `k` lido por último. Ao encontrar `[`, guarde numa pilha o texto montado até ali e o valor de `k`, e recomece com um texto vazio para o conteúdo do colchete.

Ao encontrar `]`, desempilhe o texto anterior e o contador, repita o trecho atual `k` vezes e cole depois do texto anterior. Dígitos acumulam o contador (podem ter vários dígitos) e letras são simplesmente anexadas. Isso lida com o aninhamento, porque cada nível de colchete tem seu próprio par na pilha.

## Complexidade

Tempo proporcional ao tamanho da saída, no pior caso, mais O(n) para ler a entrada. Espaço proporcional à profundidade do aninhamento mais a saída.

## Python

```python
def decode_string(s):
    pilha = []
    atual = ""
    k = 0
    for c in s:
        if c.isdigit():
            k = k * 10 + int(c)
        elif c == "[":
            pilha.append((atual, k))
            atual, k = "", 0
        elif c == "]":
            anterior, vezes = pilha.pop()
            atual = anterior + atual * vezes
        else:
            atual += c
    return atual
```

## JavaScript

```javascript
function decodeString(s) {
  const pilha = [];
  let atual = "";
  let k = 0;
  for (const c of s) {
    if (c >= "0" && c <= "9") {
      k = k * 10 + Number(c);
    } else if (c === "[") {
      pilha.push([atual, k]);
      atual = "";
      k = 0;
    } else if (c === "]") {
      const [anterior, vezes] = pilha.pop();
      atual = anterior + atual.repeat(vezes);
    } else {
      atual += c;
    }
  }
  return atual;
}
```

## TypeScript

```typescript
function decodeString(s: string): string {
  const pilha: [string, number][] = [];
  let atual = "";
  let k = 0;
  for (const c of s) {
    if (c >= "0" && c <= "9") {
      k = k * 10 + Number(c);
    } else if (c === "[") {
      pilha.push([atual, k]);
      atual = "";
      k = 0;
    } else if (c === "]") {
      const [anterior, vezes] = pilha.pop() as [string, number];
      atual = anterior + atual.repeat(vezes);
    } else {
      atual += c;
    }
  }
  return atual;
}
```

## Java

```java
class Solution {
    public String decodeString(String s) {
        Deque<StringBuilder> textos = new ArrayDeque<>();
        Deque<Integer> contadores = new ArrayDeque<>();
        StringBuilder atual = new StringBuilder();
        int k = 0;
        for (char c : s.toCharArray()) {
            if (Character.isDigit(c)) {
                k = k * 10 + (c - '0');
            } else if (c == '[') {
                textos.push(atual);
                contadores.push(k);
                atual = new StringBuilder();
                k = 0;
            } else if (c == ']') {
                StringBuilder anterior = textos.pop();
                int vezes = contadores.pop();
                for (int i = 0; i < vezes; i++) anterior.append(atual);
                atual = anterior;
            } else {
                atual.append(c);
            }
        }
        return atual.toString();
    }
}
```

## C++

```cpp
class Solution {
public:
    string decodeString(string s) {
        vector<pair<string, int>> pilha;
        string atual;
        int k = 0;
        for (char c : s) {
            if (isdigit(c)) {
                k = k * 10 + (c - '0');
            } else if (c == '[') {
                pilha.push_back({atual, k});
                atual.clear();
                k = 0;
            } else if (c == ']') {
                auto [anterior, vezes] = pilha.back();
                pilha.pop_back();
                for (int i = 0; i < vezes; i++) anterior += atual;
                atual = anterior;
            } else {
                atual += c;
            }
        }
        return atual;
    }
};
```

## C#

```csharp
public class Solution {
    public string DecodeString(string s) {
        var textos = new Stack<StringBuilder>();
        var contadores = new Stack<int>();
        var atual = new StringBuilder();
        int k = 0;
        foreach (char c in s) {
            if (char.IsDigit(c)) {
                k = k * 10 + (c - '0');
            } else if (c == '[') {
                textos.Push(atual);
                contadores.Push(k);
                atual = new StringBuilder();
                k = 0;
            } else if (c == ']') {
                var anterior = textos.Pop();
                int vezes = contadores.Pop();
                for (int i = 0; i < vezes; i++) anterior.Append(atual);
                atual = anterior;
            } else {
                atual.Append(c);
            }
        }
        return atual.ToString();
    }
}
```

## Go

```go
import "strings"

func decodeString(s string) string {
	type quadro struct {
		texto string
		vezes int
	}
	var pilha []quadro
	atual := ""
	k := 0
	for _, c := range s {
		switch {
		case c >= '0' && c <= '9':
			k = k*10 + int(c-'0')
		case c == '[':
			pilha = append(pilha, quadro{atual, k})
			atual, k = "", 0
		case c == ']':
			topo := pilha[len(pilha)-1]
			pilha = pilha[:len(pilha)-1]
			atual = topo.texto + strings.Repeat(atual, topo.vezes)
		default:
			atual += string(c)
		}
	}
	return atual
}
```
