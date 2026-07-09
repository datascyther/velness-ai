import { createStateMachine, type StateDefinition } from './index';

export type RecommendationState = 'none' | 'suggested' | 'active' | 'dismissed';

export const RECOMMENDATION_STATES: readonly RecommendationState[] = [
  'none', 'suggested', 'active', 'dismissed',
] as const;

export const RECOMMENDATION_STATE_DEFINITIONS: readonly StateDefinition<RecommendationState>[] = [
  {
    state: 'none',
    label: 'None',
    description: 'No recommendation has been generated',
    entryCondition: 'Initial state or all recommendations cleared',
    exitCondition: 'Recommendation engine generates a suggestion',
  },
  {
    state: 'suggested',
    label: 'Suggested',
    description: 'Recommendation has been generated but not acted upon',
    entryCondition: 'Recommendation engine produces a result',
    exitCondition: 'User engages with or dismisses the recommendation',
  },
  {
    state: 'active',
    label: 'Active',
    description: 'User has accepted and is acting on the recommendation',
    entryCondition: 'User accepts the suggestion',
    exitCondition: 'Recommendation is completed or dismissed',
  },
  {
    state: 'dismissed',
    label: 'Dismissed',
    description: 'Recommendation was rejected or dismissed',
    entryCondition: 'User dismisses the recommendation',
    exitCondition: 'None (terminal)',
  },
];

export const recommendationStateMachine = createStateMachine(
  RECOMMENDATION_STATES,
  'none' as RecommendationState,
  RECOMMENDATION_STATE_DEFINITIONS,
  [
    { from: 'none', to: 'suggested', label: 'suggest', description: 'Engine generates a recommendation' },
    { from: 'suggested', to: 'active', label: 'accept', description: 'User engages with the recommendation' },
    { from: 'suggested', to: 'dismissed', label: 'dismiss', description: 'User dismisses the recommendation' },
    { from: 'active', to: 'none', label: 'complete', description: 'Recommendation is fulfilled and clears' },
    { from: 'active', to: 'dismissed', label: 'dismiss', description: 'User dismisses an active recommendation' },
  ],
);
