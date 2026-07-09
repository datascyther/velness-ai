export interface GuidedStep {
  id: string;
  type: 'welcome' | 'purpose' | 'breathing' | 'question' | 'reflection' | 'summary' | 'save' | 'celebrate';
  title: string;
  explanation?: string;
  prompt?: string;
  example?: string;
  placeholder?: string;
  required?: boolean;
  aiInstruction?: string;
}

interface ExerciseStepContent {
  title: string;
  prompt: string;
  explanation: string;
  example: string;
  placeholder: string;
  aiInstruction?: string;
}

interface CBTExerciseBlueprint {
  welcomeTitle: string;
  welcomeExplanation: string;
  purposeTitle: string;
  purposeExplanation: string;
  step1: ExerciseStepContent;
  step2: ExerciseStepContent;
  step3: ExerciseStepContent;
  summary: {
    title: string;
    prompt: string;
    explanation: string;
    example: string;
    placeholder: string;
  };
  celebrationTitle: string;
  celebrationExplanation: string;
}

function generateCBTSteps(id: string, config: CBTExerciseBlueprint): GuidedStep[] {
  const steps: GuidedStep[] = [
    {
      id: 'welcome',
      type: 'welcome',
      title: config.welcomeTitle,
      explanation: config.welcomeExplanation,
    },
    {
      id: 'purpose',
      type: 'purpose',
      title: config.purposeTitle,
      explanation: config.purposeExplanation,
    },
    {
      id: 'breathing',
      type: 'breathing',
      title: 'Center Yourself',
      explanation: "Before we begin writing, let's take a moment to quiet the mind and settle into the present. We'll guide you through 3 deep, mindful breath cycles.",
    }
  ];

  // Step 1
  steps.push({
    id: `${id}-step1`,
    type: 'question',
    title: config.step1.title,
    prompt: config.step1.prompt,
    explanation: config.step1.explanation,
    example: config.step1.example,
    placeholder: config.step1.placeholder,
    required: true,
  });
  if (config.step1.aiInstruction) {
    steps.push({
      id: `${id}-step1-reflection`,
      type: 'reflection',
      title: 'AI Insight Check',
      explanation: 'Generating an AI reflection on Step 1...',
      aiInstruction: config.step1.aiInstruction,
    });
  }

  // Step 2
  steps.push({
    id: `${id}-step2`,
    type: 'question',
    title: config.step2.title,
    prompt: config.step2.prompt,
    explanation: config.step2.explanation,
    example: config.step2.example,
    placeholder: config.step2.placeholder,
    required: true,
  });
  if (config.step2.aiInstruction) {
    steps.push({
      id: `${id}-step2-reflection`,
      type: 'reflection',
      title: 'AI Pattern Analysis',
      explanation: 'Generating an AI reflection on Step 2...',
      aiInstruction: config.step2.aiInstruction,
    });
  }

  // Step 3
  steps.push({
    id: `${id}-step3`,
    type: 'question',
    title: config.step3.title,
    prompt: config.step3.prompt,
    explanation: config.step3.explanation,
    example: config.step3.example,
    placeholder: config.step3.placeholder,
    required: true,
  });
  if (config.step3.aiInstruction) {
    steps.push({
      id: `${id}-step3-reflection`,
      type: 'reflection',
      title: 'AI Synthesis',
      explanation: 'Generating an AI reflection on Step 3...',
      aiInstruction: config.step3.aiInstruction,
    });
  }

  // Summary
  steps.push({
    id: `${id}-summary`,
    type: 'summary',
    title: config.summary.title,
    prompt: config.summary.prompt,
    explanation: config.summary.explanation,
    example: config.summary.example,
    placeholder: config.summary.placeholder,
    required: true,
  });

  // Save
  steps.push({
    id: 'save',
    type: 'save',
    title: 'Saving Your Progress',
    explanation: 'We are committing your exercises and reflections to your permanent profile.',
  });

  // Celebrate
  steps.push({
    id: 'celebrate',
    type: 'celebrate',
    title: config.celebrationTitle,
    explanation: config.celebrationExplanation,
  });

  return steps;
}

