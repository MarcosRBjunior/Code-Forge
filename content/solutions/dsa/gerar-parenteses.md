## Ideia

Construímos a string um caractere por vez com backtracking, mantendo a contagem de parênteses já abertos e já fechados. Só é permitido colocar um `(` enquanto ainda restam aberturas a usar (menos que `n`), e só é permitido colocar um `)` quando há mais aberturas do que fechamentos, ou seja, quando existe algo para fechar.

Essas duas regras garantem que nunca geramos um prefixo inválido, então não há nada para filtrar depois: toda string que chega ao tamanho `2n` já está bem formada.

## Complexidade

O número de resultados é o n-ésimo número de Catalan, e cada string tem tamanho `2n`, então tempo e espaço de saída são da ordem de O(Catalan(n) × n). A recursão usa O(n) de pilha.

## Python

```python
def generate_parenthesis(n):
    resultado = []
    atual = []

    def construir(abertos, fechados):
        if len(atual) == 2 * n:
            resultado.append("".join(atual))
            return
        if abertos < n:
            atual.append("(")
            construir(abertos + 1, fechados)
            atual.pop()
        if fechados < abertos:
            atual.append(")")
            construir(abertos, fechados + 1)
            atual.pop()

    construir(0, 0)
    return resultado
```

## JavaScript

```javascript
function generateParenthesis(n) {
  const resultado = [];

  function construir(atual, abertos, fechados) {
    if (atual.length === 2 * n) {
      resultado.push(atual);
      return;
    }
    if (abertos < n) construir(atual + "(", abertos + 1, fechados);
    if (fechados < abertos) construir(atual + ")", abertos, fechados + 1);
  }

  construir("", 0, 0);
  return resultado;
}
```

## TypeScript

```typescript
function generateParenthesis(n: number): string[] {
  const resultado: string[] = [];

  function construir(atual: string, abertos: number, fechados: number): void {
    if (atual.length === 2 * n) {
      resultado.push(atual);
      return;
    }
    if (abertos < n) construir(atual + "(", abertos + 1, fechados);
    if (fechados < abertos) construir(atual + ")", abertos, fechados + 1);
  }

  construir("", 0, 0);
  return resultado;
}
```

## Java

```java
class Solution {
    public String[] generateParenthesis(int n) {
        List<String> resultado = new ArrayList<>();
        construir(new StringBuilder(), 0, 0, n, resultado);
        return resultado.toArray(new String[0]);
    }

    private void construir(StringBuilder atual, int abertos, int fechados, int n, List<String> resultado) {
        if (atual.length() == 2 * n) {
            resultado.add(atual.toString());
            return;
        }
        if (abertos < n) {
            atual.append('(');
            construir(atual, abertos + 1, fechados, n, resultado);
            atual.deleteCharAt(atual.length() - 1);
        }
        if (fechados < abertos) {
            atual.append(')');
            construir(atual, abertos, fechados + 1, n, resultado);
            atual.deleteCharAt(atual.length() - 1);
        }
    }
}
```

## C++

```cpp
class Solution {
public:
    vector<string> generateParenthesis(int n) {
        vector<string> resultado;
        string atual;
        construir(atual, 0, 0, n, resultado);
        return resultado;
    }

private:
    void construir(string& atual, int abertos, int fechados, int n, vector<string>& resultado) {
        if ((int)atual.size() == 2 * n) {
            resultado.push_back(atual);
            return;
        }
        if (abertos < n) {
            atual.push_back('(');
            construir(atual, abertos + 1, fechados, n, resultado);
            atual.pop_back();
        }
        if (fechados < abertos) {
            atual.push_back(')');
            construir(atual, abertos, fechados + 1, n, resultado);
            atual.pop_back();
        }
    }
};
```

## C#

```csharp
public class Solution {
    public string[] GenerateParenthesis(int n) {
        var resultado = new List<string>();
        Construir(new StringBuilder(), 0, 0, n, resultado);
        return resultado.ToArray();
    }

    private void Construir(StringBuilder atual, int abertos, int fechados, int n, List<string> resultado) {
        if (atual.Length == 2 * n) {
            resultado.Add(atual.ToString());
            return;
        }
        if (abertos < n) {
            atual.Append('(');
            Construir(atual, abertos + 1, fechados, n, resultado);
            atual.Length--;
        }
        if (fechados < abertos) {
            atual.Append(')');
            Construir(atual, abertos, fechados + 1, n, resultado);
            atual.Length--;
        }
    }
}
```

## Go

```go
func generateParenthesis(n int) []string {
	resultado := []string{}
	atual := make([]byte, 0, 2*n)

	var construir func(abertos, fechados int)
	construir = func(abertos, fechados int) {
		if len(atual) == 2*n {
			resultado = append(resultado, string(atual))
			return
		}
		if abertos < n {
			atual = append(atual, '(')
			construir(abertos+1, fechados)
			atual = atual[:len(atual)-1]
		}
		if fechados < abertos {
			atual = append(atual, ')')
			construir(abertos, fechados+1)
			atual = atual[:len(atual)-1]
		}
	}

	construir(0, 0)
	return resultado
}
```
