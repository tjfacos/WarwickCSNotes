**(a)** Give a regular language $A$ such that every DFA accepting $A$ must have at least $3$ states. Justify your answer.

>[!hint]- Hint 1
> Is there a way to force a state to exist because being there represents something being done (perhaps having read some symbol)?

>[!hint]- Hint 2
> The language of strings (over $\{a, b\}$) containing at least one $a$ requires at least $2$ states. Here is one such automaton:
>
> ```tikz
> \begin{tikzpicture}
> \node[state, initial] (q1) {$q_1$};
> \node[state, accepting, right of=q1] (q2) {$q_2$};
> \draw (q1) edge[loop above] node {\sym{b}} (q1);
> \draw (q1) edge node {\sym{a}} (q2);
> \draw (q2) edge[loop above] node {\sym{a}, \sym{b}} (q2);
> \end{tikzpicture}
> ```
>
> Being at the second state means you must have read at least one $a$, so the second state *represents* "at least one $a$ has been read". Can you extend this idea to get a language that requires $3$ states in a DFA?

>[!check]- Solution
> $A = \{w \in \{a, b\}^* \mid w \text{ has at least two } a\text{'s}\}$.
>
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
>
> Anything that needs to keep track of $3$ distinct conditions needs at least $3$ states. In the case of $A$, we need to track the conditions: "$0$ a's read so far", "exactly $1$ a read", and "at least $2$ a's read".
>
> Another example of having to track $3$ possible conditions is the "divisible by $3$" problem from seminar sheet 1 (Q3): the DFA tracks the running value modulo $3$, which has three possible remainders: $0$, $1$, $2$.


**(b)** Is the following statement true or false? For every regular language $A$ and for every $i \in \mathbb{N}$, there is a DFA $M_i^A$ such that $L(M_i^A) = A$ and $M_i^A$ has at least $i$ states. Justify your answer.

>[!hint]- Hint 1
> For every regular language $A$, there is some DFA $M$ that accepts it - say with $n$ states. Automatically, for any $i \leq n$, $M_i^A$ exists: just take $M_i^A$ to be $M$. The issue is constructing a larger automaton for $i > n$.

>[!hint]- Hint 2
> Is there a way to add more states to the DFA *without* affecting the recognised language?

>[!hint]- Hint 3
> Arrows / transitions cause issues with adding new states, because they consume a symbol and so change which state the run lands in. Can you add a state without adding any new incoming transitions?

>[!check]- Solution
> **True.**
>
> Any regular language has a DFA that recognises it, and by the definition of DFA (*Deterministic **Finite** Automaton*), that DFA has a finite number of states.
>
> The issue is that for simple languages like $L = \{a\}$ and high values of $i$, it might seem like you can't construct such a massive automaton to recognise the simple language since arrows have to consume characters.
>
> The fix is to add an arbitrary number of "dead" states to the DFA that accepts the language: states that are unreachable from $q_0$, with self-loops on every symbol so the DFA stays total. They contribute nothing to the recognised language but bump up $|Q|$, so for any $i$ we can produce a DFA with at least $i$ states.
>
> *Example.* Take $L = \{a\}$ over $\Sigma = \{a, b\}$. A DFA for $L$ has just $2$ reachable states (with the implicit trap absorbing everything else):
>
> ```tikz
> \begin{tikzpicture}
> \node[state, initial] (q1) {$q_1$};
> \node[state, accepting, right of=q1] (q2) {$q_2$};
> \draw (q1) edge node {\sym{a}} (q2);
> \end{tikzpicture}
> ```
>
> For $i = 8$, we can add $6$ unreachable dead states $d_1, \ldots, d_6$:
>
> ```tikz
> \begin{tikzpicture}
> \node[state, initial] (q1) {$q_1$};
> \node[state, accepting, right of=q1] (q2) {$q_2$};
> \draw (q1) edge node {\sym{a}} (q2);
> \node[state, below of=q1] (d1) {$d_1$};
> \node[state, right of=d1] (d2) {$d_2$};
> \node[state, right of=d2] (d3) {$d_3$};
> \node[state, below of=d1] (d4) {$d_4$};
> \node[state, right of=d4] (d5) {$d_5$};
> \node[state, right of=d5] (d6) {$d_6$};
> \draw (d1) edge[loop left] node {\sym{a}, \sym{b}} (d1);
> \draw (d2) edge[loop below] node {\sym{a}, \sym{b}} (d2);
> \draw (d3) edge[loop right] node {\sym{a}, \sym{b}} (d3);
> \draw (d4) edge[loop left] node {\sym{a}, \sym{b}} (d4);
> \draw (d5) edge[loop below] node {\sym{a}, \sym{b}} (d5);
> \draw (d6) edge[loop right] node {\sym{a}, \sym{b}} (d6);
> \end{tikzpicture}
> ```
> *Note we have self-loop transitions on the "dead" states because in DFAs, the transition function is a function so must map every symbol, state pair to exactly one state*
>
> Formally, given a DFA $M = (Q, \Sigma, \delta, q_0, F)$ for $A$ and a target $i \in \mathbb{N}$, construct $M_i^A = (Q \cup Q_D, \Sigma, \delta', q_0, F)$ where $Q_D$ is a set of $\max(0, i - |Q|)$ fresh dead states and
> $$\delta'(q, a) = \begin{cases} \delta(q, a) & q \in Q \\ q & q \in Q_D \end{cases}$$
> Every $d \in Q_D$ self-loops on every symbol; nothing in $Q$ ever transitions into $Q_D$. So $Q_D$ is unreachable from $q_0$, $L(M_i^A) = L(M) = A$, and $|Q \cup Q_D| \geq i$ by construction.


**(c)** Consider a regular language $L$. Is the following statement true or false? There exists an NFA without $\varepsilon$-transitions that accepts $L$. Justify your answer.

>[!hint]- Hint 1
> NFAs are extensions of DFAs, with the introduction of:
> - reading $\varepsilon$ (the empty string) as a transition symbol, and
> - many states (or no states), instead of just one, as the result of each (symbol, state) combination.

>[!hint]- Hint 2
> DFAs are NFAs without $\varepsilon$-transitions. How can you construct an NFA based off a DFA?

>[!check]- Solution
> **True.**
>
> NFAs are extensions of DFAs, so any DFA can be trivially converted into an NFA (which doesn't have $\varepsilon$-transitions). Any regular language has a DFA that recognises it, so any regular language has an NFA without $\varepsilon$-transitions that accepts it.
>
> More specifically: take a regular language and consider the DFA $(Q, \Sigma, \delta, q_0, F)$ that accepts it. Consider the NFA $(Q, \Sigma, \delta', q_0, F)$ where $\delta'(q, x) = \{\delta(q, x)\}$. This behaves exactly as the DFA does, and does not have $\varepsilon$-transitions.


**(d)** Consider a regular language $L \subseteq \Sigma^* \setminus \{\varepsilon\}$. Is the following statement true or false? There exists an NFA without $\varepsilon$-transitions and with a single final state that accepts $L$. Justify your answer.

>[!hint]- Hint 1
> We can create an NFA without $\varepsilon$-transitions using part (c). Is there a way to go from *many* final states to *one* final state, without re-introducing $\varepsilon$-transitions?

>[!hint]- Hint 2
> To go from many final states to one final state, we would *normally*:
> - introduce a new final state $q_f$,
> - have the old final states become regular states,
> - add $\varepsilon$-transitions from each old final state to $q_f$.
>
> This introduces $\varepsilon$-transitions, which we aren't allowed. Is there a way to add appropriate transitions (ones that read a real symbol of $\Sigma$) into $q_f$ instead?

>[!check]- Solution
> **True.**
>
> Consider a DFA that accepts the regular language. By part (c), there is an equivalent NFA $(Q, \Sigma, \delta, q_0, F)$ without $\varepsilon$-transitions, but it may have many final accept states.
>
> If there are many final accepting states ($|F| > 1$), then we:
> 1. Introduce a fresh accept state $q_f$ which becomes the *only* accept state.
> 2. All the old final accept states become regular (non-accepting) states.
> 3. For every transition that goes from some state $q$ to an old final state, create another transition from $q$ to $q_f$ on the same symbol.
>
> As a visual aid, here is a small NFA (left) with three final states $q_a$, $q_b$, $q_c$, where $q_c$ self-loops on $a$. The transformed NFA (right) keeps every original transition, makes $q_a$/$q_b$/$q_c$ regular, and adds the orange-equivalent edges into a fresh $q_f$ wherever an original transition landed in $F$:
>
> ```tikz
> \begin{tikzpicture}
> \node[state, initial] (q0) {$q_0$};
> \node[state, accepting, above right of=q0] (qa) {$q_a$};
> \node[state, accepting, below right of=q0] (qb) {$q_b$};
> \node[state, accepting, right of=qa] (qc) {$q_c$};
> \draw (q0) edge node {\sym{a}} (qa);
> \draw (q0) edge node {\sym{b}} (qb);
> \draw (qa) edge node {\sym{a}} (qc);
> \draw (qc) edge[loop above] node {\sym{a}} (qc);
> \end{tikzpicture}
> ```
>
> ```tikz
> \begin{tikzpicture}
> \node[state, initial] (q0) {$q_0$};
> \node[state, above right of=q0] (qa) {$q_a$};
> \node[state, below right of=q0] (qb) {$q_b$};
> \node[state, right of=qa] (qc) {$q_c$};
> \node[state, accepting, right of=qb] (qf) {$q_f$};
> \draw (q0) edge node {\sym{a}} (qa);
> \draw (q0) edge node {\sym{b}} (qb);
> \draw (qa) edge node {\sym{a}} (qc);
> \draw (qc) edge[loop above] node {\sym{a}} (qc);
> \draw (q0) edge[bend left=55] node {\sym{a}, \sym{b}} (qf);
> \draw (qa) edge node {\sym{a}} (qf);
> \draw (qc) edge node {\sym{a}} (qf);
> \end{tikzpicture}
> ```
>
> Note in particular the self-loop on $q_c$: its existence is what creates the new edge $q_c \to q_f$ on $a$ in the transformed NFA. Non-determinism then lets a run that previously cycled at $q_c$ "leave" to $q_f$ on its final symbol.
>
> Formally, we specify the new NFA $(Q \cup \{q_f\}, \Sigma, \delta', q_0, \{q_f\})$ where:
>
> $$\delta'(q, a) = \delta(q, a) \;\cup\; \begin{cases} \{q_f\} & \text{if } (\delta(q, a) \cap F) \neq \emptyset \\ \emptyset & \text{otherwise} \end{cases}$$
>
> **Common concerns:**
>
> >[!note] What about self-loops on accepting states?
> > Self-loops aren't a problem. Consider an accepting state $q_a$ with a self-loop on some symbol $a$. There is a transition created from $q_a$ to $q_f$ on $a$ (because there is a transition from $q_a$ to $q_a$, which is in the old $F$), so any accepted string that loops on $q_a$ can still do this - it can take the self-loop as many times as it wants, then on its final step take the new transition to $q_f$ instead.
>
> >[!note] Why specify $L \subseteq \Sigma^* \setminus \{\varepsilon\}$?
> > The construction needs at least one real symbol of input to reach $q_f$ and $q_f$ is only reached via the new transitions, which all consume a symbol. If $\varepsilon \in L$, the original NFA accepts the empty string by having $q_0 \in F$, but our new NFA would not (since $q_0 \notin \{q_f\}$ and there is no $\varepsilon$-transition into $q_f$). So the construction works for any regular language that doesn't contain $\varepsilon$.


**(e)** For every $i \in \mathbb{N}$ and language $L \subseteq \Sigma^*$, we create a new language $\text{chop}_i(L)$ by taking strings in $L$ of length at least $i$ and then removing the $i$ leftmost symbols. Formally,
$$\text{chop}_i(L) = \{w \mid vw \in L, \text{ with } |v| = i\}.$$
Show that if $L$ is regular then so is $\text{chop}_1(L)$.

>[!hint]- Hint 1
> Is there a way we can "skip" the first input read?

>[!hint]- Hint 2
> We could introduce a new initial state which has transitions to the states which are "one input in" (i.e. the states the old NFA could be in after consuming exactly one symbol). What exactly are these states, and what kind of transition should be from the new initial state to these states?

>[!check]- Solution
> Since $L$ is regular, there exists an NFA $(Q, \Sigma, \delta, q_0, F)$ that accepts $L$.
>
> To get an NFA for $\text{chop}_1(L)$, we want to start *one character in*: a string $w$ is in $\text{chop}_1(L)$ iff there is some symbol $a \in \Sigma$ such that $aw$ would be accepted by the old NFA. So we let the new NFA "fast-forward" past the first character before it reads any input.
>
> Let $\text{E-CLOSE}(S)$ denote the $\varepsilon$-closure of a set of states $S$: every state reachable from $S$ by following only $\varepsilon$-transitions (including the states in $S$ themselves). Define the **next-step set**:
> $$\text{NS} \;=\; \bigcup_{a \in \Sigma} \;\text{E-CLOSE}\!\Bigl(\,\bigcup_{p \,\in\, \text{E-CLOSE}(\{q_0\})} \delta(p, a)\Bigr).$$
> This is exactly the set of states the old NFA could be in after consuming exactly one symbol of input (any $\varepsilon$-moves before the symbol, the symbol itself, any $\varepsilon$-moves afterwards).
>
> Now introduce a fresh start state $q_s$ that $\varepsilon$-transitions to every state in $\text{NS}$. The new NFA is
> $$(Q \cup \{q_s\},\; \Sigma,\; \delta',\; q_s,\; F)$$
> with $\delta'$ extending $\delta$ by $\delta'(q_s, \varepsilon) = \text{NS}$ and $\delta'(q_s, a) = \emptyset$ for every $a \in \Sigma$. Every other transition is unchanged.
>
> **Running the proposed NFA:** The new NFA, starting at $q_s$, takes one $\varepsilon$-jump into some $q \in \text{NS}$ and then runs the original NFA on whatever input remains. A string $w$ is accepted iff there is some $q \in \text{NS}$ such that the old NFA accepts $w$ when started from $q$, iff there is some symbol $a$ such that the old NFA accepts $aw$ when started from $q_0$, iff $w \in \text{chop}_1(L)$.
>
> **Common concerns:**
>
> >[!note] What about self-loops on the old initial state?
> > If $q_0$ has a self-loop on some symbol $a$ (so $q_0 \in \delta(q_0, a)$), then $q_0 \in \text{NS}$, so $q_s$ has an $\varepsilon$-transition to $q_0$. Any string that uses the self-loop *after* the first character to do work is still accepted: the new NFA jumps to $q_0$ via $\varepsilon$, then loops on $q_0$ as the old NFA would have done after consuming the first character.


**(f)** For each $L \subseteq \Sigma^*$, define:
$$\text{insert}(L) = \{w \mid w = uav,\; a \in \Sigma,\; uv \in L\}.$$
Given an NFA $M = (Q, \Sigma, q_0, F, \delta)$ for $L$, describe an NFA $M' = (Q', \Sigma, q_0', F', \delta')$ for $\text{insert}(L)$. Formally prove that $M'$ indeed accepts $\text{insert}(L)$.

*Hint: use non-determinism to simulate "guessing" the symbol $a$ and the position at which it occurs in $w$.*

>[!hint]- Hint 1
> Adding transitions from each node to itself won't work, since we need a way to *track* whether we have inserted a symbol or not (the position of the insertion can be anywhere, but it has to happen exactly once). How should we track whether we have inserted a symbol or not?

>[!hint]- Hint 2
> We could *clone* the entire automaton so we have two copies of $M$: one where "being in it" means the symbol $a$ hasn't been inserted yet, and one where "being in it" means it has been inserted. How would you transition between these two automata?

>[!check]- Solution
> We construct $M'$ by taking the original NFA $M$ and a "clone" of $M$. We have '$a$' transitions from each state in the original $M$ to the corresponding state in the clone of $M$. Only the clone of $M$ will have accepting states.
>
> Visually, the cloning pattern looks like this (the original $M$ on top, its clone below; each state has a "switch" edge to its clone on any symbol $a \in \Sigma$, and only the cloned final state is accepting):
>
> ```tikz
> \begin{tikzpicture}
> \node[state, initial] (q0) {$q_0$};
> \node[state, right of=q0] (q1) {$q_1$};
> \node[state, below of=q0] (q0t) {$\tilde q_0$};
> \node[state, accepting, below of=q1] (q1t) {$\tilde q_1$};
> \draw (q0) edge node {\sym{a}} (q1);
> \draw (q0t) edge node {\sym{a}} (q1t);
> \draw (q0) edge node {$a \in \Sigma$} (q0t);
> \draw (q1) edge node {$a \in \Sigma$} (q1t);
> \end{tikzpicture}
> ```
>
> So at every state $s$ in original M, we have a choice: either continue as $M$ would, or treat the symbol as the inserted '$a$' and "switch" to the clone state corresponding to $s$. Since only states on the clone side are accepting, any accepting run must switch exactly once i.e. must insert once. 
>
> Formally: let $\widetilde{Q} = \{\tilde{q} \mid q \in Q\}$ be a fresh set of states, one clone per original state. Define
> $$M' = \bigl(\, Q \cup \widetilde{Q},\; \Sigma,\; q_0,\; \widetilde{F},\; \delta'\,\bigr)$$
> where $\widetilde{F} = \{\tilde{q} \mid q \in F\}$ and $\delta'$ is, for every $a \in \Sigma$:
> - **Original side**: $\delta'(q, a) = \delta(q, a) \cup \{\tilde{q}\}$ for $q \in Q$. So from $q$ on $a$ we either continue along the original $\delta$-edge, or consume $a$ as the inserted symbol and switch to the clone of $q$.
> - **Clone side**: $\delta'(\tilde{q}, a) = \{\tilde{p} \mid p \in \delta(q, a)\}$ for $\tilde{q} \in \widetilde{Q}$. Clone transitions mirror $M$ exactly.
>
> If $M$ has $\varepsilon$-transitions, extend by $\delta'(q, \varepsilon) = \delta(q, \varepsilon)$ on the original side and $\delta'(\tilde{q}, \varepsilon) = \{\tilde{p} \mid p \in \delta(q, \varepsilon)\}$ on the clone side. The switch never happens on $\varepsilon$: the inserted symbol must be a real symbol of $\Sigma$.
