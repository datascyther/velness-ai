import { EXERCISE_TYPE, ExerciseType } from '../constants';
import type { Exercise } from '../models/Exercise';
import { DEFAULT_LESSONS } from './programs';

interface CustomExerciseInput {
  type?: ExerciseType;
  title: string;
  goal: string;
  instructions: string[];
  completionCriteria?: string;
  time?: number;
}

const CUSTOM_EXERCISES: Record<string, CustomExerciseInput> = {
  // CBT - Understanding Thoughts
  'understanding-thoughts-l1-ex1': {
    type: EXERCISE_TYPE.JOURNALING,
    title: 'Thought Logging',
    goal: 'Build awareness of your stream of thoughts by writing them down',
    instructions: [
      'Sit comfortably and observe your thoughts without judgment.',
      'Write down the most prominent thought in your mind right now.',
      'Observe how it feels to put this thought into words.'
    ],
    completionCriteria: 'Save your observation to complete this step.'
  },
  'understanding-thoughts-l1-ex2': {
    type: EXERCISE_TYPE.JOURNALING,
    title: 'Trigger Mapping',
    goal: 'Identify the situation or trigger that prompted your thought',
    instructions: [
      'Recall the exact situation you were in when the thought occurred.',
      'Write down who was there, what was happening, and the environment.',
      'State: "The trigger was..."'
    ]
  },
  'understanding-thoughts-l1-ex3': {
    type: EXERCISE_TYPE.JOURNALING,
    title: 'Emotion Tracking',
    goal: 'Identify and rate the emotions associated with your thoughts',
    instructions: [
      'List the specific emotions you felt (e.g. anxiety, sadness, anger).',
      'Rate the intensity of each emotion on a scale of 1-10.',
      'Locate where in your body you felt the emotion (e.g. chest, shoulders).'
    ]
  },
  'understanding-thoughts-l2-ex1': {
    type: EXERCISE_TYPE.JOURNALING,
    title: 'Automatic Thoughts',
    goal: 'Identify rapid, automatic reactions to a trigger',
    instructions: [
      'Describe a recent situation that caused a sudden shift in your mood.',
      'Write down the very first automatic thought that came to mind.',
      'Rate how strongly you believe this thought (0-100%).'
    ]
  },
  'understanding-thoughts-l2-ex2': {
    type: EXERCISE_TYPE.JOURNALING,
    title: 'Evidence Testing',
    goal: 'Examine the evidence for and against your automatic thought',
    instructions: [
      'Write down your automatic thought.',
      'List objective, factual evidence that supports this thought.',
      'List objective, factual evidence that contradicts this thought.'
    ]
  },
  'understanding-thoughts-l2-ex3': {
    type: EXERCISE_TYPE.JOURNALING,
    title: 'Alternative Thinking',
    goal: 'Develop a balanced, alternative perspective based on evidence',
    instructions: [
      'Review the evidence for and against your automatic thought.',
      'Write a new, balanced thought that incorporates all the facts.',
      'Re-rate your belief in the original thought and your emotional intensity.'
    ]
  },
  'understanding-thoughts-l3-ex1': {
    type: EXERCISE_TYPE.JOURNALING,
    title: 'Thinking Traps',
    goal: 'Learn to recognize common cognitive distortions or thinking traps',
    instructions: [
      'Review common traps: all-or-nothing thinking, catastrophizing, mind reading, emotional reasoning.',
      'Write down a recent negative thought.',
      'Identify which thinking trap(s) this thought represents.'
    ]
  },
  'understanding-thoughts-l3-ex2': {
    type: EXERCISE_TYPE.JOURNALING,
    title: 'Pattern Recognition',
    goal: 'Identify recurring thinking traps in your daily life',
    instructions: [
      'Look over your logged thoughts from the past few days.',
      'Note which thinking traps appear most frequently.',
      'Describe the situations where you are most likely to fall into these traps.'
    ]
  },
  'understanding-thoughts-l3-ex3': {
    type: EXERCISE_TYPE.JOURNALING,
    title: 'Replacement Thinking',
    goal: 'Practice replacing thinking traps with objective thoughts',
    instructions: [
      'Take a thought that fell into a thinking trap.',
      'Rephrase it objectively, removing the trap\'s exaggeration.',
      'Write down the revised, realistic thought.'
    ]
  },
  'understanding-thoughts-l4-ex1': {
    type: EXERCISE_TYPE.JOURNALING,
    title: 'Perspective Shift',
    goal: 'View a situation from a different angle to reduce distress',
    instructions: [
      'Describe a situation that is currently causing you stress.',
      'Imagine how a close, supportive friend would view this situation.',
      'Write down what they would say or how they would describe it.'
    ]
  },
  'understanding-thoughts-l4-ex2': {
    type: EXERCISE_TYPE.JOURNALING,
    title: 'Balanced Thinking',
    goal: 'Develop a moderate, realistic view of a stressful situation',
    instructions: [
      'Write down the extreme positive and extreme negative outcomes.',
      'Identify the most realistic, balanced outcome in between these extremes.',
      'Write a balanced thought summarizing this middle ground.'
    ]
  },
  'understanding-thoughts-l4-ex3': {
    type: EXERCISE_TYPE.JOURNALING,
    title: 'Reality Testing',
    goal: 'Test the actual likelihood of your worries coming true',
    instructions: [
      'Write down a worry or negative prediction.',
      'Rate the likelihood of it happening (0-100%).',
      'List actions you can take to cope if the worst-case scenario occurs.'
    ]
  },
  'understanding-thoughts-l5-ex1': {
    type: EXERCISE_TYPE.JOURNALING,
    title: 'Thought Mastery Plan',
    goal: 'Establish a sustainable plan for daily thought awareness',
    instructions: [
      'Summarize the key thinking traps and triggers you identified in this program.',
      'Commit to a daily thought-checking routine (e.g. 5 minutes every evening).',
      'Write a core grounding statement to remind you that thoughts are not facts.'
    ]
  },

  // CBT - Challenging Negative Thinking
  'challenging-negative-thinking-l1': {
    type: EXERCISE_TYPE.JOURNALING,
    title: 'ANT Catcher',
    goal: 'Identify automatic negative thoughts (ANTs) as they arise',
    instructions: [
      'Recall a moment today when you felt self-doubt or irritation.',
      'Write down the exact automatic negative thought (ANT).',
      'Rate how strongly you believed this thought (0% to 100%).',
      'Remind yourself: "Believing a thought doesn\'t make it true."'
    ]
  },
  'challenging-negative-thinking-l2': {
    type: EXERCISE_TYPE.JOURNALING,
    title: 'Distortion Labeling',
    goal: 'Examine thoughts for common cognitive biases (thinking traps)',
    instructions: [
      'Select a persistent stressful thought.',
      'Review thinking traps: Catastrophizing, Mind Reading, All-or-Nothing.',
      'Identify which distortions are active in your selected thought.',
      'Explain *why* this thought fits that distortion pattern.'
    ]
  },
  'challenging-negative-thinking-l3': {
    type: EXERCISE_TYPE.JOURNALING,
    title: 'Thought on Trial',
    goal: 'Examine the factual evidence supporting and opposing a negative belief',
    instructions: [
      'Write your negative belief clearly (e.g. "I am bad at this job").',
      'Act as the defense: write all the factual evidence *supporting* the thought.',
      'Act as the prosecution: write all the factual evidence *contradicting* the thought.',
      'Judge the case: what is the objective, balanced truth?'
    ]
  },
  'challenging-negative-thinking-l4': {
    type: EXERCISE_TYPE.JOURNALING,
    title: 'The Reframe Generator',
    goal: 'Brainstorm alternative, realistic explanations for situations',
    instructions: [
      'Describe a situation where someone\'s action upset you.',
      'Write your primary negative interpretation (e.g. "They are ignoring me").',
      'Brainstorm two other realistic explanations (e.g. "They are busy", "They forgot").',
      'Notice how your emotional intensity shifts with these alternatives.'
    ]
  },
  'challenging-negative-thinking-l5': {
    type: EXERCISE_TYPE.JOURNALING,
    title: 'Daily Restructuring Playbook',
    goal: 'Practice daily cognitive restructuring to support flexibility',
    instructions: [
      'State your main negative automatic thought from today.',
      'Identify the cognitive distortion and check the evidence.',
      'Write down a balanced, factual, and supportive reframe.',
      'Rate your belief in the reframe (0% to 100%).'
    ]
  },

  // CBT - Managing Anxiety
  // Lesson 1: Recognizing Anxiety
  'managing-anxiety-l1-ex1': {
    type: EXERCISE_TYPE.JOURNALING,
    title: 'Calming Breath Reset',
    goal: 'Slow down physiological arousal with paced breathing',
    instructions: [
      'Find a comfortable seat and place one hand on your belly.',
      'Inhale slowly through your nose for 4 seconds, feeling your belly expand.',
      'Exhale gently through pursed lips for 6 seconds.',
      'Repeat this cycle for 2 minutes, then note your physical calmness.'
    ]
  },
  'managing-anxiety-l1-ex2': {
    type: EXERCISE_TYPE.JOURNALING,
    title: 'Anxiety Signal Audit',
    goal: 'Audit your typical cognitive and somatic anxiety triggers',
    instructions: [
      'Reflect on the past week and list two situations that triggered anxiety.',
      'For each situation, describe the initial warning sign you noticed.',
      'Did you notice it in your mind (thoughts) or body (sensations) first?',
      'Reflect on how catching triggers early can help you slow down the response.'
    ]
  },
  'managing-anxiety-l1-ex3': {
    type: EXERCISE_TYPE.JOURNALING,
    title: 'Anxiety Compass Log',
    goal: 'Log and demystify anxiety as a biological alarm system',
    instructions: [
      'Write down a recent situation where you felt significant anxiety.',
      'List the exact thoughts and physical sensations you experienced.',
      'Acknowledge the feeling as a survival-driven fight-or-flight response.',
      'Write: "My body was trying to protect me, but there was no actual danger."'
    ]
  },
  'managing-anxiety-l1-ex4': {
    type: EXERCISE_TYPE.JOURNALING,
    title: 'Notice the Alarm',
    goal: 'Observe the rise of anxiety triggers without running away',
    instructions: [
      'Recall a minor upcoming stressor (e.g., an email you need to send).',
      'Close your eyes and visualize starting the task, letting the alert rise.',
      'Instead of immediately avoiding it, sit with the alarm for 1 minute.',
      'Notice that the alarm peaks and slowly begins to fade on its own.'
    ]
  },
  'managing-anxiety-l1-ex5': {
    type: EXERCISE_TYPE.JOURNALING,
    title: 'Alarm System Check',
    goal: 'Evaluate your perception of anxiety as a protector vs a danger',
    instructions: [
      'Rate how dangerous the feeling of anxiety felt to you (1-10) before this lesson.',
      'Rate how dangerous it feels now, knowing it is a safety alarm (1-10).',
      'Explain what changed in your perspective.',
      'Commit to viewing the next anxiety wave as an over-eager alarm, not a threat.'
    ]
  },

  // Lesson 2: Body Awareness
  'managing-anxiety-l2-ex1': {
    type: EXERCISE_TYPE.JOURNALING,
    title: 'Somatic Body Breath',
    goal: 'Direct breath to release localized physical tension',
    instructions: [
      'Close your eyes and locate the area in your body holding the most tension.',
      'Inhale deeply, visualizing the breath flowing directly to that tense space.',
      'Exhale slowly, imagining the tension softening and leaving with your breath.',
      'Repeat this for 5 cycles and describe any physical release.'
    ]
  },
  'managing-anxiety-l2-ex2': {
    type: EXERCISE_TYPE.JOURNALING,
    title: 'Body Scan Audit',
    goal: 'Audit somatic signals of anxiety across your entire body',
    instructions: [
      'Slowly scan your body from your feet up to your jaw.',
      'Identify three distinct physical sensations (e.g., tight shoulders, shallow breathing, butterflies).',
      'Notice if you are actively fighting these sensations or holding your breath.',
      'Gently soften your posture and allow the sensations to exist without resistance.'
    ]
  },
  'managing-anxiety-l2-ex3': {
    type: EXERCISE_TYPE.JOURNALING,
    title: 'Somatic Map Journal',
    goal: 'Describe physical sensations using objective, neutral language',
    instructions: [
      'Focus on a current or recent physical symptom of anxiety.',
      'Describe the sensation objectively (e.g., "tightness in chest", "buzzing in hands").',
      'Avoid alarmist words like "heart attack" or "choking".',
      'Write a neutral statement: "My chest feels tight, and I can still breathe safely."'
    ]
  },
  'managing-anxiety-l2-ex4': {
    type: EXERCISE_TYPE.JOURNALING,
    title: 'Somatic Welcoming',
    goal: 'Sit with physical discomfort to build somatic tolerance',
    instructions: [
      'Locate a physical sensation of anxiety or tension in your body.',
      'Set a timer for 2 minutes and focus your attention entirely on the sensation.',
      'Welcome it by repeating silently: "It is okay for this sensation to be here."',
      'Observe how the physical feeling shifts, spreads, or decreases over time.'
    ]
  },
  'managing-anxiety-l2-ex5': {
    type: EXERCISE_TYPE.JOURNALING,
    title: 'Somatic Tolerance Check',
    goal: 'Evaluate the intensity and safety of physical sensations',
    instructions: [
      'Rate the discomfort of the physical sensation from 1 to 10.',
      'Write down what you learned by observing it without trying to fix it.',
      'Confirm that the sensation did not harm you and was temporary.',
      'Write: "Physical sensations are uncomfortable, but they are safe and survivable."'
    ]
  },

  // Lesson 3: Safety Behaviors
  'managing-anxiety-l3-ex1': {
    type: EXERCISE_TYPE.JOURNALING,
    title: 'Anchored Grounding Breath',
    goal: 'Stabilize attention with paced breathing and sensory anchors',
    instructions: [
      'Inhale for 4 seconds, hold for 4 seconds, and exhale for 4 seconds.',
      'As you breathe, name three physical objects in your room to anchor your eyes.',
      'Notice the physical support of the chair or floor underneath you.',
      'Describe how this combination of breath and grounding affects your focus.'
    ]
  },
  'managing-anxiety-l3-ex2': {
    type: EXERCISE_TYPE.JOURNALING,
    title: 'Safety Behavior Audit',
    goal: 'Identify your common avoidant and escape behaviors',
    instructions: [
      'List three safety behaviors you use to escape anxiety (e.g., checking phone, avoiding eye contact, leaving early).',
      'Explain how each safety behavior makes you feel in the short term.',
      'Explain how each behavior keeps your anxiety alive in the long term.',
      'Select one behavior you want to challenge in this lesson.'
    ]
  },
  'managing-anxiety-l3-ex3': {
    type: EXERCISE_TYPE.JOURNALING,
    title: 'Avoidance Cost Log',
    goal: 'Reflect on the long-term impact of relying on safety behaviors',
    instructions: [
      'Journal about a recent time you avoided a situation due to anxiety.',
      'What did you miss out on or what was the cost of this avoidance?',
      'How does avoiding a situation reinforce the belief that you cannot handle it?',
      'Reflect on how facing discomfort opens up opportunities for freedom.'
    ]
  },
  'managing-anxiety-l3-ex4': {
    type: EXERCISE_TYPE.JOURNALING,
    title: 'Safety Behavior Delay',
    goal: 'Practice delaying avoidant habits to build tolerance to distress',
    instructions: [
      'The next time you feel anxious, identify the safety behavior you want to perform.',
      'Set a timer and commit to delaying that behavior for exactly 5 minutes.',
      'Sit with the discomfort and breathe slowly during the delay.',
      'Notice if the urge to perform the safety behavior decreases after 5 minutes.'
    ]
  },
  'managing-anxiety-l3-ex5': {
    type: EXERCISE_TYPE.JOURNALING,
    title: 'Delay Reflection',
    goal: 'Evaluate the outcome of delaying your safety behavior',
    instructions: [
      'Describe the safety behavior you delayed and how long you delayed it.',
      'Rate your urge to perform the behavior (1-10) before and after the delay.',
      'Did the anxiety decrease naturally without the safety behavior?',
      'Write: "I can feel anxious and delay safety behaviors; my body knows how to calm down on its own."'
    ]
  },

  // Lesson 4: Exposure Planning
  'managing-anxiety-l4-ex1': {
    type: EXERCISE_TYPE.JOURNALING,
    title: 'Box Breathing for Courage',
    goal: 'Calm the nervous system before approaching a challenge',
    instructions: [
      'Prepare to plan an exposure task by box breathing.',
      'Inhale for 4 seconds, hold for 4 seconds, exhale for 4 seconds, hold empty for 4 seconds.',
      'Complete 4 rounds of this box breathing cycle.',
      'Note the sense of physiological stability and focus.'
    ]
  },
  'managing-anxiety-l4-ex2': {
    type: EXERCISE_TYPE.JOURNALING,
    title: 'Exposure Ladder Design',
    goal: 'Design a graded exposure ladder for a specific fear target',
    instructions: [
      'Identify a situation or task you avoid due to anxiety.',
      'Break this situation down into 3-5 progressive steps, from easiest to hardest.',
      'Rate the expected anxiety level (0-100%) for each step on your ladder.',
      'Identify the first step you will take (ideally scoring between 30% and 50% anxiety).'
    ]
  },
  'managing-anxiety-l4-ex3': {
    type: EXERCISE_TYPE.JOURNALING,
    title: 'Expectation Testing Log',
    goal: 'Document predictions and fears before performing exposure',
    instructions: [
      'Write down the exposure task you plan to complete.',
      'What is your specific prediction? (e.g. "If I speak, they will mock me").',
      'What is the worst-case scenario, and how will you cope if it happens?',
      'Write down the actual probability of that worst case occurring.'
    ]
  },
  'managing-anxiety-l4-ex4': {
    type: EXERCISE_TYPE.JOURNALING,
    title: 'Micro-Exposure Run',
    goal: 'Execute a small exposure step and observe actual distress',
    instructions: [
      'Complete the first step of your exposure ladder.',
      'Focus on staying in the situation, breathing slowly, without using safety behaviors.',
      'Note your anxiety level at the start, peak, and end of the exposure.',
      'Wait for the anxiety to decrease by at least 50% before leaving.'
    ]
  },
  'managing-anxiety-l4-ex5': {
    type: EXERCISE_TYPE.JOURNALING,
    title: 'Outcome Comparison',
    goal: 'Evaluate actual exposure results against initial predictions',
    instructions: [
      'Compare what actually happened during the exposure to your prediction.',
      'Did the worst-case scenario occur? Did you cope successfully?',
      'Rate the accuracy of your initial fear from 0% to 100%.',
      'Write: "My mind predicted danger, but the reality was safe and manageable."'
    ]
  },

  // Lesson 5: Recovery Toolkit
  'managing-anxiety-l5-ex1': {
    type: EXERCISE_TYPE.JOURNALING,
    title: 'Calm Integration Breath',
    goal: 'Use physiological sighs to trigger rapid nervous system recovery',
    instructions: [
      'Take a deep inhale through your nose, followed immediately by a quick second sniff.',
      'Exhale slowly and fully through your mouth, letting your entire body relax.',
      'Complete 3 rounds of this double-inhale, slow-exhale sigh.',
      'Reflect on how this breath pattern acts as an instant release valve for stress.'
    ]
  },
  'managing-anxiety-l5-ex2': {
    type: EXERCISE_TYPE.JOURNALING,
    title: 'Anxiety Playbook Mapping',
    goal: 'Consolidate your top somatic, cognitive, and behavioral tools',
    instructions: [
      'Select your most effective somatic tool (e.g., box breathing, body scan).',
      'Select your most effective cognitive tool (e.g., cognitive reframing, reality testing).',
      'Select your primary exposure tool (e.g., safety behavior delay, graded steps).',
      'Map these into a 3-step emergency playbook to use during anxiety spikes.'
    ]
  },
  'managing-anxiety-l5-ex3': {
    type: EXERCISE_TYPE.JOURNALING,
    title: 'Resilience Anchor Journal',
    goal: 'Write a supportive reminder of your capacity to manage distress',
    instructions: [
      'Write a short letter to yourself, to be read when anxiety feels overwhelming.',
      'Remind yourself of what you have learned: anxiety is an alarm, sensations are safe, and you can cope.',
      'Highlight a successful moment from this program where you tolerated discomfort.',
      'End with a strong statement of self-support and trust.'
    ]
  },
  'managing-anxiety-l5-ex4': {
    type: EXERCISE_TYPE.JOURNALING,
    title: 'Daily Exposure Commitment',
    goal: 'Commit to daily micro-exposures to prevent avoidance relapse',
    instructions: [
      'Identify one micro-exposure you can easily perform daily (e.g., asking a question, making eye contact).',
      'How does maintaining a habit of facing minor fears protect your progress?',
      'Write a formal commitment: "I commit to facing minor challenges daily to keep my confidence strong."',
      'Decide on a cue to trigger this daily action.'
    ]
  },
  'managing-anxiety-l5-ex5': {
    type: EXERCISE_TYPE.JOURNALING,
    title: 'Recovery Toolkit Checklist',
    goal: 'Evaluate your confidence in using your anxiety management toolkit',
    instructions: [
      'Rate your confidence (1-10) in your ability to manage future anxiety spikes.',
      'Which tools will you practice regularly to keep them sharp?',
      'Identify one potential obstacle to using your toolkit, and how you will overcome it.',
      'Write: "I am equipped, I am capable, and I am the manager of my own peace."'
    ]
  },

  // CBT - Emotional Regulation
  'emotional-regulation-l1-ex1': {
    type: EXERCISE_TYPE.JOURNALING,
    title: 'Primary Emotions Tracker',
    goal: 'Identify and validate your immediate emotional responses',
    instructions: [
      'Sit quietly and check in with your current feelings.',
      'Identify the primary emotion (Sadness, Anger, Fear, Joy, Shame).',
      'Describe the raw physical sensation of this emotion.',
      'Write: "It is okay to feel [emotion] right now. This feeling is temporary."'
    ]
  },
  'emotional-regulation-l2-ex1': {
    type: EXERCISE_TYPE.JOURNALING,
    title: 'Somatic Welcoming',
    goal: 'Observe and welcome an emotional wave without resistance',
    instructions: [
      'Recall a recent situation where you felt a strong, uncomfortable emotion.',
      'Focus on the physical sensation of that emotion in your body.',
      'Practice breathing space around it, releasing any physical clenching or bracing.',
      'Observe the feeling like a wave, letting it rise and fall without trying to force it away.'
    ]
  },
  'emotional-regulation-l3-ex1': {
    type: EXERCISE_TYPE.JOURNALING,
    title: 'Emotion Wheel Audit',
    goal: 'Translate vague mood states into precise secondary emotions',
    instructions: [
      'Select a vague mood state you felt today (e.g., "bad", "stressed", "off").',
      'Unpack it: are you feeling rejected, overwhelmed, ignored, disappointed, or tired?',
      'Write down the specific secondary emotions you discover.',
      'Reflect on how naming them changes their emotional intensity.'
    ]
  },
  'emotional-regulation-l4-ex1': {
    type: EXERCISE_TYPE.JOURNALING,
    title: 'Somatic Cooling Resets',
    goal: 'Practice physiological resets and the STOP technique',
    instructions: [
      'Identify a physical reset tool to use when emotions spike (e.g. splashing cold water, box breathing).',
      'Map out the STOP steps: Stop, Take a breath, Observe, Proceed.',
      'Write down how your physical tension level changed after visualizing this pause.',
      'Commit to using STOP when your emotional intensity exceeds a 6/10.'
    ]
  },
  'emotional-regulation-l5-ex1': {
    type: EXERCISE_TYPE.JOURNALING,
    title: 'Emotional Dialectic Builder',
    goal: 'Accept intense feelings while committing to values-aligned actions',
    instructions: [
      'Describe a current difficult emotion you are experiencing.',
      'Write a non-judgmental acceptance statement for this feeling.',
      'Write a commitment statement for a helpful action you want to take anyway.',
      'Combine them into a dialectical statement: "I feel [emotion] AND I can still choose to [action]."'
    ]
  },

  // CBT - Building Confidence
  'building-confidence-l1-ex1': {
    type: EXERCISE_TYPE.JOURNALING,
    title: 'Core Belief Audit',
    goal: 'Examine deep-seated assumptions about your self-worth',
    instructions: [
      'Write down a recurring negative self-belief (e.g. "I am not smart enough").',
      'Recall when you first started believing this statement.',
      'List three historical examples that prove this belief is incorrect.',
      'Write a more compassionate, updated version of this belief.'
    ]
  },
  'building-confidence-l1-ex2': {
    type: EXERCISE_TYPE.JOURNALING,
    title: 'Evidence Collection',
    goal: 'Gather factual evidence to challenge negative core beliefs',
    instructions: [
      'Write down a negative core belief you identified in your audit.',
      'List three factual experiences that directly contradict this belief.',
      'Reflect on how you typically dismiss or minimize this counter-evidence.',
      'Write a balanced summary that incorporates both the belief and the evidence.'
    ]
  },
  'building-confidence-l1-ex3': {
    type: EXERCISE_TYPE.JOURNALING,
    title: 'Strength Inventory',
    goal: 'Catalog your personal competencies and inner resources',
    instructions: [
      'List five personal strengths or qualities you possess.',
      'For each strength, describe a specific situation where you used it.',
      'Identify which strength you underuse and why.',
      'Commit to using this underused strength in the next 24 hours.'
    ]
  },
  'building-confidence-l2-ex1': {
    type: EXERCISE_TYPE.JOURNALING,
    title: 'Inner Critic Journal',
    goal: 'Answer harsh self-criticism with supportive self-compassion',
    instructions: [
      'Write down a harsh self-criticism you made today.',
      'Imagine a friend came to you with this exact same concern.',
      'Write down what you would say to support and encourage them.',
      'Direct that exact response back to yourself in writing.'
    ]
  },
  'building-confidence-l2-ex2': {
    type: EXERCISE_TYPE.JOURNALING,
    title: 'Reframe Thoughts',
    goal: 'Transform critical thoughts into balanced, realistic statements',
    instructions: [
      'Capture one critical thought your inner voice repeated today.',
      'Identify the cognitive distortion present (e.g. catastrophizing, labeling).',
      'Write a realistic, neutral alternative to this thought.',
      'Notice how your emotional intensity shifts with the reframed version.'
    ]
  },
  'building-confidence-l2-ex3': {
    type: EXERCISE_TYPE.JOURNALING,
    title: 'Compassion Response',
    goal: 'Develop a habitual compassionate reply to self-judgment',
    instructions: [
      'Recall a moment of self-judgment from the past week.',
      'Write a compassionate phrase you wish you had said to yourself.',
      'Identify the underlying need or fear the judgment was masking.',
      'Design a 3-step compassion ritual to use when the critic appears.'
    ]
  },
  'building-confidence-l3-ex1': {
    type: EXERCISE_TYPE.JOURNALING,
    title: 'Personal Wins',
    goal: 'Identify and document your recent accomplishments',
    instructions: [
      'List three things you have done well or challenges you overcame.',
      'For each, identify the personal strength you used (e.g. perseverance, kindness).',
      'Write down how you can apply one of these strengths in your life today.',
      'Acknowledge your capacity to grow and handle future obstacles.'
    ]
  },
  'building-confidence-l3-ex2': {
    type: EXERCISE_TYPE.JOURNALING,
    title: 'Character Strength Finder',
    goal: 'Identify your top character strengths using real-life evidence',
    instructions: [
      'Review the VIA classification: wisdom, courage, humanity, justice, temperance, transcendence.',
      'Select two categories where you feel naturally strong.',
      'List specific examples from your life that demonstrate these strengths.',
      'Write how you can deliberately use one strength tomorrow.'
    ]
  },
  'building-confidence-l3-ex3': {
    type: EXERCISE_TYPE.JOURNALING,
    title: 'Daily Success Reflection',
    goal: 'Build a nightly habit of recognizing small daily victories',
    instructions: [
      'Scan your day and identify one moment you handled well.',
      'Describe what you did and why it mattered.',
      'Name the quality or skill that helped you succeed.',
      'Express gratitude to yourself for showing up and trying.'
    ]
  },
  'building-confidence-l4-ex1': {
    type: EXERCISE_TYPE.JOURNALING,
    title: 'Values Ranking',
    goal: 'Reinforce self-worth by connecting actions to core values',
    instructions: [
      'Identify one value that is deeply important to you (e.g. honesty, creativity).',
      'Write about a time you acted in alignment with this value.',
      'List one small action you can take today to express this value.',
      'Note how living your values supports your confidence independently of performance.'
    ]
  },
  'building-confidence-l4-ex2': {
    type: EXERCISE_TYPE.JOURNALING,
    title: 'Identity Alignment',
    goal: 'Align your daily actions with your authentic core identity',
    instructions: [
      'Describe the person you want to be at your best.',
      'Identify one area where your current actions conflict with this identity.',
      'Brainstorm one small change to bridge the gap between action and identity.',
      'Write an identity statement: "I am someone who..." based on your values.'
    ]
  },
  'building-confidence-l4-ex3': {
    type: EXERCISE_TYPE.JOURNALING,
    title: 'Purpose Reflection',
    goal: 'Connect your daily efforts to a deeper sense of meaning',
    instructions: [
      'Reflect on what gives your life a sense of direction or purpose.',
      'Describe how your daily routines do or do not serve this purpose.',
      'Identify one value-aligned goal that moves you toward your purpose.',
      'Write a purpose statement that anchors your confidence in meaning.'
    ]
  },
  'building-confidence-l5-ex1': {
    type: EXERCISE_TYPE.JOURNALING,
    title: 'Confidence Action Plan',
    goal: 'Take a small, value-aligned risk to build efficacy',
    instructions: [
      'Define a small action that makes you slightly nervous but aligns with your values.',
      'State when and where you will complete this challenge.',
      'Write down your cope-ahead plan: how will you support yourself regardless of the outcome?',
      'Commit to taking the step and logging the result.'
    ]
  },
  'building-confidence-l5-ex2': {
    type: EXERCISE_TYPE.JOURNALING,
    title: 'Fear Ladder',
    goal: 'Break down a feared situation into manageable, graded steps',
    instructions: [
      'Identify a situation that makes you feel anxious or avoids.',
      'List 5 smaller sub-steps leading up to this situation, from least to most anxiety-provoking.',
      'Choose the first step on your ladder and commit to taking it.',
      'Write a coping statement to repeat when you take this first step.'
    ]
  },
  'building-confidence-l5-ex3': {
    type: EXERCISE_TYPE.JOURNALING,
    title: 'Future Self Letter',
    goal: 'Write a letter from your future confident self to your present self',
    instructions: [
      'Imagine yourself one year from now, having grown in confidence.',
      'Write a letter from this future self to your present self.',
      'Describe what the future self learned, overcame, and now believes.',
      'End with a piece of encouragement and advice for the journey ahead.'
    ]
  },

  // CBT - Healthy Habits
  'healthy-habits-l1-ex1': {
    type: EXERCISE_TYPE.JOURNALING,
    title: 'Habit Mapping',
    goal: 'Deconstruct a daily routine into cue, routine, and reward',
    instructions: [
      'Select a daily habit you want to modify or establish.',
      'Identify the **cue** (time, location, emotional state, or preceding action).',
      'Describe the **routine** (the behavior itself).',
      'Identify the **reward** (what benefit or craving satisfaction does it provide?).'
    ]
  },
  'healthy-habits-l2-ex1': {
    type: EXERCISE_TYPE.JOURNALING,
    title: 'The 2-Minute Rule',
    goal: 'Scale down habits to eliminate starting resistance',
    instructions: [
      'Write down a habit you struggle to start (e.g. exercising daily).',
      'Scale it down to a version that takes 2 minutes or less (e.g. putting on running shoes).',
      'Commit to performing only the 2-minute version for the next 3 days.',
      'Focus purely on showing up consistently rather than the intensity of the work.'
    ]
  },
  'healthy-habits-l3-ex1': {
    type: EXERCISE_TYPE.JOURNALING,
    title: 'Stacking Plan',
    goal: 'Link a new habit to an established routine to automate consistency',
    instructions: [
      'Identify an anchor habit you perform automatically every day (e.g., brewing coffee).',
      'Identify the new habit you want to build.',
      'Create your habit stack formula: "After I [anchor], I will [new habit]."',
      'Specify the reward or positive check-in you will give yourself immediately after.'
    ]
  },
  'healthy-habits-l4-ex1': {
    type: EXERCISE_TYPE.JOURNALING,
    title: 'Resilience Protocol',
    goal: 'Create a recovery plan for setbacks to maintain consistency',
    instructions: [
      'Write down your rule: **"Never miss twice."**',
      'Identify the obstacles that caused you to miss habits in the past.',
      'Formulate an "If-Then" plan: "If [obstacle occurs], then I will [backup micro-habit]."',
      'Acknowledge that showing up partially is always better than not showing up at all.'
    ]
  },
  'healthy-habits-l5-ex1': {
    type: EXERCISE_TYPE.JOURNALING,
    title: 'Identity Integration Playbook',
    goal: 'Align your habits with your core values and desired identity',
    instructions: [
      'State the type of person you want to become (e.g., "I want to be a healthy, active person").',
      'List two small, daily habits that act as physical proof of this identity.',
      'Explain how you will maintain these identity-based habits over the next month.'
    ]
  },

  // Box Breathing
  'box-breathing-l1': {
    type: EXERCISE_TYPE.BREATHING,
    title: 'Foundational Box Breath',
    goal: 'Settle respiratory rhythms using 4-second intervals',
    instructions: [
      'Sit comfortably and let your shoulders drop.',
      'Inhale slowly through your nose for 4 seconds.',
      'Hold your breath with relaxed lungs for 4 seconds.',
      'Exhale gently through your mouth for 4 seconds.',
      'Hold empty for 4 seconds. Repeat the cycle.'
    ],
    completionCriteria: 'Breathe continuously through 4 full box cycles.',
    time: 5
  },
  'box-breathing-l2': {
    type: EXERCISE_TYPE.BREATHING,
    title: 'Hold Expansion',
    goal: 'Extend holds to regulate autonomic carbon dioxide tolerance',
    instructions: [
      'Sit tall and close your eyes.',
      'Follow the expand-hold-shrink-hold circle animation.',
      'Maintain complete physical relaxation during the breath holds.',
      'Allow any physical urge to sigh to pass into slow, controlled exhales.'
    ],
    completionCriteria: 'Maintain the paced holding cycles for 5 minutes.',
    time: 5
  },
  'box-breathing-l3': {
    type: EXERCISE_TYPE.BREATHING,
    title: 'Everyday Integration',
    goal: 'Practice box breathing in high-stress mock situations',
    instructions: [
      'Close your eyes and visualize a challenging upcoming situation.',
      'Begin a slow box breathing cycle (4-4-4-4).',
      'Continue breathing steadily while maintaining the mental image.',
      'Notice how somatic activation declines as you breathe.'
    ],
    completionCriteria: 'Breathe steadily for 5 minutes.',
    time: 5
  },

  // 4-7-8 Breathing
  '4-7-8-breathing-l1': {
    type: EXERCISE_TYPE.BREATHING,
    title: '4-7-8 Foundations',
    goal: 'Activate parasympathetic systems with a paced sigh',
    instructions: [
      'Exhale completely through your mouth with a "whoosh" sound.',
      'Inhale quietly through your nose for 4 seconds.',
      'Hold your breath for a count of 7 seconds.',
      'Exhale completely through your mouth with a "whoosh" for 8 seconds.',
      'Repeat this cycle for 4 breaths total.'
    ],
    completionCriteria: 'Complete 4 full breathing cycles.',
    time: 5
  },
  '4-7-8-breathing-l2': {
    type: EXERCISE_TYPE.BREATHING,
    title: 'Nervous System Tuning',
    goal: 'Down-regulate heart rate and muscle tension',
    instructions: [
      'Sit comfortably, keeping your tongue behind your front teeth.',
      'Inhale for 4 seconds, hold for 7 seconds, and exhale for 8 seconds.',
      'Focus your attention on the feeling of releasing tension during the long exhales.',
      'Allow your body to become heavy and fully relaxed.'
    ],
    completionCriteria: 'Maintain the 4-7-8 rhythm for 4 cycles.',
    time: 5
  },
  '4-7-8-breathing-l3': {
    type: EXERCISE_TYPE.BREATHING,
    title: 'Sleep Transition Reset',
    goal: 'Use breathing cues to transition into restorative sleep',
    instructions: [
      'Lie down in bed and dim the lights.',
      'Perform 4 to 8 cycles of the 4-7-8 breath.',
      'Let your exhalations carry away any residual thoughts from the day.',
      'Allow your breath to return to its natural, soft rhythm as you drift off.'
    ],
    completionCriteria: 'Breathe slowly for 5 minutes.',
    time: 5
  },

  // Calm Reset
  'calm-reset-l1': {
    type: EXERCISE_TYPE.BREATHING,
    title: 'Resonant Flow Reset',
    goal: 'Slow down respiration to 6 breaths per minute to balance stress',
    instructions: [
      'Inhale slowly for 5 seconds as the indicator expands.',
      'Exhale smoothly for 5 seconds as the indicator shrinks.',
      'Maintain a continuous flow with no pauses between breaths.',
      'Focus on the physical expansion and contraction of your chest.'
    ],
    completionCriteria: 'Resonate breathe for 3 minutes.',
    time: 3
  },
  'calm-reset-l2': {
    type: EXERCISE_TYPE.BREATHING,
    title: 'Rapid De-escalation',
    goal: 'Use extended exhales to quickly cool down high-stress moments',
    instructions: [
      'Inhale quickly for 3 seconds.',
      'Exhale slowly and completely for 6 seconds.',
      'Observe the immediate slowing of your heart rate.',
      'Repeat this 1:2 ratio for 3 minutes.'
    ],
    completionCriteria: 'Complete the paced exhalations for 3 minutes.',
    time: 3
  },
  'calm-reset-l3': {
    type: EXERCISE_TYPE.BREATHING,
    title: 'Steady Grounding Anchor',
    goal: 'Establish a stable daily somatic anchor',
    instructions: [
      'Sit comfortably upright and close your eyes.',
      'Begin a slow, deep breathing rhythm (5 seconds in, 5 seconds out).',
      'Feel the support of the chair underneath you with each breath.',
      'Rest in the physical sensation of steady grounding.'
    ],
    completionCriteria: 'Breathe slowly for 5 minutes.',
    time: 5
  },

  // Stress Relief Breathing
  'stress-relief-breathing-l1': {
    type: EXERCISE_TYPE.BREATHING,
    title: 'Deep Diaphragmatic Breath',
    goal: 'Engage the diaphragm to reverse shallow stress breathing',
    instructions: [
      'Place one hand on your chest and one on your belly.',
      'Inhale deeply, feeling only your belly expand.',
      'Exhale slowly, letting your belly sink naturally.',
      'Keep your chest and shoulders still and relaxed.'
    ],
    completionCriteria: 'Breathe diaphragmatically for 5 minutes.',
    time: 5
  },
  'stress-relief-breathing-l2': {
    type: EXERCISE_TYPE.BREATHING,
    title: 'Tension Release Sigh',
    goal: 'Release somatic stress from the body on exhalation',
    instructions: [
      'Inhale deeply through your nose.',
      'Open your mouth and sigh the breath out fully with a relaxed jaw.',
      'With each sigh, imagine tension melting off your shoulders and neck.',
      'Let your muscles become soft and heavy.'
    ],
    completionCriteria: 'Practice tension release breaths for 5 minutes.',
    time: 5
  },
  'stress-relief-breathing-l3': {
    type: EXERCISE_TYPE.BREATHING,
    title: 'Quiet Mind Respiration',
    goal: 'Establish slow, coherent breathing to silence overthinking',
    instructions: [
      'Inhale for 5 seconds, and exhale for 6 seconds.',
      'Observe the empty spaces at the end of each exhalation.',
      'Let your mind rest in those quiet pauses.',
      'Continue breathing with a soft, effortless rhythm.'
    ],
    completionCriteria: 'Maintain the slow breathing for 5 minutes.',
    time: 5
  },

  // Focus Breathing
  'focus-breathing-l1': {
    type: EXERCISE_TYPE.BREATHING,
    title: 'Alertness Activation',
    goal: 'Energize the brain and clear fatigue with rhythmic activation breathing',
    instructions: [
      'Sit upright with a strong, active posture.',
      'Inhale sharply through your nose for 2 seconds.',
      'Exhale rapidly through your nose for 2 seconds.',
      'Perform this energetic cycle rhythmically for 10 breaths, then rest.'
    ],
    completionCriteria: 'Complete 3 activation cycles.',
    time: 3
  },
  'focus-breathing-l2': {
    type: EXERCISE_TYPE.BREATHING,
    title: 'Mind Energizer (Bhastrika)',
    goal: 'Boost alertness and clear brain fog',
    instructions: [
      'Inhale deeply and raise your arms up.',
      'Exhale forcefully through your nose while bringing your fists down to your shoulders.',
      'Maintain an energetic, rhythmic pace.',
      'Settle into a normal, calm breath when completed.'
    ],
    completionCriteria: 'Breathe rhythmically for 3 minutes.',
    time: 3
  },
  'focus-breathing-l3': {
    type: EXERCISE_TYPE.BREATHING,
    title: 'Coherent Focus Reset',
    goal: 'Balance alertness and calm for sustained mental stamina',
    instructions: [
      'Inhale for 4 seconds, pause for 2 seconds.',
      'Exhale for 4 seconds, pause for 2 seconds.',
      'Keep your eyes open and focus your gaze on a single point in front of you.',
      'Maintain this balanced, alert breath.'
    ],
    completionCriteria: 'Breathe with focus for 3 minutes.',
    time: 3
  },

  // Sleep Preparation
  'sleep-preparation-l1': {
    type: EXERCISE_TYPE.BREATHING,
    title: 'Somatic Unwinding',
    goal: 'Release physiological activation from the day',
    instructions: [
      'Sit or lie down in a dim space.',
      'Slowly inhale for 5 seconds.',
      'Exhale gently for 7 seconds, letting your body sink into support.',
      'Allow your jaw, forehead, and shoulders to fully relax.'
    ],
    completionCriteria: 'Breathe slowly for 5 minutes.',
    time: 5
  },
  'sleep-preparation-l2': {
    type: EXERCISE_TYPE.BREATHING,
    title: 'Sleep Activation Breath',
    goal: 'Trigger sleep centers in the brain with extended exhales',
    instructions: [
      'Inhale silently through your nose for 4 seconds.',
      'Exhale very slowly and quietly through your mouth for 8 seconds.',
      'Repeat this cycle, making the breath as soft and effortless as possible.',
      'Let your thoughts float away with each slow release.'
    ],
    completionCriteria: 'Maintain the sleep-triggering breath for 5 minutes.',
    time: 5
  },
  'sleep-preparation-l3': {
    type: EXERCISE_TYPE.BREATHING,
    title: 'Bedtime Transition Flow',
    goal: 'Lock in a nightly wind-down breathing ritual',
    instructions: [
      'Close your eyes and lie down comfortably in bed.',
      'Inhale slowly for 6 seconds, and exhale gently for 6 seconds.',
      'Pause briefly at the end of each breath.',
      'Allow your breathing to become natural and soft as you fall asleep.'
    ],
    completionCriteria: 'Breathe gently for 5 minutes.',
    time: 5
  },

  // Morning Calm
  'morning-calm-l1': {
    type: EXERCISE_TYPE.MEDITATION,
    title: 'Mindful Waking Anchor',
    goal: 'Ground your attention in somatic sensations to start the day',
    instructions: [
      'Find a comfortable seated posture.',
      'Bring your focus to the rising and falling of your chest.',
      'Acknowledge the transition from sleep to waking state.',
      'Rest in the physical sensation of breath in the morning.'
    ],
    completionCriteria: 'Meditate for 10 minutes.',
    time: 10
  },
  'morning-calm-l2': {
    type: EXERCISE_TYPE.MEDITATION,
    title: 'Intention Setting',
    goal: 'Set a positive, value-aligned focus for the day',
    instructions: [
      'Sit comfortably and settle your breathing.',
      'Ask yourself: "How do I want to show up for myself and others today?"',
      'Select one value word (e.g. patience, courage, presence).',
      'Hold this intention in your awareness as you focus on your breath.'
    ],
    completionCriteria: 'Meditate for 10 minutes.',
    time: 10
  },
  'morning-calm-l3': {
    type: EXERCISE_TYPE.MEDITATION,
    title: 'Radiant Day Starter',
    goal: 'Cultivate energy and readiness to meet the day',
    instructions: [
      'Take three deep, energizing breaths.',
      'Visualize yourself handling today\'s tasks with ease and confidence.',
      'Offer yourself a positive affirmation: "I am capable and present."',
      'Open your eyes, ready to step into your day.'
    ],
    completionCriteria: 'Meditate for 10 minutes.',
    time: 10
  },

  // Anxiety Relief Meditation
  'anxiety-relief-meditation-l1': {
    type: EXERCISE_TYPE.MEDITATION,
    title: 'Body Anchor',
    goal: 'Locate a stable physical sensation to anchor your focus',
    instructions: [
      'Find a comfortable posture, placing your feet flat on the floor.',
      'Bring your attention to the contact of your body with the chair.',
      'Feel the weight and stability of this physical connection.',
      'Return to this physical anchor whenever anxious thoughts surge.'
    ],
    completionCriteria: 'Meditate for 10 minutes.',
    time: 10
  },
  'anxiety-relief-meditation-l2': {
    type: EXERCISE_TYPE.MEDITATION,
    title: 'Sky and Clouds Defusion',
    goal: 'Observe thoughts as passing objects, not absolute truth',
    instructions: [
      'Close your eyes and observe the anxious thoughts passing through your mind.',
      'Visualize your mind as the wide, open blue sky.',
      'Imagine your anxious thoughts as passing clouds floating by.',
      'Observe them without holding onto them or pushing them away.'
    ],
    completionCriteria: 'Meditate for 10 minutes.',
    time: 10
  },
  'anxiety-relief-meditation-l3': {
    type: EXERCISE_TYPE.MEDITATION,
    title: 'Softening Resistance',
    goal: 'Release physical resistance and allow feelings to pass',
    instructions: [
      'Acknowledge any tightness or racing heart rate without judgment.',
      'Breathe into these physical sensations, imagining them softening.',
      'Repeat: "This feeling is uncomfortable, but I am safe. It will pass."',
      'Let the sensation exist without fighting it.'
    ],
    completionCriteria: 'Meditate for 10 minutes.',
    time: 10
  },

  // Better Sleep
  'better-sleep-l1': {
    type: EXERCISE_TYPE.MEDITATION,
    title: 'Deep Sleep Body Scan',
    goal: 'Progressively relax body parts to trigger somatic sleep readiness',
    instructions: [
      'Lie down comfortably in bed, ready to sleep.',
      'Bring your attention to your toes, relaxing them completely.',
      'Slowly move your awareness up through your feet, calves, knees, and thighs.',
      'Release any lingering tension in your torso, shoulders, neck, and face.'
    ],
    completionCriteria: 'Complete the full body scan.',
    time: 15
  },
  'better-sleep-l2': {
    type: EXERCISE_TYPE.MEDITATION,
    title: 'Floating Thoughts Imagery',
    goal: 'Release active thoughts to allow the mind to quiet',
    instructions: [
      'Close your eyes and breathe softly.',
      'When an active thought arises, imagine placing it on a leaf.',
      'Watch the leaf float down a gentle stream and disappear.',
      'Do this with every thought, returning to the stream\'s flow.'
    ],
    completionCriteria: 'Meditate for 10 minutes.',
    time: 10
  },
  'better-sleep-l3': {
    type: EXERCISE_TYPE.MEDITATION,
    title: 'Surrendered Rest',
    goal: 'Transition into deep resting states',
    instructions: [
      'Let go of any effort to control your breath.',
      'Feel the weight of your body fully supported by the mattress.',
      'Allow your mind to drift naturally without trying to achieve anything.',
      'Let sleep arrive on its own terms.'
    ],
    completionCriteria: 'Meditate for 15 minutes.',
    time: 15
  },

  // Focus Training
  'focus-training-l1': {
    type: EXERCISE_TYPE.MEDITATION,
    title: 'Focus Anchor',
    goal: 'Train focus by keeping attention on the breath',
    instructions: [
      'Find a comfortable, alert seated posture.',
      'Focus attention on the physical sensation of breath at your nostrils.',
      'Observe the coolness as you inhale, and the warmth as you exhale.',
      'Keep your attention fixed on this small point.'
    ],
    completionCriteria: 'Meditate for 10 minutes.',
    time: 10
  },
  'focus-training-l2': {
    type: EXERCISE_TYPE.MEDITATION,
    title: 'Distraction Labeler',
    goal: 'Label distractions neutrally and return to focus',
    instructions: [
      'Focus on your breath anchor.',
      'When your mind wanders, note it neutrally: say "thinking" or "feeling".',
      'Gently, without self-blame, redirect your focus back to the breath.',
      'Repeat this cycle of noticing, labeling, and returning.'
    ],
    completionCriteria: 'Meditate for 10 minutes.',
    time: 10
  },
  'focus-training-l3': {
    type: EXERCISE_TYPE.MEDITATION,
    title: 'Mental Stamina Builder',
    goal: 'Build attentional endurance over a sustained period',
    instructions: [
      'Maintain your breath focus for an extended duration.',
      'Notice any restlessness or boredom that arises.',
      'Observe these states as temporary mind waves, and return to focus.',
      'Strengthen your attention span through persistence.'
    ],
    completionCriteria: 'Meditate for 10 minutes.',
    time: 10
  },

  // Self Compassion
  'self-compassion-l1': {
    type: EXERCISE_TYPE.JOURNALING,
    title: 'Loving-Kindness Practice',
    goal: 'Cultivate friendly, accepting attitudes toward yourself',
    instructions: [
      'Find a comfortable posture and place a hand over your heart.',
      'Bring to mind a mental picture of yourself.',
      'Offer yourself warm support: "May I be safe, happy, and live with ease."',
      'Breathe into the warmth of these wishes.'
    ],
    completionCriteria: 'Complete all steps of the guided journal.',
    time: 8
  },
  'self-compassion-l2': {
    type: EXERCISE_TYPE.JOURNALING,
    title: 'Softening Inner Critic',
    goal: 'Soften critical self-talk using empathetic phrases',
    instructions: [
      'Recall a recent mistake or failure that made you criticize yourself.',
      'Imagine how you would support a dear friend facing the same struggle.',
      'Offer yourself that same warmth, support, and friendship.',
      'Let go of the critical narrative.'
    ],
    completionCriteria: 'Complete all steps of the guided journal.',
    time: 8
  },
  'self-compassion-l3': {
    type: EXERCISE_TYPE.JOURNALING,
    title: 'Embracing Imperfection',
    goal: 'Accept your limitations with kindness',
    instructions: [
      'Reflect on a personal flaw or mistake that triggers feelings of inadequacy.',
      'Acknowledge that imperfection is part of the shared human experience.',
      'Offer yourself self-acceptance and let go of perfectionism.',
      'Breathe into the feeling of self-acceptance.'
    ],
    completionCriteria: 'Complete all steps of the guided journal.',
    time: 8
  },
  'self-compassion-l4': {
    type: EXERCISE_TYPE.JOURNALING,
    title: 'Common Humanity Map',
    goal: 'Connect personal struggles to the shared human experience',
    instructions: [
      'Write down a recent struggle or self-doubt.',
      'Reflect on how many other people in the world feel this exact way right now.',
      'Acknowledge that struggle is a normal, healthy part of being human.',
      'Write a grounding statement of shared connection.'
    ],
    completionCriteria: 'Complete all steps of the guided journal.',
    time: 8
  },
  'self-compassion-l5': {
    type: EXERCISE_TYPE.JOURNALING,
    title: 'Self-Compassion Integration',
    goal: 'Build a go-to self-compassion break ritual for moments of stress',
    instructions: [
      'Select a persistent daily stressor.',
      'Apply the three components: Mindfulness, Common Humanity, and Self-Kindness.',
      'Design a 2-minute self-compassion break response.',
      'Commit to practicing this tool the next time stress arises.'
    ],
    completionCriteria: 'Complete all steps of the guided journal.',
    time: 8
  },

  // CBT - Resilience
  'resilience-l1': {
    type: EXERCISE_TYPE.JOURNALING,
    title: 'Resilient Reframe',
    goal: 'Shift from a fixed mindset to a growth mindset under stress',
    instructions: [
      'Identify a recent setback or challenge you faced.',
      'Acknowledge your negative thoughts about this challenge.',
      'Reframe the challenge as feedback and an opportunity to learn.',
      'List one positive action step you can take next.'
    ],
    completionCriteria: 'Complete all steps of the guided journal.',
    time: 8
  },
  'resilience-l2': {
    type: EXERCISE_TYPE.JOURNALING,
    title: 'Optimistic Explanation',
    goal: 'Practice seeing challenges as temporary and specific',
    instructions: [
      'Write down a recent negative event that occurred.',
      'Audit your internal explanation of why it happened.',
      'Rewrite the event as temporary (not permanent) and specific (not pervasive).',
      'Acknowledge your capability to move past it.'
    ],
    completionCriteria: 'Complete all steps of the guided journal.',
    time: 8
  },
  'resilience-l3': {
    type: EXERCISE_TYPE.JOURNALING,
    title: 'Locus of Control Audit',
    goal: 'Distinguish between controllable and uncontrollable stressors',
    instructions: [
      'Identify a current situation causing you stress or worry.',
      'List the aspects of the situation that are outside of your control.',
      'List the aspects of the situation that you *can* control.',
      'Formulate one action step focusing only on what you can control.'
    ],
    completionCriteria: 'Complete all steps of the guided journal.',
    time: 8
  },
  'resilience-l4': {
    type: EXERCISE_TYPE.JOURNALING,
    title: 'Stress Hardiness Planner',
    goal: 'Incorporate daily micro-recovery activities to build reserves',
    instructions: [
      'Audit your current daily energy levels and stress points.',
      'Brainstorm three micro-recovery activities that take under 5 minutes.',
      'Schedule these activities into your typical day.',
      'Commit to preserving this space for your mental health.'
    ],
    completionCriteria: 'Complete all steps of the guided journal.',
    time: 8
  },
  'resilience-l5': {
    type: EXERCISE_TYPE.JOURNALING,
    title: 'Resilience Playbook Builder',
    goal: 'Create an emergency playbook for handling future life storms',
    instructions: [
      'Reflect on the key tools of resilience you have learned.',
      'Write down your primary grounding thought for times of stress.',
      'Outline your immediate action steps when a setback occurs.',
      'List the people or resources you can reach out to for support.'
    ],
    completionCriteria: 'Complete all steps of the guided journal.',
    time: 8
  },

  // Mindfulness Basics
  'mindfulness-basics-l1': {
    type: EXERCISE_TYPE.MEDITATION,
    title: 'Breath Awareness',
    goal: 'Observe the breath simply as it is, without controlling it',
    instructions: [
      'Sit comfortably and close your eyes.',
      'Observe the natural flow of your breath. Do not force it.',
      'Notice the pauses between the inhalation and exhalation.',
      'Rest in simple, effortless awareness.'
    ],
    completionCriteria: 'Meditate for 10 minutes.',
    time: 10
  },
  'mindfulness-basics-l2': {
    type: EXERCISE_TYPE.MEDITATION,
    title: 'Somatic Check-in',
    goal: 'Anchor attention in raw physical sensations',
    instructions: [
      'Bring your attention to your physical body.',
      'Scan from your head to your feet, observing sensations of weight and touch.',
      'Feel the air on your skin, and the support of the chair.',
      'Observe everything objectively, without labeling it as good or bad.'
    ],
    completionCriteria: 'Meditate for 10 minutes.',
    time: 10
  },
  'mindfulness-basics-l3': {
    type: EXERCISE_TYPE.MEDITATION,
    title: 'Living Mindfully',
    goal: 'Bring presence into daily actions and sensory contact',
    instructions: [
      'Open your eyes and tune into the sounds around you.',
      'Observe colors, shapes, and textures in your environment without labeling.',
      'Practice bringing this same open, sensory presence into your next task.',
      'Rest in the present moment.'
    ],
    completionCriteria: 'Meditate for 10 minutes.',
    time: 10
  },

  // Guided Journaling
  'guided-journaling-l1': {
    type: EXERCISE_TYPE.JOURNALING,
    title: 'Mental Download',
    goal: 'Empty your mind by writing freely',
    instructions: [
      'Set aside all distractions and prepare to write.',
      'Write continuously about whatever is on your mind. Do not filter.',
      'Don\'t worry about spelling or grammar; just let the words flow.',
      'Write until your mind feels lighter.'
    ],
    time: 10
  },
  'guided-journaling-l2': {
    type: EXERCISE_TYPE.JOURNALING,
    title: 'Emotion Map Log',
    goal: 'Trace complex feelings to boundaries and needs',
    instructions: [
      'Describe your dominant emotion right now.',
      'Write about what triggered this feeling today.',
      'Identify what boundary or personal need this emotion is pointing to.',
      'Formulate one constructive action to support this need.'
    ],
    time: 10
  },
  'guided-journaling-l3': {
    type: EXERCISE_TYPE.JOURNALING,
    title: 'Future Vision Script',
    goal: 'Align daily actions with your future self',
    instructions: [
      'Visualize yourself six months from now, feeling healthy and aligned.',
      'Describe your morning routine, your work day, and your evenings in detail.',
      'Identify the main value driving this future version of you.',
      'Write down one micro-habit you can practice tomorrow to align with this vision.'
    ],
    time: 10
  },

  // Gratitude Practice
  'gratitude-practice-l1': {
    type: EXERCISE_TYPE.GRATITUDE,
    title: 'Three Daily Blessings',
    goal: 'Scan for and appreciate positive daily events',
    instructions: [
      'Write down three positive things that happened in the last 24 hours.',
      'For each, describe *why* it happened and how it made you feel.',
      'Acknowledge any person who contributed to these moments.'
    ],
    time: 5
  },
  'gratitude-practice-l2': {
    type: EXERCISE_TYPE.GRATITUDE,
    title: 'Micro-Gratitude Tracker',
    goal: 'Find appreciation in small, routine sensory details',
    instructions: [
      'Identify three ordinary things you usually ignore (e.g. coffee, warm water).',
      'Reflect on how these elements improve your quality of life.',
      'Write a brief note of appreciation for each item.'
    ],
    time: 5
  },
  'gratitude-practice-l3': {
    type: EXERCISE_TYPE.GRATITUDE,
    title: 'Appreciation Draft',
    goal: 'Cultivate gratitude for key relationships',
    instructions: [
      'Think of a person who has supported or helped you recently.',
      'Draft a short message expressing exactly what they did and why you appreciate it.',
      'Reflect on how focusing on their kindness shifts your perspective.',
      'Consider sending the message to them.'
    ],
    time: 5
  },

  // Emotional Reflection
  'emotional-reflection-l1': {
    type: EXERCISE_TYPE.JOURNALING,
    title: 'Name Your State',
    goal: 'Develop emotional awareness by labeling feelings',
    instructions: [
      'Sit quietly for a moment. What is the main feeling present?',
      'Use specific emotional labels (e.g. anxious, disappointed, grateful).',
      'Describe the physical sensations associated with this emotion.',
      'Reflect on the message this feeling is bringing you.'
    ],
    time: 10
  },
  'emotional-reflection-l2': {
    type: EXERCISE_TYPE.JOURNALING,
    title: 'Trigger Map',
    goal: 'Connect daily events to mood shifts',
    instructions: [
      'Identify a moment today when your mood changed.',
      'Describe the event or thought that triggered this shift.',
      'Reflect on how you held this mood in your body.',
      'Write down how you would like to handle this trigger next time.'
    ],
    time: 10
  },
  'emotional-reflection-l3': {
    type: EXERCISE_TYPE.JOURNALING,
    title: 'Tension Write-Off',
    goal: 'Release residual emotional energy through writing',
    instructions: [
      'Write down any frustration, resentment, or worry you are carrying.',
      'Write continuously, expressing all raw thoughts.',
      'Once finished, write: "I release this energy. I am in control of my peace."',
      'Define one physical activity to complete the release.'
    ],
    time: 10
  },

  // Goal Setting
  'goal-setting-l1': {
    type: EXERCISE_TYPE.JOURNALING,
    title: 'Values Alignment Planner',
    goal: 'Ensure goals align with core personal values',
    instructions: [
      'Identify your top personal value (e.g., health, growth, kindness).',
      'Write down your main focus goal.',
      'Analyze how this goal supports your identified value.',
      'Rephrase your goal to reflect this value connection.'
    ],
    time: 10
  },
  'goal-setting-l2': {
    type: EXERCISE_TYPE.JOURNALING,
    title: 'Micro Habit Blueprint',
    goal: 'Deconstruct goals into small daily habit steps',
    instructions: [
      'Select a goal you want to achieve.',
      'Break it down into the smallest possible daily habit.',
      'Create your trigger stack: "When [cue], I will [micro habit]."',
      'Commit to a tracking method.'
    ],
    time: 10
  },
  'goal-setting-l3': {
    type: EXERCISE_TYPE.JOURNALING,
    title: 'Review System Setup',
    goal: 'Design a simple weekly accountability checklist',
    instructions: [
      'Define when and where you will review your habit progress.',
      'Outline three questions to ask yourself: what went well, what was hard, what will I adjust?',
      'Commit to a supportive, compassionate self-review style.'
    ],
    time: 10
  },

  // Weekly Review
  'weekly-review-l1': {
    type: EXERCISE_TYPE.JOURNALING,
    title: 'Wins & Consistency Audit',
    goal: 'Celebrate successes and evaluate habit execution',
    instructions: [
      'List three wins or successes from your week.',
      'Review your habit execution consistency percentage.',
      'Acknowledge the effort you put in, regardless of the completion rate.'
    ],
    time: 10
  },
  'weekly-review-l2': {
    type: EXERCISE_TYPE.JOURNALING,
    title: 'Friction Analysis',
    goal: 'Learn from weekly setbacks and plan adaptations',
    instructions: [
      'Identify the main challenge or friction point from this week.',
      'Analyze why it was difficult.',
      'Write down one adjustment to make this habit easier next week.'
    ],
    time: 10
  },
  'weekly-review-l3': {
    type: EXERCISE_TYPE.JOURNALING,
    title: 'Intentional Week Planner',
    goal: 'Set clear objectives and intentions for the upcoming week',
    instructions: [
      'Select one value focus for the week ahead.',
      'Commit to three specific habit targets.',
      'Write a brief motivational message to your future self.'
    ],
    time: 10
  },

  // Daily Reset
  'daily-reset-l1': {
    type: EXERCISE_TYPE.JOURNALING,
    title: 'Mid-Day Grounding',
    goal: 'Pause and ground attention during daily tasks',
    instructions: [
      'Take three slow, deep breaths.',
      'Check in with your body and release any tension in your jaw or shoulders.',
      'Write down one priority intention for the rest of your day.'
    ],
    time: 10
  },
  'daily-reset-l2': {
    type: EXERCISE_TYPE.JOURNALING,
    title: 'Transition Write-off',
    goal: 'Release daily mental tension before resting',
    instructions: [
      'Write down any pending work tasks or worries from today.',
      'Write: "I am parking these items for tomorrow. My day is done."',
      'Commit to fully logging off for the evening.'
    ],
    time: 10
  },
  'daily-reset-l3': {
    type: EXERCISE_TYPE.JOURNALING,
    title: 'Daily Close Reflection',
    goal: 'Conclude the day with appreciation and rest intentions',
    instructions: [
      'Write down one thing that went well today.',
      'Acknowledge your efforts and progress.',
      'Set a gentle intention for relaxation and restorative sleep.'
    ],
    time: 10
  }
};

export const DEFAULT_EXERCISES: Exercise[] = DEFAULT_LESSONS.flatMap((lesson) => {
  return lesson.exerciseIds.map((exId) => {
    const custom = CUSTOM_EXERCISES[exId] || CUSTOM_EXERCISES[lesson.id];

    const type = custom?.type || EXERCISE_TYPE.JOURNALING;
    const title = custom?.title || lesson.title;
    const goal = custom?.goal || 'Track automatic thoughts and emotional responses';
    const instructions = custom?.instructions || [
      'Take a moment to close your eyes and check in with yourself.',
      'Write down the situation you were in when you noticed a shift in your mood.',
      'Identify the exact thought passing through your mind.',
      'Rate the intensity of the emotion associated with that thought from 1-10.'
    ];
    const completionCriteria = custom?.completionCriteria || 'Save your reflection entry to progress.';
    const time = custom?.time || lesson.duration || 5;

    return {
      id: exId,
      lessonId: lesson.id,
      type,
      title,
      description: lesson.description,
      estimatedTime: time,
      content: {},
      sortOrder: 0,
      goal,
      instructions,
      completionCriteria
    };
  });
});

