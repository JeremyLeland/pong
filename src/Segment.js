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

  getCollision( entity ) {
    const distFromLine = (this.x1 - entity.x) * this.normalX + (this.y1 - entity.y) * this.normalY;

    const vDotN = entity.dx * this.normalX + entity.dy * this.normalY;

    return {
      time: ( distFromLine + entity.radius ) / vDotN,   // TODO: Sometimes -? Properly incorporate radius
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