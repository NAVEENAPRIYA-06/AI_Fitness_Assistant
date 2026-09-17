import {
  UserProfile,
  DailyContext,
  EvolvingUserState,
  BehaviorPatternSummary,
  TodayRecommendation,
  GoalConditionConflict,
  CandidateIntervention,
  EvaluatedCandidate,
  DecisionScoringWeights,
  RecommendationExplanation,
  InterventionActivityType,
  GoalStrategyItem,
  PersonalBehavioralProfile,
  RecommendationHistoryItem,
  DecisionFactorItem
} from '../../src/types/index.js';
import { mlService, AdherenceFeatureVector } from '../ml/mlService.js';
import { db } from '../db/repository.js';
import { formatDateKey } from '../../src/utils/dateUtils.js';

/**
 * Standard Intervention Catalog
 * Contains multi-domain candidate interventions across all 8 supported activity types
 */
export const INTERVENTION_CATALOG: CandidateIntervention[] = [
  // 1. Mobility & Stretching
  {
    id: 'cand-mobility-20',
    activityType: 'Mobility & Stretching',
    title: '20-Min Restorative Spinal Mobility & Decompression Flow',
    durationMinutes: 20,
    intensity: 'low',
    environment: 'home',
    requiredEquipment: ['Yoga mat'],
    goalAlignment: 'Sleep Hygiene, Spinal Decompression & Habit Continuity',
    recoveryDemand: 'low',
    description: 'Cat-cow variations, thoracic extensions, kneeling hip openers, and 90-90 hip flows to restore postural alignment without central fatigue.',
    targetDomain: 'Autonomic Nervous System Recovery & Hip/Spine Decompression',
    category: 'recovery'
  },
  {
    id: 'cand-mobility-15',
    activityType: 'Mobility & Stretching',
    title: '15-Min Thoracic & Posterior Chain Release',
    durationMinutes: 15,
    intensity: 'low',
    environment: 'home',
    requiredEquipment: ['Yoga mat', 'Foam roller'],
    goalAlignment: 'Desk Work Posture Relief & Joint Mobility',
    recoveryDemand: 'low',
    description: 'Targeted myofascial foam rolling of thoracic spine and lats followed by active hamstring and glute flossing.',
    targetDomain: 'Postural Reset & Micro-Recovery',
    category: 'recovery'
  },
  {
    id: 'cand-mobility-neck-15',
    activityType: 'Mobility & Stretching',
    title: '15-Min Desk Worker Neck, Shoulder & Upper Back Reset',
    durationMinutes: 15,
    intensity: 'low',
    environment: 'home',
    requiredEquipment: [],
    goalAlignment: 'Upper Body Tension Release & Postural Alignment',
    recoveryDemand: 'low',
    description: 'Gentle cervical retraction, doorframe pec stretches, wall angels, and prone Y-T-W raises to unlock upper back stiffness.',
    targetDomain: 'Postural Restoration & Zero-Equipment Mobility',
    category: 'recovery'
  },
  {
    id: 'cand-mobility-25',
    activityType: 'Mobility & Stretching',
    title: '25-Min Full-Body Joint Health & Mobility Flow',
    durationMinutes: 25,
    intensity: 'low',
    environment: 'home',
    requiredEquipment: ['Yoga mat'],
    goalAlignment: 'Long-Term Joint Longevity & Range of Motion',
    recoveryDemand: 'low',
    description: 'Deep ankle dorsiflexion, deep goblet squat holds, world greatest stretch, and spinal segmentation to maintain resilient joints.',
    targetDomain: 'Connective Tissue Resilience & Flexibility',
    category: 'recovery'
  },

  // 2. Functional Strength
  {
    id: 'cand-strength-bodyweight-20',
    activityType: 'Functional Strength',
    title: '20-Min Zero-Equipment Full-Body Calisthenics',
    durationMinutes: 20,
    intensity: 'moderate',
    environment: 'home',
    requiredEquipment: [],
    goalAlignment: 'Functional Hypertrophy & Habit Consistency',
    recoveryDemand: 'moderate',
    description: 'Tempo bodyweight squats, push-up variations, reverse lunges, glute bridges, and hollow body holds in clean interval circuits.',
    targetDomain: 'Foundational Neuromuscular Strength & Core Control',
    category: 'workout'
  },
  {
    id: 'cand-strength-band-20',
    activityType: 'Functional Strength',
    title: '20-Min Core & Resistance Band Stability Circuit',
    durationMinutes: 20,
    intensity: 'low',
    environment: 'home',
    requiredEquipment: ['Resistance bands', 'Yoga mat'],
    goalAlignment: 'Lumbopelvic Stability & Movement Quality',
    recoveryDemand: 'low',
    description: 'Glute bridges with band abductions, dead-bugs, bird-dogs, and pallof presses.',
    targetDomain: 'Musculoskeletal Integrity & Postural Endurance',
    category: 'workout'
  },
  {
    id: 'cand-strength-db-posterior-25',
    activityType: 'Functional Strength',
    title: '25-Min Home Dumbbell Strength (Posterior Focus)',
    durationMinutes: 25,
    intensity: 'moderate',
    environment: 'home',
    requiredEquipment: ['Adjustable dumbbells'],
    goalAlignment: 'Posterior Chain Strength & Core Stability',
    recoveryDemand: 'moderate',
    description: 'Controlled tempo Romanian deadlifts, single-arm dumbbell rows, half-kneeling presses, and farmer walks.',
    targetDomain: 'Posterior Chain Hypertrophy & Neuromuscular Tone',
    category: 'workout'
  },
  {
    id: 'cand-strength-db-upper-30',
    activityType: 'Functional Strength',
    title: '30-Min Upper-Body Dumbbell Push & Pull Complex',
    durationMinutes: 30,
    intensity: 'moderate',
    environment: 'home',
    requiredEquipment: ['Adjustable dumbbells'],
    goalAlignment: 'Upper Body Muscular Endurance & Hypertrophy',
    recoveryDemand: 'moderate',
    description: 'Floor press, bent-over rows, overhead seated press, hammer curls, and lateral raises supersetted for time efficiency.',
    targetDomain: 'Upper Body Structural Balance & Muscular Density',
    category: 'workout'
  },
  {
    id: 'cand-strength-db-lower-30',
    activityType: 'Functional Strength',
    title: '30-Min Lower-Body Dumbbell Squat & Hinge Circuit',
    durationMinutes: 30,
    intensity: 'moderate',
    environment: 'home',
    requiredEquipment: ['Adjustable dumbbells'],
    goalAlignment: 'Lower Body Strength & Glute Development',
    recoveryDemand: 'moderate',
    description: 'Goblet squats, Bulgarian split squats, dumbbell RDLs, and calf raises focused on controlled eccentric tempo.',
    targetDomain: 'Lower Limb Strength & Hip Extension Power',
    category: 'workout'
  },
  {
    id: 'cand-strength-gym-45',
    activityType: 'Functional Strength',
    title: '45-Min Progressive Overload Heavy Compound Hypertrophy',
    durationMinutes: 45,
    intensity: 'high',
    environment: 'gym',
    requiredEquipment: ['Barbell & Rack', 'Dumbbells', 'Cable machine'],
    goalAlignment: 'Maximal Strength & 2x Bodyweight Deadlift',
    recoveryDemand: 'high',
    description: 'Heavy barbell deadlifts or squats, barbell rows, dumbbell bench presses, and heavy farmer carries.',
    targetDomain: 'Maximal Neuromuscular Recruitment & Structural Remodeling',
    category: 'workout'
  },
  {
    id: 'cand-strength-gym-35',
    activityType: 'Functional Strength',
    title: '35-Min Gym Functional Dumbbell & Cable Complex',
    durationMinutes: 35,
    intensity: 'moderate',
    environment: 'gym',
    requiredEquipment: ['Dumbbells', 'Cable machine'],
    goalAlignment: 'Athletic Conditioning & Hypertrophy',
    recoveryDemand: 'moderate',
    description: 'Cable face-pulls, dumbbell lunges, cable chest flyes, lat pulldowns, and woodchoppers for total-body athletic tone.',
    targetDomain: 'Hypertrophy & Multi-Planar Functional Strength',
    category: 'workout'
  },
  {
    id: 'cand-strength-core-15',
    activityType: 'Functional Strength',
    title: '15-Min Foundation Core & Pelvic Stability Sequence',
    durationMinutes: 15,
    intensity: 'low',
    environment: 'home',
    requiredEquipment: ['Yoga mat'],
    goalAlignment: 'Trunk Stability & Injury Prevention',
    recoveryDemand: 'low',
    description: 'Deadbugs, bird dogs, side planks, hollow body holds, and glute bridge marches focusing on deep pelvic floor and transverse abdominis activation.',
    targetDomain: 'Core Stability & Low-Barrier Habit Execution',
    category: 'workout'
  },

  // 3. Aerobic Cardio & Running
  {
    id: 'cand-cardio-zone2-35',
    activityType: 'Aerobic Cardio',
    title: '35-Min Aerobic Zone 2 Baseline Run',
    durationMinutes: 35,
    intensity: 'moderate',
    environment: 'outdoor',
    requiredEquipment: ['Running shoes'],
    goalAlignment: 'Cardiovascular Aerobic Base (10K sub-50 min)',
    recoveryDemand: 'moderate',
    description: 'Conversational nasal-breathing pace maintained between 65-75% max heart rate to develop mitochondrial density.',
    targetDomain: 'Mitochondrial Aerobic Base & Capillary Bed Expansion',
    category: 'workout'
  },
  {
    id: 'cand-cardio-jog-20',
    activityType: 'Aerobic Cardio',
    title: '20-Min Low-Stress Aerobic Jog & Strides',
    durationMinutes: 20,
    intensity: 'low',
    environment: 'outdoor',
    requiredEquipment: ['Running shoes'],
    goalAlignment: 'Cardiovascular Aerobic Maintenance & Consistency',
    recoveryDemand: 'low',
    description: 'Gentle conversational jog with 4 easy 15-second rhythm strides at the conclusion.',
    targetDomain: 'Active Hemodynamic Flow & Running Economy',
    category: 'workout'
  },
  {
    id: 'cand-cardio-intervals-45',
    activityType: 'Aerobic Cardio',
    title: '45-Min Outdoor Threshold Intervals (4 x 4 min)',
    durationMinutes: 45,
    intensity: 'high',
    environment: 'outdoor',
    requiredEquipment: ['Running shoes'],
    goalAlignment: 'Cardiovascular Aerobic Base (10K sub-50 min)',
    recoveryDemand: 'high',
    description: '10 min warm-up, 4 blocks of 4-min hard threshold pace at 90% HR max with 2-min active jogging recovery, 7 min cool-down.',
    targetDomain: 'VO2 Max Threshold & Glycolytic Tolerance',
    category: 'workout'
  },
  {
    id: 'cand-cardio-cycle-25',
    activityType: 'Aerobic Cardio',
    title: '25-Min Low-Impact Indoor Cycling / Spin',
    durationMinutes: 25,
    intensity: 'moderate',
    environment: 'home',
    requiredEquipment: ['Stationary bike'],
    goalAlignment: 'Joint-Friendly Aerobic Conditioning',
    recoveryDemand: 'moderate',
    description: 'Steady cadence intervals at 85-95 RPM with progressive resistance to build aerobic stamina without joint impact.',
    targetDomain: 'Non-Impact Cardiovascular Endurance',
    category: 'workout'
  },

  // 4. Walking
  {
    id: 'cand-walk-20',
    activityType: 'Walking',
    title: '20-Min Brisk Neighborhood Cadence Walk',
    durationMinutes: 20,
    intensity: 'low',
    environment: 'outdoor',
    requiredEquipment: [],
    goalAlignment: 'Daily Step Target & Consistent Habit Building',
    recoveryDemand: 'low',
    description: 'Upbeat cadence walk outdoors to stimulate blood circulation and clear daily mental fog.',
    targetDomain: 'Baseline Metabolic Flux & Mental Refreshment',
    category: 'lighter_activity'
  },
  {
    id: 'cand-walk-sunlight-20',
    activityType: 'Walking',
    title: '20-Min Parasympathetic Outdoor Sunlight Walk',
    durationMinutes: 20,
    intensity: 'low',
    environment: 'outdoor',
    requiredEquipment: [],
    goalAlignment: 'Circadian Rhythm Sync & Active Cortisol Clearance',
    recoveryDemand: 'low',
    description: 'Brisk outdoor nasal-breathing walk in natural light to down-regulate acute sympathetic stress and stimulate circadian melatonin rhythm.',
    targetDomain: 'Autonomic Calming & Baseline Energy Flux',
    category: 'lighter_activity'
  },
  {
    id: 'cand-walk-incline-30',
    activityType: 'Walking',
    title: '30-Min Brisk Incline Aerobic Walk',
    durationMinutes: 30,
    intensity: 'moderate',
    environment: 'outdoor',
    requiredEquipment: [],
    goalAlignment: 'Low-Impact Caloric Expenditure & Joint Sparing',
    recoveryDemand: 'low',
    description: 'Steady incline outdoor walk maintaining an elevated brisk pace without orthopedic impact.',
    targetDomain: 'Cardiovascular Circulation & Metabolic Flow',
    category: 'lighter_activity'
  },

  // 5. Yoga
  {
    id: 'cand-yoga-20',
    activityType: 'Yoga',
    title: '20-Min Gentle Vinyasa Restoration & Hip Flow',
    durationMinutes: 20,
    intensity: 'low',
    environment: 'home',
    requiredEquipment: ['Yoga mat'],
    goalAlignment: 'Joint Mobility, Breath Synchronization & Pelvic Reset',
    recoveryDemand: 'low',
    description: 'Slow, fluid sun salutations transitioning into pigeon pose, seated forward fold, and supported bridge pose.',
    targetDomain: 'Connective Tissue Hydration & Vagal Tone',
    category: 'recovery'
  },
  {
    id: 'cand-yoga-30',
    activityType: 'Yoga',
    title: '30-Min Deep Hatha & Myofascial Opening',
    durationMinutes: 30,
    intensity: 'moderate',
    environment: 'home',
    requiredEquipment: ['Yoga mat'],
    goalAlignment: 'Total-Body Flexibility & Core Postural Control',
    recoveryDemand: 'low',
    description: 'Sustained holds in warrior series, triangle pose, low lunge, and spine twists paired with rhythmic 4-count pranayama breathing.',
    targetDomain: 'Fascial Elasticity & Neuromuscular Stillness',
    category: 'recovery'
  },

  // 6. Active Recovery & Breathwork
  {
    id: 'cand-recovery-25',
    activityType: 'Active Recovery',
    title: '25-Min Zone 1 Flushing & Full-Body Mobility Flow',
    durationMinutes: 25,
    intensity: 'low',
    environment: 'home',
    requiredEquipment: ['Yoga mat', 'Foam roller'],
    goalAlignment: 'Active Lymphatic Clearance & Nervous System Restoration',
    recoveryDemand: 'low',
    description: 'Low-effort dynamic joint circles, soft-tissue foam rolling, and effortless light bodyweight flows to flush metabolic waste.',
    targetDomain: 'Blood Flow Acceleration without Neuroendocrine Stress',
    category: 'recovery'
  },
  {
    id: 'cand-rest-15',
    activityType: 'Recovery / Rest',
    title: '15-Min Autonomic Nervous System Breathwork & Deep Reset',
    durationMinutes: 15,
    intensity: 'low',
    environment: 'home',
    requiredEquipment: ['Yoga mat'],
    goalAlignment: 'Sleep Hygiene, Cortisol Down-Regulation & Deep Rest',
    recoveryDemand: 'low',
    description: 'Guided resonant 4-7-8 diaphragmatic breathing followed by structured body-scan relaxation to reset autonomic balance.',
    targetDomain: 'Parasympathetic Activation & Deep Nervous System Reset',
    category: 'recovery'
  },

  // 7. HIIT & High-Density Intervals
  {
    id: 'cand-hiit-tabata-15',
    activityType: 'HIIT',
    title: '15-Min Micro-Interval High-Density Tabata',
    durationMinutes: 15,
    intensity: 'high',
    environment: 'home',
    requiredEquipment: ['Yoga mat'],
    goalAlignment: 'Metabolic Conditioning & Time-Compressed Consistency',
    recoveryDemand: 'high',
    description: '4 rounds of 20s all-out bodyweight movement (air squats, mountain climbers, burpees) followed by 10s rest.',
    targetDomain: 'Anaerobic Alactic Stimulation & Caloric Flux',
    category: 'workout'
  },
  {
    id: 'cand-hiit-kb-25',
    activityType: 'HIIT',
    title: '25-Min Kettlebell / Dumbbell High-Density Intervals',
    durationMinutes: 25,
    intensity: 'high',
    environment: 'home',
    requiredEquipment: ['Adjustable dumbbells'],
    goalAlignment: 'Cardiovascular Work Capacity & Functional Power',
    recoveryDemand: 'high',
    description: 'EMOM (Every Minute on the Minute) circuit alternating dumbbell clean & thrusters, push-up burpees, and kettlebell swings.',
    targetDomain: 'EPOC Caloric Afterburn & Dynamic Power Endurance',
    category: 'workout'
  },

  // 8. Core, Stability & Low-Impact Conditioning (Expanded Variety)
  {
    id: 'cand-core-mat-20',
    activityType: 'Functional Strength',
    title: '20-Min Anti-Rotational Core & Pelvic Alignment',
    durationMinutes: 20,
    intensity: 'moderate',
    environment: 'home',
    requiredEquipment: ['Yoga mat', 'Resistance bands'],
    goalAlignment: 'Trunk Stability & Injury Prevention',
    recoveryDemand: 'moderate',
    description: 'Banded Pallof holds, side plank rotations, deadbugs with contralateral band tension, and bird dogs with tempo isometric pauses.',
    targetDomain: 'Rotational Control & Lumbopelvic Stabilization',
    category: 'workout'
  },
  {
    id: 'cand-core-standing-15',
    activityType: 'Functional Strength',
    title: '15-Min Standing Functional Core & Posture Circuit',
    durationMinutes: 15,
    intensity: 'low',
    environment: 'home',
    requiredEquipment: [],
    goalAlignment: 'Trunk Stability & Postural Endurance',
    recoveryDemand: 'low',
    description: 'Zero-mat standing knee-to-elbow cross reaches, standing marches, balance airplane holds, and torso rotations to decompress the lower back.',
    targetDomain: 'Upright Postural Control & Low-Barrier Habit Execution',
    category: 'workout'
  },
  {
    id: 'cand-strength-band-full-30',
    activityType: 'Functional Strength',
    title: '30-Min Total-Body Loop Band Tension Sculpt',
    durationMinutes: 30,
    intensity: 'moderate',
    environment: 'home',
    requiredEquipment: ['Resistance bands', 'Yoga mat'],
    goalAlignment: 'Joint-Friendly Muscular Tone & Hypertrophy',
    recoveryDemand: 'moderate',
    description: 'Banded overhead squats, banded chest presses, lat pulldowns, lateral monster walks, and banded bicep/tricep finish.',
    targetDomain: 'Accommodating Resistance & Joint Preservation',
    category: 'workout'
  },
  {
    id: 'cand-strength-kettlebell-35',
    activityType: 'Functional Strength',
    title: '35-Min Kettlebell Posterior Power & Hinge Circuit',
    durationMinutes: 35,
    intensity: 'moderate',
    environment: 'home',
    requiredEquipment: ['Kettlebell'],
    goalAlignment: 'Posterior Chain Strength & Core Stability',
    recoveryDemand: 'moderate',
    description: 'Two-hand kettlebell swings, clean-and-press, goblet reverse lunges, and suitcase carries building resilient glutes and shoulders.',
    targetDomain: 'Ballistic Power & Structural Posterior Chain Balance',
    category: 'workout'
  },
  {
    id: 'cand-strength-db-full-40',
    activityType: 'Functional Strength',
    title: '40-Min Full-Body Dumbbell Hypertrophy & Work Capacity',
    durationMinutes: 40,
    intensity: 'high',
    environment: 'home',
    requiredEquipment: ['Adjustable dumbbells', 'Yoga mat'],
    goalAlignment: 'Maximal Strength & Hypertrophy Progression',
    recoveryDemand: 'high',
    description: 'Heavy dumbbell goblet squats, alternating chest presses on mat, bent-over rows, Arnold presses, and Romanian deadlifts.',
    targetDomain: 'Mechanical Tension & Systemic Muscular Development',
    category: 'workout'
  },
  {
    id: 'cand-strength-gym-upper-45',
    activityType: 'Functional Strength',
    title: '45-Min Gym Progressive Upper-Body Push-Pull Split',
    durationMinutes: 45,
    intensity: 'high',
    environment: 'gym',
    requiredEquipment: ['Barbell & Rack', 'Dumbbells', 'Cable machine'],
    goalAlignment: 'Maximal Strength & Structural Balance',
    recoveryDemand: 'high',
    description: 'Incline barbell bench press, lat pulldown cable cascades, seated dumbbell overhead press, and cable face-pull supersets.',
    targetDomain: 'Upper Body Hypertrophy & Muscular Balance',
    category: 'workout'
  },
  {
    id: 'cand-strength-gym-lower-40',
    activityType: 'Functional Strength',
    title: '40-Min Gym Posterior & Leg Strength Developer',
    durationMinutes: 40,
    intensity: 'high',
    environment: 'gym',
    requiredEquipment: ['Barbell & Rack', 'Dumbbells'],
    goalAlignment: 'Maximal Strength & Lower Body Power',
    recoveryDemand: 'high',
    description: 'Barbell back squats, dumbbell Romanian deadlifts, walking dumbbell lunges, and standing calf raises with strict tempo.',
    targetDomain: 'Lower Limb Force Production & Kinetic Chain Durability',
    category: 'workout'
  },
  {
    id: 'cand-strength-calisthenics-30',
    activityType: 'Functional Strength',
    title: '30-Min Intermediate Bodyweight Density Circuit',
    durationMinutes: 30,
    intensity: 'moderate',
    environment: 'home',
    requiredEquipment: [],
    goalAlignment: 'Functional Strength & Calisthenic Control',
    recoveryDemand: 'moderate',
    description: 'Diamond and wide push-ups, jump lunges, slow eccentric single-leg box squats, pike push-ups, and side plank reaches.',
    targetDomain: 'Relative Bodyweight Strength & Core Motor Recruitment',
    category: 'workout'
  },
  {
    id: 'cand-strength-quick-15',
    activityType: 'Functional Strength',
    title: '15-Min Express Full-Body Tone & Isometric Hold',
    durationMinutes: 15,
    intensity: 'low',
    environment: 'home',
    requiredEquipment: [],
    goalAlignment: 'Habit Consistency & Micro-Dosing Strength',
    recoveryDemand: 'low',
    description: 'Wall sits, isometric push-up pauses, glute bridge holds, and prone back extensions for rapid neuromuscular wake-up.',
    targetDomain: 'Low-Friction Habit Momentum & Postural Activation',
    category: 'workout'
  },

  // 9. Aerobic Cardio, Running & Cycling Expansion
  {
    id: 'cand-cardio-run-tempo-30',
    activityType: 'Aerobic Cardio',
    title: '30-Min Outdoor Aerobic Tempo Sustained Run',
    durationMinutes: 30,
    intensity: 'high',
    environment: 'outdoor',
    requiredEquipment: ['Running shoes'],
    goalAlignment: 'Cardiovascular Aerobic Base (10K sub-50 min)',
    recoveryDemand: 'high',
    description: '8-min warm-up, 18-min sustained tempo run at lactate threshold (80-85% HR max), and 4-min cool-down walk.',
    targetDomain: 'Lactate Clearance Kinetics & Aerobic Capacity',
    category: 'workout'
  },
  {
    id: 'cand-cardio-treadmill-35',
    activityType: 'Aerobic Cardio',
    title: '35-Min Gym Incline Treadmill Zone 2 Engine Builder',
    durationMinutes: 35,
    intensity: 'moderate',
    environment: 'gym',
    requiredEquipment: ['Treadmill'],
    goalAlignment: 'Joint-Friendly Aerobic Conditioning',
    recoveryDemand: 'moderate',
    description: 'Constant 6-8% incline power-walk at 3.6-4.2 mph keeping heart rate strictly within Zone 2 for non-impact aerobic endurance.',
    targetDomain: 'Aerobic Base Development & Joint Sparing',
    category: 'workout'
  },
  {
    id: 'cand-cardio-cycle-intervals-20',
    activityType: 'Aerobic Cardio',
    title: '20-Min Express Indoor Cycling Pyramid Intervals',
    durationMinutes: 20,
    intensity: 'moderate',
    environment: 'home',
    requiredEquipment: ['Stationary bike'],
    goalAlignment: 'Cardiovascular Conditioning & Time Efficiency',
    recoveryDemand: 'moderate',
    description: 'Structured 1:1 work-to-rest cadence pyramids alternating high-cadence surges with comfortable spin recoveries.',
    targetDomain: 'Anaerobic Threshold & Cardiovascular Recovery Rate',
    category: 'workout'
  },
  {
    id: 'cand-cardio-run-easy-25',
    activityType: 'Aerobic Cardio',
    title: '25-Min Recovery Trail / Park Aerobic Jog',
    durationMinutes: 25,
    intensity: 'low',
    environment: 'outdoor',
    requiredEquipment: ['Running shoes'],
    goalAlignment: 'Cardiovascular Aerobic Base & Active Flush',
    recoveryDemand: 'low',
    description: 'Relaxed conversational jog on grass or soft trail surface to enhance aerobic enzyme density without skeletal fatigue.',
    targetDomain: 'Low-Impact Hemodynamics & Nature Refreshment',
    category: 'workout'
  },
  {
    id: 'cand-cardio-rower-20',
    activityType: 'Aerobic Cardio',
    title: '20-Min Gym Rowing Ergometer Steady-State Pace',
    durationMinutes: 20,
    intensity: 'moderate',
    environment: 'gym',
    requiredEquipment: ['Rowing machine'],
    goalAlignment: 'Full-Body Aerobic Endurance & Posterior Drive',
    recoveryDemand: 'moderate',
    description: 'Smooth 20-22 strokes/minute rhythm emphasizing powerful leg drive and relaxed breathing across 500m splits.',
    targetDomain: 'Total-Body Aerobic Power & Postural Endurance',
    category: 'workout'
  },
  {
    id: 'cand-cardio-outdoor-40',
    activityType: 'Aerobic Cardio',
    title: '40-Min Outdoor Long Slow Distance (LSD) Aerobic Cruise',
    durationMinutes: 40,
    intensity: 'moderate',
    environment: 'outdoor',
    requiredEquipment: ['Running shoes'],
    goalAlignment: 'Cardiovascular Aerobic Base (10K sub-50 min)',
    recoveryDemand: 'moderate',
    description: 'Continuous aerobic pace on flat terrain with nasal-dominant breathing to maximize fat oxidation efficiency.',
    targetDomain: 'Substrate Utilization & Cardiovascular Longevity',
    category: 'workout'
  },

  // 10. Walking & Non-Impact Movement Expansion
  {
    id: 'cand-walk-lunch-15',
    activityType: 'Walking',
    title: '15-Min Midday Post-Meal Blood Sugar Clearance Walk',
    durationMinutes: 15,
    intensity: 'low',
    environment: 'outdoor',
    requiredEquipment: [],
    goalAlignment: 'Metabolic Health & Glucose Regulation',
    recoveryDemand: 'low',
    description: 'Gentle postprandial walk outdoors to stimulate non-insulin mediated muscle glucose uptake and prevent afternoon fatigue.',
    targetDomain: 'Postprandial Glycemic Control & Active Rest',
    category: 'lighter_activity'
  },
  {
    id: 'cand-walk-indoor-20',
    activityType: 'Walking',
    title: '20-Min Indoor Low-Impact Treadmill Cadence Walk',
    durationMinutes: 20,
    intensity: 'low',
    environment: 'home',
    requiredEquipment: ['Treadmill'],
    goalAlignment: 'Daily Step Target & Consistent Habit Building',
    recoveryDemand: 'low',
    description: 'Consistent 3.0 mph flat walk on home treadmill while listening to an educational podcast or ambient audio.',
    targetDomain: 'Low-Friction Habit Execution & Energy Flux',
    category: 'lighter_activity'
  },
  {
    id: 'cand-walk-nature-35',
    activityType: 'Walking',
    title: '35-Min Nature Trail Cortisol-Reduction Walk',
    durationMinutes: 35,
    intensity: 'low',
    environment: 'outdoor',
    requiredEquipment: [],
    goalAlignment: 'Stress Relief, Mental Clarity & Active Recovery',
    recoveryDemand: 'low',
    description: 'Unhurried green-space walking with intentional sensory focus to down-regulate sympathetic nervous arousal.',
    targetDomain: 'Vagal Nerve Activation & Psychophysiological Reset',
    category: 'lighter_activity'
  },
  {
    id: 'cand-walk-power-25',
    activityType: 'Walking',
    title: '25-Min Outdoor Power Cadence Walk & Arm Swing',
    durationMinutes: 25,
    intensity: 'moderate',
    environment: 'outdoor',
    requiredEquipment: [],
    goalAlignment: 'Low-Impact Caloric Expenditure & Joint Sparing',
    recoveryDemand: 'low',
    description: 'Fast-paced rhythmic stride maintaining 120-130 steps per minute to challenge cardiovascular stamina without running.',
    targetDomain: 'Metabolic Conditioning & Orthopedic Protection',
    category: 'lighter_activity'
  },

  // 11. Mobility & Stretching Expansion
  {
    id: 'cand-mobility-hip-20',
    activityType: 'Mobility & Stretching',
    title: '20-Min Deep Hip Flexor & Pelvic Capsule Restoration',
    durationMinutes: 20,
    intensity: 'low',
    environment: 'home',
    requiredEquipment: ['Yoga mat'],
    goalAlignment: 'Lower Limb Mobility & Lumbar Spine Relief',
    recoveryDemand: 'low',
    description: 'Half-kneeling couch stretch, lizard pose with rotation, 90-90 internal/external rotation switches, and butterfly holds.',
    targetDomain: 'Pelvic Mobility & Sedentary Countermeasure',
    category: 'recovery'
  },
  {
    id: 'cand-mobility-morning-15',
    activityType: 'Mobility & Stretching',
    title: '15-Min Morning Full-Body Awakening & Joint Lubrication',
    durationMinutes: 15,
    intensity: 'low',
    environment: 'home',
    requiredEquipment: [],
    goalAlignment: 'Daily Movement Habit & Morning Energy Flow',
    recoveryDemand: 'low',
    description: 'Gentle spinal waves, standing arm windmills, knee circles, ankle CARs, and gentle side bends right out of bed.',
    targetDomain: 'Synovial Fluid Distribution & Autonomic Awakening',
    category: 'recovery'
  },
  {
    id: 'cand-mobility-shoulders-25',
    activityType: 'Mobility & Stretching',
    title: '25-Min Rotator Cuff, Scapular & Upper Body Flow',
    durationMinutes: 25,
    intensity: 'low',
    environment: 'home',
    requiredEquipment: ['Resistance bands', 'Yoga mat'],
    goalAlignment: 'Upper Body Durability & Overhead Mobility',
    recoveryDemand: 'low',
    description: 'Banded shoulder dislocates, sleeper stretches, prone scapular retractions, and thread-the-needle thoracic rotation.',
    targetDomain: 'Glenohumeral Joint Centration & Thoracic Freedom',
    category: 'recovery'
  },
  {
    id: 'cand-mobility-ankles-15',
    activityType: 'Mobility & Stretching',
    title: '15-Min Ankle Dorsiflexion & Plantar Fascia Durability',
    durationMinutes: 15,
    intensity: 'low',
    environment: 'home',
    requiredEquipment: ['Yoga mat'],
    goalAlignment: 'Running Injury Prevention & Squat Depth Quality',
    recoveryDemand: 'low',
    description: 'Knee-to-wall ankle mobilizations, eccentric calf drops, plantar fascia trigger point rolls, and tibialis raises.',
    targetDomain: 'Lower Extremity Kinetic Chain Durability',
    category: 'recovery'
  },
  {
    id: 'cand-mobility-full-30',
    activityType: 'Mobility & Stretching',
    title: '30-Min Comprehensive Myofascial Release & Deep Flow',
    durationMinutes: 30,
    intensity: 'low',
    environment: 'home',
    requiredEquipment: ['Yoga mat', 'Foam roller'],
    goalAlignment: 'Systemic Recovery & Musculoskeletal Decompression',
    recoveryDemand: 'low',
    description: 'Full-body foam rolling followed by PNF (proprioceptive neuromuscular facilitation) stretching for hamstrings and quads.',
    targetDomain: 'Tissue Compliance & Parasympathetic Tone',
    category: 'recovery'
  },

  // 12. Yoga Expansion
  {
    id: 'cand-yoga-bedtime-15',
    activityType: 'Yoga',
    title: '15-Min Evening Bedtime Yin Yoga for Sleep Hygiene',
    durationMinutes: 15,
    intensity: 'low',
    environment: 'home',
    requiredEquipment: ['Yoga mat'],
    goalAlignment: 'Sleep Support & Parasympathetic Relaxation',
    recoveryDemand: 'low',
    description: 'Supported child pose, reclined butterfly, legs-up-the-wall pose, and supine spinal twists with extended slow exhales.',
    targetDomain: 'Circadian Melatonin Trigger & Central Nervous Quieting',
    category: 'recovery'
  },
  {
    id: 'cand-yoga-flow-25',
    activityType: 'Yoga',
    title: '25-Min Uplifting Sun Salutation & Balance Flow',
    durationMinutes: 25,
    intensity: 'moderate',
    environment: 'home',
    requiredEquipment: ['Yoga mat'],
    goalAlignment: 'Mobility, Balance & Active Mental Focus',
    recoveryDemand: 'low',
    description: 'Sun salutations A & B, warrior II, reverse warrior, tree pose balancing, and seated boat pose core engagement.',
    targetDomain: 'Kinesthetic Proprioception & Dynamic Stability',
    category: 'recovery'
  },
  {
    id: 'cand-yoga-yin-35',
    activityType: 'Yoga',
    title: '35-Min Deep Fascial Release Yin Yoga Practice',
    durationMinutes: 35,
    intensity: 'low',
    environment: 'home',
    requiredEquipment: ['Yoga mat'],
    goalAlignment: 'Deep Fascial Hydration & Stress Reduction',
    recoveryDemand: 'low',
    description: '3-to-4 minute sustained holds in dragon pose, sleeping swan, caterpillar fold, and banana-asana targeting dense connective tissues.',
    targetDomain: 'Fascial Remodeling & Mindfulness Down-Regulation',
    category: 'recovery'
  },

  // 13. Active Recovery & Rest Expansion
  {
    id: 'cand-recovery-cycle-15',
    activityType: 'Active Recovery',
    title: '15-Min Zero-Resistance Flushing Spin',
    durationMinutes: 15,
    intensity: 'low',
    environment: 'home',
    requiredEquipment: ['Stationary bike'],
    goalAlignment: 'Lactate Clearance & Lower Limb Flushing',
    recoveryDemand: 'low',
    description: 'Very light pedal stroke with zero resistance keeping heart rate under 110 BPM to flush leg soreness and promote venous return.',
    targetDomain: 'Cardiovascular Lymphatic Drainage',
    category: 'recovery'
  },
  {
    id: 'cand-recovery-breath-20',
    activityType: 'Recovery / Rest',
    title: '20-Min Guided Box Breathing & Somatic Relaxation',
    durationMinutes: 20,
    intensity: 'low',
    environment: 'home',
    requiredEquipment: ['Yoga mat'],
    goalAlignment: 'Nervous System Recovery, Cortisol Reduction & Deep Rest',
    recoveryDemand: 'low',
    description: '4-second inhale, 4-second hold, 4-second exhale, 4-second pause pattern accompanied by progressive somatic tension release.',
    targetDomain: 'Vagal Stimulation & Neuroendocrine Recovery',
    category: 'recovery'
  },
  {
    id: 'cand-recovery-walk-foam-25',
    activityType: 'Active Recovery',
    title: '25-Min Leisure Stroll & Lower Body Soft-Tissue Roll',
    durationMinutes: 25,
    intensity: 'low',
    environment: 'home',
    requiredEquipment: ['Yoga mat', 'Foam roller'],
    goalAlignment: 'Tissue Quality & Systemic Down-Regulation',
    recoveryDemand: 'low',
    description: '15-minute gentle barefoot walk or garden stroll followed by 10 minutes of gentle calf, quad, and IT band rolling.',
    targetDomain: 'Peripheral Circulation & Myofascial Ease',
    category: 'recovery'
  },

  // 14. HIIT & High-Density Conditioning Expansion
  {
    id: 'cand-hiit-bodyweight-20',
    activityType: 'HIIT',
    title: '20-Min Pure Bodyweight High-Octane Cardio Burner',
    durationMinutes: 20,
    intensity: 'high',
    environment: 'home',
    requiredEquipment: ['Yoga mat'],
    goalAlignment: 'Metabolic Conditioning & Weight Management',
    recoveryDemand: 'high',
    description: '30 seconds work, 30 seconds rest of speed squats, mountain climbers, high knees, skater jumps, and plank jacks for 4 rounds.',
    targetDomain: 'Glycolytic Endurance & Anaerobic Power',
    category: 'workout'
  },
  {
    id: 'cand-hiit-gym-cables-30',
    activityType: 'HIIT',
    title: '30-Min Gym Functional Conditioning & Rower Intervals',
    durationMinutes: 30,
    intensity: 'high',
    environment: 'gym',
    requiredEquipment: ['Rowing machine', 'Dumbbells', 'Cable machine'],
    goalAlignment: 'Metabolic Conditioning & Dynamic Power',
    recoveryDemand: 'high',
    description: 'Supersets of 250m sprint rowing, dumbbell thrusters, cable woodchoppers, and medicine ball slams with 90-second recovery between rounds.',
    targetDomain: 'Anaerobic Power Capacity & Functional Stamina',
    category: 'workout'
  }
];

