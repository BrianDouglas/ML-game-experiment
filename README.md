# ML-game-experiment
UC-davis data science bootcamp final project utilizing RL to train ai to play a simple maze game

## I. Reinforcement Learning (RL) Training Process
  
  ### 1) Results and Insights
   This model performs optimally when all is said and done. However, I set out with a goal to be able to generate a randomized maze and have the RL agent solve it. From watching a lot of lectures and reading papers trying to achieve this goal, I've gleaned that generalized tasks like that are much more difficult than I anticipated. While this model would be able to solve most mazes given to it. It would require training on that specific maze each time. This is just the nature of a DQN agent and Q Learning in general. I hope to look in to more generalizable solutions in the future.
    
   I'm hoping to capture a large amount of user data. I would like to run an experiment using the data to create a supervised learning model. I could then compare the performance between the two models.

  ### 2) Environment (OpenAI Gym)
  * Files located in model_building folder.
    * Jupyter notebook for the Env class and training
    * .md file for notes on experimentation
  * Extended the Env class to make a custom environment.
  * Action space includes 4 Discrete actions.
    * UP, DOWN, LEFT, RIGHT
  * Observations space is a 10x10 grid.
    * Each point can have a value an int value in range [1, 3].
  * 200 steps per episode.
    * _This is likely higher than it needs to be._
  * Reward Structure
    * -0.04 for valid moves to discourage behaviors that made new progress.
    * -0.5 for invalid moves to discourage moving into walls.
    * +20 for finding each goal.
    * -20 if time ran out without finding final goal.
  * Rendering.
    * Matplotlib.pyplot visualization of the grid at each state.

  ### 3) Model
  * Sequential model using tensorflow.keras
  * Input
    * 2d matrix flattened in first layer.
  * Hidden layers
    * 2x 100 node fully connected Dense layers.
    * ReLU activation.
  * Output
    * 4 node dense output layer. One of each action.
    * Linear activation.
  ```
    Model: "sequential"
    _________________________________________________________________
    Layer (type)                 Output Shape              Param #   
    =================================================================
    flatten (Flatten)            (None, 100)               0         
    _________________________________________________________________
    dense (Dense)                (None, 100)               10100     
    _________________________________________________________________
    dense_1 (Dense)              (None, 100)               10100     
    _________________________________________________________________
    dense_2 (Dense)              (None, 4)                 404       
    =================================================================
    Total params: 20,604
    Trainable params: 20,604
    Non-trainable params: 0
    _________________________________________________________________
  ```
  ### 4) Agent
  * Deep Q-Network (DQN) from package keras-rl2
  * Policy
    * BoltzmannQPolicy 
    * Would like to expirement with other policies in the future. Potentially write my own.
    * Trained over 100,000 steps.
      * _This is likely to be overkill_

## II. Website Design
  ### 1) Backend
  * Python utilizing Flask for server code. 
    * 3 main routes serve basic html
      * index
      * machine
      * data
    * "/json_data" route
      * end point for d3 to pull the latest aggregated play data
    * "/game_data"
      * Ajax request sent to this route at the end of every human played game.
      * Inserts game record into DB
    * queryDB is a command line utility function.
      * Querying the database to create the aggregate data .json file will become quite a large task as the database grows. I'll likely set up a schedule to run this function periodically. For now, I can run it manually when I want to update visualization data instead of it running every time a user requests the data.
  * MongoDB Atlas for data storage
    * One collection.
      * Each record has a timestamp of when the game took place and a list of states and the action taken in that state.

  ### 2) Frontend
  * Javascript
    * 2 logic files for Human Play and Data Analysis pages
      * Main responsibility is to build grid, set up event handlers and process moves
        * Human play has additional responsibility of sending gameplay data to the server.
        * Data Analysis has additional responsibility of getting aggregated gameplay data from the server
      * These files both impliment classes that are very similar. I plan to write a parent class for the grid system and have these 2 logic files extend that class.
    * Packages
      * d3 for fetching json data from server
      * Chartjs for generating data visualization.
  * CSS
    * bootstrap with some custom styling.
  * HTML
    * One layout file extended by the 3 main webpage files.

