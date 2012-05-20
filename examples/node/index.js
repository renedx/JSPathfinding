var Path = require( '../../lib/path.js' ),
    Fs   = require( 'fs' ),
    Map  = JSON.parse( Fs.readFileSync( '../map.json' ) )
    
console.log(new Path({
  start: [3,2], 
  end: [3,6], 
  map: Map, 
  collision: function Collision( id, point, half ){
    if( point == 'tree' )
      return true;
    return false;
  },
  debug: false,
  sqaure: false
}))