import { bubblechart } from './chart.js'
import './style.css'

const randomSession = (selector, blocks, session_types) => {
  // Js app that lets the user randomize a session.
  // Selector is the element selector of where app is placed,
  // blocks is list of lists of
  // [block_name, [block_impacts_to1, block_impacts_to2, ...]],
  // session_types is a list of session types e.g. ["5min", "10min", "15min"]
  // ascending in intensity.

  const set_darkmode = () => {
    if (darkmodeon) {
      // if dark mode set to on
      btn2.innerHTML = 'L'
      document.body.classList.add('darktheme')
      darkmodeon = true
    } else {
      btn2.innerHTML = 'D'
      document.body.classList.remove('darktheme')
      darkmodeon = false
    }
    savecookies([{ id: 'darkmode', l: darkmodeon }])
  }

  const randbutton_hide_callback = () => {
    div.removeEventListener('transitionend', randbutton_hide_callback)
    div.classList.remove('hidden')
    div.classList.add('visible')

    const max_blocks = 10
    // random how many blocks to include in this session
    const block_count = rand_int(max_blocks)

    // how many different session types are found
    const session_type_count = session_types.length

    // generate workout
    const [session_move_indices, session_intensity_levels] = generate_workout(
      available_blocks.length,
      block_count,
      session_type_count
    )
    display_session(
      session_move_indices,
      session_intensity_levels,
      session_type_count,
      max_blocks
    )
  }

  const display_session = (
    session_move_indices,
    session_intensity_levels,
    intensity_level_count,
    max_blocks
  ) => {
    // map the move_indices to moves
    const session_moves = index_with_array(
      available_blocks,
      session_move_indices
    )

    // calculate muscle coverage things
    const all_block_impacts = calc_unique_elements(get_nested_list(blocks, 1))
    const impacts_in_session = calc_unique_elements(
      get_nested_list(session_moves, 1)
    )
    const coverage = impacts_in_session.length / all_block_impacts.length

    // print page
    let pagestr = ''
    if (session_move_indices.length == 0) {
      pagestr += 'REST! Go to McDonalds.<br>'
    } else {
      pagestr += '<table>'
      for (let i = 0; i < session_moves.length; i++) {
        pagestr += '<tr><td>'
        pagestr += session_types[session_intensity_levels[i]]
        pagestr += '</td><td>'
        pagestr += session_moves[i][0]
        pagestr += '</td></tr>'
      }
      pagestr += '</table>'
    }
    movesDiv.innerHTML = pagestr
    // pagestr += "<br><br>"
    // pagestr += "Muscles in this session:<br>"
    // pagestr += print_list(muscles_in_session)
    // pagestr += "<br><br>"
    // pagestr += "All muscles in database:<br>"
    // pagestr += print_list(all_muscles)
    pagestr = ''
    pagestr += 'Muscle coverage: ' + Math.floor(coverage * 100).toString() + '%'
    pagestr += '<br>'
    pagestr +=
      'Intensity: ' +
      calculate_intensity(
        max_blocks,
        session_intensity_levels,
        intensity_level_count
      ).toString() +
      '%<br>'

    summaryDiv.innerHTML = pagestr

    // take the second value (muscles) from nested lists in database
    const list_of_movelists = get_nested_list(session_moves, 1)

    // form muscle stress object, collect to object muscle name, and intensities
    // it has in the training session
    let duplicate_session_muscles = []
    let muscle_intensities = {}
    for (let i = 0; i < list_of_movelists.length; i++) {
      list_of_movelists[i].forEach(el => {
        duplicate_session_muscles.push(el)
        if (muscle_intensities.hasOwnProperty(el)) {
          muscle_intensities[el].push(session_intensity_levels[i])
        } else {
          muscle_intensities[el] = [session_intensity_levels[i]]
        }
      })
    }

    // form d3-dataobject from muscle stress object
    let vdata = []
    for (let key in muscle_intensities) {
      vdata.push({
        muscle: key,
        count: muscle_intensities[key].length,
        maxintensity: Math.max.apply(Math, muscle_intensities[key])
      })
    }

    bubblechart('#d3Chart', vdata, 300, 300, 30)

    savecookies(
      [
        { id: 'smi', l: session_move_indices },
        { id: 'sil', l: session_intensity_levels },
        { id: 'ilc', l: intensity_level_count },
        { id: 'max_blocks', l: max_blocks }
      ],
      1
    )
  }

  const calculate_intensity = (
    maxmoves,
    intensity_levels,
    intensity_level_count
  ) => {
    // calculate workout intensity, how many series and how intense they are from max

    let sum_intensity = 0
    intensity_levels.map(il => {
      sum_intensity += il + 1
    })

    return Math.floor(
      (sum_intensity * 100) / ((maxmoves - 1) * intensity_level_count)
    )
  }

  const count_in_array = (array, what) => {
    // return how many times an item appears on an array
    // thanks for someone in stackoverflow for letting me go sleep

    let count = 0
    for (let i = 0; i < array.length; i++) {
      if (array[i] === what) {
        count++
      }
    }
    return count
  }

  const index_with_array = (data_array, indexing_array) => {
    // return a new array with elements[indexing_array] from data_ararray
    var newarray = []

    indexing_array.forEach(item => {
      newarray.push(data_array[item])
    })
    return newarray
  }

  const rand_int = parameterint => {
    // return random integer from 0..parameterint-1
    return Math.floor(Math.random() * parameterint)
  }

  const calc_unique_elements = my_list => {
    // Return list of unique elements appear in the list

    var all_elements = []
    for (let i = 0; i < my_list.length; i++) {
      all_elements = all_elements.concat(my_list[i])
    }

    // calculate all unique elements
    return Array.from(new Set(all_elements))
  }

  const get_nested_list = (list_of_lists, elnum) => {
    // this will return the [[a, [], x], [b, c, d]
    // where elnum 2 will return list [x, d]
    // a bit of a shitty solution, rework needed
    var newlist = []
    list_of_lists.forEach(element => {
      newlist.push(element[elnum])
    })
    return newlist
  }

  const print_list = list_to_print => {
    // return a string of a list so that there is break between elements
    var print_literal = ''
    for (let i = 0; i < list_to_print.length; i++) {
      print_literal += list_to_print[i] + ' '
    }
    return print_literal
  }

  const generate_workout = (len_movedb, movecount, intensity_level_count) => {
    // generate workout, randomize move integers and intensity levels
    const session_moves = []
    const session_intensity_levels = []
    const available_moves = []

    // make a vector of numbers 0..len_movedb-1
    for (let i = 0; i != len_movedb; ++i) available_moves.push(i)

    for (let i = 0; i < movecount; i++) {
      const selected_move = rand_int(available_moves.length)
      session_moves.push(available_moves[selected_move])
      session_intensity_levels.push(rand_int(intensity_level_count))
      available_moves.splice(selected_move, 1)
    }
    return [session_moves, session_intensity_levels]
  }

  const loadcookies = () => {
    // cut cookies off of each other
    const cookies = document.cookie.split(';')

    // cut cookie ids and values off of each other
    let loaded_cookies = {}
    cookies.forEach(el => {
      const cookiepair = el.split('=')
      const id = cookiepair[0].trim()
      if (Array.isArray(cookiepair[1])) {
        loaded_cookies[id] = cookiepair[1].split(',')
      } else {
        loaded_cookies[id] = cookiepair[1]
      }
    })
    return loaded_cookies
  }

  const str2int_list = inputlist => {
    // transform a list of "string-numbers" to list of int numbers

    // check that the input is actually a list and not empty string (bugfix)
    if (inputlist == '') {
      return []
    }

    return inputlist.split(',').map(el => Number(el))
  }

  const savecookies = (lists_to_store, days) => {
    // save session for cookie for one day
    // expects a list of objects where "id" is id, and "l" is list of elements
    const expiresattrib = new Date(Date.now() + days * 60 * 60 * 24 * 1000)
    lists_to_store.forEach(el => {
      let str = ''
      if (Array.isArray(el.l)) {
        str = el.l.join()
      } else {
        str = el.l
      }
      document.cookie = el.id + '=' + str + ';expires=' + expiresattrib + ';'
    })
  }

  // code begins
  // generate control-buttons
  const btn = document.createElement('BUTTON')
  btn.innerHTML = 'Random workout'
  document.getElementById(selector).appendChild(btn)
  btn.onclick = () => {
    div.classList.remove('visible')
    div.classList.add('hidden')
    div.addEventListener('transitionend', randbutton_hide_callback)
  }

  const btn2 = document.createElement('BUTTON')
  btn2.innerHTML = 'D'
  document.getElementById(selector).appendChild(btn2)
  btn2.onclick = () => {
    // change darkmode state
    darkmodeon = !darkmodeon
    set_darkmode()
  }

  const div = document.createElement('div')
  div.id = 'gs_div'
  div.classList.add('visible')
  document.getElementById(selector).appendChild(div)

  const movesDiv = document.createElement('div')
  movesDiv.classList.add('boxitem')
  div.appendChild(movesDiv)

  const summaryDiv = document.createElement('div')
  summaryDiv.classList.add('boxitem')
  div.appendChild(summaryDiv)

  const d3chart = document.createElement('div')
  d3chart.id = 'd3Chart'
  div.appendChild(d3chart)

  // default darkmode
  let darkmodeon = false

  // make a temporary copy of block database that we will cut down
  const available_blocks = blocks.slice()

  // cookie stuff
  // check if loaded cookies contain previous session
  var loaded_cookies = loadcookies()
  if (
    'smi' in loaded_cookies &&
    'sil' in loaded_cookies &&
    'ilc' in loaded_cookies &&
    'max_blocks' in loaded_cookies
  ) {
    display_session(
      str2int_list(loaded_cookies['smi']),
      str2int_list(loaded_cookies['sil']),
      Number(loaded_cookies['ilc']),
      Number(loaded_cookies['max_blocks'])
    )
  }

  if ('darkmode' in loaded_cookies) {
    if (loaded_cookies['darkmode'] == 'true') {
      darkmodeon = true
    } else if (loaded_cookies['darkmode'] == 'false') {
      darkmodeon = false
    }
    set_darkmode()
  }
}

export { randomSession }
