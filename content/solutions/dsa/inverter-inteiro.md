## Ideia

Os dígitos são extraídos de trás para frente: `x % 10` dá o último dígito e `x / 10` descarta esse dígito. A cada passo, o resultado parcial ganha o novo dígito com `resultado * 10 + digito`. Trabalhamos com o valor absoluto e reaplicamos o sinal no fim.

Como a entrada cabe em 32 bits, o número invertido tem no máximo 10 dígitos e cabe com folga num inteiro de 64 bits. Assim, conferimos no final se o valor com sinal está no intervalo de `-2^31` a `2^31 - 1` e devolvemos `0` caso contrário. Em Python, os inteiros não têm limite, então a mesma conferência vale.

## Complexidade

Tempo O(d), com d o número de dígitos (no máximo 10, na prática constante). Espaço O(1).

## Python

```python
def reverse_integer(x):
    sinal = -1 if x < 0 else 1
    restante = abs(x)
    resultado = 0
    while restante > 0:
        resultado = resultado * 10 + restante % 10
        restante //= 10
    resultado *= sinal
    if resultado < -2**31 or resultado > 2**31 - 1:
        return 0
    return resultado
```

## JavaScript

```javascript
function reverseInteger(x) {
  const sinal = x < 0 ? -1 : 1;
  let restante = Math.abs(x);
  let resultado = 0;
  while (restante > 0) {
    resultado = resultado * 10 + (restante % 10);
    restante = Math.floor(restante / 10);
  }
  resultado *= sinal;
  if (resultado < -(2 ** 31) || resultado > 2 ** 31 - 1) return 0;
  return resultado;
}
```

## TypeScript

```typescript
function reverseInteger(x: number): number {
  const sinal = x < 0 ? -1 : 1;
  let restante = Math.abs(x);
  let resultado = 0;
  while (restante > 0) {
    resultado = resultado * 10 + (restante % 10);
    restante = Math.floor(restante / 10);
  }
  resultado *= sinal;
  if (resultado < -(2 ** 31) || resultado > 2 ** 31 - 1) return 0;
  return resultado;
}
```

## Java

```java
class Solution {
    public int reverseInteger(long x) {
        long sinal = x < 0 ? -1 : 1;
        long restante = Math.abs(x);
        long resultado = 0;
        while (restante > 0) {
            resultado = resultado * 10 + restante % 10;
            restante /= 10;
        }
        resultado *= sinal;
        if (resultado < Integer.MIN_VALUE || resultado > Integer.MAX_VALUE) return 0;
        return (int) resultado;
    }
}
```

## C++

```cpp
class Solution {
public:
    int reverseInteger(long long x) {
        long long sinal = x < 0 ? -1 : 1;
        long long restante = x < 0 ? -x : x;
        long long resultado = 0;
        while (restante > 0) {
            resultado = resultado * 10 + restante % 10;
            restante /= 10;
        }
        resultado *= sinal;
        if (resultado < INT_MIN || resultado > INT_MAX) return 0;
        return (int)resultado;
    }
};
```

## C#

```csharp
public class Solution {
    public int ReverseInteger(long x) {
        long sinal = x < 0 ? -1 : 1;
        long restante = Math.Abs(x);
        long resultado = 0;
        while (restante > 0) {
            resultado = resultado * 10 + restante % 10;
            restante /= 10;
        }
        resultado *= sinal;
        if (resultado < int.MinValue || resultado > int.MaxValue) return 0;
        return (int)resultado;
    }
}
```

## Go

```go
func reverseInteger(x int64) int {
	var sinal int64 = 1
	restante := x
	if x < 0 {
		sinal = -1
		restante = -x
	}
	var resultado int64
	for restante > 0 {
		resultado = resultado*10 + restante%10
		restante /= 10
	}
	resultado *= sinal
	if resultado < -(1<<31) || resultado > 1<<31-1 {
		return 0
	}
	return int(resultado)
}
```
