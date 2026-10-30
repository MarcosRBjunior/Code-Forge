## Ideia

Monte cada permutação posição por posição com backtracking. Em cada passo, escolha qualquer elemento ainda não usado, coloque-o no caminho atual e recorra para a posição seguinte. Ao voltar da recursão, desfaça a escolha para que outro elemento possa ocupar aquela posição.

Quando o caminho atinge o tamanho de `nums`, ele é uma permutação completa e uma cópia dele vai para a resposta. Uma entrada vazia gera uma única permutação, a lista vazia.

## Complexidade

Tempo O(n · n!), pois há n! permutações e cada cópia custa O(n). Espaço O(n) de recursão, além da resposta.

## Python

```python
def permute(nums):
    resposta = []
    caminho = []
    usado = [False] * len(nums)

    def escolhe():
        if len(caminho) == len(nums):
            resposta.append(caminho[:])
            return
        for i, x in enumerate(nums):
            if usado[i]:
                continue
            usado[i] = True
            caminho.append(x)
            escolhe()
            caminho.pop()
            usado[i] = False

    escolhe()
    return resposta
```

## JavaScript

```javascript
function permute(nums) {
  const resposta = [];
  const caminho = [];
  const usado = new Array(nums.length).fill(false);
  const escolhe = () => {
    if (caminho.length === nums.length) {
      resposta.push([...caminho]);
      return;
    }
    for (let i = 0; i < nums.length; i++) {
      if (usado[i]) continue;
      usado[i] = true;
      caminho.push(nums[i]);
      escolhe();
      caminho.pop();
      usado[i] = false;
    }
  };
  escolhe();
  return resposta;
}
```

## TypeScript

```typescript
function permute(nums: number[]): number[][] {
  const resposta: number[][] = [];
  const caminho: number[] = [];
  const usado: boolean[] = new Array(nums.length).fill(false);
  const escolhe = (): void => {
    if (caminho.length === nums.length) {
      resposta.push([...caminho]);
      return;
    }
    for (let i = 0; i < nums.length; i++) {
      if (usado[i]) continue;
      usado[i] = true;
      caminho.push(nums[i]);
      escolhe();
      caminho.pop();
      usado[i] = false;
    }
  };
  escolhe();
  return resposta;
}
```

## Java

```java
class Solution {
    private void escolhe(int[] nums, boolean[] usado, List<Integer> caminho, List<int[]> resposta) {
        if (caminho.size() == nums.length) {
            int[] copia = new int[nums.length];
            for (int i = 0; i < copia.length; i++) copia[i] = caminho.get(i);
            resposta.add(copia);
            return;
        }
        for (int i = 0; i < nums.length; i++) {
            if (usado[i]) continue;
            usado[i] = true;
            caminho.add(nums[i]);
            escolhe(nums, usado, caminho, resposta);
            caminho.remove(caminho.size() - 1);
            usado[i] = false;
        }
    }

    public int[][] permute(int[] nums) {
        List<int[]> resposta = new ArrayList<>();
        escolhe(nums, new boolean[nums.length], new ArrayList<>(), resposta);
        return resposta.toArray(new int[0][]);
    }
}
```

## C++

```cpp
class Solution {
    void escolhe(vector<int>& nums, vector<bool>& usado, vector<int>& caminho, vector<vector<int>>& resposta) {
        if (caminho.size() == nums.size()) {
            resposta.push_back(caminho);
            return;
        }
        for (int i = 0; i < (int)nums.size(); i++) {
            if (usado[i]) continue;
            usado[i] = true;
            caminho.push_back(nums[i]);
            escolhe(nums, usado, caminho, resposta);
            caminho.pop_back();
            usado[i] = false;
        }
    }

public:
    vector<vector<int>> permute(vector<int>& nums) {
        vector<vector<int>> resposta;
        vector<bool> usado(nums.size(), false);
        vector<int> caminho;
        escolhe(nums, usado, caminho, resposta);
        return resposta;
    }
};
```

## C#

```csharp
public class Solution {
    private void Escolhe(int[] nums, bool[] usado, List<int> caminho, List<int[]> resposta) {
        if (caminho.Count == nums.Length) {
            resposta.Add(caminho.ToArray());
            return;
        }
        for (int i = 0; i < nums.Length; i++) {
            if (usado[i]) continue;
            usado[i] = true;
            caminho.Add(nums[i]);
            Escolhe(nums, usado, caminho, resposta);
            caminho.RemoveAt(caminho.Count - 1);
            usado[i] = false;
        }
    }

    public int[][] Permute(int[] nums) {
        var resposta = new List<int[]>();
        Escolhe(nums, new bool[nums.Length], new List<int>(), resposta);
        return resposta.ToArray();
    }
}
```

## Go

```go
func permute(nums []int) [][]int {
	resposta := [][]int{}
	caminho := []int{}
	usado := make([]bool, len(nums))
	var escolhe func()
	escolhe = func() {
		if len(caminho) == len(nums) {
			copia := make([]int, len(caminho))
			copy(copia, caminho)
			resposta = append(resposta, copia)
			return
		}
		for i, x := range nums {
			if usado[i] {
				continue
			}
			usado[i] = true
			caminho = append(caminho, x)
			escolhe()
			caminho = caminho[:len(caminho)-1]
			usado[i] = false
		}
	}
	escolhe()
	return resposta
}
```
