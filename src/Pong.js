import { Entity } from './Entity.js';
import { Segment } from './Segment.js';

const scoreDivs = new Map();

const ui = document.createElement( 'div' );
ui.className = 'scores';
document.body.appendChild( ui );

let playerIndex = 0;

const rectPath = new Path2D( 'M -1,-1 L 1,-1 L 1,1 L -1,1 Z' );

const PADDLE_SPEED = 0.2;
const MOUSE_SENSITIVITY = 2;

export class Paddle extends Entity {
  segment = new Segment( 0, 0, 1, 1 );
  
  #startX;
  #startY;
  #offset;
  #maxOffset;
  #goalMove = 0;

  constructor( rail, fillStyle ) {
    super( {
      x: ( rail.x1 + rail.x2 ) / 2,
      y: ( rail.y1 + rail.y2 ) / 2,
      angle: Math.atan2( rail.y2 - rail.y1, rail.x2 - rail.x1 ),
      width: 50,
      height: 5,
      fillStyle: fillStyle,
      path: rectPath,
    } );

    this.#startX = this.x;
    this.#startY = this.y;
    this.#offset = 0;
    this.#maxOffset = rail.length / 2 - this.width;

    const label = document.createElement( 'span' );
    label.className = 'scoreLabel';
    label.style.color = this.fillStyle;
    label.innerText = `Player ${ ++playerIndex }: `;
    ui.appendChild( label );

    this.scoreUI = document.createElement( 'span' );
    this.scoreUI.className = 'scoreValue';
    this.scoreUI.innerText = 0;
    ui.appendChild( this.scoreUI );

    rail.owner = this;
  }

  respawn() {
    this.x = this.#startX;
    this.y = this.#startY;
    this.#offset = 0;
  }

  mouseMove( x, y ) {
    this.#goalMove = x * Math.cos( this.angle ) + y * Math.sin( this.angle );
    this.#goalMove *= MOUSE_SENSITIVITY;
  }

  think( balls ) {
    const closestBall = balls[ 0 ];   // TODO: Handle multiple balls

    this.#goalMove = 
      ( closestBall.x - this.x ) * Math.cos( this.angle ) + 
      ( closestBall.y - this.y ) * Math.sin( this.angle );
  }

  update( dt ) {
    const move = this.#goalMove < 0 ? 
      Math.max( -PADDLE_SPEED * dt, this.#goalMove ) : 
      Math.min(  PADDLE_SPEED * dt, this.#goalMove );

    this.#offset = Math.max( -this.#maxOffset, Math.min( this.#maxOffset, 
      this.#offset + move
    ) );

    this.x = this.#startX + Math.cos( this.angle ) * this.#offset;
    this.y = this.#startY + Math.sin( this.angle ) * this.#offset;

    const cosW = Math.cos( this.angle ), sinW = Math.sin( this.angle );
    const cosH = Math.cos( this.angle + Math.PI / 2 );
    const sinH = Math.sin( this.angle + Math.PI / 2 );
    this.segment.setPoints( 
      this.x - cosW * this.width - cosH * this.height, 
      this.y - sinW * this.width - sinH * this.height, 
      this.x + cosW * this.width - cosH * this.height,
      this.y + sinW * this.width - sinH * this.height,
    );
  }

  draw( ctx ) {
    super.draw( ctx );
    //this.segment.draw( ctx );
  }
}

export class Wall extends Entity {
  constructor( x1, y1, x2, y2 ) {
    super( {
      x: ( x1 + x2 ) / 2,
      y: ( y1 + y2 ) / 2,
      angle: Math.atan2( y2 - y1, x2 - x1 ),
      width: Math.hypot( x2 - x1, y2 - y1 ) / 2,
      height: 1,
      fillStyle: 'white',
      path: rectPath, 
    } );

    this.segment = new Segment( x1, y1, x2, y2 );
  }
}

export class Ball extends Entity {
  width = 10;
  height = 10;
  radius = 10;
  path = new Path2D( 'M -1 0 A 1 1 0 0 1 1 0 A 1 1 0 0 1 -1 0' );

  dx = 0;
  dy = 0;
  speed = 0.4;

  constructor( info ) {
    super( info );
    this.respawn();
    Object.assign( this, info );
  }

  respawn() {
    this.x = 0;
    this.y = 0;

    const angle = Math.random() * Math.PI * 2;
    this.dx = Math.cos( angle ) * this.speed;
    this.dy = Math.sin( angle ) * this.speed;
  }

  update( dt ) {
    this.x += this.dx * dt;
    this.y += this.dy * dt;
  }

  bounceFrom( hit ) {
    // https://stackoverflow.com/questions/573084/how-to-calculate-bounce-angle
    const vDotN = this.dx * hit.normalX + this.dy * hit.normalY;
    const uX = vDotN * hit.normalX;
    const uY = vDotN * hit.normalY;
    const wX = this.dx - uX;
    const wY = this.dy - uY;

    this.dx = wX - uX;
    this.dy = wY - uY;
  }
}

export class Level {
  walls = [];
  paddles = [];
  balls = [];

  addWallsFromPoints( points ) {
    for ( let i = 0; i < points.length; i ++ ) {
      const a = points[ i ];
      const b = points[ ( i + 1 ) % points.length ];
      this.walls.push( new Wall( a[ 0 ], a[ 1 ], b[ 0 ], b[ 1 ] ) );
    }
  }

  update( dt ) {
    this.paddles.forEach( p => p.update( dt ) );
    
    const segments = [ ...this.walls.map( w => w.segment ), ...this.paddles.map( p => p.segment ) ];
    
    this.balls.forEach( ball => {
      let lastWall;

      while ( dt > 0 ) {
        const hit = segments.filter( w => w != lastWall ).map( 
          wall => wall.getCollision( ball )
        ).reduce( 
          ( closest, nextHit ) => 0 < nextHit.time && nextHit.time < closest.time ? nextHit : closest,
          { time: Infinity }
        );
  
        if ( 0 < hit.time && hit.time <= dt ) {
          lastWall = hit.segment;
          
          ball.update( hit.time );
          dt -= hit.time;
  
          if ( hit.segment.owner ) {
            setTimeout( () => ball.respawn(), 1000 );
            hit.segment.owner.scoreUI.innerText --;
          }
          else {
            ball.bounceFrom( hit );
          }
        }
        else {
          ball.update( dt );
          dt = 0;
        }
      }

    } );
  }

  draw( ctx ) {
    this.walls.forEach( w => w.draw( ctx ) );
    this.paddles.forEach( p => p.draw( ctx ) );
    this.balls.forEach( b => b.draw( ctx ) );
  }
}