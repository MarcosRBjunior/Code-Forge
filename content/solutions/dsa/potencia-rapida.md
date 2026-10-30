## Ideia

Elevar a `n` multiplicando `n` vezes é inviável com `n` até um bilhão. Em vez disso, olhe os bits do expoente: `x^n` é o produto de `x^(2^k)` para cada bit `k` ligado em `n`. As potências `x`, `x²`, `x⁴`, ... saem de elevar a base ao quadrado a cada passo.

Percorra os bits de `n` do menos para o mais significativo: se o bit atual é 1, multiplique o resultado pela base atual; depois eleve a base ao quadrado e desloque `n` um bit. Todas as contas são feitas módulo `1_000_000_007`, e a base negativa é normalizada para o intervalo de 0 a `1_000_000_006` antes de começar.

## Complexidade

Tempo O(log n), pois há uma iteração por bit do expoente. Espaço O(1).

## Python

```python
def fast_pow(x, n):
    MOD = 1_000_000_007
    base = x % MOD
    resultado = 1
    while n > 0:
        if n & 1:
            resultado = resultado * base % MOD
        base = base * base % MOD
        n >>= 1
    return resultado
```

## JavaScript

```javascript
function fastPow(x, n) {
  const MOD = 1000000007n;
  let base = ((BigInt(x) % MOD) + MOD) % MOD;
  let resultado = 1n;
  let e = n;
  while (e > 0) {
    if (e % 2 === 1) resultado = (resultado * base) % MOD;
    base = (base * base) % MOD;
    e = Math.floor(e / 2);
  }
  return Number(resultado);
}
```

## TypeScript

```typescript
function fastPow(x: number, n: number): number {
  const MOD = 1000000007n;
  let base = ((BigInt(x) % MOD) + MOD) % MOD;
  let resultado = 1n;
  let e = n;
  while (e > 0) {
    if (e % 2 === 1) resultado = (resultado * base) % MOD;
    base = (base * base) % MOD;
    e = Math.floor(e / 2);
  }
  return Number(resultado);
}
```

## Java

```java
class Solution {
    public int fastPow(int x, int n) {
        final long MOD = 1_000_000_007L;
        long base = ((x % MOD) + MOD) % MOD;
        long resultado = 1;
        while (n > 0) {
            if ((n & 1) == 1) resultado = resultado * base % MOD;
            base = base * base % MOD;
            n >>= 1;
        }
        return (int) resultado;
    }
}
```

## C++

```cpp
class Solution {
public:
    int fastPow(int x, int n) {
        const long long MOD = 1000000007LL;
        long long base = ((x % MOD) + MOD) % MOD;
        long long resultado = 1;
        while (n > 0) {
            if (n & 1) resultado = resultado * base % MOD;
            base = base * base % MOD;
            n >>= 1;
        }
        return (int)resultado;
    }
};
```

## C#

```csharp
public class Solution {
    public int FastPow(int x, int n) {
        long mod = 1000000007L;
        long b = ((long)x % mod + mod) % mod;
        long resultado = 1;
        long e = n;
        while (e > 0) {
            if (e % 2 == 1) resultado = (resultado * b) % mod;
            b = (b * b) % mod;
            e /= 2;
        }
        return (int)resultado;
    }
}
```

## Go

```go
func fastPow(x int, n int) int {
	const MOD = 1_000_000_007
	base := ((x % MOD) + MOD) % MOD
	resultado := 1
	for n > 0 {
		if n&1 == 1 {
			resultado = resultado * base % MOD
		}
		base = base * base % MOD
		n >>= 1
	}
	return resultado
}
```
