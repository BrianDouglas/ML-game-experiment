from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense, Flatten
from tensorflow.keras.optimizers import Adam

from rl.agents.dqn import DQNAgent
from rl.policy import BoltzmannQPolicy, MaxBoltzmannQPolicy, LinearAnnealedPolicy, EpsGreedyQPolicy
from rl.memory import SequentialMemory

from GameEnv import GameEnv

def build_model(states, actions):
    model = Sequential()
    model.add(Flatten(input_shape=(1,states[0],states[1])))
    model.add(Dense(100, activation='relu'))
    model.add(Dense(100, activation='relu'))
    model.add(Dense(actions, activation='linear'))
    return model

def build_agent(model, actions):
    policy = BoltzmannQPolicy()
    memory = SequentialMemory(limit=100000, window_length=1)
    dqn = DQNAgent(model=model, memory=memory, policy=policy,
                   nb_actions=actions, nb_steps_warmup=100, target_model_update=1e-2)
    return dqn

def dqn_tester(dqn, num_eps):
    num_eps = num_eps
    scores = dqn.test(env, nb_episodes=num_eps, visualize=False)
    print("Mean Reward: " + str(np.mean(scores.history['episode_reward'])))
    num_win = 0
    for score in scores.history['episode_reward']:
        if score > 0:
            num_win += 1
    print(f'Win Rate: {round(num_win/num_eps, 2) * 100}%')

if __name__ == "__main__":
    env = GameEnv(10, 40)

    states = env.observation_space.shape
    actions = env.action_space.n
    model = build_model(states,actions)
    print(model.summary())

    dqn = build_agent(model, actions)
    dqn.compile(Adam(lr=1e-3), metrics=['mae'])
    dqn.fit(env, nb_steps=50000, visualize=False, verbose=1)

    dqn_tester(dqn, 15)
