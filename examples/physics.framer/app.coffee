# Project setup
################################################################################
{Integrator, Euler, ImprovedEuler, Verlet, Particle, Physics, Vector, Spring, Behaviour, Attraction, Collision, ConstantForce, EdgeBounce, EdgeWrap, Wander, Gravity} = require 'coffeePhysics'

# Colours
################################################################################

red = new Color("rgba(224,32,36,1)")
orange = new Color("rgba(255,128,21,1)")
yellow = new Color("rgba(255,224,0,1)")
green = new Color("rgba(55,191,0,1)")
blue = new Color("rgba(0,150,212,1)")
pink = new Color("rgba(213,45,177,1)")
lightGrey = new Color("rgba(239,239,239,1)")

colours = [red, orange, yellow, green, blue, pink]
colourCycler = Utils.cycle(colours)

background = new BackgroundLayer
	backgroundColor: lightGrey

################################################################################

# Create a physics instance which uses the Verlet integration method
physics = new Physics()
physics.integrator = new Verlet()

# Allow particle collisions to make things interesting
collision = new Collision()

# Design some behaviours for particles
avoid = new Attraction()
pullToCenter = new Attraction()

pullToCenter.target.x = Screen.width / 2
pullToCenter.target.y = Screen.height / 2
pullToCenter.strength = 120

avoid.setRadius( 100 )
avoid.strength = -1000

################################################################################

avoidLayer = new Layer
	borderRadius: 100
	size: 100
	opacity: 0.30

avoidLayer.center()
avoidLayer.draggable.enabled = true
avoidLayer.draggable.constraints =
	x: 0
	y: 0
	width: Screen.width
	height: Screen.height

################################################################################

balls = []

# Render the particles
for i in [0..200]

	# Create a particle
	particle = new Particle( Utils.randomNumber(.1,1) )
	position = new Vector( Utils.randomNumber( 0, Screen.width ), Utils.randomNumber( 0, Screen.height ) )
	particle.setRadius( particle.mass * 10 )
	particle.moveTo( position )

	# Apply behaviours to the particle
	particle.behaviours.push( avoid, pullToCenter, collision )
	
	# Make it collidable
	collision.pool.push( particle )

	# Add to the simulation
	physics.particles.push( particle )
	
	# Create a layer to show the particle on the screen
	ball = new Layer
		x: particle.pos.x - particle.radius
		y: particle.pos.y - particle.radius
		size: particle.radius * 2
		borderRadius: particle.radius
		backgroundColor: colourCycler()
	
	# Add the particle instance to the layer
	ball.particle = particle
	
	balls.push(ball)

# Set everything in motion
################################################################################

frameRate = 1 / 60

Utils.interval frameRate, ->
	# Update the position of the avoid target
	avoid.target.x = avoidLayer.x + 50
	avoid.target.y = avoidLayer.y + 50
	
	# Step the simulation
	physics.step()
	
	# Update the position of the balls
	for ball, i in balls
		ball.x = ball.particle.pos.x - ball.particle.radius
		ball.y = ball.particle.pos.y - ball.particle.radius
