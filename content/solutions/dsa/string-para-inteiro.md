## Ideia

Siga as regras na ordem, com um índice que avança pela string. Primeiro pule os espaços, depois leia um único sinal opcional, e por fim acumule dígitos enquanto eles aparecerem. Qualquer outro caractere encerra a leitura.

Para tratar o estouro sem depender de inteiros maiores, verifique antes de cada acumulação se `valor * 10 + digito` passaria do limite. Se passar, devolva diretamente o limite (`2^31 - 1` ou `-2^31`, conforme o sinal). Assim o valor parcial nunca ultrapassa o intervalo de 32 bits.

## Complexidade

Tempo O(n), com uma passada pela string. Espaço O(1).

## Python

```python
def my_atoi(s):
    maximo = 2**31 - 1
    minimo = -(2**31)
    i, n = 0, len(s)
    while i < n and s[i] == " ":
        i += 1
    sinal = 1
    if i < n and s[i] in "+-":
        if s[i] == "-":
            sinal = -1
        i += 1
    valor = 0
    while i < n and "0" <= s[i] <= "9":
        valor = valor * 10 + (ord(s[i]) - ord("0"))
        if sinal * valor >= maximo:
            return maximo
        if sinal * valor <= minimo:
            return minimo
        i += 1
    return sinal * valor
```

## JavaScript

```javascript
function myAtoi(s) {
  const maximo = 2 ** 31 - 1;
  const minimo = -(2 ** 31);
  let i = 0;
  const n = s.length;
  while (i < n && s[i] === " ") i++;
  let sinal = 1;
  if (i < n && (s[i] === "+" || s[i] === "-")) {
    if (s[i] === "-") sinal = -1;
    i++;
  }
  let valor = 0;
  while (i < n && s[i] >= "0" && s[i] <= "9") {
    valor = valor * 10 + (s.charCodeAt(i) - 48);
    if (sinal * valor >= maximo) return maximo;
    if (sinal * valor <= minimo) return minimo;
    i++;
  }
  return sinal * valor;
}
```

## TypeScript

```typescript
function myAtoi(s: string): number {
  const maximo = 2 ** 31 - 1;
  const minimo = -(2 ** 31);
  let i = 0;
  const n = s.length;
  while (i < n && s[i] === " ") i++;
  let sinal = 1;
  if (i < n && (s[i] === "+" || s[i] === "-")) {
    if (s[i] === "-") sinal = -1;
    i++;
  }
  let valor = 0;
  while (i < n && s[i] >= "0" && s[i] <= "9") {
    valor = valor * 10 + (s.charCodeAt(i) - 48);
    if (sinal * valor >= maximo) return maximo;
    if (sinal * valor <= minimo) return minimo;
    i++;
  }
  return sinal * valor;
}
```

## Java

```java
class Solution {
    public long myAtoi(String s) {
        final long maximo = Integer.MAX_VALUE;
        final long minimo = Integer.MIN_VALUE;
        int i = 0, n = s.length();
        while (i < n && s.charAt(i) == ' ') i++;
        long sinal = 1;
        if (i < n && (s.charAt(i) == '+' || s.charAt(i) == '-')) {
            if (s.charAt(i) == '-') sinal = -1;
            i++;
        }
        long valor = 0;
        while (i < n && s.charAt(i) >= '0' && s.charAt(i) <= '9') {
            valor = valor * 10 + (s.charAt(i) - '0');
            if (sinal * valor >= maximo) return maximo;
            if (sinal * valor <= minimo) return minimo;
            i++;
        }
        return sinal * valor;
    }
}
```

## C++

```cpp
class Solution {
public:
    long long myAtoi(string s) {
        const long long maximo = INT_MAX;
        const long long minimo = INT_MIN;
        int i = 0, n = s.size();
        while (i < n && s[i] == ' ') i++;
        long long sinal = 1;
        if (i < n && (s[i] == '+' || s[i] == '-')) {
            if (s[i] == '-') sinal = -1;
            i++;
        }
        long long valor = 0;
        while (i < n && s[i] >= '0' && s[i] <= '9') {
            valor = valor * 10 + (s[i] - '0');
            if (sinal * valor >= maximo) return maximo;
            if (sinal * valor <= minimo) return minimo;
            i++;
        }
        return sinal * valor;
    }
};
```

## C#

```csharp
public class Solution {
    public long MyAtoi(string s) {
        const long maximo = int.MaxValue;
        const long minimo = int.MinValue;
        int i = 0, n = s.Length;
        while (i < n && s[i] == ' ') i++;
        long sinal = 1;
        if (i < n && (s[i] == '+' || s[i] == '-')) {
            if (s[i] == '-') sinal = -1;
            i++;
        }
        long valor = 0;
        while (i < n && s[i] >= '0' && s[i] <= '9') {
            valor = valor * 10 + (s[i] - '0');
            if (sinal * valor >= maximo) return maximo;
            if (sinal * valor <= minimo) return minimo;
            i++;
        }
        return sinal * valor;
    }
}
```

## Go

```go
func myAtoi(s string) int64 {
	const maximo = int64(1<<31 - 1)
	const minimo = int64(-1 << 31)
	i, n := 0, len(s)
	for i < n && s[i] == ' ' {
		i++
	}
	sinal := int64(1)
	if i < n && (s[i] == '+' || s[i] == '-') {
		if s[i] == '-' {
			sinal = -1
		}
		i++
	}
	valor := int64(0)
	for i < n && s[i] >= '0' && s[i] <= '9' {
		valor = valor*10 + int64(s[i]-'0')
		if sinal*valor >= maximo {
			return maximo
		}
		if sinal*valor <= minimo {
			return minimo
		}
		i++
	}
	return sinal * valor
}
```
