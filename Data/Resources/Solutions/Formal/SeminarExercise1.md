1) For each DFA, identify the language it accepts. 

Note these exercises are meant to teach you little tricks about DFAs - there is a key takeaways section at the bottom!

**(1)**

```tikz
\begin{tikzpicture}
\node[state, initial] (s1) {$s$};
\draw (s1) edge[loop above] node {\sym{0},\sym{1}} (s1);
\end{tikzpicture}
```

>[!check]- Solution
> $L = \emptyset$. There are no accepting states, so no string is accepted.


**(2)**

```tikz
\begin{tikzpicture}
\node[state, initial, accepting] (s1) {$s$};
\draw (s1) edge[loop above] node {\sym{0},\sym{1}} (s1);
\end{tikzpicture}
```

>[!hint]- Hint 1
> Does this language reject any string?

>[!check]- Solution
> $L = \Sigma^*$. Every state is accepting, so every string ends in an accepting state.

**(3)**

```tikz
\begin{tikzpicture}
\node[state, initial] (s1) {$s_1$};
\node[state, accepting, right of=s1] (s2) {$s_2$};
\draw (s1) edge node {\sym{0}, \sym{1}} (s2);
\draw (s2) edge[loop above] node {\sym{0},\sym{1}} (s2);
\end{tikzpicture}
```

>[!hint]- Hint 1
> Strings that only get to $s_1$ get rejected. What strings only get to $s_1$? What length must they have?

>[!check]- Solution
> $L = \Sigma^* \setminus \{\varepsilon\}$. Only the empty string gets to $s_1$ and stays on $s_1$; every non-empty string consumes at least one symbol and so leaves $s_1$ for an accepting state.


**(4)**

```tikz
\begin{tikzpicture}
\node[state, initial, accepting] (s1) {$s_1$};
\node[state, right of=s1] (s2) {$s_2$};
\draw (s1) edge node {\sym{0}, \sym{1}} (s2);
\draw (s2) edge[loop above] node {\sym{0},\sym{1}} (s2);
\end{tikzpicture}
```

>[!hint]- Hint 1
> What strings stay at $s_1$ and don't progress any further? What length must they have?

>[!check]- Solution
> $L = \{\varepsilon\}$. Only the empty string is accepted, since reading any symbol leaves the (only) accepting start state and never returns.

**(5)**

```tikz
\begin{tikzpicture}
\node[state, initial, accepting] (s1) {$s_1$};
\node[state, right of=s1] (s2) {$s_2$};
\draw (s1) edge node {\sym{1}} (s2);
\draw (s1) edge[loop above] node {\sym{0}} (s1);
\draw (s2) edge[loop above] node {\sym{0},\sym{1}} (s2);
\end{tikzpicture}
```

>[!hint]- Hint 1
> Consuming a $1$ leads you to a part of the DFA that can never get to an accepting state. What strings stay in the accepting state?

>[!check]- Solution
> $L = \{\varepsilon, 0, 00, 000, \ldots\} = \{\varepsilon\} \cup 0^+ = \{0\}^*$. In other words, the language of strings that don't contain a $1$.
>
> The inclusion of $\varepsilon$ is important. It's what parts (3) and (4) try to teach you.

**(6)**

```tikz
\begin{tikzpicture}
\node[state, initial] (s1) {$s_1$};
\node[state, accepting, right of=s1] (s2) {$s_2$};
\draw (s1) edge node {\sym{1}} (s2);
\draw (s1) edge[loop above] node {\sym{0}} (s1);
\draw (s2) edge[loop above] node {\sym{0},\sym{1}} (s2);
\end{tikzpicture}
```

>[!hint]- Hint 1
> Consuming a $1$ leads you to the accepting state in the DFA, which loops to itself.

>[!check]- Solution
> Language of strings with at least one $1$. Note that $\varepsilon$ is **not** in this language.

**(7)**

```tikz
\begin{tikzpicture}
\node[state, initial] (s1) {$s_1$};
\node[state, right of=s1] (s2) {$s_2$};
\draw (s1) edge node {\sym{1}} (s2);
\draw (s1) edge[loop above] node {\sym{0}} (s1);
\draw (s2) edge[loop above] node {\sym{0},\sym{1}} (s2);
\end{tikzpicture}
```

>[!hint]- Hint 1
> Are there any accepting states? What does this imply?

>[!check]- Solution
> $L = \emptyset$. There are no accepting states, so no string is accepted.

**(8)**

