# framer-physics
A module for adding 2D physics simulations to your Framer prototypes.

Based on [Coffee-Physics](https://github.com/soulwire/Coffee-Physics/) by Justin Windle (a.k.a. soulwire) ‘A simple, lightweight physics engine written in CoffeeScript’

[Read the article on Medium](https://blog.framer.com/its-particle-time-how-to-use-a-physics-engine-with-framer-e66af34ec859)

![physics-gif](https://cdn-images-1.medium.com/max/800/1*mg76rbpBwpGpxZHdes70eQ.gif)

## Examples

[Attraction](https://framer.cloud/KXQHl/)

[Gravity](https://framer.cloud/VOHjW/)

## Installation

Drag the contents of the `module files` folder to the `modules` folder of your Framer project.

## Syntax

Import module:

```
{Integrator, Euler, ImprovedEuler, Verlet, Particle, Physics, Vector, Spring, Behaviour, Attraction, Collision, ConstantForce, EdgeBounce, EdgeWrap, Wander, Gravity} = require 'coffeePhysics'
```

