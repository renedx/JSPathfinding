if( 'object' === typeof module && 'function' === typeof require )
  List = require( './list' )
  
//
// Create a new A* Pathfinding search
// new Path({ start: '1_1', end: '1_2', map: [map] })
//
var Path = function( options ) {
  if( 'object' != typeof options ) {
    this.debugMode = true, this.debug( 'options are required and must be an object' )
    return [];
  }
  if( !( 'map' in options ) || !( 'start' in options ) || !( 'end' in options ) ) {
    this.debugMode = true, this.debug( 'map, start and end options are required' )
    return [];
  }
  else if( ( 'map' in options ) && 'object' != typeof options.map ) {
    this.debugMode = true, this.debug( 'map option is required to be an object' )
    return [];
  }
  
  this.Map                 = options.map;

  // Set search information
  this.split               = options.split || '_';
  this.currentTile         = ( 'string' == typeof options.start ? options.start : options.start.join( this.split ) );
  this.s_currentTile       = ( 'string' == typeof options.start ? options.start.split( this.split ) : options.start );
  this.endPoint            = ( 'string' == typeof options.end ? options.end : options.end.join( this.split ) );
  this.s_endPoint          = ( 'string' == typeof options.end ? options.end.split( this.split ) : options.end );
  this.startPoint          = ( 'string' == typeof options.start ? options.start : options.start.join( this.split ) );
  this.s_startPoint        = ( 'string' == typeof options.start ? options.start.split( this.split ) : options.start );
  this.debugMode           = ( options.debug === true );
  this.squareSearch        = ( options.square === true );
  this.found               = false;
  
  // Lists
  this.parentListdata      = {};
  this.parentListcount     = 0;
  
  this.openListdata        = {};
  this.openListcount       = 0;
  
  this.closedListdata      = {};
  this.closedListcount     = 0;
  
  // Map data validater
  this.validate            = options.collision || this.validatePoint;
  
  // Map result
  this.result              = options.callback || function() {};
  
  // Data collector
  this.h                   = {};
  this.g                   = {};
  this.f                   = new List(this);
  
  // Check: end is starting point?
  if( this.endPoint == this.startPoint ) {
    this.debug( 'Start point and end point are the same, cancel' );
    return [];
  }

  // Set standards
  this.g[( this.startPoint )] = 0;
  this.h[( this.startPoint )] = 0;
  this.openListadd( this.startPoint, this.currentTile );

  // Search
  while( 1 ) {
    this.closedListadd( this.currentTile );
    this.openListremove( this.currentTile );
          
    // Find tiles
    this.surroundingTiles( this.currentTile );
    
    var lowest = this.lowestF();
    if( !lowest ) {
      this.debug( 'Caught: Inf. loop on lowestF score' );
      break;
    }
    
    this.currentTile   = lowest;
    this.debug( 'LowestF is "' + lowest + '"' )
    this.s_currentTile = this.currentTile.split( this.split );
    if( this.currentTile == this.endPoint ) {
      this.found = true;
      break;
    }
  }
  
  // Nothing found
  var result = this.reversePath();
  this.result(result)
  return result;
};

