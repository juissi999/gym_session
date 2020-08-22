const session = require("./gym_moves")
const random_session = require("./random_session")

random_session("root", session.moves, session.series)