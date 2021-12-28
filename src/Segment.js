export class Segment {
  constructor( x1, y1, x2, y2 ) {
    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;

    this.midX = ( x1 + x2 ) / 2;
    this.midY = ( y1 + y2 ) / 2;

    const len = Math.hypot( x2 - x1, y2 - y1 );
    this.normalX = ( y2 - y1 ) / len;
    this.normalY = ( x1 - x2 ) / len;
  }

  getCollision( entity, dt ) {

    // See http://www.jeffreythompson.org/collision-detection/line-line.php

    const x1 = this.x1, y1 = this.y1, x2 = this.x2, y2 = this.y2;
    const x3 = entity.x, y3 = entity.y;
    const x4 = entity.x + entity.dx * dt;
    const y4 = entity.y + entity.dy * dt;

    const dn = ( ( y4 - y3 ) * ( x2 - x1 ) - ( x4 - x3 ) * ( y2 - y1 ) );
    const uA = ( ( x4 - x3 ) * ( y1 - y3 ) - ( y4 - y3 ) * ( x1 - x3 ) ) / dn;
    const uB = ( ( x2 - x1 ) * ( y1 - y3 ) - ( y2 - y1 ) * ( x1 - x3 ) ) / dn;

    // TODO: Incorporate radius
    return {
      time: 0 <= uA && uA <= 1 /* && 0 <= uB && uB <= 1 */ ? uB : Infinity,
      normalX: this.normalX,
      normalY: this.normalY,
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