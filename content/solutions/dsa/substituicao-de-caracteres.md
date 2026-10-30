## Ideia

Uma janela de `esq` até `dir` pode virar uma única letra com `k` trocas quando `tamanho da janela - frequência da letra mais comum <= k`: as letras que não são a mais comum são as que precisam ser trocadas.

Expandimos a janela pela direita, contando as letras. Se a janela deixa de ser viável, avançamos a borda esquerda em um. Um truque: não precisamos reduzir o máximo de frequência quando a janela encolhe. O máximo só importa quando ele aumenta, pois só então a janela pode crescer além do melhor tamanho já visto; manter um valor antigo e maior nunca gera uma resposta falsa.

## Complexidade

Tempo O(n), cada borda anda no máximo n posições. Espaço O(1), pois são 26 contadores.

## Python

```python
def character_replacement(s, k):
    contagem = [0] * 26
    esq = 0
    maior_freq = 0
    melhor = 0
    for dir, c in enumerate(s):
        idx = ord(c) - 65
        contagem[idx] += 1
        maior_freq = max(maior_freq, contagem[idx])
        if (dir - esq + 1) - maior_freq > k:
            contagem[ord(s[esq]) - 65] -= 1
            esq += 1
        melhor = max(melhor, dir - esq + 1)
    return melhor
```

## JavaScript

```javascript
function characterReplacement(s, k) {
  const contagem = new Array(26).fill(0);
  let esq = 0, maiorFreq = 0, melhor = 0;
  for (let dir = 0; dir < s.length; dir++) {
    const idx = s.charCodeAt(dir) - 65;
    contagem[idx]++;
    maiorFreq = Math.max(maiorFreq, contagem[idx]);
    if (dir - esq + 1 - maiorFreq > k) {
      contagem[s.charCodeAt(esq) - 65]--;
      esq++;
    }
    melhor = Math.max(melhor, dir - esq + 1);
  }
  return melhor;
}
```

## TypeScript

```typescript
function characterReplacement(s: string, k: number): number {
  const contagem: number[] = new Array(26).fill(0);
  let esq = 0, maiorFreq = 0, melhor = 0;
  for (let dir = 0; dir < s.length; dir++) {
    const idx = s.charCodeAt(dir) - 65;
    contagem[idx]++;
    maiorFreq = Math.max(maiorFreq, contagem[idx]);
    if (dir - esq + 1 - maiorFreq > k) {
      contagem[s.charCodeAt(esq) - 65]--;
      esq++;
    }
    melhor = Math.max(melhor, dir - esq + 1);
  }
  return melhor;
}
```

## Java

```java
class Solution {
    public int characterReplacement(String s, int k) {
        int[] contagem = new int[26];
        int esq = 0, maiorFreq = 0, melhor = 0;
        for (int dir = 0; dir < s.length(); dir++) {
            int idx = s.charAt(dir) - 'A';
            contagem[idx]++;
            maiorFreq = Math.max(maiorFreq, contagem[idx]);
            if (dir - esq + 1 - maiorFreq > k) {
                contagem[s.charAt(esq) - 'A']--;
                esq++;
            }
            melhor = Math.max(melhor, dir - esq + 1);
        }
        return melhor;
    }
}
```

## C++

```cpp
class Solution {
public:
    int characterReplacement(string s, int k) {
        int contagem[26] = {0};
        int esq = 0, maiorFreq = 0, melhor = 0;
        for (int dir = 0; dir < (int)s.size(); dir++) {
            int idx = s[dir] - 'A';
            contagem[idx]++;
            maiorFreq = max(maiorFreq, contagem[idx]);
            if (dir - esq + 1 - maiorFreq > k) {
                contagem[s[esq] - 'A']--;
                esq++;
            }
            melhor = max(melhor, dir - esq + 1);
        }
        return melhor;
    }
};
```

## C#

```csharp
public class Solution {
    public int CharacterReplacement(string s, int k) {
        int[] contagem = new int[26];
        int esq = 0, maiorFreq = 0, melhor = 0;
        for (int dir = 0; dir < s.Length; dir++) {
            int idx = s[dir] - 'A';
            contagem[idx]++;
            maiorFreq = Math.Max(maiorFreq, contagem[idx]);
            if (dir - esq + 1 - maiorFreq > k) {
                contagem[s[esq] - 'A']--;
                esq++;
            }
            melhor = Math.Max(melhor, dir - esq + 1);
        }
        return melhor;
    }
}
```

## Go

```go
func characterReplacement(s string, k int) int {
	var contagem [26]int
	esq, maiorFreq, melhor := 0, 0, 0
	for dir := 0; dir < len(s); dir++ {
		idx := int(s[dir] - 'A')
		contagem[idx]++
		if contagem[idx] > maiorFreq {
			maiorFreq = contagem[idx]
		}
		if dir-esq+1-maiorFreq > k {
			contagem[s[esq]-'A']--
			esq++
		}
		if dir-esq+1 > melhor {
			melhor = dir - esq + 1
		}
	}
	return melhor
}
```