export class DecisionIntelligenceEngine {
  /**
   * Default multi-factor decision weights
   */
  public static readonly DEFAULT_WEIGHTS: DecisionScoringWeights = {
    suitabilityWeight: 0.30,
    predictedAdherenceWeight: 0.25,
    goalAlignmentWeight: 0.20,
    contextFeasibilityWeight: 0.15,
    behavioralFitWeight: 0.10
  };

  /**
   * Step 3: Candidate Generation
   * Generates a realistic, context-appropriate pool of candidate interventions tailored to:
   * 1. Available time window
   * 2. Available equipment
   * 3. Current environment (home, gym, outdoor)
   * 4. User fitness level (beginner, intermediate, advanced)
   * 5. User primary goal
   * 6. Anti-repetition check against recent recommendations/outcomes
   */
  public generateCandidates(
    context: DailyContext,
    profile: UserProfile,
    state: EvolvingUserState,
    goals: GoalStrategyItem[],
    behavioralProfile?: PersonalBehavioralProfile,
    recentHistory?: RecommendationHistoryItem[]
  ): CandidateIntervention[] {
    const availableTime = context.availableMinutes || 30;
    const currentEnvironment = context.environment || 'home';
    const rawEquipment = context.equipmentAvailable || profile.availableEquipment || ['Yoga mat'];
    const userEquipment = rawEquipment.map(e => e.toLowerCase());
    const fitnessLevel = (profile.fitnessLevel || 'intermediate').toLowerCase();

    // Helper: does the user have equipment for this candidate?
    const hasEquipmentFor = (cand: CandidateIntervention): boolean => {
      if (cand.requiredEquipment.length === 0) return true;
      return cand.requiredEquipment.every(req => {
        const reqLower = req.toLowerCase();
        if (reqLower === 'yoga mat') return true; // mats are ubiquitous or easily substituted
        return userEquipment.some(eq => eq.includes(reqLower) || reqLower.includes(eq));
      });
    };

    // Helper: is environment compatible?
    const isEnvironmentCompatible = (cand: CandidateIntervention): boolean => {
      if (cand.environment === 'any') return true;
      if (currentEnvironment === 'home') {
        // At home: home is ideal; outdoor is accessible; gym is excluded!
        return cand.environment === 'home' || cand.environment === 'outdoor';
      }
      if (currentEnvironment === 'gym') {
        return true; // Everything is accessible at or from gym
      }
      if (currentEnvironment === 'outdoor') {
        return cand.environment === 'outdoor' || cand.requiredEquipment.length === 0;
      }
      return true;
    };

    // Helper: is fitness level compatible?
    const isFitnessLevelCompatible = (cand: CandidateIntervention): boolean => {
      if (fitnessLevel === 'beginner') {
        // Beginners should not be prescribed high-intensity threshold or maximal deadlifts
        if (cand.intensity === 'high') return false;
        if (cand.durationMinutes > 35) return false;
      }
      return true;
    };

    // Primary goal category
    const primaryGoal = goals.find(g => g.priority === 'primary') || goals[0];
    const goalCategory = primaryGoal?.category || profile.primaryGoal || 'general';

    // Anti-repetition: titles of recent sessions to avoid back-to-back duplicate recommendations
    const recentTitles = new Set(
      (recentHistory || []).slice(0, 3).map(h => (h.title || '').toLowerCase().trim())
    );

    // Initial eligible pool matching equipment, environment, and fitness level
    let eligiblePool = INTERVENTION_CATALOG.filter(cand => {
      if (!hasEquipmentFor(cand)) return false;
      if (!isEnvironmentCompatible(cand)) return false;
      if (!isFitnessLevelCompatible(cand)) return false;

      // Duration constraint: don't include sessions that exceed available time by more than 10 mins
      if (cand.durationMinutes > availableTime + 10) return false;

      return true;
    });

    // Fallback if strict filtering is too narrow
    if (eligiblePool.length < 4) {
      eligiblePool = INTERVENTION_CATALOG.filter(cand => {
        if (cand.requiredEquipment.length > 0 && !hasEquipmentFor(cand)) return false;
        if (cand.environment === 'gym' && currentEnvironment === 'home') return false;
        return true;
      });
    }

    const selectedCandidates: CandidateIntervention[] = [];

    // 1. Goal-aligned primary options:
    let goalAligned = eligiblePool.filter(c => {
      if (goalCategory === 'strength') return c.activityType === 'Functional Strength' || c.activityType === 'HIIT';
      if (goalCategory === 'endurance') return c.activityType === 'Aerobic Cardio' || c.activityType === 'Walking';
      if (goalCategory === 'consistency') return c.durationMinutes <= 25;
      if (goalCategory === 'sleep' || goalCategory === 'recovery') return c.activityType === 'Mobility & Stretching' || c.activityType === 'Yoga' || c.activityType === 'Recovery / Rest';
      return true;
    });

    // Penalize / de-duplicate recently used candidates
    goalAligned.sort((a, b) => {
      const aRecent = recentTitles.has(a.title.toLowerCase().trim()) ? 1 : 0;
      const bRecent = recentTitles.has(b.title.toLowerCase().trim()) ? 1 : 0;
      return aRecent - bRecent;
    });

    if (goalAligned.length > 0) {
      selectedCandidates.push(goalAligned[0]);
      if (goalAligned.length > 1) {
        selectedCandidates.push(goalAligned[1]);
      }
    }

    // 2. A Restorative / Mobility / Active Recovery option (vital for acute down-regulation)
    const recoveryOptions = eligiblePool.filter(c =>
      c.activityType === 'Mobility & Stretching' ||
      c.activityType === 'Yoga' ||
      c.activityType === 'Active Recovery' ||
      c.activityType === 'Recovery / Rest'
    );
    recoveryOptions.sort((a, b) => {
      const aRecent = recentTitles.has(a.title.toLowerCase().trim()) ? 1 : 0;
      const bRecent = recentTitles.has(b.title.toLowerCase().trim()) ? 1 : 0;
      return aRecent - bRecent;
    });
    const bestRecovery = recoveryOptions.find(c => !selectedCandidates.some(s => s.id === c.id));
    if (bestRecovery) {
      selectedCandidates.push(bestRecovery);
    }

    // 3. A Low-barrier / Time-compressed option (<= 20m)
    const compactOption = eligiblePool.find(c =>
      c.durationMinutes <= 20 && !selectedCandidates.some(s => s.id === c.id)
    );
    if (compactOption) {
      selectedCandidates.push(compactOption);
    }

    // 4. Fill remaining spots with diverse alternatives from eligible pool
    for (const cand of eligiblePool) {
      if (selectedCandidates.length >= 5) break;
      if (!selectedCandidates.some(s => s.id === cand.id)) {
        selectedCandidates.push(cand);
      }
    }

    // Absolute fallback: if still under 4, add from catalog
    for (const fallback of INTERVENTION_CATALOG) {
      if (selectedCandidates.length >= 4) break;
      if (!selectedCandidates.some(s => s.id === fallback.id)) {
        selectedCandidates.push(fallback);
      }
    }

    return selectedCandidates.slice(0, 5);
  }

