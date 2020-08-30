import { bubblechart } from './chart.js'
import randomPermutation from 'random-permutation'
import './style.css'

const randomSession = (selector, blocks, sessionTypes) => {
  // Js app that lets the user randomize a session.
  // Selector is the element selector of where app is placed,
  // blocks is list of lists of
  // [blockName, [blockImpactsTo1, blockImpactsTo2, ...]],
  // sessionTypes is a list of session types e.g. ["5min", "10min", "15min"]
  // ascending in intensity.

  const setDarkmode = () => {
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
    saveCookies([{ id: 'darkmode', l: darkmodeon }])
  }

  const randbuttonHideCallback = () => {
    div.removeEventListener('transitionend', randbuttonHideCallback)
    div.classList.remove('hidden')
    div.classList.add('visible')

    const maxBlocks = 10
    // random how many blocks to include in this session
    const blockCount = randInt(maxBlocks)

    // how many different session types are found
    const sessionTypeCount = sessionTypes.length

    // generate workout
    const [sessionMoveIndices, sessionIntensityLevels] = generateWorkout(
      availableBlocks.length,
      blockCount,
      sessionTypeCount
    )
    displaySession(
      sessionMoveIndices,
      sessionIntensityLevels,
      sessionTypeCount,
      maxBlocks
    )
  }

  const displaySession = (
    sessionMoveIndices,
    sessionIntensityLevels,
    intensityLevelCount,
    maxBlocks
  ) => {
    // map the moveIndices to moves
    const sessionMoves = indexWithArray(availableBlocks, sessionMoveIndices)

    // calculate muscle coverage things
    const allBlockImpacts = calcUniqueElements(getNestedList(blocks, 1))
    const impactsInSession = calcUniqueElements(getNestedList(sessionMoves, 1))
    const coverage = impactsInSession.length / allBlockImpacts.length

    // print page
    let pagestr = ''
    if (sessionMoveIndices.length == 0) {
      pagestr += 'REST! Go to McDonalds.<br>'
    } else {
      pagestr += '<table>'
      for (let i = 0; i < sessionMoves.length; i++) {
        pagestr += '<tr><td>'
        pagestr += sessionTypes[sessionIntensityLevels[i]]
        pagestr += '</td><td>'
        pagestr += sessionMoves[i][0]
        pagestr += '</td></tr>'
      }
      pagestr += '</table>'
    }
    movesDiv.innerHTML = pagestr
    // pagestr += "<br><br>"
    // pagestr += "Muscles in this session:<br>"
    // pagestr += printList(musclesInSession)
    // pagestr += "<br><br>"
    // pagestr += "All muscles in database:<br>"
    // pagestr += printList(allMuscles)
    pagestr = ''
    pagestr += 'Muscle coverage: ' + Math.floor(coverage * 100).toString() + '%'
    pagestr += '<br>'
    pagestr +=
      'Intensity: ' +
      calculateIntensity(
        maxBlocks,
        sessionIntensityLevels,
        intensityLevelCount
      ).toString() +
      '%<br>'

    summaryDiv.innerHTML = pagestr

    // take the second value (muscles) from nested lists in database
    const listOfMovelists = getNestedList(sessionMoves, 1)
    console.log(sessionMoves)

    // form muscle stress object, collect to object muscle name, and intensities
    // it has in the training session
    let muscleIntensities = {}
    for (let i = 0; i < listOfMovelists.length; i++) {
      listOfMovelists[i].forEach(el => {
        if (muscleIntensities.hasOwnProperty(el)) {
          muscleIntensities[el].push(sessionIntensityLevels[i])
        } else {
          muscleIntensities[el] = [sessionIntensityLevels[i]]
        }
      })
    }

    // form d3-dataobject from muscle stress object
    let vdata = []
    for (let key in muscleIntensities) {
      vdata.push({
        muscle: key,
        count: muscleIntensities[key].length,
        maxintensity: Math.max.apply(Math, muscleIntensities[key])
      })
    }

    bubblechart('#d3Chart', vdata, 300, 300, 30)

    saveCookies(
      [
        { id: 'smi', l: sessionMoveIndices },
        { id: 'sil', l: sessionIntensityLevels },
        { id: 'ilc', l: intensityLevelCount },
        { id: 'max_blocks', l: maxBlocks }
      ],
      1
    )
  }

  const calculateIntensity = (
    maxmoves,
    intensityLevels,
    intensityLevelCount
  ) => {
    // calculate workout intensity, how many series and how intense they are from max

    let sumIntensity = 0
    intensityLevels.map(il => {
      sumIntensity += il + 1
    })

    return Math.floor(
      (sumIntensity * 100) / ((maxmoves - 1) * intensityLevelCount)
    )
  }

  const countInArray = (array, what) => {
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

  const indexWithArray = (dataArray, indexingArray) => {
    // return a new array with elements[indexingArray] from dataArarray
    var newarray = []

    indexingArray.forEach(item => {
      newarray.push(dataArray[item])
    })
    return newarray
  }

  const randInt = parameterint => {
    // return random integer from 0..parameterint-1
    return Math.floor(Math.random() * parameterint)
  }

  const calcUniqueElements = myList => {
    // Return list of unique elements appear in the list

    var allElements = []
    for (let i = 0; i < myList.length; i++) {
      allElements = allElements.concat(myList[i])
    }

    // calculate all unique elements
    return Array.from(new Set(allElements))
  }

  const getNestedList = (listOfLists, elnum) => {
    // this will return the [[a, [], x], [b, c, d]
    // where elnum 2 will return list [x, d]
    // a bit of a shitty solution, rework needed
    const newlist = []
    listOfLists.forEach(element => {
      newlist.push(element[elnum])
    })
    return newlist
  }

  const printList = listToPrint => {
    // return a string of a list so that there is break between elements
    let printLiteral = ''
    for (let i = 0; i < listToPrint.length; i++) {
      printLiteral += listToPrint[i] + ' '
    }
    return printLiteral
  }

  const generateWorkout = (lenMovedb, movecount, intensityLevelCount) => {
    // generate workout, randomize move integers and intensity levels
    const sessionMoves = []
    const sessionIntensityLevels = []

    // make a permutation
    const permutation = randomPermutation(lenMovedb)

    for (let i = 0; i < movecount; i++) {
      // index movedb from the beginning of permutation
      sessionMoves.push(permutation[i])
      sessionIntensityLevels.push(randInt(intensityLevelCount))
    }

    return [sessionMoves, sessionIntensityLevels]
  }

  const loadCookies = () => {
    // cut cookies off of each other
    const cookies = document.cookie.split(';')

    // cut cookie ids and values off of each other
    let loadedCookies = {}
    cookies.forEach(el => {
      const cookiepair = el.split('=')
      const id = cookiepair[0].trim()
      if (Array.isArray(cookiepair[1])) {
        loadedCookies[id] = cookiepair[1].split(',')
      } else {
        loadedCookies[id] = cookiepair[1]
      }
    })
    return loadedCookies
  }

  const str2intList = inputlist => {
    // transform a list of "string-numbers" to list of int numbers

    // check that the input is actually a list and not empty string (bugfix)
    if (inputlist == '') {
      return []
    }

    return inputlist.split(',').map(el => Number(el))
  }

  const saveCookies = (listsToStore, days) => {
    // save session for cookie for one day
    // expects a list of objects where "id" is id, and "l" is list of elements
    const expiresattrib = new Date(Date.now() + days * 60 * 60 * 24 * 1000)
    listsToStore.forEach(el => {
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
    div.addEventListener('transitionend', randbuttonHideCallback)
  }

  const btn2 = document.createElement('BUTTON')
  btn2.innerHTML = 'D'
  document.getElementById(selector).appendChild(btn2)
  btn2.onclick = () => {
    // change darkmode state
    darkmodeon = !darkmodeon
    setDarkmode()
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
  const availableBlocks = blocks.slice()

  // cookie stuff
  // check if loaded cookies contain previous session
  var loadedCookies = loadCookies()
  if (
    'smi' in loadedCookies &&
    'sil' in loadedCookies &&
    'ilc' in loadedCookies &&
    'max_blocks' in loadedCookies
  ) {
    displaySession(
      str2intList(loadedCookies['smi']),
      str2intList(loadedCookies['sil']),
      Number(loadedCookies['ilc']),
      Number(loadedCookies['max_blocks'])
    )
  }

  if ('darkmode' in loadedCookies) {
    if (loadedCookies['darkmode'] == 'true') {
      darkmodeon = true
    } else if (loadedCookies['darkmode'] == 'false') {
      darkmodeon = false
    }
    setDarkmode()
  }
}

export { randomSession }
