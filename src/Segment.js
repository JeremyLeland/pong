export class Segment {
  // Allow segments to be used in collision code
  dx = 0;
  dy = 0;
  mass = Number.MAX_VALUE;

  // TODO: Give segments a reference to owner, then put the dx/dy/mass there?

  constructor( x1, y1, x2, y2 ) {
    this.setPoints( x1, y1, x2, y2 );
  }

  setPoints( x1 = 0, y1 = 0, x2 = 0, y2 = 0 ) {
    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;

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
        
    // Inside segment
    if ( d1 < this.length && d2 < this.length ) {
      return {
        time: hitTime,
        normal: { x: this.normalX, y: this.normalY },
        entities: [ this, entity ],
      };
    }

    // End points. If these miss, they will return time: Infinity
    const hit1 = getPointHit( entity, this.x1, this.y1 );
    const hit2 = getPointHit( entity, this.x2, this.y2 );
    hit1.segment = this;
    hit2.segment = this;

    return hit1.time < hit2.time ? hit1 : hit2;
  }

  draw( ctx ) {
    // this.path ?= new Path2D( `M ${ this.x1 },${ this.y1 } L ${ this.x2 },${ this.y2 }` );

    ctx.beginPath();
    ctx.moveTo( this.x1, this.y1 );
    ctx.lineTo( this.x2, this.y2 );

    const midX = ( this.x1 + this.x2 ) / 2;
    const midY = ( this.y1 + this.y2 ) / 2;
    ctx.moveTo( midX, midY );
    ctx.lineTo( midX + this.normalX * 10, midY + this.normalY * 10 );

    ctx.strokeStyle = 'white';
    ctx.stroke();
  }
}

function getPointHit( entity, cx, cy ) {
  // See: https://stackoverflow.com/questions/1073336/circle-line-segment-collision-detection-algorithm
  const dX = entity.dx;
  const dY = entity.dy;
  const fX = entity.x - cx;
  const fY = entity.y - cy;

  const a = dX * dX + dY * dY;
  const b = 2 * ( fX * dX + fY * dY ); 
  const c = ( fX * fX + fY * fY ) - Math.pow( entity.radius, 2 );

  let disc = b * b - 4 * a * c;

  if ( disc > 0 ) {
    disc = Math.sqrt( disc );

    const t0 = ( -b - disc ) / ( 2 * a );
    //const t1 = ( -b + disc ) / ( 2 * a );

    const hitTime = t0;// < 0 ? t1 : t0;

    const hitX = entity.x + entity.dx * hitTime;
    const hitY = entity.y + entity.dy * hitTime;

    let nx = cx - hitX;
    let ny = cy - hitY;
    const len = Math.hypot( nx, ny );
    nx /= len;
    ny /= len;

    return {
      time: hitTime,
      normal: { x: nx, y: ny },
      entities: [ this, entity ],
    }
  }
  else {
    return {
      time: Infinity
    }
  }
}