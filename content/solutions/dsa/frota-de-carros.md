## Ideia

Ordene os carros do mais próximo ao mais distante do destino e processe-os nessa ordem. Um carro não ultrapassa o da frente, então só há duas possibilidades: se ele chegaria no mesmo instante ou antes do carro à frente, será alcançado e entra na frota dele; se chegaria depois, forma uma frota nova.

Basta lembrar da distância e da velocidade do último carro que lidera uma frota. Comparar os tempos `dist / vel` por multiplicação cruzada evita erros de ponto flutuante: o carro atual lidera uma nova frota quando `dist * velLider > distLider * vel`.

## Complexidade

Tempo O(n log n) pela ordenação. Espaço O(n) para a lista ordenada.

## Python

```python
def car_fleet(target, position, speed):
    frotas = 0
    dist_lider = 0
    vel_lider = 1
    for pos, vel in sorted(zip(position, speed), reverse=True):
        dist = target - pos
        if dist * vel_lider > dist_lider * vel:
            frotas += 1
            dist_lider, vel_lider = dist, vel
    return frotas
```

## JavaScript

```javascript
function carFleet(target, position, speed) {
  const carros = position.map((p, i) => [p, speed[i]]);
  carros.sort((a, b) => b[0] - a[0]);
  let frotas = 0;
  let distLider = 0;
  let velLider = 1;
  for (const [pos, vel] of carros) {
    const dist = target - pos;
    if (dist * velLider > distLider * vel) {
      frotas++;
      distLider = dist;
      velLider = vel;
    }
  }
  return frotas;
}
```

## TypeScript

```typescript
function carFleet(target: number, position: number[], speed: number[]): number {
  const carros: [number, number][] = position.map((p, i): [number, number] => [p, speed[i]]);
  carros.sort((a, b) => b[0] - a[0]);
  let frotas = 0;
  let distLider = 0;
  let velLider = 1;
  for (const [pos, vel] of carros) {
    const dist = target - pos;
    if (dist * velLider > distLider * vel) {
      frotas++;
      distLider = dist;
      velLider = vel;
    }
  }
  return frotas;
}
```

## Java

```java
class Solution {
    public int carFleet(int target, int[] position, int[] speed) {
        int n = position.length;
        Integer[] ordem = new Integer[n];
        for (int i = 0; i < n; i++) ordem[i] = i;
        Arrays.sort(ordem, (a, b) -> Integer.compare(position[b], position[a]));
        int frotas = 0;
        long distLider = 0, velLider = 1;
        for (int i : ordem) {
            long dist = target - position[i];
            long vel = speed[i];
            if (dist * velLider > distLider * vel) {
                frotas++;
                distLider = dist;
                velLider = vel;
            }
        }
        return frotas;
    }
}
```

## C++

```cpp
class Solution {
public:
    int carFleet(int target, vector<int>& position, vector<int>& speed) {
        int n = position.size();
        vector<int> ordem(n);
        iota(ordem.begin(), ordem.end(), 0);
        sort(ordem.begin(), ordem.end(), [&](int a, int b) { return position[a] > position[b]; });
        int frotas = 0;
        long long distLider = 0, velLider = 1;
        for (int i : ordem) {
            long long dist = target - position[i];
            long long vel = speed[i];
            if (dist * velLider > distLider * vel) {
                frotas++;
                distLider = dist;
                velLider = vel;
            }
        }
        return frotas;
    }
};
```

## C#

```csharp
public class Solution {
    public int CarFleet(int target, int[] position, int[] speed) {
        int n = position.Length;
        int[] ordem = Enumerable.Range(0, n).OrderByDescending(i => position[i]).ToArray();
        int frotas = 0;
        long distLider = 0, velLider = 1;
        foreach (int i in ordem) {
            long dist = target - position[i];
            long vel = speed[i];
            if (dist * velLider > distLider * vel) {
                frotas++;
                distLider = dist;
                velLider = vel;
            }
        }
        return frotas;
    }
}
```

## Go

```go
import "sort"

func carFleet(target int, position []int, speed []int) int {
	ordem := make([]int, len(position))
	for i := range ordem {
		ordem[i] = i
	}
	sort.Slice(ordem, func(a, b int) bool { return position[ordem[a]] > position[ordem[b]] })
	frotas := 0
	distLider, velLider := 0, 1
	for _, i := range ordem {
		dist := target - position[i]
		vel := speed[i]
		if dist*velLider > distLider*vel {
			frotas++
			distLider, velLider = dist, vel
		}
	}
	return frotas
}
```
