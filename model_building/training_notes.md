# Training expirements and thoughts

## After initial build
  * Model doesn't converge.
    * Min distence between goal and start is 7 moves.
    * Gym session length is currenly only 40. Seems highly unlikely to make the correct choices in that amount of time.

## Experimentations
### 1)
  * Reduce size of grid to 5 to make it more likely to find the goal even with random moves.
    ```
    POLICY: BoltzmannQPolicy()
    HYPERPARAMS: 2x 24 node hidden layers, 5x5 grid, 40 moves per episode, warmup = 10, nb_steps = 50,000
    REWARDS: -20 time out, 20 find goal, -.2 invalid move, -.1 every move
    RESULT: Saw some imporvement.
    Testing for 15 episodes ...
    Episode 1: reward: -23.900, steps: 40
    Episode 2: reward: -27.600, steps: 40
    Episode 3: reward: -27.500, steps: 40
    Episode 4: reward: -23.900, steps: 40
    Episode 5: reward: 19.800, steps: 3
    Episode 6: reward: -27.500, steps: 40
    Episode 7: reward: -23.900, steps: 40
    Episode 8: reward: 19.600, steps: 5
    Episode 9: reward: -23.900, steps: 40
    Episode 10: reward: 19.700, steps: 4
    Episode 11: reward: -23.900, steps: 40
    Episode 12: reward: -23.900, steps: 40
    Episode 13: reward: -23.900, steps: 40
    Episode 14: reward: -27.600, steps: 40
    Episode 15: reward: 19.800, steps: 3
    mean reward = -13.24
    ```
### 2) 
  * Going to increase the size of our 2 hidden nodes to 100 to attempt to achieve more consistent performance.
    ```
    POLICY: BoltzmannQPolicy()
    HYPERPARAMS: 2x 100 node hidden layers, 5x5 grid, 40 moves per episode, warmup = 10, mem_limit = 50,000, nb_steps = 50,000
    REWARDS: -20 time out, 20 find goal, -.2 invalid move, -.1 every move
    RESULT: Little to no improvement.
    Testing for 15 episodes ...
    Episode 1: reward: -27.100, steps: 40
    Episode 2: reward: -23.900, steps: 40
    Episode 3: reward: -23.900, steps: 40
    Episode 4: reward: 19.300, steps: 8
    Episode 5: reward: -27.400, steps: 40
    Episode 6: reward: -27.700, steps: 40
    Episode 7: reward: -23.900, steps: 40
    Episode 8: reward: -23.900, steps: 40
    Episode 9: reward: 19.500, steps: 6
    Episode 10: reward: -27.800, steps: 40
    Episode 11: reward: -23.900, steps: 40
    Episode 12: reward: -27.800, steps: 40
    Episode 13: reward: 19.500, steps: 6
    Episode 14: reward: 19.500, steps: 6
    Episode 15: reward: -27.700, steps: 40
    -13.813333333333336
    ```
### 3) 
  * Increased warmup steps by a factor of 10 and doubled the total steps.
    ```
    POLICY: BoltzmannQPolicy()
    HYPERPARAMS: 2x 100 node hidden layers, 5x5 grid, 40 moves per episode, warmup = 100, mem_limit = 50,000, nb_steps= 100,000
    REWARDS: -20 time out, 20 find goal, -.2 invalid move, -.1 every move
    RESULT: Much improved! almost 50% successrate
    Testing for 15 episodes ...
    Episode 1: reward: 19.800, steps: 3
    Episode 2: reward: 19.700, steps: 4
    Episode 3: reward: -27.800, steps: 40
    Episode 4: reward: 19.700, steps: 4
    Episode 5: reward: -27.700, steps: 40
    Episode 6: reward: -23.900, steps: 40
    Episode 7: reward: -23.900, steps: 40
    Episode 8: reward: 19.700, steps: 4
    Episode 9: reward: 19.700, steps: 4
    Episode 10: reward: 19.800, steps: 3
    Episode 11: reward: -27.300, steps: 40
    Episode 12: reward: 19.700, steps: 4
    Episode 13: reward: -27.600, steps: 40
    Episode 14: reward: -27.700, steps: 40
    Episode 15: reward: -27.700, steps: 40
    -5.033333333333335
    ```
