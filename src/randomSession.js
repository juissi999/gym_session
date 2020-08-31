import { bubblechart } from './chart.js'
import randomPermutation from 'random-permutation'
import './style.css'

const randomSession = (selector, blocks, intensityLevels) => {
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
    saveCookies([{ id: 'darkmode', value: darkmodeon.toString() }])
  }

  const randbuttonHideCallback = () => {
    div.removeEventListener('transitionend', randbuttonHideCallback)
    div.classList.remove('hidden')
    div.classList.add('visible')

    const maxBlocks = 10
    // random how many blocks to include in this session
    const blockCount = randInt(maxBlocks)

    // how many different session types are found
    const intensityLevelCount = intensityLevels.length

    // generate workout
    const session = generateWorkout(blocks, blockCount, intensityLevels)
    displaySession(session, intensityLevelCount, maxBlocks)
  }

  const displaySession = (session, intensityLevelCount, maxBlocks) => {
    // map the moveIndices to moves

    // calculate muscle coverage things (first concat nested lists on element 1)
    const allEffects = blocks.reduce((prev, cur) => prev.concat(cur[1]), [])

    const effectsInSession = session.reduce(
      (prev, cur) => prev.concat(cur.effects),
      []
    )

    const coverage =
      uniqueElements(effectsInSession).length /
      uniqueElements(allEffects).length

    // form muscle stress object, collect to object muscle name, and intensities
    // it has in the training session
    const effects = calcEffects(session)

    // print page
    let pagestr = ''
    if (session.length == 0) {
      pagestr += 'REST! Go to McDonalds.<br>'
    } else {
      pagestr += '<table>'
      for (let i = 0; i < session.length; i++) {
        pagestr += '<tr><td>'
        pagestr += session[i].intensityName
        pagestr += '</td><td>'
        pagestr += session[i].action
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
        session.map(b => b.intensity),
        intensityLevelCount
      ).toString() +
      '%<br>'

    summaryDiv.innerHTML = pagestr

    bubblechart('#d3Chart', effects, 300, 300, 30)

    saveCookies([
      { id: 'session', value: JSON.stringify(session) },
      { id: 'maxBlocks', value: maxBlocks.toString() },
      { id: 'intensityLevelCount', value: intensityLevelCount.toString() }
    ])
  }

  const loadCookies = () => {
    // cut cookies off of each other
    const cookies = document.cookie.split(';')

    // cut cookie ids and values off of each other
    let loadedCookies = {}
    cookies.forEach(el => {
      const cookiepair = el.split('=')
      const id = cookiepair[0].trim()
      loadedCookies[id] = cookiepair[1]
    })
    return loadedCookies
  }

  const saveCookies = (listToStore, days) => {
    // save session for cookie for one day
    // expects a list of objects where "id" is id, and "l" is list of elements
    const expiresattrib = new Date(Date.now() + days * 60 * 60 * 24 * 1000)
    listToStore.forEach(el => {
      document.cookie =
        el.id + '=' + el.value + ';expires=' + expiresattrib + ';'
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
    'session' in loadedCookies &&
    'max_blocks' in loadedCookies &&
    'intensityLevelCount' in loadedCookies
  ) {
    displaySession(
      JSON.parse(loadedCookies['session']),
      Number(loadedCookies['intensityLevelCount']),
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

const calculateIntensity = (maxmoves, intensityLevels, intensityLevelCount) => {
  // calculate workout intensity, how many series and how intense they are from max
  // TODO: check this calculation with test data

  let sumIntensity = 0
  intensityLevels.map(il => {
    sumIntensity += il + 1
  })

  return Math.floor(
    (sumIntensity * 100) / ((maxmoves - 1) * intensityLevelCount)
  )
}

const generateWorkout = (blocks, movecount, intensityLevels) => {
  // generate workout, randomize move integers and intensity levels
  const session = []

  // make a permutation
  const permutation = randomPermutation(blocks.length)

  for (let i = 0; i < movecount; i++) {
    // index movedb from the beginning of permutation
    const intensityLevel = randInt(intensityLevels.length)
    session.push({
      action: blocks[permutation[i]][0],
      effects: blocks[permutation[i]][1],
      intensityName: intensityLevels[intensityLevel],
      intensity: intensityLevel
    })
  }

  return session
}

const calcEffects = session => {
  let allEffects = []
  session.map((move, i) => {
    move.effects.map((effect, j) => {
      let foundInt = allEffects.find(m => m.effect === effect)
      if (foundInt) {
        foundInt = {
          ...foundInt,
          intensities: foundInt.intensities.push(move.intensity)
        }
      } else {
        allEffects.push({
          effect: effect,
          intensities: [session[i].intensity]
        })
      }
    })
  })

  return allEffects
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

const uniqueElements = myList => {
  // Return list of unique elements appear in the list

  return Array.from(new Set(myList))
}

export { randomSession }
