var gym_session = function (selector, $) {
   // js app that lets the user randomize gym workouts

   // first load libraries and after call libs_loaded_callback
   $.getScript("https://d3js.org/d3.v5.min.js", libs_loaded_callback())

   function libs_loaded_callback() {

      $(selector).append("<input id=\"randb\" type=\"button\" style=\"font-size: 18px\" value=\"Random workout\"></input>");
      $(selector).append("<div id=\"gs_div\"></div>");

      // <div id="options"></div>
      // generate buttons
      // var optionstr = "";
      //for (i = 0; i < window.series.length; i++) {
         //optionstr += "<input id=\"rb" + i + "\" type=\"button\" value=\"" + window.series[i] + "\">";
      //}
      //document.getElementById("options").innerHTML = optionstr;

      // clickfunction for randomizer button
      $("#randb").click(function validateForm() {
         $("#gs_div").hide(700, randbutton_hide_callback);
      });

      var maxmoves = 10;

      function randbutton_hide_callback() {
         // make a temporary copy of all moves that we will cut down
         var available_moves = moves.slice();
         
         // random how many moves to do today
         var movecount = rand_int(maxmoves); // here +1 if not want a rest day
         
         // how many different series are found (ascending in intensity)
         var intensity_level_count = series.length;
         
         // generate workout
         const [session_move_indices, session_intensity_levels] = generate_workout(available_moves.length, movecount, intensity_level_count);

         // map the move_indices to moves
         session_moves = index_with_array(available_moves, session_move_indices);

         // calculate muscle coverage things
         var all_muscles = calc_unique_elements(moves);
         var muscles_in_session = calc_unique_elements(session_moves);
         var coverage = muscles_in_session.length/all_muscles.length;

         // print page
         var pagestr = "<br><table>";
         for (i = 0; i < session_moves.length; i++) {;
            pagestr += "<tr><td>";
            pagestr += series[session_intensity_levels[i]];
            pagestr += "</td><td>";
            pagestr += session_moves[i][0];
            pagestr += "</td></tr>";
         }
         pagestr += "</table>"
         if (movecount ==0){
            pagestr += "REST! Go to McDonalds."
         }
         
         pagestr += "<br><br>"
         pagestr += "Muscles in this session:<br>"
         pagestr += print_list(muscles_in_session)
         pagestr += "<br><br>"
         pagestr += "All muscles in database:<br>"
         pagestr += print_list(all_muscles)
         pagestr += "<br><br>"
         pagestr += "Muscle coverage: " + Math.floor(coverage*100).toString() + "%"
         pagestr += "<br>"
         pagestr += "Intensity: " + calculate_intensity(maxmoves, session_intensity_levels, intensity_level_count).toString() + "%"
         
         // this extra br because svg added
         pagestr += "<br>"
         document.getElementById("gs_div").innerHTML = pagestr

         // take the second value (muscles) from nested lists in database
         list_of_movelists = get_nested_list(session_moves, 1);

         // concatenate lists of many to one list
         var duplicate_session_muscles = [];
         list_of_movelists.forEach( element => {
            element.forEach(el => {
               duplicate_session_muscles.push(el)
            });
         });

         var vdata = [];
         for (i = 0; i < muscles_in_session.length; i++) {
            var muscle = muscles_in_session[i]
            vdata.push({"muscle":muscle, "count":count_in_array(duplicate_session_muscles, muscle)*30})
         }

         // var example_data = [{"muscle":"moi", "count":30},
         generate_bubblechart("#gs_div", vdata);
         
         $("#gs_div").show(700)
      }

      function calculate_intensity(maxmoves, intensity_levels, intensity_level_count) {
         // calculate workout intensity, how many series and how intense they are from max
         
         var sum_intensity = 0
         for (i = 0; i < intensity_levels.length; i++) {
            sum_intensity += intensity_levels[i] + 1
         }
         
         return Math.floor(sum_intensity*100/((maxmoves-1)*intensity_level_count))
      }

      function count_in_array(array, what) {
         // return how many times an item appears on an array
         // thanks for someone in stackoverflow for letting me go sleep

         var count = 0;
         for (var i = 0; i < array.length; i++) {
             if (array[i] === what) {
                 count++;
             }
         }
         return count;
     }

      function index_with_array(data_array, indexing_array) {
         // return a new array with elements[indexing_array] from data_ararray
         var newarray = [];

         indexing_array.forEach( function (item) {
            newarray.push(data_array[item]);
         });
         return newarray;
      }

      function rand_int(parameterint) {
         // return random integer from 0..parameterint-1
         return Math.floor((Math.random() * parameterint))
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

      function get_nested_list(list_of_lists, elnum) {
         // this will return the [[a, [], x], [b, c, d]
         // a bit of a shitty solution, rework needed
         var newlist = []
         list_of_lists.forEach(element => {
            newlist.push(element[elnum])
         });
         return newlist;
      }

      function print_list(list_to_print) {
         // return a string of a list so that there is break between elements
         var print_literal = "";
         for (i = 0; i < list_to_print.length; i++) {
            print_literal += list_to_print[i] + " ";
         }
         return print_literal;
      }

      function generate_workout(len_movedb, movecount, intensity_level_count) {
         // generate workout, randomize move integers and intensity levels
         var session_moves = [];
         var session_intensity_levels = [];
         var available_moves = [];

         // make a vector of numbers 0..len_movedb-1
         for (var i = 0; i != len_movedb; ++i) available_moves.push(i);
         
         for (i = 0; i < movecount; i++) {
            var selected_move = rand_int(available_moves.length);
            session_moves.push(available_moves[selected_move]);
            session_intensity_levels.push(rand_int(intensity_level_count));
            available_moves.splice(selected_move, 1);
         }
         return [session_moves, session_intensity_levels];
      }

      function generate_bubblechart(element, vdata) {
         // make a bubble chart d3 visualization
         var width = 300
         var height = 300

         var svg = d3.select(element).append("svg")
                     .attr("height", height)
                     .attr("width", width)

         var circles = svg.selectAll("circle")
                     .data(vdata)
                     .enter().append("circle")
                     .attr("r", function (d) {return d.count})
                     .style("fill", "lightblue");

         var texts = svg.selectAll("texts")
                     .data(vdata)
                     .enter().append("text")
                     .text(function (d) {
                        return d.muscle;
                     })
                     .attr("text-anchor", "middle")
                     .attr('font-size', 15)
                     .style("fill", "black")

         var simulation = d3.forceSimulation()
            .force("x", d3.forceX(width/2).strength(0.05))
            .force("y", d3.forceY(height/2).strength(0.05))
            .force("collide", d3.forceCollide(function(d) {
                return d.count + 1
            }))

        simulation.nodes(vdata)
            .on("tick", ticked)

         function ticked() {
            circles
               .attr("cx", function(d) {
                  return d.x
               })
               .attr("cy", function(d) {
                  return d.y
               });

            texts
               .attr("x", function (d) {
                  return d.x
              })
              .attr("y", function (d) {
                  return d.y
              });
         }

      }

   }

}