  /**
   * Step 4: Health / State Suitability Assessment (0 - 100)
   * Evaluates physiological appropriateness based on autonomic recovery, sleep, fatigue, soreness, and stress.
   */
  public evaluateSuitability(
    candidate: CandidateIntervention,
    context: DailyContext,
    state: EvolvingUserState
  ): { score: number; reasons: string[] } {
    const recoveryScore = context.recoveryScore ?? state.recoveryReadiness ?? 65;
    const sleepHours = context.sleepHours ?? 7.0;
    const fatigueLevel = context.fatigueLevel ?? 5;
    const sorenessLevel = context.sorenessLevel ?? 4;
    const stressLevel = context.stressLevel ?? 5;
    const energyLevel = context.energyLevel ?? 6;

    const reasons: string[] = [];
    let suitability = 70;

    // Check acute deficit condition
    const isDeficit = recoveryScore < 55 || sleepHours < 6.0 || fatigueLevel >= 7;
    // Check primed condition
    const isPrimed = recoveryScore >= 70 && sleepHours >= 7.0 && fatigueLevel <= 4;

    if (candidate.intensity === 'high' || candidate.recoveryDemand === 'high') {
      if (isPrimed) {
        suitability = 92 + (energyLevel >= 7 ? 4 : 0);
        reasons.push('High physiological readiness allows intense, progressive training today.');
      } else {
        suitability = 50 + (recoveryScore - 50) * 0.5 + (energyLevel - 5) * 3 - (fatigueLevel - 5) * 5 - (sorenessLevel - 5) * 4;

        if (recoveryScore < 55) {
          suitability -= (55 - recoveryScore) * 0.8;
          reasons.push(`Recovery score (${recoveryScore}%) is below the safe threshold for high-intensity exertion.`);
        }
        if (sleepHours < 6.2) {
          suitability -= 18;
          reasons.push(`Sleep (${sleepHours.toFixed(1)}h) elevates soft-tissue strain risk.`);
        }
        if (fatigueLevel >= 6) {
          suitability -= (fatigueLevel - 5) * 4;
          reasons.push(`Elevated fatigue (${fatigueLevel}/10) reduces motor control.`);
        }
        if (sorenessLevel >= 6) {
          suitability -= (sorenessLevel - 5) * 3;
          reasons.push(`Muscular soreness (${sorenessLevel}/10) indicates ongoing tissue repair.`);
        }
      }
    } else if (candidate.intensity === 'moderate') {
      if (isPrimed) {
        suitability = 94;
        reasons.push('Excellent recovery readiness supports progressive training volume.');
      } else if (isDeficit) {
        suitability = 55 - (fatigueLevel - 5) * 4;
        reasons.push(`Accumulated fatigue (${fatigueLevel}/10) suggests moderating intensity today.`);
      } else {
        suitability = 76 + (recoveryScore - 50) * 0.25 + (energyLevel - 5) * 2 - (fatigueLevel - 5) * 2;
        reasons.push('Moderate loading maintains steady fitness progression without overtaxing reserves.');
      }
    } else {
      // Low-intensity & Restorative interventions
      if (isDeficit) {
        suitability = 95;
        reasons.push(`Your current recovery (${recoveryScore}%) and sleep (${sleepHours.toFixed(1)}h) indicate active recovery is the optimal choice today.`);
      } else if (isPrimed) {
        // When user is well-rested and primed, restorative mobility is fine as a warm-up, but progressive workouts should be prioritized!
        suitability = 65;
        reasons.push('Supports flexibility, though your high recovery readiness can support a progressive workout.');
      } else {
        suitability = 80;
        reasons.push('Gentle restorative stimulus decompresses joints and supports habit consistency.');
      }
    }

    const finalScore = Math.max(5, Math.min(99, Math.round(suitability)));
    return { score: finalScore, reasons };
  }