const BLUEPRINTS: Record<string, CBTExerciseBlueprint> = {
  // ==========================================
  // PROGRAM: Understanding Thoughts
  // ==========================================
  'understanding-thoughts-l1-ex1': {
    welcomeTitle: 'Thought Logging',
    welcomeExplanation: "Welcome. Today we build awareness of your stream of thoughts by writing them down objectively.",
    purposeTitle: 'Why Log Thoughts?',
    purposeExplanation: "Thoughts run constantly in the background. Naming them brings them from subconscious defaults to conscious objects you can evaluate.",
    step1: {
      title: '1. Notice the Commentary',
      prompt: 'Observe the stream of commentary in your head. Write down the first clear thought you notice.',
      explanation: 'Close your eyes for a brief moment, tune in to your inner monologue, and write it down.',
      example: "e.g., 'I will never finish this sprint on time.'",
      placeholder: 'Type the thought...',
      aiInstruction: 'Validate this thought. Acknowledge that the mind frequently generates negative outcomes when under pressure. Under 55 words.'
    },
    step2: {
      title: '2. Track Thought Frequency',
      prompt: 'How often has this thought, or similar ones, repeated today? (e.g. rarely, hourly, constantly)',
      explanation: 'Note if it is a recurring visitor or a one-off comment.',
      example: "e.g., 'This has been popping up hourly since the morning standup.'",
      placeholder: 'Note the frequency...',
      aiInstruction: 'Acknowledge this frequency. Explain how repeating thoughts create a mental habit loop that feels like truth. Under 55 words.'
    },
    step3: {
      title: '3. Assess Immediate Impact',
      prompt: 'How does this thought make you feel physically or emotionally in this moment?',
      explanation: 'Note any tension in your shoulders, jaw, or shifts in your mood.',
      example: "e.g., 'I feel a slight tightness in my chest and my mood dropped.'",
      placeholder: 'Describe the physical/emotional reaction...',
      aiInstruction: 'Validate the body connection. Affirm that thoughts immediately translate into physical sensations and emotions. Under 55 words.'
    },
    summary: {
      title: "4. The Observer's Takeaway",
      prompt: "Write a statement observing this thought from a distance: 'I notice I am having the thought that...'",
      explanation: 'Use distancing language to weaken the thought\'s power.',
      example: "e.g., 'I notice I am having the thought that I won\'t finish the sprint on time, and that is just a mental event.'",
      placeholder: 'Write your distanced statement...'
    },
    celebrationTitle: 'Thought Logged!',
    celebrationExplanation: "Excellent start. By logging your thoughts with distancing language, you are building cognitive flexibility."
  },

  'understanding-thoughts-l1-ex2': {
    welcomeTitle: 'Trigger Mapping',
    welcomeExplanation: "Welcome. Today we map the external and internal situations that spark automatic thoughts.",
    purposeTitle: 'Why Map Triggers?',
    purposeExplanation: "Thoughts don't appear out of thin air. Naming the trigger helps you predict when stressful loops are likely to start.",
    step1: {
      title: '1. Identify the Situation',
      prompt: 'Recall a moment today when you felt stress. What was happening externally?',
      explanation: 'Describe the environment: who was there, what was the task, or what time was it.',
      example: "e.g., 'I was looking at a long list of Jira tickets at 2 PM after lunch.'",
      placeholder: 'Describe the situation...',
      aiInstruction: 'Validate the situation. Acknowledge that afternoon work piles are a classic environment for stress cues. Under 55 words.'
    },
    step2: {
      title: '2. Pinpoint the Specific Cue',
      prompt: 'What was the exact cue or event that triggered your reaction?',
      explanation: 'Find the single moment, phrase, or detail that started the thought loop.',
      example: "e.g., 'Seeing the red priority label on a database ticket.'",
      placeholder: 'Identify the exact cue...',
      aiInstruction: 'Acknowledge the cue. Explain how a small visual tag like a red label acts as a shortcut to trigger survival instincts. Under 55 words.'
    },
    step3: {
      title: '3. Check Internal State',
      prompt: 'What was your internal state (e.g. hungry, tired, lonely, rushing) right before the trigger?',
      explanation: 'Physiology makes us much more sensitive to triggers.',
      example: "e.g., 'I was tired from a poor night\'s sleep and had a slight headache.'",
      placeholder: 'Describe your internal state...',
      aiInstruction: 'Validate this somatic context. Emphasize that being tired or hungry lowers our threshold for cognitive stress. Under 55 words.'
    },
    summary: {
      title: '4. Trigger Formula',
      prompt: "Formulate a trigger statement: 'When [trigger] happens and I am [internal state], my mind tends to stress.'",
      explanation: 'Create a clear rule you can watch out for.',
      example: "e.g., 'When I see urgent red tickets and I am already tired, my mind tends to jump to panic.'",
      placeholder: 'Write your trigger formula...'
    },
    celebrationTitle: 'Trigger Mapped!',
    celebrationExplanation: "Trigger mapped successfully! Recognizing these cues turns sudden stress loops into predictable events."
  },

  'understanding-thoughts-l1-ex3': {
    welcomeTitle: 'Emotion Tracking',
    welcomeExplanation: "Welcome. Today we practice identifying and rating the emotions that accompany our thoughts.",
    purposeTitle: 'Why Track Emotions?',
    purposeExplanation: "Thoughts and emotions are tightly linked. By naming emotions precisely, we reduce their overwhelming power and locate them physically.",
    step1: {
      title: '1. Label the Emotions',
      prompt: 'What specific emotions did you feel during your last stress loop? (e.g. anxiety, frustration, disappointment)',
      explanation: 'Try to name at least two distinct feelings.',
      example: "e.g., 'Anxiety and a sense of inadequacy.'",
      placeholder: 'List the emotions...',
      aiInstruction: 'Validate these emotions. Praise the precision of separating anxiety from a feeling of inadequacy. Under 55 words.'
    },
    step2: {
      title: '2. Rate the Intensity',
      prompt: 'Rate the intensity of each emotion on a scale of 1-10.',
      explanation: 'How loud was each feeling?',
      example: "e.g., 'Anxiety was an 8, inadequacy was a 6.'",
      placeholder: 'Rate the intensity...',
      aiInstruction: 'Acknowledge these high ratings. Validate that an 8 out of 10 indicates a strong physiological alarm response. Under 55 words.'
    },
    step3: {
      title: '3. Locate in the Body',
      prompt: 'Where in your body did you feel these emotions physically?',
      explanation: 'Look for chest tightness, shallow breathing, muscle tension, or stomach discomfort.',
      example: "e.g., 'Tightness in my neck and shoulders, and shallow breathing.'",
      placeholder: 'Describe the physical sensations...',
      aiInstruction: 'Validate the somatic localization. Affirm that releasing neck tension is a direct way to send calm signals to the brain. Under 55 words.'
    },
    summary: {
      title: '4. Somatic Check-In Plan',
      prompt: 'Write down a simple cue to check in with your body next time you feel these emotions.',
      explanation: 'Plan to pause and scan your shoulders or chest.',
      example: "e.g., 'When I feel my shoulders rising to my ears, I will take three deep breaths and drop them.'",
      placeholder: 'Type your somatic check-in...'
    },
    celebrationTitle: 'Emotions Logged!',
    celebrationExplanation: "Emotions logged! Connecting emotions to the body builds powerful grounding skills to de-escalate stress."
  },

  'understanding-thoughts-l2-ex1': {
    welcomeTitle: 'Automatic Thoughts',
    welcomeExplanation: "Welcome. Today we identify rapid, automatic reactions to situations and check how strongly we believe them.",
    purposeTitle: 'Why Catch Automatic Thoughts?',
    purposeExplanation: "Automatic thoughts are reflex judgments that run in the background. Naming them helps you realize they are mental habits rather than objective facts.",
    step1: {
      title: '1. Spot the Situation',
      prompt: 'Describe a situation today that caused a sudden shift in your mood.',
      explanation: 'Keep it descriptive: what happened and when.',
      example: "e.g., 'My manager asked to chat at 4 PM without providing any agenda.'",
      placeholder: 'Describe the situation...',
      aiInstruction: 'Validate the anxiety of a sudden agenda-less request. Acknowledge how normal it is for the mind to jump to negative outcomes. Under 55 words.'
    },
    step2: {
      title: '2. Capture the Automatic Thought',
      prompt: 'Write down the very first thought that popped into your head.',
      explanation: 'Capture the raw commentary exactly as it sounded.',
      example: "e.g., 'I am going to get fired or reprimanded for my code speed.'",
      placeholder: 'Type the automatic thought...',
      aiInstruction: 'Review the automatic thought. Identify any cognitive distortions like catastrophizing or jumping to conclusions. Under 55 words.'
    },
    step3: {
      title: '3. Rate Belief Strength',
      prompt: 'Rate how strongly you believe this thought from 0% to 100%.',
      explanation: 'How true does it feel in your gut right now?',
      example: "e.g., 'I believe it at about 80% because of the manager\'s serious tone.'",
      placeholder: 'Enter percentage (0-100)...',
      aiInstruction: 'Acknowledge this high belief rating. Emphasize that emotional intensity makes automatic thoughts feel highly believable. Under 55 words.'
    },
    summary: {
      title: '4. The Automatic Reflection',
      prompt: 'Write a statement acknowledging that this is an automatic reflex, not a final verdict.',
      explanation: 'Remind yourself that your brain is just making a quick guess.',
      example: "e.g., 'This is my brain\'s automatic alarm response to an agenda-less meeting, not a factual warning of job loss.'",
      placeholder: 'Type your automatic reflection...'
    },
    celebrationTitle: 'Thought Logged!',
    celebrationExplanation: "Great job! Naming the automatic thought and measuring your belief is the crucial first step to testing its validity."
  },

  'understanding-thoughts-l2-ex2': {
    welcomeTitle: 'Evidence Testing',
    welcomeExplanation: "Welcome. Today we act as objective investigators, examining the factual evidence for and against your automatic thoughts.",
    purposeTitle: 'Why Test Evidence?',
    purposeExplanation: "Our mind acts as a biased lawyer, selectively gathering facts that support our fears. Testing evidence ensures a fair, objective trial.",
    step1: {
      title: '1. State the Automatic Thought',
      prompt: 'Write down the automatic thought you want to put on trial.',
      example: "e.g., 'I am completely incompetent at resolving database errors.'",
      placeholder: 'Type the thought...',
      aiInstruction: 'Validate the heavy feeling of self-doubt. Explain how testing evidence helps bring logic back online. Under 55 words.'
    },
    step2: {
      title: '2. Gather Supporting Evidence',
      prompt: 'List the objective, verifiable facts that support this thought.',
      explanation: 'Only list facts that would hold up in court—no feelings or assumptions.',
      example: "e.g., 'It took me three hours to resolve the migration bug yesterday and I had to ask for help.'",
      placeholder: 'List supporting facts...',
      aiInstruction: 'Acknowledge these facts. Note that taking time and asking for help are normal parts of software development. Under 55 words.'
    },
    step3: {
      title: '3. Gather Opposing Evidence',
      prompt: 'List the objective, verifiable facts that contradict this thought.',
      explanation: 'Think of times you successfully resolved issues, helped others, or learned new skills.',
      example: "e.g., '1. I resolved three complex API bugs last week. 2. My manager praised my code structure in my review. 3. I successfully completed the deployment training.'",
      placeholder: 'List contradicting facts...',
      aiInstruction: 'Praise this opposing evidence. Emphasize that these factual achievements directly contradict the incompetent label. Under 55 words.'
    },
    summary: {
      title: '4. Evidence Weighing',
      prompt: 'Summarize the trial: what does the objective evidence show when you look at both sides fairly?',
      explanation: 'Weigh both columns objectively.',
      example: "e.g., 'The evidence shows that while I sometimes take longer or need help on complex issues, I am successfully learning and resolving most database problems.'",
      placeholder: 'Summarize the trial...'
    },
    celebrationTitle: 'Evidence Tested!',
    celebrationExplanation: "Wonderful job! Putting your thoughts on trial helps you break free from biased thinking and see the full picture."
  },

  'understanding-thoughts-l2-ex3': {
    welcomeTitle: 'Alternative Thinking',
    welcomeExplanation: "Welcome. Today we construct balanced, alternative thoughts based on the evidence we gathered.",
    purposeTitle: 'Why Alternative Thinking?',
    purposeExplanation: "An alternative thought is not positive thinking—it is realistic thinking. It incorporates all the facts, reducing distress and guiding constructive action.",
    step1: {
      title: '1. Review the Evidence Summary',
      prompt: 'Summarize the facts you have for and against your automatic thought.',
      explanation: 'Briefly state the key findings.',
      example: "e.g., 'For: database migration took 3 hours. Against: I resolved 3 bugs last week and got praised for structure.'",
      placeholder: 'Summarize the facts...',
      aiInstruction: 'Validate this factual summary. Acknowledge that balancing both sides sets up a strong alternative thought. Under 55 words.'
    },
    step2: {
      title: '2. Formulate the Alternative Thought',
      prompt: 'Write a new, balanced statement that incorporates all the facts.',
      explanation: 'Acknowledge the challenge, but also state your competence and resources.',
      example: "e.g., 'Although complex database issues are challenging and take me time to resolve, I have a solid track record of fixing bugs and I have a team I can consult.'",
      placeholder: 'Write the alternative thought...',
      aiInstruction: 'Validate this alternative thought. Explain how it replaces self-judgment with realistic self-efficacy and problem-solving. Under 55 words.'
    },
    step3: {
      title: '3. Re-rate Your Belief',
      prompt: 'Now, re-rate your belief in the original thought (0-100%) and rate your current distress (1-10).',
      explanation: 'Notice how your gut feeling shifts with the new statement.',
      example: "e.g., 'Original thought belief dropped to 30%. Distress went from an 8 to a 3.'",
      placeholder: 'Enter new ratings...',
      aiInstruction: 'Highlight this decrease. Confirm that even a small drop in belief shows that logical alternative thoughts somatic-ly reduce anxiety. Under 55 words.'
    },
    summary: {
      title: '4. Alternative Action Plan',
      prompt: 'What small, constructive action does this new alternative thought encourage you to take?',
      explanation: 'Link the balanced thought to a productive action.',
      example: "e.g., 'I will spend 15 minutes reviewing the database schema doc to feel more prepared for future migration tickets.'",
      placeholder: 'Plan your next step...'
    },
    celebrationTitle: 'Thought Reframed!',
    celebrationExplanation: "Superb work! Re-rating and reframing automatic thoughts creates the cognitive flexibility needed to meet challenges with confidence."
  },

  'understanding-thoughts-l3-ex1': {
    welcomeTitle: 'Thinking Traps',
    welcomeExplanation: "Welcome. Today we learn to recognize cognitive distortions—or thinking traps—that bias our thoughts toward stress.",
    purposeTitle: 'Why Recognize Thinking Traps?',
    purposeExplanation: "Thinking traps are cognitive shortcuts that distort reality. By labeling them (e.g. catastrophizing, mind reading), you expose their false authority.",
    step1: {
      title: '1. Log the Negative Thought',
      prompt: 'Write down a recent negative or stressful thought.',
      example: "e.g., 'If I make one mistake on this pull request, the team will think I am useless.'",
      placeholder: 'Type the thought...',
      aiInstruction: 'Validate the anxiety of pull request reviews. Note how absolute words like "useless" indicate extreme thinking. Under 55 words.'
    },
    step2: {
      title: '2. Identify the Traps',
      prompt: 'Select which thinking traps are present in this thought (e.g. All-or-Nothing, Catastrophizing, Mind Reading, Fortune Telling).',
      explanation: 'Labeling the traps helps you see the distortion clearly.',
      example: "e.g., 'All-or-Nothing (one mistake = useless) and Mind Reading (assuming what the team will think).'",
      placeholder: 'List the thinking traps...',
      aiInstruction: 'Validate the identification. Confirm that all-or-nothing thinking and mind reading are common developer traps. Under 55 words.'
    },
    step3: {
      title: '3. Challenge the Traps',
      prompt: 'How does labeling these traps change how you view the thought?',
      explanation: 'Does it feel less like an absolute fact?',
      example: "e.g., 'It makes me realize it\'s just my mind playing tricks on me and assuming the worst, rather than a realistic outcome.'",
      placeholder: 'Describe the change...',
      aiInstruction: 'Validate this grounding realization. Affirm that exposing the traps strips the thought of its emotional urgency. Under 55 words.'
    },
    summary: {
      title: '4. The Trap Label',
      prompt: "Formulate a warning label: 'When I stress about reviews, my mind tends to trap me in [Traps].'",
      explanation: 'Create a personal warning tag.',
      example: "e.g., 'When I stress about reviews, my mind tends to trap me in All-or-Nothing thinking and Mind Reading.'",
      placeholder: 'Write your trap label...'
    },
    celebrationTitle: 'Traps Exposed!',
    celebrationExplanation: "Great job! Naming the thinking traps is like turning on the lights: the scary monsters are revealed to be just dust bunnies."
  },

  'understanding-thoughts-l3-ex2': {
    welcomeTitle: 'Pattern Recognition',
    welcomeExplanation: "Welcome. Today we look for patterns in your thinking, identifying which traps you fall into most frequently.",
    purposeTitle: 'Why Spot Patterns?',
    purposeExplanation: "Each of us has a default thinking trap we use under pressure. Spotting your personal favorites helps you build a custom defense plan.",
    step1: {
      title: '1. Review Recent Logs',
      prompt: 'Based on your recent logs, which thinking trap(s) appear most frequently?',
      explanation: 'Identify your mind\'s default reaction style (e.g., Catastrophizing, Mind Reading, Personalization).',
      example: "e.g., 'Mind Reading is definitely my most frequent trap, followed by Catastrophizing.'",
      placeholder: 'Identify your default traps...',
      aiInstruction: 'Validate this pattern. Explain how common it is to use mind reading as an over-protective safety strategy. Under 55 words.'
    },
    step2: {
      title: '2. Map the Trigger Conditions',
      prompt: 'What situations, times of day, or physical states make you most vulnerable to these traps?',
      explanation: 'Look for common environments (e.g. standups, deadlines, afternoon fatigue).',
      example: "e.g., 'I fall into mind reading during team meetings and standups, especially when I am already tired.'",
      placeholder: 'Describe your trigger conditions...',
      aiInstruction: 'Acknowledge this trigger setup. Validate that social interaction combined with fatigue is a prime condition for mind reading. Under 55 words.'
    },
    step3: {
      title: '3. Trace the Habit History',
      prompt: 'How has this thinking trap served or limited you in the past?',
      explanation: 'Did it help you cope, or did it increase your anxiety?',
      example: "e.g., 'It was a defense to avoid criticism, but it limits me because it keeps me anxious and prevents me from asking questions.'",
      placeholder: 'Describe the effect of the trap...',
      aiInstruction: 'Validate this deep insight. Acknowledge that recognizing how a trap limits you provides the motivation to break the habit. Under 55 words.'
    },
    summary: {
      title: '4. Trap Alarm Statement',
      prompt: 'Write a warning reminder to use next time you enter your trigger situation.',
      explanation: 'Create a simple phrase to alert yourself.',
      example: "e.g., 'I am entering standup tired; watch out for automatic Mind Reading.'",
      placeholder: 'Type your trap alarm...'
    },
    celebrationTitle: 'Patterns Mapped!',
    celebrationExplanation: "Fantastic work! Spotting your default traps removes their element of surprise, giving you the upper hand."
  },

  'understanding-thoughts-l3-ex3': {
    welcomeTitle: 'Replacement Thinking',
    welcomeExplanation: "Welcome. Today we practice replacing thinking traps with objective, realistic thoughts in real time.",
    purposeTitle: 'Why Practice Replacement?',
    purposeExplanation: "Knowing the traps isn't enough; we must actively replace them with balanced statements to rewrite our cognitive habits.",
    step1: {
      title: '1. Select a Distorted Thought',
      prompt: 'Write down a recent thought that fell into a thinking trap.',
      example: "e.g., 'They haven\'t responded to my slack message for an hour. They must be angry with my code quality.'",
      placeholder: 'Type the thought...',
      aiInstruction: 'Validate the discomfort of a slow response. Identify the trap as Mind Reading and Fortune Telling. Under 55 words.'
    },
    step2: {
      title: '2. Deconstruct the Trap',
      prompt: 'Identify the distortion and list the facts that show this thought is not the only explanation.',
      explanation: 'Strip away the drama: what are other possible reasons?',
      example: "e.g., 'Mind Reading. Facts: It is lunch hour, they are in meetings, or they are focused on their own code.'",
      placeholder: 'List other explanations...',
      aiInstruction: 'Praise this logical deconstruction. Confirm that lunch breaks and deep focus are far more likely explanations than anger. Under 55 words.'
    },
    step3: {
      title: '3. Construct the Replacement Thought',
      prompt: 'Write a realistic, replacement thought that incorporates these other possibilities.',
      explanation: 'Create a balanced, calm alternative.',
      example: "e.g., 'They haven\'t responded because they are likely busy or focused on their own work; it is not a reflection of my worth.'",
      placeholder: 'Write the replacement thought...',
      aiInstruction: 'Validate this replacement. Affirm that repeating this balanced view helps dissolve the automatic panic response. Under 55 words.'
    },
    summary: {
      title: '4. Replacement Commitment',
      prompt: 'Write a commitment to use replacement thinking next time you feel a slow response trigger.',
      explanation: 'Make a promise to pause and reframe.',
      example: "e.g., 'I commit to waiting and reminding myself they are busy, instead of mind reading, next time a response is delayed.'",
      placeholder: 'Type your commitment...'
    },
    celebrationTitle: 'Thought Replaced!',
    celebrationExplanation: "Wonderful work! Every replacement thought you write weakens the old trap and strengthens realistic habits."
  },

  'understanding-thoughts-l4-ex1': {
    welcomeTitle: 'Perspective Shift',
    welcomeExplanation: "Welcome. Today we practice viewing a stressful situation from a different angle to reduce emotional distress.",
    purposeTitle: 'Why Shift Perspective?',
    purposeExplanation: "Under stress, our vision tunnels into threat mode. Shifting perspective opens up alternative, compassionate angles that reduce panic.",
    step1: {
      title: '1. Describe the stressor',
      prompt: 'Describe a current situation that is causing you anxiety or frustration.',
      example: "e.g., 'I have to present my code architecture to the senior team tomorrow and I am terrified.'",
      placeholder: 'Describe the stressor...',
      aiInstruction: 'Validate the anxiety of presenting architecture. Acknowledge that the mind naturally zooms in on potential judgment. Under 55 words.'
    },
    step2: {
      title: '2. The Compassionate Friend Perspective',
      prompt: 'If a close, supportive colleague was presenting instead, what would you tell them?',
      explanation: 'Write down what a warm, encouraging friend would say to support them.',
      example: "e.g., 'You\'ve worked hard on this, you know the code well, and the team wants to understand the structure, not judge you.'",
      placeholder: 'Type your friendly support...',
      aiInstruction: 'Review the friendly response. Highlight how natural and balanced this support is when directed outward. Under 55 words.'
    },
    step3: {
      title: '3. Adopt the Perspective',
      prompt: 'Direct that exact support statement back to yourself. How does it shift your feeling?',
      explanation: 'Rewrite it using your own name.',
      example: "e.g., 'Alex, you\'ve worked hard on this, you know the code well, and the team wants to understand the structure, not judge you.'",
      placeholder: 'Type your self-directed support...',
      aiInstruction: 'Validate this self-directed support. Explain how speaking to yourself as a friend directly lowers threat-system activity. Under 55 words.'
    },
    summary: {
      title: '4. Perspective Anchor',
      prompt: 'Write down one key phrase from your friend perspective to recall right before the event.',
      explanation: 'Make it a simple, portable reminder.',
      example: "e.g., 'They want to understand the structure, not judge me. I know my work.'",
      placeholder: 'Type your anchor phrase...'
    },
    celebrationTitle: 'Perspective Shifted!',
    celebrationExplanation: "Great job! Shifting perspective reminds you that the critic's view is just one distorted story, not the objective truth."
  },

  'understanding-thoughts-l4-ex2': {
    welcomeTitle: 'Balanced Thinking',
    welcomeExplanation: "Welcome. Today we identify the middle ground: moving from extreme predictions to realistic outcomes.",
    purposeTitle: 'Why Balanced Thinking?',
    purposeExplanation: "Our mind defaults to catastrophizing (the worst case) or false optimism (the best case). Finding the realistic middle ground restores logic.",
    step1: {
      title: '1. Map the Extremes',
      prompt: 'Write down the absolute worst-case scenario and the absolute best-case scenario of your situation.',
      example: "e.g., 'Worst: I freeze, forget my words, and get fired. Best: Everyone applauds and I get promoted instantly.'",
      placeholder: 'Describe the extremes...',
      aiInstruction: 'Validate these extremes. Note how the worst-case scenario is heavily catastrophized and the best-case is idealized. Under 55 words.'
    },
    step2: {
      title: '2. Find the Middle Ground',
      prompt: 'What is the most likely, realistic middle-ground outcome between these two extremes?',
      explanation: 'Focus on what typically happens in real life.',
      example: "e.g., 'I will feel nervous and maybe stutter a bit, but I will get through the slides, answer questions, and the meeting will end.'",
      placeholder: 'Describe the middle ground...',
      aiInstruction: 'Validate this middle ground. Confirm that a mix of nervousness and successful completion is the most common reality. Under 55 words.'
    },
    step3: {
      title: '3. Rate the Middle Ground Likelihood',
      prompt: 'Rate the likelihood of this middle ground happening compared to the extremes.',
      explanation: 'Which outcome has the highest probability?',
      example: "e.g., 'Middle ground is 95% likely, worst case is 4%, best case is 1%.'",
      placeholder: 'Rate the likelihood...',
      aiInstruction: 'Validate these probabilities. Highlight that recognizing the high likelihood of the middle ground lowers panic. Under 55 words.'
    },
    summary: {
      title: '4. Balanced Thought',
      prompt: 'Write a balanced thought summarizing this realistic middle ground.',
      explanation: 'Use it to ground your mind.',
      example: "e.g., 'I might feel nervous, but the facts show I will successfully complete the presentation and answer questions, just like last time.'",
      placeholder: 'Type your balanced thought...'
    },
    celebrationTitle: 'Middle Ground Found!',
    celebrationExplanation: "Superb work! Defusing the catastrophe by finding the realistic middle ground is a powerful way to quiet anxiety."
  },

  'understanding-thoughts-l4-ex3': {
    welcomeTitle: 'Reality Testing',
    welcomeExplanation: "Welcome. Today we test the actual probability of your worries and map out a practical coping plan.",
    purposeTitle: 'Why Reality Testing?',
    purposeExplanation: "Anxiety presents worst-case scenarios as highly likely. Reality testing checks the math and ensures you have a plan to handle the outcome.",
    step1: {
      title: '1. Specify the Prediction',
      prompt: 'What negative prediction or worry is your mind repeating?',
      example: "e.g., 'If I ask a question during standup, they will think I don\'t know how to code.'",
      placeholder: 'Type the prediction...',
      aiInstruction: 'Validate the fear of exposing a gap. Identify this trap as Fortune Telling and Mind Reading. Under 55 words.'
    },
    step2: {
      title: '2. Check historical frequency',
      prompt: 'How many times have you asked questions in the past? Did your prediction actually come true?',
      explanation: 'Look at your real history for data.',
      example: "e.g., 'I\'ve asked questions weekly. Nobody has criticized me, and they usually just answer and move on.'",
      placeholder: 'Review history...',
      aiInstruction: 'Highlight this historical data. Confirm that past experience is the most reliable evidence against the fear. Under 55 words.'
    },
    step3: {
      title: '3. Map the Coping Plan',
      prompt: 'Even if the worst happened and someone was critical, how would you handle it?',
      explanation: 'Map out a logical coping plan to remove the fear of the unknown.',
      example: "e.g., 'If someone was critical, I would remind myself that asking questions is how we prevent errors, and keep moving forward.'",
      placeholder: 'Describe your coping plan...',
      aiInstruction: 'Validate this coping plan. Affirm that having a clear recovery plan takes away the critic\'s power to threaten you. Under 55 words.'
    },
    summary: {
      title: '4. Reality Statement',
      prompt: 'Write a reality statement combining probability and coping capacity.',
      explanation: 'Summarize the reality test.',
      example: "e.g., 'It is highly likely my question will be welcomed, and even if someone is critical, I can handle it logically.'",
      placeholder: 'Type your reality statement...'
    },
    celebrationTitle: 'Reality Tested!',
    celebrationExplanation: "Outstanding work! Reality testing helps your mind see that your worries are highly unlikely and fully survivable."
  },

  'understanding-thoughts-l5-ex1': {
    welcomeTitle: 'Thought Mastery Plan',
    welcomeExplanation: "Welcome to the final integration. Today you create your personal Thought Mastery Plan to establish daily thought awareness.",
    purposeTitle: 'Why a Mastery Plan?',
    purposeExplanation: "Cognitive flexibility is a habit built over time. A pre-planned routine ensures you maintain your thought-checking skills long after this program.",
    step1: {
      title: '1. Summarize Key Triggers & Traps',
      prompt: 'What are the main triggers and thinking traps you identified in this program?',
      explanation: 'Review your findings from the past four lessons.',
      example: "e.g., 'Triggers: Standups and delayed slack messages. Traps: Mind Reading and Catastrophizing.'",
      placeholder: 'Summarize triggers & traps...',
      aiInstruction: 'Validate this summary. Praise the clarity of naming these personal defaults. Under 55 words.'
    },
    step2: {
      title: '2. Design Your Daily Thought Check',
      prompt: 'When and where will you spend 5 minutes reviewing your thoughts daily?',
      explanation: 'Anchor this habit to an existing routine (e.g. after dinner, before bed).',
      example: "e.g., 'I will spend 5 minutes at my desk right after shutting down my work computer at 6 PM.'",
      placeholder: 'Plan your daily thought check...',
      aiInstruction: 'Validate this timing. Confirm that checking in right at the end of the workday is an excellent way to transition. Under 55 words.'
    },
    step3: {
      title: '3. Write Your Core Grounding Statement',
      prompt: 'Write one powerful statement to repeat when you catch your mind running in stress loops.',
      explanation: 'Use a short, memorable phrase (e.g. "Thoughts are not facts", "Observe and release").',
      example: "e.g., 'Thoughts are just temporary mental events, not absolute facts. I can observe them and choose my response.'",
      placeholder: 'Type your grounding statement...',
      aiInstruction: 'Validate this core grounding statement. Affirm its strength and clarity. Under 55 words.'
    },
    summary: {
      title: '4. The Mastery Affirmation',
      prompt: 'Write a final, integrated affirmation of your capability to manage your thoughts.',
      explanation: 'Celebrate your commitment to cognitive awareness.',
      example: "e.g., 'I am the observer of my mind. I can log automatic thoughts, test them objectively, and choose balanced responses to navigate stress.'",
      placeholder: 'Type your mastery affirmation...'
    },
    celebrationTitle: 'Mastery Plan Completed!',
    celebrationExplanation: "Congratulations! You have completed the Understanding Thoughts program. You are now equipped with a robust, active plan to observe and master your cognitive responses. Walk in clarity!"
  },

  // ==========================================
  // PROGRAM: Challenging Negative Thinking
  // ==========================================
  'challenging-negative-thinking-l1': {
    welcomeTitle: 'ANT Catcher',
    welcomeExplanation: "Welcome. Today we learn to catch Automatic Negative Thoughts (ANTs) as they arise, before they dominate your mindset.",
    purposeTitle: 'Why Catch ANTs?',
    purposeExplanation: "ANTs are rapid, reflex-like thoughts that feed anxiety and self-doubt. Catching them makes us realize they are automatic reflexes, not facts.",
    step1: {
      title: '1. Spot the ANT',
      prompt: 'Write down an automatic negative thought you noticed today.',
      explanation: 'It is usually self-critical, cynical, or anxious. What did it say?',
      example: 'e.g., "I am going to embarrass myself in the discussion."',
      placeholder: 'Type the automatic negative thought...',
      aiInstruction: 'Validate the vulnerability behind this ANT. Remind the user that catching the thought immediately takes away its subconscious power. Under 55 words.'
    },
    step2: {
      title: '2. Rate the Belief',
      prompt: 'Rate how strongly you believed this thought when it arose (0% to 100%).',
      explanation: 'Even when thoughts are completely irrational, our emotional brain can believe them 100%. What was your rating?',
      example: 'e.g., "85% belief intensity."',
      placeholder: 'Describe your belief level and the emotion associated with it...',
      aiInstruction: 'Acknowledge the high belief rating. Validate that the body reacts to our belief intensity rather than factual correctness. Under 55 words.'
    },
step3: {
       title: '3. Notice the Reflex',
       prompt: 'Acknowledge this thought as a mental reflex rather than truth. Write "This is just an ANT, not a fact."',
       explanation: 'Reframe the thought as an automatic neural response, similar to a physical sneeze.',
       example: 'e.g., "This is just an ANT, a protective reflex, not an absolute truth about my capability."',
       placeholder: 'Write your acknowledgment...',
       aiInstruction: 'Validate the acknowledgment. Explain that recognizing ANTs as reflexes immediately reduces their persuasive power. Under 55 words.'
     },
    summary: {
      title: '4. ANT Reframe',
      prompt: 'Formulate a more realistic, supportive statement to counter the ANT.',
      explanation: 'What would a compassionate coach say to you about the discussion?',
      example: 'e.g., "I am prepared for the discussion, and it is okay if I don\'t say everything perfectly."',
      placeholder: 'Type your realistic reframed statement...'
    },
    celebrationTitle: 'ANT Caught!',
    celebrationExplanation: "Fantastic work! You've successfully trapped an automatic negative thought and disarmed it. Each ANT caught is a step toward mental clarity."
  },

  'challenging-negative-thinking-l2': {
    welcomeTitle: 'Thinking Traps',
    welcomeExplanation: "Welcome. Today we inspect our thoughts for common cognitive distortions (thinking traps) like Catastrophizing and Mind Reading.",
    purposeTitle: 'Why Label Distortions?',
    purposeExplanation: "Thinking traps are biased filters. When we label a thought as 'Catastrophizing', we immediately realize the story is a distortion, not a fact.",
    step1: {
      title: '1. The Stressful Thought',
      prompt: 'Write down a recurring stressful thought you have had recently.',
      explanation: 'What is a worry that keeps popping up in your mind?',
      example: 'e.g., "If I ask for help, my team will think I am incompetent."',
      placeholder: 'Type the stressful thought...',
      aiInstruction: 'Validate the vulnerability of asking for help. Acknowledge that the mind frequently distorts social vulnerability. Under 55 words.'
    },
    step2: {
      title: '2. Label the Distortions',
      prompt: 'Which thinking traps are active in this thought? (e.g., Mind Reading, Fortune Telling, All-or-Nothing)',
      explanation: 'Identify the bias. Are you assuming you know what others think (Mind Reading) or predicting the worst (Fortune Telling)?',
      example: 'e.g., "Mind Reading (assuming they think I am incompetent) and Fortune Telling (predicting a negative evaluation)."',
      placeholder: 'Identify and list the distortions...',
      aiInstruction: 'Affirm the identified traps. Highlight how labeling Mind Reading and Fortune Telling breaks the illusion of certainty. Under 55 words.'
    },
step3: {
       title: '3. Challenge the Distortion',
       prompt: 'Write down what makes this distortion inaccurate or unrealistic.',
       explanation: 'What evidence exists that contradicts the thinking trap?',
       example: 'e.g., "My team has always been supportive when others asked questions, and asking for help is a sign of care, not incompetence."',
       placeholder: 'Challenge the distortion here...',
       aiInstruction: 'Validate the challenge. Explain how actively questioning distortions builds cognitive flexibility and reduces their grip. Under 55 words.'
     },
    summary: {
      title: '4. Distortion Reframe',
      prompt: 'Write a balanced thought that leaves out the cognitive biases.',
      explanation: 'Rephrase your thought to be realistic, open, and fact-based.',
      example: 'e.g., "Asking for help allows me to do my job well, and my team members are glad to collaborate."',
      placeholder: 'Type your balanced, distortion-free thought...'
    },
    celebrationTitle: 'Trap Disarmed!',
    celebrationExplanation: "Wonderful job! Calling out a thinking trap by name neutralizes its power. You are training your mind to see the world clearly."
  },

  'challenging-negative-thinking-l3': {
    welcomeTitle: 'Thought on Trial',
    welcomeExplanation: "Welcome. Today we put a stressful belief on trial, acting as the judge to evaluate the objective evidence.",
    purposeTitle: 'Why Put Thoughts on Trial?',
    purposeExplanation: "Anxiety acts as a prosecutor, presenting only one-sided negative arguments. Putting thoughts on trial forces us to look at all the evidence.",
    step1: {
      title: '1. The Accused Thought',
      prompt: 'Write down the self-limiting thought you want to put on trial.',
      explanation: 'What negative belief about yourself or a situation is causing anxiety?',
      example: 'e.g., "I always ruin my relationships."',
      placeholder: 'Type the thought on trial...',
      aiInstruction: 'Validate the pain of this belief. Empathize with how all-or-nothing statements (like "always" or "never") feel heavy. Under 55 words.'
    },
    step2: {
      title: '2. Evidence FOR the Thought',
      prompt: 'List the objective, factual evidence that supports this thought.',
      explanation: 'Be strict. Only list facts that would hold up in court, not feelings or interpretations.',
      example: 'e.g., "My last relationship ended after a disagreement. I forgot my partner\'s birthday once."',
      placeholder: 'List evidence for the thought...',
      aiInstruction: 'Acknowledge the evidence. Guide the user to see that while these facts exist, they do not prove the extreme conclusion. Under 55 words.'
    },
step3: {
       title: '3. Evidence AGAINST the Thought',
       prompt: 'List the objective, factual evidence that contradicts this thought.',
       explanation: 'List moments of connection, positive friendships, or conflicts you resolved constructively.',
       example: 'e.g., "I have close friends of many years. I apologized and resolved a conflict last week. My partner praised my kindness."',
       placeholder: 'List evidence against the thought...',
       aiInstruction: 'Validate the counter-evidence. Highlight how including the full picture reveals the mind\'s tendency toward all-or-nothing thinking. Under 55 words.'
     },
    summary: {
      title: '4. The Judge\'s Verdict',
      prompt: 'Write a fair, balanced verdict that incorporates all the evidence.',
      explanation: 'Write a realistic summary statement that is kinder and more objective.',
      example: 'e.g., "I am not perfect and relationships sometimes end, but I have many meaningful connections and the capacity to grow and resolve conflicts."',
      placeholder: 'Type your balanced verdict...'
    },
    celebrationTitle: 'Verdict Delivered!',
    celebrationExplanation: "Fantastic work! By looking at all the evidence, you've shown that the negative thought was an exaggeration. Live in the light of the full truth."
  },

  'challenging-negative-thinking-l4': {
    welcomeTitle: 'Alternative Explanations',
    welcomeExplanation: "Welcome. Today we learn to generate multiple realistic interpretations of confusing or challenging situations.",
    purposeTitle: 'Why Generate Alternatives?',
    purposeExplanation: "When we are stressed, our minds lock onto the most threatening explanation. Generating alternatives restores mental flexibility.",
    step1: {
      title: '1. The Stressful Explanation',
      prompt: 'Describe a situation and the stressful explanation your mind chose.',
      explanation: 'What happened, and what negative conclusion did you jump to?',
      example: 'e.g., "My manager didn\'t reply to my progress report. My mind says she hated it and is planning to replace me."',
      placeholder: 'Describe the situation and your conclusion...',
      aiInstruction: 'Validate how easy it is to jump to worst-case scenarios in the absence of feedback. Under 55 words.'
    },
    step2: {
      title: '2. Alternative Explanation A',
      prompt: 'Write down one realistic, non-threatening alternative explanation.',
      explanation: 'What is a common, neutral reason why this situation occurred?',
      example: 'e.g., "My manager is busy preparing for the quarterly review and hasn\'t had time to read it yet."',
      placeholder: 'Write alternative explanation A...',
      aiInstruction: 'Praise this alternative. Remind the user that business is a highly frequent explanation for communication gaps. Under 55 words.'
    },
step3: {
       title: '3. Alternative Explanation B',
       prompt: 'Write down a second realistic, neutral alternative explanation.',
       explanation: 'Think of another angle. Could it be a technical issue or someone else\'s delay?',
       example: 'e.g., "She read it, had no objections, and didn\'t see a need to send a brief reply."',
       placeholder: 'Write alternative explanation B...',
       aiInstruction: 'Validate the second angle. Explain that generating multiple explanations breaks the mind\'s tunnel vision toward threat. Under 55 words.'
     },
    summary: {
      title: '4. The Balanced Alternative',
      prompt: 'Combine these alternatives into a single, flexible outlook.',
      explanation: 'Write a statement that accepts the uncertainty without panic.',
      example: 'e.g., "My manager\'s silence likely means she is busy or has no major concerns. I will follow up gently later if needed."',
      placeholder: 'Type your flexible outlook...'
    },
    celebrationTitle: 'Flexibility Restored!',
    celebrationExplanation: "Superb! By generating alternatives, you've broken the grip of the worst-case scenario. You are in control of your narrative."
  },

  'challenging-negative-thinking-l5': {
    welcomeTitle: 'Reframing Daily',
    welcomeExplanation: "Welcome to the final integration. Today we build the habit of daily cognitive restructuring to maintain mental adaptability.",
    purposeTitle: 'Why Reframe Daily?',
    purposeExplanation: "Like physical stretching, daily reframing keeps your mind flexible and resilient against chronic negativity.",
    step1: {
      title: '1. Spot Today\'s ANT',
      prompt: 'Select a self-limiting thought that arose today.',
      explanation: 'What was the critic\'s loudest statement today?',
      example: 'e.g., "I am not ready for this new project."',
      placeholder: 'Type the automatic thought...',
      aiInstruction: 'Validate the fear that comes with new challenges. Acknowledge that self-doubt is a normal sign of stepping out of comfort. Under 55 words.'
    },
    step2: {
      title: '2. Audit for Distortions',
      prompt: 'What distortions are active? (e.g., Fortune Telling, Minimizing the Positive)',
      explanation: 'How is the critic bending the truth to make you feel unready?',
      example: 'e.g., "Fortune Telling (predicting failure) and Minimizing (forgetting my past successful projects)."',
      placeholder: 'Identify active distortions...',
      aiInstruction: 'Affirm the audit. Point out how exposing Fortune Telling immediately creates a sense of curiosity. Under 55 words.'
    },
step3: {
       title: '3. List the Strengths & Facts',
       prompt: 'List three facts or past successes that prove you have the capability to handle this.',
       explanation: 'Recall similar projects, your learning speed, or your adaptability.',
       example: 'e.g., "1. I learned our last tool in two weeks. 2. I have a supportive team. 3. My manager trusts me with this."',
       placeholder: 'List three factual strengths...',
       aiInstruction: 'Validate the strengths listed. Emphasize how recalling past successes builds evidence against the critic\'s negative predictions. Under 55 words.'
     },
    summary: {
      title: '4. Balanced Daily Reframe',
      prompt: 'Write your final, reframed statement for the day.',
      explanation: 'Combine the challenge, your capability, and a growth mindset.',
      example: 'e.g., "This project is a challenge, but I have the skills to start and the ability to learn as I go."',
      placeholder: 'Type your reframed daily statement...'
    },
    celebrationTitle: 'Program Completed!',
    celebrationExplanation: "Congratulations! You have completed the Challenging Negative Thinking program. Your mind is now stronger, more flexible, and ready to face challenges with confidence. Keep reframing!"
  },

  // ==========================================
  // PROGRAM: Managing Anxiety
  // ==========================================
  // ==========================================
  // PROGRAM: Managing Anxiety
  // ==========================================
  // Lesson 1: Recognizing Anxiety
  'managing-anxiety-l1-ex1': {
    welcomeTitle: 'Calming Breath Reset',
    welcomeExplanation: "Welcome! Today we begin by slowing down your body's physical alert system using paced breathing.",
    purposeTitle: 'Why Practice Paced Breathing?',
    purposeExplanation: "When anxiety triggers, your breathing automatically speeds up, sending danger signals to your brain. Paced breathing sends safety signals instead, lowering your heart rate and calming your mind.",
    step1: {
      title: '1. Position and Setup',
      prompt: 'Find a comfortable seat, place one hand on your belly, and write "I am ready to breathe slowly."',
      explanation: 'Paced breathing is most effective when you are physically comfortable and focused on your diaphragm.',
      example: 'e.g., "I am ready to breathe slowly in my quiet chair."',
      placeholder: 'Type "I am ready..."',
      aiInstruction: 'Validate the user\'s readiness warmly. Emphasize that taking a deliberate pause is a powerful act of self-care. Under 55 words.'
    },
    step2: {
      title: '2. Paced Breathing Exercise',
      prompt: 'Complete 5 rounds of inhaling for 4 seconds and exhaling for 6 seconds. Describe how the rhythm feels.',
      explanation: 'Focus on making your exhale longer than your inhale to trigger your parasympathetic nervous system.',
      example: 'e.g., "The exhale felt relaxing. I noticed my heartbeat slowing down slightly after the third round."',
      placeholder: 'Describe your experience...',
      aiInstruction: 'Praise their execution. Explain that extending the exhale directly stimulates the vagus nerve to slow down the heart. Under 55 words.'
    },
    step3: {
      title: '3. Physical Check-in',
      prompt: 'Compare your physical state before and after this exercise.',
      explanation: 'Notice any subtle changes in your shoulders, chest, stomach, or jaw.',
      example: 'e.g., "My shoulders feel much looser and the tight feeling in my chest has softened slightly."',
      placeholder: 'Describe physical changes...',
      aiInstruction: 'Acknowledge this physical release. Explain that physical softening is direct evidence that paced breathing works. Under 55 words.'
    },
    summary: {
      title: '4. Breath Anchor Statement',
      prompt: 'Write a short reminder phrase about your breath as a portable tool.',
      explanation: 'Create a sentence you can say to yourself when you notice stress rising.',
      example: 'e.g., "My breath is my anchor. I can always take a slow exhale to return to calm."',
      placeholder: 'Type your reminder phrase...'
    },
    celebrationTitle: 'Breath Reset Completed!',
    celebrationExplanation: "Fantastic work! Paced breathing is your body's built-in brake pedal. You can use it anywhere, at any time, to slow down anxiety."
  },

  'managing-anxiety-l1-ex2': {
    welcomeTitle: 'Anxiety Signal Audit',
    welcomeExplanation: "Welcome! Today we audit your typical triggers and warning signs to build awareness of how anxiety starts.",
    purposeTitle: 'Why Audit Signals?',
    purposeExplanation: "Anxiety often feels like it hits out of nowhere. Auditing your triggers helps you identify early warning signs so you can intervene before panic builds.",
    step1: {
      title: '1. Identify Recent Triggers',
      prompt: 'Recall the past week and list two situations that made you feel anxious.',
      explanation: 'Look for common themes (e.g., social interactions, work deadlines, sudden changes).',
      example: 'e.g., "1. Receiving a sudden calendar invite from my manager. 2. Walking into a crowded store."',
      placeholder: 'List two anxious situations...',
      aiInstruction: 'Validate these common triggers. Empathize with how sudden changes and crowds naturally stimulate alerts. Under 55 words.'
    },
    step2: {
      title: '2. Spot the Warning Sign',
      prompt: 'For each trigger, describe the very first physical or mental warning sign you noticed.',
      explanation: 'Did your heart speed up? Did your chest tighten? Did your mind start racing?',
      example: 'e.g., "For the calendar invite, my stomach instantly dropped. For the store, my breathing became shallow."',
      placeholder: 'Describe your warning signs...',
      aiInstruction: 'Review these warning signs. Emphasize that physical responses (stomach drop, shallow breath) are automated survival signals. Under 55 words.'
    },
    step3: {
      title: '3. Identify the Default Response',
      prompt: 'What did you immediately do when you noticed these warning signs?',
      explanation: 'Did you avoid the task, check your phone, or try to ignore the feeling?',
      example: 'e.g., "I immediately checked my email for context, and for the store, I put on headphones and hurried through."',
      placeholder: 'Describe your reaction...',
      aiInstruction: 'Acknowledge this default reaction. Explain that early actions are often safety responses to escape discomfort. Under 55 words.'
    },
    summary: {
      title: '4. Awareness Commitment',
      prompt: 'Write a commitment to observe your warning signs next time they occur.',
      explanation: 'Acknowledge that catching the alert early is key to choosing your response.',
      example: 'e.g., "I commit to noticing when my stomach drops or breathing changes, treating it as a cue to slow down and breathe."',
      placeholder: 'Type your commitment...'
    },
    celebrationTitle: 'Signals Audited!',
    celebrationExplanation: "Great job! Becoming aware of your early warning signs is half the battle. You are turning automatic reactions into conscious choices."
  },

  'managing-anxiety-l1-ex3': {
    welcomeTitle: 'Anxiety Compass Log',
    welcomeExplanation: "Welcome. Today we log an anxious moment and reframe the experience as a biological alarm, not a danger.",
    purposeTitle: 'Why Use the Anxiety Compass?',
    purposeExplanation: "Anxiety feels dangerous, which makes us panic more. Shifting your perspective to see anxiety as a misfired safety alarm breaks this panic loop.",
    step1: {
      title: '1. Describe the Event',
      prompt: 'Describe a situation where you felt significant anxiety.',
      explanation: 'State what happened, who was there, and when it occurred.',
      example: 'e.g., "Yesterday during standup, I had to share my update and felt my heart racing and hands sweating."',
      placeholder: 'Describe the situation...',
      aiInstruction: 'Validate the discomfort of speaking in standup. Explain that public sharing naturally triggers vulnerability. Under 55 words.'
    },
    step2: {
      title: '2. Document the Response',
      prompt: 'List the thoughts and physical reactions that occurred during this moment.',
      explanation: 'Focus on what your body was doing and what your mind was predicting.',
      example: 'e.g., "Thoughts: \'I will forget what I did and look incompetent.\' Body: racing heart, dry mouth, shaking voice."',
      placeholder: 'List thoughts and sensations...',
      aiInstruction: 'Acknowledge these physical and cognitive responses. Note that dry mouth and shaking are standard adrenaline effects. Under 55 words.'
    },
    step3: {
      title: '3. Reframe the Alarm',
      prompt: 'Acknowledge the adrenaline response. Write: "My body is trying to protect me, but there is no actual danger."',
      explanation: 'Remind your brain that this is an adrenaline response, not an actual threat to your survival.',
      example: 'e.g., "My heart is racing because my body is trying to protect me, but speaking in standup is not an actual danger."',
      placeholder: 'Type the safety reframe...',
      aiInstruction: 'Reinforce the safety reframe. Highlight how acknowledging safety disarms the adrenaline alert. Under 55 words.'
    },
    summary: {
      title: '4. The Alarm Compass Reframe',
      prompt: 'Write a balanced thought summarizing this biological reframe.',
      explanation: 'Combine the situation, the physical reaction, and your safety.',
      example: 'e.g., "I felt anxious speaking today, but it was just an over-eager alarm system. I am safe and competent."',
      placeholder: 'Type your final reframe...'
    },
    celebrationTitle: 'Compass Logged!',
    celebrationExplanation: "Fantastic work! Shifting your view of anxiety from a 'threat' to a 'misfired alarm' takes away its power to terrify you. You are in control."
  },

  'managing-anxiety-l1-ex4': {
    welcomeTitle: 'Notice the Alarm',
    welcomeExplanation: "Welcome. Today we practice sitting with an anxiety trigger for one minute without avoiding it.",
    purposeTitle: 'Why Notice the Alarm?',
    purposeExplanation: "When we avoid triggers, we teach our brain that the trigger is dangerous. Sitting with the alarm shows your brain that the alert will fade on its own.",
    step1: {
      title: '1. Choose a Minor Stressor',
      prompt: 'Identify a minor, upcoming task or situation that makes you feel anxious or avoidant.',
      explanation: 'Pick something small (e.g., answering a message, opening a bill, initiating a brief call).',
      example: 'e.g., "Opening my inbox and responding to a client\'s request for updates."',
      placeholder: 'Type the minor stressor...',
      aiInstruction: 'Validate this choice. Acknowledge that emails and inbox checks are extremely common daily triggers. Under 55 words.'
    },
    step2: {
      title: '2. Visualize and Feel the Alarm',
      prompt: 'Close your eyes, visualize starting the task, and sit with the nervous alert for 1 minute. Write: "I am sitting with the alert."',
      explanation: 'Notice the physical sensations (e.g. tight chest, butterflies) without trying to escape or distract yourself.',
      example: 'e.g., "I am sitting with the alert. I feel tension in my stomach and an urge to check my phone instead."',
      placeholder: 'Type "I am sitting..."',
      aiInstruction: 'Commend their willingness to sit with the discomfort. Note that tolerating the initial urge is where growth happens. Under 55 words.'
    },
    step3: {
      title: '3. Observe the Alert Peak and Fade',
      prompt: 'Describe what happened to the intensity of the alert after 1 minute.',
      explanation: 'Did the feeling peak and begin to soften? Did the urge to avoid lessen?',
      example: 'e.g., "My heart rate peaked, but as I sat here and took two breaths, the panic started to fade and the task felt less heavy."',
      placeholder: 'Describe the intensity shift...',
      aiInstruction: 'Highlight this observation. Confirm that when we do not run away, the adrenaline surge naturally peaks and declines. Under 55 words.'
    },
    summary: {
      title: '4. Tolerance Affirmation',
      prompt: 'Write a statement confirming that you can sit with anxious alerts without running.',
      explanation: 'Anchor this experience in writing to reinforce your capability.',
      example: 'e.g., "I can tolerate the alarm rising. If I sit with it, the panic will peak and fade on its own."',
      placeholder: 'Type your tolerance affirmation...'
    },
    celebrationTitle: 'Alarm Tolerated!',
    celebrationExplanation: "Outstanding! You faced the alarm and proved to your brain that the feeling is temporary and safe. This is the core of breaking avoidance habits."
  },

  'managing-anxiety-l1-ex5': {
    welcomeTitle: 'Alarm System Check',
    welcomeExplanation: "Welcome to the final reflection of Lesson 1. Today we evaluate how your view of anxiety has shifted.",
    purposeTitle: 'Why Check the Alarm?',
    purposeExplanation: "Consolidating your learning helps lock in the cognitive shift from viewing anxiety as a dangerous enemy to viewing it as a protector.",
    step1: {
      title: '1. Rate Initial Danger Perception',
      prompt: 'Before this lesson, how dangerous did anxiety feel to you (on a scale of 1-10)? Explain why.',
      explanation: 'Think about how much you feared the feeling or tried to run from it.',
      example: 'e.g., "An 8. I felt like anxiety was a sign that I was failing or that something terrible was about to happen."',
      placeholder: 'Rate and explain...',
      aiInstruction: 'Validate that initial high score. Acknowledge how easily physical alerts can be mistaken for actual danger. Under 55 words.'
    },
    step2: {
      title: '2. Rate Current Danger Perception',
      prompt: 'How dangerous does anxiety feel to you now (scale of 1-10)? Explain what changed.',
      explanation: 'Reflect on the alarm system metaphor and your practice.',
      example: 'e.g., "A 3. Knowing it is just adrenaline trying to protect me makes it feel like a nuisance rather than a threat."',
      placeholder: 'Rate and explain current view...',
      aiInstruction: 'Celebrate this decrease. Emphasize that reframing threat to nuisance changes your entire physiological response. Under 55 words.'
    },
    step3: {
      title: '3. Future Alarm Commitment',
      prompt: 'Write: "Next time I feel anxiety, I will treat it as a misfired alarm, not a real danger."',
      explanation: 'Make a clear, formal commitment to use this reframe.',
      example: 'e.g., "Next time I feel anxiety, I will treat it as a misfired alarm, not a real danger."',
      placeholder: 'Type your commitment...',
      aiInstruction: 'Validate this commitment. Affirm that repeating this reframe during future alerts strengthens the calm pathway. Under 55 words.'
    },
    summary: {
      title: '4. Alarm System Summary',
      prompt: 'Write a final, integrated summary of your new relationship with anxiety.',
      explanation: 'State how you will respond to the alarm system going forward.',
      example: 'e.g., "Anxiety is just my body\'s over-eager protector. I will acknowledge the alarm, breathe slowly, and proceed with my day."',
      placeholder: 'Type your alarm summary...'
    },
    celebrationTitle: 'Lesson 1 Completed!',
    celebrationExplanation: "Excellent job! You have completed Lesson 1. You have demystified the alert system and laid a strong foundation for managing anxiety. Walk in clarity!"
  },

  // Lesson 2: Body Awareness
  'managing-anxiety-l2-ex1': {
    welcomeTitle: 'Somatic Body Breath',
    welcomeExplanation: "Welcome. Today we learn to direct your breath to release localized physical tension and soothe somatic anxiety.",
    purposeTitle: 'Why Direct Breath?',
    purposeExplanation: "When we feel anxious, we physically lock up. Directing your breath to tense areas helps release the physical hold, calming the nervous system.",
    step1: {
      title: '1. Locate the Primary Tension',
      prompt: 'Close your eyes and identify the area of your body holding the most physical tension right now.',
      explanation: 'Check your neck, shoulders, chest, stomach, and jaw.',
      example: 'e.g., "I feel a tight, heavy knot in my shoulders and neck."',
      placeholder: 'Identify the tension area...',
      aiInstruction: 'Validate the location. Emphasize that the shoulders and neck are classic zones for storing stress. Under 55 words.'
    },
    step2: {
      title: '2. Direct the Inhale',
      prompt: 'Inhale deeply, visualizing the breath flowing directly into that tense space. Write: "I am breathing into [area]."',
      explanation: 'Imagine the breath creating space and warmth around the tight muscles.',
      example: 'e.g., "I am breathing into my shoulders, letting the air expand around the tightness."',
      placeholder: 'Type "I am breathing into..."',
      aiInstruction: 'Support this visualization. Affirm that breathing into tension brings conscious awareness and blood flow to tense muscles. Under 55 words.'
    },
    step3: {
      title: '3. Soften on the Exhale',
      prompt: 'Exhale slowly, imagining the tension softening and leaving with the breath. Describe any release.',
      explanation: 'Complete 5 cycles of this breathing. Did you notice any change in temperature or pressure?',
      example: 'e.g., "On the exhale, my shoulders dropped slightly and the muscle tension felt less rigid."',
      placeholder: 'Describe your experience...',
      aiInstruction: 'Acknowledge this release. Explain that somatic relaxation is a direct result of letting go on the exhale. Under 55 words.'
    },
    summary: {
      title: '4. Breath Softening Reminder',
      prompt: 'Write a short coping statement to use when you notice physical tension.',
      explanation: 'Combine the physical sensation and a simple breath release command.',
      example: 'e.g., "When my shoulders tighten, I will breathe space into them and let them drop on the exhale."',
      placeholder: 'Type your softening reminder...'
    },
    celebrationTitle: 'Tension Softened!',
    celebrationExplanation: "Great job! By directing your breath, you have started to release the physical grip of stress. Your body is a resource you can actively calm."
  },

  'managing-anxiety-l2-ex2': {
    welcomeTitle: 'Body Scan Audit',
    welcomeExplanation: "Welcome. Today we perform a systematic body scan to audit and observe somatic signals without resistance.",
    purposeTitle: 'Why Scan the Body?',
    purposeExplanation: "Anxiety scatters our attention. A body scan pulls your focus back to physical reality, allowing you to observe sensations before they turn into panic.",
    step1: {
      title: '1. Scan and Locate Sensations',
      prompt: 'Scan your body from your feet to your jaw. List three distinct sensations you notice.',
      explanation: 'Look for temperature, pressure, tightness, tingling, or movement.',
      example: 'e.g., "1. Tightness in chest. 2. Warmth in face. 3. Slight fluttering in stomach."',
      placeholder: 'List three sensations...',
      aiInstruction: 'Validate these sensations. Acknowledge that chest tightness and stomach fluttering are common somatic alerts. Under 55 words.'
    },
    step2: {
      title: '2. Observe the Resistance',
      prompt: 'Notice if you are actively fighting these sensations, holding your breath, or bracing.',
      explanation: 'Bracing is our natural reaction to discomfort, but it actually keeps the tension locked.',
      example: 'e.g., "I notice I was holding my breath and clenching my jaw to brace against the stomach flutter."',
      placeholder: 'Describe your bracing or resistance...',
      aiInstruction: 'Acknowledge the bracing. Explain that clenching is a defense mechanism that accidentally intensifies the sensation. Under 55 words.'
    },
    step3: {
      title: '3. Soften the Posture',
      prompt: 'Unclench your jaw, drop your shoulders, and write: "I am softening my body around the sensations."',
      explanation: 'Release the physical bracing. Let your belly relax and breathe naturally.',
      example: 'e.g., "I am softening my body around the sensations, letting my belly expand and jaw relax."',
      placeholder: 'Type "I am softening..."',
      aiInstruction: 'Validate this somatic release. Explain that softening posture signals safety, prompting the nervous system to settle. Under 55 words.'
    },
    summary: {
      title: '4. Body Scan Anchor',
      prompt: 'Write a balanced thought summarizing this somatic scan.',
      explanation: 'Acknowledge the sensations while committing to physical softening.',
      example: 'e.g., "I feel fluttering and tightness, but I can soften my posture and let these sensations exist safely."',
      placeholder: 'Type your body scan anchor...'
    },
    celebrationTitle: 'Body Scanned!',
    celebrationExplanation: "Excellent work! Auditing your physical sensations and releasing the bracing is a major skill in reducing the somatic feedback loop of anxiety."
  },

  'managing-anxiety-l2-ex3': {
    welcomeTitle: 'Somatic Map Journal',
    welcomeExplanation: "Welcome. Today we journal about physical sensations using neutral, non-alarmist language.",
    purposeTitle: 'Why Describe Sensations Neutrally?',
    purposeExplanation: "The mind labels anxiety symptoms as 'dangerous' (e.g., 'I cannot breathe'). Describing them neutrally (e.g., 'tight chest') strips away the threat, calming the mind.",
    step1: {
      title: '1. Select the Somatic Symptom',
      prompt: 'Choose one physical symptom of anxiety that typically frightens you the most.',
      explanation: 'Think of symptoms like heart racing, shortness of breath, dizziness, or chest tightness.',
      example: 'e.g., "Shortness of breath and a tight sensation in my chest."',
      placeholder: 'Type the symptom...',
      aiInstruction: 'Validate the fear of breathing restriction. Empathize with how terrifying it is when the breath feels shallow. Under 55 words.'
    },
    step2: {
      title: '2. Translate to Neutral Terms',
      prompt: 'Describe the sensation using strictly objective physical attributes (e.g., rate, temperature, weight, volume).',
      explanation: 'Do not use words like "scary", "dying", or "choking". Use neutral, scientific descriptors.',
      example: 'e.g., "A heavy pressure in the center of my chest, and a fast, shallow inhale/exhale cycle."',
      placeholder: 'Describe objectively...',
      aiInstruction: 'Praise this translation. Confirm that objective language (heavy pressure, shallow cycle) removes the threat bias from the sensation. Under 55 words.'
    },
    step3: {
      title: '3. Create the Neutral Safety Statement',
      prompt: 'Write: "My [sensation] feels [attributes], and I can still breathe safely."',
      explanation: 'Create a dialectic statement that accepts the physical discomfort while asserting your actual safety.',
      example: 'e.g., "My chest feels heavy and tight, and I can still breathe and function safely in this room."',
      placeholder: 'Type your safety statement...',
      aiInstruction: 'Validate this safety statement. Explain that separating discomfort from danger is the key to somatic mastery. Under 55 words.'
    },
    summary: {
      title: '4. Somatic Map Reframe',
      prompt: 'Write a balanced reframe to repeat when this physical symptom appears.',
      explanation: 'Use your neutral safety statement as a base.',
      example: 'e.g., "My tight chest is just an uncomfortable physical sensation, not a danger. I am safe and can still breathe."',
      placeholder: 'Type your somatic reframe...'
    },
    celebrationTitle: 'Sensation Mapped!',
    celebrationExplanation: "Fantastic job! By translating somatic panic into neutral, objective facts, you've shown your brain that discomfort is not danger. Walk in safety!"
  },

  'managing-anxiety-l2-ex4': {
    welcomeTitle: 'Somatic Welcoming',
    welcomeExplanation: "Welcome. Today we practice sitting with a physical sensation of anxiety for 2 minutes to build tolerance.",
    purposeTitle: 'Why Welcome Discomfort?',
    purposeExplanation: "When we fight physical sensations, we trigger more adrenaline. Welcoming the sensation removes the threat, allowing it to peak and fade naturally.",
    step1: {
      title: '1. Select the Focus Sensation',
      prompt: 'Locate a physical sensation of anxiety or tension in your body to focus on.',
      explanation: 'Choose an active sensation (e.g., tight chest, butterflies, cold hands, tense jaw).',
      example: 'e.g., "The fluttering and butterflies in my stomach."',
      placeholder: 'Type the focus sensation...',
      aiInstruction: 'Validate this target. Acknowledge that the stomach is a highly responsive somatic indicator of stress. Under 55 words.'
    },
    step2: {
      title: '2. Commit to Welcoming It',
      prompt: 'Commit to sitting with it for 2 minutes. Write: "I allow this [sensation] to exist in my body right now."',
      explanation: 'Set your intention to let the sensation be there without trying to change it, remove it, or fix it.',
      example: 'e.g., "I allow this stomach fluttering to exist in my body right now. I don\'t need to fix it."',
      placeholder: 'Type "I allow..."',
      aiInstruction: 'Support this commitment. Highlight that allowing sensations to exist is the fastest way to signal safety to your brain. Under 55 words.'
    },
    step3: {
      title: '3. Observe the Shift',
      prompt: 'Describe what happened to the sensation during the 2 minutes.',
      explanation: 'Did it move? Did it warm up? Did it soften or decrease in intensity?',
      example: 'e.g., "At first, it felt intense. But as I took two slow breaths and welcomed it, it softened into a warm, quiet buzz and didn\'t feel scary."',
      placeholder: 'Describe the shift...',
      aiInstruction: 'Review this shift. Emphasize that physical discomfort naturally de-escalates when it is welcomed rather than resisted. Under 55 words.'
    },
    summary: {
      title: '4. Somatic Welcoming Affirmation',
      prompt: 'Write a statement confirming your ability to welcome and tolerate physical discomfort.',
      explanation: 'Use this to remind yourself that you have space for uncomfortable feelings.',
      example: 'e.g., "I have space for physical discomfort. I can welcome it and let it pass naturally."',
      placeholder: 'Type your affirmation...'
    },
    celebrationTitle: 'Sensations Welcomed!',
    celebrationExplanation: "Superb work! You sat with discomfort and proved that physical sensations are safe and manageable. You are building true somatic resilience."
  },

  'managing-anxiety-l2-ex5': {
    welcomeTitle: 'Somatic Tolerance Check',
    welcomeExplanation: "Welcome to the final reflection of Lesson 2. Today we evaluate your physical tolerance and somatic safety.",
    purposeTitle: 'Why Verify Somatic Tolerance?',
    purposeExplanation: "Evaluating your progress locks in the realization that physical symptoms of anxiety are safe and temporary, reducing future somatic panic.",
    step1: {
      title: '1. Rate Sensation Discomfort',
      prompt: 'Rate the discomfort of the physical sensation (1-10) before and after welcoming it in the previous exercises.',
      explanation: 'Compare the intensity and notice the change.',
      example: 'e.g., "Before: 7 (high distress). After: 3 (manageable buzz)."',
      placeholder: 'Rate before and after...',
      aiInstruction: 'Acknowledge this change. Validate that welcoming sensations drops distress levels rapidly. Under 55 words.'
    },
    step2: {
      title: '2. Confirm Safety and Temporariness',
      prompt: 'Confirm that the sensation did not harm you. Write: "Physical sensations are uncomfortable, but they are safe and temporary."',
      explanation: 'State this fact clearly to reinforce safety in your memory.',
      example: 'e.g., "Physical sensations are uncomfortable, but they are safe and temporary. The fluttering did not harm me."',
      placeholder: 'Type the confirmation...',
      aiInstruction: 'Validate this confirmation. Explain that reinforcing safety in writing rewrites the brain\'s automatic alarm response. Under 55 words.'
    },
    step3: {
      title: '3. Share Your Core Insight',
      prompt: 'What was your biggest insight about your body during this lesson?',
      explanation: 'What did you discover about how physical tension reacts to acceptance?',
      example: 'e.g., "I learned that when I stop clenching my body to fight anxiety, the feeling actually passes much faster."',
      placeholder: 'Type your core insight...',
      aiInstruction: 'Highlight this insight. Confirm that releasing the fight is the ultimate secret to somatic calming. Under 55 words.'
    },
    summary: {
      title: '4. Physical Resilience Affirmation',
      prompt: 'Write a final statement of physical resilience to close this lesson.',
      explanation: 'Summarize your ability to tolerate and navigate physical symptoms of stress.',
      example: 'e.g., "My body is strong and safe. I can observe physical alerts calmly, soften my posture, and let them pass."',
      placeholder: 'Type your affirmation...'
    },
    celebrationTitle: 'Lesson 2 Completed!',
    celebrationExplanation: "Fantastic work! You have completed Lesson 2. You have built body awareness and learned somatic tolerance. You are the steady anchor in your body!"
  },

  // Lesson 3: Safety Behaviors
  'managing-anxiety-l3-ex1': {
    welcomeTitle: 'Anchored Grounding Breath',
    welcomeExplanation: "Welcome. Today we practice paced breathing combined with physical sensory anchors to stabilize your nervous system.",
    purposeTitle: 'Why Anchor the Breath?',
    purposeExplanation: "Anxiety forces us to get lost in worry. Combining paced breathing with physical anchors pulls your mind out of spirals and back to the present.",
    step1: {
      title: '1. Set Your Breathing Pace',
      prompt: 'Complete 3 rounds of inhaling for 4 seconds, holding for 4 seconds, and exhaling for 4 seconds.',
      explanation: 'This equal-ratio breathing balances oxygen levels and triggers physiological stability.',
      example: 'e.g., "Completed 3 rounds. I feel slightly more centered and my breathing is even."',
      placeholder: 'Describe your initial state...',
      aiInstruction: 'Commend the breathing. Acknowledge that equal-ratio breathing is a highly reliable stabilizer. Under 55 words.'
    },
    step2: {
      title: '2. Identify Sensory Anchors',
      prompt: 'Name three physical objects in your immediate surroundings to anchor your eyes.',
      explanation: 'Focus on their shape, color, and texture. Describe them objectively.',
      example: 'e.g., "1. A black coffee mug with a smooth surface. 2. A green leaf on my potted plant. 3. A rectangular blue notebook."',
      placeholder: 'List three objects...',
      aiInstruction: 'Validate these anchors. Affirm that naming physical objects anchors your visual cortex, disrupting worry loops. Under 55 words.'
    },
    step3: {
      title: '3. Feel the Physical Support',
      prompt: 'Notice the support of your chair or the floor underneath you. Write "I am physically supported."',
      explanation: 'Focus on the sensation of gravity and pressure connecting your body to the seat.',
      example: 'e.g., "I am physically supported. I feel the solid pressure of my chair holding me up."',
      placeholder: 'Type "I am physically supported..."',
      aiInstruction: 'Acknowledge this somatic grounding. Explain that feeling the support of your chair triggers somatic safety. Under 55 words.'
    },
    summary: {
      title: '4. Grounding Breath Anchor',
      prompt: 'Write a short statement combining breath and sensory grounding.',
      explanation: 'Create a reminder phrase to use when your mind begins to drift into worry.',
      example: 'e.g., "I can breathe slowly, focus on the physical objects around me, and feel grounded in this room."',
      placeholder: 'Type your grounding statement...'
    },
    celebrationTitle: 'Breath Anchored!',
    celebrationExplanation: "Great job! Combining breath and sensory anchors is a portable tool you can use to stabilize yourself in any high-stress environment."
  },

  'managing-anxiety-l3-ex2': {
    welcomeTitle: 'Safety Behavior Audit',
    welcomeExplanation: "Welcome. Today we identify the avoidant habits and safety behaviors that keep your anxiety loops alive.",
    purposeTitle: 'Why Audit Safety Behaviors?',
    purposeExplanation: "Safety behaviors (like checking your phone or over-preparing) give short-term relief but keep anxiety alive by reinforcing the belief that the situation is dangerous.",
    step1: {
      title: '1. List Your Safety Behaviors',
      prompt: 'List three safety behaviors or avoidant habits you typically perform when anxious.',
      explanation: 'Think of actions like avoiding eye contact, checking notifications, over-preparing, or leaving early.',
      example: 'e.g., "1. Checking my phone repeatedly when in uncomfortable social settings. 2. Over-preparing slides for hours. 3. Staying near exits."',
      placeholder: 'List three safety behaviors...',
      aiInstruction: 'Validate these common habits. Empathize with how natural it is to seek quick relief in uncomfortable situations. Under 55 words.'
    },
    step2: {
      title: '2. Analyze Short-Term Relief',
      prompt: 'Explain how these behaviors make you feel in the immediate short term.',
      explanation: 'What is the immediate relief or drop in anxiety?',
      example: 'e.g., "Checking my phone gives me an instant distraction and makes me feel less self-conscious for a few seconds."',
      placeholder: 'Describe short-term relief...',
      aiInstruction: 'Acknowledge this temporary relief. Confirm that safety behaviors are highly reinforcing because they lower stress immediately. Under 55 words.'
    },
    step3: {
      title: '3. Unmask Long-Term Costs',
      prompt: 'Explain how these behaviors keep your anxiety alive in the long term.',
      explanation: 'What does your brain learn when you use these safety nets?',
      example: 'e.g., "Because I check my phone, my brain never learns that I can survive a social setting without it. It keeps the fear alive."',
      placeholder: 'Describe long-term costs...',
      aiInstruction: 'Review this crucial insight. Emphasize that safety nets prevent your brain from experiencing natural safety and habituation. Under 55 words.'
    },
    summary: {
      title: '4. Safety Behavior Challenge Target',
      prompt: 'Select one safety behavior you commit to challenging and reducing.',
      explanation: 'Choose a target behavior that you can easily monitor and delay.',
      example: 'e.g., "I select checking my phone repeatedly in social settings as my challenge target."',
      placeholder: 'Type your challenge target...'
    },
    celebrationTitle: 'Behaviors Audited!',
    celebrationExplanation: "Excellent work! Identifying your safety nets is the first step in letting them go. You are preparing to build true independence from anxiety."
  },

  'managing-anxiety-l3-ex3': {
    welcomeTitle: 'Avoidance Cost Log',
    welcomeExplanation: "Welcome. Today we log the actual long-term costs of avoiding anxious situations, highlighting the value of freedom.",
    purposeTitle: 'Why Log Avoidance Costs?',
    purposeExplanation: "Avoidance feels like safety, but it shrinks your life. Logging the costs of avoidance motivates you to face discomfort to regain freedom.",
    step1: {
      title: '1. Identify a Recent Avoidance',
      prompt: 'Describe a situation you recently avoided or escaped due to anxiety.',
      explanation: 'State what the situation was and what you chose to do instead.',
      example: 'e.g., "I avoided attending a voluntary team lunch last Friday, choosing to eat alone at my desk instead."',
      placeholder: 'Describe the avoidance...',
      aiInstruction: 'Validate the choice to stay back. Empathize with how appealing a quiet desk feels compared to social demands. Under 55 words.'
    },
    step2: {
      title: '2. Calculate the Cost',
      prompt: 'What did you miss out on, or what was the long-term cost of this decision?',
      explanation: 'Think about connection, career growth, self-esteem, or personal freedom.',
      example: 'e.g., "I missed a chance to chat casually with my team and get to know them. I also felt guilty and isolated afterward."',
      placeholder: 'Describe the cost...',
      aiInstruction: 'Review this cost. Emphasize that isolation and guilt are the tax avoidance collects from our self-worth. Under 55 words.'
    },
    step3: {
      title: '3. Reflect on the Brain\'s Lesson',
      prompt: 'How did avoiding this situation reinforce the belief that you cannot handle it?',
      explanation: 'What story did your brain write about the social lunch?',
      example: 'e.g., "It taught my brain that team lunches are indeed dangerous and that I must avoid them in the future to stay safe."',
      placeholder: 'Reflect on the brain\'s story...',
      aiInstruction: 'Validate this mechanism. Explain that avoidance confirms the false threat, keeping the fear loop locked. Under 55 words.'
    },
    summary: {
      title: '4. Cost-Benefit Anchor',
      prompt: 'Write a statement comparing the short-term comfort of avoidance to the long-term cost.',
      explanation: 'Remind yourself why facing discomfort is worth the effort.',
      example: 'e.g., "Avoidance gives me 10 minutes of relief but costs me connections and self-esteem. I choose to face discomfort for my freedom."',
      placeholder: 'Type your comparison statement...'
    },
    celebrationTitle: 'Cost Logged!',
    celebrationExplanation: "Fantastic work! Recognizing the cost of avoidance helps shift your motivation from seeking comfort to seeking freedom. You are ready to step forward."
  },

  'managing-anxiety-l3-ex4': {
    welcomeTitle: 'Safety Behavior Delay',
    welcomeExplanation: "Welcome. Today we practice delaying a safety behavior for 5 minutes when anxiety rises to build distress tolerance.",
    purposeTitle: 'Why Delay Safety Behaviors?',
    purposeExplanation: "When you delay a safety behavior, you show your brain that you can survive the discomfort. The anxiety will peak and decrease naturally without the safety net.",
    step1: {
      title: '1. Specify the Target Action',
      prompt: 'State the specific safety behavior you commit to delaying next time you feel anxious.',
      explanation: 'Choose a concrete action (e.g. checking phone, adjusting clothes, asking for reassurance).',
      example: 'e.g., "I commit to delaying checking my phone when I walk into the next team meeting room."',
      placeholder: 'Type the target behavior...',
      aiInstruction: 'Validate this target. Acknowledge that checking the phone in meetings is a highly common safety shield. Under 55 words.'
    },
    step2: {
      title: '2. Set the Delay Commitment',
      prompt: 'Write: "I commit to waiting 5 minutes before performing my safety behavior, using my breath as an anchor."',
      explanation: 'Make a formal commitment to sit with the discomfort during the delay.',
      example: 'e.g., "I commit to waiting 5 minutes before performing my safety behavior, using my breath as an anchor."',
      placeholder: 'Type your commitment...',
      aiInstruction: 'Support this commitment. Explain that 5 minutes is plenty of time for the brain to start realizing it is safe. Under 55 words.'
    },
    step3: {
      title: '3. Map the Delay Strategy',
      prompt: 'What will you do during the 5 minutes of delay to anchor yourself?',
      explanation: 'Plan a somatic reset (e.g., focus on your seat, count breaths, name objects).',
      example: 'e.g., "I will sit, take three slow exhales, and observe the shape of the conference table."',
      placeholder: 'Describe your delay strategy...',
      aiInstruction: 'Validate this grounding plan. Affirm that active somatic focus keeps the mind present during discomfort. Under 55 words.'
    },
    summary: {
      title: '4. Delay Commitment Anchor',
      prompt: 'Write a short courage statement to read right before you start your delay.',
      explanation: 'Keep it focused on tolerating the urge.',
      example: 'e.g., "I can feel the urge and still wait. The discomfort is temporary and I can handle it."',
      placeholder: 'Type your courage statement...'
    },
    celebrationTitle: 'Delay Plan Created!',
    celebrationExplanation: "Superb! Delaying safety behaviors is a highly effective way to retrain your brain. You are breaking the automated escape loop."
  },

  'managing-anxiety-l3-ex5': {
    welcomeTitle: 'Delay Reflection',
    welcomeExplanation: "Welcome to the final reflection of Lesson 3. Today we evaluate the outcome of delaying safety behaviors.",
    purposeTitle: 'Why Evaluate Delays?',
    purposeExplanation: "Reflecting on your success locks in the learning: you survived without the safety net, and the anxiety decreased naturally. This builds self-efficacy.",
    step1: {
      title: '1. Rate Urge Levels',
      prompt: 'Rate the urge to perform the safety behavior (1-10) at the start and end of the 5-minute delay.',
      explanation: 'Notice the decrease in urge intensity.',
      example: 'e.g., "Start: 8 (strong urge). End: 4 (manageable)."',
      placeholder: 'Rate start and end urge...',
      aiInstruction: 'Validate this decrease. Explain that urges naturally peak and drop when we do not feed them with immediate action. Under 55 words.'
    },
    step2: {
      title: '2. Confirm Natural Calm',
      prompt: 'Confirm that your anxiety decreased naturally without the safety net. Write: "My anxiety decreased naturally without the safety behavior."',
      explanation: 'State this fact clearly to reinforce natural safety in your memory.',
      example: 'e.g., "My anxiety decreased naturally without the safety behavior. I didn\'t need my phone to feel safe."',
      placeholder: 'Type the confirmation...',
      aiInstruction: 'Validate this confirmation. Affirm that proving you don\'t need safety shields builds unshakeable confidence. Under 55 words.'
    },
    step3: {
      title: '3. Future Integration Plan',
      prompt: 'How will you integrate safety behavior delays into your daily routine?',
      explanation: 'Select a recurring daily event to practice this delay.',
      example: 'e.g., "I will practice this delay daily when waiting in line or entering a meeting room instead of grabbing my phone."',
      placeholder: 'Type your daily plan...',
      aiInstruction: 'Praise this integration. Confirm that daily practice turns delay into your new default response. Under 55 words.'
    },
    summary: {
      title: '4. Independence Affirmation',
      prompt: 'Write a final statement of independence from safety behaviors.',
      explanation: 'Summarize your capability to stand in uncomfortable situations without safety shields.',
      example: 'e.g., "I don\'t need safety shields to cope. I can tolerate discomfort and allow anxiety to settle naturally."',
      placeholder: 'Type your final affirmation...'
    },
    celebrationTitle: 'Lesson 3 Completed!',
    celebrationExplanation: "Fantastic work! You have completed Lesson 3. You have unmasked safety behaviors and built distress tolerance. You are claiming your freedom!"
  },

  // Lesson 4: Exposure Planning
  'managing-anxiety-l4-ex1': {
    welcomeTitle: 'Box Breathing for Courage',
    welcomeExplanation: "Welcome. Today we use box breathing to stabilize your physiology and build courage before planning exposures.",
    purposeTitle: 'Why Box Breath for Courage?',
    purposeExplanation: "Box breathing balances carbon dioxide and oxygen levels, stabilizing your heart rate and calming the amygdala. This puts you in a logical mindset to face fears.",
    step1: {
      title: '1. Complete the Box Breathing Cycle',
      prompt: 'Complete 4 rounds of: Inhale 4s, Hold 4s, Exhale 4s, Hold empty 4s. Describe the physical sensation.',
      explanation: 'Keep your breath steady and focus on the counts. Notice the stillness during the holds.',
      example: 'e.g., "Completed 4 rounds. I feel a sense of stillness and focus in my chest. My mind has quieted down."',
      placeholder: 'Describe your physical state...',
      aiInstruction: 'Acknowledge this stillness. Explain that holding empty triggers a rapid calming response in the nervous system. Under 55 words.'
    },
    step2: {
      title: '2. Identify the Courage Shift',
      prompt: 'Compare your level of focus and readiness to face challenges before and after box breathing.',
      explanation: 'Do you feel more present? Is the anxiety feeling more distant?',
      example: 'e.g., "Before, my thoughts were racing about what exposures to plan. Now, I feel logical and ready to write them down."',
      placeholder: 'Describe the readiness shift...',
      aiInstruction: 'Validate this shift. Affirm that box breathing prepares the prefrontal cortex for logical planning. Under 55 words.'
    },
    step3: {
      title: '3. Focus the Mind',
      prompt: 'Write: "I am steady, focused, and ready to design my exposure plan."',
      explanation: 'Set a clear intention of courage and logic.',
      example: 'e.g., "I am steady, focused, and ready to design my exposure plan."',
      placeholder: 'Type your intention...',
      aiInstruction: 'Validate this intention. Explain how stating readiness reinforces your commitment to face discomfort. Under 55 words.'
    },
    summary: {
      title: '4. Box Breathing Courage Anchor',
      prompt: 'Write a short statement committing to use box breathing before challenging tasks.',
      explanation: 'Anchor this tool as your pre-challenge routine.',
      example: 'e.g., "Before I take any exposure step, I will complete 4 rounds of box breathing to ground my body."',
      placeholder: 'Type your commitment...'
    },
    celebrationTitle: 'Physiology Stabilized!',
    celebrationExplanation: "Great job! Box breathing is your courage preparation. Your body is steady, and you are ready to plan your exposure steps."
  },

  'managing-anxiety-l4-ex2': {
    welcomeTitle: 'Exposure Ladder Design',
    welcomeExplanation: "Welcome. Today we design a graded exposure ladder to face a specific anxiety target systematically.",
    purposeTitle: 'Why Build a Ladder?',
    purposeExplanation: "Trying to face a major fear all at once is overwhelming and can backfire. Graded exposure—climbing a ladder of small steps—helps your brain habituate safely.",
    step1: {
      title: '1. Choose the Target Fear',
      prompt: 'Identify one situation or task you avoid due to anxiety (e.g. asking for help, speaking in public, setting boundaries).',
      explanation: 'Focus on a situation that is important for your growth.',
      example: 'e.g., "Speaking up in our next team brainstorm to suggest a design idea."',
      placeholder: 'Type your target fear...',
      aiInstruction: 'Validate this target. Acknowledge that suggesting ideas in team brainstorms is a very common trigger for fear of judgment. Under 55 words.'
    },
    step2: {
      title: '2. List Progressive Steps',
      prompt: 'Break this situation down into 3 progressive steps, from least scary to most scary. Rate expected anxiety (0-100%) for each.',
      explanation: 'Each step should build toward the target.',
      example: 'e.g., "1. Writing down my design idea before the meeting (30% anxiety). 2. Telling a teammate my idea beforehand (50%). 3. Sharing my idea in the group meeting (80%)."',
      placeholder: 'List your steps and anxiety ratings...',
      aiInstruction: 'Review and praise this graded ladder. Confirm that breaking fears down into manageable steps is the gold standard of exposure. Under 55 words.'
    },
    step3: {
      title: '3. Select the First Step',
      prompt: 'Choose the first step on your ladder (ideally between 30% and 50% anxiety) and commit to taking it.',
      explanation: 'Focus on the lowest hurdle to build initial momentum.',
      example: 'e.g., "I commit to writing down my design idea and showing it to my teammate Sarah before the meeting."',
      placeholder: 'Write your first step commitment...',
      aiInstruction: 'Validate this initial step commitment. Emphasize that taking the first, low-anxiety step builds momentum for the rest. Under 55 words.'
    },
    summary: {
      title: '4. Exposure Ladder Commitment',
      prompt: 'Write your formal commitment to climb this ladder at your own pace.',
      explanation: 'Commit to the process of graded exposure.',
      example: 'e.g., "I commit to climbing my exposure ladder step-by-step, prioritizing growth over comfort."',
      placeholder: 'Type your commitment...'
    },
    celebrationTitle: 'Ladder Built!',
    celebrationExplanation: "Excellent work! Breaking down fears makes them manageable. You are ready to start climbing your ladder at your own pace."
  },

  'managing-anxiety-l4-ex3': {
    welcomeTitle: 'Expectation Testing Log',
    welcomeExplanation: "Welcome. Today we document your predictions and fears before performing your exposure task.",
    purposeTitle: 'Why Test Predictions?',
    purposeExplanation: "Anxiety operates on unverified predictions (e.g. 'I will fail'). Documenting your predictions allows you to test them objectively against reality.",
    step1: {
      title: '1. State the Exposure Task',
      prompt: 'Write down the specific exposure step you are about to perform.',
      explanation: 'This should be the first step from your exposure ladder.',
      example: 'e.g., "Sharing my design idea with my teammate Sarah before the meeting."',
      placeholder: 'Type the exposure step...',
      aiInstruction: 'Validate the step. Emphasize that sharing with a single teammate is an excellent, low-risk way to start. Under 55 words.'
    },
    step2: {
      title: '2. Document the Fear Prediction',
      prompt: 'What is your specific prediction? (e.g. "She will think my idea is stupid and laugh").',
      explanation: 'Write down the exact story your anxiety is telling you.',
      example: 'e.g., "She will think my idea is stupid, roll her eyes, and tell me it won\'t work."',
      placeholder: 'Type the prediction...',
      aiInstruction: 'Review this prediction. Note that the mind catastrophizes to protect us from rejection, even when it is highly unlikely. Under 55 words.'
    },
    step3: {
      title: '3. Map the Worst-Case Coping',
      prompt: 'Even if the worst happened and she criticized the idea, how would you cope?',
      explanation: 'Map out a logical recovery plan to remove the fear of the unknown.',
      example: 'e.g., "If she says it won\'t work, I will ask for feedback, thank her for the input, and remember my worth is not tied to one idea."',
      placeholder: 'Describe your coping plan...',
      aiInstruction: 'Validate this coping plan. Affirm that having a clear recovery plan takes away the critic\'s power to threaten you. Under 55 words.'
    },
    summary: {
      title: '4. Reality Statement',
      prompt: 'Write a reality statement combining probability and coping capacity.',
      explanation: 'Summarize the reality test before taking action.',
      example: 'e.g., "It is highly likely Sarah will welcome my idea, and even if she doesn\'t, I have a clear plan to handle the feedback."',
      placeholder: 'Type your reality statement...'
    },
    celebrationTitle: 'Expectations Logged!',
    celebrationExplanation: "Outstanding work! You have documented your predictions and mapped your coping plan. You are ready to test this against reality."
  },

  'managing-anxiety-l4-ex4': {
    welcomeTitle: 'Micro-Exposure Run',
    welcomeExplanation: "Welcome. Today you execute your planned exposure step and track your distress levels.",
    purposeTitle: 'Why Track Distress?',
    purposeExplanation: "Distress naturally peaks and declines during exposure. Tracking this peak and fade proves to your brain that anxiety is temporary and safe.",
    step1: {
      title: '1. Execute the Exposure',
      prompt: 'Perform your planned exposure step and write "I completed the exposure step."',
      explanation: 'Focus on staying present, breathing slowly, and avoiding safety behaviors.',
      example: 'e.g., "I completed the exposure step: I met with Sarah and shared my design idea."',
      placeholder: 'Type "I completed..."',
      aiInstruction: 'Celebrate this action! Commend the courage of taking the step and staying present. Under 55 words.'
    },
    step2: {
      title: '2. Track Distress Levels',
      prompt: 'Rate your anxiety level (0-100%) at the start, peak, and end of the exposure.',
      explanation: 'Observe the rise and fall of the anxiety wave.',
      example: 'e.g., "Start: 60%. Peak: 80% (when opening my mouth). End: 30% (after she listened)."',
      placeholder: 'Rate start, peak, and end...',
      aiInstruction: 'Celebrate this action! Commend the courage of taking the step and staying present. Under 55 words.'
    },
    step3: {
      title: '3. Observe the Habituation',
      prompt: 'How did staying in the situation affect your comfort over time?',
      explanation: 'Did the physical sensations begin to fade after the first few minutes?',
      example: 'e.g., "After 2 minutes of talking, my heart rate slowed down, and I felt much more comfortable sharing details."',
      placeholder: 'Describe the comfort shift...',
      aiInstruction: 'Validate this habituation. Explain that staying in the situation is how the brain updates its safety files. Under 55 words.'
    },
    summary: {
      title: '4. Exposure Achievement Summary',
      prompt: 'Write a brief statement of victory summarizing this exposure experience.',
      explanation: 'Celebrate your willingness to stand in discomfort.',
      example: 'e.g., "I faced the fear of sharing my idea, tolerated the peak anxiety, and stayed in the situation until I felt calm."',
      placeholder: 'Type your summary...'
    },
    celebrationTitle: 'Exposure Executed!',
    celebrationExplanation: "Fantastic work! You took the step and survived the peak. You are teaching your brain that you can handle uncertainty and grow."
  },

  'managing-anxiety-l4-ex5': {
    welcomeTitle: 'Outcome Comparison',
    welcomeExplanation: "Welcome to the final reflection of Lesson 4. Today we compare actual outcomes with your initial predictions.",
    purposeTitle: 'Why Compare Outcomes?',
    purposeExplanation: "Anxiety thrives on catastrophic predictions. Comparing predictions with reality helps correct the brain's exaggerated threat estimates.",
    step1: {
      title: '1. Review the Prediction',
      prompt: 'Compare what actually happened during the exposure to your initial prediction.',
      explanation: 'Did the worst-case scenario occur? Did the teammate react as feared?',
      example: 'e.g., "My prediction was that Sarah would roll her eyes and think my idea was stupid. In reality, she was actually interested and helped me refine it."',
      placeholder: 'Compare prediction to reality...',
      aiInstruction: 'Highlight this contrast. Point out how far the anxiety prediction was from actual reality. Under 55 words.'
    },
    step2: {
      title: '2. Rate Prediction Accuracy',
      prompt: 'Rate the accuracy of your initial fear from 0% to 100%. Explain why.',
      explanation: 'Did your fear turn out to be a realistic estimate?',
      example: 'e.g., "0% accuracy. The fear was completely wrong about her response and underestimated her kindness."',
      placeholder: 'Rate and explain accuracy...',
      aiInstruction: 'Acknowledge the 0% score. Emphasize that anxiety is a terrible fortune teller that constantly overestimates danger. Under 55 words.'
    },
    step3: {
      title: '3. Future Exposure Commitment',
      prompt: 'Write: "My mind predicted danger, but the reality was safe. I can handle exposure steps."',
      explanation: 'Reinforce this cognitive correction in writing.',
      example: 'e.g., "My mind predicted danger, but the reality was safe. I can handle exposure steps."',
      placeholder: 'Type the confirmation statement...',
      aiInstruction: 'Validate this confirmation. Explain that logging this safety update rewrites future anticipatory anxiety. Under 55 words.'
    },
    summary: {
      title: '4. Exposure Growth Statement',
      prompt: 'Write a final, integrated growth statement to close this lesson.',
      explanation: 'Summarize how facing fears gradually helps you grow in confidence.',
      example: 'e.g., "Facing fears step-by-step shows me that my worries are rarely correct and that I have the capacity to handle whatever happens."',
      placeholder: 'Type your final statement...'
    },
    celebrationTitle: 'Lesson 4 Completed!',
    celebrationExplanation: "Fantastic work! You have completed Lesson 4. You have built an exposure ladder and successfully executed a step. You are climbing to courage!"
  },

  // Lesson 5: Recovery Toolkit
  'managing-anxiety-l5-ex1': {
    welcomeTitle: 'Calm Integration Breath',
    welcomeExplanation: "Welcome. Today we learn the physiological sigh to trigger rapid nervous system recovery and seal the program.",
    purposeTitle: 'Why the Physiological Sigh?',
    purposeExplanation: "The physiological sigh—two quick inhales followed by a long exhale—collapses the air sacs in your lungs, triggering an instant release of carbon dioxide and calming the brain immediately.",
    step1: {
      title: '1. Learn the Breath Pattern',
      prompt: 'Take a deep inhale through your nose, followed immediately by a quick second sniff. Write "Ready to sigh."',
      explanation: 'The second sniff ensures your lungs are fully inflated before the release.',
      example: 'e.g., "Ready to sigh, lungs fully expanded."',
      placeholder: 'Type "Ready to sigh"',
      aiInstruction: 'Validate the setup. Explain that this pattern is the fastest biological way to trigger calm. Under 55 words.'
    },
    step2: {
      title: '2. Execute the Slow Exhale',
      prompt: 'Exhale slowly and fully through your mouth, letting your entire body relax. Describe the sensation.',
      explanation: 'Make the exhale last at least 6 seconds, letting go of all muscular tension.',
      example: 'e.g., "The release felt like a heavy weight dropping off my chest. I felt an instant release of tension."',
      placeholder: 'Describe the sensation...',
      aiInstruction: 'Praise this release. Confirm that the slow exhale instantly triggers the parasympathetic branch of the nervous system. Under 55 words.'
    },
    step3: {
      title: '3. Complete the Cycle',
      prompt: 'Complete 3 rounds of this physiological sigh and describe your current level of calm.',
      explanation: 'Compare your mental state before and after these 3 breaths.',
      example: 'e.g., "I feel much more present and clear. The background hum of stress has vanished completely."',
      placeholder: 'Describe your current state...',
      aiInstruction: 'Validate this calm state. Explain that three sighs are all it takes to trigger rapid autonomic recovery. Under 55 words.'
    },
    summary: {
      title: '4. Recovery Sigh Reminder',
      prompt: 'Write a short statement committing to use the physiological sigh during future stress spikes.',
      explanation: 'Use it as your instant physiological release valve.',
      example: 'e.g., "Next time I feel a surge of panic, I will take two quick sniffs and a long exhale to calm my body."',
      placeholder: 'Type your commitment...'
    },
    celebrationTitle: 'Physiology Sighed!',
    celebrationExplanation: "Great job! The physiological sigh is your instant biological brake. You can use it anywhere to calm a racing mind."
  },

  'managing-anxiety-l5-ex2': {
    welcomeTitle: 'Anxiety Playbook Mapping',
    welcomeExplanation: "Welcome. Today we map out your personalized 3-step emergency playbook to manage future anxiety spikes.",
    purposeTitle: 'Why Map a Playbook?',
    purposeExplanation: "When panic strikes, your logical brain shuts down. A simple, pre-mapped 3-step protocol ensures you know exactly how to guide yourself back to calm.",
    step1: {
      title: '1. Choose Your Somatic Reset',
      prompt: 'Select your most effective physical tool (e.g., Box Breathing, Physiological Sigh, Body Scan).',
      explanation: 'What is the fastest way to signal safety to your body?',
      example: 'e.g., "Physiological Sigh (two quick sniffs, slow exhale)."',
      placeholder: 'Type your somatic reset...',
      aiInstruction: 'Validate this choice. Confirm that the physiological sigh is a stellar tool for rapid physical reset. Under 55 words.'
    },
    step2: {
      title: '2. Choose Your Cognitive Anchor',
      prompt: 'Select your most effective cognitive tool (e.g., Alarm system reframe, Reality testing statement).',
      explanation: 'What is the most powerful phrase to remind yourself that discomfort is not danger?',
      example: 'e.g., "This is just an over-eager alarm system, not a real danger. I am safe in this room."',
      placeholder: 'Type your cognitive anchor...',
      aiInstruction: 'Praise this anchor phrase. Emphasize that reframing the alert prevents the mind from escalating the panic. Under 55 words.'
    },
    step3: {
      title: '3. Choose Your Behavioral Action',
      prompt: 'Select your primary behavioral action (e.g., Safety behavior delay, focus on next task).',
      explanation: 'How will you step forward? Plan a simple, low-pressure action.',
      example: 'e.g., "Delay checking my phone for 5 minutes and focus entirely on the next task."',
      placeholder: 'Type your behavioral action...',
      aiInstruction: 'Validate this proceeding step. Explain how combining somatic, cognitive, and behavioral actions creates a bulletproof recovery. Under 55 words.'
    },
    summary: {
      title: '4. The Emergency Playbook',
      prompt: 'Write your complete 3-step emergency playbook in one cohesive paragraph.',
      explanation: 'This is your go-to guide for future anxiety management.',
      example: 'e.g., "1. Take 3 physiological sighs. 2. Repeat: \'This is just a misfired alarm, I am safe.\' 3. Delay safety behaviors and take the next small action."',
      placeholder: 'Type your complete playbook...'
    },
    celebrationTitle: 'Playbook Mapped!',
    celebrationExplanation: "Excellent work! Having a pre-mapped playbook takes away the fear of future anxiety spikes. You are prepared and in control."
  },

  'managing-anxiety-l5-ex3': {
    welcomeTitle: 'Resilience Anchor Journal',
    welcomeExplanation: "Welcome. Today we write a supportive reminder letter to yourself, to be read when anxiety feels overwhelming.",
    purposeTitle: 'Why Write an Anchor Letter?',
    purposeExplanation: "In high-stress moments, we forget our progress. A letter written in a state of calm acts as an external anchor, reminding you of your capability and safety.",
    step1: {
      title: '1. Acknowledge the Discomfort',
      prompt: 'Write an opening that validates the intensity of future anxious moments with warmth.',
      explanation: 'Speak to yourself kindly, acknowledging that feeling anxious is tough but okay.',
      example: 'e.g., "Hey, I know your heart is racing right now and you feel like running away. It is okay to feel this way. It is just adrenaline."',
      placeholder: 'Type your opening...',
      aiInstruction: 'Validate the warmth of this opening. Highlight how starting with self-compassion disarms panic. Under 55 words.'
    },
    step2: {
      title: '2. Remind Yourself of the Tools',
      prompt: 'Write down the core facts you have learned: anxiety is an alarm, sensations are safe, and you can cope.',
      explanation: 'List the objective truths that panic makes you forget.',
      example: 'e.g., "Remember: this is a misfired safety alarm, not actual danger. The chest tightness is temporary and safe. You can welcome it."',
      placeholder: 'Type the tool reminders...',
      aiInstruction: 'Affirm these facts. Explain that reminding yourself of somatic safety halts the panic spiral. Under 55 words.'
    },
    step3: {
      title: '3. Highlight a Personal Victory',
      prompt: 'Recall one moment during this program where you successfully tolerated discomfort.',
      explanation: 'Give yourself concrete evidence of your resilience.',
      example: 'e.g., "Remember when you delayed checking your phone for 5 minutes during the meeting? You survived that discomfort. You can survive this too."',
      placeholder: 'Type a personal victory...',
      aiInstruction: 'Validate this victory. Explain that referencing concrete evidence of past resilience is the best antidote to self-doubt. Under 55 words.'
    },
    summary: {
      title: '4. The Anchor Letter Summary',
      prompt: 'Combine these steps into your complete anchor letter to your future self.',
      explanation: 'Create a single, supportive message to read when stressed.',
      example: 'e.g., "Hey, I know your heart is racing and you feel like running. It is okay. This is just a misfired alarm, not danger. You survived the meeting delay, and you will survive this discomfort too. Take a breath, use your playbook, and trust yourself."',
      placeholder: 'Type your complete anchor letter...'
    },
    celebrationTitle: 'Letter Written!',
    celebrationExplanation: "Wonderful work! This letter is your personal anchor. It carries the wisdom of your calm self, ready to support you when you need it most."
  },

  'managing-anxiety-l5-ex4': {
    welcomeTitle: 'Daily Exposure Commitment',
    welcomeExplanation: "Welcome. Today we commit to daily micro-exposures to maintain your progress and prevent avoidance habits from returning.",
    purposeTitle: 'Why Commit to Daily Exposure?',
    purposeExplanation: "Resilience is built through consistent practice. Commit to daily micro-exposures to keep your distress tolerance high and ensure your comfort zone continues to expand.",
    step1: {
      title: '1. Select a Daily Micro-Exposure',
      prompt: 'Identify one simple exposure action you can perform daily (e.g., asking a question, making eye contact, sharing an idea).',
      explanation: 'Choose something small, controllable, and values-aligned.',
      example: 'e.g., "I will ask a question during our daily standup meeting."',
      placeholder: 'Type your daily exposure...',
      aiInstruction: 'Validate this daily action. Acknowledge that consistent daily standup sharing is a powerful way to reinforce confidence. Under 55 words.'
    },
    step2: {
      title: '2. Understand the Relapse Prevention',
      prompt: 'Explain how committing to this daily action prevents you from slipping back into avoidance habits.',
      explanation: 'What happens when you consistently face minor challenges?',
      example: 'e.g., "By consistently speaking up, I prevent my mind from building up standups into a terrifying hurdle again. It keeps the alarm quiet."',
      placeholder: 'Explain the prevention...',
      aiInstruction: 'Acknowledge this insight. Confirm that consistent exposure prevents anticipatory fear from accumulating. Under 55 words.'
    },
    step3: {
      title: '3. Set the Daily Cue',
      prompt: 'Choose a specific cue or trigger in your routine that will prompt you to take this step.',
      explanation: 'Link the exposure to an existing habit (e.g., "Right after the standup starts...").',
      example: 'e.g., "Right after my manager finishes their opening update, I will raise my hand to speak."',
      placeholder: 'Type your daily cue...',
      aiInstruction: 'Validate this cue selection. Confirm that linking actions to routine cues increases follow-through on commitment. Under 55 words.'
    },
    summary: {
      title: '4. Exposure Commitment Affirmation',
      prompt: 'Write your formal commitment statement to maintain daily micro-exposures.',
      explanation: 'Acknowledge that courage is a daily practice.',
      example: 'e.g., "I commit to facing minor challenges daily, using my cues to take action and keep my confidence strong."',
      placeholder: 'Type your commitment...'
    },
    celebrationTitle: 'Commitment Made!',
    celebrationExplanation: "Fantastic work! Daily micro-exposures keep your nervous system flexible and strong. You are choosing active growth over comfortable avoidance."
  },

  'managing-anxiety-l5-ex5': {
    welcomeTitle: 'Recovery Toolkit Checklist',
    welcomeExplanation: "Welcome to the final integration. Today we evaluate your confidence in using your anxiety management toolkit.",
    purposeTitle: 'Why Run a Checklist?',
    purposeExplanation: "Consolidating your progress helps you recognize your growth and reinforces your commitment to managing anxiety with confidence and self-trust.",
    step1: {
      title: '1. Rate Your Management Confidence',
      prompt: 'Rate your confidence (1-10) in your ability to manage future anxiety spikes using your toolkit. Explain why.',
      explanation: 'Think about the tools you have practiced: breathing, body scan, safety delay, exposure.',
      example: 'e.g., "An 8. I feel confident because I have a pre-mapped playbook and I know that physical discomfort is not danger."',
      placeholder: 'Rate and explain confidence...',
      aiInstruction: 'Validate this high confidence score. Emphasize that having a structured playbook is the key to feeling prepared. Under 55 words.'
    },
    step2: {
      title: '2. Identify Maintenance Tools',
      prompt: 'Which tool in your toolkit do you plan to practice most regularly to keep it sharp?',
      explanation: 'Choose one tool you want to make an automatic habit.',
      example: 'e.g., "I will practice the physiological sigh daily during work breaks to keep my nervous system calm."',
      placeholder: 'Type your maintenance tool...',
      aiInstruction: 'Praise this choice. Confirm that physiological sighs are an excellent, low-effort daily maintenance tool. Under 55 words.'
    },
    step3: {
      title: '3. Plan for Obstacles',
      prompt: 'Identify one obstacle you might face in using your toolkit (e.g. forgetfulness, high stress) and how you will handle it.',
      explanation: 'Be realistic. How will you access your tools when feeling overwhelmed?',
      example: 'e.g., "When stress is extremely high, I might forget my playbook. I will print it out and stick it on my monitor as a visual reminder."',
      placeholder: 'Describe obstacle and solution...',
      aiInstruction: 'Acknowledge this practical solution. Confirm that visual reminders are highly effective in high-stress moments. Under 55 words.'
    },
    summary: {
      title: '4. Final Program Affirmation',
      prompt: 'Write your final, integrated statement of capability and peace to conclude this program.',
      explanation: 'Celebrate your commitment to cognitive and somatic growth.',
      example: 'e.g., "I am equipped, I am capable, and I am the manager of my own peace. I can tolerate discomfort and guide myself back to calm."',
      placeholder: 'Type your final affirmation...'
    },
    celebrationTitle: 'Anxiety Program Completed!',
    celebrationExplanation: "Congratulations! You have completed the Managing Anxiety program. You are now equipped with a robust, active toolkit to manage somatic panic, challenge safety behaviors, and face fears with courage. Walk in peace and confidence!"
  },

  // ==========================================
  // PROGRAM: Healthy Habits
  // ==========================================
  'healthy-habits-l1-ex1': {
    welcomeTitle: 'Habit Awareness',
    welcomeExplanation: "Welcome to behavioral activation. Today we explore the neurological Cue -> Routine -> Reward habit loop to map your daily routines.",
    purposeTitle: 'Why Map Habit Loops?',
    purposeExplanation: "Habits are automatic brain programs. By exposing the cue and reward, we gain the power to redesign the routine itself.",
    step1: {
      title: '1. Select a Habit',
      prompt: 'Choose a routine habit you want to analyze (either positive or negative).',
      explanation: 'Select something you do automatically without thinking.',
      example: 'e.g., "Checking my phone immediately after waking up."',
      placeholder: 'Type the habit here...',
      aiInstruction: 'Validate the ubiquity of morning phone checking. Empathize with how the brain craves instant novelty in the morning. Under 55 words.'
    },
    step2: {
      title: '2. Identify the Cue',
      prompt: 'What is the exact trigger (cue) that sparks this habit? (Time, location, emotional state)',
      explanation: 'Look for the immediate trigger that launches the automatic action.',
      example: 'e.g., "The alarm sound, and the physical act of reaching to turn it off."',
      placeholder: 'Describe the cue...',
      aiInstruction: 'Highlight how physical triggers (like reaching for the alarm) serve as strong neurological cues. Under 55 words.'
    },
    step3: {
      title: '3. Identify the Reward',
      prompt: 'What is the immediate reward or payoff your brain gets from this habit?',
      explanation: 'Is it a feeling of comfort, distraction, stimulation, or relief?',
      example: 'e.g., "Instant stimulation and relief from morning grogginess (dopamine hit)."',
      placeholder: 'Describe the reward...',
      aiInstruction: 'Validate the reward. Explain that identifying the payoff helps us understand why habits feel hard to break. Under 55 words.'
    },
    summary: {
      title: '4. Redesigned Habit Formula',
      prompt: 'How can you keep the cue and reward, but change the routine to a healthier behavior?',
      explanation: 'Replace the routine with a behavior that satisfies the same reward need.',
      example: 'e.g., "When my alarm rings, I will turn it off, immediately drink a glass of water on my bedside table, and stretch for 1 minute before checking my phone."',
      placeholder: 'Type your redesigned habit loop...'
    },
    celebrationTitle: 'Habit Loop Mapped!',
    celebrationExplanation: "Great job! Exposing the cue and reward is the key to behavioral design. You are ready to consciously reshape your actions."
  },

  'healthy-habits-l2-ex1': {
    welcomeTitle: 'Tiny Habits',
    welcomeExplanation: "Welcome. Today we master micro-commitments, using the 2-minute rule to start new habits without resistance.",
    purposeTitle: 'Why Use the 2-Minute Rule?',
    purposeExplanation: "The hardest part of any habit is starting. By scaling a habit down to just 2 minutes, we bypass the brain's natural resistance to effort.",
    step1: {
      title: '1. The Target Habit',
      prompt: 'What is a habit you want to build but procrastinate on?',
      explanation: 'Choose something that feels heavy or takes significant effort to start.',
      example: 'e.g., "Doing a 30-minute stretching and yoga routine daily."',
      placeholder: 'Type the target habit...',
      aiInstruction: 'Validate the procrastination. Acknowledge that the brain naturally resists routines that require large energy investments. Under 55 words.'
    },
    step2: {
      title: '2. Scale it to 2 Minutes',
      prompt: 'What is the 2-minute version of this habit?',
      explanation: 'Scale it down so it takes under 120 seconds and requires almost zero effort.',
      example: 'e.g., "Roll out my yoga mat and do exactly one gentle downward dog stretch."',
      placeholder: 'Type the 2-minute version...',
      aiInstruction: 'Emphasize that the 2-minute version is not about the exercise itself, but about mastering the art of showing up. Under 55 words.'
    },
    step3: {
      title: '3. Establish the Gateway',
      prompt: 'Once you complete the 2 minutes, you have permission to stop. Acknowledge this boundary.',
      explanation: 'Remind your brain: "I only *have* to do 2 minutes. Anything else is extra."',
      example: 'e.g., "I only have to roll out the mat. If I stop after 2 minutes, it is still a complete success."',
      placeholder: 'Write your permission statement...',
      aiInstruction: 'Validate this boundary. Explain how giving yourself explicit permission reduces resistance and makes starting easier. Under 55 words.'
    },
    summary: {
      title: '4. Micro-Commitment Plan',
      prompt: 'Write your commitment: "I will do [2-minute habit] at [time/location] today."',
      explanation: 'Commit to showing up for just 2 minutes, focusing on consistency over intensity.',
      example: 'e.g., "I will roll out my yoga mat and do one stretch immediately after shutting down my laptop at 6 PM."',
      placeholder: 'Type your commitment plan...'
    },
    celebrationTitle: 'Micro-Commitment Set!',
    celebrationExplanation: "Excellent job! Consistency beats intensity every single time. By mastering the start, you build the foundation for long-term habits."
  },

  'healthy-habits-l3-ex1': {
    welcomeTitle: 'Habit Stacking',
    welcomeExplanation: "Welcome. Today we practice habit stacking, anchoring a new habit directly onto an established daily routine.",
    purposeTitle: 'Why Stack Habits?',
    purposeExplanation: "Your brain already has strong, automated neural pathways for daily routines (like brushing teeth). Anchoring new habits onto them piggybacks on this power.",
    step1: {
      title: '1. List Your Anchor Habits',
      prompt: 'List three routines you do every single day without fail.',
      explanation: 'Think of actions like waking up, making coffee, brushing teeth, shutting down your laptop, or getting into bed.',
      example: 'e.g., "1. Making morning coffee. 2. Sitting at my desk. 3. Brushing my teeth before bed."',
      placeholder: 'List your daily anchors...',
      aiInstruction: 'Validate these anchors. Empathize with how these automated pathways are the perfect neural scaffolding. Under 55 words.'
    },
    step2: {
      title: '2. The New Habit',
      prompt: 'What is a small, positive habit you want to introduce?',
      explanation: 'Select something small and highly actionable.',
      example: 'e.g., "Writing down my top priority for the day in my planner."',
      placeholder: 'Type the new habit...',
      aiInstruction: 'Praise the new habit. Note that planning priorities is an excellent candidate for habit stacking. Under 55 words.'
    },
    step3: {
      title: '3. Create the Stack',
      prompt: 'Write the stack: "After I [Anchor Habit], I will [New Habit]."',
      explanation: 'Link them directly. Choose the anchor that makes the most logical sense for the new habit.',
      example: 'e.g., "After I sit down at my desk with my morning coffee, I will write down my top priority in my planner."',
      placeholder: 'Write your habit stack here...',
      aiInstruction: 'Validate this stack. Explain how linking habits to strong anchors reduces mental effort and increases consistency. Under 55 words.'
    },
    summary: {
      title: '4. Stack Integration Summary',
      prompt: 'Write down how this stack leverages your current routine to remove resistance.',
      explanation: 'Reflect on how this makes the new habit easier to remember.',
      example: 'e.g., "The coffee acts as a physical reminder. I cannot start work until the priority is written, removing the need to remember."',
      placeholder: 'Describe the integration benefit...'
    },
    celebrationTitle: 'Habit Stack Locked!',
    celebrationExplanation: "Superb! Linking behaviors creates a natural flow in your day. Your anchor habits will now pull your new habits along automatically."
  },

  'healthy-habits-l4-ex1': {
    welcomeTitle: 'Consistency',
    welcomeExplanation: "Welcome. Today we design your recovery plan for when you inevitably miss a day, ensuring long-term success.",
    purposeTitle: 'Why Have a Recovery Plan?',
    purposeExplanation: "Habits fail not because we miss a day, but because of the shame spiral that follows. Having a plan to 'never miss twice' protects you.",
    step1: {
      title: '1. Identify Your Common Setback',
      prompt: 'What usually causes you to abandon a habit after a few days?',
      explanation: 'Is it fatigue, changes in schedule, busy weeks, or all-or-nothing thinking?',
      example: 'e.g., "A busy workday makes me skip my stretching, and then I feel guilty and stop doing it for the next week."',
      placeholder: 'Describe your typical setback...',
      aiInstruction: 'Validate the guilt. Explain that missing a day is a normal event, but all-or-nothing thinking is the real threat to consistency. Under 55 words.'
    },
    step2: {
      title: '2. The "Never Miss Twice" Rule',
      prompt: 'Commit to the rule: missing once is an accident, missing twice is the start of a new bad habit. Write "I commit to never missing twice."',
      explanation: 'Acknowledge that one miss has zero impact on your long-term success as long as you recover immediately.',
      example: 'e.g., "I commit to never missing twice. If I skip stretching today, I will prioritize doing the 2-minute version tomorrow no matter what."',
      placeholder: 'Write your commitment...',
      aiInstruction: 'Affirm the rule. Validate that a single miss does not reset your progress; it is just a minor bump. Under 55 words.'
    },
    step3: {
      title: '3. Design Your Emergency Routine',
      prompt: 'What is the absolute minimum, low-energy version of your habit you can do on your busiest days?',
      explanation: 'Design an emergency option so you can maintain the habit streak even when exhausted.',
      example: 'e.g., "On busy days, my emergency routine is just 1 minute of neck rolls while sitting at my desk."',
      placeholder: 'Describe your emergency routine...',
      aiInstruction: 'Validate this emergency routine. Emphasize that having a floor-low option ensures consistency during chaotic periods. Under 55 words.'
    },
    summary: {
      title: '4. Consistency Commitment Plan',
      prompt: 'Combine the rule and your emergency routine into a final consistency statement.',
      explanation: 'Write a statement that prioritizes showing up over perfection.',
      example: 'e.g., "I will maintain my habits by practicing my emergency routine on busy days, and if I miss a day, I will recover immediately the next day without guilt."',
      placeholder: 'Type your final consistency plan...'
    },
    celebrationTitle: 'Habits Consistency Set!',
    celebrationExplanation: "Great job! Consistency beats intensity every single time. By establishing the recovery plan, you ensure your progress continues long-term."
  },

  'healthy-habits-l5-ex1': {
    welcomeTitle: 'Lifestyle Integration',
    welcomeExplanation: "Welcome to the final integration. Today we align your daily habits with your core identity and values to make them a permanent part of your life.",
    purposeTitle: 'Why Integrate Habits into Your Lifestyle?',
    purposeExplanation: "True behavior change is identity change. When a habit becomes a reflection of who you are (e.g. 'I am a reader' rather than 'I want to read'), it ceases to require effort and becomes natural.",
    step1: {
      title: '1. Define Your Desired Identity',
      prompt: 'What kind of person do you want to become through these habits?',
      explanation: 'Focus on your identity (who you are) rather than your outcomes (what you want to achieve).',
      example: 'e.g., "I want to be an active, healthy person who respects their body, and a focused writer who values creativity."',
      placeholder: 'Describe your desired identity...',
      aiInstruction: 'Validate this identity statement warmly. Confirm that focusing on who you want to be is the most powerful starting point for lifelong habits. Under 55 words.'
    },
    step2: {
      title: '2. Identify Identity Proof',
      prompt: 'What daily or weekly habits act as physical proof of this identity?',
      explanation: 'Every action you take is a vote for the type of person you want to become.',
      example: 'e.g., "Drinking water daily, doing my 2-minute stretches, and writing for 10 minutes are votes for being healthy and creative."',
      placeholder: 'List your habits as identity proof...',
      aiInstruction: 'Acknowledge these habits as votes for the new identity. Emphasize that small daily actions accumulate into strong self-trust. Under 55 words.'
    },
    step3: {
      title: '3. Plan for Long-Term Alignment',
      prompt: 'How will you stay aligned with this identity during stressful or busy months?',
      explanation: 'How will you protect these votes when schedule changes or setbacks occur?',
      example: 'e.g., "I will rely on my emergency routines and remember that even a 1-minute stretch maintains my identity as an active person."',
      placeholder: 'Describe your long-term alignment strategy...',
      aiInstruction: 'Validate this alignment plan. Highlight that maintaining the habit streak, even minutely, preserves the belief in your identity. Under 55 words.'
    },
    summary: {
      title: '4. Identity Integration Summary',
      prompt: 'Write a final, integrated statement linking your habits directly to your identity.',
      explanation: 'Create a statement of who you are and the actions that prove it.',
      example: 'e.g., "I am a healthy and creative person. I choose to drink water, stretch, and write daily to honor and reinforce this identity."',
      placeholder: 'Type your identity-linked statement...'
    },
    celebrationTitle: 'Habits Integrated!',
    celebrationExplanation: "Congratulations! You have completed the Healthy Habits program. By linking your routines to your identity, you have integrated them into your lifestyle. Walk in alignment!"
  },

  // ==========================================
  // PROGRAM: Emotional Regulation
  // ==========================================
  'emotional-regulation-l1-ex1': {
    welcomeTitle: 'Primary Emotions Tracker',
    welcomeExplanation: "Welcome to emotional regulation. Today we learn to welcome and observe emotional waves as temporary signals, not directives.",
    purposeTitle: 'Why Observe Emotions?',
    purposeExplanation: "Emotions are rapid somatic responses. When we try to fight them, they become trapped. Observing them objectively allows them to pass naturally.",
    step1: {
      title: '1. Identify the Emotion',
      prompt: 'What is the primary emotion you are feeling right now, or felt recently?',
      explanation: 'Identify the core feeling: sadness, anger, fear, joy, shame, or surprise.',
      example: 'e.g., "I feel sadness and frustration after a difficult conversation."',
      placeholder: 'Type the primary emotion...',
      aiInstruction: 'Validate the emotion warmly. Explain that identifying emotions brings conscious clarity to our current state. Under 55 words.'
    },
    step2: {
      title: '2. Track the Somatic Wave',
      prompt: 'Where in your body do you feel this emotion manifest physically? How does it feel?',
      explanation: 'Describe the sensations (heat in face, tight chest, clenching fist) objectively.',
      example: 'e.g., "A heavy weight in my chest and tension in my shoulders."',
      placeholder: 'Describe the physical sensations...',
      aiInstruction: 'Acknowledge the physical location of the feeling. Point out that physical sensations are standard bodily expressions of emotional energy. Under 55 words.'
    },
    step3: {
      title: '3. Allow the Wave to Pass',
      prompt: 'Acknowledge that this emotion is temporary. Write "This is an emotional wave, and it will peak and pass."',
      explanation: 'Observe it like a wave in the ocean. It has a beginning, a middle, and an end.',
      example: 'e.g., "This sadness is an emotional wave. It is temporary, and it will peak and pass on its own."',
      placeholder: 'Write your wave acknowledgment...',
      aiInstruction: 'Validate this acknowledgment. Explain how accepting emotions as temporary waves reduces their control over behavior. Under 55 words.'
    },
    summary: {
      title: '4. Non-Judgmental Acceptance',
      prompt: 'Write a compassionate statement accepting the emotion without judgment.',
      explanation: 'Reframe the feeling: it is okay to feel this way, and the feeling does not control your behavior.',
      example: 'e.g., "It is completely valid to feel sad about the conversation, and I can allow this feeling to be here without acting on it."',
      placeholder: 'Type your acceptance statement...'
    },
    celebrationTitle: 'Emotional Wave Observed!',
    celebrationExplanation: "Wonderful work! By observing the emotional wave instead of fighting it or reacting to it, you've taken the first step toward true regulation."
  },

  'emotional-regulation-l2-ex1': {
    welcomeTitle: 'Somatic Welcoming',
    welcomeExplanation: "Welcome. Today we practice welcoming our physical sensations without fighting them to prevent emotional distress from escalating.",
    purposeTitle: 'Why Welcome Somatic Feelings?',
    purposeExplanation: "When we resist physical feelings, our nervous system gets stuck in a loop of alarm. Welcoming the sensations tells the brain that they are safe to process.",
    step1: {
      title: '1. Focus on the Sensation',
      prompt: 'Locate the physical sensation of your current or recent emotion. Describe where it is and how it feels.',
      explanation: 'Look for tightness, heat, fluttering, or emptiness in your chest, stomach, or throat.',
      example: 'e.g., "A tight, heavy clenching in my stomach and shallow breathing."',
      placeholder: 'Describe the sensation...',
      aiInstruction: 'Validate this physical response. Empathize with how stomach tightness is a very common center for autonomic responses. Under 55 words.'
    },
    step2: {
      title: '2. Release the Bracing',
      prompt: 'Soften your shoulders, jaw, and belly. Write: "I am releasing the physical fight against this feeling."',
      explanation: 'Release any physical clenching. Allow your muscles to soften and breathe naturally.',
      example: 'e.g., "I am releasing the physical fight against this feeling. I drop my shoulders and let my belly relax."',
      placeholder: 'Type your release statement...',
      aiInstruction: 'Support this physical release. Confirm that dropping physical resistance directly signals safety to the amygdala. Under 55 words.'
    },
    step3: {
      title: '3. Breathe Space Around It',
      prompt: 'Imagine breathing space into and around the sensation. Describe how the sensation responds.',
      explanation: 'Visualize creating room for the sensation to exist without pressure.',
      example: 'e.g., "As I breathe space into it, the tight ball in my stomach feels less rigid and starts to dissolve slightly."',
      placeholder: 'Describe the response...',
      aiInstruction: 'Affirm this change. Explain that breathing space allows somatic tension to process and settle naturally. Under 55 words.'
    },
    summary: {
      title: '4. Somatic Safety Anchor',
      prompt: 'Write a statement confirming your ability to safely welcome physical sensations.',
      explanation: 'Combine the somatic feeling and your commitment to physical softening.',
      example: 'e.g., "My stomach clenching is uncomfortable but completely safe. I can breathe around it and let it settle."',
      placeholder: 'Type your safety anchor...'
    },
    celebrationTitle: 'Sensations Welcomed!',
    celebrationExplanation: "Superb work! Welcoming physical sensations without panic is the foundation of emotional resilience. You are keeping your nervous system open and flexible."
  },

  'emotional-regulation-l3-ex1': {
    welcomeTitle: 'Emotion Wheel Audit',
    welcomeExplanation: "Welcome. Today we expand our emotional vocabulary to label complex feelings with high precision, reducing their emotional grip.",
    purposeTitle: 'Why Label Precisely?',
    purposeExplanation: "Vague feelings like 'bad' or 'stressed' keep the brain's alarm system high. Naming the feeling accurately dims the alarm instantly.",
    step1: {
      title: '1. The General Feeling',
      prompt: 'Describe a general negative feeling or mood you had today (e.g. stressed, bad, off).',
      explanation: 'What is the vague cloud of emotion you want to unpack?',
      example: 'e.g., "I just felt general irritation and stress all afternoon."',
      placeholder: 'Type the general feeling...',
      aiInstruction: 'Validate the general stress. Assure the user that unpacking this vague cloud is a powerful act of clarity. Under 55 words.'
    },
    step2: {
      title: '2. Unpack the Nuance',
      prompt: 'What specific, secondary emotions are hidden beneath the general feeling?',
      explanation: 'Are you feeling unappreciated, overwhelmed, lonely, disappointed, or anxious? Look deeper.',
      example: 'e.g., "I felt unappreciated because my work wasn\'t acknowledged, and overwhelmed by the backlog."',
      placeholder: 'List the specific secondary emotions...',
      aiInstruction: 'Affirm the specificity. Point out how naming "unappreciated" and "overwhelmed" immediately defines what needs attention. Under 55 words.'
    },
    step3: {
      title: '3. Validate the Complexity',
      prompt: 'Write down a statement acknowledging these layered feelings. "I am feeling both [emotion A] and [emotion B]."',
      explanation: 'Accept that you can hold multiple complex feelings at the same time.',
      example: 'e.g., "I am feeling both unappreciated for my efforts AND overwhelmed by my current load."',
      placeholder: 'Write your validation statement...',
      aiInstruction: 'Validate this complexity. Explain that acknowledging multiple emotions prevents the brain from getting stuck in overwhelm. Under 55 words.'
    },
    summary: {
      title: '4. Precise Self-Compassion Reframe',
      prompt: 'Write a kind, precise statement to support yourself through these layered feelings.',
      explanation: 'Acknowledge the specific feelings and offer support.',
      example: 'e.g., "It is natural to feel unappreciated and overwhelmed right now. I will treat myself with kindness and focus on one task at a time."',
      placeholder: 'Type your supportive statement...'
    },
    celebrationTitle: 'Emotions Naming Completed!',
    celebrationExplanation: "Excellent work! High emotional granularity is a superpower. By naming your emotions precisely, you've taken back control."
  },

  'emotional-regulation-l4-ex1': {
    welcomeTitle: 'Somatic Cooling Resets',
    welcomeExplanation: "Welcome. Today we master the STOP technique and somatic cooling tools to manage intense emotional arousal.",
    purposeTitle: 'Why Reset and Pause?',
    purposeExplanation: "When emotional intensity is high, logic goes offline. Somatic resets cool your physiology, and the STOP pause creates the space needed to choose a helpful response.",
    step1: {
      title: '1. Identify the Impulsive Trigger',
      prompt: 'Describe a situation where your emotional intensity spikes and you react impulsively.',
      explanation: 'Think of snapping, sending defensive messages, or escaping from stress.',
      example: 'e.g., "When a client criticizes my code, my irritation spikes to an 8/10, and I write a defensive reply immediately."',
      placeholder: 'Describe the trigger and reaction...',
      aiInstruction: 'Validate this trigger. Explain that criticism naturally stimulates defensive alerts in our primitive brain. Under 55 words.'
    },
    step2: {
      title: '2. Choose Your Somatic Reset',
      prompt: 'Select a somatic reset tool to use (e.g. box breathing, splashing cold water, progressive muscle relaxation).',
      explanation: 'What is the fastest way to signal safety and cool down your physiology?',
      example: 'e.g., "I will do 4 rounds of box breathing (inhale 4s, hold 4s, exhale 4s, hold 4s)."',
      placeholder: 'Describe your somatic reset...',
      aiInstruction: 'Praise this reset choice. Highlight that box breathing directly stabilizes the autonomic nervous system. Under 55 words.'
    },
    step3: {
      title: '3. Apply the STOP Pause',
      prompt: 'Map the STOP steps to your trigger: Stop, Take a breath, Observe, Proceed.',
      explanation: 'Explain how you will execute the pause right before writing your response.',
      example: 'e.g., "S: Stop typing. T: Take a slow breath. O: Observe my racing heart and irritation. P: Proceed by asking for details calmly."',
      placeholder: 'Describe your STOP application...',
      aiInstruction: 'Validate this trigger plan. Confirm that planning the pause beforehand bridges the gap to conscious control. Under 55 words.'
    },
    summary: {
      title: '4. The Emergency Pause Reminder',
      prompt: 'Write a simple reminder command to help you execute this pause.',
      explanation: 'Keep it short, direct, and focused on physical action.',
      example: 'e.g., "When criticized, hands off the keyboard. Stop. Breathe. Reset my body first."',
      placeholder: 'Type your reminder...'
    },
    celebrationTitle: 'Reset Playbook Created!',
    celebrationExplanation: "Fantastic work! Understanding that you cannot reason with high emotional arousal is a massive breakthrough. First cool the body, then guide the mind."
  },

  'emotional-regulation-l5-ex1': {
    welcomeTitle: 'Emotional Dialectic Builder',
    welcomeExplanation: "Welcome to the final integration. Today we build your playbook for emotional resilience, balancing acceptance and values-aligned action.",
    purposeTitle: 'Why Foster Resilience?',
    purposeExplanation: "Resilience is not about being emotionless. It is the ability to accept your feelings completely while still choosing helpful actions aligned with your values.",
    step1: {
      title: '1. Acknowledge a Difficult Emotion',
      prompt: 'What is a difficult emotion you are currently carrying or commonly face?',
      explanation: 'State it clearly and with full acceptance.',
      example: 'e.g., "I feel deep self-doubt about my capability in my career."',
      placeholder: 'Type the difficult emotion...',
      aiInstruction: 'Validate the self-doubt with deep empathy. Confirm that feeling doubt is a normal part of undertaking meaningful work. Under 55 words.'
    },
    step2: {
      title: '2. Write an Acceptance Statement',
      prompt: 'Write: "I feel [emotion], and that is a valid feeling in this situation."',
      explanation: 'Give yourself complete permission to feel, without trying to fix or change it.',
      example: 'e.g., "I feel deep self-doubt, and that is a valid feeling as I step into a new leadership role."',
      placeholder: 'Write your acceptance statement...',
      aiInstruction: 'Reinforce the power of acceptance. Explain that accepting the feeling stops the second arrow of judging yourself for feeling bad. Under 55 words.'
    },
    step3: {
      title: '3. Write an Action Commitment',
      prompt: 'Write: "Even though I feel [emotion], I will still choose to [helpful action]."',
      explanation: 'Commit to a value-aligned action that is independent of your current mood.',
      example: 'e.g., "Even though I feel self-doubt, I will still prepare for my meeting and share my ideas today."',
      placeholder: 'Write your action commitment...',
      aiInstruction: 'Validate this action commitment. Explain how choosing values over feelings builds true emotional resilience. Under 55 words.'
    },
    summary: {
      title: '4. The Balanced Dialectic Statement',
      prompt: 'Merge them using "AND": "I feel [emotion] AND I will still [action]."',
      explanation: 'This is the core of emotional maturity. You can feel a wave and take action simultaneously.',
      example: 'e.g., "I feel self-doubt about my career, AND I can still prepare for my meeting and share my ideas today."',
      placeholder: 'Type your balanced dialectic statement...'
    },
    celebrationTitle: 'Program Completed!',
    celebrationExplanation: "Congratulations! You have completed the Emotional Regulation program. You are now the steady anchor in your own storm. Walk in balance!"
  },

  // ==========================================
  // PROGRAM: Building Confidence
  // ==========================================
  'building-confidence-l1-ex1': {
    welcomeTitle: 'Core Belief Audit',
    welcomeExplanation: "Welcome! Let's take a deep look at the assumptions you hold about your self-worth. By auditing these core beliefs, we can begin to dismantle the unhelpful narratives holding you back.",
    purposeTitle: 'Why Audit Core Beliefs?',
    purposeExplanation: "Core beliefs are deep-seated rules we write about ourselves, often in childhood or during stressful times. They act as filters, letting in negative information while blocking out positive facts. Auditing them helps us see them for what they are: learned habits, not absolute truths.",
    step1: {
      title: '1. Identify the Belief',
      prompt: 'Write down a recurring negative belief you hold about yourself.',
      explanation: "What is an absolute statement your inner critic tells you when you feel insecure? It usually takes the form 'I am...' or 'I can never...'",
      example: "e.g., 'I am not smart enough', 'I am bound to fail when things get hard', 'I am unlovable.'",
      placeholder: 'Type your negative core belief here...',
      aiInstruction: 'Validate the user\'s negative core belief. Validate their feeling warmly with empathy. Point out any thinking pattern (e.g. personalization, overgeneralization) gently. Ask exactly one small, actionable reframing question. Under 55 words.'
    },
    step2: {
      title: '2. Trace the History',
      prompt: 'Recall when you first started believing this statement.',
      explanation: "Beliefs are stories we've learned over time. When did this voice first become loud? Can you identify a specific period, event, or childhood memory where this belief took root?",
      example: "e.g., 'In school, after failing a major math test and feeling embarrassed', 'During my first job where my manager was highly critical.'",
      placeholder: 'Recall when or where this belief started...',
      aiInstruction: 'Review the origin/history of the user\'s negative core belief. Validate their childhood or past experience with warm empathy. Offer exactly one small grounding insight about how beliefs are learned rules rather than facts. Under 55 words.'
    },
    step3: {
      title: '3. Gather Counter-Evidence',
      prompt: 'List three historical examples that prove this belief is incorrect.',
      explanation: "Your critic has selective memory. Let's find real facts, achievements, or moments in your life that prove your unhelpful belief is not 100% true.",
      example: "e.g., '1. I successfully finished my degree. 2. A close friend told me last week they appreciate my advice. 3. I taught myself how to code from scratch.'",
      placeholder: 'List three pieces of factual evidence that contradict the belief...',
      aiInstruction: 'Review the user\'s contradicting evidence. Highlight their resilience and facts. Provide a warm validation and a brief encouragement. Under 55 words.'
    },
    summary: {
      title: '4. Reframe Your Belief',
      prompt: 'Write a more compassionate, updated version of this belief.',
      explanation: "Based on the evidence you just listed, write a balanced, realistic, and kind statement that acknowledges both your challenges and your capacity to grow.",
      example: "e.g., 'I am capable of learning and growing, and my self-worth is not defined by temporary setbacks or mistakes.'",
      placeholder: 'Type your reframed, compassionate belief...'
    },
    celebrationTitle: 'Belief Audited!',
    celebrationExplanation: "Fantastic job! You've audited a core belief and stood up to your inner critic. This is a significant step toward building authentic self-confidence."
  },

  'building-confidence-l1-ex2': {
    welcomeTitle: 'Evidence Collection',
    welcomeExplanation: "Welcome. Today we gather objective, factual evidence to challenge the validity of negative core beliefs.",
    purposeTitle: 'Why Collect Evidence?',
    purposeExplanation: "Our inner critic relies on selective memory. By collecting counter-evidence, we weaken the belief's hold with logic and facts.",
    step1: {
      title: '1. Specify the Belief',
      prompt: 'Write down a negative core belief you want to challenge (e.g. "I always fail").',
      explanation: "Choose a belief that frequently makes you feel insecure or limits your actions.",
      example: "e.g., 'I always fail when projects get difficult.'",
      placeholder: 'Type the core belief...',
      aiInstruction: 'Validate the user\'s feeling with empathy. Emphasize that beliefs are learned filters, not facts. Under 55 words.'
    },
    step2: {
      title: '2. List Three Counter-Examples',
      prompt: 'List three concrete, factual times you succeeded or handled a difficult situation well.',
      explanation: "Focus on objective actions and events, not judgments.",
      example: "e.g., '1. I completed the database migration last month. 2. I learned how to drive a manual car. 3. I resolved a customer dispute yesterday.'",
      placeholder: 'List three successes...',
      aiInstruction: 'Praise the user\'s successes. Validate that these facts prove the old belief is not 100% true. Under 55 words.'
    },
    step3: {
      title: '3. Identify Minimization',
      prompt: 'How does your inner critic dismiss or explain away these successes?',
      explanation: "Does it say 'I was just lucky' or 'It wasn't that hard'?",
      example: "e.g., 'My critic says \"anyone could have done it\" or \"it was just luck.\"'",
      placeholder: 'How does the critic minimize this...',
      aiInstruction: 'Review the critic\'s minimization. Offer exactly one small grounding insight about how the critic uses double standards. Under 55 words.'
    },
    summary: {
      title: '4. The Balanced View',
      prompt: 'Write a balanced summary that integrates both the belief and the factual evidence.',
      explanation: "Create a realistic statement that acknowledges your capabilities.",
      example: "e.g., 'Although I sometimes struggle when things get difficult, the facts show that I have successfully navigated many complex challenges before.'",
      placeholder: 'Write your balanced summary...'
    },
    celebrationTitle: 'Evidence Collected!',
    celebrationExplanation: "Fantastic job! By documenting real facts, you've taken the first step in dismantling the critic's stories."
  },

  'building-confidence-l1-ex3': {
    welcomeTitle: 'Strength Inventory',
    welcomeExplanation: "Welcome! Today we catalog your personal competencies and inner resources to build a solid foundation of self-worth.",
    purposeTitle: 'Why Catalog Strengths?',
    purposeExplanation: "Self-worth comes from knowing your inner resources. Having a written inventory reminds you of what you bring to the table.",
    step1: {
      title: '1. List Five Strengths',
      prompt: 'List five personal strengths or positive qualities you possess.',
      explanation: "Think of qualities like honesty, resourcefulness, kindness, persistence, or curiosity.",
      example: "e.g., '1. Curiosity. 2. Resilience. 3. Empathy. 4. Organization. 5. Sense of humor.'",
      placeholder: 'List your five strengths...',
      aiInstruction: 'Acknowledge and praise these strengths. Affirm the value of naming our capabilities. Under 55 words.'
    },
    step2: {
      title: '2. Describe a Strength in Action',
      prompt: 'Choose one strength and describe a specific situation where you used it successfully.',
      explanation: "Show when and how it made a difference.",
      example: "e.g., 'I used my strength of Empathy last week to help my coworker who was feeling overwhelmed by listening and helping them organize their tasks.'",
      placeholder: 'Describe a strength in action...',
      aiInstruction: 'Review this action. Highlight how using this strength created a positive outcome and validated their capability. Under 55 words.'
    },
    step3: {
      title: '3. Spot an Underused Strength',
      prompt: 'Identify one strength from your list that you\'ve been underusing, and why.',
      explanation: "Why do you think it has been on the back burner?",
      example: "e.g., 'I underuse Curiosity because I get too caught up in routine and fear making mistakes.'",
      placeholder: 'Which strength is underused and why...',
      aiInstruction: 'Validate the insight. Explain how consciously activating underused strengths opens up new pathways for growth. Under 55 words.'
    },
    summary: {
      title: '4. Strength Commitment',
      prompt: 'Write a commitment to deliberately use one of your strengths in the next 24 hours.',
      explanation: "State exactly what you will do and when.",
      example: "e.g., 'I commit to using my Curiosity tomorrow by asking questions and exploring a new way to optimize my database code.'",
      placeholder: 'Type your commitment statement...'
    },
    celebrationTitle: 'Inventory Completed!',
    celebrationExplanation: "Wonderful! You now have a factual inventory of your inner strengths. Go out and use them!"
  },

  'building-confidence-l2-ex1': {
    welcomeTitle: 'Quieting the Critic',
    welcomeExplanation: "Welcome. Today we build self-compassion tools to counter harsh self-criticism and quiet the inner critic.",
    purposeTitle: 'Why Quiet the Critic?',
    purposeExplanation: "The inner critic is often a protective mechanism that uses harsh, unrealistic standards. Challenging it helps us build supportive self-evaluation.",
    step1: {
      title: '1. Catch the Self-Criticism',
      prompt: 'Write down a harsh self-criticism or judgment you made today.',
      explanation: 'What did the critic say when you made a mistake or felt insecure?',
      example: 'e.g., "I completely messed up that phone call. I am terrible at speaking with clients."',
      placeholder: 'Type the self-criticism...',
      aiInstruction: 'Validate the frustration of a difficult call. Acknowledge that the critic is taking a single event and overgeneralizing it. Under 55 words.'
    },
    step2: {
      title: '2. The Friend Test',
      prompt: 'If a close friend came to you with this exact same concern, what would you say to support them?',
      explanation: 'We are often much kinder to others than to ourselves. Write down what a compassionate, encouraging response would look like.',
      example: 'e.g., "Hey, it was just one phone call. Everyone has off days. You handled the client\'s follow-up question well. Don\'t be hard on yourself."',
      placeholder: 'Type what you would say to a friend...',
      aiInstruction: 'Review the supportive response. Emphasize how natural kindness is when directed outward, and validate its use. Under 55 words.'
    },
    step3: {
      title: '3. Direct it Inward',
      prompt: 'Rewrite the support statement, directing it to yourself. Use your own name.',
      explanation: 'Speak to yourself with the same warmth and tone you offered your friend.',
      example: 'e.g., "Hey Alex, it was just one call. Everyone has off days. You handled the follow-up question well. Don\'t be hard on yourself."',
      placeholder: 'Type your self-directed support...',
      aiInstruction: 'Validate this self-kindness. Explain how directing compassion inward builds the neural pathway for self-support. Under 55 words.'
    },
    summary: {
      title: '4. Compassionate Coping Phrase',
      prompt: 'Design a short, supportive phrase you can say silently when you catch your critic speaking.',
      explanation: 'Keep it simple, kind, and easy to recall.',
      example: 'e.g., "I did the best I could, and I am learning from my mistakes. I deserve my own support."',
      placeholder: 'Type your coping phrase...'
    },
    celebrationTitle: 'Critic Quieted!',
    celebrationExplanation: "Fantastic work! You have answered the critic with warm self-compassion. This is a big step in building self-confidence."
  },

  'building-confidence-l2-ex2': {
    welcomeTitle: 'Reframe Thoughts',
    welcomeExplanation: "Welcome. Today we practice transforming harsh, critical thoughts into balanced, realistic statements.",
    purposeTitle: 'Why Reframe Thoughts?',
    purposeExplanation: "The inner critic speaks in exaggerations and distortions. Reframing teaches your mind to adopt a neutral, realistic perspective.",
    step1: {
      title: '1. Capture the Critical Thought',
      prompt: 'Write down one critical or self-judging thought your voice repeated today.',
      explanation: "Write it down exactly as you heard it in your head.",
      example: "e.g., 'I failed that presentation. I am completely incompetent at public speaking.'",
      placeholder: 'Type the critical thought...',
      aiInstruction: 'Validate the frustration of a hard presentation. Explain how the critic uses catastrophizing to exaggerate setbacks. Under 55 words.'
    },
    step2: {
      title: '2. Identify the Distortion',
      prompt: 'Name the cognitive distortion present in this thought (e.g. all-or-nothing thinking, labeling, mind-reading).',
      explanation: "Look for words like 'always', 'never', or absolute labels.",
      example: "e.g., 'All-or-nothing thinking (one presentation doesn\'t define all of them) and Labeling (\"incompetent\").'",
      placeholder: 'Identify the distortion...',
      aiInstruction: 'Validate the identification. Explain how labeling distortions helps peel back their false authority. Under 55 words.'
    },
    step3: {
      title: '3. Write a Balanced Alternative',
      prompt: 'Rewrite the thought to be neutral, factual, and supportive.',
      explanation: "Stick strictly to what is objectively true.",
      example: "e.g., 'I felt nervous and made some mistakes during the presentation, but I also answered the questions well and can improve next time.'",
      placeholder: 'Type the balanced alternative...',
      aiInstruction: 'Praise the balanced alternative. Affirm that reframing focus to growth and objectivity builds self-belief. Under 55 words.'
    },
    summary: {
      title: '4. Reframe Reflection',
      prompt: 'Describe how your emotional intensity shifted (from 1-10) after writing the reframed thought.',
      explanation: "Notice any change in your body tension or mood.",
      example: "e.g., 'My stress went from an 8 to a 4. I feel much calmer and ready to learn from it.'",
      placeholder: 'Describe the shift...'
    },
    celebrationTitle: 'Thought Reframed!',
    celebrationExplanation: "Excellent work. Shifting to balanced thoughts takes practice, but every reframe weakens the critical default."
  },

  'building-confidence-l2-ex3': {
    welcomeTitle: 'Compassion Response',
    welcomeExplanation: "Welcome. Today we develop a habitual compassionate response to quiet the critic when it appears.",
    purposeTitle: 'Why a Compassion Response?',
    purposeExplanation: "We cannot stop the critic from starting, but we can change how we respond to it. A structured reply de-escalates self-judgment.",
    step1: {
      title: '1. Recall the Self-Judgment',
      prompt: 'Describe a recent moment where you judged yourself harshly.',
      explanation: "What triggers it, and what did you say to yourself?",
      example: "e.g., 'I felt guilty for taking a break during a busy afternoon, telling myself I am lazy.'",
      placeholder: 'Describe the judgment...',
      aiInstruction: 'Validate the guilt. Empathize with how hard it is to rest when the critic equates rest with laziness. Under 55 words.'
    },
    step2: {
      title: '2. Identify the Underlying Need or Fear',
      prompt: 'What need or fear was the critic trying to express (e.g. fear of failing, need for success, need for rest)?',
      explanation: "The critic's harshness is often a misplaced attempt to protect us from failure.",
      example: "e.g., 'The underlying fear was failing to meet expectations, and the need was to feel competent.'",
      placeholder: 'Identify the need or fear...',
      aiInstruction: 'Validate this insight. Emphasize that understanding the underlying need shifts us from defense to self-understanding. Under 55 words.'
    },
    step3: {
      title: '3. Design a Compassionate Phrase',
      prompt: 'Write a compassionate, supportive phrase you wish you had said to yourself in that moment.',
      explanation: "Speak to yourself with warmth, acknowledging your humanity.",
      example: "e.g., 'I have worked hard today and taking a brief break is essential to recover my energy. Rest is a necessity, not laziness.'",
      placeholder: 'Write your compassionate phrase...',
      aiInstruction: 'Validate this compassionate phrase. Affirm that speaking to ourselves with kindness is a powerful way to soothe stress. Under 55 words.'
    },
    summary: {
      title: '4. Three-Step Compassion Ritual',
      prompt: 'Design a 3-step ritual to use next time the critic appears (e.g. 1. Deep breath, 2. Place hand on chest, 3. Repeat your phrase).',
      explanation: "Create a simple physical and mental routine.",
      example: "e.g., '1. Take one slow breath. 2. Place a hand on my chest. 3. Repeat: \"I am doing my best and deserve support.\"' ",
      placeholder: 'Type your 3-step ritual...'
    },
    celebrationTitle: 'Ritual Designed!',
    celebrationExplanation: "Outstanding! Having a compassionate ritual prepares you to meet the critic with warmth instead of self-defense."
  },

  'building-confidence-l3-ex1': {
    welcomeTitle: 'Personal Wins',
    welcomeExplanation: "Welcome. Today we shift focus from deficits to spotting and documenting your personal strengths.",
    purposeTitle: 'Why Focus on Strengths?',
    purposeExplanation: "Our brains have a natural negativity bias, tracking flaws while ignoring resources. Spotting strengths balances this filter and builds confidence.",
    step1: {
      title: '1. Identify Three Strengths',
      prompt: 'List three distinct personal strengths or qualities you appreciate about yourself.',
      explanation: 'Think of qualities like curiosity, kindness, persistence, organization, or sense of humor.',
      example: 'e.g., "1. Persistence (I don\'t give up easily). 2. Empathy (I listen well). 3. Problem-solving (I find creative solutions)."',
      placeholder: 'List three strengths...',
      aiInstruction: 'Celebrate these strengths. Empathize with how rewarding it is to actively document our personal resources. Under 55 words.'
    },
    step2: {
      title: '2. Spot the Strengths in Action',
      prompt: 'Recall a specific event where you successfully utilized one of these strengths.',
      explanation: 'Describe a moment where this quality helped you navigate a challenge or support someone.',
      example: 'e.g., "Last week when our project database crashed, I remained persistent, researched errors for two hours, and resolved it."',
      placeholder: 'Describe the strength in action...',
      aiInstruction: 'Acknowledge the persistence demonstrated in this event. Validate that strengths are built through action. Under 55 words.'
    },
    step3: {
      title: '3. The Anchor Statement',
      prompt: 'Write down a statement of self-efficacy: "I am a person who can..."',
      explanation: 'Anchor your self-belief in this factual example of your competency.',
      example: 'e.g., "I am a person who can stay persistent and figure out technical challenges under pressure."',
      placeholder: 'Write your self-efficacy statement...',
      aiInstruction: 'Validate this self-efficacy statement. Explain how anchoring confidence in concrete examples builds lasting self-trust. Under 55 words.'
    },
    summary: {
      title: '4. Daily Strength Affirmation',
      prompt: 'Write a balanced statement summarizing your value and core strengths.',
      explanation: 'Construct a kind affirmation grounded entirely in the factual successes you listed.',
      example: 'e.g., "My confidence is built on real resources: I am persistent, empathetic, and a creative problem solver."',
      placeholder: 'Type your daily strength affirmation...'
    },
    celebrationTitle: 'Strengths Logged!',
    celebrationExplanation: "Fantastic work! Spotting and recording your strengths creates a concrete log of evidence that your inner critic cannot ignore. Walk proud!"
  },

  'building-confidence-l3-ex2': {
    welcomeTitle: 'Character Strength Finder',
    welcomeExplanation: "Welcome. Today we dive deeper into character strengths, identifying your top values using real-life evidence.",
    purposeTitle: 'Why Find Character Strengths?',
    purposeExplanation: "Character strengths are the core of our positive identity. Naming and using them boosts self-esteem and creates a reliable roadmap for decision making.",
    step1: {
      title: '1. Select Strength Categories',
      prompt: 'Select two character strength categories where you feel naturally strong (e.g., Wisdom, Courage, Humanity, Justice, Temperance, Transcendence).',
      explanation: 'Which categories resonate most with how you interact with the world?',
      example: 'e.g., "Wisdom (curiosity and learning) and Courage (bravery and persistence)."',
      placeholder: 'Type your two strength categories...',
      aiInstruction: 'Affirm the selected strength categories. Explain how identifying with wisdom or courage guides positive behavior. Under 55 words.'
    },
    step2: {
      title: '2. List Factual Examples',
      prompt: 'List specific experiences from your life that demonstrate these selected strengths.',
      explanation: 'Recall moments when you stood up for someone, learned something new, or stayed patient.',
      example: 'e.g., "1. For Wisdom: I taught myself how to build React applications. 2. For Courage: I took on a leadership role for a difficult project last year."',
      placeholder: 'Describe your factual examples...',
      aiInstruction: 'Review these life examples. Validate that these concrete actions prove these strengths are already part of their identity. Under 55 words.'
    },
    step3: {
      title: '3. Plan Deliberate Use',
      prompt: 'How can you deliberately use one of these strengths in a new way tomorrow?',
      explanation: 'Plan a small, specific action.',
      example: 'e.g., "I will use Wisdom tomorrow by spending 30 minutes reading documentation on a tool I want to master."',
      placeholder: 'Plan your strength action...',
      aiInstruction: 'Validate this planned use. Explain how active application of strengths reinforces cognitive competence. Under 55 words.'
    },
    summary: {
      title: '4. Character Strength Statement',
      prompt: 'Write a statement summarizing your core character strengths and how you intend to express them.',
      explanation: 'Make it personal and action-focused.',
      example: 'e.g., "I am a person of Wisdom and Courage, and I express my strengths by learning constantly and tackling challenges head-on."',
      placeholder: 'Type your strength statement...'
    },
    celebrationTitle: 'Strengths Identified!',
    celebrationExplanation: "Great job! Identifying character strengths helps you focus on what makes you uniquely capable and resilient."
  },

  'building-confidence-l3-ex3': {
    welcomeTitle: 'Daily Success Reflection',
    welcomeExplanation: "Welcome. Today we build a nightly habit of recognizing small daily victories, shifting focus to what went well.",
    purposeTitle: 'Why Reflect on Daily Success?',
    purposeExplanation: "At the end of the day, our minds default to reviewing mistakes and uncompleted tasks. Success reflection retrains the brain to appreciate your efforts.",
    step1: {
      title: '1. Identify One Daily Victory',
      prompt: 'Scan your day and identify one moment or task you handled well.',
      explanation: 'It doesn\'t have to be a major win—even small acts of patience, focus, or kindness count.',
      example: 'e.g., "I remained calm and listened patiently when a teammate was venting their frustration today."',
      placeholder: 'Describe your daily victory...',
      aiInstruction: 'Commend this daily win. Explain how remaining calm and empathetic is a valuable demonstration of self-regulation. Under 55 words.'
    },
    step2: {
      title: '2. Describe Your Action',
      prompt: 'What specific actions did you take to make this moment successful?',
      explanation: 'Describe what you said, did, or thought.',
      example: 'e.g., "I took a deep breath before responding, focused on listening without interrupting, and offered support."',
      placeholder: 'Describe your actions...',
      aiInstruction: 'Acknowledge the self-control shown here. Affirm that deliberate actions are what create successful moments. Under 55 words.'
    },
    step3: {
      title: '3. Name the Quality Utilized',
      prompt: 'Name the personal quality or skill that helped you handle this situation well.',
      explanation: 'Connect the win to a stable trait within yourself.',
      example: 'e.g., "Patience and Empathy."',
      placeholder: 'Name the quality...',
      aiInstruction: 'Validate this quality. Emphasize that this win is proof of their existing capacity for patience and empathy. Under 55 words.'
    },
    summary: {
      title: '4. Gratitude to Self',
      prompt: 'Write a brief statement expressing gratitude to yourself for showing up and putting in effort today.',
      explanation: 'Offer yourself the appreciation you deserve.',
      example: 'e.g., "I am grateful to myself for choosing patience today and for showing up with kindness even when it was hard."',
      placeholder: 'Type your self-gratitude...'
    },
    celebrationTitle: 'Day Reflected!',
    celebrationExplanation: "Wonderful work! Consistently recognizing your daily wins builds a strong foundation of confidence and self-efficacy."
  },

  'building-confidence-l4-ex1': {
    welcomeTitle: 'Values Ranking',
    welcomeExplanation: "Welcome. Today we connect self-worth to core values, shielding confidence from external performance pressure.",
    purposeTitle: 'Why Connect to Values?',
    purposeExplanation: "Performance-based confidence rises and falls with success and failure. Value-driven confidence remains stable because you can always act on your values.",
    step1: {
      title: '1. Select Your Top Core Values',
      prompt: 'Identify three core values that guide your life. (e.g. Creativity, Compassion, Integrity, Learning, Family)',
      explanation: 'What principles are most important to who you want to be?',
      example: 'e.g., "1. Learning (seeking knowledge). 2. Integrity (being honest). 3. Kindness (helping others)."',
      placeholder: 'List your core values...',
      aiInstruction: 'Validate these values. Empathize with how centering values shifts confidence from external approval to internal alignment. Under 55 words.'
    },
    step2: {
      title: '2. Value Alignment check',
      prompt: 'Recall a decision or action you took recently that aligned with one of these values.',
      explanation: 'Describe the situation and how acting on your value made you feel.',
      example: 'e.g., "I chose to admit a mistake on my report to my manager because of integrity. It felt scary, but I felt proud of being honest."',
      placeholder: 'Describe the value alignment...',
      aiInstruction: 'Praise the integrity. Validate that choosing honesty in a scary moment is a direct reinforcement of self-worth. Under 55 words.'
    },
    step3: {
      title: '3. Design a Value Action',
      prompt: 'Plan one small, simple action you will take tomorrow to practice one of your values.',
      explanation: 'Keep it highly concrete and under your control.',
      example: 'e.g., "To practice Kindness, I will send a message to a colleague thanking them for their help on a recent task."',
      placeholder: 'Plan tomorrow\'s value action...',
      aiInstruction: 'Validate this planned action. Explain how linking values to specific actions integrates them into daily behavior. Under 55 words.'
    },
    summary: {
      title: '4. Value-Based Identity',
      prompt: 'Write a statement defining your self-worth by your values, not external achievements.',
      explanation: 'Formulate a sentence that anchors your identity in the principles you stand for.',
      example: 'e.g., "My self-worth is defined by how I live my values of Learning, Integrity, and Kindness, which I can always choose to act on."',
      placeholder: 'Type your value-based identity...'
    },
    celebrationTitle: 'Values Clarified!',
    celebrationExplanation: "Superb work! When you align self-worth with internal values, you become immune to the ups and downs of external evaluation. You are values-centered."
  },

  'building-confidence-l4-ex2': {
    welcomeTitle: 'Identity Alignment',
    welcomeExplanation: "Welcome. Today we align your daily actions with your authentic core identity: the person you want to be at your best.",
    purposeTitle: 'Why Align Identity?',
    purposeExplanation: "When our actions conflict with our core identity, we feel internal friction and low confidence. Aligning them builds authentic integrity.",
    step1: {
      title: '1. Describe Your Best Self',
      prompt: 'Describe the person you want to be at your best, focusing on character traits.',
      explanation: 'How does this person treat others? How do they handle challenges?',
      example: 'e.g., "At my best, I am a calm, honest developer who is willing to learn and supports their team with patience."',
      placeholder: 'Describe your best self...',
      aiInstruction: 'Validate this description of your best self. Empathize with the aspiration to show up with patience and honesty. Under 55 words.'
    },
    step2: {
      title: '2. Spot the Action Conflict',
      prompt: 'Identify one area or situation where your current actions conflict with this identity.',
      explanation: 'Where do you find yourself reacting out of fear or frustration?',
      example: 'e.g., "When code errors pile up, I get impatience and snap at messages instead of responding calmly."',
      placeholder: 'Describe the conflict...',
      aiInstruction: 'Acknowledge the self-awareness here. Explain that noticing the friction is the first step in choosing a new response. Under 55 words.'
    },
    step3: {
      title: '3. Plan One Small Change',
      prompt: 'What is one small change you can make to bridge the gap between action and identity tomorrow?',
      explanation: 'Keep it simple and actionable.',
      example: 'e.g., "When I feel stressed by errors, I will take a 1-minute breathing break before responding to any slack messages."',
      placeholder: 'Plan your small change...',
      aiInstruction: 'Validate this planned change. Explain how a brief pause helps align your response with your authentic identity. Under 55 words.'
    },
    summary: {
      title: '4. The Identity Statement',
      prompt: 'Write an identity statement starting with "I am someone who..." based on your values.',
      explanation: 'Affirm your commitment to this identity.',
      example: 'e.g., "I am someone who meets challenges with patience and communicates with honesty and respect."',
      placeholder: 'Type your identity statement...'
    },
    celebrationTitle: 'Identity Aligned!',
    celebrationExplanation: "Excellent work! Living in alignment with your authentic self is the core of real, unshakeable confidence."
  },

  'building-confidence-l4-ex3': {
    welcomeTitle: 'Purpose Reflection',
    welcomeExplanation: "Welcome. Today we connect your daily efforts to a deeper sense of meaning and purpose, anchoring your confidence.",
    purposeTitle: 'Why Reflect on Purpose?',
    purposeExplanation: "Confidence is easier to maintain when you know *why* you are doing what you do. Connecting to purpose puts daily tasks in perspective.",
    step1: {
      title: '1. Define What Gives Meaning',
      prompt: 'Reflect on what gives your life a sense of direction, meaning, or purpose.',
      explanation: 'Think about what makes you feel fulfilled or what contribution you want to make.',
      example: 'e.g., "Helping others solve complex technical problems and building tools that make people\'s lives easier."',
      placeholder: 'What gives your life meaning...',
      aiInstruction: 'Validate this sense of meaning. Empathize with the fulfillment of using technical skills to help others. Under 55 words.'
    },
    step2: {
      title: '2. Assess Daily Routines',
      prompt: 'Describe how your current daily routines serve or align with this purpose.',
      explanation: 'Where do you see the connection? Where is the disconnect?',
      example: 'e.g., "My coding tasks directly build these tools, but sometimes I get so bogged down in fixing small bugs that I lose sight of the big picture."',
      placeholder: 'Assess your daily routines...',
      aiInstruction: 'Acknowledge this common challenge. Emphasize that connecting daily debugging tasks to the larger goal restores motivation. Under 55 words.'
    },
    step3: {
      title: '3. Set a Purpose-Aligned Goal',
      prompt: 'Identify one value-aligned goal for this week that moves you toward your purpose.',
      explanation: 'Make it realistic and focused on contribution.',
      example: 'e.g., "I will volunteer to help a junior developer resolve their blocker tomorrow, connecting to my purpose of helping others."',
      placeholder: 'Write your goal...',
      aiInstruction: 'Praise this supportive goal. Confirm that mentoring and helping others is a powerful way to reinforce purpose. Under 55 words.'
    },
    summary: {
      title: '4. The Purpose Anchor',
      prompt: 'Write a statement that anchors your confidence in your sense of purpose.',
      explanation: 'Remind yourself of why your efforts matter.',
      example: 'e.g., "My confidence is anchored in my purpose: using my skills to solve problems and support the people around me."',
      placeholder: 'Type your purpose anchor statement...'
    },
    celebrationTitle: 'Purpose Anchored!',
    celebrationExplanation: "Fantastic work! Grounding your confidence in a larger purpose makes you resilient to temporary setbacks and criticism."
  },

  'building-confidence-l5-ex1': {
    welcomeTitle: 'Confidence Action Plan',
    welcomeExplanation: "Welcome to the final lesson. Today we design one courageous step—a value-aligned micro-challenge—to reinforce your self-efficacy through action.",
    purposeTitle: 'Why Take Action?',
    purposeExplanation: "Confidence is not a feeling you wait for; it is a result of action. Taking a small, planned risk teaches your brain that you can handle uncertainty.",
    step1: {
      title: '1. Identify the Opportunity',
      prompt: 'What is a small risk or boundary-setting action you have been avoiding?',
      explanation: 'Choose something small, value-aligned, and within your immediate control.',
      example: 'e.g., "Speaking up in our next team brainstorm to suggest a design idea."',
      placeholder: 'Type the challenge or boundary...',
      aiInstruction: 'Validate the anxiety of speaking up. Empathize with how normal it is to fear judgment, and commend the challenge choice. Under 55 words.'
    },
    step2: {
      title: '2. Prepare for Uncertainty',
      prompt: 'What is the worst-case scenario of taking this step, and how will you cope?',
      explanation: 'Challenge the fear. If your idea is ignored, what will you tell yourself?',
      example: 'e.g., "My idea might not be used. If so, I will tell myself that my worth is in sharing, not in having every idea selected, and move on."',
      placeholder: 'Evaluate and map your coping plan...',
      aiInstruction: 'Affirm the coping plan. Reinforce that success is in the act of sharing itself, not in the team\'s response. Under 55 words.'
    },
    step3: {
      title: '3. Commit to the Gateway',
      prompt: 'Write: "I commit to taking this step tomorrow because it aligns with my value of [Value]."',
      explanation: 'Make a clear, formal commitment to yourself, linked to your core principles.',
      example: 'e.g., "I commit to sharing my idea in the meeting tomorrow because it aligns with my value of Creativity and growth."',
      placeholder: 'Write your formal commitment...',
      aiInstruction: 'Validate this commitment. Emphasize how formalizing intentions increases follow-through on values-driven actions. Under 55 words.'
    },
    summary: {
      title: '4. Courageous Anchor Statement',
      prompt: 'Write a brief phrase to say to yourself right before you take the step.',
      explanation: 'Make it short, strong, and focused on courage.',
      example: 'e.g., "Speak up. Value is in the sharing, and I can handle the outcome."',
      placeholder: 'Type your courage reminder...'
    },
    celebrationTitle: 'Confidence Program Completed!',
    celebrationExplanation: "Congratulations! You have completed the Building Confidence program. You now possess a complete toolkit to audit beliefs, reframe criticism, and take courageous action. Walk tall!"
  },

  'building-confidence-l5-ex2': {
    welcomeTitle: 'Fear Ladder',
    welcomeExplanation: "Welcome. Today we build a Fear Ladder: breaking down a feared situation into manageable, progressive steps.",
    purposeTitle: 'Why Build a Fear Ladder?',
    purposeExplanation: "Tackling a major fear all at once is overwhelming and can increase anxiety. Graded exposure—climbing a ladder of small steps—helps your brain habituate and build confidence safely.",
    step1: {
      title: '1. Identify the Fear Target',
      prompt: 'What is a major situation or action you currently avoid due to anxiety or fear of judgment?',
      explanation: 'Focus on a situation that is important to your personal or professional growth.',
      example: 'e.g., "Giving a presentation to the entire company or senior leadership."',
      placeholder: 'Type your fear target...',
      aiInstruction: 'Validate the fear of public speaking to leadership. Acknowledge that exposure is powerful when done gradually. Under 55 words.'
    },
    step2: {
      title: '2. List Five Progressive Steps',
      prompt: 'Break this situation down into 5 progressive steps, from least scary to most scary.',
      explanation: 'Each step should build toward the target.',
      example: 'e.g., "1. Writing the slides. 2. Recording myself presenting. 3. Presenting to 1 coworker. 4. Presenting to my small team. 5. Presenting to leadership."',
      placeholder: 'List your 5 progressive steps...',
      aiInstruction: 'Review and praise this fear ladder structure. Confirm that graded exposure is the gold standard for reducing anxiety. Under 55 words.'
    },
    step3: {
      title: '3. Commit to the First Step',
      prompt: 'Choose the very first step on your ladder and commit to taking it in the next few days.',
      explanation: 'Make a specific plan for when and where.',
      example: 'e.g., "I commit to writing the slides on Thursday afternoon in my quiet workspace."',
      placeholder: 'Write your first step commitment...',
      aiInstruction: 'Validate this initial step commitment. Emphasize that taking the first, low-anxiety step builds momentum for the rest. Under 55 words.'
    },
    summary: {
      title: '4. Coping Ladder Statement',
      prompt: 'Write a grounding statement to repeat when you feel anxious during this first step.',
      explanation: 'Keep it focused on tolerating discomfort.',
      example: 'e.g., "I can feel anxious and still write slides. I am building courage one step at a time."',
      placeholder: 'Type your coping statement...'
    },
    celebrationTitle: 'Ladder Built!',
    celebrationExplanation: "Excellent job! Breaking down fears makes them manageable. You are ready to start climbing your ladder at your own pace."
  },

  'building-confidence-l5-ex3': {
    welcomeTitle: 'Future Self Letter',
    welcomeExplanation: "Welcome to the final integration. Today you write a letter from your future, confident self to your present self.",
    purposeTitle: 'Why Write to the Future?',
    purposeExplanation: "Visualizing a confident future self strengthens your belief in your capacity to grow. It reminds you that current struggles are temporary parts of a larger journey.",
    step1: {
      title: '1. Visualizing Your Future Self',
      prompt: 'Imagine yourself one year from now, having successfully grown in confidence and resilience. Describe what you see.',
      explanation: 'Where are you? How do you carry yourself? How do you respond to stress?',
      example: 'e.g., "I see myself presenting ideas calmly, handling project setbacks without panic, and speaking kindly to myself daily."',
      placeholder: 'Describe your future self...',
      aiInstruction: 'Validate this visualization. Empathize with the readiness of this future self. Under 55 words.'
    },
    step2: {
      title: '2. Document What You Overcame',
      prompt: 'What did this future self learn and overcome in the past year?',
      explanation: 'Look back at your current struggles from a perspective of victory.',
      example: 'e.g., "They learned to quiet the critic, collect real evidence of worth, and take action despite feeling nervous."',
      placeholder: 'Describe what was overcome...',
      aiInstruction: 'Praise this perspective. Affirm that viewing current challenges as solvable tasks builds long-term optimism. Under 55 words.'
    },
    step3: {
      title: '3. Write Advice for the Present',
      prompt: 'What advice or encouragement would your future self offer to you right now?',
      explanation: 'What do you need to hear most today?',
      example: 'e.g., "Don\'t let one mistake define you. Trust the tools, celebrate small wins, and remember you are capable of growing."',
      placeholder: 'Write your future self\'s advice...',
      aiInstruction: 'Validate this supportive advice. Highlight the warmth and wisdom of their own voice offering self-encouragement. Under 55 words.'
    },
    summary: {
      title: '4. The Final Integration',
      prompt: 'Write your final, integrated statement of confidence to conclude this program.',
      explanation: 'Celebrate your capability to grow, act courageously, and support yourself.',
      example: 'e.g., "I am capable of growth. I will meet my fears with planned action, answer my critic with self-compassion, and trust my inner resources."',
      placeholder: 'Type your final confidence statement...'
    },
    celebrationTitle: 'Confidence Program Completed!',
    celebrationExplanation: "Congratulations! You have completed the Building Confidence program. You are now equipped with a robust toolkit to audit beliefs, quiet the critic, and step confidently. Walk tall in self-trust!"
  },

  // ==========================================
  // PROGRAM: Self Compassion
  // ==========================================
  'self-compassion-l1-ex1': {
    welcomeTitle: 'Self Kindness',
    welcomeExplanation: "Welcome to self-compassion. Today we introduce Loving-Kindness to cultivate warm, supportive attitudes toward yourself and your struggles.",
    purposeTitle: 'Why Practice Loving-Kindness?',
    purposeExplanation: "We are often our own harshest critics. Offering ourselves kind, supportive phrases counteracts self-judgment and builds neural pathways of safety.",
    step1: {
      title: '1. Catch the Self-Blame',
      prompt: 'Describe a recent situation where you blamed or criticized yourself harshly.',
      explanation: 'Select a minor mistake or setback that made you feel inadequate.',
      example: 'e.g., "I arrived late to a meeting and spent the day calling myself irresponsible."',
      placeholder: 'Describe the self-criticism...',
      aiInstruction: 'Validate the discomfort of being late. Empathize with how the critic uses minor mistakes to trigger intense self-blame. Under 55 words.'
    },
    step2: {
      title: '2. Offer Support Phrases',
      prompt: 'Write three kind phrases you want to offer yourself. (e.g. May I be safe, May I be happy, May I accept myself)',
      explanation: 'Choose statements that resonate with your current struggle.',
      example: 'e.g., "May I be safe. May I be kind to myself. May I remember my worth is not defined by tardiness."',
      placeholder: 'Type your supportive phrases...',
      aiInstruction: 'Affirm the phrases. Highlight how active self-kindness signals safety to the amygdala, reducing physiological stress. Under 55 words.'
    },
    step3: {
      title: '3. Somatic Heart Connection',
      prompt: 'Place a hand over your heart, breathe into the warmth, and write "I deserve my own kindness."',
      explanation: 'Physical touch (hand on heart) triggers the release of oxytocin, reinforcing emotional safety.',
      example: 'e.g., "I deserve my own kindness. I am doing my best, and that is completely enough."',
      placeholder: 'Write your somatic connection statement...',
      aiInstruction: 'Validate this somatic practice. Explain how physical self-touch immediately signals safety and care to your nervous system. Under 55 words.'
    },
    summary: {
      title: '4. Compassionate Integration',
      prompt: 'Write a balanced thought combining the mistake and the self-compassion.',
      explanation: 'Acknowledge the event while asserting kindness and acceptance.',
      example: 'e.g., "I was late, but I am still a responsible person who had an off day. I accept myself as I am."',
      placeholder: 'Type your compassionate reframe...'
    },
    celebrationTitle: 'Kindness Offered!',
    celebrationExplanation: "Great job! Offering kindness to yourself during a setback is a massive act of courage. Each kind word rewrites the brain's automatic critic."
  },

  'self-compassion-l2-ex1': {
    welcomeTitle: 'Forgiveness',
    welcomeExplanation: "Welcome. Today we practice self-forgiveness to let go of self-blame and release regret from past mistakes.",
    purposeTitle: 'Why Self-Forgiveness?',
    purposeExplanation: "Carrying regret feeds self-criticism. Forgiveness isn't condoning past mistakes; it is releasing the demand for a better past, freeing your energy for the present.",
    step1: {
      title: '1. Identify the Regret',
      prompt: 'Describe a past mistake or perceived failure you still hold against yourself.',
      explanation: 'What error or decision do you judge yourself for?',
      example: 'e.g., "I regret speaking too harshly to a teammate during a stressful project last year."',
      placeholder: 'Type the regret here...',
      aiInstruction: 'Validate the regret. Assure the user that feeling remorse shows they care, but continuous self-punishment prevents healing. Under 55 words.'
    },
    step2: {
      title: '2. Imagine Compassionate Forgiveness',
      prompt: 'Imagine a dear, compassionate friend looking at your mistake. What forgiving words would they say?',
      explanation: 'Write down their warm, forgiving explanation for what happened.',
      example: 'e.g., "You were under extreme stress and exhausted. You apologized afterward, and it is okay to let this go now."',
      placeholder: 'Write their forgiving words...',
      aiInstruction: 'Acknowledge this warm perspective. Confirm that viewing ourselves through a friend\'s eyes reveals our shared humanity. Under 55 words.'
    },
    step3: {
      title: '3. Direct Forgiveness Inward',
      prompt: 'Adopt this forgiveness. Write: "I forgive myself for [mistake], and I release this regret."',
      explanation: 'Commit to letting go of the self-blame.',
      example: 'e.g., "I forgive myself for speaking harshly, and I release this regret. I choose to learn from it instead of carrying the guilt."',
      placeholder: 'Write your self-forgiveness statement...',
      aiInstruction: 'Validate this self-forgiveness statement. Note that releasing regret is a powerful gift of self-compassion. Under 55 words.'
    },
    summary: {
      title: '4. Forgiveness Anchor',
      prompt: 'Write a short coping statement to use when this regret resurfaces.',
      explanation: 'Make it a reminder of your forgiveness and commitment to growth.',
      example: 'e.g., "I made a mistake, I apologized, and I have forgiven myself. I am moving forward."',
      placeholder: 'Type your forgiveness anchor...'
    },
    celebrationTitle: 'Forgiveness Practiced!',
    celebrationExplanation: "Superb work! Releasing regret is a profound act of healing. You are freeing yourself to live fully in the present."
  },

  'self-compassion-l3-ex1': {
    welcomeTitle: 'Acceptance',
    welcomeExplanation: "Welcome. Today we practice acceptance, embracing our limitations as a normal part of the human experience.",
    purposeTitle: 'Why Practice Acceptance?',
    purposeExplanation: "Fighting our limitations creates suffering and shame. Accepting them frees up energy and builds authentic self-compassion.",
    step1: {
      title: '1. The Limitation or Flaw',
      prompt: 'Write down a personal flaw or limitation that you judge yourself for.',
      explanation: 'What is a boundary or struggle you try to hide or correct?',
      example: 'e.g., "I struggle with public speaking and get extremely nervous."',
      placeholder: 'Type the limitation...',
      aiInstruction: 'Validate the vulnerability of public speaking anxiety. Assure the user that having anxiety is a normal human response. Under 55 words.'
    },
    step2: {
      title: '2. Acknowledge Common Humanity',
      prompt: 'Reflect on how many other people share this exact limitation. Write "Struggling with [limitation] is part of being human."',
      explanation: 'Realize you are not uniquely broken; your struggle is shared by millions.',
      example: 'e.g., "Struggling with public speaking anxiety is part of being human. Most people feel nervous in front of crowds."',
      placeholder: 'Write your common humanity acknowledgment...',
      aiInstruction: 'Reinforce the common humanity context. Highlight that sharing limitations removes isolation and shame. Under 55 words.'
    },
    step3: {
      title: '3. Soften the Struggle',
      prompt: 'What happens when you accept this limitation instead of fighting it?',
      explanation: 'Acknowledge: "I have this limitation, AND I am still worthy of kindness."',
      example: 'e.g., "I get nervous when speaking, AND I am still a capable professional who deserves kindness."',
      placeholder: 'Write your softening statement...',
      aiInstruction: 'Validate this acceptance. Explain how the AND statement reconciles struggle with worthiness. Under 55 words.'
    },
    summary: {
      title: '4. Compassionate Acceptance Statement',
      prompt: 'Write your final, supportive reframe embracing this imperfection.',
      explanation: 'Formulate a sentence that accepts your boundaries while asserting your self-worth.',
      example: 'e.g., "I don\'t need to speak perfectly to be valuable. I accept my nervousness and will focus on sharing my ideas naturally."',
      placeholder: 'Type your final reframed statement...'
    },
    celebrationTitle: 'Limitation Accepted!',
    celebrationExplanation: "Superb! By letting go of the demand to be perfect, you've claimed your right to be human. True self-compassion starts here."
  },

  'self-compassion-l4-ex1': {
    welcomeTitle: 'Growth',
    welcomeExplanation: "Welcome. Today we learn to translate personal struggles into opportunities for growth, moving from judgment to learning.",
    purposeTitle: 'Why Focus on Growth?',
    purposeExplanation: "When we criticize ourselves for failures, we get stuck. Shifting to a growth mindset helps us see setbacks as valuable feedback and opportunities to evolve.",
    step1: {
      title: '1. The Recent Challenge',
      prompt: 'Describe a recent setback, failure, or struggle you faced.',
      explanation: 'Select a challenge that made you doubt your abilities.',
      example: 'e.g., "I failed to deliver the project milestone on time, and my manager noticed."',
      placeholder: 'Describe the challenge...',
      aiInstruction: 'Validate the stress of missing a milestone. Explain that setbacks are a normal part of challenging work. Under 55 words.'
    },
    step2: {
      title: '2. Identify the Strengths Used',
      prompt: 'What strengths, skills, or resources did you use or discover to cope with this challenge?',
      explanation: 'Look for persistence, communication, seeking help, or resilience.',
      example: 'e.g., "I immediately communicated the delay to my manager, requested assistance, and stayed focused on resolving the block."',
      placeholder: 'List the strengths used...',
      aiInstruction: 'Affirm these strengths. Highlight that taking ownership and communicating are vital growth behaviors. Under 55 words.'
    },
    step3: {
      title: '3. Extract the Lesson',
      prompt: 'What is the most valuable lesson this struggle taught you?',
      explanation: 'How does this challenge help you improve or adapt in the future?',
      example: 'e.g., "I learned that I need to build in buffer time for unexpected technical bugs and ask for help sooner next time."',
      placeholder: 'Describe the lesson learned...',
      aiInstruction: 'Validate this lesson. Note that extracting specific lessons turns setbacks into stepping stones. Under 55 words.'
    },
    summary: {
      title: '4. Growth Mindset Reframe',
      prompt: 'Write a growth-oriented reframe that combines the challenge, your learning, and your worth.',
      explanation: 'Formulate a statement that views the setback as a lesson, not a definition of your character.',
      example: 'e.g., "Missing the milestone was stressful, but it taught me to build in buffer time. I am a capable professional who is continuously learning."',
      placeholder: 'Type your growth reframe...'
    },
    celebrationTitle: 'Setback Reframed for Growth!',
    celebrationExplanation: "Wonderful work! By shifting your focus from self-judgment to learning, you've transformed a setback into a powerful tool for growth."
  },

  'self-compassion-l5-ex1': {
    welcomeTitle: 'Compassion Practice',
    welcomeExplanation: "Welcome to the final integration. Today we combine mindfulness, common humanity, and self-kindness into a unified daily practice.",
    purposeTitle: 'Why Build a Compassion Practice?',
    purposeExplanation: "Having a structured self-compassion break provides an immediate, compassionate emergency response when sudden stress occurs.",
    step1: {
      title: '1. Identify the Stress Point',
      prompt: 'Recall a situation that immediately triggers a self-judgment spiral for you.',
      explanation: 'What is a frequent trigger of self-criticism in your daily life?',
      example: 'e.g., "Making a typo in a sent email to a client."',
      placeholder: 'Type the trigger...',
      aiInstruction: 'Validate how easily minor digital typos trigger the critic. Acknowledge the desire for flawless work. Under 55 words.'
    },
    step2: {
      title: '2. The Self-Compassion Break Formula',
      prompt: 'Apply the three steps to the trigger: Mindfulness (notice), Common Humanity (connect), Self-Kindness (comfort).',
      explanation: 'Map out exactly what you will say to yourself.',
      example: 'e.g., "1. Mindfulness: I notice I am feeling a wave of panic and embarrassment. 2. Common Humanity: Everyone sends typos; it\'s a standard error. 3. Self-Kindness: I can send a quick clarification. My client will understand, and I am okay."',
      placeholder: 'Describe your three steps...',
      aiInstruction: 'Affirm the three-part application. Praise how combining noticing, connecting, and comforting forms a complete safety response. Under 55 words.'
    },
    step3: {
      title: '3. Physical Anchor Practice',
      prompt: 'Combine this verbal routine with a physical anchor (breath, hand on chest) and write "I choose kindness under pressure."',
      explanation: 'Linking the words to a physical anchor automates the response.',
      example: 'e.g., "I choose kindness under pressure. When I spot a typo, I will take a breath, place my hand on my chest, and apply the formula."',
      placeholder: 'Write your physical anchor commitment...',
      aiInstruction: 'Validate this anchor. Explain how physical cues make self-compassion automatic during stress. Under 55 words.'
    },
    summary: {
      title: '4. Emergency Self-Compassion Break Card',
      prompt: 'Write down a consolidated 10-second version of your self-compassion break.',
      explanation: 'Make it a single, powerful sentence to use in high-stress moments.',
      example: 'e.g., "This is a moment of struggle, struggle is part of life, may I show myself kindness in this moment."',
      placeholder: 'Type your emergency card...'
    },
    celebrationTitle: 'Self-Compassion Program Completed!',
    celebrationExplanation: "Congratulations! You have completed the Self Compassion program. Continue to treat yourself with the warmth, dignity, and acceptance you deserve. Walk in peace!"
  },

  // ==========================================
  // PROGRAM: Resilience
  // ==========================================
  'resilience-l1': {
    welcomeTitle: 'Understanding Resilience',
    welcomeExplanation: "Welcome to Resilience. Today we explore the cognitive foundation of resilience and how to reframe setbacks as valuable feedback.",
    purposeTitle: 'Why Learn Resilience?',
    purposeExplanation: "Resilience is not a fixed trait; it is a cognitive skill. Reframing setbacks as data rather than personal failure allows us to adapt and grow.",
    step1: {
      title: '1. Describe the Recent Setback',
      prompt: 'Describe a recent challenge or setback you experienced.',
      explanation: 'What happened? Choose an event that felt discouraging or stressful.',
      example: 'e.g., "I submitted a project proposal, and it was sent back with major requests for revision."',
      placeholder: 'Describe the setback...',
      aiInstruction: 'Validate the disappointment of having work sent back. Acknowledge the effort invested. Under 55 words.'
    },
    step2: {
      title: '2. The Fixed Mindset Audit',
      prompt: 'What did your inner voice say this setback meant about you?',
      explanation: 'Does it tell you "I am not good at this" or "I will never succeed"? Spot the fixed belief.',
      example: 'e.g., "My critic said: \'You\'re bad at proposing ideas. You\'ll never get this approved.\'"',
      placeholder: 'Type the fixed mindset statement...',
      aiInstruction: 'Audit the fixed mindset statement. Validate that the brain uses these extreme warnings to avoid future rejection. Under 55 words.'
    },
step3: {
       title: '3. Reframe as Feedback (Growth)',
       prompt: 'Reframe the setback as data. What is the constructive information in this feedback?',
       explanation: 'Strip away the drama. What is the actual, helpful detail you can use?',
       example: 'e.g., "The revision requests show exactly what the manager wants to see. It is a roadmap to get it approved, not a rejection of my capability."',
       placeholder: 'Describe the constructive feedback...',
       aiInstruction: 'Validate this reframing. Explain how viewing feedback as data shifts focus from ego to growth and learning. Under 55 words.'
     },
    summary: {
      title: '4. The Resilient Outlook',
      prompt: 'Write a balanced thought combining the setback, the feedback, and a growth plan.',
      explanation: 'Formulate a sentence that shifts focus from ego to action.',
      example: 'e.g., "My proposal needs work, but the feedback shows me exactly how to improve it. I will revise it step-by-step and learn in the process."',
      placeholder: 'Type your restructured growth statement...'
    },
    celebrationTitle: 'Setback Reframed!',
    celebrationExplanation: "Fantastic work! Shifting from \'I am failing\' to \'I am learning\' is the exact core of cognitive resilience. Setbacks are just data for growth."
  },

  'resilience-l2': {
    welcomeTitle: 'Optimistic Reframing',
    welcomeExplanation: "Welcome. Today we learn to interrupt explanatory biases, reframing challenges as temporary and specific rather than permanent and pervasive.",
    purposeTitle: 'Why Explanatory Style Matters?',
    purposeExplanation: "Resilient minds explain bad events as temporary and specific. Pessimistic loops see bad events as permanent (\'always\') and pervasive (\'everything\'). Reframing builds hope.",
    step1: {
      title: '1. The Pervasive Worry',
      prompt: 'Write down a worry that feels permanent or pervasive. (e.g. "I always fail at this", "My whole day is ruined")',
      explanation: 'Look for words like "always", "never", "ruined", or "everything".',
      example: 'e.g., "I always freeze during public discussions. I will never be a good communicator."',
      placeholder: 'Type the pervasive worry...',
      aiInstruction: 'Validate the heaviness of this worry. Acknowledge that the brain overgeneralizes single failures to protect us from future risk. Under 55 words.'
    },
    step2: {
      title: '2. Reframe as Temporary',
      prompt: 'Rewrite the event as temporary. How is it limited in time?',
      explanation: 'Change "always/never" to "this time" or "in this moment".',
      example: 'e.g., "I felt nervous during today\'s discussion. This is a temporary state, not a permanent definition of my communication skills."',
      placeholder: 'Write the temporary reframe...',
      aiInstruction: 'Affirm the temporary reframe. Highlight how defining a setback as time-bound immediately creates a sense of relief. Under 55 words.'
    },
step3: {
       title: '3. Reframe as Specific',
       prompt: 'Rewrite the event as specific. How is it limited to just this one area?',
       explanation: 'Change "everything is ruined" to "this specific task is difficult, but other areas are fine".',
       example: 'e.g., "This discussion was challenging, but I communicate well in writing, one-on-one, and in my code reviews."',
       placeholder: 'Write the specific reframe...',
       aiInstruction: 'Validate this specificity. Explain how confining a setback prevents it from flooding your entire identity. Under 55 words.'
     },
    summary: {
      title: '4. Optimistic Explanatory Statement',
      prompt: 'Combine the temporary and specific reframes into a single, optimistic statement.',
      explanation: 'Write a realistic, hopeful summary that confines the struggle.',
      example: 'e.g., "I struggled with the discussion today, but it is a temporary challenge in one specific format. I have many communication strengths and will keep practicing."',
      placeholder: 'Type your optimistic statement...'
    },
    celebrationTitle: 'Struggle Confined!',
    celebrationExplanation: "Excellent work! Confining setbacks to a single time and place prevents them from flooding your entire self-esteem. Storms pass; you remain."
  },

  'resilience-l3': {
    welcomeTitle: 'Locus of Control',
    welcomeExplanation: "Welcome. Today we map your Locus of Control, separating stressors into what you can control and what you cannot.",
    purposeTitle: 'Why Focus on Control?',
    purposeExplanation: "Anxiety drains energy by worrying about uncontrollable facts (like other people\'s actions). Focusing on what we *can* control restores agency and reduces stress.",
    step1: {
      title: '1. The Stressful Situation',
      prompt: 'Describe a situation that is currently causing you high worry or anxiety.',
      explanation: 'Select a situation with multiple moving parts.',
      example: 'e.g., "I am worrying about whether our client will accept our project timeline next week."',
      placeholder: 'Describe the situation...',
      aiInstruction: 'Validate the concern. Acknowledge that waiting for client evaluations naturally triggers a sense of helplessness. Under 55 words.'
    },
    step2: {
      title: '2. What is Outside Your Control?',
      prompt: 'List the aspects of this situation that you cannot influence or control.',
      explanation: 'Think of other people\'s reactions, past events, client decisions, or technical issues.',
      example: 'e.g., "1. The client\'s mood. 2. The client\'s internal budget. 3. What they think of our presentation. 4. Past delays."',
      placeholder: 'List uncontrollable elements...',
      aiInstruction: 'Acknowledge these elements. Validate that letting go of these facts releases a massive amount of mental burden. Under 55 words.'
    },
step3: {
       title: '3. What is Inside Your Control?',
       prompt: 'List the aspects of this situation that you *can* actively control or influence.',
       explanation: 'Think of your preparation, your communication, your boundaries, or your response.',
       example: 'e.g., "1. How thoroughly I prepare my slides. 2. Getting a good night\'s sleep. 3. Explaining our timeline clearly and politely. 4. My response if they request changes."',
       placeholder: 'List controllable elements...',
       aiInstruction: 'Validate these controllable elements. Explain how directing energy to what you can influence restores a sense of agency. Under 55 words.'
     },
    summary: {
      title: '4. Locus of Control Plan',
      prompt: 'Formulate an action plan focusing only on the controllable elements, letting go of the rest.',
      explanation: 'Write a commitment to direct your energy where it actually has power.',
      example: 'e.g., "I cannot control the client\'s decision, so I will let go of that worry. I will focus entirely on preparing my slides clearly and resting before the meeting."',
      placeholder: 'Type your focus plan...'
    },
    celebrationTitle: 'Control Map Created!',
    celebrationExplanation: "Fantastic work! Choosing to ignore the uncontrollable and pour energy into your own actions is the ultimate power move. You are in control of your response."
  },

  'resilience-l4': {
    welcomeTitle: 'Stress Hardiness',
    welcomeExplanation: "Welcome. Today we design Stress Hardiness habits, planning daily micro-recoveries to buffer against chronic fatigue.",
    purposeTitle: 'Why Build Hardiness?',
    purposeExplanation: "Resilience is like a battery. We cannot bounce back if we are running on empty. Proactive micro-recoveries recharge our reserves throughout the day.",
    step1: {
      title: '1. Identify Your Energy Drains',
      prompt: 'What are the main events or periods in your day that drain your mental energy?',
      explanation: 'Think of back-to-back meetings, screen glare, continuous work blocks, or difficult tasks.',
      example: 'e.g., "The afternoon stretch from 2 PM to 5 PM with continuous Zoom meetings and screen work."',
      placeholder: 'List your energy drains...',
      aiInstruction: 'Validate the afternoon slump. Acknowledge that continuous screen meetings require a high level of mental output. Under 55 words.'
    },
    step2: {
      title: '2. Brainstorm Micro-Recoveries',
      prompt: 'List three restorative activities that take under 5 minutes and require zero screen time.',
      explanation: 'Think of actions like stretching, walking outside, closed-eye breathing, or drinking tea.',
      example: 'e.g., "1. Stepping outside to feel the sun on my face for 2 minutes. 2. Doing 3 cycles of box breathing. 3. A physical stretch away from my desk."',
      placeholder: 'List micro-recovery ideas...',
      aiInstruction: 'Praise these ideas. Affirm that brief, screens-free breaks are incredibly effective at restoring cognitive stamina. Under 55 words.'
    },
step3: {
       title: '3. Schedule the Recoveries',
       prompt: 'Choose one recovery and link it to an anchor time. Write "At [time/cue], I will [recovery] for 3 minutes."',
       explanation: 'Create a habit stack to ensure the recovery actually occurs.',
       example: 'e.g., "At 3 PM, right after my Zoom meeting ends, I will step outside to the balcony for 3 minutes of fresh air."',
       placeholder: 'Write your scheduled recovery...',
       aiInstruction: 'Validate this scheduling. Explain how linking recovery to existing habits ensures they actually happen. Under 55 words.'
     },
    summary: {
      title: '4. Stress Hardiness Commitment',
      prompt: 'Write a commitment to protect your daily recoveries, treating them as essential for your stamina.',
      explanation: 'Remind yourself that rest is not a reward; it is a necessity for resilience.',
      example: 'e.g., "I commit to protecting my 3 PM recovery space. Recharging my battery is how I maintain my focus and handle challenges calmly."',
      placeholder: 'Type your hardiness commitment...'
    },
    celebrationTitle: 'Hardiness Scheduled!',
    celebrationExplanation: "Wonderful job! Proactively planning recoveries prevents burnout and builds stress hardiness. Your future resilient self thanks you."
  },

  'resilience-l5': {
    welcomeTitle: 'Resilience Playbook',
    welcomeExplanation: "Welcome to the final integration. Today we build your Resilience Playbook: your response plan for when life throws unexpected challenges.",
    purposeTitle: 'Why Build a Playbook?',
    purposeExplanation: "When a major crisis hits, we panic. Having a pre-planned playbook keeps you grounded, logical, and focused on active coping from the very first minute.",
    step1: {
      title: '1. Select Your Primary Grounding Thought',
      prompt: 'What is the most powerful grounding thought you have learned in this program?',
      explanation: 'Choose a phrase that instantly calms your mind under pressure. (e.g. "I can handle this", "This is temporary", "Focus on what I can control")',
      example: 'e.g., "I cannot control the event, but I can always control my response. This is temporary and specific."',
      placeholder: 'Type your grounding thought...',
      aiInstruction: 'Validate the strength of this grounding thought. Empathize with the readiness of having a core mantra. Under 55 words.'
    },
    step2: {
      title: '2. Map the Immediate Actions',
      prompt: 'What are the first two actions you will take when a major setback occurs?',
      explanation: 'Choose actions to calm your physiology and map your control boundaries.',
      example: 'e.g., "1. Splashing cold water on my face and taking 5 deep breaths. 2. Writing a list of what is in my control right now."',
      placeholder: 'Describe your first two actions...',
      aiInstruction: 'Praise this sequence. Confirm that somatic calming followed by control mapping is the gold standard of crisis management. Under 55 words.'
    },
step3: {
       title: '3. Identify Your Support Network',
       prompt: 'List the people, colleagues, or resources you can reach out to for support or perspective.',
       explanation: 'Resilience is not a solo act. Knowing who to call is a key resource.',
       example: 'e.g., "My partner Alex for emotional support, and my mentor Sarah for professional advice on technical challenges."',
       placeholder: 'List your support resources...',
       aiInstruction: 'Validate this network. Explain that having trusted resources removes the burden of handling everything alone. Under 55 words.'
     },
    summary: {
      title: '4. The Resilient Playbook Affirmation',
      prompt: 'Write your final, integrated statement of resilience to conclude this program.',
      explanation: 'Celebrate your capability to bounce back, adapt, and grow.',
      example: 'e.g., "I am a resilient person. When setbacks occur, I will ground my body, focus entirely on what I can control, and utilize my resources to move forward."',
      placeholder: 'Type your final resilience playbook...'
    },
    celebrationTitle: 'Resilience Program Completed!',
    celebrationExplanation: "Congratulations! You have completed the Resilience program. You are now equipped with a robust, active playbook to navigate life\'s storms with grace and strength. Walk in resilience!"
  }
};

export const GUIDED_STEPS_CONFIG: Record<string, GuidedStep[]> = {};

// Generate all configurations dynamically on load
Object.entries(BLUEPRINTS).forEach(([key, blueprint]) => {
  GUIDED_STEPS_CONFIG[key] = generateCBTSteps(key, blueprint);
});
