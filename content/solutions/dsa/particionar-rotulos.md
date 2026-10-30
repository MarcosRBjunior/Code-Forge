## Ideia

Primeiro registre a última posição em que cada letra aparece. Depois varra a string mantendo o fim do pedaço atual: ao ler a letra da posição `i`, estenda o fim para o máximo entre o fim atual e a última ocorrência dessa letra.

Quando `i` alcança o fim, nenhuma letra do pedaço reaparece adiante, então ele pode ser fechado. Fechar sempre o mais cedo possível produz o maior número de pedaços.

## Complexidade

Tempo O(n), com duas passadas. Espaço O(1), pois o alfabeto tem tamanho fixo.

## Python

```python
def partition_labels(s):
    ultima = {ch: i for i, ch in enumerate(s)}
    tamanhos = []
    inicio = fim = 0
    for i, ch in enumerate(s):
        fim = max(fim, ultima[ch])
        if i == fim:
            tamanhos.append(fim - inicio + 1)
            inicio = i + 1
    return tamanhos
```

## JavaScript

```javascript
function partitionLabels(s) {
  const ultima = new Map();
  for (let i = 0; i < s.length; i++) ultima.set(s[i], i);
  const tamanhos = [];
  let inicio = 0, fim = 0;
  for (let i = 0; i < s.length; i++) {
    fim = Math.max(fim, ultima.get(s[i]));
    if (i === fim) {
      tamanhos.push(fim - inicio + 1);
      inicio = i + 1;
    }
  }
  return tamanhos;
}
```

## TypeScript

```typescript
function partitionLabels(s: string): number[] {
  const ultima = new Map<string, number>();
  for (let i = 0; i < s.length; i++) ultima.set(s[i], i);
  const tamanhos: number[] = [];
  let inicio = 0, fim = 0;
  for (let i = 0; i < s.length; i++) {
    fim = Math.max(fim, ultima.get(s[i])!);
    if (i === fim) {
      tamanhos.push(fim - inicio + 1);
      inicio = i + 1;
    }
  }
  return tamanhos;
}
```

## Java

```java
class Solution {
    public int[] partitionLabels(String s) {
        int[] ultima = new int[26];
        for (int i = 0; i < s.length(); i++) ultima[s.charAt(i) - 'a'] = i;
        List<Integer> tamanhos = new ArrayList<>();
        int inicio = 0, fim = 0;
        for (int i = 0; i < s.length(); i++) {
            fim = Math.max(fim, ultima[s.charAt(i) - 'a']);
            if (i == fim) {
                tamanhos.add(fim - inicio + 1);
                inicio = i + 1;
            }
        }
        int[] resposta = new int[tamanhos.size()];
        for (int k = 0; k < resposta.length; k++) resposta[k] = tamanhos.get(k);
        return resposta;
    }
}
```

## C++

```cpp
class Solution {
public:
    vector<int> partitionLabels(string s) {
        int ultima[26] = {};
        for (int i = 0; i < (int)s.size(); i++) ultima[s[i] - 'a'] = i;
        vector<int> tamanhos;
        int inicio = 0, fim = 0;
        for (int i = 0; i < (int)s.size(); i++) {
            fim = max(fim, ultima[s[i] - 'a']);
            if (i == fim) {
                tamanhos.push_back(fim - inicio + 1);
                inicio = i + 1;
            }
        }
        return tamanhos;
    }
};
```

## C#

```csharp
public class Solution {
    public int[] PartitionLabels(string s) {
        var ultima = new int[26];
        for (int i = 0; i < s.Length; i++) ultima[s[i] - 'a'] = i;
        var tamanhos = new List<int>();
        int inicio = 0, fim = 0;
        for (int i = 0; i < s.Length; i++) {
            fim = Math.Max(fim, ultima[s[i] - 'a']);
            if (i == fim) {
                tamanhos.Add(fim - inicio + 1);
                inicio = i + 1;
            }
        }
        return tamanhos.ToArray();
    }
}
```

## Go

```go
func partitionLabels(s string) []int {
	var ultima [26]int
	for i := 0; i < len(s); i++ {
		ultima[s[i]-'a'] = i
	}
	tamanhos := []int{}
	inicio, fim := 0, 0
	for i := 0; i < len(s); i++ {
		if ultima[s[i]-'a'] > fim {
			fim = ultima[s[i]-'a']
		}
		if i == fim {
			tamanhos = append(tamanhos, fim-inicio+1)
			inicio = i + 1
		}
	}
	return tamanhos
}
```
