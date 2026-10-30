## Ideia

Uma potência de dois tem exatamente um bit 1 na representação binária. Subtrair 1 de `n` inverte esse bit e liga todos os bits abaixo dele, então `n` e `n - 1` não têm nenhum bit em comum: `n & (n - 1)` vale zero.

Para qualquer outro número positivo, o bit mais alto permanece em `n - 1`, e a conjunção não dá zero. Zero e negativos precisam ser rejeitados antes, pois nenhum deles é potência de dois.

## Complexidade

Tempo O(1) e espaço O(1), com uma única operação de bits.

## Python

```python
def is_power_of_two(n):
    return n > 0 and n & (n - 1) == 0
```

## JavaScript

```javascript
function isPowerOfTwo(n) {
  return n > 0 && (n & (n - 1)) === 0;
}
```

## TypeScript

```typescript
function isPowerOfTwo(n: number): boolean {
  return n > 0 && (n & (n - 1)) === 0;
}
```

## Java

```java
class Solution {
    public boolean isPowerOfTwo(int n) {
        return n > 0 && (n & (n - 1)) == 0;
    }
}
```

## C++

```cpp
class Solution {
public:
    bool isPowerOfTwo(int n) {
        return n > 0 && (n & (n - 1)) == 0;
    }
};
```

## C#

```csharp
public class Solution {
    public bool IsPowerOfTwo(int n) {
        return n > 0 && (n & (n - 1)) == 0;
    }
}
```

## Go

```go
func isPowerOfTwo(n int) bool {
	return n > 0 && n&(n-1) == 0
}
```
