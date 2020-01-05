// a node.js app that tries to iterate a balanced workout
// with bruteforce randomization.
// current state: experimental and testing
// code is quite mathematical and not optimized for duplicate
// functions in other modules etc.
// run:
// node build.js

var fs = require("fs");
// npm install mathjs
var math = require("mathjs");

var iterations = 1000000;
var fname = "./movedb.json"

const db = require(fname);
const moves = db["moves"];

console.log("Database has " + moves.length.toString() + " moves.")

// collect all the different block_effects
var all_block_effects = get_nested_list(moves, 1)

// find all the unique elements
var unique_block_effects = calc_unique_elements(all_block_effects);

// balancer loop that iterates to find balanced workout
var best_workouts = {};
var updated = 0;

for (let i = 0; i < iterations; i++) {
   // take copy of full database
   var new_workout = moves.slice();

   // choose how many moves to drop off
   var drop_off = rand_int(all_block_effects.length);
   for (let j = 0; j < drop_off; j++) {
      new_workout.splice(rand_int(new_workout.length), 1);
   }
   
   // here code that checks if we found a better workout
   var effects = get_nested_list(new_workout, 1);
   var stats = calc_blockeffect_statistics(effects);
   [duplicate_muscles, intensities, muscle_intensities] = stats;

   var std = math.std(intensities);
   var len = new_workout.length;

   //var score = len*(1/std);

   // store the workouts so that each length contains the workout and its std
   var new_workout_obj = {"serie": new_workout, "std":std}
   var len_str = len.toString();
   if (len_str in best_workouts) {
      if (new_workout_obj.std < best_workouts[len_str].std) {
         best_workouts[len_str] = new_workout_obj;
         updated = updated + 1;
         }
   } else {
      best_workouts[len_str] = new_workout_obj;
   }
}
//stats = calc_blockeffect_statistics(get_nested_list(best_workout,1))
//console.log(stats[2])
for (key in best_workouts) {
   if (best_workouts[key].std == 0) {
      var workout_chosen = best_workouts[key].serie;
      var std_chosen = best_workouts[key].std;
   }
   // console.log(key + ": std:" + best_workouts[key].std.toString());
}
console.log("The iterative process ran " + iterations.toString() + " times and updated series " + updated.toString() + " times.");
console.log("Workout chosen has " + workout_chosen.length.toString() + " moves and std of " + std_chosen.toString());
console.log(workout_chosen);

function calc_blockeffect_statistics(list_of_movelists) {
   // this will calculate how stressed the muscles are in
   // this iteration
   var duplicate_session_muscles = [];
   var muscle_intensities = {}
   for (i = 0; i < list_of_movelists.length; i++) {
      list_of_movelists[i].forEach(el => {
         duplicate_session_muscles.push(el)
         if (muscle_intensities.hasOwnProperty(el)) {
            muscle_intensities[el] += 1;
         } else {
            muscle_intensities[el] = 1;
         }
      });
   }

   var intensities = [];
   for (var key in muscle_intensities) {
      intensities.push(muscle_intensities[key]);
   }

   return [duplicate_session_muscles, intensities, muscle_intensities];
}

function get_nested_list(list_of_lists, elnum) {
   // this will return the [[a, [], x], [b, c, d]
   // a bit of a shitty solution, rework needed
   var newlist = []
   list_of_lists.forEach(element => {
      newlist.push(element[elnum])
   });
   return newlist;
}

function calc_unique_elements(listobject) {
   // Return list of unique elements appear in the list
   
   var all_elements = []
   for (i = 0; i < listobject.length; i++) {
      all_elements = all_elements.concat(listobject[i][1])
   }

   // calculate all unique elements
   return(Array.from(new Set(all_elements)))
}

function rand_int(parameterint) {
   // return random integer from 0..parameterint-1
   return Math.floor((Math.random() * parameterint))
}