```tikz
\begin{tikzpicture}
\node[state, initial, accepting] (s1) {$s_1$};
\node[state, accepting, right of=s1] (s2) {$s_2$};
\draw (s1) edge node {\sym{1}} (s2);
\draw (s1) edge[loop above] node {\sym{0}} (s1);
\draw (s2) edge[loop above] node {\sym{0},\sym{1}} (s2);
\end{tikzpicture}
```

>[!hint]- Hint 1
> All states here are accepting. What does that imply?

>[!check]- Solution
> $L = \Sigma^*$. There are only accepting states, so all strings are accepted.

**(9)**

```tikz
\begin{tikzpicture}
\node[state, initial] (s1) {$s_1$};
\node[state, accepting, right of=s1] (s2) {$s_2$};
\draw (s1) edge[bend left] node {\sym{1}} (s2);
\draw (s2) edge[bend left] node {\sym{1}} (s1);
\draw (s1) edge[loop above] node {\sym{0}} (s1);
\draw (s2) edge[loop above] node {\sym{0}} (s2);
\end{tikzpicture}
```

>[!hint]- Hint 1
> A $1$ takes you from $s_1$ to $s_2$. A $1$ also takes you from $s_2$ to $s_1$. If a string finishes on $s_2$, what does that say about the number of $1$s?

>[!check]- Solution
> $L = \{s \in \Sigma^* \mid s \text{ has an odd number of } 1\text{s in it}\}$.

**(10)**

```tikz
\begin{tikzpicture}
\node[state, initial, accepting] (s1) {$s_1$};
\node[state, right of=s1] (s2) {$s_2$};
\draw (s1) edge[bend left] node {\sym{1}} (s2);
\draw (s2) edge[bend left] node {\sym{1}} (s1);
\draw (s1) edge[loop above] node {\sym{0}} (s1);
\draw (s2) edge[loop above] node {\sym{0}} (s2);
\end{tikzpicture}
```

>[!hint]- Hint 1
> A $1$ takes you from $s_1$ to $s_2$. A $1$ also takes you from $s_2$ to $s_1$. If a string finishes on $s_1$, what does that say about the number of $1$s?

>[!check]- Solution
> $L = \{s \in \Sigma^* \mid s \text{ has an even number of } 1\text{s in it}\}$. Note that this includes strings with no $1$s at all (since $0$ is even), including the empty string $\varepsilon$.

**(11)**
```tikz
\begin{tikzpicture}
\node[state, initial] (s1) {$s_1$};
\node[state, accepting, right of=s1] (s2) {$s_2$};
\draw (s1) edge[bend left] node {\sym{0}} (s2);
\draw (s2) edge[bend left] node {\sym{1}} (s1);
\draw (s1) edge[loop above] node {\sym{1}} (s1);
\draw (s2) edge[loop above] node {\sym{0}} (s2);
\end{tikzpicture}
```

>[!hint]- Hint 1
> Think about what being at state $s_1$ or $s_2$ means about the last character read. If a string lands on $s_2$, what is the last character read?

>[!check]- Solution
> $L = \{s \in \Sigma^* \mid |s| \geq 1 \text{ and } s \text{ ends with a } 0\}$.
>
> We've explicitly written out $|s| \geq 1$ even though it's implied by "ends with a $0$", to make it clear that the empty string $\varepsilon$ is not in $L$.
>
> We know it is $L$ and we can prove this in both directions (so we prove any string in the language is accepted by the DFA, and anything accepted by the DFA is in the language).
>
> **Any string in the language is accepted by the DFA.** Take any string $s$ in the language, so $s$ ends in a $0$. Consider the string $s'$, which is $s$ without the $0$ at the end. $s'$ arrives at either $s_1$ or $s_2$.
>
> - $s'$ arriving at $s_1$ (i.e. $\hat\delta(s_1, s') = s_1$): we now read a $0$. This takes us to $s_2$.
> - $s'$ arriving at $s_2$ (i.e. $\hat\delta(s_1, s') = s_2$): we now read a $0$. This takes us back to $s_2$.
>
> In either case, the string $s$ lands at $s_2$ and gets accepted.
>
> **Any string accepted by the DFA is in the language.** Any string $s$ accepted by the DFA must end at the only accepting state, $s_2$. All transitions ending at $s_2$ require a $0$ to be read, therefore all strings ending at $s_2$ must end with a $0$. So any string $s$ accepted by the DFA is in the language.
>
> Therefore the language accepted by the DFA is exactly the language we proposed.

