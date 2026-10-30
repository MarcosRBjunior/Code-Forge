## Ideia

Pense em camadas, como numa BFS. Com `k` saltos você alcança um intervalo contíguo de índices; enquanto percorre os índices da camada atual, calcule até onde o próximo salto poderia chegar (`mais_longe`). Quando o índice chega ao fim da camada atual, é preciso dar mais um salto, e a nova camada termina em `mais_longe`.

Não é necessário olhar para trás nem guardar tabelas: o guloso funciona porque, dentro de uma camada, todos os índices custam o mesmo número de saltos, então só importa o alcance máximo que eles oferecem.

## Complexidade

Tempo `O(n)`, com uma única passada. Espaço `O(1)`.

## Python

```python
def min_jumps(nums):
    saltos = 0
    fim_camada = 0
    mais_longe = 0
    for i in range(len(nums) - 1):
        mais_longe = max(mais_longe, i + nums[i])
        if i == fim_camada:
            saltos += 1
            fim_camada = mais_longe
    return saltos
```

## JavaScript

```javascript
function minJumps(nums) {
  let saltos = 0;
  let fimCamada = 0;
  let maisLonge = 0;
  for (let i = 0; i < nums.length - 1; i++) {
    maisLonge = Math.max(maisLonge, i + nums[i]);
    if (i === fimCamada) {
      saltos++;
      fimCamada = maisLonge;
    }
  }
  return saltos;
}
```

## TypeScript

```typescript
function minJumps(nums: number[]): number {
  let saltos = 0;
  let fimCamada = 0;
  let maisLonge = 0;
  for (let i = 0; i < nums.length - 1; i++) {
    maisLonge = Math.max(maisLonge, i + nums[i]);
    if (i === fimCamada) {
      saltos++;
      fimCamada = maisLonge;
    }
  }
  return saltos;
}
```

## Java

```java
class Solution {
    public int minJumps(int[] nums) {
        int saltos = 0, fimCamada = 0, maisLonge = 0;
        for (int i = 0; i < nums.length - 1; i++) {
            maisLonge = Math.max(maisLonge, i + nums[i]);
            if (i == fimCamada) {
                saltos++;
                fimCamada = maisLonge;
            }
        }
        return saltos;
    }
}
```

## C++

```cpp
class Solution {
public:
    int minJumps(vector<int>& nums) {
        int saltos = 0, fimCamada = 0, maisLonge = 0;
        for (int i = 0; i < (int)nums.size() - 1; i++) {
            maisLonge = max(maisLonge, i + nums[i]);
            if (i == fimCamada) {
                saltos++;
                fimCamada = maisLonge;
            }
        }
        return saltos;
    }
};
```

## C#

```csharp
public class Solution {
    public int MinJumps(int[] nums) {
        int saltos = 0, fimCamada = 0, maisLonge = 0;
        for (int i = 0; i < nums.Length - 1; i++) {
            maisLonge = Math.Max(maisLonge, i + nums[i]);
            if (i == fimCamada) {
                saltos++;
                fimCamada = maisLonge;
            }
        }
        return saltos;
    }
}
```

## Go

```go
func minJumps(nums []int) int {
	saltos, fimCamada, maisLonge := 0, 0, 0
	for i := 0; i < len(nums)-1; i++ {
		if i+nums[i] > maisLonge {
			maisLonge = i + nums[i]
		}
		if i == fimCamada {
			saltos++
			fimCamada = maisLonge
		}
	}
	return saltos
}
```
