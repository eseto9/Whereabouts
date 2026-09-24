/* =========================================================
   Riddles for things whose own entry has none (or only one).
   Keyed by the thing's name; merged with its own `r` in clues.
   ========================================================= */
const RIDDLES={
  // Town Square
  'the Brew Ha Ha café':['I wake the whole town up, one hot cup at a time.'],
  'the red café umbrella':['I’m a red hat for a café table, keeping coffee drinkers cool.'],
  'the yellow café umbrella':['I open like a sunflower over a café table, but I’m here to block the sun.'],
  'the blue café umbrella':['I’m a café table’s shade, the colour of the sky I’m hiding you from.'],
  'the balloon seller':['I hold a whole bunch of colours on strings, and every one is for sale.'],
  'the juggler':['I keep three balls in the air and never let one drop.'],
  'the newsstand':['I sell yesterday’s gossip printed on paper.'],
  'the hopscotch grid':['Hop on one foot, then two, and count your way up my squares.'],
  'the giant sunflower':['I turn my big yellow face to follow the sun all day.'],
  'the fire hydrant':['Firefighters plug a hose into me when there’s trouble.'],
  'the red bench':['I have four legs and no feet, and tired people sit on my lap.'],
  'the fountain':['I dance with water, and people throw coins into my pool.'],
  'the clock tower':['I tell everyone the time from high above the square.'],
  // Market Street
  'the pile of apples':['Red and round, we’re piled high on a stall waiting to be picked up.'],
  'the orange pyramid':['We’re round fruit stacked into a pointy pile, the same colour as our name.'],
  'the fish on ice':['We lie on a cold bed at the market, still smelling of the sea.'],
  'the basket of baguettes':['We’re long, crusty loaves standing up in a basket.'],
  'the flower buckets':['We stand in water on a stall, waiting to become somebody’s bouquet.'],
  'the wheel of cheese':['I’m round and yellow, and mice dream about me.'],
  'the pumpkin pile':['We’re big orange squash, and one of us might become a lantern.'],
  'the bakery':['Bread and buns come out of my oven every morning.'],
  'the barbershop':['My striped pole spins outside, and hair gets snipped inside.'],
  'Fin’s Fish shop':['I sell the catch of the day, fresh from the sea.'],
  "Fin's Fish shop":['I sell the catch of the day, fresh from the sea.'],
  'the toy shop':['Kids press their noses to my window to see wind-ups and teddies.'],
  'the flower shop':['Everything I sell smells lovely, and it all came from a garden.'],
  'the Bean Boutique':['I’m where you spend your coins on something new to wear.'],
  // Harbor
  "Salty's fish shack":['I serve fish and chips by the sea, wrapped in paper.'],
  'the fisherman':['I sit at the end of the pier all day, waiting for a nibble.'],
  'the beach umbrella':['I stand in the sand and give sunbathers some shade.'],
  'the beach ball':['I’m full of air, and you bat me around on the sand.'],
  'the red-sailed boat':['My sail is the colour of a strawberry, and the wind pushes me along.'],
  'the yellow-sailed boat':['My sail is the colour of butter, and the breeze does my rowing.'],
  'the blue rowboat':['I have oars instead of a sail, and I float lazily in the bay.'],
  'the red buoy':['I bob in the sea wearing red, showing boats where to go.'],
  'the green buoy':['I bob in the sea wearing green, marking the safe way in.'],
  'the pier':['I’m a wooden walkway that stops in the middle of the sea.'],
  // Hillside
  'the pink house':['I’m a home painted the colour of bubblegum.'],
  'the blue house':['I’m a home painted the colour of a clear summer sky.'],
  'the yellow house':['I’m a home painted the colour of butter.'],
  'the mint house':['I’m a home painted the colour of toothpaste.'],
  'the lavender house':['I’m a home painted the colour of a purple flower that smells lovely.'],
  'the peach house':['I’m a home the colour of a fuzzy summer fruit.'],
  'the white house':['I’m a home as pale as fresh snow.'],
  'the teal house':['I’m a home the colour of a tropical lagoon.'],
  'the coral house':['I’m a home the colour of a reef under the sea.'],
  'the painter':['I stand at my easel, turning the view into a picture.'],
  'the garden gnome':['I’m a little man with a pointy red hat who guards the garden.'],
  'the birdhouse':['I’m a tiny wooden home on a pole, and my guests all have feathers.'],
  'the kid flying a kite':['I’m holding a string, and the other end is dancing in the sky.'],
  // Park
  'the duck pond':['Ducks paddle across me, and you can skip stones on my surface.'],
  'the gazebo':['I’m a round shelter in the park with a pointy roof and no walls.'],
  'the red slide':['Climb my ladder, sit down, and whoosh to the bottom.'],
  'the swing set':['Kick your legs and I’ll carry you up towards the sky and back.'],
  'the sandbox bucket':['I’m for scooping sand and building castles in the playground.'],
  'the tennis ball':['I’m fuzzy and yellow, and a dog is chasing me.'],
  'the pink blossom tree':['In spring I’m covered in pink petals that fall like snow.'],
  'the ice cream cart':['I roll around the park selling cold treats in cones.'],
  'the park sign':['I tell you where the park begins, in big letters.'],
  'the picnic basket':['I carry sandwiches to the park, and ants follow me there.'],
  // Around the ring road and the sky
  'the cyclist':['I pedal round and round the town, ringing my bell.'],
  'the mail carrier':['I carry a heavy bag of letters from door to door.'],
  'the blimp':['I’m a giant floating balloon with a message on my side.'],
  'the delivery van':['I drive around and around, dropping off parcels.'],
  'the hot air balloon':['I float over town with a basket hanging underneath me.'],
};
// every riddle a thing has: its own, then the extras above
function riddlesOf(o){
  const own=o.r?(Array.isArray(o.r)?o.r:[o.r]):[];
  return own.concat(RIDDLES[o.n]||[]);
}
