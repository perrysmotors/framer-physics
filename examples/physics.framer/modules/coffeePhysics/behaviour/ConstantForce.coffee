### Import Behaviour ###
{Behaviour} = require 'coffeePhysics/behaviour/Behaviour'
{Vector} = require 'coffeePhysics/math/Vector'

### Constant Force Behaviour ###

class exports.ConstantForce extends Behaviour

	constructor: (@force = new Vector()) ->

		super

	apply: (p, dt,index) ->

		#super p, dt, index

		p.acc.add @force
