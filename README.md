# gym_session
A tool to create a balanced training session on the go. Thanks for @henu for the original idea. Needed for gym practice!



## Demo

NOTE! Use at your own risk and only if you know what you are doing on gym.

<https://juissi999.github.io/gym_session/>



## Mathematical model

The idea of the first version is to create a stateless no-memory website that will randomize a gym session. Muscle balance is important and this is still a problem now because different moves will train different muscle groups and randomization will hence not lean to a balanced distribution. One solution here would be to balance gym_moves, leaving some out, so that the distribution is not heavily leaning to any muscle group. (maybe iterating different subsets)

TODO:

* Test runs to see how the muscle groups are balanced if e.g. 100 000 sessions are simulated
* Real database with a source for muscles
* Unit tests, this software is for real training use so it needs to work.
* Cookies to store the session if user accidentally closes the browser or tab and also maybe only allow one version of the workout per day to avoid user choosing "nice workout" which will affect randomization.