  /**
   * Step 5: Goal Alignment Assessment (0 - 100)
   * Evaluates how effectively the candidate advances user's active chronic goals.
   */
  public evaluateGoalAlignment(
    candidate: CandidateIntervention,
    goals: GoalStrategyItem[]
  ): { score: number; reasons: string[] } {
    if (!goals || goals.length === 0) {
      return { score: 70, reasons: ['General fitness and health alignment.'] };
    }

    const reasons: string[] = [];
    let weightedScore = 0;
    let totalWeight = 0;

    for (const goal of goals) {
      const weight = goal.priority === 'primary' ? 0.65 : 0.35;
      totalWeight += weight;

      let match = 50;

      if (goal.category === 'endurance') {
        if (candidate.activityType === 'Aerobic Cardio') {
          match = candidate.intensity === 'high' ? 96 : 92;
          reasons.push(`Directly develops cardiovascular endurance for "${goal.title}".`);
        } else if (candidate.activityType === 'Walking') {
          match = 80;
          reasons.push(`Builds low-impact aerobic base supporting "${goal.title}".`);
        } else if (candidate.activityType === 'Functional Strength') {
          match = 60;
          reasons.push(`Fortifies running durability and muscular endurance.`);
        } else if (candidate.activityType === 'Mobility & Stretching' || candidate.activityType === 'Yoga') {
          match = 55;
          reasons.push(`Maintains joint mobility needed for clean running mechanics.`);
        }
      } else if (goal.category === 'strength') {
        if (candidate.activityType === 'Functional Strength') {
          match = 95;
          reasons.push(`Directly builds muscular strength and power for "${goal.title}".`);
        } else if (candidate.activityType === 'HIIT') {
          match = 72;
          reasons.push(`Supports dynamic work capacity and explosive power.`);
        } else if (candidate.activityType === 'Mobility & Stretching' || candidate.activityType === 'Yoga') {
          match = 55;
          reasons.push(`Preserves range of motion for safe lifting mechanics.`);
        } else {
          match = 45;
        }
      } else if (goal.category === 'sleep' || goal.category === 'consistency' || (goal.category as string) === 'recovery') {
        if (candidate.activityType === 'Mobility & Stretching' || candidate.activityType === 'Recovery / Rest' || candidate.activityType === 'Yoga') {
          match = 95;
          reasons.push(`Promotes nervous system recovery to directly support "${goal.title}".`);
        } else if (candidate.activityType === 'Walking' || candidate.activityType === 'Active Recovery') {
          match = 85;
          reasons.push(`Helps regulate stress levels and supports sleep quality.`);
        } else if (candidate.durationMinutes <= 20) {
          match = 90;
          reasons.push(`Time-accessible format preserves streak consistency.`);
        } else if (candidate.intensity === 'high') {
          match = 30;
          reasons.push(`High intensity may temporarily conflict with "${goal.title}".`);
        }
      }

      weightedScore += match * weight;
    }

    const finalScore = Math.max(10, Math.min(99, Math.round(weightedScore / (totalWeight || 1))));
    return { score: finalScore, reasons: reasons.slice(0, 3) };
  }

