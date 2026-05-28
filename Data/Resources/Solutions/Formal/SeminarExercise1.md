1) For each DFA, identify the language it accepts.

**(a)**

>[!check]- Solution
> $L = \emptyset$. There are no accepting states, so no string is accepted.


**(b)**

>[!hint]- Hint 1
> Does this language reject any string?

>[!check]- Solution
> $L = \Sigma^*$. Every state is accepting, so every string ends in an accepting state.


**(c)**

>[!hint]- Hint 1
> Strings that only get to $s_1$ get rejected. What strings only get to $s_1$? What length must they have?

>[!check]- Solution
> $L = \Sigma^* \setminus \{\varepsilon\}$. Only the empty string gets to $s_1$ and stays on $s_1$; every non-empty string consumes at least one symbol and so leaves $s_1$ for an accepting state.


**(d)**

>[!check]- Solution
> $L = \{\varepsilon\}$. Only the empty string is accepted, since reading any symbol leaves the (only) accepting start state and never returns.

---

2) Draw DFAs for the given languages.

**(a)**

>[!check]- Solution
> ```tikz
> \begin{tikzpicture}
> \node[state, initial] (q1) {$q_1$};
> \draw (q1) edge[loop above] node {\sym{a}, \sym{b}} (q1);
> \end{tikzpicture}
> ```
