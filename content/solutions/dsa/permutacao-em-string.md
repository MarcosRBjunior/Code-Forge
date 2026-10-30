## Ideia

Uma permutação de `s1` é qualquer trecho com as mesmas letras nas mesmas quantidades, e esse trecho tem sempre o tamanho de `s1`. Então basta deslizar uma janela desse tamanho sobre `s2` e comparar as contagens de letras da janela com as de `s1`.

A cada passo a janela ganha uma letra à direita e perde uma à esquerda, o que atualiza a contagem em tempo constante. Como o alfabeto tem 26 letras, comparar as duas contagens também custa tempo constante.

## Complexidade

Tempo O(n · 26), ou seja, linear no tamanho de `s2`. Espaço O(1), com dois vetores de 26 posições.

## Python

```python
def check_inclusion(s1, s2):
    k = len(s1)
    if k > len(s2):
        return False
    alvo = [0] * 26
    janela = [0] * 26
    for ch in s1:
        alvo[ord(ch) - 97] += 1
    for i, ch in enumerate(s2):
        janela[ord(ch) - 97] += 1
        if i >= k:
            janela[ord(s2[i - k]) - 97] -= 1
        if janela == alvo:
            return True
    return False
```

## JavaScript

```javascript
function checkInclusion(s1, s2) {
  const k = s1.length;
  if (k > s2.length) return false;
  const alvo = new Array(26).fill(0);
  const janela = new Array(26).fill(0);
  for (const ch of s1) alvo[ch.charCodeAt(0) - 97]++;
  for (let i = 0; i < s2.length; i++) {
    janela[s2.charCodeAt(i) - 97]++;
    if (i >= k) janela[s2.charCodeAt(i - k) - 97]--;
    if (janela.every((v, j) => v === alvo[j])) return true;
  }
  return false;
}
```

## TypeScript

```typescript
function checkInclusion(s1: string, s2: string): boolean {
  const k = s1.length;
  if (k > s2.length) return false;
  const alvo: number[] = new Array(26).fill(0);
  const janela: number[] = new Array(26).fill(0);
  for (const ch of s1) alvo[ch.charCodeAt(0) - 97]++;
  for (let i = 0; i < s2.length; i++) {
    janela[s2.charCodeAt(i) - 97]++;
    if (i >= k) janela[s2.charCodeAt(i - k) - 97]--;
    if (janela.every((v, j) => v === alvo[j])) return true;
  }
  return false;
}
```

## Java

```java
class Solution {
    public boolean checkInclusion(String s1, String s2) {
        int k = s1.length();
        if (k > s2.length()) return false;
        int[] alvo = new int[26];
        int[] janela = new int[26];
        for (char ch : s1.toCharArray()) alvo[ch - 'a']++;
        for (int i = 0; i < s2.length(); i++) {
            janela[s2.charAt(i) - 'a']++;
            if (i >= k) janela[s2.charAt(i - k) - 'a']--;
            if (Arrays.equals(janela, alvo)) return true;
        }
        return false;
    }
}
```

## C++

```cpp
class Solution {
public:
    bool checkInclusion(string s1, string s2) {
        int k = s1.size();
        if (k > (int)s2.size()) return false;
        array<int, 26> alvo{}, janela{};
        for (char ch : s1) alvo[ch - 'a']++;
        for (int i = 0; i < (int)s2.size(); i++) {
            janela[s2[i] - 'a']++;
            if (i >= k) janela[s2[i - k] - 'a']--;
            if (janela == alvo) return true;
        }
        return false;
    }
};
```

## C#

```csharp
public class Solution {
    public bool CheckInclusion(string s1, string s2) {
        int k = s1.Length;
        if (k > s2.Length) return false;
        var alvo = new int[26];
        var janela = new int[26];
        foreach (char ch in s1) alvo[ch - 'a']++;
        for (int i = 0; i < s2.Length; i++) {
            janela[s2[i] - 'a']++;
            if (i >= k) janela[s2[i - k] - 'a']--;
            if (janela.SequenceEqual(alvo)) return true;
        }
        return false;
    }
}
```

## Go

```go
func checkInclusion(s1 string, s2 string) bool {
	k := len(s1)
	if k > len(s2) {
		return false
	}
	var alvo, janela [26]int
	for i := 0; i < k; i++ {
		alvo[s1[i]-'a']++
	}
	for i := 0; i < len(s2); i++ {
		janela[s2[i]-'a']++
		if i >= k {
			janela[s2[i-k]-'a']--
		}
		if janela == alvo {
			return true
		}
	}
	return false
}
```
