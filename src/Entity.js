export class Entity {
  x = 0;
  y = 0;
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
}