## Ideia

O último passo até o degrau `n` saiu do degrau `n - 1` (passo de 1) ou do degrau `n - 2` (passo de 2). Portanto o número de maneiras de chegar em `n` é a soma das maneiras de chegar nesses dois degraus: é a sequência de Fibonacci.

Como cada valor depende só dos dois anteriores, basta guardar duas variáveis e avançar até `n`, sem precisar de uma tabela inteira.

## Complexidade

Tempo O(n), um passo por degrau. Espaço O(1), só duas variáveis.

## Python

```python
def climb_stairs(n):
    anterior, atual = 1, 1
    for _ in range(n - 1):
        anterior, atual = atual, anterior + atual
    return atual
```

## JavaScript

```javascript
function climbStairs(n) {
  let anterior = 1, atual = 1;
  for (let i = 1; i < n; i++) {
    [anterior, atual] = [atual, anterior + atual];
  }
  return atual;
}
```

## TypeScript

```typescript
function climbStairs(n: number): number {
  let anterior = 1, atual = 1;
  for (let i = 1; i < n; i++) {
    [anterior, atual] = [atual, anterior + atual];
  }
  return atual;
}
```

## Java

```java
class Solution {
    public int climbStairs(int n) {
        int anterior = 1, atual = 1;
        for (int i = 1; i < n; i++) {
            int proximo = anterior + atual;
            anterior = atual;
            atual = proximo;
        }
        return atual;
    }
}
```

## C++

```cpp
class Solution {
public:
    int climbStairs(int n) {
        int anterior = 1, atual = 1;
        for (int i = 1; i < n; i++) {
            int proximo = anterior + atual;
            anterior = atual;
            atual = proximo;
        }
        return atual;
    }
};
```

## C#

```csharp
public class Solution {
    public int ClimbStairs(int n) {
        int anterior = 1, atual = 1;
        for (int i = 1; i < n; i++) {
            int proximo = anterior + atual;
            anterior = atual;
            atual = proximo;
        }
        return atual;
    }
}
```

## Go

```go
func climbStairs(n int) int {
	anterior, atual := 1, 1
	for i := 1; i < n; i++ {
		anterior, atual = atual, anterior+atual
	}
	return atual
}
```
