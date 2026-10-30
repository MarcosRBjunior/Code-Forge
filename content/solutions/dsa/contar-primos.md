## Ideia

Use o crivo de Eratóstenes. Marque todos os números abaixo de `n` como primos, exceto 0 e 1. Para cada `p` que continua marcado e cujo quadrado ainda é menor que `n`, risque seus múltiplos começando em `p * p`: os múltiplos menores já foram riscados por fatores primos menores.

No fim, conte quantas posições continuam marcadas. Para `n` menor que 3 não há primos abaixo dele, e o código trata isso naturalmente com o vetor pequeno.

## Complexidade

Tempo O(n log log n). Espaço O(n) para o vetor de marcações.

## Python

```python
def count_primes(n):
    if n < 3:
        return 0
    primo = [True] * n
    primo[0] = primo[1] = False
    p = 2
    while p * p < n:
        if primo[p]:
            for m in range(p * p, n, p):
                primo[m] = False
        p += 1
    return sum(primo)
```

## JavaScript

```javascript
function countPrimes(n) {
  if (n < 3) return 0;
  const primo = new Array(n).fill(true);
  primo[0] = primo[1] = false;
  for (let p = 2; p * p < n; p++) {
    if (primo[p]) {
      for (let m = p * p; m < n; m += p) primo[m] = false;
    }
  }
  return primo.filter(Boolean).length;
}
```

## TypeScript

```typescript
function countPrimes(n: number): number {
  if (n < 3) return 0;
  const primo: boolean[] = new Array(n).fill(true);
  primo[0] = primo[1] = false;
  for (let p = 2; p * p < n; p++) {
    if (primo[p]) {
      for (let m = p * p; m < n; m += p) primo[m] = false;
    }
  }
  return primo.filter(Boolean).length;
}
```

## Java

```java
class Solution {
    public int countPrimes(int n) {
        if (n < 3) return 0;
        boolean[] composto = new boolean[n];
        int total = 0;
        for (int p = 2; p < n; p++) {
            if (!composto[p]) {
                total++;
                for (long m = (long) p * p; m < n; m += p) composto[(int) m] = true;
            }
        }
        return total;
    }
}
```

## C++

```cpp
class Solution {
public:
    int countPrimes(int n) {
        if (n < 3) return 0;
        vector<bool> composto(n, false);
        int total = 0;
        for (int p = 2; p < n; p++) {
            if (!composto[p]) {
                total++;
                for (long long m = (long long)p * p; m < n; m += p) composto[m] = true;
            }
        }
        return total;
    }
};
```

## C#

```csharp
public class Solution {
    public int CountPrimes(int n) {
        if (n < 3) return 0;
        var composto = new bool[n];
        int total = 0;
        for (int p = 2; p < n; p++) {
            if (!composto[p]) {
                total++;
                for (long m = (long)p * p; m < n; m += p) composto[m] = true;
            }
        }
        return total;
    }
}
```

## Go

```go
func countPrimes(n int) int {
	if n < 3 {
		return 0
	}
	composto := make([]bool, n)
	total := 0
	for p := 2; p < n; p++ {
		if !composto[p] {
			total++
			for m := p * p; m < n; m += p {
				composto[m] = true
			}
		}
	}
	return total
}
```
