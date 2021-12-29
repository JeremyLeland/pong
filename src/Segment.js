export class Segment {
  constructor( x1, y1, x2, y2 ) {
    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;

    this.midX = ( x1 + x2 ) / 2;
    this.midY = ( y1 + y2 ) / 2;

    this.length = Math.hypot( x2 - x1, y2 - y1 );
    this.normalX = ( y2 - y1 ) / this.length;
    this.normalY = ( x1 - x2 ) / this.length;
  }

  getCollision( entity ) {

    const distFromLine = ( this.x1 - entity.x ) * this.normalX + ( this.y1 - entity.y ) * this.normalY;

    const vDotN = entity.dx * this.normalX + entity.dy * this.normalY;
    const hitTime = ( distFromLine + entity.radius ) / vDotN;

    const hitX = entity.x + entity.dx * hitTime;
    const hitY = entity.y + entity.dy * hitTime;

    const d1 = Math.hypot( this.x1 - hitX, this.y1 - hitY );
    const d2 = Math.hypot( this.x2 - hitX, this.y2 - hitY );
    

    // // See http://www.jeffreythompson.org/collision-detection/line-line.php

    // const x1 = this.x1, y1 = this.y1, x2 = this.x2, y2 = this.y2;
    // const x3 = entity.x, y3 = entity.y;
    // const x4 = entity.x + entity.dx * dt;
    // const y4 = entity.y + entity.dy * dt;

    // const dn = ( ( y4 - y3 ) * ( x2 - x1 ) - ( x4 - x3 ) * ( y2 - y1 ) );
    // const uA = ( ( x4 - x3 ) * ( y1 - y3 ) - ( y4 - y3 ) * ( x1 - x3 ) ) / dn;
    // const uB = ( ( x2 - x1 ) * ( y1 - y3 ) - ( y2 - y1 ) * ( x1 - x3 ) ) / dn;

    
    // Inside segment
    if ( d1 < this.length && d2 < this.length ) {
      return {
        time: hitTime,
        normalX: this.normalX,
        normalY: this.normalY,
      };
    }

    // First point
    // See: https://stackoverflow.com/questions/1073336/circle-line-segment-collision-detection-algorithm
    const dX = entity.dx;
    const dY = entity.dy;
    const fX = entity.x - this.x1;
    const fY = entity.y - this.y1;

    const a = dX * dX + dY * dY;
    const b = 2 * ( fX * dX + fY * dY ); 
    const c = ( fX * fX + fY * fY ) - Math.pow( entity.radius, 2 );

    let disc = b * b - 4 * a * c;

    if ( disc > 0 ) {
      disc = Math.sqrt( disc );

      const t0 = ( -b - disc ) / ( 2 * a );
      const t1 = ( -b + disc ) / ( 2 * a );

      const hitTime = t0;// < 0 ? t1 : t0;

      const hitX = entity.x + entity.dx * hitTime;
      const hitY = entity.y + entity.dy * hitTime;

      let nx = this.x1 - hitX;
      let ny = this.y1 - hitY;
      const len = Math.hypot( nx, ny );
      nx /= len;
      ny /= len;

      return {
        time: hitTime,
        normalX: nx,
        normalY: ny,
      }
    }
    
    // Second point
    // else if ( d2 < entity.radius ) {

    // }
    // Complete miss
    return {
      time: Infinity,
      normalX: 0,
      normalY: 0,
    };
  }

  draw( ctx ) {
    // this.path ?= new Path2D( `M ${ this.x1 },${ this.y1 } L ${ this.x2 },${ this.y2 }` );

    ctx.beginPath();
    ctx.moveTo( this.x1, this.y1 );
    ctx.lineTo( this.x2, this.y2 );

    ctx.moveTo( this.midX, this.midY );
    ctx.lineTo( this.midX + this.normalX * 10, this.midY + this.normalY * 10 );

    ctx.strokeStyle = 'white';
    ctx.stroke();
  }
}