  /**
   * Step 6: Personal Behavioral Fit Assessment (0 - 100)
   */
  public evaluateBehavioralFit(
    candidate: CandidateIntervention,
    profile?: PersonalBehavioralProfile,
    summary?: BehaviorPatternSummary
  ): { score: number; reasons: string[]; isAttenuated: boolean } {
    const reasons: string[] = [];

    // Data Sufficiency check: if fewer than 3 outcomes or insufficient data, apply neutral score
    if (!profile || profile.observationCount < 3 || profile.dataSufficiency === 'insufficient') {
      return {
        score: 60,
        reasons: ['Learning your personal habits; neutral habit score applied.'],
        isAttenuated: true
      };
    }

    let fit = profile.overallRecentAdherence || 70;

    // 1. Duration range comparison
    if (candidate.durationMinutes <= 30) {
      fit += 16;
      reasons.push(`Fits your highest completion duration bracket (under 30 minutes).`);
    } else if (candidate.durationMinutes > 40) {
      fit -= 20;
      reasons.push(`Sessions over 40 minutes historically see lower completion.`);
    }

    // 2. Environment completion rate comparison
    if (candidate.environment === 'home') {
      fit += 10;
      reasons.push(`Home workouts match your strongest routine consistency.`);
    } else if (candidate.environment === 'gym') {
      fit -= 14;
      reasons.push(`Gym sessions historically have higher schedule friction.`);
    }

    // 3. Dominant failure barrier mitigation
    if (profile.dominantBarrier.toLowerCase().includes('tired') || profile.dominantBarrier.toLowerCase().includes('fatigue')) {
      if (candidate.intensity === 'low' || candidate.recoveryDemand === 'low') {
        fit += 12;
        reasons.push(`Lower-intensity session prevents triggering your fatigue barrier.`);
      } else if (candidate.intensity === 'high') {
        fit -= 16;
        reasons.push(`High intensity risks triggering your usual fatigue skip pattern.`);
      }
    } else if (profile.dominantBarrier.toLowerCase().includes('time')) {
      if (candidate.durationMinutes <= 20) {
        fit += 14;
        reasons.push(`Compact duration avoids schedule time pressure.`);
      }
    }

    const finalScore = Math.max(10, Math.min(99, Math.round(fit)));
    return { score: finalScore, reasons: reasons.slice(0, 3), isAttenuated: false };
  }