**(12)**
```tikz
\begin{tikzpicture}
\node[state, initial, accepting] (s1) {$s_1$};
\node[state, right of=s1] (s2) {$s_2$};
\draw (s1) edge[bend left] node {\sym{0}} (s2);
\draw (s2) edge[bend left] node {\sym{1}} (s1);
\draw (s1) edge[loop above] node {\sym{1}} (s1);
\draw (s2) edge[loop above] node {\sym{0}} (s2);
\end{tikzpicture}
```

>[!hint]- Hint 1
> Think about what being at state $s_1$ or $s_2$ means about the last character read. If a string lands on $s_1$, what is the last character read?

>[!check]- Solution
> $L = \{s \in \Sigma^* \mid s \text{ ends with a } 1 \text{ or is the empty string } \varepsilon\}$.
>
> The proof given in (11)'s solution can be easily adapted to give a proof for this one.

---

2) Draw DFAs for the given languages (over $\Sigma = \{a, b\}$).

**(1)** $L = \emptyset$

>[!check]- Solution
> ```tikz
> \begin{tikzpicture}
> \node[state, initial] (q1) {$q_1$};
> \draw (q1) edge[loop above] node {\sym{a}, \sym{b}} (q1);
> \end{tikzpicture}
> ```

**(2)** $L = \{\varepsilon\}$

>[!check]- Solution
> ```tikz
> \begin{tikzpicture}
> \node[state, initial, accepting] (q1) {$q_1$};
> \node[state, right of=q1] (q2) {$q_2$};
> \draw (q1) edge node {\sym{a}, \sym{b}} (q2);
> \draw (q2) edge[loop above] node {\sym{a}, \sym{b}} (q2);
> \end{tikzpicture}
> ```

**(3)** $L = \{\varepsilon, a\}$

>[!check]- Solution
> ```tikz
> \begin{tikzpicture}
> \node[state, initial, accepting] (q1) {$q_1$};
> \node[state, accepting, right of=q1] (q2) {$q_2$};
> \node[state, right of=q2] (q3) {$q_3$};
> \draw (q1) edge node {\sym{a}} (q2);
> \draw (q1) edge[bend left] node {\sym{b}} (q3);
> \draw (q2) edge node {\sym{a}, \sym{b}} (q3);
> \draw (q3) edge[loop above] node {\sym{a}, \sym{b}} (q3);
> \end{tikzpicture}
> ```

**(4)** $L = \{a\}$

>[!check]- Solution
> ```tikz
> \begin{tikzpicture}
> \node[state, initial] (q1) {$q_1$};
> \node[state, accepting, right of=q1] (q2) {$q_2$};
> \node[state, right of=q2] (q3) {$q_3$};
> \draw (q1) edge node {\sym{a}} (q2);
> \draw (q1) edge[bend left] node {\sym{b}} (q3);
> \draw (q2) edge node {\sym{a}, \sym{b}} (q3);
> \draw (q3) edge[loop above] node {\sym{a}, \sym{b}} (q3);
> \end{tikzpicture}
> ```

**(5)** $L = \{\varepsilon, a, b\}$

>[!check]- Solution
> ```tikz
> \begin{tikzpicture}
> \node[state, initial, accepting] (q1) {$q_1$};
> \node[state, accepting, right of=q1] (q2) {$q_2$};
> \node[state, right of=q2] (q3) {$q_3$};
> \draw (q1) edge node {\sym{a}, \sym{b}} (q2);
> \draw (q2) edge node {\sym{a}, \sym{b}} (q3);
> \draw (q3) edge[loop above] node {\sym{a}, \sym{b}} (q3);
> \end{tikzpicture}
> ```

