## Ideia

Duas strings são anagramas exatamente quando têm as mesmas letras nas mesmas quantidades. Isso quer dizer que, ordenando as letras de cada uma, você obtém a mesma string, e essa string ordenada serve de assinatura do grupo.

Percorra a lista uma vez, calcule a assinatura de cada palavra e use-a como chave de um dicionário que acumula as palavras. No fim, os valores do dicionário são os grupos. Repetidas continuam repetidas, porque cada ocorrência é adicionada ao grupo.

## Complexidade

Tempo `O(n * k log k)`, com `n` strings de tamanho até `k` (o custo é a ordenação de cada uma). Espaço `O(n * k)` para guardar os grupos.

## Python

```python
def group_anagrams(strs):
    grupos = {}
    for palavra in strs:
        assinatura = "".join(sorted(palavra))
        grupos.setdefault(assinatura, []).append(palavra)
    return list(grupos.values())
```

## JavaScript

```javascript
function groupAnagrams(strs) {
  const grupos = new Map();
  for (const palavra of strs) {
    const assinatura = palavra.split("").sort().join("");
    if (!grupos.has(assinatura)) grupos.set(assinatura, []);
    grupos.get(assinatura).push(palavra);
  }
  return [...grupos.values()];
}
```

## TypeScript

```typescript
function groupAnagrams(strs: string[]): string[][] {
  const grupos = new Map<string, string[]>();
  for (const palavra of strs) {
    const assinatura = palavra.split("").sort().join("");
    if (!grupos.has(assinatura)) grupos.set(assinatura, []);
    grupos.get(assinatura)!.push(palavra);
  }
  return [...grupos.values()];
}
```

## Java

```java
class Solution {
    public String[][] groupAnagrams(String[] strs) {
        Map<String, List<String>> grupos = new HashMap<>();
        for (String palavra : strs) {
            char[] letras = palavra.toCharArray();
            Arrays.sort(letras);
            String assinatura = new String(letras);
            grupos.computeIfAbsent(assinatura, k -> new ArrayList<>()).add(palavra);
        }
        String[][] resultado = new String[grupos.size()][];
        int i = 0;
        for (List<String> grupo : grupos.values()) {
            resultado[i++] = grupo.toArray(new String[0]);
        }
        return resultado;
    }
}
```

## C++

```cpp
class Solution {
public:
    vector<vector<string>> groupAnagrams(vector<string>& strs) {
        unordered_map<string, vector<string>> grupos;
        for (const string& palavra : strs) {
            string assinatura = palavra;
            sort(assinatura.begin(), assinatura.end());
            grupos[assinatura].push_back(palavra);
        }
        vector<vector<string>> resultado;
        for (auto& par : grupos) resultado.push_back(par.second);
        return resultado;
    }
};
```

## C#

```csharp
public class Solution {
    public string[][] GroupAnagrams(string[] strs) {
        var grupos = new Dictionary<string, List<string>>();
        foreach (var palavra in strs) {
            var letras = palavra.ToCharArray();
            Array.Sort(letras);
            var assinatura = new string(letras);
            if (!grupos.ContainsKey(assinatura)) grupos[assinatura] = new List<string>();
            grupos[assinatura].Add(palavra);
        }
        return grupos.Values.Select(g => g.ToArray()).ToArray();
    }
}
```

## Go

```go
import "sort"

func groupAnagrams(strs []string) [][]string {
	grupos := map[string][]string{}
	for _, palavra := range strs {
		letras := []byte(palavra)
		sort.Slice(letras, func(i, j int) bool { return letras[i] < letras[j] })
		assinatura := string(letras)
		grupos[assinatura] = append(grupos[assinatura], palavra)
	}
	resultado := [][]string{}
	for _, grupo := range grupos {
		resultado = append(resultado, grupo)
	}
	return resultado
}
```