  /**
   * Step 7: Context Feasibility Assessment (0 - 100)
   * Evaluates available time margin, equipment availability, and environmental logistics.
   */
  public evaluateFeasibility(
    candidate: CandidateIntervention,
    context: DailyContext
  ): { score: number; reasons: string[] } {
    const reasons: string[] = [];
    const availableTime = context.availableMinutes || 30;
    const currentEnvironment = context.environment || 'home';
    const rawEquipment = context.equipmentAvailable || ['Yoga mat'];
    const equipmentAvailable = rawEquipment.map(e => e.toLowerCase());

    // 1. Time feasibility
    let timeScore = 100;
    if (candidate.durationMinutes <= availableTime) {
      const margin = availableTime - candidate.durationMinutes;
      timeScore = Math.min(100, 85 + margin * 1.5);
      reasons.push(`Fits comfortably in your ${availableTime}-minute available window (+${margin}m buffer).`);
    } else {
      const deficit = candidate.durationMinutes - availableTime;
      timeScore = Math.max(5, 100 - deficit * 8);
      reasons.push(`Exceeds today's available time (${availableTime}m) by ${deficit} minutes.`);
    }

    // 2. Equipment feasibility
    let equipScore = 100;
    const missingEquip = candidate.requiredEquipment.filter(
      req => {
        const reqLower = req.toLowerCase();
        if (reqLower === 'yoga mat') return false; // readily available/substitutable
        return !equipmentAvailable.some(avail => avail.includes(reqLower) || reqLower.includes(avail));
      }
    );

    if (missingEquip.length > 0) {
      equipScore = 5; // cannot execute without required equipment!
      reasons.push(`Requires equipment you don't have listed: ${missingEquip.join(', ')}.`);
    } else if (candidate.requiredEquipment.length > 0) {
      reasons.push(`All needed equipment is ready.`);
    } else {
      reasons.push('No equipment needed.');
    }

    // 3. Environment feasibility
    let envScore = 100;
    if (candidate.environment !== 'any' && candidate.environment !== currentEnvironment) {
      if (candidate.environment === 'gym' && currentEnvironment === 'home') {
        envScore = 10;
        reasons.push('Requires traveling to a gym while you are currently at home.');
      } else if (candidate.environment === 'outdoor' && currentEnvironment === 'home') {
        envScore = 80;
        reasons.push('Requires stepping outdoors from home.');
      }
    }

    // Weighted context feasibility
    const finalScore = Math.max(5, Math.min(99, Math.round(
      0.50 * timeScore + 0.35 * equipScore + 0.15 * envScore
    )));

    return { score: finalScore, reasons: reasons.slice(0, 3) };
  }

  /**
   * Step 8: Multi-Factor Decision Scoring
   */
  public calculateDecisionScore(
    scores: {
      suitabilityScore: number;
      goalAlignmentScore: number;
      behavioralFitScore: number;
      predictedAdherence: number;
      contextFeasibilityScore: number;
    },
    weights: DecisionScoringWeights = DecisionIntelligenceEngine.DEFAULT_WEIGHTS
  ): {
    finalDecisionScore: number;
    breakdown: {
      suitabilityContribution: number;
      goalAlignmentContribution: number;
      behavioralFitContribution: number;
      predictedAdherenceContribution: number;
      contextFeasibilityContribution: number;
    };
  } {
    const sContrib = scores.suitabilityScore * weights.suitabilityWeight;
    const gContrib = scores.goalAlignmentScore * weights.goalAlignmentWeight;
    const bContrib = scores.behavioralFitScore * weights.behavioralFitWeight;
    const aContrib = scores.predictedAdherence * weights.predictedAdherenceWeight;
    const fContrib = scores.contextFeasibilityScore * weights.contextFeasibilityWeight;

    const total = sContrib + gContrib + bContrib + aContrib + fContrib;

    return {
      finalDecisionScore: Math.round(total * 10) / 10,
      breakdown: {
        suitabilityContribution: Math.round(sContrib * 10) / 10,
        goalAlignmentContribution: Math.round(gContrib * 10) / 10,
        behavioralFitContribution: Math.round(bContrib * 10) / 10,
        predictedAdherenceContribution: Math.round(aContrib * 10) / 10,
        contextFeasibilityContribution: Math.round(fContrib * 10) / 10
      }
    };
  }

