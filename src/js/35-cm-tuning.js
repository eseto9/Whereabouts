/* =========================================================
   CROWDED MARKET — tuning: every number the game plays by.
   Plain data only (no browser, no THREE): the simulation, the AI
   and the tests all read it. Times are seconds, money is coins,
   distances are metres (world units).
   ========================================================= */
const CM_TUNE={
  DT:0.1,                    // one simulation tick
  DAY:360,                   // a trading day
  PARTS:[                    // day parts, by start time
    {k:'morning',t:0,label:'Morning',icon:'🌅'},
    {k:'midday',t:120,label:'Midday',icon:'☀️'},
    {k:'evening',t:240,label:'Evening',icon:'🌇'},
  ],

  START_COINS:30,
  START_STOCK:{bread:3,fruit:3},   // every stall opens with this on the shelf
  CARRY:6,                   // units a bean can carry at once
  SHELF_MAX:20,              // units of one good a stall can hold
  PRICE_MAX:60,

  // goods: cost = what the supplier charges, list = the price a stall opens at
  GOODS:{
    fish:   {icon:'🐟',name:'Fish',   cost:4,list:9, weight:3},
    bread:  {icon:'🥖',name:'Bread',  cost:2,list:5, weight:4},
    flowers:{icon:'💐',name:'Flowers',cost:3,list:8, weight:2},
    fruit:  {icon:'🍎',name:'Fruit',  cost:2,list:5, weight:4},
    cheese: {icon:'🧀',name:'Cheese', cost:5,list:11,weight:2},
    teapot: {icon:'🫖',name:'Teapots',cost:8,list:17,weight:1},
  },
  // where each good comes from: the spot you stand on to buy
  SUPPLIERS:{
    fish:   {x:2.5, z:44,   name:'the harbor'},
    bread:  {x:33.5,z:-7.4, name:'the Knead to Know bakery'},
    flowers:{x:-28, z:-4.5, name:'the park flower cart'},
    fruit:  {x:72.9,z:-19.5,name:'the orchard fruit stand'},
    cheese: {x:74,  z:5.5,  name:'the dairy cart on Farm Lane'},
    teapot: {x:36,  z:-22,  name:'the hillside pottery'},
  },
  // the four trading stalls on Market Street (the other four stay as decoration);
  // customers stand at the front (fz) to pay
  STALLS:[
    {x:32,z:-4.8,fz:-2.6},
    {x:39,z:-4.8,fz:-2.6},
    {x:32,z:4.8, fz:2.6},
    {x:39,z:4.8, fz:2.6},
  ],

  POST:{dx:1.4,z:3.3},       // the owner's spot: street side of the stall, a step along from the till

  // ranges
  SUPPLIER_RANGE:3,          // stand this close to a supplier to buy
  STALL_RANGE:3.2,           // ...to your stall to shelve
  PITCH_RANGE:4.5,           // ...to a customer to pitch
  STALL_REACH:11,            // a customer must be this close to your stall to be pitched

  // movement: the player's walk and run (the AI can't go faster than RUN)
  WALK:8,
  RUN:11,
  MOVE_SLACK:1.25,           // allowance for jumps and frame jitter when checking a move

  // customers
  STREET:{x0:11,x1:57,lane:2.4},   // they walk up and down Market Street between x0 and x1
  CUST_SPEED:2.2,
  CUST_GO_SPEED:3,           // walking over to the stall they chose
  CUST_MAX:9,                // on the street at once
  CUST_LIFE:75,              // gives up and leaves after this long
  SPAWN_GAP:{morning:[6,9],midday:[4,6.5],evening:[3,5]},
  DECIDE:1.6,                // after the first pitch, how long other stalls get to pitch too
  REPITCH:3,                 // a stall can pitch the same customer again after this long
  BUDGET_MULT:[0.95,1.5],    // a budget customer's max price = list × this
  BUY_TIME:0.8,              // at the stall, paying

  FEED_MAX:40,               // events kept in the state

  // AI rivals: personality × difficulty
  AI:{
    think:{easy:1.2,normal:0.6,hard:0.3},        // seconds between decisions
    speed:{easy:7,normal:8.5,hard:11},           // metres per second (never above RUN)
    pitchDelay:{easy:1.4,normal:0.7,hard:0.25},  // how long before it notices a customer
    restockAt:{easy:2,normal:4,hard:6},          // goes for more when its shelf is this low...
    variety:{easy:1,normal:2,hard:3},            // ...or has fewer kinds of goods than this
    share:0.5,                                    // the part of the customers it expects to win
    sayGap:12,                                    // at most one speech bubble this often
  },
  RIVALS:{
    undercutter:{name:'Ursula',title:'The Undercutter',col:'#FF5D73',
      startMult:0.85,        // opens every price at list × this
      undercutBy:1,          // beats a rival's price by this much
      floorMargin:1,         // never prices within this of cost
      says:{undercut:['Half price!','Cheaper here!','Beat that!','Bargains!'],sale:['Pleasure doing business!','Come again!'],restock:['Back in a jiffy!','More stock, coming up!']}},
  },
};
