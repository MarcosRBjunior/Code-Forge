## Ideia

Em cada dia você está em um de três estados: segurando uma ação, acabou de vender (em espera) ou livre sem ação. Guarde o melhor lucro possível para cada estado e atualize os três a cada preço novo.

Segurando hoje vem de segurar ontem ou de comprar a partir do estado livre de ontem (pagando o preço de hoje). Em espera hoje vem de vender o que estava em mãos ontem. Livre hoje vem de livre ontem ou de estar em espera ontem. Como só o estado livre pode comprar, o dia de espera é respeitado sem esforço extra. A resposta é o melhor entre em espera e livre no último dia.

## Complexidade

Tempo `O(n)`, uma passada pelos preços. Espaço `O(1)`, só três variáveis.

## Python

```python
def max_profit_cooldown(prices):
    com_acao = -prices[0]
    em_espera = 0
    livre = 0
    for preco in prices[1:]:
        novo_com_acao = max(com_acao, livre - preco)
        novo_em_espera = com_acao + preco
        novo_livre = max(livre, em_espera)
        com_acao, em_espera, livre = novo_com_acao, novo_em_espera, novo_livre
    return max(em_espera, livre)
```

## JavaScript

```javascript
function maxProfitCooldown(prices) {
  let comAcao = -prices[0];
  let emEspera = 0;
  let livre = 0;
  for (let i = 1; i < prices.length; i++) {
    const novoComAcao = Math.max(comAcao, livre - prices[i]);
    const novoEmEspera = comAcao + prices[i];
    const novoLivre = Math.max(livre, emEspera);
    comAcao = novoComAcao;
    emEspera = novoEmEspera;
    livre = novoLivre;
  }
  return Math.max(emEspera, livre);
}
```

## TypeScript

```typescript
function maxProfitCooldown(prices: number[]): number {
  let comAcao = -prices[0];
  let emEspera = 0;
  let livre = 0;
  for (let i = 1; i < prices.length; i++) {
    const novoComAcao = Math.max(comAcao, livre - prices[i]);
    const novoEmEspera = comAcao + prices[i];
    const novoLivre = Math.max(livre, emEspera);
    comAcao = novoComAcao;
    emEspera = novoEmEspera;
    livre = novoLivre;
  }
  return Math.max(emEspera, livre);
}
```

## Java

```java
class Solution {
    public int maxProfitCooldown(int[] prices) {
        int comAcao = -prices[0];
        int emEspera = 0;
        int livre = 0;
        for (int i = 1; i < prices.length; i++) {
            int novoComAcao = Math.max(comAcao, livre - prices[i]);
            int novoEmEspera = comAcao + prices[i];
            int novoLivre = Math.max(livre, emEspera);
            comAcao = novoComAcao;
            emEspera = novoEmEspera;
            livre = novoLivre;
        }
        return Math.max(emEspera, livre);
    }
}
```

## C++

```cpp
class Solution {
public:
    int maxProfitCooldown(vector<int>& prices) {
        int comAcao = -prices[0];
        int emEspera = 0;
        int livre = 0;
        for (size_t i = 1; i < prices.size(); i++) {
            int novoComAcao = max(comAcao, livre - prices[i]);
            int novoEmEspera = comAcao + prices[i];
            int novoLivre = max(livre, emEspera);
            comAcao = novoComAcao;
            emEspera = novoEmEspera;
            livre = novoLivre;
        }
        return max(emEspera, livre);
    }
};
```

## C#

```csharp
public class Solution {
    public int MaxProfitCooldown(int[] prices) {
        int comAcao = -prices[0];
        int emEspera = 0;
        int livre = 0;
        for (int i = 1; i < prices.Length; i++) {
            int novoComAcao = Math.Max(comAcao, livre - prices[i]);
            int novoEmEspera = comAcao + prices[i];
            int novoLivre = Math.Max(livre, emEspera);
            comAcao = novoComAcao;
            emEspera = novoEmEspera;
            livre = novoLivre;
        }
        return Math.Max(emEspera, livre);
    }
}
```

## Go

```go
func maxProfitCooldown(prices []int) int {
	comAcao := -prices[0]
	emEspera := 0
	livre := 0
	for _, preco := range prices[1:] {
		novoComAcao := max(comAcao, livre-preco)
		novoEmEspera := comAcao + preco
		novoLivre := max(livre, emEspera)
		comAcao, emEspera, livre = novoComAcao, novoEmEspera, novoLivre
	}
	return max(emEspera, livre)
}
```
