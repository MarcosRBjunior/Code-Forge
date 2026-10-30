## Ideia

Use dois ponteiros, um no início e outro no fim da string. Avance cada um enquanto apontar para um caractere que não seja letra nem dígito. Quando os dois param em caracteres válidos, compare-os sem diferenciar maiúsculas de minúsculas: se forem diferentes, não é palíndromo.

Isso evita construir uma string limpa e invertida, e cada posição é visitada no máximo uma vez.

## Complexidade

Tempo O(n), com uma passada dos dois ponteiros. Espaço O(1) extra.

## Python

```python
def is_palindrome(s):
    i, j = 0, len(s) - 1
    while i < j:
        while i < j and not s[i].isalnum():
            i += 1
        while i < j and not s[j].isalnum():
            j -= 1
        if s[i].lower() != s[j].lower():
            return False
        i += 1
        j -= 1
    return True
```

## JavaScript

```javascript
function isPalindrome(s) {
  const alnum = (ch) => /[a-z0-9]/i.test(ch);
  let i = 0, j = s.length - 1;
  while (i < j) {
    while (i < j && !alnum(s[i])) i++;
    while (i < j && !alnum(s[j])) j--;
    if (s[i].toLowerCase() !== s[j].toLowerCase()) return false;
    i++;
    j--;
  }
  return true;
}
```

## TypeScript

```typescript
function isPalindrome(s: string): boolean {
  const alnum = (ch: string): boolean => /[a-z0-9]/i.test(ch);
  let i = 0, j = s.length - 1;
  while (i < j) {
    while (i < j && !alnum(s[i])) i++;
    while (i < j && !alnum(s[j])) j--;
    if (s[i].toLowerCase() !== s[j].toLowerCase()) return false;
    i++;
    j--;
  }
  return true;
}
```

## Java

```java
class Solution {
    public boolean isPalindrome(String s) {
        int i = 0, j = s.length() - 1;
        while (i < j) {
            while (i < j && !Character.isLetterOrDigit(s.charAt(i))) i++;
            while (i < j && !Character.isLetterOrDigit(s.charAt(j))) j--;
            if (Character.toLowerCase(s.charAt(i)) != Character.toLowerCase(s.charAt(j))) return false;
            i++;
            j--;
        }
        return true;
    }
}
```

## C++

```cpp
class Solution {
public:
    bool isPalindrome(string s) {
        int i = 0, j = (int)s.size() - 1;
        while (i < j) {
            while (i < j && !isalnum((unsigned char)s[i])) i++;
            while (i < j && !isalnum((unsigned char)s[j])) j--;
            if (tolower((unsigned char)s[i]) != tolower((unsigned char)s[j])) return false;
            i++;
            j--;
        }
        return true;
    }
};
```

## C#

```csharp
public class Solution {
    public bool IsPalindrome(string s) {
        int i = 0, j = s.Length - 1;
        while (i < j) {
            while (i < j && !char.IsLetterOrDigit(s[i])) i++;
            while (i < j && !char.IsLetterOrDigit(s[j])) j--;
            if (char.ToLower(s[i]) != char.ToLower(s[j])) return false;
            i++;
            j--;
        }
        return true;
    }
}
```

## Go

```go
import "unicode"

func isPalindrome(s string) bool {
	r := []rune(s)
	i, j := 0, len(r)-1
	for i < j {
		for i < j && !unicode.IsLetter(r[i]) && !unicode.IsDigit(r[i]) {
			i++
		}
		for i < j && !unicode.IsLetter(r[j]) && !unicode.IsDigit(r[j]) {
			j--
		}
		if unicode.ToLower(r[i]) != unicode.ToLower(r[j]) {
			return false
		}
		i++
		j--
	}
	return true
}
```
