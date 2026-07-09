export interface Transition<S extends string> {
  from: S;
  to: S;
  label: string;
  description: string;
}

export interface StateDefinition<S extends string> {
  state: S;
  label: string;
  description: string;
  entryCondition: string;
  exitCondition: string;
}

export interface StateMachine<S extends string> {
  states: readonly S[];
  initial: S;
  definitions: readonly StateDefinition<S>[];
  transitions: readonly Transition<S>[];
  transitionMap: Record<S, readonly S[]>;
  canTransition(from: S, to: S): boolean;
}

export function createStateMachine<S extends string>(
  states: readonly S[],
  initial: S,
  definitions: readonly StateDefinition<S>[],
  transitions: readonly Transition<S>[],
): StateMachine<S> {
  const transitionMap = states.reduce((map, state) => {
    map[state] = transitions
      .filter(t => t.from === state)
      .map(t => t.to);
    return map;
  }, {} as Record<string, readonly S[]>);

  return {
    states,
    initial,
    definitions,
    transitions,
    transitionMap,
    canTransition(from: S, to: S): boolean {
      return transitionMap[from]?.includes(to) ?? false;
    },
  };
}