### 4) 
  * Adding 2 more hidden layers
    ```
    POLICY: BoltzmannQPolicy()
    HYPERPARAMS: 4x 100 node hidden layers, 5x5 grid, 40 moves per episode, warmup = 100, mem_limit = 50,000, nb_steps= 100,000
    REWARDS: -20 time out, 20 find goal, -.` invalid move, -.1 every move
    RESULT: Little changed.
    Testing for 15 episodes ...
    Episode 1: reward: 19.600, steps: 5
    Episode 2: reward: -27.800, steps: 40
    Episode 3: reward: 19.400, steps: 7
    Episode 4: reward: -23.900, steps: 40
    Episode 5: reward: -27.700, steps: 40
    Episode 6: reward: 19.400, steps: 7
    Episode 7: reward: 19.500, steps: 6
    Episode 8: reward: 19.700, steps: 4
    Episode 9: reward: 19.400, steps: 7
    Episode 10: reward: 19.400, steps: 7
    Episode 11: reward: -27.600, steps: 40
    Episode 12: reward: -23.900, steps: 40
    Episode 13: reward: -23.900, steps: 40
    Episode 14: reward: -27.600, steps: 40
    Episode 15: reward: -27.600, steps: 40
    -4.906666666666668
    ```
### 5) 
  * changing policy.
    * based on this article https://medium.com/@madeshselvarani/how-to-solve-atari-games-with-keras-rl2-part-1-2020-50c0ebfba777
    ```
    POLICY: LinearAnnealedPolicy(EpsGreedyQPolicy(), 
                              attr='eps',
                              value_max=1.,
                              value_min=.1,
                              value_test=.05,
                              nb_steps=1000000)
    HYPERPARAMS: 4x 100 node hidden layers, 5x5 grid, 40 moves per episode, warmup = 100, mem_limit = 50,000, nb_steps= 100,000, 
    lr = 2.5e-4
    REWARDS: -20 time out, 20 find goal, -.2 invalid move, -.1 every move
    RESULT: ...failure
    
    ```
### 6) 
  * reseting and tuning rewards/game length
    ```
    POLICY: BoltzmannQPolicy()
    HYPERPARAMS: 2x 100 node hidden layers, 5x5 grid, 20 moves per episode, warmup = 100, mem_limit = 100,000, nb_steps= 100,000, 
    lr = 1e-3
    REWARDS: -20 time out, 20 find goal, -.1 invalid move, -.1 every move
    RESULT: Performs well.
    Testing for 15 episodes ...
    Episode 1: reward: 19.700, steps: 4
    Episode 2: reward: 19.600, steps: 5
    Episode 3: reward: 19.300, steps: 8
    Episode 4: reward: 19.700, steps: 4
    Episode 5: reward: 19.600, steps: 5
    Episode 6: reward: -21.900, steps: 20
    Episode 7: reward: 19.700, steps: 4
    Episode 8: reward: 19.700, steps: 4
    Episode 9: reward: -21.900, steps: 20
    Episode 10: reward: 19.700, steps: 4
    Episode 11: reward: -21.900, steps: 20
    Episode 12: reward: -21.900, steps: 20
    Episode 13: reward: 19.800, steps: 3
    Episode 14: reward: 19.700, steps: 4
    Episode 15: reward: 19.700, steps: 4
    Mean Reward: 8.57333333333333
    Win Rate: 73.0%
    ```
### 7) 
  * increasing training time by an order of magnitude
    ```
    POLICY: BoltzmannQPolicy()
    HYPERPARAMS: 2x 100 node hidden layers, 5x5 grid, 20 moves per episode, warmup = 100, mem_limit = 100,000, nb_steps= 1,000,000, 
    lr = 1e-3
    REWARDS: -20 time out, 20 find goal, -.1 invalid move, -.1 every move
    RESULT: Very poor. mean_q spiked near the end of training and results seem worse than random
    
    ```

## Increased Grid Size Experiment
### 1) 
  * beginning with experiment number 6 config from above. Increased grid size to 10x10, adjusted num_moves
    ```
    POLICY: BoltzmannQPolicy()
    HYPERPARAMS: 2x 100 node hidden layers, 10x10 grid, 40 moves per episode, warmup = 100, mem_limit = 100,000, nb_steps= 100,000, 
    lr = 1e-3
    REWARDS: -20 time out, 20 find goal, -.1 invalid move, -.1 every move
    RESULT: Failure.
    ```
### 2) 
  * updating reward structure. moves per episode and mem_limit now scale with size.
    * rewards now based on https://www.samyzaf.com/ML/rl/qmaze.html
    ```
    POLICY: BoltzmannQPolicy()
    HYPERPARAMS: 2x 100 node hidden layers, 10x10 grid, (size^2)/2 moves per episode, warmup = 100, mem_limit = 8*size^2, 
    nb_steps= 300,000, lr = 1e-3
    REWARDS: -1 time out, 1 find goal, -.8 invalid move, -.04 every move
    RESULT: Failure.
    ```
### 3)
  * Should I be randomly generating a board every time? Is the idea to train on one board then it can generalize to arbitrary boards later?
    * Setting static X,Y positions for player and goal
    ```
    POLICY: BoltzmannQPolicy()
    HYPERPARAMS: 2x 100 node hidden layers, 10x10 grid, (size^2)/2 moves per episode, warmup = 100, mem_limit = 8*size^2, 
    nb_steps= 100,000, lr = 1e-3
    REWARDS: -1 time out, 1 find goal, -.8 invalid move, -.04 every move
    RESULT: Perfect performance. Can be achieved with as little as 10,000 steps this way
    ```
### 4)
  * I still want to try to generalize. 
    * I will now add a punishment to revisiting a node.
    ```
    POLICY: BoltzmannQPolicy()
    HYPERPARAMS: 2x 100 node hidden layers, 10x10 grid, (size^2)/2 moves per episode, warmup = 100, mem_limit = 8*size^2, 
    nb_steps= 100,000, lr = 1e-3
    REWARDS: -1 time out, 1 find goal, -.8 invalid move, -.04 every move, -.25 backtrack
    RESULT: Back track punishment seems to lead to a stalled state in multigoal environment
    ```

## Playing on a predefined maze.
  ### Original Matrix
  
  ```
  [[1,1,1,1,1,1,1,1,1,1],
   [1,2,0,0,0,0,0,0,0,1],
   [1,1,1,0,1,1,1,0,1,1],
   [1,0,0,0,0,1,0,0,0,1],
   [1,0,1,1,0,1,0,1,0,1],
   [1,0,1,1,0,3,0,1,0,1],
   [1,0,0,0,1,0,0,1,0,1],
   [1,1,1,0,1,0,1,1,0,1],
   [1,3,0,0,1,0,0,0,3,1],
   [1,1,1,1,1,1,1,1,1,1]]
  ```

  * It was pretty easy to get it to find the first 2 goals. It always went to the middle then the right one no matter how much I tweaked the rewards.
    * Tried penalizing backtracking
    * Tried rewarding decreasing cartisean distance to nearest goal
  * Found this paper that has me thinking this may be a harder problem than I thought.
    * http://proceedings.mlr.press/v119/pitis20a/pitis20a.pdf
    * It's all about getting RL agents to master 'long-horizon, sparse reward tasks' which this maze may qualify as.
  ### Easier Matrix
  * Giving the agent a short cut to the final goal to see if it will find it.
  ```
  [[1,1,1,1,1,1,1,1,1,1],
   [1,0,0,0,0,0,0,0,0,1],
   [1,1,1,0,1,1,1,0,1,1],
   [1,0,0,0,0,1,0,0,0,1],
   [1,0,1,1,1,1,0,1,0,1],
   [1,0,1,1,0,3,0,1,0,1],
   [1,0,0,0,0,0,0,1,0,1],
   [1,1,1,0,1,0,1,1,0,1],
   [1,3,0,0,1,0,0,0,3,1],
   [1,1,1,1,1,1,1,1,1,1]]
  ```
  * Found it, no problem. Simple reward structure. No rewards for back_tracking or getting closer.