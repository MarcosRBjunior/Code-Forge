## Ideia

A sequência de somas dos quadrados dos dígitos é determinística: cada valor determina o próximo. Logo ela ou chega a `1` (número feliz) ou entra num ciclo. Para detectar o ciclo basta guardar os valores já vistos num conjunto: se o próximo valor já apareceu, a sequência está girando sem passar por `1`.

Como a soma dos quadrados dos dígitos de qualquer número grande é bem menor que o próprio número, a sequência rapidamente fica limitada a poucos valores, e por isso o conjunto permanece pequeno.

## Complexidade

Tempo O(log n) para o primeiro passo e uma quantidade pequena e limitada de passos depois; na prática, tempo praticamente constante. Espaço O(1) em termos práticos, pois o conjunto guarda poucos valores.

## Python

```python
def is_happy(n):
    vistos = set()
    while n != 1 and n not in vistos:
        vistos.add(n)
        n = sum(int(d) ** 2 for d in str(n))
    return n == 1
```

## JavaScript

```javascript
function isHappy(n) {
  const vistos = new Set();
  while (n !== 1 && !vistos.has(n)) {
    vistos.add(n);
    let soma = 0;
    while (n > 0) {
      const d = n % 10;
      soma += d * d;
      n = Math.floor(n / 10);
    }
    n = soma;
  }
  return n === 1;
}
```

## TypeScript

```typescript
function isHappy(n: number): boolean {
  const vistos = new Set<number>();
  while (n !== 1 && !vistos.has(n)) {
    vistos.add(n);
    let soma = 0;
    while (n > 0) {
      const d = n % 10;
      soma += d * d;
      n = Math.floor(n / 10);
    }
    n = soma;
  }
  return n === 1;
}
```

## Java

```java
class Solution {
    public boolean isHappy(int n) {
        Set<Integer> vistos = new HashSet<>();
        while (n != 1 && !vistos.contains(n)) {
            vistos.add(n);
            int soma = 0;
            while (n > 0) {
                int d = n % 10;
                soma += d * d;
                n /= 10;
            }
            n = soma;
        }
        return n == 1;
    }
}
```

## C++

```cpp
class Solution {
public:
    bool isHappy(int n) {
        unordered_set<int> vistos;
        while (n != 1 && !vistos.count(n)) {
            vistos.insert(n);
            int soma = 0;
            while (n > 0) {
                int d = n % 10;
                soma += d * d;
                n /= 10;
            }
            n = soma;
        }
        return n == 1;
    }
};
```

## C#

```csharp
public class Solution {
    public bool IsHappy(int n) {
        var vistos = new HashSet<int>();
        while (n != 1 && !vistos.Contains(n)) {
            vistos.Add(n);
            int soma = 0;
            while (n > 0) {
                int d = n % 10;
                soma += d * d;
                n /= 10;
            }
            n = soma;
        }
        return n == 1;
    }
}
```

## Go

```go
func isHappy(n int) bool {
	vistos := map[int]bool{}
	for n != 1 && !vistos[n] {
		vistos[n] = true
		soma := 0
		for n > 0 {
			d := n % 10
			soma += d * d
			n /= 10
		}
		n = soma
	}
	return n == 1
}
```
