## Ideia

A soma de dois bits sem considerar o "vai um" é o XOR, e o "vai um" aparece onde ambos os bits são 1, deslocado uma casa para a esquerda: `(a & b) << 1`. Então `a + b` é igual a `(a ^ b) + ((a & b) << 1)`. Repetimos essa troca até que não sobre mais "vai um" (`b` igual a zero); a cada rodada o vai-um sobe pelo menos um bit, então o laço termina em no máximo 32 voltas.

Para respeitar os 32 bits em complemento de dois, o cálculo deve ser feito com 32 bits. Em Python, que tem inteiros ilimitados, aplicamos uma máscara de 32 bits e, no fim, reinterpretamos o resultado como número com sinal.

## Complexidade

Tempo O(1), pois há no máximo 32 iterações. Espaço O(1).

## Python

```python
def get_sum(a, b):
    mascara = 0xFFFFFFFF
    a &= mascara
    b &= mascara
    while b:
        vai_um = ((a & b) << 1) & mascara
        a = (a ^ b) & mascara
        b = vai_um
    # reinterpreta como inteiro de 32 bits com sinal
    return a if a < 0x80000000 else ~(a ^ mascara)
```

## JavaScript

```javascript
function getSum(a, b) {
  // os operadores de bits do JavaScript já trabalham com 32 bits com sinal
  while (b !== 0) {
    const vaiUm = (a & b) << 1;
    a = a ^ b;
    b = vaiUm;
  }
  return a;
}
```

## TypeScript

```typescript
function getSum(a: number, b: number): number {
  // os operadores de bits do TypeScript já trabalham com 32 bits com sinal
  while (b !== 0) {
    const vaiUm = (a & b) << 1;
    a = a ^ b;
    b = vaiUm;
  }
  return a;
}
```

## Java

```java
class Solution {
    public int getSum(int a, int b) {
        while (b != 0) {
            int vaiUm = (a & b) << 1;
            a = a ^ b;
            b = vaiUm;
        }
        return a;
    }
}
```

## C++

```cpp
class Solution {
public:
    int getSum(int a, int b) {
        // unsigned evita comportamento indefinido no deslocamento de negativos
        unsigned int x = a, y = b;
        while (y != 0) {
            unsigned int vaiUm = (x & y) << 1;
            x = x ^ y;
            y = vaiUm;
        }
        return (int)x;
    }
};
```

## C#

```csharp
public class Solution {
    public int GetSum(int a, int b) {
        while (b != 0) {
            int vaiUm = (a & b) << 1;
            a = a ^ b;
            b = vaiUm;
        }
        return a;
    }
}
```

## Go

```go
func getSum(a int, b int) int {
	x, y := int32(a), int32(b)
	for y != 0 {
		vaiUm := (x & y) << 1
		x = x ^ y
		y = vaiUm
	}
	return int(x)
}
```
