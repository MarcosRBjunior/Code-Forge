## Ideia

Usamos duas pontas que só avançam. Contamos quantas vezes cada caractere de `t` é necessário e mantemos `faltam`, o total de caracteres de `t` ainda não cobertos pela janela. Avançamos a ponta direita, incluindo cada caractere: se ele era necessário (contagem positiva), `faltam` diminui.

Quando `faltam` chega a zero, a janela contém tudo o que `t` exige. Então encolhemos pela esquerda enquanto ela continuar completa, registrando a menor janela vista; ao remover um caractere que volta a ser necessário, `faltam` volta a subir e retomamos a expansão pela direita. Registrar apenas janelas estritamente menores mantém a mais à esquerda em caso de empate.

## Complexidade

Tempo O(|s| + |t|), pois cada ponta percorre `s` uma vez. Espaço O(1), pois o alfabeto é de tamanho fixo.

## Python

```python
def min_window(s, t):
    precisa = {}
    for c in t:
        precisa[c] = precisa.get(c, 0) + 1
    faltam = len(t)
    melhor_inicio, melhor_tamanho = 0, len(s) + 1
    esquerda = 0
    for direita, c in enumerate(s):
        if precisa.get(c, 0) > 0:
            faltam -= 1
        precisa[c] = precisa.get(c, 0) - 1
        while faltam == 0:
            if direita - esquerda + 1 < melhor_tamanho:
                melhor_inicio, melhor_tamanho = esquerda, direita - esquerda + 1
            e = s[esquerda]
            precisa[e] += 1
            if precisa[e] > 0:
                faltam += 1
            esquerda += 1
    if melhor_tamanho > len(s):
        return ""
    return s[melhor_inicio:melhor_inicio + melhor_tamanho]
```

## JavaScript

```javascript
function minWindow(s, t) {
  const precisa = new Map();
  for (const c of t) precisa.set(c, (precisa.get(c) || 0) + 1);
  let faltam = t.length;
  let melhorInicio = 0;
  let melhorTamanho = s.length + 1;
  let esquerda = 0;
  for (let direita = 0; direita < s.length; direita++) {
    const c = s[direita];
    if ((precisa.get(c) || 0) > 0) faltam--;
    precisa.set(c, (precisa.get(c) || 0) - 1);
    while (faltam === 0) {
      if (direita - esquerda + 1 < melhorTamanho) {
        melhorInicio = esquerda;
        melhorTamanho = direita - esquerda + 1;
      }
      const e = s[esquerda];
      precisa.set(e, precisa.get(e) + 1);
      if (precisa.get(e) > 0) faltam++;
      esquerda++;
    }
  }
  return melhorTamanho > s.length ? "" : s.substr(melhorInicio, melhorTamanho);
}
```

## TypeScript

```typescript
function minWindow(s: string, t: string): string {
  const precisa = new Map<string, number>();
  for (const c of t) precisa.set(c, (precisa.get(c) || 0) + 1);
  let faltam = t.length;
  let melhorInicio = 0;
  let melhorTamanho = s.length + 1;
  let esquerda = 0;
  for (let direita = 0; direita < s.length; direita++) {
    const c = s[direita];
    if ((precisa.get(c) || 0) > 0) faltam--;
    precisa.set(c, (precisa.get(c) || 0) - 1);
    while (faltam === 0) {
      if (direita - esquerda + 1 < melhorTamanho) {
        melhorInicio = esquerda;
        melhorTamanho = direita - esquerda + 1;
      }
      const e = s[esquerda];
      precisa.set(e, precisa.get(e)! + 1);
      if (precisa.get(e)! > 0) faltam++;
      esquerda++;
    }
  }
  return melhorTamanho > s.length ? "" : s.substring(melhorInicio, melhorInicio + melhorTamanho);
}
```

## Java

```java
class Solution {
    public String minWindow(String s, String t) {
        int[] precisa = new int[128];
        for (char c : t.toCharArray()) precisa[c]++;
        int faltam = t.length();
        int melhorInicio = 0, melhorTamanho = s.length() + 1;
        int esquerda = 0;
        for (int direita = 0; direita < s.length(); direita++) {
            char c = s.charAt(direita);
            if (precisa[c] > 0) faltam--;
            precisa[c]--;
            while (faltam == 0) {
                if (direita - esquerda + 1 < melhorTamanho) {
                    melhorInicio = esquerda;
                    melhorTamanho = direita - esquerda + 1;
                }
                char e = s.charAt(esquerda);
                precisa[e]++;
                if (precisa[e] > 0) faltam++;
                esquerda++;
            }
        }
        return melhorTamanho > s.length() ? "" : s.substring(melhorInicio, melhorInicio + melhorTamanho);
    }
}
```

## C++

```cpp
class Solution {
public:
    string minWindow(string s, string t) {
        vector<int> precisa(128, 0);
        for (char c : t) precisa[(int)c]++;
        int faltam = t.size();
        int melhorInicio = 0, melhorTamanho = (int)s.size() + 1;
        int esquerda = 0;
        for (int direita = 0; direita < (int)s.size(); direita++) {
            char c = s[direita];
            if (precisa[(int)c] > 0) faltam--;
            precisa[(int)c]--;
            while (faltam == 0) {
                if (direita - esquerda + 1 < melhorTamanho) {
                    melhorInicio = esquerda;
                    melhorTamanho = direita - esquerda + 1;
                }
                char e = s[esquerda];
                precisa[(int)e]++;
                if (precisa[(int)e] > 0) faltam++;
                esquerda++;
            }
        }
        return melhorTamanho > (int)s.size() ? "" : s.substr(melhorInicio, melhorTamanho);
    }
};
```

## C#

```csharp
public class Solution {
    public string MinWindow(string s, string t) {
        int[] precisa = new int[128];
        foreach (char c in t) precisa[c]++;
        int faltam = t.Length;
        int melhorInicio = 0, melhorTamanho = s.Length + 1;
        int esquerda = 0;
        for (int direita = 0; direita < s.Length; direita++) {
            char c = s[direita];
            if (precisa[c] > 0) faltam--;
            precisa[c]--;
            while (faltam == 0) {
                if (direita - esquerda + 1 < melhorTamanho) {
                    melhorInicio = esquerda;
                    melhorTamanho = direita - esquerda + 1;
                }
                char e = s[esquerda];
                precisa[e]++;
                if (precisa[e] > 0) faltam++;
                esquerda++;
            }
        }
        return melhorTamanho > s.Length ? "" : s.Substring(melhorInicio, melhorTamanho);
    }
}
```

## Go

```go
func minWindow(s string, t string) string {
	var precisa [128]int
	for i := 0; i < len(t); i++ {
		precisa[t[i]]++
	}
	faltam := len(t)
	melhorInicio, melhorTamanho := 0, len(s)+1
	esquerda := 0
	for direita := 0; direita < len(s); direita++ {
		c := s[direita]
		if precisa[c] > 0 {
			faltam--
		}
		precisa[c]--
		for faltam == 0 {
			if direita-esquerda+1 < melhorTamanho {
				melhorInicio = esquerda
				melhorTamanho = direita - esquerda + 1
			}
			e := s[esquerda]
			precisa[e]++
			if precisa[e] > 0 {
				faltam++
			}
			esquerda++
		}
	}
	if melhorTamanho > len(s) {
		return ""
	}
	return s[melhorInicio : melhorInicio+melhorTamanho]
}
```
