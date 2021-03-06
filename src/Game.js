export class Game {
  mouseX = 0;
  mouseY = 0;
  mouseDown = false;
  mouseMovementX = 0;
  mouseMovementY = 0;

  #lastX;
  #lastY;

  constructor() {
    const canvas = document.createElement( 'canvas' );
    window.onresize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    window.onresize();
    
    document.body.appendChild( canvas );
    const ctx = canvas.getContext( '2d' );

    const onInput = ( e ) => {
      const event = e.touches ? e.touches[ 0 ] : e;

      this.mouseDown = true;
      this.mouseX = event.clientX;
      this.mouseY = event.clientY;
      this.mouseMovementX = this.#lastX ? this.mouseX - this.#lastX : 0;
      this.mouseMovementY = this.#lastY ? this.mouseY - this.#lastY : 0;
      this.#lastX = this.mouseX;
      this.#lastY = this.mouseY;

      e.preventDefault();   // prevent scroll/zoom in iOS Safari
    }
    const stopInput = ( e ) => {
      this.mouseDown = false;
      this.#lastX = undefined;
      this.#lastY = undefined;
    }
    document.addEventListener( 'mousemove',  onInput, { passive: false } );
    document.addEventListener( 'touchmove',  onInput, { passive: false } );
    document.addEventListener( 'mousedown',  onInput, { passive: false } );
    document.addEventListener( 'touchstart', onInput, { passive: false } );
    document.addEventListener( 'mouseup',  stopInput );
    document.addEventListener( 'touchend', stopInput );
    

    let lastTime = null;
    const animate = ( now ) => {
      lastTime ??= now;  // for first call only
      this.update( now - lastTime );
      lastTime = now;
  
      ctx.clearRect( 0, 0, ctx.canvas.width, ctx.canvas.height );
      this.draw( ctx );
  
      requestAnimationFrame( animate );
    };

    requestAnimationFrame( animate );
  }

  update( dt ) {}
  draw( ctx ) {}

}
