## Ideia

Mantenha um ponteiro de escrita que indica onde vai o próximo elemento diferente de zero. Percorra o array: cada valor não nulo é copiado para a posição de escrita, que então avança. Como a leitura nunca fica atrás da escrita, nada é sobrescrito antes de ser lido, e a ordem relativa dos não nulos é preservada.

Terminada a passada, tudo a partir da posição de escrita deve ser zero, então basta preencher o resto com zeros.

## Complexidade

Tempo O(n), com uma passada para copiar e outra para preencher. Espaço O(1).

## Python

```python
def move_zeroes(nums):
    escrita = 0
    for x in nums:
        if x != 0:
            nums[escrita] = x
            escrita += 1
    for i in range(escrita, len(nums)):
        nums[i] = 0
```

## JavaScript

```javascript
function moveZeroes(nums) {
  let escrita = 0;
  for (const x of nums) {
    if (x !== 0) nums[escrita++] = x;
  }
  for (let i = escrita; i < nums.length; i++) nums[i] = 0;
}
```

## TypeScript

```typescript
function moveZeroes(nums: number[]): void {
  let escrita = 0;
  for (const x of nums) {
    if (x !== 0) nums[escrita++] = x;
  }
  for (let i = escrita; i < nums.length; i++) nums[i] = 0;
}
```

## Java

```java
class Solution {
    public void moveZeroes(int[] nums) {
        int escrita = 0;
        for (int x : nums) {
            if (x != 0) nums[escrita++] = x;
        }
        for (int i = escrita; i < nums.length; i++) nums[i] = 0;
    }
}
```

## C++

```cpp
class Solution {
public:
    void moveZeroes(vector<int>& nums) {
        int escrita = 0;
        for (int x : nums) {
            if (x != 0) nums[escrita++] = x;
        }
        for (int i = escrita; i < (int)nums.size(); i++) nums[i] = 0;
    }
};
```

## C#

```csharp
public class Solution {
    public void MoveZeroes(int[] nums) {
        int escrita = 0;
        foreach (int x in nums) {
            if (x != 0) nums[escrita++] = x;
        }
        for (int i = escrita; i < nums.Length; i++) nums[i] = 0;
    }
}
```

## Go

```go
func moveZeroes(nums []int) {
	escrita := 0
	for _, x := range nums {
		if x != 0 {
			nums[escrita] = x
			escrita++
		}
	}
	for i := escrita; i < len(nums); i++ {
		nums[i] = 0
	}
}
```
