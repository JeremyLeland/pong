import { Entity } from './Entity.js';
import { Segment } from './Segment.js';

const ui = document.createElement( 'div' );
ui.className = 'scores';
document.body.appendChild( ui );

let playerIndex = 0;

const rectPath = new Path2D( 'M -1,-1 L 1,-1 L 1,1 L -1,1 Z' );

const PADDLE_SPEED = 0.3;

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
    this.#goalMove += x * Math.cos( this.angle ) + y * Math.sin( this.angle );
  }

  think( balls ) {
    let closest = balls.map( 
      ball => ( { ball: ball, dist: Math.hypot( ball.x - this.x, ball.y - this.y ) } )
    ).reduce( 
      ( closest, ballDist ) => ballDist.dist < closest.dist ? ballDist : closest,
      { ball: null, dist: Infinity }
    );

    this.#goalMove = 
      ( closest.ball.x - this.x ) * Math.cos( this.angle ) + 
      ( closest.ball.y - this.y ) * Math.sin( this.angle );
  }

  update( dt ) {
    const move = this.#goalMove < 0 ? 
      Math.max( -PADDLE_SPEED * dt, this.#goalMove ) : 
      Math.min(  PADDLE_SPEED * dt, this.#goalMove );

    this.#offset = Math.max( -this.#maxOffset, Math.min( this.#maxOffset, 
      this.#offset + move
    ) );

    this.#goalMove -= move;

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
  speed = 0.5;

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
    let lastHit;

    for ( let tries = 0; dt > 0 && tries < 10; tries ++ ) {   // don't get stuck forever
      const hits = [];

      // TODO: Or use a list with filter, if it looks better?
      for ( let b = 0; b < this.balls.length; b ++ ) {
        const ball = this.balls[ b ];
        this.walls.filter( wall => !lastHit?.entities.includes( wall.segment ) ).forEach( wall => hits.push( wall.getCollision( ball ) ) );
        this.paddles.forEach( paddle => hits.push( paddle.getCollision( ball ) ) );

        for ( let o = b + 1; o < this.balls.length; o ++ ) {
          const other = this.balls[ o ];
          hits.push( other.getCollision( ball ) );
        }
      }

      const hit = hits.reduce( 
        ( closest, nextHit ) => 0 < nextHit.time && nextHit.time < closest.time ? nextHit : closest,
        { time: Infinity }
      );

      if ( 0 < hit.time && hit.time <= dt ) {
        lastHit = hit;
        
        this.balls.forEach( b => b.update( hit.time ) );
        this.paddles.forEach( p => p.update( hit.time ) );
        dt -= hit.time;

        const e1 = hit.entities[ 0 ], e2 = hit.entities[ 1 ];

        const p = 2 * ( ( ( e1.dx ?? 0 ) - ( e2.dx ?? 0 ) ) * hit.normal.x + 
                        ( ( e1.dy ?? 0 ) - ( e2.dy ?? 0 ) ) * hit.normal.y ) / ( ( e1.mass ?? 0 ) + ( e2.mass ?? 0 ) );
        
        if ( e1.dx ) {
          e1.dx -= p * hit.normal.x;
          e1.dy -= p * hit.normal.y;
        }
        
        if ( e2.dx ) {
          e2.dx += p * hit.normal.x;
          e2.dy += p * hit.normal.y;  
        }
      }
      else {
        this.balls.forEach( b => b.update( dt ) );
        this.paddles.forEach( p => p.update( dt ) );
        dt = 0;
      }
    }
  }

  draw( ctx ) {
    this.walls.forEach( w => w.draw( ctx ) );
    this.paddles.forEach( p => p.draw( ctx ) );
    this.balls.forEach( b => b.draw( ctx ) );
  }
}