**(6)** $L = \{w \in \{a, b\}^* \mid w \text{ has at least two } a\text{'s}\}$

>[!check]- Solution
> ```tikz
> \begin{tikzpicture}
> \node[state, initial] (q1) {$q_1$};
> \node[state, right of=q1] (q2) {$q_2$};
> \node[state, accepting, right of=q2] (q3) {$q_3$};
> \draw (q1) edge[loop above] node {\sym{b}} (q1);
> \draw (q1) edge node {\sym{a}} (q2);
> \draw (q2) edge[loop above] node {\sym{b}} (q2);
> \draw (q2) edge node {\sym{a}} (q3);
> \draw (q3) edge[loop above] node {\sym{a}, \sym{b}} (q3);
> \end{tikzpicture}
> ```

**(7)** $L = \{w \in \{a, b\}^* \mid w \text{ contains exactly two } b\text{'s}\}$

>[!check]- Solution
> ```tikz
> \begin{tikzpicture}
> \node[state, initial] (q1) {$q_1$};
> \node[state, right of=q1] (q2) {$q_2$};
> \node[state, accepting, right of=q2] (q3) {$q_3$};
> \node[state, right of=q3] (q4) {$q_4$};
> \draw (q1) edge[loop above] node {\sym{a}} (q1);
> \draw (q1) edge node {\sym{b}} (q2);
> \draw (q2) edge[loop above] node {\sym{a}} (q2);
> \draw (q2) edge node {\sym{b}} (q3);
> \draw (q3) edge[loop above] node {\sym{a}} (q3);
> \draw (q3) edge node {\sym{b}} (q4);
> \draw (q4) edge[loop above] node {\sym{a}, \sym{b}} (q4);
> \end{tikzpicture}
> ```

**(8)** $L = \{w \in \{a, b\}^* \mid w \text{ does not contain exactly two } b\text{'s}\}$

>[!check]- Solution
> ```tikz
> \begin{tikzpicture}
> \node[state, initial, accepting] (q1) {$q_1$};
> \node[state, accepting, right of=q1] (q2) {$q_2$};
> \node[state, right of=q2] (q3) {$q_3$};
> \node[state, accepting, right of=q3] (q4) {$q_4$};
> \draw (q1) edge[loop above] node {\sym{a}} (q1);
> \draw (q1) edge node {\sym{b}} (q2);
> \draw (q2) edge[loop above] node {\sym{a}} (q2);
> \draw (q2) edge node {\sym{b}} (q3);
> \draw (q3) edge[loop above] node {\sym{a}} (q3);
> \draw (q3) edge node {\sym{b}} (q4);
> \draw (q4) edge[loop above] node {\sym{a}, \sym{b}} (q4);
> \end{tikzpicture}
> ```

**(9)** $L = \{w \in \{a, b\}^* \mid w \text{ has an even number of } b\text{'s}\}$

>[!check]- Solution
> ```tikz
> \begin{tikzpicture}
> \node[state, initial, accepting] (q1) {$q_1$};
> \node[state, right of=q1] (q2) {$q_2$};
> \draw (q1) edge[loop above] node {\sym{a}} (q1);
> \draw (q2) edge[loop above] node {\sym{a}} (q2);
> \draw (q1) edge[bend left] node {\sym{b}} (q2);
> \draw (q2) edge[bend left] node {\sym{b}} (q1);
> \end{tikzpicture}
> ```

**(10)** $L = \{w \in \{a, b\}^* \mid \text{each } a \text{ in } w \text{ is immediately followed by at least one } b\}$

>[!check]- Solution
> ```tikz
> \begin{tikzpicture}
> \node[state, initial, accepting] (q1) {$q_1$};
> \node[state, right of=q1] (q2) {$q_2$};
> \node[state, right of=q2] (q3) {$q_3$};
> \draw (q1) edge[loop above] node {\sym{b}} (q1);
> \draw (q1) edge[bend left] node {\sym{a}} (q2);
> \draw (q2) edge[bend left] node {\sym{b}} (q1);
> \draw (q2) edge node {\sym{a}} (q3);
> \draw (q3) edge[loop above] node {\sym{a}, \sym{b}} (q3);
> \end{tikzpicture}
> ```

**(11)** $L = \{w \in \{a, b\}^* \mid w \text{ has one or two } a\text{'s}\}$

>[!check]- Solution
> ```tikz
> \begin{tikzpicture}
> \node[state, initial] (q1) {$q_1$};
> \node[state, accepting, right of=q1] (q2) {$q_2$};
> \node[state, accepting, right of=q2] (q3) {$q_3$};
> \node[state, right of=q3] (q4) {$q_4$};
> \draw (q1) edge[loop above] node {\sym{b}} (q1);
> \draw (q1) edge node {\sym{a}} (q2);
> \draw (q2) edge[loop above] node {\sym{b}} (q2);
> \draw (q2) edge node {\sym{a}} (q3);
> \draw (q3) edge[loop above] node {\sym{b}} (q3);
> \draw (q3) edge node {\sym{a}} (q4);
> \draw (q4) edge[loop above] node {\sym{a}, \sym{b}} (q4);
> \end{tikzpicture}
> ```

**(12)** $L = \{w \in \{a, b\}^* \mid w \text{ begins with } a\}$

>[!check]- Solution
> ```tikz
> \begin{tikzpicture}
> \node[state, initial] (q1) {$q_1$};
> \node[state, accepting, above right of=q1] (q2) {$q_2$};
> \node[state, below right of=q1] (q3) {$q_3$};
> \draw (q1) edge node {\sym{a}} (q2);
> \draw (q1) edge node {\sym{b}} (q3);
> \draw (q2) edge[loop above] node {\sym{a}, \sym{b}} (q2);
> \draw (q3) edge[loop below] node {\sym{a}, \sym{b}} (q3);
> \end{tikzpicture}
> ```

**(13)** $L = \{w \in \{a, b\}^* \mid w \text{ ends with } b\}$

>[!check]- Solution
> ```tikz
> \begin{tikzpicture}
> \node[state, initial] (q1) {$q_1$};
> \node[state, accepting, right of=q1] (q2) {$q_2$};
> \draw (q1) edge[loop above] node {\sym{a}} (q1);
> \draw (q2) edge[loop above] node {\sym{b}} (q2);
> \draw (q1) edge[bend left] node {\sym{b}} (q2);
> \draw (q2) edge[bend left] node {\sym{a}} (q1);
> \end{tikzpicture}
> ```

**(14)** $L = \{w \in \{a, b\}^* \mid w \text{ has odd length}\}$

>[!check]- Solution
> ```tikz
> \begin{tikzpicture}
> \node[state, initial] (q1) {$q_1$};
> \node[state, accepting, right of=q1] (q2) {$q_2$};
> \draw (q1) edge[bend left] node {\sym{a}, \sym{b}} (q2);
> \draw (q2) edge[bend left] node {\sym{a}, \sym{b}} (q1);
> \end{tikzpicture}
> ```

**(15)** $L = \{w \in \{a, b\}^* \mid w \text{ contains the substring } ab\}$

>[!check]- Solution
> ```tikz
> \begin{tikzpicture}
> \node[state, initial] (q1) {$q_1$};
> \node[state, right of=q1] (q2) {$q_2$};
> \node[state, accepting, right of=q2] (q3) {$q_3$};
> \draw (q1) edge[loop above] node {\sym{b}} (q1);
> \draw (q1) edge node {\sym{a}} (q2);
> \draw (q2) edge[loop above] node {\sym{a}} (q2);
> \draw (q2) edge node {\sym{b}} (q3);
> \draw (q3) edge[loop above] node {\sym{a}, \sym{b}} (q3);
> \end{tikzpicture}
> ```

--- 

3) Give the state-transition diagram of a DFA accepting the following language.

$L = \{w \in \{0, 1\}^* \mid w \text{ represents a non-negative integer divisible by } 3\}$

Assume standard binary representation.

>[!check]- Solution
> Assuming "standard binary representation" means we restrict to positive integers (sidestepping the edge cases of $\varepsilon$ and leading zeros), the DFA only needs to track the running value modulo $3$.
>
> Three states: $q_0$ (mod $0$, accepting), $q_1$ (mod $1$), $q_2$ (mod $2$). Reading a bit $b$ from a state whose current value is $v$ moves us to state $(2v + b) \bmod 3$, since shifting left and adding $b$ is the standard binary-to-integer operation.
> 
> ```tikz
> \begin{tikzpicture}
> \node[state, initial, accepting] (q0) {$q_0$};
> \node[state, right of=q0] (q1) {$q_1$};
> \node[state, below left=3cm and 1cm of q1] (q2) {$q_2$};
> \draw (q0) edge[loop above] node {\sym{0}} (q0);
> \draw (q2) edge[loop below] node {\sym{1}} (q2);
> \draw (q0) edge[bend left] node {\sym{1}} (q1);
> \draw (q1) edge[bend left] node {\sym{1}} (q0);
> \draw (q1) edge[bend left] node {\sym{0}} (q2);
> \draw (q2) edge[bend left] node {\sym{0}} (q1);
> \end{tikzpicture}
> ```

---

## Key Takeaways

>[!info]- Reversing DFA states
> With a DFA specifically, reversing the states of a DFA (so accepting states turn to regular states, regular states turn to accepting states) accepting language $L$ leads to a DFA which accepts the complement of $L$ ($\Sigma^* \setminus L$).
>
> This greatly simplifies Exercise 1 since half the DFAs are just the other DFAs with accepting and rejecting states flipped. Also simplifies (8) in Exercise 2.

>[!info]- All states are accepting (or rejecting)
> When all states are accepting, every string is accepted (including $\varepsilon$). $L = \Sigma^*$.
>
> Similarly, if there are no accepting states, then no string is accepted. $L = \emptyset$.

>[!info]- Epsilon
> Think carefully about whether $\varepsilon$ is in the language or not. People often mess this up.