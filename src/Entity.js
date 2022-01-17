export class Entity {
  x = 0;
  y = 0;
  mass = 1;
  angle = 0;
  width = 1;
  height = 1;
  fillStyle = 'red';
  path = new Path2D();

  constructor( info ) {
    Object.assign( this, info );
  }

  update( dt ) {}

  draw( ctx ) {
    ctx.save();

    ctx.translate( this.x, this.y );
    ctx.rotate( this.angle );
    ctx.scale( this.width, this.height );

    ctx.fillStyle = this.fillStyle;
    ctx.fill( this.path );

    ctx.restore();
  }

  getCollision( other ) {
    if ( this.segment ) {
      return this.segment.getCollision( other );
    }
    else {
      return this.getCircleVsCircleCollision( other );
    }
  }

  getCircleVsCircleCollision( other ) {
    const fX = this.x - other.x;
    const fY = this.y - other.y;
    const dX = this.dx - other.dx;
    const dY = this.dy - other.dy;
    const rr = this.radius + other.radius;
    
    const a = dX * dX + dY * dY;
    const b = 2 * ( fX * dX + fY * dY ); 
    const c = ( fX * fX + fY * fY ) - rr * rr;

    let disc = b * b - 4 * a * c;

    if ( disc > 0 ) {
      disc = Math.sqrt( disc );

      const t0 = ( -b - disc ) / ( 2 * a );
      //const t1 = ( -b + disc ) / ( 2 * a );

      const hitTime = t0;// < 0 ? t1 : t0;

      const hitX = this.x + this.dx * hitTime;
      const hitY = this.y + this.dy * hitTime;

      let nx = other.x - hitX;
      let ny = other.y - hitY;
      const len = Math.hypot( nx, ny );
      nx /= len;
      ny /= len;

      return {
        time: hitTime,
        normal: { x: nx, y: ny },
        entities: [ this, other ],
      }
    }
    else {
      return {
        time: Infinity
      }
    }
  }
}