Path.prototype = {
  // Default no debug mode
  debugMode: false,
  debug: function( msg ) {
    if( this.debugMode === true )
      console.log( msg )
  },
  
  // parentList
  parentListadd: function( id, p_id ) {
    this.parentListdata[id] = p_id;
    this.parentListcount++;
    
    this.debug( 'addParentList: ' + id + ' == ' + p_id );
  },
  
  parentListremove: function( id ) {
    delete this.parentListdata[id];
    this.parentListcount--;
  },
        
  // openList
  openListadd: function( id, p_id ) {
    this.openListdata[id] = id;
    this.openListcount++;
                        
    // Add F cost
    this.f.add( id, this.getF( id ) );              
    this.debug( 'addOpenList: ' + id + ' == ' + id );
    
    // Append parent
    this.parentListadd( id, p_id );
  },
  
  openListremove: function( id ) {
    this.f.remove( id );
    delete this.openListdata[id];
    this.openListcount--;
                        
    this.debug( 'removeOpenList: ' + id + ' == undefined' );
  },
        
  // closedList
  closedListadd: function( id ) {
    this.closedListdata[id] = id;
    this.closedListcount++;
    
    this.debug( 'addClosedList: ' + id + ' == ' + id );
  },
  
  closedListremove: function( id ) {
    delete this.closedListdata[id];
    this.count--;
  },
  
  // calculate 
  getH: function( id ) {
    var s_id = id.split( this.split );
    
    // Calculate H for this tile
    this.h[id] = ( 10 * ( ( Math.abs( s_id[0] - this.s_endPoint[0] ) ) + ( Math.abs( s_id[1] - this.s_endPoint[1] ) ) ) );
    this.debug( 'Setting H score of "' + id + '" to "' + this.h[id] + '" ' )
  },
  getG: function( id ) {
    this.g[id] = ( this.g[( this.currentTile )] + this.getC( id ) );
    this.debug( 'Setting G score of "' + id + '" to "' + this.g[id] + '" ' )
  },
  getC: function( id ) {
    var s_id = id.split( this.split ), s_cTile = this.s_currentTile;
    
    // Diff
    if( s_id[0] != s_cTile[0] &&
        s_id[1] != s_cTile[1] ) 
      return 14;
    else
      return 10;
  },
  getF: function( id ) {
    return ( this.g[id] + this.h[id] );
  },
  
  // check functions
  isWalkable: function( id, half ) {
    if( !this.Map[id] )
      return false;
    if( this.validate( id, this.Map[id], half ) === true )
      return false;
    return true;
  },
  validatePoint: function( id, point, half ) { // default check function
    return false;
  },
  surroundingTiles: function( cTile ) {
    var tile      = cTile.split( this.split );
        tile[0]   = new Number(tile[0]);
        tile[1]   = new Number(tile[1]);
    var tiles     = [];
        tiles[0]  = ( tile[0] - 1 ) + this.split + tile[1]; // Tile above current
        tiles[1]  = ( tile[0] + 1 ) + this.split + tile[1]; // Tile below current
        tiles[2]  = tile[0] + this.split + ( tile[1] - 1 ); // Tile left from current
        tiles[3]  = tile[0] + this.split + ( tile[1] + 1 ); // Tile right from current
                    
    // Left/right above/below
    if( !this.squareSearch ) {
      if( this.isWalkable( tiles[0], true )
       && this.isWalkable( tiles[2], true ) )
        tiles[4]  = ( tile[0] - 1 ) + this.split + ( tile[1] - 1 ); // Tile above left
  
      if( this.isWalkable( tiles[2], true )
       && this.isWalkable( tiles[1], true ) )
        tiles[5]  = ( tile[0] + 1 ) + this.split + ( tile[1] - 1 ); // Tile below left
  
      if( this.isWalkable( tiles[3], true )
       && this.isWalkable( tiles[1], true ) )
        tiles[6]  = ( tile[0] + 1 ) + this.split + ( tile[1] + 1 ); // Tile above right
  
      if( this.isWalkable( tiles[0], true )
       && this.isWalkable( tiles[3], true ) )
        tiles[7]  = ( tile[0] - 1 ) + this.split + ( tile[1] + 1 ); // Tile below right
    }
    
    this.debug( 'Open tiles ' + tiles.join( ', ' ) )

    // Get tile
    for( var i in tiles ) {
      var s_tile = tiles[i];
      if( this.isWalkable( s_tile ) && !this.closedListdata[s_tile] ) {
        if( this.openListdata[s_tile] ) {
          // Calculate new F score and check if its lower then the current F score
          var tempF = parseInt( this.h[ s_tile ] + this.g[ cTile ] + this.getC( s_tile ) );
          this.debug( 'tempF "' +  tempF + '" of "' + s_tile + '", currentF "' + this.getF( s_tile ) + '"' )
          if( tempF < this.getF( s_tile ) ) {
            // Recalculate G score
            this.getG( s_tile );
            this.f.update( s_tile, this.getF( s_tile ) );
            
            this.parentListadd( s_tile, cTile );
          }
  
        }
        else {
          // Recalculate
          this.getH( s_tile );
          this.getG( s_tile );
          
          this.openListadd( s_tile, cTile );
        }
      }
    }
  },
  
  lowestF: function( ) {
    return this.f.removeLowest();
  },
  
  // calculate path in reversed order
  reversePath: function() {
    // Found nothing?
    if( !this.found ) return [];
    
    var new_path  = [],
        done      = false,
        current   = this.endPoint;
                
    // Start..
    while( ! done ) {
      if( current != this.startPoint ) 
        new_path.push( ( current = this.parentListdata[current] ) );
      else 
        break;
    }
    
    new_path.reverse();
    new_path.push( this.endPoint );
        
    // Return the path
    return new_path;
  }
};
if( 'object' === typeof module )
  module.exports = Path