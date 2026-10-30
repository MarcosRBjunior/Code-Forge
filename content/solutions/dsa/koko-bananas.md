## Ideia

Se o macaco consegue terminar em `h` horas com velocidade `v`, também consegue com qualquer velocidade maior. Essa monotonicidade permite fazer busca binária sobre a resposta, entre 1 e a maior pilha (com a maior pilha como velocidade, cada pilha leva uma hora, e isso basta pois `h` é pelo menos o número de pilhas).

Para testar uma velocidade, soma-se o teto de `pilha / v` de cada pilha e compara-se com `h`. Calcule o teto com aritmética inteira, `(pilha + v - 1) / v`, para evitar erros de ponto flutuante. Se couber, tente uma velocidade menor; senão, uma maior.

## Complexidade

Tempo `O(n log m)`, onde `m` é a maior pilha. Espaço `O(1)`. A soma de horas pode passar de 32 bits, por isso usamos inteiros de 64 bits onde a linguagem exige.

## Python

```python
def min_eating_speed(piles, h):
    esquerda, direita = 1, max(piles)
    while esquerda < direita:
        v = (esquerda + direita) // 2
        horas = sum((p + v - 1) // v for p in piles)
        if horas <= h:
            direita = v
        else:
            esquerda = v + 1
    return esquerda
```

## JavaScript

```javascript
function minEatingSpeed(piles, h) {
  let esquerda = 1;
  let direita = Math.max(...piles);
  while (esquerda < direita) {
    const v = Math.floor((esquerda + direita) / 2);
    let horas = 0;
    for (const p of piles) horas += Math.ceil(p / v);
    if (horas <= h) direita = v;
    else esquerda = v + 1;
  }
  return esquerda;
}
```

## TypeScript

```typescript
function minEatingSpeed(piles: number[], h: number): number {
  let esquerda = 1;
  let direita = Math.max(...piles);
  while (esquerda < direita) {
    const v = Math.floor((esquerda + direita) / 2);
    let horas = 0;
    for (const p of piles) horas += Math.ceil(p / v);
    if (horas <= h) direita = v;
    else esquerda = v + 1;
  }
  return esquerda;
}
```

## Java

```java
class Solution {
    public int minEatingSpeed(int[] piles, int h) {
        int esquerda = 1, direita = 0;
        for (int p : piles) direita = Math.max(direita, p);
        while (esquerda < direita) {
            int v = esquerda + (direita - esquerda) / 2;
            long horas = 0;
            for (int p : piles) horas += (p + (long) v - 1) / v;
            if (horas <= h) direita = v;
            else esquerda = v + 1;
        }
        return esquerda;
    }
}
```

## C++

```cpp
class Solution {
public:
    int minEatingSpeed(vector<int>& piles, int h) {
        int esquerda = 1, direita = *max_element(piles.begin(), piles.end());
        while (esquerda < direita) {
            int v = esquerda + (direita - esquerda) / 2;
            long long horas = 0;
            for (int p : piles) horas += (p + (long long)v - 1) / v;
            if (horas <= h) direita = v;
            else esquerda = v + 1;
        }
        return esquerda;
    }
};
```

## C#

```csharp
public class Solution {
    public int MinEatingSpeed(int[] piles, int h) {
        int esquerda = 1, direita = piles.Max();
        while (esquerda < direita) {
            int v = esquerda + (direita - esquerda) / 2;
            long horas = 0;
            foreach (int p in piles) horas += (p + (long)v - 1) / v;
            if (horas <= h) direita = v;
            else esquerda = v + 1;
        }
        return esquerda;
    }
}
```

## Go

```go
func minEatingSpeed(piles []int, h int) int {
	esquerda, direita := 1, 0
	for _, p := range piles {
		if p > direita {
			direita = p
		}
	}
	for esquerda < direita {
		v := esquerda + (direita-esquerda)/2
		horas := 0
		for _, p := range piles {
			horas += (p + v - 1) / v
		}
		if horas <= h {
			direita = v
		} else {
			esquerda = v + 1
		}
	}
	return esquerda
}
```
