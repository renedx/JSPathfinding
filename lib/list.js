var List = function( pathInstance ) {
  this.pathInstance = pathInstance;
  this.data         = [];
};

List.prototype = {
  debug: function( msg ) {
    this.pathInstance.debug( 'List - ' + msg )
  },
  add: function( tile, fScore ) {
    var id = this.data.push({ tile: tile, score: fScore });
    this.debug( 'Add "' + tile + '" on "' + id + '"' )

    // Update
    this.comparison(id);
    return id;
  },
  
  removeLowest: function() {
    if( !this.data.length ) return false;
    var id = this.data.shift().tile;
    this.debug( 'Remove lowest; "' + id + '"' )
    
    // Update
    this.successiveComparison(id);
    return id;
  },
  
  remove: function( tile ) {
    var found = this.find( tile );
    if( found == -1 ) return false;
    this.data.splice( found, 1 );
    this.debug( 'Remove "' + tile + '"' )
    
    // Update
    this.successiveComparison();
    return true;
  },
        
  // Update element
  update: function( current_content, new_content ) {
    var found = this.find( current_content );
    if( found == -1 ) return false;
                
    // Replace found element
    this.data.splice( found, 1, new_content );
                
    // Add one to its index, 'cause we calculate in
    // human ints
    found++;
                
    this.comparison( found );
  },

  // Find the contents in the heap
  find: function( f_content ) {
    var foundIndex = -1,
      heap = new Object( this.data );
    for( var indx in heap ) {
      if( parseInt( this.data[indx].score ) == parseInt( f_content ) ) {
        foundIndex = parseInt( indx );
        break;
      }
    }
   
    return foundIndex;
  },
  findTile: function( f_content ) {
    var foundIndex = -1,
      heap = new Object( this.data );
    for( var indx in heap ) {
      if( this.data[indx].tile == f_content ) {
        foundIndex = parseInt( indx );
        break;
      }
    }
   
    return foundIndex;
  },
  
  get: function( id ) {
    id = parseInt(id);
    return parseInt( this.data[(id-1)] ? this.data[(id-1)].score : 0 );
  },
  getDetails: function( id ) {
    id = parseInt(id);
    return ( this.data[(id-1)] ? this.data[(id-1)] : false );
  },
  set: function( sid, scontent ) {
    if( !scontent ) return;
    this.data[(parseInt(sid)-1)] = scontent;
  },
  
  // Compare
  comparison: function( m ) {
    while( m != 1 ) {
      var flr = Math.floor( m / 2 );
      this.debug( this.get(m) + ' <= (' + m + ' <-> ' + flr + ') ' + this.get(flr) );

      // Check if its child is lower or equal to its parent
      if( this.get(m) <= this.get(flr) ) {
        // Swap them
        var temp = this.getDetails(flr);
        this.set( flr, this.getDetails(m) );
        this.set( m, temp );
        m = flr;
      }
      else {
        break;
      }
    }
  },
  
  // Compare successive
  successiveComparison: function() {
    var v = 1, u = null, l = this.data.length;
    
    // Loop it untill we set it to the right index
    while( 1 ) {
      u = v;
      if( ( ( 2 * u ) + 1 ) <= l ) {
        // Select the lowest of the two children.
        if( this.get(u) >= this.get( 2 * u ) )
          v = ( 2 * u );
        if( this.get(v) >= this.get( ( 2 * u ) +1) )
          v = ( 2 * u ) +1;
      }
      else if( ( 2 * u ) <= l ) {
        // Check if the its greater than the child
        if( this.get(u) >= this.get( 2 * u) )
          v = ( 2 * u );
      }
      
      // If the parents are diff, swap them
      if( u != v ) {
        // Swap them
        var temp = this.getDetails(u);
        this.set( u, this.getDetails(v) );
        this.set( v, temp );
      }
      else
        break;
    }
  }
};

if( 'object' === typeof module )
  module.exports = List