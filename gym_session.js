function calculate_intensity(maxmoves, intensity_levels, intensity_level_count) {
   // calculate workout intensity, how many series and how intense they are from max
   
   var sum_intensity = 0
   for (i = 0; i < intensity_levels.length; i++) {
      sum_intensity += intensity_levels[i] + 1
   }
   
   return Math.floor(sum_intensity*100/((maxmoves-1)*intensity_level_count))
}

function rand_int(parameterint) {
   // return random integer from 0..parameterint-1
   return Math.floor((Math.random() * parameterint))
}

function calc_unique_elements(movelist) {
   // Return list of unique elements appear in the list
   
   var all_elements = []
   for (i = 0; i < movelist.length; i++) {
      all_elements = all_elements.concat(movelist[i][1])
   }

   // calculate all unique elements
   return(Array.from(new Set(all_elements)))
}

function print_list(list_to_print) {
   // return a string of a list so that there is break between elements
   var print_literal = ""
   for (i = 0; i < list_to_print.length; i++) {
      print_literal += list_to_print[i] + " "
   }
   return print_literal
}

function generate_workout(available_moves, movecount, intensity_level_count) {
   // generate workout, randomize moves and intensity levels
   var session_moves = []
   var session_intensity_levels = []
   
   for (i = 0; i < movecount; i++) {
      var selected_move = rand_int(available_moves.length)
      session_moves.push(available_moves[selected_move])
      session_intensity_levels.push(rand_int(intensity_level_count))
      available_moves.splice(selected_move, 1)
   }
   return [session_moves, session_intensity_levels]
}