  /**
   * Conflict Detection between long-term ambition and acute daily physiological status
   */
  public detectGoalConditionConflict(
    profile: UserProfile,
    context: DailyContext,
    state: EvolvingUserState,
    goals: GoalStrategyItem[] = []
  ): GoalConditionConflict {
    const sleepHours = context.sleepHours ?? 7.0;
    const fatigueLevel = context.fatigueLevel ?? 5;
    const recoveryScore = context.recoveryScore ?? state.recoveryReadiness ?? 65;
    const availableMinutes = context.availableMinutes ?? 30;

    const isSleepDepleted = sleepHours < 6.2;
    const isFatigued = fatigueLevel >= 6;
    const isRecoveryLow = recoveryScore < 55;

    const primaryGoal = goals.find(g => g.priority === 'primary') || {
      title: 'Fitness & Health Progression',
      category: 'general'
    };

    if ((isSleepDepleted || isFatigued) && isRecoveryLow) {
      return {
        hasConflict: true,
        goalName: primaryGoal.title,
        conditionDescription: `Lower sleep (${sleepHours.toFixed(1)}h) and fatigue (${fatigueLevel}/10) brought recovery to ${recoveryScore}%.`,
        severity: 'high',
        conflictExplanation: `Your scheduled workout plan aimed for higher intensity toward "${primaryGoal.title}", but training hard with low recovery increases injury risk and fatigue accumulation.`,
        recommendedResolution: 'Switch to a restorative or low-intensity session today. Resume higher intensity once sleep and recovery rebound.'
      };
    }

    if (availableMinutes < 25) {
      return {
        hasConflict: true,
        goalName: primaryGoal.title,
        conditionDescription: `Available time window is compressed to ${availableMinutes} minutes.`,
        severity: 'moderate',
        conflictExplanation: 'Standard sessions cannot fit into your current schedule without rushing.',
        recommendedResolution: 'Execute a compact 15–20 minute session to maintain consistency without schedule stress.'
      };
    }

    return {
      hasConflict: false,
      goalName: primaryGoal.title,
      conditionDescription: 'Daily readiness and recovery indicators are in a healthy training range.',
      severity: 'low',
      conflictExplanation: 'No conflict between your long-term goals and daily readiness.',
      recommendedResolution: 'Proceed with planned session as scheduled.'
    };
  }

  /**
   * Synthesizes transparent structured explanations
   */
  public generateExplanation(
    selected: EvaluatedCandidate,
    alternatives: EvaluatedCandidate[],
    context: DailyContext,
    goalConflict: GoalConditionConflict,
    weights: DecisionScoringWeights
  ): RecommendationExplanation {
    const keyFactors: string[] = [
      `Fits your ${context.availableMinutes} minutes available today with comfortable pacing buffer.`,
      `Matches your current energy and recovery readiness level.`,
      `Directly supports your primary fitness progress.`,
      `${selected.predictedAdherence}% estimated completion likelihood based on your past activity patterns.`
    ];

    if (selected.requiredEquipment.length === 0) {
      keyFactors.push('Requires zero equipment, eliminating setup barriers.');
    } else {
      keyFactors.push(`Uses your ready home equipment (${selected.requiredEquipment.join(', ')}).`);
    }

    let summary = '';
    if (goalConflict.hasConflict) {
      summary = `Adaptive adjustment applied: Due to ${goalConflict.conditionDescription}, this ${selected.durationMinutes}-minute ${selected.title} was chosen to maintain your routine while protecting recovery.`;
    } else {
      summary = `Recommended to advance your goals within your ${context.availableMinutes}-minute window today, pairing high readiness with strong consistency.`;
    }

    let comparisonVsAlternatives = '';
    if (alternatives.length > 0) {
      const runnerUp = alternatives[0];
      comparisonVsAlternatives = `Chosen ahead of "${runnerUp.title}" because it better matches today's available time, equipment, and recovery readiness.`;
    }

    const sContrib = Math.round(selected.suitabilityScore * weights.suitabilityWeight * 10) / 10;
    const aContrib = Math.round(selected.predictedAdherence * weights.predictedAdherenceWeight * 10) / 10;
    const gContrib = Math.round(selected.goalAlignmentScore * weights.goalAlignmentWeight * 10) / 10;
    const fContrib = Math.round(selected.contextFeasibilityScore * weights.contextFeasibilityWeight * 10) / 10;
    const bContrib = Math.round(selected.behavioralFitScore * weights.behavioralFitWeight * 10) / 10;

    const decisionFactors: DecisionFactorItem[] = [
      {
        factor: 'health_suitability',
        name: 'Health & Readiness Suitability',
        score: selected.suitabilityScore,
        scoreDisplay: Math.round((selected.suitabilityScore / 100) * 100) / 100,
        weight: weights.suitabilityWeight,
        weightPercentage: Math.round(weights.suitabilityWeight * 100),
        contribution: sContrib,
        reason: selected.suitabilityReasons[0] || 'Your current recovery and energy support this session.'
      },
      {
        factor: 'predicted_adherence',
        name: 'Completion Likelihood',
        score: selected.predictedAdherence,
        scoreDisplay: Math.round((selected.predictedAdherence / 100) * 100) / 100,
        weight: weights.predictedAdherenceWeight,
        weightPercentage: Math.round(weights.predictedAdherenceWeight * 100),
        contribution: aContrib,
        reason: selected.predictedAdherence >= 70
          ? 'Your previous habits indicate strong completion likelihood under this time and energy state.'
          : 'Elevated fatigue or limited schedule reduces completion likelihood; scaled conservatively.'
      },
      {
        factor: 'goal_alignment',
        name: 'Goal Alignment',
        score: selected.goalAlignmentScore,
        scoreDisplay: Math.round((selected.goalAlignmentScore / 100) * 100) / 100,
        weight: weights.goalAlignmentWeight,
        weightPercentage: Math.round(weights.goalAlignmentWeight * 100),
        contribution: gContrib,
        reason: selected.goalReasons[0] || 'This session supports your primary fitness and health goals.'
      },
      {
        factor: 'context_feasibility',
        name: 'Schedule & Setup Feasibility',
        score: selected.contextFeasibilityScore,
        scoreDisplay: Math.round((selected.contextFeasibilityScore / 100) * 100) / 100,
        weight: weights.contextFeasibilityWeight,
        weightPercentage: Math.round(weights.contextFeasibilityWeight * 100),
        contribution: fContrib,
        reason: selected.feasibilityReasons[0] || 'The session fits your available time and current location with minimal friction.'
      },
      {
        factor: 'behavioral_fit',
        name: 'Personal Routine Fit',
        score: selected.behavioralFitScore,
        scoreDisplay: Math.round((selected.behavioralFitScore / 100) * 100) / 100,
        weight: weights.behavioralFitWeight,
        weightPercentage: Math.round(weights.behavioralFitWeight * 100),
        contribution: bContrib,
        reason: selected.behavioralReasons[0] || 'Matches your preferred session style and consistency patterns.',
        isAttenuated: weights.isBehavioralWeightAttenuated
      }
    ];

    return {
      summary,
      keyFactors,
      suitabilityExplanation: selected.suitabilityReasons.join(' '),
      behavioralExplanation: selected.behavioralReasons.join(' '),
      adherenceExplanation: `HealthPilot estimates a ${selected.predictedAdherence}% completion likelihood under your current context and schedule. Estimated completion is based on your past habits and is intended to guide sustainable pacing.`,
      conflictExplanation: goalConflict.hasConflict ? goalConflict.conflictExplanation : undefined,
      tradeoffNotice: selected.intensity === 'low'
        ? 'Trade-off: Prioritizes recovery over acute cardiovascular threshold stimulus to protect long-term consistency.'
        : 'Trade-off: Demands adequate hydration and post-session nutrition to support muscular repair.',
      comparisonVsAlternatives,
      decisionFactors,
      decisionWeightsNotice: 'Balanced across physiological readiness, schedule feasibility, and your primary goals.'
    };
  }

  /**
   * Evaluates candidate interventions against multi-factor scoring
   */
  public async evaluateCandidateMatrix(
    candidates: CandidateIntervention[],
    context: DailyContext,
    profile: UserProfile,
    state: EvolvingUserState,
    goals: GoalStrategyItem[],
    behavioralProfile?: PersonalBehavioralProfile,
    behaviorSummary?: BehaviorPatternSummary,
    customWeights?: Partial<DecisionScoringWeights>
  ): Promise<EvaluatedCandidate[]> {
    const isDataInsufficient = !behavioralProfile || behavioralProfile.observationCount < 3 || behavioralProfile.dataSufficiency === 'insufficient';

    let weights: DecisionScoringWeights = {
      ...DecisionIntelligenceEngine.DEFAULT_WEIGHTS,
      ...customWeights
    };

    if (isDataInsufficient) {
      weights = {
        suitabilityWeight: 0.35,
        predictedAdherenceWeight: 0.25,
        goalAlignmentWeight: 0.20,
        contextFeasibilityWeight: 0.18,
        behavioralFitWeight: 0.02,
        isBehavioralWeightAttenuated: true,
        attenuationReason: 'Behavioral history is in baseline learning phase; weight shifted to physiological readiness.'
      };
    }

    const evaluated: EvaluatedCandidate[] = [];

    for (const cand of candidates) {
      // 1. Suitability
      const suit = this.evaluateSuitability(cand, context, state);

      // 2. Goal Alignment
      const goal = this.evaluateGoalAlignment(cand, goals);

      // 3. Behavioral Fit
      const beh = this.evaluateBehavioralFit(cand, behavioralProfile, behaviorSummary);

      // 4. Context Feasibility
      const feas = this.evaluateFeasibility(cand, context);

      // 5. Adherence Prediction via ML Service
      const featureVector: AdherenceFeatureVector = {
        sleepHours: context.sleepHours ?? 7,
        sleepQuality: context.sleepQuality ?? 6,
        energyLevel: context.energyLevel ?? 6,
        fatigueLevel: context.fatigueLevel ?? 5,
        stressLevel: context.stressLevel ?? 5,
        availableMinutes: context.availableMinutes ?? 30,
        candidateDurationMinutes: cand.durationMinutes,
        candidateIntensity: cand.intensity,
        candidateCategory: cand.category || 'workout',
        environment: cand.environment,
        historicalHomeCompletionRate: behaviorSummary?.completionRateHome ?? 75,
        historicalGymCompletionRate: behaviorSummary?.completionRateGym ?? 40,
        baselineAdherenceRate: behaviorSummary?.completionRateOverall ?? 70
      };

      const mlResult = await mlService.predictAdherence(featureVector);

      // 6. Multi-Factor Decision Score
      const scores = {
        suitabilityScore: suit.score,
        goalAlignmentScore: goal.score,
        behavioralFitScore: beh.score,
        predictedAdherence: mlResult.predictedAdherence,
        contextFeasibilityScore: feas.score
      };

      const { finalDecisionScore, breakdown } = this.calculateDecisionScore(scores, weights);

      // 7. Rationale
      const rationale = `${suit.reasons[0] || ''} ${feas.reasons[0] || ''}`.trim();

      evaluated.push({
        ...cand,
        suitabilityScore: suit.score,
        healthSuitabilityScore: suit.score,
        goalAlignmentScore: goal.score,
        behavioralFitScore: beh.score,
        predictedAdherence: mlResult.predictedAdherence,
        contextFeasibilityScore: feas.score,
        finalDecisionScore,
        scoreBreakdown: breakdown,
        rationale,
        suitabilityReasons: suit.reasons,
        feasibilityReasons: feas.reasons,
        goalReasons: goal.reasons,
        behavioralReasons: beh.reasons,
        modelSource: mlResult.modelSource,
        isModelPlaceholder: mlResult.isModelPlaceholder
      });
    }

    // Rank descending by final decision score
    evaluated.sort((a, b) => b.finalDecisionScore - a.finalDecisionScore);

    if (evaluated.length > 0) {
      evaluated[0].isWinner = true;
    }

    return evaluated;
  }

