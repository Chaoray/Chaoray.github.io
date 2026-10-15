---
title: CompTheoryFall2026 - CH1
description: ""
summary: ""
date: 2026-10-06
isCJKLanguage: true
categories: []
tags: []
draft: true
---

## DFA

### Definition
A DFA $M$ is formally defined as:
$$M = (Q, \Sigma, \delta, q_0. F)$$
- $Q$: a **finite** set of states
- $\Sigma$: a **finite** set of alphabets
- $\delta$: $Q \times \Sigma \to Q$: transition function
- $q_0 \in Q$: start state
- $F \subset Q$: set of accept states

- Language of $M$: all strings accepted by M.
  Denoted as $$A=L(M)$$
### Formal Definition of Computation
- Language: a set of strings
- $M$ accepts string $w=w_1 \cdots w_n$ if $\exists r_0 \cdots r_n$  s.t.
	- $r_0=q_0$
	- $\delta(r_i, w_{i+1})=r_{i+1}, \forall i \in [0,n-1]$
	- $r_n \in F$
- A language is regular if it is recognized by some automata.
### Regular Operations
Given two languages $A, B$
- union: $A \cup B = \{x | x \in A \ or \ x \in B\}$
- concatenation: $A \circ B = \{xy | x \in A, y \in B\}$
- star: $A^* = \{x_1 \cdots x_k | k \geq 0, x_i \in A\}$

For star operation, if k = 0, then the result string is an empty string, noted as $\epsilon$ and $\epsilon \in A$.

We can prove that $A \cup B$ is still regular, given two automata that recognize $A$ and $B$:
$$M_1 = (Q_1, \Sigma, \delta_1, q_1 F_1) \\ M_2 = (Q_2, \Sigma, \delta_2, q_2 F_2)$$
The new automata that recognizes $A\cup B$ is :
$$
M = (Q, \Sigma, \delta, q_0, F) \\
Q = \{(r_1, r_2) | r_1 \in Q_1, r_2 \in Q_2\} \\
\delta((r_1, r_2), a) = (\delta_1(q_1, a), \delta_2(q_2, a)) \\
q_0 = (q_1, q_2) \\
F = \{(r_1, r_2) | r_1 \in F_1 \ or \ r_2 \in F_2\}
$$
Proofs of star and concatenation are not easy, so we introduce NFA.
## NFA

NFA is similar to DFA but one state can lead to many other states. The way NFA accepts a string is like running down through branches.

![](Pasted%20image%2020261008194742.png)

Notice that we have to handle $\epsilon$ edge immediately. So, each layer is the collection of states that ca be reached up to the current input. After processing the string, if one path reaches an accept state, then the string is accepted.

If at some states, there's no out edge for current input, then the branch dies immediately. Note that the "roots" of all the branches are the possible states reachable from $q_0$.

### Definition

A NFA is formally defined as:
$$M = (Q, \Sigma, \delta, q_0. F)$$
- $Q$: a **finite** set of states
- $\Sigma$: a **finite** set of alphabets
- $\delta$: $Q \times \Sigma_\epsilon \to P(Q)$, $P(Q)$ is all possible subsets of Q, $\Sigma_\epsilon = \Sigma \cup \{\epsilon\}$
- $q_0 \in Q$: start state
- $F \subset Q$: set of accept states

Noted that $\emptyset \in P(Q)$ . If there's no output edge for current input, then the transition function outputs $\emptyset$.

### Definition of NFA Computation

A NFA $M$ accepts $w=w_1\cdots w_n$ is defined as:
- First $w$ can be written as $w=y_1\cdots y_m, m \geq n$, and $y_i$ maybe $\epsilon$.
- A sequnce of states $r_0 \cdots r_m$ s.t.
	- $r_0 = q_0$
	- $r_{i+1} \in \delta(r_i, y_{i+1})$
	- $r_m \in F$
### DFA $\to$ NFA

This is easy because we can modify the transition function:
$$
\delta'(\{ q \}, a) = \{\delta(q, a)\} \\
\delta'(\{q\}, \epsilon) = \emptyset
$$
Also, the new alphabet set is $\Sigma_\epsilon = \Sigma \cup {\epsilon}$.
### NFA $\to$ DFA

Given NFA $(Q, \Sigma, \delta, q_0. F)$, define the equivalent DFA to be $(Q', \Sigma, \delta', q_0', F')$
- Each new state in $Q'$ is a possible subset of $Q$; that is, $Q' = P(Q)$
- $q_0' \in P(Q)$, $q_0'$ includes any states reachable by $\epsilon$ from $q_0$.
  Let $E(\{q_0\})$ be the state set that is reachable by $\epsilon$ from $\{q_0\}$
- $F' = \{R | R \in Q'. R \cap F \neq \emptyset\}$
- $\delta'(R, a) = \text{unions of all} \ E(\delta(r, a)), r \in R$; that is, all the next possible states reachable by current input or $\epsilon$ from all possible current states.

![](Pasted%20image%2020261008200634.png)

### Proof of Concatenation

Given two NFAs $N_1$ and $N_2$ that recognize language $A$ and $B$.
The idea: from any accept state of $N_1$, add an $\epsilon$ link to $q_2$ (start state of $N_2$).
The main difficulty in DFA is that we don't know where to cut the string to two parts.
![](Pasted%20image%2020261008202249.png)

New machine $N$ that recognizes $A \circ B$:
- $Q = Q_1 \cup Q_2$
- $q_0 = q_1$
- $F = F_2$
$$\delta(q, a) = \begin{cases}
\delta_1(q,a), \forall q \in Q_1 \backslash F_1 \\ 
\delta_2(q, a), \forall q \in Q_2 \\
\delta_1(q, \epsilon) \cup {q_2}, q \in F_1, a=\epsilon \\
\delta_1(q, a), q \in F_1, a \neq \epsilon
\end{cases} $$

The third condition is to connect the accept states of $N_1$ to the start state of $N_2$. The fourth condition is to allow the other connections from the accept states of $N_1$ to be kept in new machine.

#### Proof of Star



## Regular Expression

### Regular Expression $\to$ NFA

### GNFA: NFA $\to$ Regular Expression

