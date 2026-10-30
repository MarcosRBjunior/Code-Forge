## Ideia

Seja `gas[i] - cost[i]` o saldo de cada trecho. Se a soma de todos os saldos for negativa, falta combustível no total e não existe resposta. Caso contrário, existe exatamente uma partida válida.

Para achá-la, simule a partir de um candidato acumulando o tanque. Se o tanque ficar negativo ao sair do posto `i`, nenhum posto entre o candidato e `i` serve como partida: o candidato chegou a cada um deles com tanque maior ou igual a zero, então começar ali, com tanque vazio, daria ainda menos combustível ao chegar em `i`. Portanto o novo candidato passa a ser `i + 1` e o tanque zera.

## Complexidade

Tempo O(n), com uma única passada. Espaço O(1).

## Python

```python
def can_complete_circuit(gas, cost):
    total = 0
    tanque = 0
    inicio = 0
    for i in range(len(gas)):
        saldo = gas[i] - cost[i]
        total += saldo
        tanque += saldo
        if tanque < 0:
            inicio = i + 1
            tanque = 0
    return inicio if total >= 0 else -1
```

## JavaScript

```javascript
function canCompleteCircuit(gas, cost) {
  let total = 0, tanque = 0, inicio = 0;
  for (let i = 0; i < gas.length; i++) {
    const saldo = gas[i] - cost[i];
    total += saldo;
    tanque += saldo;
    if (tanque < 0) {
      inicio = i + 1;
      tanque = 0;
    }
  }
  return total >= 0 ? inicio : -1;
}
```

## TypeScript

```typescript
function canCompleteCircuit(gas: number[], cost: number[]): number {
  let total = 0, tanque = 0, inicio = 0;
  for (let i = 0; i < gas.length; i++) {
    const saldo = gas[i] - cost[i];
    total += saldo;
    tanque += saldo;
    if (tanque < 0) {
      inicio = i + 1;
      tanque = 0;
    }
  }
  return total >= 0 ? inicio : -1;
}
```

## Java

```java
class Solution {
    public int canCompleteCircuit(int[] gas, int[] cost) {
        int total = 0, tanque = 0, inicio = 0;
        for (int i = 0; i < gas.length; i++) {
            int saldo = gas[i] - cost[i];
            total += saldo;
            tanque += saldo;
            if (tanque < 0) {
                inicio = i + 1;
                tanque = 0;
            }
        }
        return total >= 0 ? inicio : -1;
    }
}
```

## C++

```cpp
class Solution {
public:
    int canCompleteCircuit(vector<int>& gas, vector<int>& cost) {
        int total = 0, tanque = 0, inicio = 0;
        for (int i = 0; i < (int)gas.size(); i++) {
            int saldo = gas[i] - cost[i];
            total += saldo;
            tanque += saldo;
            if (tanque < 0) {
                inicio = i + 1;
                tanque = 0;
            }
        }
        return total >= 0 ? inicio : -1;
    }
};
```

## C#

```csharp
public class Solution {
    public int CanCompleteCircuit(int[] gas, int[] cost) {
        int total = 0, tanque = 0, inicio = 0;
        for (int i = 0; i < gas.Length; i++) {
            int saldo = gas[i] - cost[i];
            total += saldo;
            tanque += saldo;
            if (tanque < 0) {
                inicio = i + 1;
                tanque = 0;
            }
        }
        return total >= 0 ? inicio : -1;
    }
}
```

## Go

```go
func canCompleteCircuit(gas []int, cost []int) int {
	total, tanque, inicio := 0, 0, 0
	for i := range gas {
		saldo := gas[i] - cost[i]
		total += saldo
		tanque += saldo
		if tanque < 0 {
			inicio = i + 1
			tanque = 0
		}
	}
	if total >= 0 {
		return inicio
	}
	return -1
}
```
