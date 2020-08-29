import session from './gym_moves.json'
import { randomSession } from './random_session'

randomSession('root', session.moves, session.series)
