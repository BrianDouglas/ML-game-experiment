from gym import Env
from gym.spaces import Discrete, Box
import numpy as np
import random
import math
from enum import Enum

class Action(Enum):
    UP = 0
    DOWN = 1
    LEFT = 2
    RIGHT = 3

class GameEnv(Env):
    def __init__(self, size, game_length):
        self.size = size
        self.GAME_LENGTH = game_length
        self.action_space = Discrete(4)
        self.observation_space = Box(low=-1, high=1, shape=(self.size, self.size), dtype=np.int32)
        self.state, self.player = self.createBoard()
        self.time_remaining = self.GAME_LENGTH
        
    def step(self, action):
        self.time_remaining -= 1
        done = False
        
        #evaluate move, save value of the new space before move then update the state
        invalid_move = False
        if Action(action) == Action.UP:
            new_pos = (self.player[0] -1, self.player[1])
            if new_pos[0] >= 0:
                new_space_val = self.movePlayer(new_pos)
            else:
                invalid_move = True
        elif Action(action) == Action.DOWN:
            new_pos = (self.player[0] +1, self.player[1])
            if new_pos[0] < self.size:
                new_space_val = self.movePlayer(new_pos)
            else:
                invalid_move = True
        elif Action(action) == Action.LEFT:
            new_pos = (self.player[0], self.player[1] -1)
            if new_pos[1] >= 0:
                new_space_val = self.movePlayer(new_pos)
            else:
                invalid_move = True
        elif Action(action) == Action.RIGHT:
            new_pos = (self.player[0], self.player[1] +1)
            if new_pos[1] < self.size:
                new_space_val = self.movePlayer(new_pos)
            else:
                invalid_move = True
        else:
            print("Invalid input to step function")
            
        #evaluate reward 
        reward = 0
        if(invalid_move):
            reward = -0.1
            done = False
        else:
            if new_space_val == 0:
                reward = -0.1
                done = False
            elif new_space_val == -1:
                reward = 20
                done = True
        
        #evaluate if out of time
        if self.time_remaining == 0:
            done = True
            reward = -20
            
        #placeholder for required return value
        info = {}
        
        return self.state, reward, done, info
    
    def movePlayer(self, new_pos):
        new_space_val = self.state[new_pos]
        self.state[self.player] = 0
        self.state[new_pos] = 1
        self.player = new_pos
        return new_space_val
        
    def render(self, mode='human'):
        print(self.state)
    
    def reset(self):
        self.state, self.player =  self.createBoard()
        self.time_remaining = self.GAME_LENGTH
        return self.state
    
    def createBoard(self):
        board = np.zeros((self.size,self.size), dtype=np.int32)
        player_pos = (np.random.randint(self.size), np.random.randint(self.size))
        goal_pos = (np.random.randint(self.size), np.random.randint(self.size))
        player_goal_distance = math.sqrt((player_pos[0] - goal_pos[0])**2 + (player_pos[1] - goal_pos[1])**2)
        while player_goal_distance < self.size/2:
            goal_pos = (np.random.randint(self.size), np.random.randint(self.size))
            player_goal_distance = math.sqrt((player_pos[0] - goal_pos[0])**2 + (player_pos[1] - goal_pos[1])**2)
        board[player_pos] = 1
        board[goal_pos] = -1
        return board, player_pos

if __name__ == "__main__":
    env = GameEnv(10, 40)
    episodes = 15
    for episode in range(1, episodes+1):
        state = env.reset()
        done = False
        score = 0
        while not done:
            action = env.action_space.sample()
            n_state, reward, done, info = env.step(action)
            score += reward
            
        print(f'Episode:{episode} Score:{score}')