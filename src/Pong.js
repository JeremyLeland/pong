import { Entity } from './Entity.js';
import { Segment } from './Segment.js';

const rectPath = new Path2D( 'M -1,-1 L 1,-1 L 1,1 L -1,1 Z' );

export class Paddle extends Entity {
  width = 50;
  height = 5;
  path = rectPath;
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
  }
}

export class Ball extends Entity {
  width = 10;
  height = 10;
  radius = 10;
  path = new Path2D( 'M -1 0 A 1 1 0 0 1 1 0 A 1 1 0 0 1 -1 0' );

  dx = 0;
  dy = 0;

  constructor( info ) {
    super( info );
    Object.assign( this, info );
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
      this.walls.push( new Segment( a[ 0 ], a[ 1 ], b[ 0 ], b[ 1 ] ) );
    }
  }

  update( dt ) {
    this.paddles.forEach( p => p.update( dt ) );
    this.balls.forEach( b => b.update( dt ) );
  }

  draw( ctx ) {
    this.walls.forEach( w => w.draw( ctx ) );
    this.paddles.forEach( p => p.draw( ctx ) );
    this.balls.forEach( b => b.draw( ctx ) );
  }
}