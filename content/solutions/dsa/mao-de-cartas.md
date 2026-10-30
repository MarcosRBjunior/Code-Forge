## Ideia

Se o tamanho da mão não é múltiplo de `groupSize`, é impossível. Caso contrário, conte as ocorrências de cada valor e processe os valores em ordem crescente: a menor carta ainda disponível só pode ser o início de um grupo, pois não há carta menor para precedê-la. Então consumimos uma sequência de `groupSize` valores consecutivos a partir dela.

Se em algum ponto uma carta necessária falta (contagem zero), a mão não pode ser dividida. Com várias cópias do menor valor, subtraímos essa quantidade de todo o grupo de uma vez.

## Complexidade

Tempo `O(n log n)` para ordenar as chaves distintas, mais `O(n)` do trabalho de consumo. Espaço `O(n)`.

## Python

```python
from collections import Counter


def is_n_straight_hand(hand, group_size):
    if len(hand) % group_size:
        return False
    contagem = Counter(hand)
    for inicio in sorted(contagem):
        qtd = contagem[inicio]
        if qtd == 0:
            continue
        for valor in range(inicio, inicio + group_size):
            if contagem.get(valor, 0) < qtd:
                return False
            contagem[valor] -= qtd
    return True
```

## JavaScript

```javascript
function isNStraightHand(hand, groupSize) {
  if (hand.length % groupSize !== 0) return false;
  const contagem = new Map();
  for (const c of hand) contagem.set(c, (contagem.get(c) || 0) + 1);
  const chaves = [...contagem.keys()].sort((a, b) => a - b);
  for (const inicio of chaves) {
    const qtd = contagem.get(inicio);
    if (qtd === 0) continue;
    for (let valor = inicio; valor < inicio + groupSize; valor++) {
      const tem = contagem.get(valor) || 0;
      if (tem < qtd) return false;
      contagem.set(valor, tem - qtd);
    }
  }
  return true;
}
```

## TypeScript

```typescript
function isNStraightHand(hand: number[], groupSize: number): boolean {
  if (hand.length % groupSize !== 0) return false;
  const contagem = new Map<number, number>();
  for (const c of hand) contagem.set(c, (contagem.get(c) || 0) + 1);
  const chaves = [...contagem.keys()].sort((a, b) => a - b);
  for (const inicio of chaves) {
    const qtd = contagem.get(inicio) as number;
    if (qtd === 0) continue;
    for (let valor = inicio; valor < inicio + groupSize; valor++) {
      const tem = contagem.get(valor) || 0;
      if (tem < qtd) return false;
      contagem.set(valor, tem - qtd);
    }
  }
  return true;
}
```

## Java

```java
class Solution {
    public boolean isNStraightHand(int[] hand, int groupSize) {
        if (hand.length % groupSize != 0) return false;
        TreeMap<Integer, Integer> contagem = new TreeMap<>();
        for (int c : hand) contagem.merge(c, 1, Integer::sum);
        for (int inicio : new ArrayList<>(contagem.keySet())) {
            int qtd = contagem.get(inicio);
            if (qtd == 0) continue;
            for (int valor = inicio; valor < inicio + groupSize; valor++) {
                int tem = contagem.getOrDefault(valor, 0);
                if (tem < qtd) return false;
                contagem.put(valor, tem - qtd);
            }
        }
        return true;
    }
}
```

## C++

```cpp
class Solution {
public:
    bool isNStraightHand(vector<int>& hand, int groupSize) {
        if (hand.size() % groupSize != 0) return false;
        map<int, int> contagem;
        for (int c : hand) contagem[c]++;
        for (auto& [inicio, qtd] : contagem) {
            if (qtd == 0) continue;
            int n = qtd;
            for (int valor = inicio; valor < inicio + groupSize; valor++) {
                auto it = contagem.find(valor);
                if (it == contagem.end() || it->second < n) return false;
                it->second -= n;
            }
        }
        return true;
    }
};
```

## C#

```csharp
public class Solution {
    public bool IsNStraightHand(int[] hand, int groupSize) {
        if (hand.Length % groupSize != 0) return false;
        var contagem = new SortedDictionary<int, int>();
        foreach (int c in hand) contagem[c] = contagem.GetValueOrDefault(c) + 1;
        foreach (int inicio in contagem.Keys.ToList()) {
            int qtd = contagem[inicio];
            if (qtd == 0) continue;
            for (int valor = inicio; valor < inicio + groupSize; valor++) {
                int tem = contagem.GetValueOrDefault(valor);
                if (tem < qtd) return false;
                contagem[valor] = tem - qtd;
            }
        }
        return true;
    }
}
```

## Go

```go
import "sort"

func isNStraightHand(hand []int, groupSize int) bool {
	if len(hand)%groupSize != 0 {
		return false
	}
	contagem := map[int]int{}
	for _, c := range hand {
		contagem[c]++
	}
	chaves := make([]int, 0, len(contagem))
	for k := range contagem {
		chaves = append(chaves, k)
	}
	sort.Ints(chaves)
	for _, inicio := range chaves {
		qtd := contagem[inicio]
		if qtd == 0 {
			continue
		}
		for valor := inicio; valor < inicio+groupSize; valor++ {
			if contagem[valor] < qtd {
				return false
			}
			contagem[valor] -= qtd
		}
	}
	return true
}
```
