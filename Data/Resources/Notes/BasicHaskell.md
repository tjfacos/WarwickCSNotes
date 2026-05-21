# Basics of Haskell

> This note covers lectures 2 - 6 (2026).

## Anatomy of a Haskell file

A `.hs` file is called a module, and starts with...

```haskell
module MySuperCoolProgram where
...
```

Each module's name must be capitalised, and the name in the file must match the file name (so the above sample must be stored in `MySuperCoolProgram.hs`).

Modules can imported by other modules, to make the definitions available in a different file.

```haskell
module MySuperCoolProgram where

import MySuperCoolHelperModule

...
```

Underneath the import statements, we'll be writing our functions. **The order of expressions in Haskell programs has no affect on the functioning of the program.**

## Anatomy of a Function

Unlike C-like languages, Haskell functions are invoked without parenthesise.

```haskell
-- Returns "Yes :)" if the given number is even, and "No :(" otherwise

isItEven x = if even x then "Yes :)" else "No :("
```

> ### Lambda Functions
> 