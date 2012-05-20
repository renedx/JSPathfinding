JSPathfinding
=============

A* JS Pathfinding, previously used in PixelCity an isometric JavaScript game.


JavaScript
------
```
  <script type="text/javascript" src="/lib/list.js"></script>
  <script type="text/javascript" src="/lib/path.js"></script>
```

NodeJS
------
```
  var Path = require( '/lib/path.js' );
```

How to use
----------
```
  result = new Path( options );
```

### Options
```
{
  "start": [1,1],    // REQUIRED - Start (walking) point 
  "end": [3,3],      // REQUIRED - End (walking) point 
  "map": {           // REQUIRED - Your walking map with points
    "1_1": "open", "1_2": "open", "1_3": "open",
    "2_1": "open", "2_2": "open", "2_3": "open",
    "3_1": "open", "3_2": "open", "3_3": "open"
  },
  
  // REQUIRED - This function you use to check if a tile is blocked (collision)
  //
  // Arguments
  //   id: "x_x" (x = number)
  //   point: "open"
  //   half: false / true (did cut of a corner? - always false if sqaure is enabled)
  //
  "collision": function Collision( id, point, half ) {    
    if( point == 'tree' )
      return true;
    return false;
  },
  
  "split": "_",      // OPTIONAL - Split option for your Map points - default  _
  "debug": false,    // OPTIONAL - Enables debug mode (all calculations shown in console.log) - default  false
  "square": false,   // OPTIONAL - Tells JSPathfinding to now cut of corners (half) - default  false
  
  // OPTIONAL - This function returns your result, like new Path does too
  //
  // Arguments
  //   result: [ "1_1", "2_2", "3_3" ] (found path)
  //   result: false (nothing found / internal problem)
  //
  "callback": function Callback( result ) {
    if( result !== false ) {
      console.log( result )
    }
  }
}
```

License
===
JSPathfinding is licensed under the MIT license.