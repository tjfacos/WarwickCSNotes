# Data Structures in Haskell

> This note covers content from lectures 9, 12, 13, 14, and 15 (2026)

## Making your own data types

We can use the `data` keyword to define a type. This definition has a name, followed by a series of _constructors_.

```hs
-- An example without arguments
data Bool = False | True

-- An example with arguments
data Shape 
    = Circle Float Float Float 
    | Rectangle Float Float Float Float

-- Let's define a function that uses our Shape type
-- We can use constructors for pattern matching
area :: Shape -> Float
area (Circle _ _ r     ) = 3.14 * r * r
area (Rectangle _ _ w h) = w * h

-- Let's define an instance of show for type Shape
instance Show Shape where
    show (Circle x y r) = "A circle, centred at (" 
        ++ show x ++ ", " ++ show y 
        ++ "), radius " ++ show r
    show (Rectangle x y w h) = "A rectangle, located at (" 
        ++ show x ++ ", " ++ show y 
        ++ "), dimensions " ++ show w ++ " x " ++ show h
```

Our definition of `Shape` above brings two new functions into scope: 

```hs
Circle      :: Float -> Float -> Float -> Shape
Rectangle   :: Float -> Float -> Float -> Float -> Shape
```

## Polymorphic Data Types

Polymorphic data types allow us to parameterise our constructors with any data type we like. An example from Prelude is `Maybe`

```hs
data Maybe a = Nothing | Just a

-- Brings into scope...
Nothing :: Maybe a
Just :: a -> Maybe a
```

> ### Maybe
> Maybe is an important type in Haskell. It means either we have a value of type `a`, or we don't - representing the absence of a value.
> As an example of how we can use this, suppose we wanted to create **complete** versions of the functions `head` and `tail` (so if the list is empty, we receive `Nothing` rather than an error).
> ```hs
> safeHead :: [a] -> Maybe a
> safeHead [] = Nothing
> safeHead (x:xs) = Just x
> 
> safeTail :: [a] -> Maybe a
> safeTail [] = Nothing
> safeTail (x:xs) = Just xs
> ```
> In Prelude, the function I've called `safeHead` is called `listToMaybe`. The whole point of this is that we can use `Maybe` to **wrap possibly unsafe functions** - writing code that's much less likely to suddenly fail.
> 
> Another useful function is `readMaybe` (from `Text.Read` in `base`). This is a version of `read` which attempts to parse the input to a value, returning `Nothing` if it fails
> ```hs
> readMaybe :: Read a => String -> Maybe a
> 
> >>> readMaybe "NaN" :: Maybe Int
> >>> Nothing
> 
> >>> readMaybe "6" :: Maybe Int
> >>> Just 6
> ```

> ### Derived Instances
> In the interest of preventing bloated, formulaic instantiations for type classes like `Show`, `Read`, `Eq` etc, Haskell includes the `deriving` keyword, providing us with a simple stock implementation of these type classes
> ```hs
> data Shape 
>         = Circle Float Float Float 
>         | Rectangle Float Float Float Float 
>     deriving (Show, Read, Eq)
> ```