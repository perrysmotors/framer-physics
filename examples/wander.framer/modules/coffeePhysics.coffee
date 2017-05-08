# Add the following line to your project in Framer Studio.
# myModule = require "myModule"
# Reference the contents by name, like myModule.myFunction() or myModule.myVar


# Import integrator framework
{Integrator} = require 'coffeePhysics/engine/integrator/Integrator'
{Euler} = require 'coffeePhysics/engine/integrator/Euler'
{ImprovedEuler} = require 'coffeePhysics/engine/integrator/ImprovedEuler'
{Verlet} = require 'coffeePhysics/engine/integrator/Verlet'

exports.Integrator = Integrator
exports.Euler = Euler
exports.ImprovedEuler = ImprovedEuler
exports.Verlet = Verlet

# Import physics framework
{Particle} = require 'coffeePhysics/engine/Particle'
{Physics} = require 'coffeePhysics/engine/Physics'
{Spring} = require 'coffeePhysics/engine/Spring'

exports.Particle = Particle
exports.Physics = Physics
exports.Spring = Spring

# Import math framework
# {Random} = require 'coffeePhysics/math/Random'
{Vector} = require 'coffeePhysics/math/Vector'

# exports.Random = Random
exports.Vector = Vector

# Import behaviour framework
{Behaviour} = require 'coffeePhysics/behaviour/Behaviour'
{Attraction} = require 'coffeePhysics/behaviour/Attraction'
{Collision} = require 'coffeePhysics/behaviour/Collision'
{ConstantForce} = require 'coffeePhysics/behaviour/ConstantForce'
{EdgeBounce} = require 'coffeePhysics/behaviour/EdgeBounce'
{EdgeWrap} = require 'coffeePhysics/behaviour/EdgeWrap'
{Wander} = require 'coffeePhysics/behaviour/Wander'
{Gravity} = require 'coffeePhysics/behaviour/Gravity'

exports.Behaviour = Behaviour
exports.Attraction = Attraction
exports.Collision = Collision
exports.ConstantForce = ConstantForce
exports.EdgeBounce = EdgeBounce
exports.EdgeWrap = EdgeWrap
exports.Wander = Wander
exports.Gravity = Gravity