  /**
   * Main recommendation decision engine entry point
   */
  public async generateTodayRecommendation(
    profile: UserProfile,
    context: DailyContext,
    state: EvolvingUserState,
    behaviorSummary: BehaviorPatternSummary,
    goals: GoalStrategyItem[] = [],
    behavioralProfile?: PersonalBehavioralProfile,
    customWeights?: Partial<DecisionScoringWeights>
  ): Promise<TodayRecommendation> {
    const activeGoals = goals.length > 0 ? goals : db.getGoals();
    const activeBehaviorProfile = behavioralProfile || db.getPersonalBehavioralProfile();

    // 1. Conflict Detection
    const goalConflict = this.detectGoalConditionConflict(profile, context, state, activeGoals);

    // Retrieve recent recommendations to prevent repetition
    const recentHistory = db.getRecommendationHistory(profile.id);

    // 2. Candidate Generation
    const rawCandidates = this.generateCandidates(
      context,
      profile,
      state,
      activeGoals,
      activeBehaviorProfile,
      recentHistory
    );

    // 3. Multi-Factor Evaluation Matrix
    const evaluatedCandidates = await this.evaluateCandidateMatrix(
      rawCandidates,
      context,
      profile,
      state,
      activeGoals,
      activeBehaviorProfile,
      behaviorSummary,
      customWeights
    );

    // 4. Winner & Alternatives Selection
    const winner = evaluatedCandidates[0];
    if (!winner) {
      throw new Error('No candidate interventions met the evaluation criteria.');
    }
    const alternatives = evaluatedCandidates.slice(1);

    const primaryFeatureVector: AdherenceFeatureVector = {
      sleepHours: context.sleepHours ?? 7,
      sleepQuality: context.sleepQuality ?? 6,
      energyLevel: context.energyLevel ?? 6,
      fatigueLevel: context.fatigueLevel ?? 5,
      stressLevel: context.stressLevel ?? 5,
      availableMinutes: context.availableMinutes ?? 30,
      candidateDurationMinutes: winner.durationMinutes,
      candidateIntensity: winner.intensity,
      candidateCategory: winner.category || 'workout',
      environment: winner.environment,
      historicalHomeCompletionRate: behaviorSummary?.completionRateHome ?? 75,
      historicalGymCompletionRate: behaviorSummary?.completionRateGym ?? 40,
      baselineAdherenceRate: behaviorSummary?.completionRateOverall ?? 70
    };

    const primaryMLResult = await mlService.predictAdherence(primaryFeatureVector);

    // 5. Configured Weights
    const scoringWeights: DecisionScoringWeights = {
      ...DecisionIntelligenceEngine.DEFAULT_WEIGHTS,
      ...customWeights
    };

    // 6. Structured Explanation
    const explanation = this.generateExplanation(
      winner,
      alternatives,
      context,
      goalConflict,
      scoringWeights
    );

    // 7. Accompanying Actions
    const nutritionAction = {
      title: context.sleepHours < 6.5 ? 'Hydration & Balanced Recovery' : 'Balanced Energy & Protein Intake',
      description: context.sleepHours < 6.5
        ? `Hydrate with 500ml water. Aim for steady hydration throughout the day and avoid late caffeine to support sound sleep tonight.`
        : `Hydrate steadily (aim for ${profile.nutritionGoals[0] || '2.5L/day'}) with whole foods and lean protein post-session.`,
      timing: 'Morning to mid-afternoon'
    };

    const recoveryAction = {
      title: 'Down-Regulation Breathing Protocol',
      description: 'Spend 3–5 minutes taking slow, resonant diaphragmatic breaths post-session to lower heart rate and calm your nervous system.'
    };

    const recId = `rec-${Date.now()}`;
    const timestamp = new Date().toISOString();

    const recommendation: TodayRecommendation = {
      id: recId,
      recommendationId: recId,
      title: winner.title,
      category: winner.category || 'workout',
      activityType: winner.activityType,
      selectedIntervention: winner,
      durationMinutes: winner.durationMinutes,
      duration: winner.durationMinutes,
      intensity: winner.intensity,
      environment: winner.environment,
      targetDomain: winner.targetDomain || winner.goalAlignment,
      predictedAdherence: winner.predictedAdherence,
      healthSuitabilityScore: winner.suitabilityScore,
      suitabilityScore: winner.suitabilityScore,
      goalAlignmentScore: winner.goalAlignmentScore,
      behavioralFitScore: winner.behavioralFitScore,
      contextFeasibilityScore: winner.contextFeasibilityScore,
      finalDecisionScore: winner.finalDecisionScore,
      scoreBreakdown: winner.scoreBreakdown,
      scoringWeights,
      decisionFactors: explanation.decisionFactors,
      shapExplanation: primaryMLResult.shapExplanation,
      whyRecommended: explanation.summary,
      explanation,
      explainabilityFactors: primaryMLResult.attributions,
      goalConflict,
      alternatives,
      allEvaluatedCandidates: evaluatedCandidates,
      nutritionAction,
      recoveryAction,
      timestamp,
      generatedAt: timestamp,
      modelName: primaryMLResult.modelName,
      modelVersion: primaryMLResult.modelVersion,
      dataSourceLabel: primaryMLResult.dataSourceLabel,
      modelSource: primaryMLResult.modelSource,
      isModelPlaceholder: primaryMLResult.isModelPlaceholder,
      limitationNotice: primaryMLResult.limitationNotice,
      predictionSource: primaryMLResult.modelSource === 'python_scikit_learn_service'
        ? 'HealthPilot ML Engine'
        : 'HealthPilot Decision Engine'
    };

    // 8. Auto-persist snapshot to recommendation history
    try {
      const historyRecord: Omit<RecommendationHistoryItem, 'id'> = {
        recommendationId: recId,
        date: formatDateKey(new Date()),
        timestamp,
        title: winner.title,
        activityType: winner.activityType,
        durationMinutes: winner.durationMinutes,
        intensity: winner.intensity,
        environment: winner.environment,
        predictedAdherence: winner.predictedAdherence,
        suitability: winner.suitabilityScore,
        goalAlignmentScore: winner.goalAlignmentScore,
        behavioralFitScore: winner.behavioralFitScore,
        contextFeasibilityScore: winner.contextFeasibilityScore,
        finalDecisionScore: winner.finalDecisionScore,
        status: 'Decision Issued (Awaiting Outcome)',
        context: `Sleep ${context.sleepHours.toFixed(1)}h • Fatigue ${context.fatigueLevel}/10 • ${context.environment} • ${context.availableMinutes}m Available`,
        rationale: winner.rationale,
        explanationSummary: explanation.summary,
        goalConsidered: goalConflict.goalName,
        conflictStatus: goalConflict.hasConflict ? 'Active Acute Conflict' : 'Aligned',
        alternatives,
        modelVersion: primaryMLResult.modelVersion,
        predictionSource: recommendation.predictionSource
      };

      db.recordRecommendationHistory(historyRecord);

      // Also record prediction into prediction ledger
      db.addPredictionRecord({
        userId: profile.id || 'user-001',
        recommendationId: recId,
        recommendationTitle: winner.title,
        predictionProbability: winner.predictedAdherence / 100,
        predictedAdherence: winner.predictedAdherence,
        predictedClass: winner.predictedAdherence >= 50 ? 1 : 0,
        modelName: primaryMLResult.modelName,
        modelVersion: primaryMLResult.modelVersion,
        isBaselineFallback: primaryMLResult.isModelPlaceholder,
        dataSourceLabel: primaryMLResult.dataSourceLabel,
        featureSnapshot: {
          sleep_hours: context.sleepHours,
          energy_level: context.energyLevel,
          fatigue_level: context.fatigueLevel,
          stress_level: context.stressLevel,
          available_minutes: context.availableMinutes,
          recommended_duration_minutes: winner.durationMinutes,
          environment: winner.environment,
          intensity: winner.intensity
        }
      });
    } catch (persistErr) {
      console.error('Non-blocking error recording recommendation history:', persistErr);
    }

    return recommendation;
  }
}

export const decisionEngine = new DecisionIntelligenceEngine();
