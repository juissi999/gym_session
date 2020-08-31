import session from './gym_moves.json'
import { randomSession } from './randomSession'

randomSession('root', session.moves, session.series)
