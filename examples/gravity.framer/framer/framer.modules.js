require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"coffeePhysics/base":[function(require,module,exports){

/* Allows safe, dyamic creation of namespaces. */
var namespace;

namespace = function(id) {
  var i, len, path, ref, results, root;
  root = self;
  ref = id.split('.');
  results = [];
  for (i = 0, len = ref.length; i < len; i++) {
    path = ref[i];
    results.push(root = root[path] != null ? root[path] : root[path] = {});
  }
  return results;
};


/* RequestAnimationFrame shim. */

(function() {
  var i, len, time, vendor, vendors;
  time = 0;
  vendors = ['ms', 'moz', 'webkit', 'o'];
  for (i = 0, len = vendors.length; i < len; i++) {
    vendor = vendors[i];
    if (!(!window.requestAnimationFrame)) {
      continue;
    }
    window.requestAnimationFrame = window[vendor + 'RequestAnimationFrame'];
    window.cancelAnimationFrame = window[vendor + 'CancelAnimationFrame'];
  }
  if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = function(callback, element) {
      var delta, now, old;
      now = new Date().getTime();
      delta = Math.max(0, 16 - (now - old));
      setTimeout((function() {
        return callback(time + delta);
      }), delta);
      return old = now + delta;
    };
  }
  if (!window.cancelAnimationFrame) {
    return window.cancelAnimationFrame = function(id) {
      return clearTimeout(id);
    };
  }
})();


},{}],"coffeePhysics/behaviour/Attraction":[function(require,module,exports){

/* Imports */
var Behaviour, Vector,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Behaviour = require('coffeePhysics/behaviour/Behaviour').Behaviour;

Vector = require('coffeePhysics/math/Vector').Vector;


/* Attraction Behaviour */

exports.Attraction = (function(superClass) {
  extend(Attraction, superClass);

  function Attraction(target, radius1, strength) {
    this.target = target != null ? target : new Vector();
    this.radius = radius1 != null ? radius1 : 1000;
    this.strength = strength != null ? strength : 100.0;
    this._delta = new Vector();
    this.setRadius(this.radius);
    Attraction.__super__.constructor.apply(this, arguments);
  }


  /* Sets the effective radius of the bahavious. */

  Attraction.prototype.setRadius = function(radius) {
    this.radius = radius;
    return this.radiusSq = radius * radius;
  };

  Attraction.prototype.apply = function(p, dt, index) {
    var distSq;
    (this._delta.copy(this.target)).sub(p.pos);
    distSq = this._delta.magSq();
    if (distSq < this.radiusSq && distSq > 0.000001) {
      this._delta.norm().scale(1.0 - distSq / this.radiusSq);
      return p.acc.add(this._delta.scale(this.strength));
    }
  };

  return Attraction;

})(Behaviour);


},{"coffeePhysics/behaviour/Behaviour":"coffeePhysics/behaviour/Behaviour","coffeePhysics/math/Vector":"coffeePhysics/math/Vector"}],"coffeePhysics/behaviour/Behaviour":[function(require,module,exports){

/* Behaviour */
exports.Behaviour = (function() {
  Behaviour.GUID = 0;

  function Behaviour() {
    this.GUID = Behaviour.GUID++;
    this.interval = 1;
  }

  Behaviour.prototype.apply = function(p, dt, index) {
    var name;
    return (p[name = '__behaviour' + this.GUID] != null ? p[name] : p[name] = {
      counter: 0
    }).counter++;
  };

  return Behaviour;

})();


},{}],"coffeePhysics/behaviour/Collision":[function(require,module,exports){

/* Import Behaviour */
var Behaviour, Vector,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Behaviour = require('coffeePhysics/behaviour/Behaviour').Behaviour;

Vector = require('coffeePhysics/math/Vector').Vector;


/* Collision Behaviour */

exports.Collision = (function(superClass) {
  extend(Collision, superClass);

  function Collision(useMass, callback) {
    this.useMass = useMass != null ? useMass : true;
    this.callback = callback != null ? callback : null;
    this.pool = [];
    this._delta = new Vector();
    Collision.__super__.constructor.apply(this, arguments);
  }

  Collision.prototype.apply = function(p, dt, index) {
    var dist, distSq, i, len, mt, o, overlap, r1, r2, radii, ref, results;
    ref = this.pool.slice(index);
    results = [];
    for (i = 0, len = ref.length; i < len; i++) {
      o = ref[i];
      if (!(o !== p)) {
        continue;
      }
      (this._delta.copy(o.pos)).sub(p.pos);
      distSq = this._delta.magSq();
      radii = p.radius + o.radius;
      if (distSq <= radii * radii) {
        dist = Math.sqrt(distSq);
        overlap = radii - dist;
        overlap += 0.5;
        mt = p.mass + o.mass;
        r1 = this.useMass ? o.mass / mt : 0.5;
        r2 = this.useMass ? p.mass / mt : 0.5;
        p.pos.add(this._delta.clone().norm().scale(overlap * -r1));
        o.pos.add(this._delta.norm().scale(overlap * r2));
        results.push(typeof this.callback === "function" ? this.callback(p, o, overlap) : void 0);
      } else {
        results.push(void 0);
      }
    }
    return results;
  };

  return Collision;

})(Behaviour);


},{"coffeePhysics/behaviour/Behaviour":"coffeePhysics/behaviour/Behaviour","coffeePhysics/math/Vector":"coffeePhysics/math/Vector"}],"coffeePhysics/behaviour/ConstantForce":[function(require,module,exports){

/* Import Behaviour */
var Behaviour, Vector,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Behaviour = require('coffeePhysics/behaviour/Behaviour').Behaviour;

Vector = require('coffeePhysics/math/Vector').Vector;


/* Constant Force Behaviour */

exports.ConstantForce = (function(superClass) {
  extend(ConstantForce, superClass);

  function ConstantForce(force) {
    this.force = force != null ? force : new Vector();
    ConstantForce.__super__.constructor.apply(this, arguments);
  }

  ConstantForce.prototype.apply = function(p, dt, index) {
    return p.acc.add(this.force);
  };

  return ConstantForce;

})(Behaviour);


},{"coffeePhysics/behaviour/Behaviour":"coffeePhysics/behaviour/Behaviour","coffeePhysics/math/Vector":"coffeePhysics/math/Vector"}],"coffeePhysics/behaviour/EdgeBounce":[function(require,module,exports){

/* Imports */
var Behaviour, Vector,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Behaviour = require('coffeePhysics/behaviour/Behaviour').Behaviour;

Vector = require('coffeePhysics/math/Vector').Vector;


/* Edge Bounce Behaviour */

exports.EdgeBounce = (function(superClass) {
  extend(EdgeBounce, superClass);

  function EdgeBounce(min, max) {
    this.min = min != null ? min : new Vector();
    this.max = max != null ? max : new Vector();
    EdgeBounce.__super__.constructor.apply(this, arguments);
  }

  EdgeBounce.prototype.apply = function(p, dt, index) {
    if (p.pos.x - p.radius < this.min.x) {
      p.pos.x = this.min.x + p.radius;
    } else if (p.pos.x + p.radius > this.max.x) {
      p.pos.x = this.max.x - p.radius;
    }
    if (p.pos.y - p.radius < this.min.y) {
      return p.pos.y = this.min.y + p.radius;
    } else if (p.pos.y + p.radius > this.max.y) {
      return p.pos.y = this.max.y - p.radius;
    }
  };

  return EdgeBounce;

})(Behaviour);


},{"coffeePhysics/behaviour/Behaviour":"coffeePhysics/behaviour/Behaviour","coffeePhysics/math/Vector":"coffeePhysics/math/Vector"}],"coffeePhysics/behaviour/EdgeWrap":[function(require,module,exports){

/* Imports */
var Behaviour, Vector,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Behaviour = require('coffeePhysics/behaviour/Behaviour').Behaviour;

Vector = require('coffeePhysics/math/Vector').Vector;


/* Edge Wrap Behaviour */

exports.EdgeWrap = (function(superClass) {
  extend(EdgeWrap, superClass);

  function EdgeWrap(min, max) {
    this.min = min != null ? min : new Vector();
    this.max = max != null ? max : new Vector();
    EdgeWrap.__super__.constructor.apply(this, arguments);
  }

  EdgeWrap.prototype.apply = function(p, dt, index) {
    if (p.pos.x + p.radius < this.min.x) {
      p.pos.x = this.max.x + p.radius;
      p.old.pos.x = p.pos.x;
    } else if (p.pos.x - p.radius > this.max.x) {
      p.pos.x = this.min.x - p.radius;
      p.old.pos.x = p.pos.x;
    }
    if (p.pos.y + p.radius < this.min.y) {
      p.pos.y = this.max.y + p.radius;
      return p.old.pos.y = p.pos.y;
    } else if (p.pos.y - p.radius > this.max.y) {
      p.pos.y = this.min.y - p.radius;
      return p.old.pos.y = p.pos.y;
    }
  };

  return EdgeWrap;

})(Behaviour);


},{"coffeePhysics/behaviour/Behaviour":"coffeePhysics/behaviour/Behaviour","coffeePhysics/math/Vector":"coffeePhysics/math/Vector"}],"coffeePhysics/behaviour/Gravity":[function(require,module,exports){

/* Imports */
var ConstantForce,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

ConstantForce = require('coffeePhysics/behaviour/ConstantForce').ConstantForce;


/* Gravity Behaviour */

exports.Gravity = (function(superClass) {
  extend(Gravity, superClass);

  function Gravity(scale1) {
    var force, scale;
    this.scale = scale1 != null ? scale1 : 1000;
    Gravity.__super__.constructor.call(this);
    force = this.force;
    scale = this.scale;
    window.addEventListener("devicemotion", function() {
      var accX, accY;
      accX = event.accelerationIncludingGravity.x;
      accY = event.accelerationIncludingGravity.y * -1;
      force.x = accX * scale / 10;
      return force.y = accY * scale / 10;
    });
  }

  return Gravity;

})(ConstantForce);


},{"coffeePhysics/behaviour/ConstantForce":"coffeePhysics/behaviour/ConstantForce"}],"coffeePhysics/behaviour/Wander":[function(require,module,exports){

/* Imports */
var Behaviour,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Behaviour = require('coffeePhysics/behaviour/Behaviour').Behaviour;


/* Wander Behaviour */

exports.Wander = (function(superClass) {
  extend(Wander, superClass);

  function Wander(jitter, radius, strength) {
    this.jitter = jitter != null ? jitter : 0.5;
    this.radius = radius != null ? radius : 100;
    this.strength = strength != null ? strength : 1.0;
    this.theta = Math.random() * Math.PI * 2;
    Wander.__super__.constructor.apply(this, arguments);
  }

  Wander.prototype.apply = function(p, dt, index) {
    this.theta += (Math.random() - 0.5) * this.jitter * Math.PI * 2;
    p.acc.x += Math.cos(this.theta) * this.radius * this.strength;
    return p.acc.y += Math.sin(this.theta) * this.radius * this.strength;
  };

  return Wander;

})(Behaviour);


},{"coffeePhysics/behaviour/Behaviour":"coffeePhysics/behaviour/Behaviour"}],"coffeePhysics/demos/AttractionDemo":[function(require,module,exports){
var AttractionDemo,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

AttractionDemo = (function(superClass) {
  extend(AttractionDemo, superClass);

  function AttractionDemo() {
    return AttractionDemo.__super__.constructor.apply(this, arguments);
  }

  AttractionDemo.prototype.setup = function(full) {
    var attraction, bounds, collide, i, j, max, min, p, ref, repulsion, results;
    if (full == null) {
      full = true;
    }
    AttractionDemo.__super__.setup.call(this, full);
    min = new Vector(0.0, 0.0);
    max = new Vector(this.width, this.height);
    bounds = new EdgeBounce(min, max);
    this.physics.integrator = new Verlet();
    attraction = new Attraction(this.mouse.pos, 1200, 1200);
    repulsion = new Attraction(this.mouse.pos, 200, -2000);
    collide = new Collision();
    max = full ? 400 : 200;
    results = [];
    for (i = j = 0, ref = max; 0 <= ref ? j <= ref : j >= ref; i = 0 <= ref ? ++j : --j) {
      p = new Particle(Random(0.1, 3.0));
      p.setRadius(p.mass * 4);
      p.moveTo(new Vector(Random(this.width), Random(this.height)));
      p.behaviours.push(attraction);
      p.behaviours.push(repulsion);
      p.behaviours.push(bounds);
      p.behaviours.push(collide);
      collide.pool.push(p);
      results.push(this.physics.particles.push(p));
    }
    return results;
  };

  return AttractionDemo;

})(Demo);


},{}],"coffeePhysics/demos/BalloonDemo":[function(require,module,exports){

/* BalloonDemo */
var BalloonDemo,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

BalloonDemo = (function(superClass) {
  extend(BalloonDemo, superClass);

  function BalloonDemo() {
    return BalloonDemo.__super__.constructor.apply(this, arguments);
  }

  BalloonDemo.prototype.setup = function(full) {
    var attraction, i, j, max, p, ref, results, s;
    if (full == null) {
      full = true;
    }
    BalloonDemo.__super__.setup.apply(this, arguments);
    this.physics.integrator = new ImprovedEuler();
    attraction = new Attraction(this.mouse.pos);
    max = full ? 400 : 200;
    results = [];
    for (i = j = 0, ref = max; 0 <= ref ? j <= ref : j >= ref; i = 0 <= ref ? ++j : --j) {
      p = new Particle(Random(0.25, 4.0));
      p.setRadius(p.mass * 8);
      p.behaviours.push(new Wander(0.2));
      p.behaviours.push(attraction);
      p.moveTo(new Vector(Random(this.width), Random(this.height)));
      s = new Spring(this.mouse, p, Random(30, 300), 1.0);
      this.physics.particles.push(p);
      results.push(this.physics.springs.push(s));
    }
    return results;
  };

  return BalloonDemo;

})(Demo);


},{}],"coffeePhysics/demos/BoundsDemo":[function(require,module,exports){

/* BoundsDemo */
var BoundsDemo,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

BoundsDemo = (function(superClass) {
  extend(BoundsDemo, superClass);

  function BoundsDemo() {
    return BoundsDemo.__super__.constructor.apply(this, arguments);
  }

  BoundsDemo.prototype.setup = function() {
    var edge, i, j, max, min, p, results;
    BoundsDemo.__super__.setup.apply(this, arguments);
    min = new Vector(0.0, 0.0);
    max = new Vector(this.width, this.height);
    edge = new EdgeWrap(min, max);
    results = [];
    for (i = j = 0; j <= 200; i = ++j) {
      p = new Particle(Random(0.5, 4.0));
      p.setRadius(p.mass * 5);
      p.moveTo(new Vector(Random(this.width), Random(this.height)));
      p.behaviours.push(new Wander(0.2, 120, Random(1.0, 2.0)));
      p.behaviours.push(edge);
      results.push(this.physics.particles.push(p));
    }
    return results;
  };

  return BoundsDemo;

})(Demo);


},{}],"coffeePhysics/demos/ChainDemo":[function(require,module,exports){
var ChainDemo,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

ChainDemo = (function(superClass) {
  extend(ChainDemo, superClass);

  function ChainDemo() {
    return ChainDemo.__super__.constructor.apply(this, arguments);
  }

  ChainDemo.prototype.setup = function(full) {
    var center, edge, gap, i, j, max, min, op, p, ref, s, wander;
    if (full == null) {
      full = true;
    }
    ChainDemo.__super__.setup.apply(this, arguments);
    this.stiffness = 1.0;
    this.spacing = 2.0;
    this.physics.integrator = new Verlet();
    this.physics.viscosity = 0.0001;
    this.mouse.setMass(1000);
    gap = 50.0;
    min = new Vector(-gap, -gap);
    max = new Vector(this.width + gap, this.height + gap);
    edge = new EdgeBounce(min, max);
    center = new Vector(this.width * 0.5, this.height * 0.5);
    wander = new Wander(0.05, 100.0, 80.0);
    max = full ? 2000 : 600;
    for (i = j = 0, ref = max; 0 <= ref ? j <= ref : j >= ref; i = 0 <= ref ? ++j : --j) {
      p = new Particle(6.0);
      p.colour = '#FFFFFF';
      p.moveTo(center);
      p.setRadius(1.0);
      p.behaviours.push(wander);
      p.behaviours.push(edge);
      this.physics.particles.push(p);
      if (typeof op !== "undefined" && op !== null) {
        s = new Spring(op, p, this.spacing, this.stiffness);
      } else {
        s = new Spring(this.mouse, p, this.spacing, this.stiffness);
      }
      this.physics.springs.push(s);
      op = p;
    }
    return this.physics.springs.push(new Spring(this.mouse, p, this.spacing, this.stiffness));
  };

  return ChainDemo;

})(Demo);


},{}],"coffeePhysics/demos/ClothDemo":[function(require,module,exports){
var ClothDemo,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

ClothDemo = (function(superClass) {
  extend(ClothDemo, superClass);

  function ClothDemo() {
    return ClothDemo.__super__.constructor.apply(this, arguments);
  }

  ClothDemo.prototype.setup = function(full) {
    var cell, cols, i, j, p, ref, ref1, rows, s, size, stiffness, sx, sy, x, y;
    if (full == null) {
      full = true;
    }
    ClothDemo.__super__.setup.apply(this, arguments);
    this.renderer.renderParticles = false;
    this.physics.integrator = new Verlet();
    this.physics.timestep = 1.0 / 200;
    this.mouse.setMass(10);
    this.gravity = new ConstantForce(new Vector(0.0, 80.0));
    this.physics.behaviours.push(this.gravity);
    stiffness = 0.5;
    size = full ? 8 : 10;
    rows = full ? 30 : 25;
    cols = full ? 55 : 40;
    cell = [];
    sx = this.width * 0.5 - cols * size * 0.5;
    sy = this.height * 0.5 - rows * size * 0.5;
    for (x = i = 0, ref = cols; 0 <= ref ? i <= ref : i >= ref; x = 0 <= ref ? ++i : --i) {
      cell[x] = [];
      for (y = j = 0, ref1 = rows; 0 <= ref1 ? j <= ref1 : j >= ref1; y = 0 <= ref1 ? ++j : --j) {
        p = new Particle(0.1);
        p.fixed = y === 0;
        p.moveTo(new Vector(sx + x * size, sy + y * size));
        if (x > 0) {
          s = new Spring(p, cell[x - 1][y], size, stiffness);
          this.physics.springs.push(s);
        }
        if (y > 0) {
          s = new Spring(p, cell[x][y - 1], size, stiffness);
          this.physics.springs.push(s);
        }
        this.physics.particles.push(p);
        cell[x][y] = p;
      }
    }
    p = cell[Math.floor(cols / 2)][Math.floor(rows / 2)];
    s = new Spring(this.mouse, p, 10, 1.0);
    this.physics.springs.push(s);
    cell[0][0].fixed = true;
    return cell[cols - 1][0].fixed = true;
  };

  ClothDemo.prototype.step = function() {
    ClothDemo.__super__.step.apply(this, arguments);
    return this.gravity.force.x = 50 * Math.sin(new Date().getTime() * 0.0005);
  };

  return ClothDemo;

})(Demo);


},{}],"coffeePhysics/demos/CollisionDemo":[function(require,module,exports){

/* CollisionDemo */
var CollisionDemo,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

CollisionDemo = (function(superClass) {
  extend(CollisionDemo, superClass);

  function CollisionDemo() {
    this.onCollision = bind(this.onCollision, this);
    return CollisionDemo.__super__.constructor.apply(this, arguments);
  }

  CollisionDemo.prototype.setup = function(full) {
    var attraction, bounds, collide, i, j, max, min, p, prob, ref, results, s;
    if (full == null) {
      full = true;
    }
    CollisionDemo.__super__.setup.apply(this, arguments);
    this.physics.integrator = new Verlet();
    min = new Vector(0.0, 0.0);
    max = new Vector(this.width, this.height);
    bounds = new EdgeBounce(min, max);
    collide = new Collision;
    attraction = new Attraction(this.mouse.pos, 2000, 1400);
    max = full ? 350 : 150;
    prob = full ? 0.35 : 0.5;
    results = [];
    for (i = j = 0, ref = max; 0 <= ref ? j <= ref : j >= ref; i = 0 <= ref ? ++j : --j) {
      p = new Particle(Random(0.5, 4.0));
      p.setRadius(p.mass * 4);
      p.moveTo(new Vector(Random(this.width), Random(this.height)));
      if (Random.bool(prob)) {
        s = new Spring(this.mouse, p, Random(120, 180), 0.8);
        this.physics.springs.push(s);
      } else {
        p.behaviours.push(attraction);
      }
      collide.pool.push(p);
      p.behaviours.push(collide);
      p.behaviours.push(bounds);
      results.push(this.physics.particles.push(p));
    }
    return results;
  };

  CollisionDemo.prototype.onCollision = function(p1, p2) {};

  return CollisionDemo;

})(Demo);


},{}],"coffeePhysics/demos/Demo":[function(require,module,exports){

/* Demo */
var Demo,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

Demo = (function() {
  Demo.COLOURS = ['DC0048', 'F14646', '4AE6A9', '7CFF3F', '4EC9D9', 'E4272E'];

  function Demo() {
    this.mousemove = bind(this.mousemove, this);
    this.resize = bind(this.resize, this);
    this.physics = new Physics();
    this.mouse = new Particle();
    this.mouse.fixed = true;
    this.height = window.innerHeight;
    this.width = window.innerWidth;
    this.renderTime = 0;
    this.counter = 0;
  }

  Demo.prototype.setup = function(full) {
    if (full == null) {
      return full = true;
    }

    /* Override and add paticles / springs here */
  };


  /* Initialise the demo (override). */

  Demo.prototype.init = function(container1, renderer1) {
    var i, len, particle, ref;
    this.container = container1;
    this.renderer = renderer1 != null ? renderer1 : new WebGLRenderer();
    this.setup(renderer.gl != null);
    ref = this.physics.particles;
    for (i = 0, len = ref.length; i < len; i++) {
      particle = ref[i];
      if (particle.colour == null) {
        particle.colour = Random.item(Demo.COLOURS);
      }
    }
    document.addEventListener('touchmove', this.mousemove, false);
    document.addEventListener('mousemove', this.mousemove, false);
    document.addEventListener('resize', this.resize, false);
    this.container.appendChild(this.renderer.domElement);
    this.renderer.mouse = this.mouse;
    this.renderer.init(this.physics);
    return this.resize();
  };


  /* Handler for window resize event. */

  Demo.prototype.resize = function(event) {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    return this.renderer.setSize(this.width, this.height);
  };


  /* Update loop. */

  Demo.prototype.step = function() {
    this.physics.step();
    if ((this.renderer.gl != null) || ++this.counter % 3 === 0) {
      return this.renderer.render(this.physics);
    }
  };


  /* Clean up after yourself. */

  Demo.prototype.destroy = function() {
    var error;
    document.removeEventListener('touchmove', this.mousemove, false);
    document.removeEventListener('mousemove', this.mousemove, false);
    document.removeEventListener('resize', this.resize, false);
    try {
      container.removeChild(this.renderer.domElement);
    } catch (error1) {
      error = error1;
    }
    this.renderer.destroy();
    this.physics.destroy();
    this.renderer = null;
    this.physics = null;
    return this.mouse = null;
  };


  /* Handler for window mousemove event. */

  Demo.prototype.mousemove = function(event) {
    var touch;
    event.preventDefault();
    if (event.touches && !!event.touches.length) {
      touch = event.touches[0];
      return this.mouse.pos.set(touch.pageX, touch.pageY);
    } else {
      return this.mouse.pos.set(event.clientX, event.clientY);
    }
  };

  return Demo;

})();


},{}],"coffeePhysics/demos/renderer/CanvasRenderer":[function(require,module,exports){

/* Canvas Renderer */
var CanvasRenderer,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

CanvasRenderer = (function(superClass) {
  extend(CanvasRenderer, superClass);

  function CanvasRenderer() {
    this.setSize = bind(this.setSize, this);
    CanvasRenderer.__super__.constructor.apply(this, arguments);
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.domElement = this.canvas;
  }

  CanvasRenderer.prototype.init = function(physics) {
    return CanvasRenderer.__super__.init.call(this, physics);
  };

  CanvasRenderer.prototype.render = function(physics) {
    var TWO_PI, dir, i, j, len, len1, p, ref, ref1, s, time, vel;
    CanvasRenderer.__super__.render.call(this, physics);
    time = new Date().getTime();
    vel = new Vector();
    dir = new Vector();
    this.canvas.width = this.canvas.width;
    this.ctx.globalCompositeOperation = 'lighter';
    this.ctx.lineWidth = 1;
    if (this.renderParticles) {
      TWO_PI = Math.PI * 2;
      ref = physics.particles;
      for (i = 0, len = ref.length; i < len; i++) {
        p = ref[i];
        this.ctx.beginPath();
        this.ctx.arc(p.pos.x, p.pos.y, p.radius, 0, TWO_PI, false);
        this.ctx.fillStyle = '#' + (p.colour || 'FFFFFF');
        this.ctx.fill();
      }
    }
    if (this.renderSprings) {
      this.ctx.strokeStyle = 'rgba(255,255,255,0.1)';
      this.ctx.beginPath();
      ref1 = physics.springs;
      for (j = 0, len1 = ref1.length; j < len1; j++) {
        s = ref1[j];
        this.ctx.moveTo(s.p1.pos.x, s.p1.pos.y);
        this.ctx.lineTo(s.p2.pos.x, s.p2.pos.y);
      }
      this.ctx.stroke();
    }
    if (this.renderMouse) {
      this.ctx.fillStyle = 'rgba(255,255,255,0.1)';
      this.ctx.beginPath();
      this.ctx.arc(this.mouse.pos.x, this.mouse.pos.y, 20, 0, TWO_PI);
      this.ctx.fill();
    }
    return this.renderTime = new Date().getTime() - time;
  };

  CanvasRenderer.prototype.setSize = function(width, height) {
    this.width = width;
    this.height = height;
    CanvasRenderer.__super__.setSize.call(this, this.width, this.height);
    this.canvas.width = this.width;
    return this.canvas.height = this.height;
  };

  return CanvasRenderer;

})(Renderer);


},{}],"coffeePhysics/demos/renderer/DOMRenderer":[function(require,module,exports){

/* DOM Renderer */

/*

	Updating styles:

	Nodes
 */
var DOMRenderer,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

DOMRenderer = (function(superClass) {
  extend(DOMRenderer, superClass);

  function DOMRenderer() {
    this.setSize = bind(this.setSize, this);
    DOMRenderer.__super__.constructor.apply(this, arguments);
    this.useGPU = true;
    this.domElement = document.createElement('div');
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.canvas.style.position = 'absolute';
    this.canvas.style.left = 0;
    this.canvas.style.top = 0;
    this.domElement.style.pointerEvents = 'none';
    this.domElement.appendChild(this.canvas);
  }

  DOMRenderer.prototype.init = function(physics) {
    var el, i, len, mr, p, ref, st;
    DOMRenderer.__super__.init.call(this, physics);
    ref = physics.particles;
    for (i = 0, len = ref.length; i < len; i++) {
      p = ref[i];
      el = document.createElement('span');
      st = el.style;
      st.backgroundColor = p.colour;
      st.borderRadius = p.radius;
      st.marginLeft = -p.radius;
      st.marginTop = -p.radius;
      st.position = 'absolute';
      st.display = 'block';
      st.opacity = 0.85;
      st.height = p.radius * 2;
      st.width = p.radius * 2;
      this.domElement.appendChild(el);
      p.domElement = el;
    }
    el = document.createElement('span');
    st = el.style;
    mr = 20;
    st.backgroundColor = '#ffffff';
    st.borderRadius = mr;
    st.marginLeft = -mr;
    st.marginTop = -mr;
    st.position = 'absolute';
    st.display = 'block';
    st.opacity = 0.1;
    st.height = mr * 2;
    st.width = mr * 2;
    this.domElement.appendChild(el);
    return this.mouse.domElement = el;
  };

  DOMRenderer.prototype.render = function(physics) {
    var i, j, len, len1, p, ref, ref1, s, time;
    DOMRenderer.__super__.render.call(this, physics);
    time = new Date().getTime();
    if (this.renderParticles) {
      ref = physics.particles;
      for (i = 0, len = ref.length; i < len; i++) {
        p = ref[i];
        if (this.useGPU) {
          p.domElement.style.WebkitTransform = "translate3d(" + (p.pos.x | 0) + "px," + (p.pos.y | 0) + "px,0px)";
        } else {
          p.domElement.style.left = p.pos.x;
          p.domElement.style.top = p.pos.y;
        }
      }
    }
    if (this.renderSprings) {
      this.canvas.width = this.canvas.width;
      this.ctx.strokeStyle = 'rgba(255,255,255,0.1)';
      this.ctx.beginPath();
      ref1 = physics.springs;
      for (j = 0, len1 = ref1.length; j < len1; j++) {
        s = ref1[j];
        this.ctx.moveTo(s.p1.pos.x, s.p1.pos.y);
        this.ctx.lineTo(s.p2.pos.x, s.p2.pos.y);
      }
      this.ctx.stroke();
    }
    if (this.renderMouse) {
      if (this.useGPU) {
        this.mouse.domElement.style.WebkitTransform = "translate3d(" + (this.mouse.pos.x | 0) + "px," + (this.mouse.pos.y | 0) + "px,0px)";
      } else {
        this.mouse.domElement.style.left = this.mouse.pos.x;
        this.mouse.domElement.style.top = this.mouse.pos.y;
      }
    }
    return this.renderTime = new Date().getTime() - time;
  };

  DOMRenderer.prototype.setSize = function(width, height) {
    this.width = width;
    this.height = height;
    DOMRenderer.__super__.setSize.call(this, this.width, this.height);
    this.canvas.width = this.width;
    return this.canvas.height = this.height;
  };

  DOMRenderer.prototype.destroy = function() {
    var results;
    results = [];
    while (this.domElement.hasChildNodes()) {
      results.push(this.domElement.removeChild(this.domElement.lastChild));
    }
    return results;
  };

  return DOMRenderer;

})(Renderer);


},{}],"coffeePhysics/demos/renderer/Renderer":[function(require,module,exports){

/* Base Renderer */
var Renderer,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

Renderer = (function() {
  function Renderer() {
    this.setSize = bind(this.setSize, this);
    this.width = 0;
    this.height = 0;
    this.renderParticles = true;
    this.renderSprings = true;
    this.renderMouse = true;
    this.initialized = false;
    this.renderTime = 0;
  }

  Renderer.prototype.init = function(physics) {
    return this.initialized = true;
  };

  Renderer.prototype.render = function(physics) {
    if (!this.initialized) {
      return this.init(physics);
    }
  };

  Renderer.prototype.setSize = function(width, height) {
    this.width = width;
    this.height = height;
  };

  Renderer.prototype.destroy = function() {};

  return Renderer;

})();


},{}],"coffeePhysics/demos/renderer/WebGLRenderer":[function(require,module,exports){

/* WebGL Renderer */
var WebGLRenderer,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

WebGLRenderer = (function(superClass) {
  extend(WebGLRenderer, superClass);

  WebGLRenderer.PARTICLE_VS = '\nuniform vec2 viewport;\nattribute vec3 position;\nattribute float radius;\nattribute vec4 colour;\nvarying vec4 tint;\n\nvoid main() {\n\n    // convert the rectangle from pixels to 0.0 to 1.0\n    vec2 zeroToOne = position.xy / viewport;\n    zeroToOne.y = 1.0 - zeroToOne.y;\n\n    // convert from 0->1 to 0->2\n    vec2 zeroToTwo = zeroToOne * 2.0;\n\n    // convert from 0->2 to -1->+1 (clipspace)\n    vec2 clipSpace = zeroToTwo - 1.0;\n\n    tint = colour;\n\n    gl_Position = vec4(clipSpace, 0, 1);\n    gl_PointSize = radius * 2.0;\n}';

  WebGLRenderer.PARTICLE_FS = '\nprecision mediump float;\n\nuniform sampler2D texture;\nvarying vec4 tint;\n\nvoid main() {\n    gl_FragColor = texture2D(texture, gl_PointCoord) * tint;\n}';

  WebGLRenderer.SPRING_VS = '\nuniform vec2 viewport;\nattribute vec3 position;\n\nvoid main() {\n\n    // convert the rectangle from pixels to 0.0 to 1.0\n    vec2 zeroToOne = position.xy / viewport;\n    zeroToOne.y = 1.0 - zeroToOne.y;\n\n    // convert from 0->1 to 0->2\n    vec2 zeroToTwo = zeroToOne * 2.0;\n\n    // convert from 0->2 to -1->+1 (clipspace)\n    vec2 clipSpace = zeroToTwo - 1.0;\n\n    gl_Position = vec4(clipSpace, 0, 1);\n}';

  WebGLRenderer.SPRING_FS = '\nvoid main() {\n    gl_FragColor = vec4(1.0, 1.0, 1.0, 0.1);\n}';

  function WebGLRenderer(usePointSprites) {
    var error;
    this.usePointSprites = usePointSprites != null ? usePointSprites : true;
    this.setSize = bind(this.setSize, this);
    WebGLRenderer.__super__.constructor.apply(this, arguments);
    this.particlePositionBuffer = null;
    this.particleRadiusBuffer = null;
    this.particleColourBuffer = null;
    this.particleTexture = null;
    this.particleShader = null;
    this.springPositionBuffer = null;
    this.springShader = null;
    this.canvas = document.createElement('canvas');
    try {
      this.gl = this.canvas.getContext('experimental-webgl');
    } catch (error1) {
      error = error1;
    } finally {
      if (!this.gl) {
        return new CanvasRenderer();
      }
    }
    this.domElement = this.canvas;
  }

  WebGLRenderer.prototype.init = function(physics) {
    WebGLRenderer.__super__.init.call(this, physics);
    this.initShaders();
    this.initBuffers(physics);
    this.particleTexture = this.createParticleTextureData();
    this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE);
    return this.gl.enable(this.gl.BLEND);
  };

  WebGLRenderer.prototype.initShaders = function() {
    this.particleShader = this.createShaderProgram(WebGLRenderer.PARTICLE_VS, WebGLRenderer.PARTICLE_FS);
    this.springShader = this.createShaderProgram(WebGLRenderer.SPRING_VS, WebGLRenderer.SPRING_FS);
    this.particleShader.uniforms = {
      viewport: this.gl.getUniformLocation(this.particleShader, 'viewport')
    };
    this.springShader.uniforms = {
      viewport: this.gl.getUniformLocation(this.springShader, 'viewport')
    };
    this.particleShader.attributes = {
      position: this.gl.getAttribLocation(this.particleShader, 'position'),
      radius: this.gl.getAttribLocation(this.particleShader, 'radius'),
      colour: this.gl.getAttribLocation(this.particleShader, 'colour')
    };
    this.springShader.attributes = {
      position: this.gl.getAttribLocation(this.springShader, 'position')
    };
    return console.log(this.particleShader);
  };

  WebGLRenderer.prototype.initBuffers = function(physics) {
    var a, b, colours, g, i, len, particle, r, radii, ref, rgba;
    colours = [];
    radii = [];
    this.particlePositionBuffer = this.gl.createBuffer();
    this.springPositionBuffer = this.gl.createBuffer();
    this.particleColourBuffer = this.gl.createBuffer();
    this.particleRadiusBuffer = this.gl.createBuffer();
    ref = physics.particles;
    for (i = 0, len = ref.length; i < len; i++) {
      particle = ref[i];
      rgba = (particle.colour || '#FFFFFF').match(/[\dA-F]{2}/gi);
      r = (parseInt(rgba[0], 16)) || 255;
      g = (parseInt(rgba[1], 16)) || 255;
      b = (parseInt(rgba[2], 16)) || 255;
      a = (parseInt(rgba[3], 16)) || 255;
      colours.push(r / 255, g / 255, b / 255, a / 255);
      radii.push(particle.radius || 32);
    }
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.particleColourBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(colours), this.gl.STATIC_DRAW);
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.particleRadiusBuffer);
    return this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(radii), this.gl.STATIC_DRAW);
  };

  WebGLRenderer.prototype.createParticleTextureData = function(size) {
    var canvas, ctx, rad, texture;
    if (size == null) {
      size = 128;
    }
    canvas = document.createElement('canvas');
    canvas.width = canvas.height = size;
    ctx = canvas.getContext('2d');
    rad = size * 0.5;
    ctx.beginPath();
    ctx.arc(rad, rad, rad, 0, Math.PI * 2, false);
    ctx.closePath();
    ctx.fillStyle = '#FFF';
    ctx.fill();
    texture = this.gl.createTexture();
    this.setupTexture(texture, canvas);
    return texture;
  };

  WebGLRenderer.prototype.loadTexture = function(source) {
    var texture;
    texture = this.gl.createTexture();
    texture.image = new Image();
    texture.image.onload = (function(_this) {
      return function() {
        return _this.setupTexture(texture, texture.image);
      };
    })(this);
    texture.image.src = source;
    return texture;
  };

  WebGLRenderer.prototype.setupTexture = function(texture, data) {
    this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
    this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, data);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
    this.gl.generateMipmap(this.gl.TEXTURE_2D);
    this.gl.bindTexture(this.gl.TEXTURE_2D, null);
    return texture;
  };

  WebGLRenderer.prototype.createShaderProgram = function(_vs, _fs) {
    var fs, prog, vs;
    vs = this.gl.createShader(this.gl.VERTEX_SHADER);
    fs = this.gl.createShader(this.gl.FRAGMENT_SHADER);
    this.gl.shaderSource(vs, _vs);
    this.gl.shaderSource(fs, _fs);
    this.gl.compileShader(vs);
    this.gl.compileShader(fs);
    if (!this.gl.getShaderParameter(vs, this.gl.COMPILE_STATUS)) {
      alert(this.gl.getShaderInfoLog(vs));
      null;
    }
    if (!this.gl.getShaderParameter(fs, this.gl.COMPILE_STATUS)) {
      alert(this.gl.getShaderInfoLog(fs));
      null;
    }
    prog = this.gl.createProgram();
    this.gl.attachShader(prog, vs);
    this.gl.attachShader(prog, fs);
    this.gl.linkProgram(prog);
    return prog;
  };

  WebGLRenderer.prototype.setSize = function(width, height) {
    this.width = width;
    this.height = height;
    WebGLRenderer.__super__.setSize.call(this, this.width, this.height);
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.gl.viewport(0, 0, this.width, this.height);
    this.gl.useProgram(this.particleShader);
    this.gl.uniform2fv(this.particleShader.uniforms.viewport, new Float32Array([this.width, this.height]));
    this.gl.useProgram(this.springShader);
    return this.gl.uniform2fv(this.springShader.uniforms.viewport, new Float32Array([this.width, this.height]));
  };

  WebGLRenderer.prototype.render = function(physics) {
    var i, j, len, len1, p, ref, ref1, s, vertices;
    WebGLRenderer.__super__.render.apply(this, arguments);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    if (this.renderParticles) {
      vertices = [];
      ref = physics.particles;
      for (i = 0, len = ref.length; i < len; i++) {
        p = ref[i];
        vertices.push(p.pos.x, p.pos.y, 0.0);
      }
      this.gl.activeTexture(this.gl.TEXTURE0);
      this.gl.bindTexture(this.gl.TEXTURE_2D, this.particleTexture);
      this.gl.useProgram(this.particleShader);
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.particlePositionBuffer);
      this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(vertices), this.gl.STATIC_DRAW);
      this.gl.vertexAttribPointer(this.particleShader.attributes.position, 3, this.gl.FLOAT, false, 0, 0);
      this.gl.enableVertexAttribArray(this.particleShader.attributes.position);
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.particleColourBuffer);
      this.gl.enableVertexAttribArray(this.particleShader.attributes.colour);
      this.gl.vertexAttribPointer(this.particleShader.attributes.colour, 4, this.gl.FLOAT, false, 0, 0);
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.particleRadiusBuffer);
      this.gl.enableVertexAttribArray(this.particleShader.attributes.radius);
      this.gl.vertexAttribPointer(this.particleShader.attributes.radius, 1, this.gl.FLOAT, false, 0, 0);
      this.gl.drawArrays(this.gl.POINTS, 0, vertices.length / 3);
    }
    if (this.renderSprings && physics.springs.length > 0) {
      vertices = [];
      ref1 = physics.springs;
      for (j = 0, len1 = ref1.length; j < len1; j++) {
        s = ref1[j];
        vertices.push(s.p1.pos.x, s.p1.pos.y, 0.0);
        vertices.push(s.p2.pos.x, s.p2.pos.y, 0.0);
      }
      this.gl.useProgram(this.springShader);
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.springPositionBuffer);
      this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(vertices), this.gl.STATIC_DRAW);
      this.gl.vertexAttribPointer(this.springShader.attributes.position, 3, this.gl.FLOAT, false, 0, 0);
      this.gl.enableVertexAttribArray(this.springShader.attributes.position);
      return this.gl.drawArrays(this.gl.LINES, 0, vertices.length / 3);
    }
  };

  WebGLRenderer.prototype.destroy = function() {};

  return WebGLRenderer;

})(Renderer);


},{}],"coffeePhysics/engine/Particle":[function(require,module,exports){

/* Imports */
var Vector;

Vector = require('coffeePhysics/math/Vector').Vector;


/* Particle */

exports.Particle = (function() {
  Particle.GUID = 0;

  function Particle(mass) {
    this.mass = mass != null ? mass : 1.0;
    this.id = 'p' + Particle.GUID++;
    this.setMass(this.mass);
    this.setRadius(1.0);
    this.fixed = false;
    this.behaviours = [];
    this.pos = new Vector();
    this.vel = new Vector();
    this.acc = new Vector();
    this.old = {
      pos: new Vector(),
      vel: new Vector(),
      acc: new Vector()
    };
  }


  /* Moves the particle to a given location vector. */

  Particle.prototype.moveTo = function(pos) {
    this.pos.copy(pos);
    return this.old.pos.copy(pos);
  };


  /* Sets the mass of the particle. */

  Particle.prototype.setMass = function(mass) {
    this.mass = mass != null ? mass : 1.0;
    return this.massInv = 1.0 / this.mass;
  };


  /* Sets the radius of the particle. */

  Particle.prototype.setRadius = function(radius) {
    this.radius = radius != null ? radius : 1.0;
    return this.radiusSq = this.radius * this.radius;
  };


  /* Applies all behaviours to derive new force. */

  Particle.prototype.update = function(dt, index) {
    var behaviour, i, len, ref, results;
    if (!this.fixed) {
      ref = this.behaviours;
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        behaviour = ref[i];
        results.push(behaviour.apply(this, dt, index));
      }
      return results;
    }
  };

  return Particle;

})();


},{"coffeePhysics/math/Vector":"coffeePhysics/math/Vector"}],"coffeePhysics/engine/Physics":[function(require,module,exports){

/* Imports */
var Euler;

Euler = require('coffeePhysics/engine/integrator/Euler').Euler;


/* Physics Engine */

exports.Physics = (function() {
  function Physics(integrator) {
    this.integrator = integrator != null ? integrator : new Euler();
    this.timestep = 1.0 / 60;
    this.viscosity = 0.005;
    this.behaviours = [];
    this._time = 0.0;
    this._step = 0.0;
    this._clock = null;
    this._buffer = 0.0;
    this._maxSteps = 4;
    this.particles = [];
    this.springs = [];
  }


  /* Performs a numerical integration step. */

  Physics.prototype.integrate = function(dt) {
    var behaviour, drag, index, j, k, l, len, len1, len2, particle, ref, ref1, ref2, results, spring;
    drag = 1.0 - this.viscosity;
    ref = this.particles;
    for (index = j = 0, len = ref.length; j < len; index = ++j) {
      particle = ref[index];
      ref1 = this.behaviours;
      for (k = 0, len1 = ref1.length; k < len1; k++) {
        behaviour = ref1[k];
        behaviour.apply(particle, dt, index);
      }
      particle.update(dt, index);
    }
    this.integrator.integrate(this.particles, dt, drag);
    ref2 = this.springs;
    results = [];
    for (l = 0, len2 = ref2.length; l < len2; l++) {
      spring = ref2[l];
      results.push(spring.apply());
    }
    return results;
  };


  /* Steps the system. */

  Physics.prototype.step = function() {
    var delta, i, time;
    if (this._clock == null) {
      this._clock = new Date().getTime();
    }
    time = new Date().getTime();
    delta = time - this._clock;
    if (delta <= 0.0) {
      return;
    }
    delta *= 0.001;
    this._clock = time;
    this._buffer += delta;
    i = 0;
    while (this._buffer >= this.timestep && ++i < this._maxSteps) {
      this.integrate(this.timestep);
      this._buffer -= this.timestep;
      this._time += this.timestep;
    }
    return this._step = new Date().getTime() - time;
  };


  /* Clean up after yourself. */

  Physics.prototype.destroy = function() {
    this.integrator = null;
    this.particles = null;
    return this.springs = null;
  };

  return Physics;

})();


},{"coffeePhysics/engine/integrator/Euler":"coffeePhysics/engine/integrator/Euler"}],"coffeePhysics/engine/Spring":[function(require,module,exports){

/* Imports */
var Vector;

Vector = require('coffeePhysics/math/Vector').Vector;


/* Spring */

exports.Spring = (function() {
  function Spring(p1, p2, restLength, stiffness) {
    this.p1 = p1;
    this.p2 = p2;
    this.restLength = restLength != null ? restLength : 100;
    this.stiffness = stiffness != null ? stiffness : 1.0;
    this._delta = new Vector();
  }

  Spring.prototype.apply = function() {
    var dist, force;
    (this._delta.copy(this.p2.pos)).sub(this.p1.pos);
    dist = this._delta.mag() + 0.000001;
    force = (dist - this.restLength) / (dist * (this.p1.massInv + this.p2.massInv)) * this.stiffness;
    if (!this.p1.fixed) {
      this.p1.pos.add(this._delta.clone().scale(force * this.p1.massInv));
    }
    if (!this.p2.fixed) {
      return this.p2.pos.add(this._delta.scale(-force * this.p2.massInv));
    }
  };

  return Spring;

})();


},{"coffeePhysics/math/Vector":"coffeePhysics/math/Vector"}],"coffeePhysics/engine/integrator/Euler":[function(require,module,exports){

/* Import Integrator */
var Integrator,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Integrator = require('coffeePhysics/engine/integrator/Integrator').Integrator;


/* Euler Integrator */

exports.Euler = (function(superClass) {
  extend(Euler, superClass);

  function Euler() {
    return Euler.__super__.constructor.apply(this, arguments);
  }

  Euler.prototype.integrate = function(particles, dt, drag) {
    var i, len, p, results, vel;
    vel = new Vector();
    results = [];
    for (i = 0, len = particles.length; i < len; i++) {
      p = particles[i];
      if (!(!p.fixed)) {
        continue;
      }
      p.old.pos.copy(p.pos);
      p.acc.scale(p.massInv);
      vel.copy(p.vel);
      p.vel.add(p.acc.scale(dt));
      p.pos.add(vel.scale(dt));
      if (drag) {
        p.vel.scale(drag);
      }
      results.push(p.acc.clear());
    }
    return results;
  };

  return Euler;

})(Integrator);


},{"coffeePhysics/engine/integrator/Integrator":"coffeePhysics/engine/integrator/Integrator"}],"coffeePhysics/engine/integrator/ImprovedEuler":[function(require,module,exports){

/* Import Integrator */
var Integrator,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Integrator = require('coffeePhysics/engine/integrator/Integrator').Integrator;


/* Improved Euler Integrator */

exports.ImprovedEuler = (function(superClass) {
  extend(ImprovedEuler, superClass);

  function ImprovedEuler() {
    return ImprovedEuler.__super__.constructor.apply(this, arguments);
  }

  ImprovedEuler.prototype.integrate = function(particles, dt, drag) {
    var acc, dtSq, i, len, p, results, vel;
    acc = new Vector();
    vel = new Vector();
    dtSq = dt * dt;
    results = [];
    for (i = 0, len = particles.length; i < len; i++) {
      p = particles[i];
      if (!(!p.fixed)) {
        continue;
      }
      p.old.pos.copy(p.pos);
      p.acc.scale(p.massInv);
      vel.copy(p.vel);
      acc.copy(p.acc);
      p.pos.add((vel.scale(dt)).add(acc.scale(0.5 * dtSq)));
      p.vel.add(p.acc.scale(dt));
      if (drag) {
        p.vel.scale(drag);
      }
      results.push(p.acc.clear());
    }
    return results;
  };

  return ImprovedEuler;

})(Integrator);


},{"coffeePhysics/engine/integrator/Integrator":"coffeePhysics/engine/integrator/Integrator"}],"coffeePhysics/engine/integrator/Integrator":[function(require,module,exports){

/* Integrator */
exports.Integrator = (function() {
  function Integrator() {}

  Integrator.prototype.integrate = function(particles, dt) {};

  return Integrator;

})();


},{}],"coffeePhysics/engine/integrator/Verlet":[function(require,module,exports){

/* Imports */
var Integrator, Vector,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Integrator = require('coffeePhysics/engine/integrator/Integrator').Integrator;

Vector = require('coffeePhysics/math/Vector').Vector;


/* Velocity Verlet Integrator */

exports.Verlet = (function(superClass) {
  extend(Verlet, superClass);

  function Verlet() {
    return Verlet.__super__.constructor.apply(this, arguments);
  }

  Verlet.prototype.integrate = function(particles, dt, drag) {
    var dtSq, i, len, p, pos, results;
    pos = new Vector();
    dtSq = dt * dt;
    results = [];
    for (i = 0, len = particles.length; i < len; i++) {
      p = particles[i];
      if (!(!p.fixed)) {
        continue;
      }
      p.acc.scale(p.massInv);
      (p.vel.copy(p.pos)).sub(p.old.pos);
      if (drag) {
        p.vel.scale(drag);
      }
      (pos.copy(p.pos)).add(p.vel.add(p.acc.scale(dtSq)));
      p.old.pos.copy(p.pos);
      p.pos.copy(pos);
      results.push(p.acc.clear());
    }
    return results;
  };

  return Verlet;

})(Integrator);


},{"coffeePhysics/engine/integrator/Integrator":"coffeePhysics/engine/integrator/Integrator","coffeePhysics/math/Vector":"coffeePhysics/math/Vector"}],"coffeePhysics/math/Random":[function(require,module,exports){

/* Random */
exports.Random = function(min, max) {
  if (max == null) {
    max = min;
    min = 0;
  }
  return min + Math.random() * (max - min);
};

Random.int = function(min, max) {
  if (max == null) {
    max = min;
    min = 0;
  }
  return Math.floor(min + Math.random() * (max - min));
};

Random.sign = function(prob) {
  if (prob == null) {
    prob = 0.5;
  }
  if (Math.random() < prob) {
    return 1;
  } else {
    return -1;
  }
};

Random.bool = function(prob) {
  if (prob == null) {
    prob = 0.5;
  }
  return Math.random() < prob;
};

Random.item = function(list) {
  return list[Math.floor(Math.random() * list.length)];
};


},{}],"coffeePhysics/math/Vector":[function(require,module,exports){

/* 2D Vector */
exports.Vector = (function() {

  /* Adds two vectors and returns the product. */
  Vector.add = function(v1, v2) {
    return new Vector(v1.x + v2.x, v1.y + v2.y);
  };


  /* Subtracts v2 from v1 and returns the product. */

  Vector.sub = function(v1, v2) {
    return new Vector(v1.x - v2.x, v1.y - v2.y);
  };


  /* Projects one vector (v1) onto another (v2) */

  Vector.project = function(v1, v2) {
    return v1.clone().scale((v1.dot(v2)) / v1.magSq());
  };


  /* Creates a new Vector instance. */

  function Vector(x, y) {
    this.x = x != null ? x : 0.0;
    this.y = y != null ? y : 0.0;
  }


  /* Sets the components of this vector. */

  Vector.prototype.set = function(x, y) {
    this.x = x;
    this.y = y;
    return this;
  };


  /* Add a vector to this one. */

  Vector.prototype.add = function(v) {
    this.x += v.x;
    this.y += v.y;
    return this;
  };


  /* Subtracts a vector from this one. */

  Vector.prototype.sub = function(v) {
    this.x -= v.x;
    this.y -= v.y;
    return this;
  };


  /* Scales this vector by a value. */

  Vector.prototype.scale = function(f) {
    this.x *= f;
    this.y *= f;
    return this;
  };


  /* Computes the dot product between vectors. */

  Vector.prototype.dot = function(v) {
    return this.x * v.x + this.y * v.y;
  };


  /* Computes the cross product between vectors. */

  Vector.prototype.cross = function(v) {
    return (this.x * v.y) - (this.y * v.x);
  };


  /* Computes the magnitude (length). */

  Vector.prototype.mag = function() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  };


  /* Computes the squared magnitude (length). */

  Vector.prototype.magSq = function() {
    return this.x * this.x + this.y * this.y;
  };


  /* Computes the distance to another vector. */

  Vector.prototype.dist = function(v) {
    var dx, dy;
    dx = v.x - this.x;
    dy = v.y - this.y;
    return Math.sqrt(dx * dx + dy * dy);
  };


  /* Computes the squared distance to another vector. */

  Vector.prototype.distSq = function(v) {
    var dx, dy;
    dx = v.x - this.x;
    dy = v.y - this.y;
    return dx * dx + dy * dy;
  };


  /* Normalises the vector, making it a unit vector (of length 1). */

  Vector.prototype.norm = function() {
    var m;
    m = Math.sqrt(this.x * this.x + this.y * this.y);
    this.x /= m;
    this.y /= m;
    return this;
  };


  /* Limits the vector length to a given amount. */

  Vector.prototype.limit = function(l) {
    var m, mSq;
    mSq = this.x * this.x + this.y * this.y;
    if (mSq > l * l) {
      m = Math.sqrt(mSq);
      this.x /= m;
      this.y /= m;
      this.x *= l;
      this.y *= l;
      return this;
    }
  };


  /* Copies components from another vector. */

  Vector.prototype.copy = function(v) {
    this.x = v.x;
    this.y = v.y;
    return this;
  };


  /* Clones this vector to a new itentical one. */

  Vector.prototype.clone = function() {
    return new Vector(this.x, this.y);
  };


  /* Resets the vector to zero. */

  Vector.prototype.clear = function() {
    this.x = 0.0;
    this.y = 0.0;
    return this;
  };

  return Vector;

})();


},{}],"coffeePhysics":[function(require,module,exports){
var Attraction, Behaviour, Collision, ConstantForce, EdgeBounce, EdgeWrap, Euler, Gravity, ImprovedEuler, Integrator, Particle, Physics, Spring, Vector, Verlet, Wander;

Integrator = require('coffeePhysics/engine/integrator/Integrator').Integrator;

Euler = require('coffeePhysics/engine/integrator/Euler').Euler;

ImprovedEuler = require('coffeePhysics/engine/integrator/ImprovedEuler').ImprovedEuler;

Verlet = require('coffeePhysics/engine/integrator/Verlet').Verlet;

exports.Integrator = Integrator;

exports.Euler = Euler;

exports.ImprovedEuler = ImprovedEuler;

exports.Verlet = Verlet;

Particle = require('coffeePhysics/engine/Particle').Particle;

Physics = require('coffeePhysics/engine/Physics').Physics;

Spring = require('coffeePhysics/engine/Spring').Spring;

exports.Particle = Particle;

exports.Physics = Physics;

exports.Spring = Spring;

Vector = require('coffeePhysics/math/Vector').Vector;

exports.Vector = Vector;

Behaviour = require('coffeePhysics/behaviour/Behaviour').Behaviour;

Attraction = require('coffeePhysics/behaviour/Attraction').Attraction;

Collision = require('coffeePhysics/behaviour/Collision').Collision;

ConstantForce = require('coffeePhysics/behaviour/ConstantForce').ConstantForce;

EdgeBounce = require('coffeePhysics/behaviour/EdgeBounce').EdgeBounce;

EdgeWrap = require('coffeePhysics/behaviour/EdgeWrap').EdgeWrap;

Wander = require('coffeePhysics/behaviour/Wander').Wander;

Gravity = require('coffeePhysics/behaviour/Gravity').Gravity;

exports.Behaviour = Behaviour;

exports.Attraction = Attraction;

exports.Collision = Collision;

exports.ConstantForce = ConstantForce;

exports.EdgeBounce = EdgeBounce;

exports.EdgeWrap = EdgeWrap;

exports.Wander = Wander;

exports.Gravity = Gravity;


},{"coffeePhysics/behaviour/Attraction":"coffeePhysics/behaviour/Attraction","coffeePhysics/behaviour/Behaviour":"coffeePhysics/behaviour/Behaviour","coffeePhysics/behaviour/Collision":"coffeePhysics/behaviour/Collision","coffeePhysics/behaviour/ConstantForce":"coffeePhysics/behaviour/ConstantForce","coffeePhysics/behaviour/EdgeBounce":"coffeePhysics/behaviour/EdgeBounce","coffeePhysics/behaviour/EdgeWrap":"coffeePhysics/behaviour/EdgeWrap","coffeePhysics/behaviour/Gravity":"coffeePhysics/behaviour/Gravity","coffeePhysics/behaviour/Wander":"coffeePhysics/behaviour/Wander","coffeePhysics/engine/Particle":"coffeePhysics/engine/Particle","coffeePhysics/engine/Physics":"coffeePhysics/engine/Physics","coffeePhysics/engine/Spring":"coffeePhysics/engine/Spring","coffeePhysics/engine/integrator/Euler":"coffeePhysics/engine/integrator/Euler","coffeePhysics/engine/integrator/ImprovedEuler":"coffeePhysics/engine/integrator/ImprovedEuler","coffeePhysics/engine/integrator/Integrator":"coffeePhysics/engine/integrator/Integrator","coffeePhysics/engine/integrator/Verlet":"coffeePhysics/engine/integrator/Verlet","coffeePhysics/math/Vector":"coffeePhysics/math/Vector"}]},{},[])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZnJhbWVyLm1vZHVsZXMuanMiLCJzb3VyY2VzIjpbIi4uL21vZHVsZXMvY29mZmVlUGh5c2ljcy5jb2ZmZWUiLCIuLi9tb2R1bGVzL2NvZmZlZVBoeXNpY3MvbWF0aC9WZWN0b3IuY29mZmVlIiwiLi4vbW9kdWxlcy9jb2ZmZWVQaHlzaWNzL21hdGgvUmFuZG9tLmNvZmZlZSIsIi4uL21vZHVsZXMvY29mZmVlUGh5c2ljcy9lbmdpbmUvaW50ZWdyYXRvci9WZXJsZXQuY29mZmVlIiwiLi4vbW9kdWxlcy9jb2ZmZWVQaHlzaWNzL2VuZ2luZS9pbnRlZ3JhdG9yL0ludGVncmF0b3IuY29mZmVlIiwiLi4vbW9kdWxlcy9jb2ZmZWVQaHlzaWNzL2VuZ2luZS9pbnRlZ3JhdG9yL0ltcHJvdmVkRXVsZXIuY29mZmVlIiwiLi4vbW9kdWxlcy9jb2ZmZWVQaHlzaWNzL2VuZ2luZS9pbnRlZ3JhdG9yL0V1bGVyLmNvZmZlZSIsIi4uL21vZHVsZXMvY29mZmVlUGh5c2ljcy9lbmdpbmUvU3ByaW5nLmNvZmZlZSIsIi4uL21vZHVsZXMvY29mZmVlUGh5c2ljcy9lbmdpbmUvUGh5c2ljcy5jb2ZmZWUiLCIuLi9tb2R1bGVzL2NvZmZlZVBoeXNpY3MvZW5naW5lL1BhcnRpY2xlLmNvZmZlZSIsIi4uL21vZHVsZXMvY29mZmVlUGh5c2ljcy9kZW1vcy9yZW5kZXJlci9XZWJHTFJlbmRlcmVyLmNvZmZlZSIsIi4uL21vZHVsZXMvY29mZmVlUGh5c2ljcy9kZW1vcy9yZW5kZXJlci9SZW5kZXJlci5jb2ZmZWUiLCIuLi9tb2R1bGVzL2NvZmZlZVBoeXNpY3MvZGVtb3MvcmVuZGVyZXIvRE9NUmVuZGVyZXIuY29mZmVlIiwiLi4vbW9kdWxlcy9jb2ZmZWVQaHlzaWNzL2RlbW9zL3JlbmRlcmVyL0NhbnZhc1JlbmRlcmVyLmNvZmZlZSIsIi4uL21vZHVsZXMvY29mZmVlUGh5c2ljcy9kZW1vcy9EZW1vLmNvZmZlZSIsIi4uL21vZHVsZXMvY29mZmVlUGh5c2ljcy9kZW1vcy9Db2xsaXNpb25EZW1vLmNvZmZlZSIsIi4uL21vZHVsZXMvY29mZmVlUGh5c2ljcy9kZW1vcy9DbG90aERlbW8uY29mZmVlIiwiLi4vbW9kdWxlcy9jb2ZmZWVQaHlzaWNzL2RlbW9zL0NoYWluRGVtby5jb2ZmZWUiLCIuLi9tb2R1bGVzL2NvZmZlZVBoeXNpY3MvZGVtb3MvQm91bmRzRGVtby5jb2ZmZWUiLCIuLi9tb2R1bGVzL2NvZmZlZVBoeXNpY3MvZGVtb3MvQmFsbG9vbkRlbW8uY29mZmVlIiwiLi4vbW9kdWxlcy9jb2ZmZWVQaHlzaWNzL2RlbW9zL0F0dHJhY3Rpb25EZW1vLmNvZmZlZSIsIi4uL21vZHVsZXMvY29mZmVlUGh5c2ljcy9iZWhhdmlvdXIvV2FuZGVyLmNvZmZlZSIsIi4uL21vZHVsZXMvY29mZmVlUGh5c2ljcy9iZWhhdmlvdXIvR3Jhdml0eS5jb2ZmZWUiLCIuLi9tb2R1bGVzL2NvZmZlZVBoeXNpY3MvYmVoYXZpb3VyL0VkZ2VXcmFwLmNvZmZlZSIsIi4uL21vZHVsZXMvY29mZmVlUGh5c2ljcy9iZWhhdmlvdXIvRWRnZUJvdW5jZS5jb2ZmZWUiLCIuLi9tb2R1bGVzL2NvZmZlZVBoeXNpY3MvYmVoYXZpb3VyL0NvbnN0YW50Rm9yY2UuY29mZmVlIiwiLi4vbW9kdWxlcy9jb2ZmZWVQaHlzaWNzL2JlaGF2aW91ci9Db2xsaXNpb24uY29mZmVlIiwiLi4vbW9kdWxlcy9jb2ZmZWVQaHlzaWNzL2JlaGF2aW91ci9CZWhhdmlvdXIuY29mZmVlIiwiLi4vbW9kdWxlcy9jb2ZmZWVQaHlzaWNzL2JlaGF2aW91ci9BdHRyYWN0aW9uLmNvZmZlZSIsIi4uL21vZHVsZXMvY29mZmVlUGh5c2ljcy9iYXNlLmNvZmZlZSIsIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiXSwic291cmNlc0NvbnRlbnQiOlsiIyBBZGQgdGhlIGZvbGxvd2luZyBsaW5lIHRvIHlvdXIgcHJvamVjdCBpbiBGcmFtZXIgU3R1ZGlvLlxuIyBteU1vZHVsZSA9IHJlcXVpcmUgXCJteU1vZHVsZVwiXG4jIFJlZmVyZW5jZSB0aGUgY29udGVudHMgYnkgbmFtZSwgbGlrZSBteU1vZHVsZS5teUZ1bmN0aW9uKCkgb3IgbXlNb2R1bGUubXlWYXJcblxuXG4jIEltcG9ydCBpbnRlZ3JhdG9yIGZyYW1ld29ya1xue0ludGVncmF0b3J9ID0gcmVxdWlyZSAnY29mZmVlUGh5c2ljcy9lbmdpbmUvaW50ZWdyYXRvci9JbnRlZ3JhdG9yJ1xue0V1bGVyfSA9IHJlcXVpcmUgJ2NvZmZlZVBoeXNpY3MvZW5naW5lL2ludGVncmF0b3IvRXVsZXInXG57SW1wcm92ZWRFdWxlcn0gPSByZXF1aXJlICdjb2ZmZWVQaHlzaWNzL2VuZ2luZS9pbnRlZ3JhdG9yL0ltcHJvdmVkRXVsZXInXG57VmVybGV0fSA9IHJlcXVpcmUgJ2NvZmZlZVBoeXNpY3MvZW5naW5lL2ludGVncmF0b3IvVmVybGV0J1xuXG5leHBvcnRzLkludGVncmF0b3IgPSBJbnRlZ3JhdG9yXG5leHBvcnRzLkV1bGVyID0gRXVsZXJcbmV4cG9ydHMuSW1wcm92ZWRFdWxlciA9IEltcHJvdmVkRXVsZXJcbmV4cG9ydHMuVmVybGV0ID0gVmVybGV0XG5cbiMgSW1wb3J0IHBoeXNpY3MgZnJhbWV3b3JrXG57UGFydGljbGV9ID0gcmVxdWlyZSAnY29mZmVlUGh5c2ljcy9lbmdpbmUvUGFydGljbGUnXG57UGh5c2ljc30gPSByZXF1aXJlICdjb2ZmZWVQaHlzaWNzL2VuZ2luZS9QaHlzaWNzJ1xue1NwcmluZ30gPSByZXF1aXJlICdjb2ZmZWVQaHlzaWNzL2VuZ2luZS9TcHJpbmcnXG5cbmV4cG9ydHMuUGFydGljbGUgPSBQYXJ0aWNsZVxuZXhwb3J0cy5QaHlzaWNzID0gUGh5c2ljc1xuZXhwb3J0cy5TcHJpbmcgPSBTcHJpbmdcblxuIyBJbXBvcnQgbWF0aCBmcmFtZXdvcmtcbiMge1JhbmRvbX0gPSByZXF1aXJlICdjb2ZmZWVQaHlzaWNzL21hdGgvUmFuZG9tJ1xue1ZlY3Rvcn0gPSByZXF1aXJlICdjb2ZmZWVQaHlzaWNzL21hdGgvVmVjdG9yJ1xuXG4jIGV4cG9ydHMuUmFuZG9tID0gUmFuZG9tXG5leHBvcnRzLlZlY3RvciA9IFZlY3RvclxuXG4jIEltcG9ydCBiZWhhdmlvdXIgZnJhbWV3b3JrXG57QmVoYXZpb3VyfSA9IHJlcXVpcmUgJ2NvZmZlZVBoeXNpY3MvYmVoYXZpb3VyL0JlaGF2aW91cidcbntBdHRyYWN0aW9ufSA9IHJlcXVpcmUgJ2NvZmZlZVBoeXNpY3MvYmVoYXZpb3VyL0F0dHJhY3Rpb24nXG57Q29sbGlzaW9ufSA9IHJlcXVpcmUgJ2NvZmZlZVBoeXNpY3MvYmVoYXZpb3VyL0NvbGxpc2lvbidcbntDb25zdGFudEZvcmNlfSA9IHJlcXVpcmUgJ2NvZmZlZVBoeXNpY3MvYmVoYXZpb3VyL0NvbnN0YW50Rm9yY2UnXG57RWRnZUJvdW5jZX0gPSByZXF1aXJlICdjb2ZmZWVQaHlzaWNzL2JlaGF2aW91ci9FZGdlQm91bmNlJ1xue0VkZ2VXcmFwfSA9IHJlcXVpcmUgJ2NvZmZlZVBoeXNpY3MvYmVoYXZpb3VyL0VkZ2VXcmFwJ1xue1dhbmRlcn0gPSByZXF1aXJlICdjb2ZmZWVQaHlzaWNzL2JlaGF2aW91ci9XYW5kZXInXG57R3Jhdml0eX0gPSByZXF1aXJlICdjb2ZmZWVQaHlzaWNzL2JlaGF2aW91ci9HcmF2aXR5J1xuXG5leHBvcnRzLkJlaGF2aW91ciA9IEJlaGF2aW91clxuZXhwb3J0cy5BdHRyYWN0aW9uID0gQXR0cmFjdGlvblxuZXhwb3J0cy5Db2xsaXNpb24gPSBDb2xsaXNpb25cbmV4cG9ydHMuQ29uc3RhbnRGb3JjZSA9IENvbnN0YW50Rm9yY2VcbmV4cG9ydHMuRWRnZUJvdW5jZSA9IEVkZ2VCb3VuY2VcbmV4cG9ydHMuRWRnZVdyYXAgPSBFZGdlV3JhcFxuZXhwb3J0cy5XYW5kZXIgPSBXYW5kZXJcbmV4cG9ydHMuR3Jhdml0eSA9IEdyYXZpdHlcbiIsIiMjIyAyRCBWZWN0b3IgIyMjXG5cbmNsYXNzIGV4cG9ydHMuVmVjdG9yXG5cblx0IyMjIEFkZHMgdHdvIHZlY3RvcnMgYW5kIHJldHVybnMgdGhlIHByb2R1Y3QuICMjI1xuXHRAYWRkOiAodjEsIHYyKSAtPlxuXHRcdG5ldyBWZWN0b3IgdjEueCArIHYyLngsIHYxLnkgKyB2Mi55XG5cblx0IyMjIFN1YnRyYWN0cyB2MiBmcm9tIHYxIGFuZCByZXR1cm5zIHRoZSBwcm9kdWN0LiAjIyNcblx0QHN1YjogKHYxLCB2MikgLT5cblx0XHRuZXcgVmVjdG9yIHYxLnggLSB2Mi54LCB2MS55IC0gdjIueVxuXG5cdCMjIyBQcm9qZWN0cyBvbmUgdmVjdG9yICh2MSkgb250byBhbm90aGVyICh2MikgIyMjXG5cdEBwcm9qZWN0OiAodjEsIHYyKSAtPlxuXHRcdHYxLmNsb25lKCkuc2NhbGUgKCh2MS5kb3QgdjIpIC8gdjEubWFnU3EoKSlcblxuXHQjIyMgQ3JlYXRlcyBhIG5ldyBWZWN0b3IgaW5zdGFuY2UuICMjI1xuXHRjb25zdHJ1Y3RvcjogKEB4ID0gMC4wLCBAeSA9IDAuMCkgLT5cblxuXHQjIyMgU2V0cyB0aGUgY29tcG9uZW50cyBvZiB0aGlzIHZlY3Rvci4gIyMjXG5cdHNldDogKEB4LCBAeSkgLT5cblx0XHRAXG5cblx0IyMjIEFkZCBhIHZlY3RvciB0byB0aGlzIG9uZS4gIyMjXG5cdGFkZDogKHYpIC0+XG5cdFx0QHggKz0gdi54OyBAeSArPSB2Lnk7IEBcblxuXHQjIyMgU3VidHJhY3RzIGEgdmVjdG9yIGZyb20gdGhpcyBvbmUuICMjI1xuXHRzdWI6ICh2KSAtPlxuXHRcdEB4IC09IHYueDsgQHkgLT0gdi55OyBAXG5cblx0IyMjIFNjYWxlcyB0aGlzIHZlY3RvciBieSBhIHZhbHVlLiAjIyNcblx0c2NhbGU6IChmKSAtPlxuXHRcdEB4ICo9IGY7IEB5ICo9IGY7IEBcblxuXHQjIyMgQ29tcHV0ZXMgdGhlIGRvdCBwcm9kdWN0IGJldHdlZW4gdmVjdG9ycy4gIyMjXG5cdGRvdDogKHYpIC0+XG5cdFx0QHggKiB2LnggKyBAeSAqIHYueVxuXG5cdCMjIyBDb21wdXRlcyB0aGUgY3Jvc3MgcHJvZHVjdCBiZXR3ZWVuIHZlY3RvcnMuICMjI1xuXHRjcm9zczogKHYpIC0+XG5cdFx0KEB4ICogdi55KSAtIChAeSAqIHYueClcblxuXHQjIyMgQ29tcHV0ZXMgdGhlIG1hZ25pdHVkZSAobGVuZ3RoKS4gIyMjXG5cdG1hZzogLT5cblx0XHRNYXRoLnNxcnQgQHgqQHggKyBAeSpAeVxuXG5cdCMjIyBDb21wdXRlcyB0aGUgc3F1YXJlZCBtYWduaXR1ZGUgKGxlbmd0aCkuICMjI1xuXHRtYWdTcTogLT5cblx0XHRAeCpAeCArIEB5KkB5XG5cblx0IyMjIENvbXB1dGVzIHRoZSBkaXN0YW5jZSB0byBhbm90aGVyIHZlY3Rvci4gIyMjXG5cdGRpc3Q6ICh2KSAtPlxuXHRcdGR4ID0gdi54IC0gQHg7IGR5ID0gdi55IC0gQHlcblx0XHRNYXRoLnNxcnQgZHgqZHggKyBkeSpkeVxuXG5cdCMjIyBDb21wdXRlcyB0aGUgc3F1YXJlZCBkaXN0YW5jZSB0byBhbm90aGVyIHZlY3Rvci4gIyMjXG5cdGRpc3RTcTogKHYpIC0+XG5cdFx0ZHggPSB2LnggLSBAeDsgZHkgPSB2LnkgLSBAeVxuXHRcdGR4KmR4ICsgZHkqZHlcblxuXHQjIyMgTm9ybWFsaXNlcyB0aGUgdmVjdG9yLCBtYWtpbmcgaXQgYSB1bml0IHZlY3RvciAob2YgbGVuZ3RoIDEpLiAjIyNcblx0bm9ybTogLT5cblx0XHRtID0gTWF0aC5zcXJ0IEB4KkB4ICsgQHkqQHlcblx0XHRAeCAvPSBtXG5cdFx0QHkgLz0gbVxuXHRcdEBcblxuXHQjIyMgTGltaXRzIHRoZSB2ZWN0b3IgbGVuZ3RoIHRvIGEgZ2l2ZW4gYW1vdW50LiAjIyNcblx0bGltaXQ6IChsKSAtPlxuXHRcdG1TcSA9IEB4KkB4ICsgQHkqQHlcblx0XHRpZiBtU3EgPiBsKmxcblx0XHRcdG0gPSBNYXRoLnNxcnQgbVNxXG5cdFx0XHRAeCAvPSBtOyBAeSAvPSBtXG5cdFx0XHRAeCAqPSBsOyBAeSAqPSBsXG5cdFx0XHRAXG5cblx0IyMjIENvcGllcyBjb21wb25lbnRzIGZyb20gYW5vdGhlciB2ZWN0b3IuICMjI1xuXHRjb3B5OiAodikgLT5cblx0XHRAeCA9IHYueDsgQHkgPSB2Lnk7IEBcblxuXHQjIyMgQ2xvbmVzIHRoaXMgdmVjdG9yIHRvIGEgbmV3IGl0ZW50aWNhbCBvbmUuICMjI1xuXHRjbG9uZTogLT5cblx0XHRuZXcgVmVjdG9yIEB4LCBAeVxuXG5cdCMjIyBSZXNldHMgdGhlIHZlY3RvciB0byB6ZXJvLiAjIyNcblx0Y2xlYXI6IC0+XG5cdFx0QHggPSAwLjA7IEB5ID0gMC4wOyBAXG4iLCIjIyMgUmFuZG9tICMjI1xuXG5leHBvcnRzLlJhbmRvbSA9IChtaW4sIG1heCkgLT5cblxuXHRpZiBub3QgbWF4P1xuXHRcdFx0bWF4ID0gbWluXG5cdFx0XHRtaW4gPSAwXG5cblx0bWluICsgTWF0aC5yYW5kb20oKSAqIChtYXggLSBtaW4pXG5cblJhbmRvbS5pbnQgPSAobWluLCBtYXgpIC0+XG5cblx0aWYgbm90IG1heD9cblx0XHRcdG1heCA9IG1pblxuXHRcdFx0bWluID0gMFxuXG5cdE1hdGguZmxvb3IgbWluICsgTWF0aC5yYW5kb20oKSAqIChtYXggLSBtaW4pXG5cblJhbmRvbS5zaWduID0gKHByb2IgPSAwLjUpIC0+XG5cblx0aWYgZG8gTWF0aC5yYW5kb20gPCBwcm9iIHRoZW4gMSBlbHNlIC0xXG5cblJhbmRvbS5ib29sID0gKHByb2IgPSAwLjUpIC0+XG5cblx0ZG8gTWF0aC5yYW5kb20gPCBwcm9iXG5cblJhbmRvbS5pdGVtID0gKGxpc3QpIC0+XG5cblx0bGlzdFsgTWF0aC5mbG9vciBNYXRoLnJhbmRvbSgpICogbGlzdC5sZW5ndGggXVxuIiwiIyMjIEltcG9ydHMgIyMjXG57SW50ZWdyYXRvcn0gPSByZXF1aXJlICdjb2ZmZWVQaHlzaWNzL2VuZ2luZS9pbnRlZ3JhdG9yL0ludGVncmF0b3InXG57VmVjdG9yfSA9IHJlcXVpcmUgJ2NvZmZlZVBoeXNpY3MvbWF0aC9WZWN0b3InXG5cblxuIyMjIFZlbG9jaXR5IFZlcmxldCBJbnRlZ3JhdG9yICMjI1xuXG5jbGFzcyBleHBvcnRzLlZlcmxldCBleHRlbmRzIEludGVncmF0b3JcblxuICAgICMgdiA9IHggLSBveFxuICAgICMgeCA9IHggKyAodiArIGEgKiBkdCAqIGR0KVxuXG4gICAgaW50ZWdyYXRlOiAocGFydGljbGVzLCBkdCwgZHJhZykgLT5cblxuICAgICAgICBwb3MgPSBuZXcgVmVjdG9yKClcblxuICAgICAgICBkdFNxID0gZHQgKiBkdFxuXG4gICAgICAgIGZvciBwIGluIHBhcnRpY2xlcyB3aGVuIG5vdCBwLmZpeGVkXG5cbiAgICAgICAgICAgICMgU2NhbGUgZm9yY2UgdG8gbWFzcy5cbiAgICAgICAgICAgIHAuYWNjLnNjYWxlIHAubWFzc0ludlxuXG4gICAgICAgICAgICAjIERlcml2ZSB2ZWxvY2l0eS5cbiAgICAgICAgICAgIChwLnZlbC5jb3B5IHAucG9zKS5zdWIgcC5vbGQucG9zXG5cbiAgICAgICAgICAgICMgQXBwbHkgZnJpY3Rpb24uXG4gICAgICAgICAgICBpZiBkcmFnIHRoZW4gcC52ZWwuc2NhbGUgZHJhZ1xuXG4gICAgICAgICAgICAjIEFwcGx5IGZvcmNlcyB0byBuZXcgcG9zaXRpb24uXG4gICAgICAgICAgICAocG9zLmNvcHkgcC5wb3MpLmFkZCAocC52ZWwuYWRkIHAuYWNjLnNjYWxlIGR0U3EpXG5cbiAgICAgICAgICAgICMgU3RvcmUgb2xkIHBvc2l0aW9uLlxuICAgICAgICAgICAgcC5vbGQucG9zLmNvcHkgcC5wb3NcblxuICAgICAgICAgICAgIyB1cGRhdGUgcG9zaXRpb24uXG4gICAgICAgICAgICBwLnBvcy5jb3B5IHBvc1xuXG4gICAgICAgICAgICAjIFJlc2V0IGZvcmNlcy5cbiAgICAgICAgICAgIHAuYWNjLmNsZWFyKClcbiIsIiMjIyBJbnRlZ3JhdG9yICMjI1xuXG5jbGFzcyBleHBvcnRzLkludGVncmF0b3JcblxuICAgIGludGVncmF0ZTogKHBhcnRpY2xlcywgZHQpIC0+XG5cbiAgICAgICAgIyBPdmVycmlkZS5cbiIsIiMjIyBJbXBvcnQgSW50ZWdyYXRvciAjIyNcbntJbnRlZ3JhdG9yfSA9IHJlcXVpcmUgJ2NvZmZlZVBoeXNpY3MvZW5naW5lL2ludGVncmF0b3IvSW50ZWdyYXRvcidcblxuIyMjIEltcHJvdmVkIEV1bGVyIEludGVncmF0b3IgIyMjXG5cbmNsYXNzIGV4cG9ydHMuSW1wcm92ZWRFdWxlciBleHRlbmRzIEludGVncmF0b3JcblxuICAgICMgeCArPSAodiAqIGR0KSArIChhICogMC41ICogZHQgKiBkdClcbiAgICAjIHYgKz0gYSAqIGR0XG5cbiAgICBpbnRlZ3JhdGU6IChwYXJ0aWNsZXMsIGR0LCBkcmFnKSAtPlxuXG4gICAgICAgIGFjYyA9IG5ldyBWZWN0b3IoKVxuICAgICAgICB2ZWwgPSBuZXcgVmVjdG9yKClcblxuICAgICAgICBkdFNxID0gZHQgKiBkdFxuXG4gICAgICAgIGZvciBwIGluIHBhcnRpY2xlcyB3aGVuIG5vdCBwLmZpeGVkXG5cbiAgICAgICAgICAgICMgU3RvcmUgcHJldmlvdXMgbG9jYXRpb24uXG4gICAgICAgICAgICBwLm9sZC5wb3MuY29weSBwLnBvc1xuXG4gICAgICAgICAgICAjIFNjYWxlIGZvcmNlIHRvIG1hc3MuXG4gICAgICAgICAgICBwLmFjYy5zY2FsZSBwLm1hc3NJbnZcblxuICAgICAgICAgICAgIyBEdXBsaWNhdGUgdmVsb2NpdHkgdG8gcHJlc2VydmUgbW9tZW50dW0uXG4gICAgICAgICAgICB2ZWwuY29weSBwLnZlbFxuXG4gICAgICAgICAgICAjIER1cGxpY2F0ZSBmb3JjZS5cbiAgICAgICAgICAgIGFjYy5jb3B5IHAuYWNjXG5cbiAgICAgICAgICAgICMgVXBkYXRlIHBvc2l0aW9uLlxuICAgICAgICAgICAgcC5wb3MuYWRkICh2ZWwuc2NhbGUgZHQpLmFkZCAoYWNjLnNjYWxlIDAuNSAqIGR0U3EpXG5cbiAgICAgICAgICAgICMgVXBkYXRlIHZlbG9jaXR5LlxuICAgICAgICAgICAgcC52ZWwuYWRkIHAuYWNjLnNjYWxlIGR0XG5cbiAgICAgICAgICAgICMgQXBwbHkgZnJpY3Rpb24uXG4gICAgICAgICAgICBpZiBkcmFnIHRoZW4gcC52ZWwuc2NhbGUgZHJhZ1xuXG4gICAgICAgICAgICAjIFJlc2V0IGZvcmNlcy5cbiAgICAgICAgICAgIHAuYWNjLmNsZWFyKClcbiIsIiMjIyBJbXBvcnQgSW50ZWdyYXRvciAjIyNcbntJbnRlZ3JhdG9yfSA9IHJlcXVpcmUgJ2NvZmZlZVBoeXNpY3MvZW5naW5lL2ludGVncmF0b3IvSW50ZWdyYXRvcidcblxuIyMjIEV1bGVyIEludGVncmF0b3IgIyMjXG5jbGFzcyBleHBvcnRzLkV1bGVyIGV4dGVuZHMgSW50ZWdyYXRvclxuXG4gICAgIyB2ICs9IGEgKiBkdFxuICAgICMgeCArPSB2ICogZHRcblxuICAgIGludGVncmF0ZTogKHBhcnRpY2xlcywgZHQsIGRyYWcpIC0+XG5cbiAgICAgICAgdmVsID0gbmV3IFZlY3RvcigpXG5cbiAgICAgICAgZm9yIHAgaW4gcGFydGljbGVzIHdoZW4gbm90IHAuZml4ZWRcblxuICAgICAgICAgICAgIyBTdG9yZSBwcmV2aW91cyBsb2NhdGlvbi5cbiAgICAgICAgICAgIHAub2xkLnBvcy5jb3B5IHAucG9zXG5cbiAgICAgICAgICAgICMgU2NhbGUgZm9yY2UgdG8gbWFzcy5cbiAgICAgICAgICAgIHAuYWNjLnNjYWxlIHAubWFzc0ludlxuXG4gICAgICAgICAgICAjIER1cGxpY2F0ZSB2ZWxvY2l0eSB0byBwcmVzZXJ2ZSBtb21lbnR1bS5cbiAgICAgICAgICAgIHZlbC5jb3B5IHAudmVsXG5cbiAgICAgICAgICAgICMgQWRkIGZvcmNlIHRvIHZlbG9jaXR5LlxuICAgICAgICAgICAgcC52ZWwuYWRkIHAuYWNjLnNjYWxlIGR0XG5cbiAgICAgICAgICAgICMgQWRkIHZlbG9jaXR5IHRvIHBvc2l0aW9uLlxuICAgICAgICAgICAgcC5wb3MuYWRkIHZlbC5zY2FsZSBkdFxuXG4gICAgICAgICAgICAjIEFwcGx5IGZyaWN0aW9uLlxuICAgICAgICAgICAgaWYgZHJhZyB0aGVuIHAudmVsLnNjYWxlIGRyYWdcblxuICAgICAgICAgICAgIyBSZXNldCBmb3JjZXMuXG4gICAgICAgICAgICBwLmFjYy5jbGVhcigpXG4iLCIjIyMgSW1wb3J0cyAjIyNcbntWZWN0b3J9ID0gcmVxdWlyZSAnY29mZmVlUGh5c2ljcy9tYXRoL1ZlY3RvcidcblxuIyMjIFNwcmluZyAjIyNcblxuY2xhc3MgZXhwb3J0cy5TcHJpbmdcblxuXHRjb25zdHJ1Y3RvcjogKEBwMSwgQHAyLCBAcmVzdExlbmd0aCA9IDEwMCwgQHN0aWZmbmVzcyA9IDEuMCkgLT5cblxuXHRcdEBfZGVsdGEgPSBuZXcgVmVjdG9yKClcblxuXHQjIEYgPSAta3hcblxuXHRhcHBseTogLT5cblxuXHRcdChAX2RlbHRhLmNvcHkgQHAyLnBvcykuc3ViIEBwMS5wb3NcblxuXHRcdGRpc3QgPSBAX2RlbHRhLm1hZygpICsgMC4wMDAwMDFcblx0XHRmb3JjZSA9IChkaXN0IC0gQHJlc3RMZW5ndGgpIC8gKGRpc3QgKiAoQHAxLm1hc3NJbnYgKyBAcDIubWFzc0ludikpICogQHN0aWZmbmVzc1xuXG5cdFx0aWYgbm90IEBwMS5maXhlZFxuXG5cdFx0XHRAcDEucG9zLmFkZCAoQF9kZWx0YS5jbG9uZSgpLnNjYWxlIGZvcmNlICogQHAxLm1hc3NJbnYpXG5cblx0XHRpZiBub3QgQHAyLmZpeGVkXG5cblx0XHRcdEBwMi5wb3MuYWRkIChAX2RlbHRhLnNjYWxlIC1mb3JjZSAqIEBwMi5tYXNzSW52KVxuIiwiIyMjIEltcG9ydHMgIyMjXG57RXVsZXJ9ID0gcmVxdWlyZSAnY29mZmVlUGh5c2ljcy9lbmdpbmUvaW50ZWdyYXRvci9FdWxlcidcblxuIyMjIFBoeXNpY3MgRW5naW5lICMjI1xuXG5jbGFzcyBleHBvcnRzLlBoeXNpY3NcblxuXHRjb25zdHJ1Y3RvcjogKEBpbnRlZ3JhdG9yID0gbmV3IEV1bGVyKCkpIC0+XG5cblx0XHQjIEZpeGVkIHRpbWVzdGVwLlxuXHRcdEB0aW1lc3RlcCA9IDEuMCAvIDYwXG5cblx0XHQjIEZyaWN0aW9uIHdpdGhpbiB0aGUgc3lzdGVtLlxuXHRcdEB2aXNjb3NpdHkgPSAwLjAwNVxuXG5cdFx0IyBHbG9iYWwgYmVoYXZpb3Vycy5cblx0XHRAYmVoYXZpb3VycyA9IFtdXG5cblx0XHQjIFRpbWUgaW4gc2Vjb25kcy5cblx0XHRAX3RpbWUgPSAwLjBcblxuXHRcdCMgTGFzdCBzdGVwIGR1cmF0aW9uLlxuXHRcdEBfc3RlcCA9IDAuMFxuXG5cdFx0IyBDdXJyZW50IHRpbWUuXG5cdFx0QF9jbG9jayA9IG51bGxcblxuXHRcdCMgVGltZSBidWZmZXIuXG5cdFx0QF9idWZmZXIgPSAwLjBcblxuXHRcdCMgTWF4IGl0ZXJhdGlvbnMgcGVyIHN0ZXAuXG5cdFx0QF9tYXhTdGVwcyA9IDRcblxuXHRcdCMgUGFydGljbGVzIGluIHN5c3RlbS5cblx0XHRAcGFydGljbGVzID0gW11cblxuXHRcdCMgU3ByaW5ncyBpbiBzeXN0ZW0uXG5cdFx0QHNwcmluZ3MgPSBbXVxuXG5cdCMjIyBQZXJmb3JtcyBhIG51bWVyaWNhbCBpbnRlZ3JhdGlvbiBzdGVwLiAjIyNcblx0aW50ZWdyYXRlOiAoZHQpIC0+XG5cblx0XHQjIERyYWcgaXMgaW52ZXJzZWx5IHByb3BvcnRpb25hbCB0byB2aXNjb3NpdHkuXG5cdFx0ZHJhZyA9IDEuMCAtIEB2aXNjb3NpdHlcblxuXHRcdCMgVXBkYXRlIHBhcnRpY2xlcyAvIGFwcGx5IGJlaGF2aW91cnMuXG5cblx0XHRmb3IgcGFydGljbGUsIGluZGV4IGluIEBwYXJ0aWNsZXNcblxuXHRcdFx0Zm9yIGJlaGF2aW91ciBpbiBAYmVoYXZpb3Vyc1xuXG5cdFx0XHRcdGJlaGF2aW91ci5hcHBseSBwYXJ0aWNsZSwgZHQsIGluZGV4XG5cblx0XHRcdHBhcnRpY2xlLnVwZGF0ZSBkdCwgaW5kZXhcblxuXHRcdCMgSW50ZWdyYXRlIG1vdGlvbi5cblxuXHRcdEBpbnRlZ3JhdG9yLmludGVncmF0ZSBAcGFydGljbGVzLCBkdCwgZHJhZ1xuXG5cdFx0IyBDb21wdXRlIGFsbCBzcHJpbmdzLlxuXG5cdFx0Zm9yIHNwcmluZyBpbiBAc3ByaW5nc1xuXG5cdFx0XHRzcHJpbmcuYXBwbHkoKVxuXG5cdCMjIyBTdGVwcyB0aGUgc3lzdGVtLiAjIyNcblx0c3RlcDogLT5cblxuXHRcdCMgSW5pdGlhbGlzZSB0aGUgY2xvY2sgb24gZmlyc3Qgc3RlcC5cblx0XHRAX2Nsb2NrID89IG5ldyBEYXRlKCkuZ2V0VGltZSgpXG5cblx0XHQjIENvbXB1dGUgZGVsdGEgdGltZSBzaW5jZSBsYXN0IHN0ZXAuXG5cdFx0dGltZSA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpXG5cdFx0ZGVsdGEgPSB0aW1lIC0gQF9jbG9ja1xuXG5cdFx0IyBObyBzdWZmaWNpZW50IGNoYW5nZS5cblx0XHRyZXR1cm4gaWYgZGVsdGEgPD0gMC4wXG5cblx0XHQjIENvbnZlcnQgdGltZSB0byBzZWNvbmRzLlxuXHRcdGRlbHRhICo9IDAuMDAxXG5cblx0XHQjIFVwZGF0ZSB0aGUgY2xvY2suXG5cdFx0QF9jbG9jayA9IHRpbWVcblxuXHRcdCMgSW5jcmVtZW50IHRpbWUgYnVmZmVyLlxuXHRcdEBfYnVmZmVyICs9IGRlbHRhXG5cblx0XHQjIEludGVncmF0ZSB1bnRpbCB0aGUgYnVmZmVyIGlzIGVtcHR5IG9yIHVudGlsIHRoZVxuXHRcdCMgbWF4aW11bSBhbW91bnQgb2YgaXRlcmF0aW9ucyBwZXIgc3RlcCBpcyByZWFjaGVkLlxuXG5cdFx0aSA9IDBcblxuXHRcdHdoaWxlIEBfYnVmZmVyID49IEB0aW1lc3RlcCBhbmQgKytpIDwgQF9tYXhTdGVwc1xuXG5cdFx0XHQjIEludGVncmF0ZSBtb3Rpb24gYnkgZml4ZWQgdGltZXN0ZXAuXG5cdFx0XHRAaW50ZWdyYXRlIEB0aW1lc3RlcFxuXG5cdFx0XHQjIFJlZHVjZSBidWZmZXIgYnkgb25lIHRpbWVzdGVwLlxuXHRcdFx0QF9idWZmZXIgLT0gQHRpbWVzdGVwXG5cblx0XHRcdCMgSW5jcmVtZW50IHJ1bm5pbmcgdGltZS5cblx0XHRcdEBfdGltZSArPSBAdGltZXN0ZXBcblxuXHRcdCMgU3RvcmUgc3RlcCB0aW1lIGZvciBkZWJ1Z2dpbmcuXG5cdFx0QF9zdGVwID0gbmV3IERhdGUoKS5nZXRUaW1lKCkgLSB0aW1lXG5cblx0IyMjIENsZWFuIHVwIGFmdGVyIHlvdXJzZWxmLiAjIyNcblx0ZGVzdHJveTogLT5cblxuXHRcdEBpbnRlZ3JhdG9yID0gbnVsbFxuXHRcdEBwYXJ0aWNsZXMgPSBudWxsXG5cdFx0QHNwcmluZ3MgPSBudWxsXG4iLCIjIyMgSW1wb3J0cyAjIyNcbntWZWN0b3J9ID0gcmVxdWlyZSAnY29mZmVlUGh5c2ljcy9tYXRoL1ZlY3RvcidcblxuIyMjIFBhcnRpY2xlICMjI1xuXG5jbGFzcyBleHBvcnRzLlBhcnRpY2xlXG5cblx0QEdVSUQgPSAwXG5cblx0Y29uc3RydWN0b3I6IChAbWFzcyA9IDEuMCkgLT5cblxuXHRcdCMgU2V0IGEgdW5pcXVlIGlkLlxuXHRcdEBpZCA9ICdwJyArIFBhcnRpY2xlLkdVSUQrK1xuXG5cdFx0IyBTZXQgaW5pdGlhbCBtYXNzLlxuXHRcdEBzZXRNYXNzIEBtYXNzXG5cblx0XHQjIFNldCBpbml0aWFsIHJhZGl1cy5cblx0XHRAc2V0UmFkaXVzIDEuMFxuXG5cdFx0IyBBcHBseSBmb3JjZXMuXG5cdFx0QGZpeGVkID0gZmFsc2VcblxuXHRcdCMgQmVoYXZpb3VycyB0byBiZSBhcHBsaWVkLlxuXHRcdEBiZWhhdmlvdXJzID0gW11cblxuXHRcdCMgQ3VycmVudCBwb3NpdGlvbi5cblx0XHRAcG9zID0gbmV3IFZlY3RvcigpXG5cblx0XHQjIEN1cnJlbnQgdmVsb2NpdHkuXG5cdFx0QHZlbCA9IG5ldyBWZWN0b3IoKVxuXG5cdFx0IyBDdXJyZW50IGZvcmNlLlxuXHRcdEBhY2MgPSBuZXcgVmVjdG9yKClcblxuXHRcdCMgUHJldmlvdXMgc3RhdGUuXG5cdFx0QG9sZCA9XG5cdFx0XHRwb3M6IG5ldyBWZWN0b3IoKVxuXHRcdFx0dmVsOiBuZXcgVmVjdG9yKClcblx0XHRcdGFjYzogbmV3IFZlY3RvcigpXG5cblx0IyMjIE1vdmVzIHRoZSBwYXJ0aWNsZSB0byBhIGdpdmVuIGxvY2F0aW9uIHZlY3Rvci4gIyMjXG5cdG1vdmVUbzogKHBvcykgLT5cblxuXHRcdEBwb3MuY29weSBwb3Ncblx0XHRAb2xkLnBvcy5jb3B5IHBvc1xuXG5cdCMjIyBTZXRzIHRoZSBtYXNzIG9mIHRoZSBwYXJ0aWNsZS4gIyMjXG5cdHNldE1hc3M6IChAbWFzcyA9IDEuMCkgLT5cblxuXHRcdCMgVGhlIGludmVyc2UgbWFzcy5cblx0XHRAbWFzc0ludiA9IDEuMCAvIEBtYXNzXG5cblx0IyMjIFNldHMgdGhlIHJhZGl1cyBvZiB0aGUgcGFydGljbGUuICMjI1xuXHRzZXRSYWRpdXM6IChAcmFkaXVzID0gMS4wKSAtPlxuXG5cdFx0QHJhZGl1c1NxID0gQHJhZGl1cyAqIEByYWRpdXNcblxuXHQjIyMgQXBwbGllcyBhbGwgYmVoYXZpb3VycyB0byBkZXJpdmUgbmV3IGZvcmNlLiAjIyNcblx0dXBkYXRlOiAoZHQsIGluZGV4KSAtPlxuXG5cdFx0IyBBcHBseSBhbGwgYmVoYXZpb3Vycy5cblxuXHRcdGlmIG5vdCBAZml4ZWRcblxuXHRcdFx0Zm9yIGJlaGF2aW91ciBpbiBAYmVoYXZpb3Vyc1xuXG5cdFx0XHRcdGJlaGF2aW91ci5hcHBseSBALCBkdCwgaW5kZXhcbiIsIiMjIyBXZWJHTCBSZW5kZXJlciAjIyNcblxuY2xhc3MgV2ViR0xSZW5kZXJlciBleHRlbmRzIFJlbmRlcmVyXG5cbiAgICAjIFBhcnRpY2xlIHZlcnRleCBzaGFkZXIgc291cmNlLlxuICAgIEBQQVJUSUNMRV9WUyA9ICcnJ1xuXG4gICAgICAgIHVuaWZvcm0gdmVjMiB2aWV3cG9ydDtcbiAgICAgICAgYXR0cmlidXRlIHZlYzMgcG9zaXRpb247XG4gICAgICAgIGF0dHJpYnV0ZSBmbG9hdCByYWRpdXM7XG4gICAgICAgIGF0dHJpYnV0ZSB2ZWM0IGNvbG91cjtcbiAgICAgICAgdmFyeWluZyB2ZWM0IHRpbnQ7XG5cbiAgICAgICAgdm9pZCBtYWluKCkge1xuXG4gICAgICAgICAgICAvLyBjb252ZXJ0IHRoZSByZWN0YW5nbGUgZnJvbSBwaXhlbHMgdG8gMC4wIHRvIDEuMFxuICAgICAgICAgICAgdmVjMiB6ZXJvVG9PbmUgPSBwb3NpdGlvbi54eSAvIHZpZXdwb3J0O1xuICAgICAgICAgICAgemVyb1RvT25lLnkgPSAxLjAgLSB6ZXJvVG9PbmUueTtcblxuICAgICAgICAgICAgLy8gY29udmVydCBmcm9tIDAtPjEgdG8gMC0+MlxuICAgICAgICAgICAgdmVjMiB6ZXJvVG9Ud28gPSB6ZXJvVG9PbmUgKiAyLjA7XG5cbiAgICAgICAgICAgIC8vIGNvbnZlcnQgZnJvbSAwLT4yIHRvIC0xLT4rMSAoY2xpcHNwYWNlKVxuICAgICAgICAgICAgdmVjMiBjbGlwU3BhY2UgPSB6ZXJvVG9Ud28gLSAxLjA7XG5cbiAgICAgICAgICAgIHRpbnQgPSBjb2xvdXI7XG5cbiAgICAgICAgICAgIGdsX1Bvc2l0aW9uID0gdmVjNChjbGlwU3BhY2UsIDAsIDEpO1xuICAgICAgICAgICAgZ2xfUG9pbnRTaXplID0gcmFkaXVzICogMi4wO1xuICAgICAgICB9XG4gICAgJycnXG5cbiAgICAjIFBhcnRpY2xlIGZyYWdlbnQgc2hhZGVyIHNvdXJjZS5cbiAgICBAUEFSVElDTEVfRlMgPSAnJydcblxuICAgICAgICBwcmVjaXNpb24gbWVkaXVtcCBmbG9hdDtcbiAgICAgICAgXG4gICAgICAgIHVuaWZvcm0gc2FtcGxlcjJEIHRleHR1cmU7XG4gICAgICAgIHZhcnlpbmcgdmVjNCB0aW50O1xuXG4gICAgICAgIHZvaWQgbWFpbigpIHtcbiAgICAgICAgICAgIGdsX0ZyYWdDb2xvciA9IHRleHR1cmUyRCh0ZXh0dXJlLCBnbF9Qb2ludENvb3JkKSAqIHRpbnQ7XG4gICAgICAgIH1cbiAgICAnJydcblxuICAgICMgU3ByaW5nIHZlcnRleCBzaGFkZXIgc291cmNlLlxuICAgIEBTUFJJTkdfVlMgPSAnJydcblxuICAgICAgICB1bmlmb3JtIHZlYzIgdmlld3BvcnQ7XG4gICAgICAgIGF0dHJpYnV0ZSB2ZWMzIHBvc2l0aW9uO1xuXG4gICAgICAgIHZvaWQgbWFpbigpIHtcblxuICAgICAgICAgICAgLy8gY29udmVydCB0aGUgcmVjdGFuZ2xlIGZyb20gcGl4ZWxzIHRvIDAuMCB0byAxLjBcbiAgICAgICAgICAgIHZlYzIgemVyb1RvT25lID0gcG9zaXRpb24ueHkgLyB2aWV3cG9ydDtcbiAgICAgICAgICAgIHplcm9Ub09uZS55ID0gMS4wIC0gemVyb1RvT25lLnk7XG5cbiAgICAgICAgICAgIC8vIGNvbnZlcnQgZnJvbSAwLT4xIHRvIDAtPjJcbiAgICAgICAgICAgIHZlYzIgemVyb1RvVHdvID0gemVyb1RvT25lICogMi4wO1xuXG4gICAgICAgICAgICAvLyBjb252ZXJ0IGZyb20gMC0+MiB0byAtMS0+KzEgKGNsaXBzcGFjZSlcbiAgICAgICAgICAgIHZlYzIgY2xpcFNwYWNlID0gemVyb1RvVHdvIC0gMS4wO1xuXG4gICAgICAgICAgICBnbF9Qb3NpdGlvbiA9IHZlYzQoY2xpcFNwYWNlLCAwLCAxKTtcbiAgICAgICAgfVxuICAgICcnJ1xuXG4gICAgIyBTcHJpbmcgZnJhZ2VudCBzaGFkZXIgc291cmNlLlxuICAgIEBTUFJJTkdfRlMgPSAnJydcblxuICAgICAgICB2b2lkIG1haW4oKSB7XG4gICAgICAgICAgICBnbF9GcmFnQ29sb3IgPSB2ZWM0KDEuMCwgMS4wLCAxLjAsIDAuMSk7XG4gICAgICAgIH1cbiAgICAnJydcblxuICAgIGNvbnN0cnVjdG9yOiAoQHVzZVBvaW50U3ByaXRlcyA9IHRydWUpIC0+XG5cbiAgICAgICAgc3VwZXJcblxuICAgICAgICBAcGFydGljbGVQb3NpdGlvbkJ1ZmZlciA9IG51bGxcbiAgICAgICAgQHBhcnRpY2xlUmFkaXVzQnVmZmVyID0gbnVsbFxuICAgICAgICBAcGFydGljbGVDb2xvdXJCdWZmZXIgPSBudWxsXG4gICAgICAgIEBwYXJ0aWNsZVRleHR1cmUgPSBudWxsXG4gICAgICAgIEBwYXJ0aWNsZVNoYWRlciA9IG51bGxcblxuICAgICAgICBAc3ByaW5nUG9zaXRpb25CdWZmZXIgPSBudWxsXG4gICAgICAgIEBzcHJpbmdTaGFkZXIgPSBudWxsXG5cbiAgICAgICAgQGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQgJ2NhbnZhcydcbiAgICAgICAgXG4gICAgICAgICMgSW5pdCBXZWJHTC5cbiAgICAgICAgdHJ5IEBnbCA9IEBjYW52YXMuZ2V0Q29udGV4dCAnZXhwZXJpbWVudGFsLXdlYmdsJyBjYXRjaCBlcnJvclxuICAgICAgICBmaW5hbGx5IHJldHVybiBuZXcgQ2FudmFzUmVuZGVyZXIoKSBpZiBub3QgQGdsXG5cbiAgICAgICAgIyBTZXQgdGhlIERPTSBlbGVtZW50LlxuICAgICAgICBAZG9tRWxlbWVudCA9IEBjYW52YXNcblxuICAgIGluaXQ6IChwaHlzaWNzKSAtPlxuXG4gICAgICAgIHN1cGVyIHBoeXNpY3NcblxuICAgICAgICBAaW5pdFNoYWRlcnMoKVxuICAgICAgICBAaW5pdEJ1ZmZlcnMgcGh5c2ljc1xuXG4gICAgICAgICMgQ3JlYXRlIHBhcnRpY2xlIHRleHR1cmUgZnJvbSBjYW52YXMuXG4gICAgICAgIEBwYXJ0aWNsZVRleHR1cmUgPSBkbyBAY3JlYXRlUGFydGljbGVUZXh0dXJlRGF0YVxuXG4gICAgICAgICMgVXNlIGFkZGl0aXZlIGJsZW5kaW5nLlxuICAgICAgICBAZ2wuYmxlbmRGdW5jIEBnbC5TUkNfQUxQSEEsIEBnbC5PTkVcblxuICAgICAgICAjIEVuYWJsZSB0aGUgb3RoZXIgc2hpdCB3ZSBuZWVkIGZyb20gV2ViR0wuXG4gICAgICAgICNAZ2wuZW5hYmxlIEBnbC5WRVJURVhfUFJPR1JBTV9QT0lOVF9TSVpFXG4gICAgICAgICNAZ2wuZW5hYmxlIEBnbC5URVhUVVJFXzJEXG4gICAgICAgIEBnbC5lbmFibGUgQGdsLkJMRU5EXG5cbiAgICBpbml0U2hhZGVyczogLT5cblxuICAgICAgICAjIENyZWF0ZSBzaGFkZXJzLlxuICAgICAgICBAcGFydGljbGVTaGFkZXIgPSBAY3JlYXRlU2hhZGVyUHJvZ3JhbSBXZWJHTFJlbmRlcmVyLlBBUlRJQ0xFX1ZTLCBXZWJHTFJlbmRlcmVyLlBBUlRJQ0xFX0ZTXG4gICAgICAgIEBzcHJpbmdTaGFkZXIgPSBAY3JlYXRlU2hhZGVyUHJvZ3JhbSBXZWJHTFJlbmRlcmVyLlNQUklOR19WUywgV2ViR0xSZW5kZXJlci5TUFJJTkdfRlNcblxuICAgICAgICAjIFN0b3JlIHBhcnRpY2xlIHNoYWRlciB1bmlmb3JtIGxvY2F0aW9ucy5cbiAgICAgICAgQHBhcnRpY2xlU2hhZGVyLnVuaWZvcm1zID1cbiAgICAgICAgICAgIHZpZXdwb3J0OiBAZ2wuZ2V0VW5pZm9ybUxvY2F0aW9uIEBwYXJ0aWNsZVNoYWRlciwgJ3ZpZXdwb3J0J1xuXG4gICAgICAgICMgU3RvcmUgc3ByaW5nIHNoYWRlciB1bmlmb3JtIGxvY2F0aW9ucy5cbiAgICAgICAgQHNwcmluZ1NoYWRlci51bmlmb3JtcyA9XG4gICAgICAgICAgICB2aWV3cG9ydDogQGdsLmdldFVuaWZvcm1Mb2NhdGlvbiBAc3ByaW5nU2hhZGVyLCAndmlld3BvcnQnXG5cbiAgICAgICAgIyBTdG9yZSBwYXJ0aWNsZSBzaGFkZXIgYXR0cmlidXRlIGxvY2F0aW9ucy5cbiAgICAgICAgQHBhcnRpY2xlU2hhZGVyLmF0dHJpYnV0ZXMgPVxuICAgICAgICAgICAgcG9zaXRpb246IEBnbC5nZXRBdHRyaWJMb2NhdGlvbiBAcGFydGljbGVTaGFkZXIsICdwb3NpdGlvbidcbiAgICAgICAgICAgIHJhZGl1czogQGdsLmdldEF0dHJpYkxvY2F0aW9uIEBwYXJ0aWNsZVNoYWRlciwgJ3JhZGl1cydcbiAgICAgICAgICAgIGNvbG91cjogQGdsLmdldEF0dHJpYkxvY2F0aW9uIEBwYXJ0aWNsZVNoYWRlciwgJ2NvbG91cidcblxuICAgICAgICAjIFN0b3JlIHNwcmluZyBzaGFkZXIgYXR0cmlidXRlIGxvY2F0aW9ucy5cbiAgICAgICAgQHNwcmluZ1NoYWRlci5hdHRyaWJ1dGVzID1cbiAgICAgICAgICAgIHBvc2l0aW9uOiBAZ2wuZ2V0QXR0cmliTG9jYXRpb24gQHNwcmluZ1NoYWRlciwgJ3Bvc2l0aW9uJ1xuXG4gICAgICAgIGNvbnNvbGUubG9nIEBwYXJ0aWNsZVNoYWRlclxuXG4gICAgaW5pdEJ1ZmZlcnM6IChwaHlzaWNzKSAtPlxuXG4gICAgICAgIGNvbG91cnMgPSBbXVxuICAgICAgICByYWRpaSA9IFtdXG5cbiAgICAgICAgIyBDcmVhdGUgYnVmZmVycy5cbiAgICAgICAgQHBhcnRpY2xlUG9zaXRpb25CdWZmZXIgPSBkbyBAZ2wuY3JlYXRlQnVmZmVyXG4gICAgICAgIEBzcHJpbmdQb3NpdGlvbkJ1ZmZlciA9IGRvIEBnbC5jcmVhdGVCdWZmZXJcbiAgICAgICAgQHBhcnRpY2xlQ29sb3VyQnVmZmVyID0gZG8gQGdsLmNyZWF0ZUJ1ZmZlclxuICAgICAgICBAcGFydGljbGVSYWRpdXNCdWZmZXIgPSBkbyBAZ2wuY3JlYXRlQnVmZmVyXG5cbiAgICAgICAgIyBDcmVhdGUgYXR0cmlidXRlIGFycmF5cy5cbiAgICAgICAgZm9yIHBhcnRpY2xlIGluIHBoeXNpY3MucGFydGljbGVzXG5cbiAgICAgICAgICAgICMgQnJlYWsgdGhlIGNvbG91ciBzdHJpbmcgaW50byBSR0JBIGNvbXBvbmVudHMuXG4gICAgICAgICAgICByZ2JhID0gKHBhcnRpY2xlLmNvbG91ciBvciAnI0ZGRkZGRicpLm1hdGNoKC9bXFxkQS1GXXsyfS9naSlcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgIyBQYXJzZSBpbnRvIGludGVnZXJzLlxuICAgICAgICAgICAgciA9IChwYXJzZUludCByZ2JhWzBdLCAxNikgb3IgMjU1XG4gICAgICAgICAgICBnID0gKHBhcnNlSW50IHJnYmFbMV0sIDE2KSBvciAyNTVcbiAgICAgICAgICAgIGIgPSAocGFyc2VJbnQgcmdiYVsyXSwgMTYpIG9yIDI1NVxuICAgICAgICAgICAgYSA9IChwYXJzZUludCByZ2JhWzNdLCAxNikgb3IgMjU1XG5cbiAgICAgICAgICAgICMgUHJlcGFyZSBmb3IgYWRkaW5nIHRvIHRoZSBjb2xvdXIgYnVmZmVyLlxuICAgICAgICAgICAgY29sb3Vycy5wdXNoIHIgLyAyNTUsIGcgLyAyNTUsIGIgLyAyNTUsIGEgLyAyNTVcblxuICAgICAgICAgICAgIyBQcmVwYXJlIGZvciBhZGRpbmcgdG8gdGhlIHJhZGl1cyBidWZmZXIuXG4gICAgICAgICAgICByYWRpaS5wdXNoIHBhcnRpY2xlLnJhZGl1cyBvciAzMlxuXG4gICAgICAgICMgSW5pdCBQYXJ0aWNsZSBjb2xvdXIgYnVmZmVyLlxuICAgICAgICBAZ2wuYmluZEJ1ZmZlciBAZ2wuQVJSQVlfQlVGRkVSLCBAcGFydGljbGVDb2xvdXJCdWZmZXJcbiAgICAgICAgQGdsLmJ1ZmZlckRhdGEgQGdsLkFSUkFZX0JVRkZFUiwgbmV3IEZsb2F0MzJBcnJheShjb2xvdXJzKSwgQGdsLlNUQVRJQ19EUkFXXG5cbiAgICAgICAgIyBJbml0IFBhcnRpY2xlIHJhZGl1cyBidWZmZXIuXG4gICAgICAgIEBnbC5iaW5kQnVmZmVyIEBnbC5BUlJBWV9CVUZGRVIsIEBwYXJ0aWNsZVJhZGl1c0J1ZmZlclxuICAgICAgICBAZ2wuYnVmZmVyRGF0YSBAZ2wuQVJSQVlfQlVGRkVSLCBuZXcgRmxvYXQzMkFycmF5KHJhZGlpKSwgQGdsLlNUQVRJQ19EUkFXXG5cbiAgICAgICAgIyMgY29uc29sZS5sb2cgQHBhcnRpY2xlQ29sb3VyQnVmZmVyXG5cbiAgICAjIENyZWF0ZXMgYSBnZW5lcmljIHRleHR1cmUgZm9yIHBhcnRpY2xlcy5cbiAgICBjcmVhdGVQYXJ0aWNsZVRleHR1cmVEYXRhOiAoc2l6ZSA9IDEyOCkgLT5cbiAgICAgICAgXG4gICAgICAgIGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQgJ2NhbnZhcydcbiAgICAgICAgY2FudmFzLndpZHRoID0gY2FudmFzLmhlaWdodCA9IHNpemVcbiAgICAgICAgY3R4ID0gY2FudmFzLmdldENvbnRleHQgJzJkJ1xuICAgICAgICByYWQgPSBzaXplICogMC41XG4gICAgICAgIFxuICAgICAgICBjdHguYmVnaW5QYXRoKClcbiAgICAgICAgY3R4LmFyYyByYWQsIHJhZCwgcmFkLCAwLCBNYXRoLlBJICogMiwgZmFsc2VcbiAgICAgICAgY3R4LmNsb3NlUGF0aCgpXG5cbiAgICAgICAgY3R4LmZpbGxTdHlsZSA9ICcjRkZGJ1xuICAgICAgICBjdHguZmlsbCgpXG5cbiAgICAgICAgdGV4dHVyZSA9IEBnbC5jcmVhdGVUZXh0dXJlKClcbiAgICAgICAgQHNldHVwVGV4dHVyZSB0ZXh0dXJlLCBjYW52YXNcblxuICAgICAgICB0ZXh0dXJlXG5cbiAgICAjIENyZWF0ZXMgYSBXZWJHTCB0ZXh0dXJlIGZyb20gYW4gaW1hZ2UgcGF0aCBvciBkYXRhLlxuICAgIGxvYWRUZXh0dXJlOiAoc291cmNlKSAtPlxuXG4gICAgICAgIHRleHR1cmUgPSBAZ2wuY3JlYXRlVGV4dHVyZSgpXG4gICAgICAgIHRleHR1cmUuaW1hZ2UgPSBuZXcgSW1hZ2UoKVxuXG4gICAgICAgIHRleHR1cmUuaW1hZ2Uub25sb2FkID0gPT5cblxuICAgICAgICAgICAgQHNldHVwVGV4dHVyZSB0ZXh0dXJlLCB0ZXh0dXJlLmltYWdlXG4gICAgICAgIFxuICAgICAgICB0ZXh0dXJlLmltYWdlLnNyYyA9IHNvdXJjZVxuICAgICAgICB0ZXh0dXJlXG5cbiAgICBzZXR1cFRleHR1cmU6ICh0ZXh0dXJlLCBkYXRhKSAtPlxuXG4gICAgICAgIEBnbC5iaW5kVGV4dHVyZSBAZ2wuVEVYVFVSRV8yRCwgdGV4dHVyZVxuICAgICAgICBAZ2wudGV4SW1hZ2UyRCBAZ2wuVEVYVFVSRV8yRCwgMCwgQGdsLlJHQkEsIEBnbC5SR0JBLCBAZ2wuVU5TSUdORURfQllURSwgZGF0YVxuICAgICAgICBAZ2wudGV4UGFyYW1ldGVyaSBAZ2wuVEVYVFVSRV8yRCwgQGdsLlRFWFRVUkVfTUlOX0ZJTFRFUiwgQGdsLkxJTkVBUlxuICAgICAgICBAZ2wudGV4UGFyYW1ldGVyaSBAZ2wuVEVYVFVSRV8yRCwgQGdsLlRFWFRVUkVfTUFHX0ZJTFRFUiwgQGdsLkxJTkVBUlxuICAgICAgICBAZ2wudGV4UGFyYW1ldGVyaSBAZ2wuVEVYVFVSRV8yRCwgQGdsLlRFWFRVUkVfV1JBUF9TLCBAZ2wuQ0xBTVBfVE9fRURHRVxuICAgICAgICBAZ2wudGV4UGFyYW1ldGVyaSBAZ2wuVEVYVFVSRV8yRCwgQGdsLlRFWFRVUkVfV1JBUF9ULCBAZ2wuQ0xBTVBfVE9fRURHRVxuICAgICAgICBAZ2wuZ2VuZXJhdGVNaXBtYXAgQGdsLlRFWFRVUkVfMkRcbiAgICAgICAgQGdsLmJpbmRUZXh0dXJlIEBnbC5URVhUVVJFXzJELCBudWxsXG5cbiAgICAgICAgdGV4dHVyZVxuXG4gICAgIyBDcmVhdGVzIGEgc2hhZGVyIHByb2dyYW0gZnJvbSB2ZXJ0ZXggYW5kIGZyYWdtZW50IHNoYWRlciBzb3VyY2VzLlxuICAgIGNyZWF0ZVNoYWRlclByb2dyYW06IChfdnMsIF9mcykgLT5cblxuICAgICAgICB2cyA9IEBnbC5jcmVhdGVTaGFkZXIgQGdsLlZFUlRFWF9TSEFERVJcbiAgICAgICAgZnMgPSBAZ2wuY3JlYXRlU2hhZGVyIEBnbC5GUkFHTUVOVF9TSEFERVJcblxuICAgICAgICBAZ2wuc2hhZGVyU291cmNlIHZzLCBfdnNcbiAgICAgICAgQGdsLnNoYWRlclNvdXJjZSBmcywgX2ZzXG5cbiAgICAgICAgQGdsLmNvbXBpbGVTaGFkZXIgdnNcbiAgICAgICAgQGdsLmNvbXBpbGVTaGFkZXIgZnNcblxuICAgICAgICBpZiBub3QgQGdsLmdldFNoYWRlclBhcmFtZXRlciB2cywgQGdsLkNPTVBJTEVfU1RBVFVTXG4gICAgICAgICAgICBhbGVydCBAZ2wuZ2V0U2hhZGVySW5mb0xvZyB2c1xuICAgICAgICAgICAgbnVsbFxuXG4gICAgICAgIGlmIG5vdCBAZ2wuZ2V0U2hhZGVyUGFyYW1ldGVyIGZzLCBAZ2wuQ09NUElMRV9TVEFUVVNcbiAgICAgICAgICAgIGFsZXJ0IEBnbC5nZXRTaGFkZXJJbmZvTG9nIGZzXG4gICAgICAgICAgICBudWxsXG5cbiAgICAgICAgcHJvZyA9IGRvIEBnbC5jcmVhdGVQcm9ncmFtXG5cbiAgICAgICAgQGdsLmF0dGFjaFNoYWRlciBwcm9nLCB2c1xuICAgICAgICBAZ2wuYXR0YWNoU2hhZGVyIHByb2csIGZzXG4gICAgICAgIEBnbC5saW5rUHJvZ3JhbSBwcm9nXG5cbiAgICAgICAgIyMgY29uc29sZS5sb2cgJ1ZlcnRleCBTaGFkZXIgQ29tcGlsZWQnLCBAZ2wuZ2V0U2hhZGVyUGFyYW1ldGVyIHZzLCBAZ2wuQ09NUElMRV9TVEFUVVNcbiAgICAgICAgIyMgY29uc29sZS5sb2cgJ0ZyYWdtZW50IFNoYWRlciBDb21waWxlZCcsIEBnbC5nZXRTaGFkZXJQYXJhbWV0ZXIgZnMsIEBnbC5DT01QSUxFX1NUQVRVU1xuICAgICAgICAjIyBjb25zb2xlLmxvZyAnUHJvZ3JhbSBMaW5rZWQnLCBAZ2wuZ2V0UHJvZ3JhbVBhcmFtZXRlciBwcm9nLCBAZ2wuTElOS19TVEFUVVNcblxuICAgICAgICBwcm9nXG5cbiAgICAjIFNldHMgdGhlIHNpemUgb2YgdGhlIHZpZXdwb3J0LlxuICAgIHNldFNpemU6IChAd2lkdGgsIEBoZWlnaHQpID0+XG5cbiAgICAgICAgIyMgY29uc29sZS5sb2cgJ3Jlc2l6ZScsIEB3aWR0aCwgQGhlaWdodFxuXG4gICAgICAgIHN1cGVyIEB3aWR0aCwgQGhlaWdodFxuXG4gICAgICAgIEBjYW52YXMud2lkdGggPSBAd2lkdGhcbiAgICAgICAgQGNhbnZhcy5oZWlnaHQgPSBAaGVpZ2h0XG4gICAgICAgIEBnbC52aWV3cG9ydCAwLCAwLCBAd2lkdGgsIEBoZWlnaHRcblxuICAgICAgICAjIFVwZGF0ZSBzaGFkZXIgdW5pZm9ybXMuXG4gICAgICAgIEBnbC51c2VQcm9ncmFtIEBwYXJ0aWNsZVNoYWRlclxuICAgICAgICBAZ2wudW5pZm9ybTJmdiBAcGFydGljbGVTaGFkZXIudW5pZm9ybXMudmlld3BvcnQsIG5ldyBGbG9hdDMyQXJyYXkgW0B3aWR0aCwgQGhlaWdodF1cblxuICAgICAgICAjIFVwZGF0ZSBzaGFkZXIgdW5pZm9ybXMuXG4gICAgICAgIEBnbC51c2VQcm9ncmFtIEBzcHJpbmdTaGFkZXJcbiAgICAgICAgQGdsLnVuaWZvcm0yZnYgQHNwcmluZ1NoYWRlci51bmlmb3Jtcy52aWV3cG9ydCwgbmV3IEZsb2F0MzJBcnJheSBbQHdpZHRoLCBAaGVpZ2h0XVxuXG4gICAgIyBSZW5kZXJzIHRoZSBjdXJyZW50IHBoeXNpY3Mgc3RhdGUuXG4gICAgcmVuZGVyOiAocGh5c2ljcykgLT5cblxuICAgICAgICBzdXBlclxuXG4gICAgICAgICMgQ2xlYXIgdGhlIHZpZXdwb3J0LlxuICAgICAgICBAZ2wuY2xlYXIgQGdsLkNPTE9SX0JVRkZFUl9CSVQgfCBAZ2wuREVQVEhfQlVGRkVSX0JJVFxuXG4gICAgICAgICMgRHJhdyBwYXJ0aWNsZXMuXG4gICAgICAgIGlmIEByZW5kZXJQYXJ0aWNsZXNcblxuICAgICAgICAgICAgdmVydGljZXMgPSBbXVxuXG4gICAgICAgICAgICAjIFVwZGF0ZSBwYXJ0aWNsZSBwb3NpdGlvbnMuXG4gICAgICAgICAgICBmb3IgcCBpbiBwaHlzaWNzLnBhcnRpY2xlc1xuICAgICAgICAgICAgICAgIHZlcnRpY2VzLnB1c2ggcC5wb3MueCwgcC5wb3MueSwgMC4wXG5cbiAgICAgICAgICAgICMgQmluZCB0aGUgcGFydGljbGUgdGV4dHVyZS5cbiAgICAgICAgICAgIEBnbC5hY3RpdmVUZXh0dXJlIEBnbC5URVhUVVJFMFxuICAgICAgICAgICAgQGdsLmJpbmRUZXh0dXJlIEBnbC5URVhUVVJFXzJELCBAcGFydGljbGVUZXh0dXJlXG5cbiAgICAgICAgICAgICMgVXNlIHRoZSBwYXJ0aWNsZSBwcm9ncmFtLlxuICAgICAgICAgICAgQGdsLnVzZVByb2dyYW0gQHBhcnRpY2xlU2hhZGVyXG5cbiAgICAgICAgICAgICMgU2V0dXAgdmVydGljZXMuXG4gICAgICAgICAgICBAZ2wuYmluZEJ1ZmZlciBAZ2wuQVJSQVlfQlVGRkVSLCBAcGFydGljbGVQb3NpdGlvbkJ1ZmZlclxuICAgICAgICAgICAgQGdsLmJ1ZmZlckRhdGEgQGdsLkFSUkFZX0JVRkZFUiwgbmV3IEZsb2F0MzJBcnJheSh2ZXJ0aWNlcyksIEBnbC5TVEFUSUNfRFJBV1xuICAgICAgICAgICAgQGdsLnZlcnRleEF0dHJpYlBvaW50ZXIgQHBhcnRpY2xlU2hhZGVyLmF0dHJpYnV0ZXMucG9zaXRpb24sIDMsIEBnbC5GTE9BVCwgZmFsc2UsIDAsIDBcbiAgICAgICAgICAgIEBnbC5lbmFibGVWZXJ0ZXhBdHRyaWJBcnJheSBAcGFydGljbGVTaGFkZXIuYXR0cmlidXRlcy5wb3NpdGlvblxuXG4gICAgICAgICAgICAjIFNldHVwIGNvbG91cnMuXG4gICAgICAgICAgICBAZ2wuYmluZEJ1ZmZlciBAZ2wuQVJSQVlfQlVGRkVSLCBAcGFydGljbGVDb2xvdXJCdWZmZXJcbiAgICAgICAgICAgIEBnbC5lbmFibGVWZXJ0ZXhBdHRyaWJBcnJheSBAcGFydGljbGVTaGFkZXIuYXR0cmlidXRlcy5jb2xvdXJcbiAgICAgICAgICAgIEBnbC52ZXJ0ZXhBdHRyaWJQb2ludGVyIEBwYXJ0aWNsZVNoYWRlci5hdHRyaWJ1dGVzLmNvbG91ciwgNCwgQGdsLkZMT0FULCBmYWxzZSwgMCwgMFxuXG4gICAgICAgICAgICAjIFNldHVwIHJhZGlpLlxuICAgICAgICAgICAgQGdsLmJpbmRCdWZmZXIgQGdsLkFSUkFZX0JVRkZFUiwgQHBhcnRpY2xlUmFkaXVzQnVmZmVyXG4gICAgICAgICAgICBAZ2wuZW5hYmxlVmVydGV4QXR0cmliQXJyYXkgQHBhcnRpY2xlU2hhZGVyLmF0dHJpYnV0ZXMucmFkaXVzXG4gICAgICAgICAgICBAZ2wudmVydGV4QXR0cmliUG9pbnRlciBAcGFydGljbGVTaGFkZXIuYXR0cmlidXRlcy5yYWRpdXMsIDEsIEBnbC5GTE9BVCwgZmFsc2UsIDAsIDBcblxuICAgICAgICAgICAgIyBEcmF3IHBhcnRpY2xlcy5cbiAgICAgICAgICAgIEBnbC5kcmF3QXJyYXlzIEBnbC5QT0lOVFMsIDAsIHZlcnRpY2VzLmxlbmd0aCAvIDNcblxuICAgICAgICAjIERyYXcgc3ByaW5ncy5cbiAgICAgICAgaWYgQHJlbmRlclNwcmluZ3MgYW5kIHBoeXNpY3Muc3ByaW5ncy5sZW5ndGggPiAwXG5cbiAgICAgICAgICAgIHZlcnRpY2VzID0gW11cblxuICAgICAgICAgICAgIyBVcGRhdGUgc3ByaW5nIHBvc2l0aW9ucy5cbiAgICAgICAgICAgIGZvciBzIGluIHBoeXNpY3Muc3ByaW5nc1xuICAgICAgICAgICAgICAgIHZlcnRpY2VzLnB1c2ggcy5wMS5wb3MueCwgcy5wMS5wb3MueSwgMC4wXG4gICAgICAgICAgICAgICAgdmVydGljZXMucHVzaCBzLnAyLnBvcy54LCBzLnAyLnBvcy55LCAwLjBcblxuICAgICAgICAgICAgIyBVc2UgdGhlIHNwcmluZyBwcm9ncmFtLlxuICAgICAgICAgICAgQGdsLnVzZVByb2dyYW0gQHNwcmluZ1NoYWRlclxuXG4gICAgICAgICAgICAjIFNldHVwIHZlcnRpY2VzLlxuICAgICAgICAgICAgQGdsLmJpbmRCdWZmZXIgQGdsLkFSUkFZX0JVRkZFUiwgQHNwcmluZ1Bvc2l0aW9uQnVmZmVyXG4gICAgICAgICAgICBAZ2wuYnVmZmVyRGF0YSBAZ2wuQVJSQVlfQlVGRkVSLCBuZXcgRmxvYXQzMkFycmF5KHZlcnRpY2VzKSwgQGdsLlNUQVRJQ19EUkFXXG4gICAgICAgICAgICBAZ2wudmVydGV4QXR0cmliUG9pbnRlciBAc3ByaW5nU2hhZGVyLmF0dHJpYnV0ZXMucG9zaXRpb24sIDMsIEBnbC5GTE9BVCwgZmFsc2UsIDAsIDBcbiAgICAgICAgICAgIEBnbC5lbmFibGVWZXJ0ZXhBdHRyaWJBcnJheSBAc3ByaW5nU2hhZGVyLmF0dHJpYnV0ZXMucG9zaXRpb25cblxuICAgICAgICAgICAgIyBEcmF3IHNwcmluZ3MuXG4gICAgICAgICAgICBAZ2wuZHJhd0FycmF5cyBAZ2wuTElORVMsIDAsIHZlcnRpY2VzLmxlbmd0aCAvIDNcblxuICAgIGRlc3Ryb3k6IC0+XG5cbiAgICAgICAgIyMgY29uc29sZS5sb2cgJ0Rlc3Ryb3knXG4iLCIjIyMgQmFzZSBSZW5kZXJlciAjIyNcbmNsYXNzIFJlbmRlcmVyXG5cbiAgICBjb25zdHJ1Y3RvcjogLT5cblxuICAgICAgICBAd2lkdGggPSAwXG4gICAgICAgIEBoZWlnaHQgPSAwXG5cbiAgICAgICAgQHJlbmRlclBhcnRpY2xlcyA9IHRydWVcbiAgICAgICAgQHJlbmRlclNwcmluZ3MgPSB0cnVlXG4gICAgICAgIEByZW5kZXJNb3VzZSA9IHRydWVcbiAgICAgICAgQGluaXRpYWxpemVkID0gZmFsc2VcbiAgICAgICAgQHJlbmRlclRpbWUgPSAwXG5cbiAgICBpbml0OiAocGh5c2ljcykgLT5cblxuICAgICAgICBAaW5pdGlhbGl6ZWQgPSB0cnVlXG5cbiAgICByZW5kZXI6IChwaHlzaWNzKSAtPlxuXG4gICAgICAgIGlmIG5vdCBAaW5pdGlhbGl6ZWQgdGhlbiBAaW5pdCBwaHlzaWNzXG5cbiAgICBzZXRTaXplOiAoQHdpZHRoLCBAaGVpZ2h0KSA9PlxuXG4gICAgZGVzdHJveTogLT5cblxuICAgICAgICBcbiIsIiMjIyBET00gUmVuZGVyZXIgIyMjXG4jIyNcblxuXHRVcGRhdGluZyBzdHlsZXM6XG5cblx0Tm9kZXNcblxuIyMjXG5jbGFzcyBET01SZW5kZXJlciBleHRlbmRzIFJlbmRlcmVyXG5cblx0Y29uc3RydWN0b3I6IC0+XG5cblx0XHRzdXBlclxuXG5cdFx0QHVzZUdQVSA9IHllc1xuXHRcdFxuXHRcdEBkb21FbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCAnZGl2J1xuXHRcdEBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50ICdjYW52YXMnXG5cdFx0QGN0eCA9IEBjYW52YXMuZ2V0Q29udGV4dCAnMmQnXG5cblx0XHRAY2FudmFzLnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJ1xuXHRcdEBjYW52YXMuc3R5bGUubGVmdCA9IDBcblx0XHRAY2FudmFzLnN0eWxlLnRvcCA9IDBcblxuXHRcdEBkb21FbGVtZW50LnN0eWxlLnBvaW50ZXJFdmVudHMgPSAnbm9uZSdcblx0XHRAZG9tRWxlbWVudC5hcHBlbmRDaGlsZCBAY2FudmFzXG5cblx0aW5pdDogKHBoeXNpY3MpIC0+XG5cblx0XHRzdXBlciBwaHlzaWNzXG5cblx0XHQjIFNldCB1cCBwYXJ0aWNsZSBET00gZWxlbWVudHNcblx0XHRmb3IgcCBpbiBwaHlzaWNzLnBhcnRpY2xlc1xuXG5cdFx0XHRlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQgJ3NwYW4nXG5cdFx0XHRzdCA9IGVsLnN0eWxlXG5cblx0XHRcdHN0LmJhY2tncm91bmRDb2xvciA9IHAuY29sb3VyXG5cdFx0XHRzdC5ib3JkZXJSYWRpdXMgPSBwLnJhZGl1c1xuXHRcdFx0c3QubWFyZ2luTGVmdCA9IC1wLnJhZGl1c1xuXHRcdFx0c3QubWFyZ2luVG9wID0gLXAucmFkaXVzXG5cdFx0XHRzdC5wb3NpdGlvbiA9ICdhYnNvbHV0ZSdcblx0XHRcdHN0LmRpc3BsYXkgPSAnYmxvY2snXG5cdFx0XHRzdC5vcGFjaXR5ID0gMC44NVxuXHRcdFx0c3QuaGVpZ2h0ID0gcC5yYWRpdXMgKiAyXG5cdFx0XHRzdC53aWR0aCA9IHAucmFkaXVzICogMlxuXG5cdFx0XHRAZG9tRWxlbWVudC5hcHBlbmRDaGlsZCBlbFxuXHRcdFx0cC5kb21FbGVtZW50ID0gZWxcblxuXHRcdCMgU2V0IHVwIG1vdXNlIERPTSBlbGVtZW50XG5cdFx0ZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50ICdzcGFuJ1xuXHRcdHN0ID0gZWwuc3R5bGVcblx0XHRtciA9IDIwXG5cblx0XHRzdC5iYWNrZ3JvdW5kQ29sb3IgPSAnI2ZmZmZmZidcblx0XHRzdC5ib3JkZXJSYWRpdXMgPSBtclxuXHRcdHN0Lm1hcmdpbkxlZnQgPSAtbXJcblx0XHRzdC5tYXJnaW5Ub3AgPSAtbXJcblx0XHRzdC5wb3NpdGlvbiA9ICdhYnNvbHV0ZSdcblx0XHRzdC5kaXNwbGF5ID0gJ2Jsb2NrJ1xuXHRcdHN0Lm9wYWNpdHkgPSAwLjFcblx0XHRzdC5oZWlnaHQgPSBtciAqIDJcblx0XHRzdC53aWR0aCA9IG1yICogMlxuXG5cdFx0QGRvbUVsZW1lbnQuYXBwZW5kQ2hpbGQgZWxcblx0XHRAbW91c2UuZG9tRWxlbWVudCA9IGVsXG5cblx0cmVuZGVyOiAocGh5c2ljcykgLT5cblxuXHRcdHN1cGVyIHBoeXNpY3NcblxuXHRcdHRpbWUgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKVxuXG5cdFx0aWYgQHJlbmRlclBhcnRpY2xlc1xuXG5cdFx0XHRmb3IgcCBpbiBwaHlzaWNzLnBhcnRpY2xlc1xuXG5cdFx0XHRcdGlmIEB1c2VHUFVcblxuXHRcdFx0XHRcdHAuZG9tRWxlbWVudC5zdHlsZS5XZWJraXRUcmFuc2Zvcm0gPSBcIlwiXCJcblx0XHRcdFx0XHRcdHRyYW5zbGF0ZTNkKCN7cC5wb3MueHwwfXB4LCN7cC5wb3MueXwwfXB4LDBweClcblx0XHRcdFx0XHRcdFwiXCJcIlxuXHRcdFx0XHRlbHNlXG5cblx0XHRcdFx0XHRwLmRvbUVsZW1lbnQuc3R5bGUubGVmdCA9IHAucG9zLnhcblx0XHRcdFx0XHRwLmRvbUVsZW1lbnQuc3R5bGUudG9wID0gcC5wb3MueVxuXG5cdFx0aWYgQHJlbmRlclNwcmluZ3NcblxuXHRcdFx0QGNhbnZhcy53aWR0aCA9IEBjYW52YXMud2lkdGhcblxuXHRcdFx0QGN0eC5zdHJva2VTdHlsZSA9ICdyZ2JhKDI1NSwyNTUsMjU1LDAuMSknXG5cdFx0XHRAY3R4LmJlZ2luUGF0aCgpXG5cblx0XHRcdGZvciBzIGluIHBoeXNpY3Muc3ByaW5nc1xuXHRcdFx0XHRAY3R4Lm1vdmVUbyhzLnAxLnBvcy54LCBzLnAxLnBvcy55KVxuXHRcdFx0XHRAY3R4LmxpbmVUbyhzLnAyLnBvcy54LCBzLnAyLnBvcy55KVxuXHRcdFx0XG5cdFx0XHRAY3R4LnN0cm9rZSgpXG5cblx0XHRpZiBAcmVuZGVyTW91c2VcblxuXHRcdFx0aWYgQHVzZUdQVVxuXG5cdFx0XHRcdEBtb3VzZS5kb21FbGVtZW50LnN0eWxlLldlYmtpdFRyYW5zZm9ybSA9IFwiXCJcIlxuXHRcdFx0XHRcdHRyYW5zbGF0ZTNkKCN7QG1vdXNlLnBvcy54fDB9cHgsI3tAbW91c2UucG9zLnl8MH1weCwwcHgpXG5cdFx0XHRcdFx0XCJcIlwiXG5cdFx0XHRlbHNlXG5cblx0XHRcdFx0QG1vdXNlLmRvbUVsZW1lbnQuc3R5bGUubGVmdCA9IEBtb3VzZS5wb3MueFxuXHRcdFx0XHRAbW91c2UuZG9tRWxlbWVudC5zdHlsZS50b3AgPSBAbW91c2UucG9zLnlcblxuXHRcdEByZW5kZXJUaW1lID0gbmV3IERhdGUoKS5nZXRUaW1lKCkgLSB0aW1lXG5cblx0c2V0U2l6ZTogKEB3aWR0aCwgQGhlaWdodCkgPT5cblxuICAgICAgICBzdXBlciBAd2lkdGgsIEBoZWlnaHRcblxuICAgICAgICBAY2FudmFzLndpZHRoID0gQHdpZHRoXG4gICAgICAgIEBjYW52YXMuaGVpZ2h0ID0gQGhlaWdodFxuXG4gICAgZGVzdHJveTogLT5cblxuICAgIFx0d2hpbGUgQGRvbUVsZW1lbnQuaGFzQ2hpbGROb2RlcygpXG4gICAgXHRcdEBkb21FbGVtZW50LnJlbW92ZUNoaWxkIEBkb21FbGVtZW50Lmxhc3RDaGlsZFxuIiwiIyMjIENhbnZhcyBSZW5kZXJlciAjIyNcbmNsYXNzIENhbnZhc1JlbmRlcmVyIGV4dGVuZHMgUmVuZGVyZXJcblxuICAgIGNvbnN0cnVjdG9yOiAtPlxuXG4gICAgICAgIHN1cGVyXG5cbiAgICAgICAgQGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQgJ2NhbnZhcydcbiAgICAgICAgQGN0eCA9IEBjYW52YXMuZ2V0Q29udGV4dCAnMmQnXG5cbiAgICAgICAgIyBTZXQgdGhlIERPTSBlbGVtZW50LlxuICAgICAgICBAZG9tRWxlbWVudCA9IEBjYW52YXNcblxuICAgIGluaXQ6IChwaHlzaWNzKSAtPlxuXG4gICAgICAgIHN1cGVyIHBoeXNpY3NcblxuICAgIHJlbmRlcjogKHBoeXNpY3MpIC0+XG5cbiAgICAgICAgc3VwZXIgcGh5c2ljc1xuXG4gICAgICAgIHRpbWUgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKVxuXG4gICAgICAgICMgRHJhdyB2ZWxvY2l0eS5cbiAgICAgICAgdmVsID0gbmV3IFZlY3RvcigpXG5cbiAgICAgICAgIyBEcmF3IGhlYWRpbmcuXG4gICAgICAgIGRpciA9IG5ldyBWZWN0b3IoKVxuXG4gICAgICAgICMgQ2xlYXIgY2FudmFzLlxuICAgICAgICBAY2FudmFzLndpZHRoID0gQGNhbnZhcy53aWR0aFxuXG4gICAgICAgIEBjdHguZ2xvYmFsQ29tcG9zaXRlT3BlcmF0aW9uID0gJ2xpZ2h0ZXInXG4gICAgICAgIEBjdHgubGluZVdpZHRoID0gMVxuXG4gICAgICAgICMgRHJhdyBwYXJ0aWNsZXMuXG4gICAgICAgIGlmIEByZW5kZXJQYXJ0aWNsZXNcblxuICAgICAgICAgICAgVFdPX1BJID0gTWF0aC5QSSAqIDJcbiAgICAgICAgXG4gICAgICAgICAgICBmb3IgcCBpbiBwaHlzaWNzLnBhcnRpY2xlc1xuXG4gICAgICAgICAgICAgICAgQGN0eC5iZWdpblBhdGgoKVxuICAgICAgICAgICAgICAgIEBjdHguYXJjKHAucG9zLngsIHAucG9zLnksIHAucmFkaXVzLCAwLCBUV09fUEksIG5vKVxuXG4gICAgICAgICAgICAgICAgQGN0eC5maWxsU3R5bGUgPSAnIycgKyAocC5jb2xvdXIgb3IgJ0ZGRkZGRicpXG4gICAgICAgICAgICAgICAgQGN0eC5maWxsKClcblxuICAgICAgICBpZiBAcmVuZGVyU3ByaW5nc1xuICAgICAgICBcbiAgICAgICAgICAgIEBjdHguc3Ryb2tlU3R5bGUgPSAncmdiYSgyNTUsMjU1LDI1NSwwLjEpJ1xuICAgICAgICAgICAgQGN0eC5iZWdpblBhdGgoKVxuXG4gICAgICAgICAgICBmb3IgcyBpbiBwaHlzaWNzLnNwcmluZ3NcbiAgICAgICAgICAgICAgICBAY3R4Lm1vdmVUbyhzLnAxLnBvcy54LCBzLnAxLnBvcy55KVxuICAgICAgICAgICAgICAgIEBjdHgubGluZVRvKHMucDIucG9zLngsIHMucDIucG9zLnkpXG5cbiAgICAgICAgICAgIEBjdHguc3Ryb2tlKClcblxuICAgICAgICBpZiBAcmVuZGVyTW91c2VcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgIyBEcmF3IG1vdXNlLlxuICAgICAgICAgICAgQGN0eC5maWxsU3R5bGUgPSAncmdiYSgyNTUsMjU1LDI1NSwwLjEpJ1xuICAgICAgICAgICAgQGN0eC5iZWdpblBhdGgoKVxuICAgICAgICAgICAgQGN0eC5hcmMoQG1vdXNlLnBvcy54LCBAbW91c2UucG9zLnksIDIwLCAwLCBUV09fUEkpXG4gICAgICAgICAgICBAY3R4LmZpbGwoKVxuXG4gICAgICAgIEByZW5kZXJUaW1lID0gbmV3IERhdGUoKS5nZXRUaW1lKCkgLSB0aW1lXG5cbiAgICBzZXRTaXplOiAoQHdpZHRoLCBAaGVpZ2h0KSA9PlxuXG4gICAgICAgIHN1cGVyIEB3aWR0aCwgQGhlaWdodFxuXG4gICAgICAgIEBjYW52YXMud2lkdGggPSBAd2lkdGhcbiAgICAgICAgQGNhbnZhcy5oZWlnaHQgPSBAaGVpZ2h0XG4iLCIjIyMgRGVtbyAjIyNcbmNsYXNzIERlbW9cblxuXHRAQ09MT1VSUyA9IFsnREMwMDQ4JywgJ0YxNDY0NicsICc0QUU2QTknLCAnN0NGRjNGJywgJzRFQzlEOScsICdFNDI3MkUnXVxuXG5cdGNvbnN0cnVjdG9yOiAtPlxuXG5cdFx0QHBoeXNpY3MgPSBuZXcgUGh5c2ljcygpXG5cdFx0QG1vdXNlID0gbmV3IFBhcnRpY2xlKClcblx0XHRAbW91c2UuZml4ZWQgPSB0cnVlXG5cdFx0QGhlaWdodCA9IHdpbmRvdy5pbm5lckhlaWdodFxuXHRcdEB3aWR0aCA9IHdpbmRvdy5pbm5lcldpZHRoXG5cblx0XHRAcmVuZGVyVGltZSA9IDBcblx0XHRAY291bnRlciA9IDBcblxuXHRzZXR1cDogKGZ1bGwgPSB5ZXMpIC0+XG5cblx0XHQjIyMgT3ZlcnJpZGUgYW5kIGFkZCBwYXRpY2xlcyAvIHNwcmluZ3MgaGVyZSAjIyNcblxuXHQjIyMgSW5pdGlhbGlzZSB0aGUgZGVtbyAob3ZlcnJpZGUpLiAjIyNcblx0aW5pdDogKEBjb250YWluZXIsIEByZW5kZXJlciA9IG5ldyBXZWJHTFJlbmRlcmVyKCkpIC0+XG5cblx0XHQjIEJ1aWxkIHRoZSBzY2VuZS5cblx0XHRAc2V0dXAgcmVuZGVyZXIuZ2w/XG5cblx0XHQjIEdpdmUgdGhlIHBhcnRpY2xlcyByYW5kb20gY29sb3Vycy5cblx0XHRmb3IgcGFydGljbGUgaW4gQHBoeXNpY3MucGFydGljbGVzXG5cdFx0XHRwYXJ0aWNsZS5jb2xvdXIgPz0gUmFuZG9tLml0ZW0gRGVtby5DT0xPVVJTXG5cblx0XHQjIEFkZCBldmVudCBoYW5kbGVycy5cblx0XHRkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyICd0b3VjaG1vdmUnLCBAbW91c2Vtb3ZlLCBmYWxzZVxuXHRcdGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIgJ21vdXNlbW92ZScsIEBtb3VzZW1vdmUsIGZhbHNlXG5cdFx0ZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lciAncmVzaXplJywgQHJlc2l6ZSwgZmFsc2VcblxuXHRcdCMgQWRkIHRvIHJlbmRlciBvdXRwdXQgdG8gdGhlIERPTS5cblx0XHRAY29udGFpbmVyLmFwcGVuZENoaWxkIEByZW5kZXJlci5kb21FbGVtZW50XG5cblx0XHQjIFByZXBhcmUgdGhlIHJlbmRlcmVyLlxuXHRcdEByZW5kZXJlci5tb3VzZSA9IEBtb3VzZVxuXHRcdEByZW5kZXJlci5pbml0IEBwaHlzaWNzXG5cblx0XHQjIFJlc2l6ZSBmb3IgdGhlIHNha2Ugb2YgdGhlIHJlbmRlcmVyLlxuXHRcdGRvIEByZXNpemVcblxuXHQjIyMgSGFuZGxlciBmb3Igd2luZG93IHJlc2l6ZSBldmVudC4gIyMjXG5cdHJlc2l6ZTogKGV2ZW50KSA9PlxuXG5cdFx0QHdpZHRoID0gd2luZG93LmlubmVyV2lkdGhcblx0XHRAaGVpZ2h0ID0gd2luZG93LmlubmVySGVpZ2h0XG5cdFx0QHJlbmRlcmVyLnNldFNpemUgQHdpZHRoLCBAaGVpZ2h0XG5cblx0IyMjIFVwZGF0ZSBsb29wLiAjIyNcblx0c3RlcDogLT5cblxuXHRcdCNjb25zb2xlLnByb2ZpbGUgJ3BoeXNpY3MnXG5cblx0XHQjIFN0ZXAgcGh5c2ljcy5cblx0XHRkbyBAcGh5c2ljcy5zdGVwXG5cblx0XHQjY29uc29sZS5wcm9maWxlRW5kKClcblxuXHRcdCNjb25zb2xlLnByb2ZpbGUgJ3JlbmRlcidcblxuXHRcdCMgUmVuZGVyLlxuXG5cdFx0IyBSZW5kZXIgZXZlcnkgZnJhbWUgZm9yIFdlYkdMLCBvciBldmVyeSAzIGZyYW1lcyBmb3IgY2FudmFzLlxuXHRcdEByZW5kZXJlci5yZW5kZXIgQHBoeXNpY3MgaWYgQHJlbmRlcmVyLmdsPyBvciArK0Bjb3VudGVyICUgMyBpcyAwXG5cblx0XHQjY29uc29sZS5wcm9maWxlRW5kKClcblxuXHQjIyMgQ2xlYW4gdXAgYWZ0ZXIgeW91cnNlbGYuICMjI1xuXHRkZXN0cm95OiAtPlxuXG5cdFx0IyMgY29uc29sZS5sb2cgQCwgJ2Rlc3Ryb3knXG5cblx0XHQjIFJlbW92ZSBldmVudCBoYW5kbGVycy5cblx0XHRkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyICd0b3VjaG1vdmUnLCBAbW91c2Vtb3ZlLCBmYWxzZVxuXHRcdGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIgJ21vdXNlbW92ZScsIEBtb3VzZW1vdmUsIGZhbHNlXG5cdFx0ZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lciAncmVzaXplJywgQHJlc2l6ZSwgZmFsc2VcblxuXHRcdCMgUmVtb3ZlIHRoZSByZW5kZXIgb3V0cHV0IGZyb20gdGhlIERPTS5cblx0XHR0cnkgY29udGFpbmVyLnJlbW92ZUNoaWxkIEByZW5kZXJlci5kb21FbGVtZW50XG5cdFx0Y2F0Y2ggZXJyb3JcblxuXHRcdGRvIEByZW5kZXJlci5kZXN0cm95XG5cdFx0ZG8gQHBoeXNpY3MuZGVzdHJveVxuXG5cdFx0QHJlbmRlcmVyID0gbnVsbFxuXHRcdEBwaHlzaWNzID0gbnVsbFxuXHRcdEBtb3VzZSA9IG51bGxcblxuXHQjIyMgSGFuZGxlciBmb3Igd2luZG93IG1vdXNlbW92ZSBldmVudC4gIyMjXG5cdG1vdXNlbW92ZTogKGV2ZW50KSA9PlxuXG5cdFx0ZG8gZXZlbnQucHJldmVudERlZmF1bHRcblxuXHRcdGlmIGV2ZW50LnRvdWNoZXMgYW5kICEhZXZlbnQudG91Y2hlcy5sZW5ndGhcblx0XHRcdFxuXHRcdFx0dG91Y2ggPSBldmVudC50b3VjaGVzWzBdXG5cdFx0XHRAbW91c2UucG9zLnNldCB0b3VjaC5wYWdlWCwgdG91Y2gucGFnZVlcblxuXHRcdGVsc2VcblxuXHRcdFx0QG1vdXNlLnBvcy5zZXQgZXZlbnQuY2xpZW50WCwgZXZlbnQuY2xpZW50WVxuIiwiIyMjIENvbGxpc2lvbkRlbW8gIyMjXG5jbGFzcyBDb2xsaXNpb25EZW1vIGV4dGVuZHMgRGVtb1xuXG4gICAgc2V0dXA6IChmdWxsID0geWVzKSAtPlxuXG4gICAgICAgIHN1cGVyXG5cbiAgICAgICAgIyBWZXJsZXQgZ2l2ZXMgdXMgY29sbGlzaW9uIHJlc3BvbmNlIGZvciBmcmVlIVxuICAgICAgICBAcGh5c2ljcy5pbnRlZ3JhdG9yID0gbmV3IFZlcmxldCgpXG5cbiAgICAgICAgbWluID0gbmV3IFZlY3RvciAwLjAsIDAuMFxuICAgICAgICBtYXggPSBuZXcgVmVjdG9yIEB3aWR0aCwgQGhlaWdodFxuXG4gICAgICAgIGJvdW5kcyA9IG5ldyBFZGdlQm91bmNlIG1pbiwgbWF4XG4gICAgICAgIGNvbGxpZGUgPSBuZXcgQ29sbGlzaW9uXG4gICAgICAgIGF0dHJhY3Rpb24gPSBuZXcgQXR0cmFjdGlvbiBAbW91c2UucG9zLCAyMDAwLCAxNDAwXG5cbiAgICAgICAgbWF4ID0gaWYgZnVsbCB0aGVuIDM1MCBlbHNlIDE1MFxuICAgICAgICBwcm9iID0gaWYgZnVsbCB0aGVuIDAuMzUgZWxzZSAwLjVcblxuICAgICAgICBmb3IgaSBpbiBbMC4ubWF4XVxuXG4gICAgICAgICAgICBwID0gbmV3IFBhcnRpY2xlIChSYW5kb20gMC41LCA0LjApXG4gICAgICAgICAgICBwLnNldFJhZGl1cyBwLm1hc3MgKiA0XG5cbiAgICAgICAgICAgIHAubW92ZVRvIG5ldyBWZWN0b3IgKFJhbmRvbSBAd2lkdGgpLCAoUmFuZG9tIEBoZWlnaHQpXG5cbiAgICAgICAgICAgICMgQ29ubmVjdCB0byBzcHJpbmcgb3IgbW92ZSBmcmVlLlxuICAgICAgICAgICAgaWYgUmFuZG9tLmJvb2wgcHJvYlxuICAgICAgICAgICAgICAgIHMgPSBuZXcgU3ByaW5nIEBtb3VzZSwgcCwgKFJhbmRvbSAxMjAsIDE4MCksIDAuOFxuICAgICAgICAgICAgICAgIEBwaHlzaWNzLnNwcmluZ3MucHVzaCBzXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgcC5iZWhhdmlvdXJzLnB1c2ggYXR0cmFjdGlvblxuXG4gICAgICAgICAgICAjIEFkZCBwYXJ0aWNsZSB0byBjb2xsaXNpb24gcG9vbC5cbiAgICAgICAgICAgIGNvbGxpZGUucG9vbC5wdXNoIHBcblxuICAgICAgICAgICAgIyBBbGxvdyBwYXJ0aWNsZSB0byBjb2xsaWRlLlxuICAgICAgICAgICAgcC5iZWhhdmlvdXJzLnB1c2ggY29sbGlkZVxuICAgICAgICAgICAgcC5iZWhhdmlvdXJzLnB1c2ggYm91bmRzXG5cbiAgICAgICAgICAgIEBwaHlzaWNzLnBhcnRpY2xlcy5wdXNoIHBcblxuICAgIG9uQ29sbGlzaW9uOiAocDEsIHAyKSA9PlxuXG4gICAgICAgICMgUmVzcG9uZCB0byBjb2xsaXNpb24uXG5cbiIsImNsYXNzIENsb3RoRGVtbyBleHRlbmRzIERlbW9cblxuXHRzZXR1cDogKGZ1bGwgPSB5ZXMpIC0+XG5cblx0XHRzdXBlclxuXG5cdFx0IyBPbmx5IHJlbmRlciBzcHJpbmdzLlxuXHRcdEByZW5kZXJlci5yZW5kZXJQYXJ0aWNsZXMgPSBmYWxzZVxuXG5cdFx0QHBoeXNpY3MuaW50ZWdyYXRvciA9IG5ldyBWZXJsZXQoKVxuXHRcdEBwaHlzaWNzLnRpbWVzdGVwID0gMS4wIC8gMjAwXG5cdFx0QG1vdXNlLnNldE1hc3MgMTBcblxuXHRcdCMgQWRkIGdyYXZpdHkgdG8gdGhlIHNpbXVsYXRpb24uXG5cdFx0QGdyYXZpdHkgPSBuZXcgQ29uc3RhbnRGb3JjZSBuZXcgVmVjdG9yIDAuMCwgODAuMFxuXHRcdEBwaHlzaWNzLmJlaGF2aW91cnMucHVzaCBAZ3Jhdml0eVxuXG5cdFx0c3RpZmZuZXNzID0gMC41XG5cdFx0c2l6ZSA9IGlmIGZ1bGwgdGhlbiA4IGVsc2UgMTBcblx0XHRyb3dzID0gaWYgZnVsbCB0aGVuIDMwIGVsc2UgMjVcblx0XHRjb2xzID0gaWYgZnVsbCB0aGVuIDU1IGVsc2UgNDBcblx0XHRjZWxsID0gW11cblxuXHRcdHN4ID0gQHdpZHRoICogMC41IC0gY29scyAqIHNpemUgKiAwLjVcblx0XHRzeSA9IEBoZWlnaHQgKiAwLjUgLSByb3dzICogc2l6ZSAqIDAuNVxuXG5cdFx0Zm9yIHggaW4gWzAuLmNvbHNdXG5cblx0XHRcdGNlbGxbeF0gPSBbXVxuXG5cdFx0XHRmb3IgeSBpbiBbMC4ucm93c11cblxuXHRcdFx0XHRwID0gbmV3IFBhcnRpY2xlKDAuMSlcblxuXHRcdFx0XHRwLmZpeGVkID0gKHkgaXMgMClcblxuXHRcdFx0XHQjIEFsd2F5cyBzZXQgaW5pdGlhbCBwb3NpdGlvbiB1c2luZyBtb3ZlVG8gZm9yIFZlcmxldFxuXHRcdFx0XHRwLm1vdmVUbyBuZXcgVmVjdG9yIChzeCArIHggKiBzaXplKSwgKHN5ICsgeSAqIHNpemUpXG5cblx0XHRcdFx0aWYgeCA+IDBcblx0XHRcdFx0XHRzID0gbmV3IFNwcmluZyBwLCBjZWxsW3gtMV1beV0sIHNpemUsIHN0aWZmbmVzc1xuXHRcdFx0XHRcdEBwaHlzaWNzLnNwcmluZ3MucHVzaCBzXG5cblx0XHRcdFx0aWYgeSA+IDBcblx0XHRcdFx0XHRzID0gbmV3IFNwcmluZyBwLCBjZWxsW3hdW3kgLSAxXSwgc2l6ZSwgc3RpZmZuZXNzXG5cdFx0XHRcdFx0QHBoeXNpY3Muc3ByaW5ncy5wdXNoIHNcblxuXHRcdFx0XHRAcGh5c2ljcy5wYXJ0aWNsZXMucHVzaCBwXG5cdFx0XHRcdGNlbGxbeF1beV0gPSBwXG5cblx0XHRwID0gY2VsbFtNYXRoLmZsb29yIGNvbHMgLyAyXVtNYXRoLmZsb29yIHJvd3MgLyAyXVxuXHRcdHMgPSBuZXcgU3ByaW5nIEBtb3VzZSwgcCwgMTAsIDEuMFxuXHRcdEBwaHlzaWNzLnNwcmluZ3MucHVzaCBzXG5cblx0XHRjZWxsWzBdWzBdLmZpeGVkID0gdHJ1ZVxuXHRcdGNlbGxbY29scyAtIDFdWzBdLmZpeGVkID0gdHJ1ZVxuXG5cdHN0ZXA6IC0+XG5cblx0XHRzdXBlclxuXG5cdFx0QGdyYXZpdHkuZm9yY2UueCA9IDUwICogTWF0aC5zaW4gbmV3IERhdGUoKS5nZXRUaW1lKCkgKiAwLjAwMDVcbiIsImNsYXNzIENoYWluRGVtbyBleHRlbmRzIERlbW9cblxuXHRzZXR1cDogKGZ1bGwgPSB5ZXMpIC0+XG5cblx0XHRzdXBlclxuXG5cdFx0QHN0aWZmbmVzcyA9IDEuMFxuXHRcdEBzcGFjaW5nID0gMi4wXG5cblx0XHRAcGh5c2ljcy5pbnRlZ3JhdG9yID0gbmV3IFZlcmxldCgpXG5cdFx0QHBoeXNpY3MudmlzY29zaXR5ID0gMC4wMDAxXG5cdFx0QG1vdXNlLnNldE1hc3MgMTAwMFxuXG5cdFx0Z2FwID0gNTAuMFxuXHRcdG1pbiA9IG5ldyBWZWN0b3IgLWdhcCwgLWdhcFxuXHRcdG1heCA9IG5ldyBWZWN0b3IgQHdpZHRoICsgZ2FwLCBAaGVpZ2h0ICsgZ2FwXG5cblx0XHRlZGdlID0gbmV3IEVkZ2VCb3VuY2UgbWluLCBtYXhcblxuXHRcdGNlbnRlciA9IG5ldyBWZWN0b3IgQHdpZHRoICogMC41LCBAaGVpZ2h0ICogMC41XG5cblx0XHQjQHJlbmRlcmVyLnJlbmRlclBhcnRpY2xlcyA9IG5vXG5cblx0XHR3YW5kZXIgPSBuZXcgV2FuZGVyIDAuMDUsIDEwMC4wLCA4MC4wXG5cblx0XHRtYXggPSBpZiBmdWxsIHRoZW4gMjAwMCBlbHNlIDYwMFxuXG5cdFx0Zm9yIGkgaW4gWzAuLm1heF1cblxuXHRcdFx0cCA9IG5ldyBQYXJ0aWNsZSA2LjBcblx0XHRcdHAuY29sb3VyID0gJyNGRkZGRkYnXG5cdFx0XHRwLm1vdmVUbyBjZW50ZXJcblx0XHRcdHAuc2V0UmFkaXVzIDEuMFxuXG5cdFx0XHRwLmJlaGF2aW91cnMucHVzaCB3YW5kZXJcblx0XHRcdHAuYmVoYXZpb3Vycy5wdXNoIGVkZ2VcblxuXHRcdFx0QHBoeXNpY3MucGFydGljbGVzLnB1c2ggcFxuXG5cdFx0XHRpZiBvcD8gdGhlbiBzID0gbmV3IFNwcmluZyBvcCwgcCwgQHNwYWNpbmcsIEBzdGlmZm5lc3Ncblx0XHRcdGVsc2UgcyA9IG5ldyBTcHJpbmcgQG1vdXNlLCBwLCBAc3BhY2luZywgQHN0aWZmbmVzc1xuXG5cdFx0XHRAcGh5c2ljcy5zcHJpbmdzLnB1c2ggc1xuXG5cdFx0XHRvcCA9IHBcblxuXHRcdEBwaHlzaWNzLnNwcmluZ3MucHVzaCBuZXcgU3ByaW5nIEBtb3VzZSwgcCwgQHNwYWNpbmcsIEBzdGlmZm5lc3MiLCIjIyMgQm91bmRzRGVtbyAjIyNcbmNsYXNzIEJvdW5kc0RlbW8gZXh0ZW5kcyBEZW1vXG5cdFxuXHRzZXR1cDogLT5cblxuXHRcdHN1cGVyXG5cblx0XHRtaW4gPSBuZXcgVmVjdG9yIDAuMCwgMC4wXG5cdFx0bWF4ID0gbmV3IFZlY3RvciBAd2lkdGgsIEBoZWlnaHRcblxuXHRcdGVkZ2UgPSBuZXcgRWRnZVdyYXAgbWluLCBtYXhcblxuXHRcdGZvciBpIGluIFswLi4yMDBdXG5cblx0XHRcdHAgPSBuZXcgUGFydGljbGUgKFJhbmRvbSAwLjUsIDQuMClcblx0XHRcdHAuc2V0UmFkaXVzIHAubWFzcyAqIDVcblxuXHRcdFx0cC5tb3ZlVG8gbmV3IFZlY3RvciAoUmFuZG9tIEB3aWR0aCksIChSYW5kb20gQGhlaWdodClcblxuXHRcdFx0cC5iZWhhdmlvdXJzLnB1c2ggbmV3IFdhbmRlciAwLjIsIDEyMCwgUmFuZG9tIDEuMCwgMi4wXG5cdFx0XHRwLmJlaGF2aW91cnMucHVzaCBlZGdlXG5cblx0XHRcdEBwaHlzaWNzLnBhcnRpY2xlcy5wdXNoIHBcblxuXHRcdCIsIiMjIyBCYWxsb29uRGVtbyAjIyNcbmNsYXNzIEJhbGxvb25EZW1vIGV4dGVuZHMgRGVtb1xuXG5cdHNldHVwOiAoZnVsbCA9IHllcykgLT5cblxuXHRcdHN1cGVyXG5cblx0XHRAcGh5c2ljcy5pbnRlZ3JhdG9yID0gbmV3IEltcHJvdmVkRXVsZXIoKVxuXHRcdGF0dHJhY3Rpb24gPSBuZXcgQXR0cmFjdGlvbiBAbW91c2UucG9zXG5cblx0XHRtYXggPSBpZiBmdWxsIHRoZW4gNDAwIGVsc2UgMjAwXG5cblx0XHRmb3IgaSBpbiBbMC4ubWF4XVxuXG5cdFx0XHRwID0gbmV3IFBhcnRpY2xlIChSYW5kb20gMC4yNSwgNC4wKVxuXHRcdFx0cC5zZXRSYWRpdXMgcC5tYXNzICogOFxuXG5cdFx0XHRwLmJlaGF2aW91cnMucHVzaCBuZXcgV2FuZGVyIDAuMlxuXHRcdFx0cC5iZWhhdmlvdXJzLnB1c2ggYXR0cmFjdGlvblxuXHRcdFx0XG5cdFx0XHRwLm1vdmVUbyBuZXcgVmVjdG9yIChSYW5kb20gQHdpZHRoKSwgKFJhbmRvbSBAaGVpZ2h0KVxuXG5cdFx0XHRzID0gbmV3IFNwcmluZyBAbW91c2UsIHAsIChSYW5kb20gMzAsIDMwMCksIDEuMFxuXG5cdFx0XHRAcGh5c2ljcy5wYXJ0aWNsZXMucHVzaCBwXG5cdFx0XHRAcGh5c2ljcy5zcHJpbmdzLnB1c2ggc1xuXG4iLCJjbGFzcyBBdHRyYWN0aW9uRGVtbyBleHRlbmRzIERlbW9cblxuICAgIHNldHVwOiAoZnVsbCA9IHllcykgLT5cblxuICAgICAgICBzdXBlciBmdWxsXG5cbiAgICAgICAgbWluID0gbmV3IFZlY3RvciAwLjAsIDAuMFxuICAgICAgICBtYXggPSBuZXcgVmVjdG9yIEB3aWR0aCwgQGhlaWdodFxuICAgICAgICBcbiAgICAgICAgYm91bmRzID0gbmV3IEVkZ2VCb3VuY2UgbWluLCBtYXhcblxuICAgICAgICBAcGh5c2ljcy5pbnRlZ3JhdG9yID0gbmV3IFZlcmxldCgpXG5cbiAgICAgICAgYXR0cmFjdGlvbiA9IG5ldyBBdHRyYWN0aW9uIEBtb3VzZS5wb3MsIDEyMDAsIDEyMDBcbiAgICAgICAgcmVwdWxzaW9uID0gbmV3IEF0dHJhY3Rpb24gQG1vdXNlLnBvcywgMjAwLCAtMjAwMFxuICAgICAgICBjb2xsaWRlID0gbmV3IENvbGxpc2lvbigpXG5cbiAgICAgICAgbWF4ID0gaWYgZnVsbCB0aGVuIDQwMCBlbHNlIDIwMFxuXG4gICAgICAgIGZvciBpIGluIFswLi5tYXhdXG5cbiAgICAgICAgICAgIHAgPSBuZXcgUGFydGljbGUgKFJhbmRvbSAwLjEsIDMuMClcbiAgICAgICAgICAgIHAuc2V0UmFkaXVzIHAubWFzcyAqIDRcblxuICAgICAgICAgICAgcC5tb3ZlVG8gbmV3IFZlY3RvciAoUmFuZG9tIEB3aWR0aCksIChSYW5kb20gQGhlaWdodClcblxuICAgICAgICAgICAgcC5iZWhhdmlvdXJzLnB1c2ggYXR0cmFjdGlvblxuICAgICAgICAgICAgcC5iZWhhdmlvdXJzLnB1c2ggcmVwdWxzaW9uXG4gICAgICAgICAgICBwLmJlaGF2aW91cnMucHVzaCBib3VuZHNcbiAgICAgICAgICAgIHAuYmVoYXZpb3Vycy5wdXNoIGNvbGxpZGVcblxuICAgICAgICAgICAgY29sbGlkZS5wb29sLnB1c2ggcFxuXG4gICAgICAgICAgICBAcGh5c2ljcy5wYXJ0aWNsZXMucHVzaCBwIiwiIyMjIEltcG9ydHMgIyMjXG57QmVoYXZpb3VyfSA9IHJlcXVpcmUgJ2NvZmZlZVBoeXNpY3MvYmVoYXZpb3VyL0JlaGF2aW91cidcblxuIyMjIFdhbmRlciBCZWhhdmlvdXIgIyMjXG5cbmNsYXNzIGV4cG9ydHMuV2FuZGVyIGV4dGVuZHMgQmVoYXZpb3VyXG5cblx0Y29uc3RydWN0b3I6IChAaml0dGVyID0gMC41LCBAcmFkaXVzID0gMTAwLCBAc3RyZW5ndGggPSAxLjApIC0+XG5cblx0XHRAdGhldGEgPSBNYXRoLnJhbmRvbSgpICogTWF0aC5QSSAqIDJcblxuXHRcdHN1cGVyXG5cblx0YXBwbHk6IChwLCBkdCwgaW5kZXgpIC0+XG5cblx0XHQjc3VwZXIgcCwgZHQsIGluZGV4XG5cblx0XHRAdGhldGEgKz0gKE1hdGgucmFuZG9tKCkgLSAwLjUpICogQGppdHRlciAqIE1hdGguUEkgKiAyXG5cblx0XHRwLmFjYy54ICs9IE1hdGguY29zKEB0aGV0YSkgKiBAcmFkaXVzICogQHN0cmVuZ3RoXG5cdFx0cC5hY2MueSArPSBNYXRoLnNpbihAdGhldGEpICogQHJhZGl1cyAqIEBzdHJlbmd0aFxuIiwiIyMjIEltcG9ydHMgIyMjXG57Q29uc3RhbnRGb3JjZX0gPSByZXF1aXJlICdjb2ZmZWVQaHlzaWNzL2JlaGF2aW91ci9Db25zdGFudEZvcmNlJ1xuXG4jIyMgR3Jhdml0eSBCZWhhdmlvdXIgIyMjXG5cbmNsYXNzIGV4cG9ydHMuR3Jhdml0eSBleHRlbmRzIENvbnN0YW50Rm9yY2VcblxuXHRjb25zdHJ1Y3RvcjogKEBzY2FsZSA9IDEwMDApIC0+XG5cblx0XHRzdXBlcigpXG5cblx0XHRmb3JjZSA9IEBmb3JjZVxuXHRcdHNjYWxlID0gQHNjYWxlXG5cblx0XHR3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciBcImRldmljZW1vdGlvblwiLCAtPlxuXHRcdFx0YWNjWCA9IGV2ZW50LmFjY2VsZXJhdGlvbkluY2x1ZGluZ0dyYXZpdHkueFxuXHRcdFx0YWNjWSA9IGV2ZW50LmFjY2VsZXJhdGlvbkluY2x1ZGluZ0dyYXZpdHkueSAqIC0xXG5cblx0XHRcdGZvcmNlLnggPSBhY2NYICogc2NhbGUgLyAxMFxuXHRcdFx0Zm9yY2UueSA9IGFjY1kgKiBzY2FsZSAvIDEwXG4iLCIjIyMgSW1wb3J0cyAjIyNcbntCZWhhdmlvdXJ9ID0gcmVxdWlyZSAnY29mZmVlUGh5c2ljcy9iZWhhdmlvdXIvQmVoYXZpb3VyJ1xue1ZlY3Rvcn0gPSByZXF1aXJlICdjb2ZmZWVQaHlzaWNzL21hdGgvVmVjdG9yJ1xuXG4jIyMgRWRnZSBXcmFwIEJlaGF2aW91ciAjIyNcblxuY2xhc3MgZXhwb3J0cy5FZGdlV3JhcCBleHRlbmRzIEJlaGF2aW91clxuXG5cdGNvbnN0cnVjdG9yOiAoQG1pbiA9IG5ldyBWZWN0b3IoKSwgQG1heCA9IG5ldyBWZWN0b3IoKSkgLT5cblxuXHRcdHN1cGVyXG5cblx0YXBwbHk6IChwLCBkdCwgaW5kZXgpIC0+XG5cblx0XHQjc3VwZXIgcCwgZHQsIGluZGV4XG5cblx0XHRpZiBwLnBvcy54ICsgcC5yYWRpdXMgPCBAbWluLnhcblxuXHRcdFx0cC5wb3MueCA9IEBtYXgueCArIHAucmFkaXVzXG5cdFx0XHRwLm9sZC5wb3MueCA9IHAucG9zLnhcblxuXHRcdGVsc2UgaWYgcC5wb3MueCAtIHAucmFkaXVzID4gQG1heC54XG5cblx0XHRcdHAucG9zLnggPSBAbWluLnggLSBwLnJhZGl1c1xuXHRcdFx0cC5vbGQucG9zLnggPSBwLnBvcy54XG5cblx0XHRpZiBwLnBvcy55ICsgcC5yYWRpdXMgPCBAbWluLnlcblxuXHRcdFx0cC5wb3MueSA9IEBtYXgueSArIHAucmFkaXVzXG5cdFx0XHRwLm9sZC5wb3MueSA9IHAucG9zLnlcblxuXHRcdGVsc2UgaWYgcC5wb3MueSAtIHAucmFkaXVzID4gQG1heC55XG5cblx0XHRcdHAucG9zLnkgPSBAbWluLnkgLSBwLnJhZGl1c1xuXHRcdFx0cC5vbGQucG9zLnkgPSBwLnBvcy55XG4iLCIjIyMgSW1wb3J0cyAjIyNcbntCZWhhdmlvdXJ9ID0gcmVxdWlyZSAnY29mZmVlUGh5c2ljcy9iZWhhdmlvdXIvQmVoYXZpb3VyJ1xue1ZlY3Rvcn0gPSByZXF1aXJlICdjb2ZmZWVQaHlzaWNzL21hdGgvVmVjdG9yJ1xuXG4jIyMgRWRnZSBCb3VuY2UgQmVoYXZpb3VyICMjI1xuXG5jbGFzcyBleHBvcnRzLkVkZ2VCb3VuY2UgZXh0ZW5kcyBCZWhhdmlvdXJcblxuXHRjb25zdHJ1Y3RvcjogKEBtaW4gPSBuZXcgVmVjdG9yKCksIEBtYXggPSBuZXcgVmVjdG9yKCkpIC0+XG5cblx0XHRzdXBlclxuXG5cdGFwcGx5OiAocCwgZHQsIGluZGV4KSAtPlxuXG5cdFx0I3N1cGVyIHAsIGR0LCBpbmRleFxuXG5cdFx0aWYgcC5wb3MueCAtIHAucmFkaXVzIDwgQG1pbi54XG5cblx0XHRcdHAucG9zLnggPSBAbWluLnggKyBwLnJhZGl1c1xuXG5cdFx0ZWxzZSBpZiBwLnBvcy54ICsgcC5yYWRpdXMgPiBAbWF4LnhcblxuXHRcdFx0cC5wb3MueCA9IEBtYXgueCAtIHAucmFkaXVzXG5cblx0XHRpZiBwLnBvcy55IC0gcC5yYWRpdXMgPCBAbWluLnlcblxuXHRcdFx0cC5wb3MueSA9IEBtaW4ueSArIHAucmFkaXVzXG5cblx0XHRlbHNlIGlmIHAucG9zLnkgKyBwLnJhZGl1cyA+IEBtYXgueVxuXG5cdFx0XHRwLnBvcy55ID0gQG1heC55IC0gcC5yYWRpdXNcbiIsIiMjIyBJbXBvcnQgQmVoYXZpb3VyICMjI1xue0JlaGF2aW91cn0gPSByZXF1aXJlICdjb2ZmZWVQaHlzaWNzL2JlaGF2aW91ci9CZWhhdmlvdXInXG57VmVjdG9yfSA9IHJlcXVpcmUgJ2NvZmZlZVBoeXNpY3MvbWF0aC9WZWN0b3InXG5cbiMjIyBDb25zdGFudCBGb3JjZSBCZWhhdmlvdXIgIyMjXG5cbmNsYXNzIGV4cG9ydHMuQ29uc3RhbnRGb3JjZSBleHRlbmRzIEJlaGF2aW91clxuXG5cdGNvbnN0cnVjdG9yOiAoQGZvcmNlID0gbmV3IFZlY3RvcigpKSAtPlxuXG5cdFx0c3VwZXJcblxuXHRhcHBseTogKHAsIGR0LGluZGV4KSAtPlxuXG5cdFx0I3N1cGVyIHAsIGR0LCBpbmRleFxuXG5cdFx0cC5hY2MuYWRkIEBmb3JjZVxuIiwiIyMjIEltcG9ydCBCZWhhdmlvdXIgIyMjXG57QmVoYXZpb3VyfSA9IHJlcXVpcmUgJ2NvZmZlZVBoeXNpY3MvYmVoYXZpb3VyL0JlaGF2aW91cidcbntWZWN0b3J9ID0gcmVxdWlyZSAnY29mZmVlUGh5c2ljcy9tYXRoL1ZlY3RvcidcblxuIyMjIENvbGxpc2lvbiBCZWhhdmlvdXIgIyMjXG5cbiMgVE9ETzogQ29sbGlzaW9uIHJlc3BvbnNlIGZvciBub24gVmVybGV0IGludGVncmF0b3JzLlxuXG5jbGFzcyBleHBvcnRzLkNvbGxpc2lvbiBleHRlbmRzIEJlaGF2aW91clxuXG4gICAgY29uc3RydWN0b3I6IChAdXNlTWFzcyA9IHllcywgQGNhbGxiYWNrID0gbnVsbCkgLT5cblxuICAgICAgICAjIFBvb2wgb2YgY29sbGlkYWJsZSBwYXJ0aWNsZXMuXG4gICAgICAgIEBwb29sID0gW11cblxuICAgICAgICAjIERlbHRhIGJldHdlZW4gcGFydGljbGUgcG9zaXRpb25zLlxuICAgICAgICBAX2RlbHRhID0gbmV3IFZlY3RvcigpXG5cbiAgICAgICAgc3VwZXJcblxuICAgIGFwcGx5OiAocCwgZHQsIGluZGV4KSAtPlxuXG4gICAgICAgICNzdXBlciBwLCBkdCwgaW5kZXhcblxuICAgICAgICAjIENoZWNrIHBvb2wgZm9yIGNvbGxpc2lvbnMuXG4gICAgICAgIGZvciBvIGluIEBwb29sW2luZGV4Li5dIHdoZW4gbyBpc250IHBcblxuICAgICAgICAgICAgIyBEZWx0YSBiZXR3ZWVuIHBhcnRpY2xlcyBwb3NpdGlvbnMuXG4gICAgICAgICAgICAoQF9kZWx0YS5jb3B5IG8ucG9zKS5zdWIgcC5wb3NcblxuICAgICAgICAgICAgIyBTcXVhcmVkIGRpc3RhbmNlIGJldHdlZW4gcGFydGljbGVzLlxuICAgICAgICAgICAgZGlzdFNxID0gQF9kZWx0YS5tYWdTcSgpXG5cbiAgICAgICAgICAgICMgU3VtIG9mIGJvdGggcmFkaWkuXG4gICAgICAgICAgICByYWRpaSA9IHAucmFkaXVzICsgby5yYWRpdXNcblxuICAgICAgICAgICAgIyBDaGVjayBpZiBwYXJ0aWNsZXMgY29sbGlkZS5cbiAgICAgICAgICAgIGlmIGRpc3RTcSA8PSByYWRpaSAqIHJhZGlpXG5cbiAgICAgICAgICAgICAgICAjIENvbXB1dGUgcmVhbCBkaXN0YW5jZS5cbiAgICAgICAgICAgICAgICBkaXN0ID0gTWF0aC5zcXJ0IGRpc3RTcVxuXG4gICAgICAgICAgICAgICAgIyBEZXRlcm1pbmUgb3ZlcmxhcC5cbiAgICAgICAgICAgICAgICBvdmVybGFwID0gcmFkaWkgLSBkaXN0XG4gICAgICAgICAgICAgICAgb3ZlcmxhcCArPSAwLjVcblxuICAgICAgICAgICAgICAgICMgVG90YWwgbWFzcy5cbiAgICAgICAgICAgICAgICBtdCA9IHAubWFzcyArIG8ubWFzc1xuXG4gICAgICAgICAgICAgICAgIyBEaXN0cmlidXRlIGNvbGxpc2lvbiByZXNwb25zZXMuXG4gICAgICAgICAgICAgICAgcjEgPSBpZiBAdXNlTWFzcyB0aGVuIG8ubWFzcyAvIG10IGVsc2UgMC41XG4gICAgICAgICAgICAgICAgcjIgPSBpZiBAdXNlTWFzcyB0aGVuIHAubWFzcyAvIG10IGVsc2UgMC41XG5cbiAgICAgICAgICAgICAgICAjIE1vdmUgcGFydGljbGVzIHNvIHRoZXkgbm8gbG9uZ2VyIG92ZXJsYXAuXG4gICAgICAgICAgICAgICAgcC5wb3MuYWRkIChAX2RlbHRhLmNsb25lKCkubm9ybSgpLnNjYWxlIG92ZXJsYXAgKiAtcjEpXG4gICAgICAgICAgICAgICAgby5wb3MuYWRkIChAX2RlbHRhLm5vcm0oKS5zY2FsZSBvdmVybGFwICogcjIpXG5cbiAgICAgICAgICAgICAgICAjIEZpcmUgY2FsbGJhY2sgaWYgZGVmaW5lZC5cbiAgICAgICAgICAgICAgICBAY2FsbGJhY2s/KHAsIG8sIG92ZXJsYXApXG4iLCIjIyMgQmVoYXZpb3VyICMjI1xuXG5jbGFzcyBleHBvcnRzLkJlaGF2aW91clxuXG5cdCMgRWFjaCBiZWhhdmlvdXIgaGFzIGEgdW5pcXVlIGlkXG5cdEBHVUlEID0gMFxuXG5cdGNvbnN0cnVjdG9yOiAtPlxuXG5cdFx0QEdVSUQgPSBCZWhhdmlvdXIuR1VJRCsrXG5cdFx0QGludGVydmFsID0gMVxuXG5cdFx0IyMgY29uc29sZS5sb2cgQCwgQEdVSURcblxuXHRhcHBseTogKHAsIGR0LCBpbmRleCkgLT5cblxuXHRcdCMgU3RvcmUgc29tZSBkYXRhIGluIGVhY2ggcGFydGljbGUuXG5cdFx0KHBbJ19fYmVoYXZpb3VyJyArIEBHVUlEXSA/PSB7Y291bnRlcjogMH0pLmNvdW50ZXIrK1xuIiwiIyMjIEltcG9ydHMgIyMjXG57QmVoYXZpb3VyfSA9IHJlcXVpcmUgJ2NvZmZlZVBoeXNpY3MvYmVoYXZpb3VyL0JlaGF2aW91cidcbntWZWN0b3J9ID0gcmVxdWlyZSAnY29mZmVlUGh5c2ljcy9tYXRoL1ZlY3RvcidcblxuIyMjIEF0dHJhY3Rpb24gQmVoYXZpb3VyICMjI1xuXG5jbGFzcyBleHBvcnRzLkF0dHJhY3Rpb24gZXh0ZW5kcyBCZWhhdmlvdXJcblxuICAgIGNvbnN0cnVjdG9yOiAoQHRhcmdldCA9IG5ldyBWZWN0b3IoKSwgQHJhZGl1cyA9IDEwMDAsIEBzdHJlbmd0aCA9IDEwMC4wKSAtPlxuXG4gICAgICAgIEBfZGVsdGEgPSBuZXcgVmVjdG9yKClcbiAgICAgICAgQHNldFJhZGl1cyBAcmFkaXVzXG5cbiAgICAgICAgc3VwZXJcblxuICAgICMjIyBTZXRzIHRoZSBlZmZlY3RpdmUgcmFkaXVzIG9mIHRoZSBiYWhhdmlvdXMuICMjI1xuICAgIHNldFJhZGl1czogKHJhZGl1cykgLT5cblxuICAgICAgICBAcmFkaXVzID0gcmFkaXVzXG4gICAgICAgIEByYWRpdXNTcSA9IHJhZGl1cyAqIHJhZGl1c1xuXG4gICAgYXBwbHk6IChwLCBkdCwgaW5kZXgpIC0+XG5cbiAgICAgICAgI3N1cGVyIHAsIGR0LCBpbmRleFxuXG4gICAgICAgICMgVmVjdG9yIHBvaW50aW5nIGZyb20gcGFydGljbGUgdG8gdGFyZ2V0LlxuICAgICAgICAoQF9kZWx0YS5jb3B5IEB0YXJnZXQpLnN1YiBwLnBvc1xuXG4gICAgICAgICMgU3F1YXJlZCBkaXN0YW5jZSB0byB0YXJnZXQuXG4gICAgICAgIGRpc3RTcSA9IEBfZGVsdGEubWFnU3EoKVxuXG4gICAgICAgICMgTGltaXQgZm9yY2UgdG8gYmVoYXZpb3VyIHJhZGl1cy5cbiAgICAgICAgaWYgZGlzdFNxIDwgQHJhZGl1c1NxIGFuZCBkaXN0U3EgPiAwLjAwMDAwMVxuXG4gICAgICAgICAgICAjIENhbGN1bGF0ZSBmb3JjZSB2ZWN0b3IuXG4gICAgICAgICAgICBAX2RlbHRhLm5vcm0oKS5zY2FsZSAoMS4wIC0gZGlzdFNxIC8gQHJhZGl1c1NxKVxuXG4gICAgICAgICAgICAjQXBwbHkgZm9yY2UuXG4gICAgICAgICAgICBwLmFjYy5hZGQgQF9kZWx0YS5zY2FsZSBAc3RyZW5ndGhcbiIsIiMjIyBBbGxvd3Mgc2FmZSwgZHlhbWljIGNyZWF0aW9uIG9mIG5hbWVzcGFjZXMuICMjI1xuXG5uYW1lc3BhY2UgPSAoaWQpIC0+XG5cdHJvb3QgPSBzZWxmXG5cdHJvb3QgPSByb290W3BhdGhdID89IHt9IGZvciBwYXRoIGluIGlkLnNwbGl0ICcuJ1xuXG4jIyMgUmVxdWVzdEFuaW1hdGlvbkZyYW1lIHNoaW0uICMjI1xuZG8gLT5cblxuICAgIHRpbWUgPSAwXG4gICAgdmVuZG9ycyA9IFsnbXMnLCAnbW96JywgJ3dlYmtpdCcsICdvJ11cblxuICAgIGZvciB2ZW5kb3IgaW4gdmVuZG9ycyB3aGVuIG5vdCB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lXG4gICAgICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPSB3aW5kb3dbIHZlbmRvciArICdSZXF1ZXN0QW5pbWF0aW9uRnJhbWUnXVxuICAgICAgICB3aW5kb3cuY2FuY2VsQW5pbWF0aW9uRnJhbWUgPSB3aW5kb3dbIHZlbmRvciArICdDYW5jZWxBbmltYXRpb25GcmFtZSddXG5cbiAgICBpZiBub3Qgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZVxuXG4gICAgICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPSAoY2FsbGJhY2ssIGVsZW1lbnQpIC0+XG4gICAgICAgICAgICBub3cgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKVxuICAgICAgICAgICAgZGVsdGEgPSBNYXRoLm1heCAwLCAxNiAtIChub3cgLSBvbGQpXG4gICAgICAgICAgICBzZXRUaW1lb3V0ICgtPiBjYWxsYmFjayh0aW1lICsgZGVsdGEpKSwgZGVsdGFcbiAgICAgICAgICAgIG9sZCA9IG5vdyArIGRlbHRhXG5cbiAgICBpZiBub3Qgd2luZG93LmNhbmNlbEFuaW1hdGlvbkZyYW1lXG4gICAgICAgIFxuICAgICAgICB3aW5kb3cuY2FuY2VsQW5pbWF0aW9uRnJhbWUgPSAoaWQpIC0+XG4gICAgICAgICAgICBjbGVhclRpbWVvdXQgaWRcbiIsIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBOEJBQTs7QURBQTtBQUFBLElBQUE7O0FBRUEsU0FBQSxHQUFZLFNBQUMsRUFBRDtBQUNYLE1BQUE7RUFBQSxJQUFBLEdBQU87QUFDUDtBQUFBO09BQUEscUNBQUE7O2lCQUFBLElBQUEsd0JBQU8sSUFBSyxDQUFBLElBQUEsSUFBTCxJQUFLLENBQUEsSUFBQSxJQUFTO0FBQXJCOztBQUZXOzs7QUFJWjs7QUFDRyxDQUFBLFNBQUE7QUFFQyxNQUFBO0VBQUEsSUFBQSxHQUFPO0VBQ1AsT0FBQSxHQUFVLENBQUMsSUFBRCxFQUFPLEtBQVAsRUFBYyxRQUFkLEVBQXdCLEdBQXhCO0FBRVYsT0FBQSx5Q0FBQTs7VUFBMkIsQ0FBSSxNQUFNLENBQUM7OztJQUNsQyxNQUFNLENBQUMscUJBQVAsR0FBK0IsTUFBUSxDQUFBLE1BQUEsR0FBUyx1QkFBVDtJQUN2QyxNQUFNLENBQUMsb0JBQVAsR0FBOEIsTUFBUSxDQUFBLE1BQUEsR0FBUyxzQkFBVDtB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
