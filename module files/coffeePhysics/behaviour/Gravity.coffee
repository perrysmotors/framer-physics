### Imports ###
{ConstantForce} = require 'coffeePhysics/behaviour/ConstantForce'

### Gravity Behaviour ###

class exports.Gravity extends ConstantForce

	constructor: (@scale = 1000) ->

		super()

		force = @force
		scale = @scale

		window.addEventListener "devicemotion", ->
			accX = event.accelerationIncludingGravity.x
			accY = event.accelerationIncludingGravity.y * -1

			force.x = accX * scale / 10
			force.y = accY * scale / 10
