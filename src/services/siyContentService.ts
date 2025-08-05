import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy,
  writeBatch,
  setDoc,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { 
  SIYModule,
  SIYExercise,
  SIYUserProfile,
  SIYProgressMetrics,
  SIYLearningPath,
  SIYJournalEntry,
  SIYAssessmentResult,
  SIYInstruction,
  SIYInteractiveElement,
  MeditationSession,
  GuidedScript,
  AudioFile,
  Difficulty
} from '../types/content';

export class SIYContentService {
  
  // Collections
  private readonly SIY_MODULES_COLLECTION = 'siy_modules';
  private readonly SIY_EXERCISES_COLLECTION = 'siy_exercises';
  private readonly SIY_USER_PROFILES_COLLECTION = 'siy_user_profiles';
  private readonly SIY_PROGRESS_COLLECTION = 'siy_progress';
  private readonly SIY_LEARNING_PATHS_COLLECTION = 'siy_learning_paths';
  private readonly SIY_JOURNAL_COLLECTION = 'siy_journal';
  private readonly SIY_ASSESSMENTS_COLLECTION = 'siy_assessments';

  /**
   * MODULE MANAGEMENT
   */
  
  async getSIYModules(category?: 'siy-attention' | 'siy-awareness' | 'siy-regulation' | 'siy-empathy' | 'siy-social' | 'siy-happiness' | 'siy-workplace'): Promise<SIYModule[]> {
    try {
      let q = query(collection(db, this.SIY_MODULES_COLLECTION), orderBy('order'));
      
      if (category) {
        q = query(q, where('category', '==', category));
      }

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      })) as SIYModule[];
      
    } catch (error) {
      console.error('Error fetching SIY modules:', error);
      throw new Error('Failed to fetch SIY modules');
    }
  }

  async getSIYModule(moduleId: string): Promise<SIYModule | null> {
    try {
      const docRef = doc(db, this.SIY_MODULES_COLLECTION, moduleId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data(),
          createdAt: docSnap.data().createdAt?.toDate(),
          updatedAt: docSnap.data().updatedAt?.toDate()
        } as SIYModule;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching SIY module:', error);
      throw new Error('Failed to fetch SIY module');
    }
  }

  async getSIYExercises(moduleId?: string): Promise<SIYExercise[]> {
    try {
      let q = query(collection(db, this.SIY_EXERCISES_COLLECTION), orderBy('order'));
      
      if (moduleId) {
        q = query(q, where('moduleId', '==', moduleId));
      }

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      })) as SIYExercise[];
      
    } catch (error) {
      console.error('Error fetching SIY exercises:', error);
      throw new Error('Failed to fetch SIY exercises');
    }
  }

  /**
   * CONTENT GENERATION METHODS
   */
  
  async populateSIYContent(): Promise<{ success: boolean; message: string; counts: Record<string, number> }> {
    try {
      const batch = writeBatch(db);
      const counts = { modules: 0, exercises: 0, learningPaths: 0 };

      // Generate Attention Training Module
      const attentionModules = await this.generateAttentionTrainingModules();
      for (const module of attentionModules) {
        const moduleRef = doc(collection(db, this.SIY_MODULES_COLLECTION));
        batch.set(moduleRef, {
          ...module,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        });
        counts.modules++;

        // Generate exercises for this module
        for (const exercise of module.exercises) {
          const exerciseRef = doc(collection(db, this.SIY_EXERCISES_COLLECTION));
          batch.set(exerciseRef, {
            ...exercise,
            moduleId: moduleRef.id,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now()
          });
          counts.exercises++;
        }
      }

      // Generate Self-Awareness Modules
      const awarenessModules = await this.generateSelfAwarenessModules();
      for (const module of awarenessModules) {
        const moduleRef = doc(collection(db, this.SIY_MODULES_COLLECTION));
        batch.set(moduleRef, {
          ...module,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        });
        counts.modules++;

        for (const exercise of module.exercises) {
          const exerciseRef = doc(collection(db, this.SIY_EXERCISES_COLLECTION));
          batch.set(exerciseRef, {
            ...exercise,
            moduleId: moduleRef.id,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now()
          });
          counts.exercises++;
        }
      }

      // Generate Self-Regulation Modules
      const regulationModules = await this.generateSelfRegulationModules();
      for (const module of regulationModules) {
        const moduleRef = doc(collection(db, this.SIY_MODULES_COLLECTION));
        batch.set(moduleRef, {
          ...module,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        });
        counts.modules++;

        for (const exercise of module.exercises) {
          const exerciseRef = doc(collection(db, this.SIY_EXERCISES_COLLECTION));
          batch.set(exerciseRef, {
            ...exercise,
            moduleId: moduleRef.id,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now()
          });
          counts.exercises++;
        }
      }

      // Generate Social EI Modules
      const empathyModules = await this.generateEmpathyDevelopmentModules();
      for (const module of empathyModules) {
        const moduleRef = doc(collection(db, this.SIY_MODULES_COLLECTION));
        batch.set(moduleRef, {
          ...module,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        });
        counts.modules++;

        for (const exercise of module.exercises) {
          const exerciseRef = doc(collection(db, this.SIY_EXERCISES_COLLECTION));
          batch.set(exerciseRef, {
            ...exercise,
            moduleId: moduleRef.id,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now()
          });
          counts.exercises++;
        }
      }

      const socialSkillsModules = await this.generateSocialSkillsModules();
      for (const module of socialSkillsModules) {
        const moduleRef = doc(collection(db, this.SIY_MODULES_COLLECTION));
        batch.set(moduleRef, {
          ...module,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        });
        counts.modules++;

        for (const exercise of module.exercises) {
          const exerciseRef = doc(collection(db, this.SIY_EXERCISES_COLLECTION));
          batch.set(exerciseRef, {
            ...exercise,
            moduleId: moduleRef.id,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now()
          });
          counts.exercises++;
        }
      }

      const happinessModules = await this.generateHappinessCompassionModules();
      for (const module of happinessModules) {
        const moduleRef = doc(collection(db, this.SIY_MODULES_COLLECTION));
        batch.set(moduleRef, {
          ...module,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        });
        counts.modules++;

        for (const exercise of module.exercises) {
          const exerciseRef = doc(collection(db, this.SIY_EXERCISES_COLLECTION));
          batch.set(exerciseRef, {
            ...exercise,
            moduleId: moduleRef.id,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now()
          });
          counts.exercises++;
        }
      }

      const workplaceModules = await this.generateWorkplaceApplicationModules();
      for (const module of workplaceModules) {
        const moduleRef = doc(collection(db, this.SIY_MODULES_COLLECTION));
        batch.set(moduleRef, {
          ...module,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        });
        counts.modules++;

        for (const exercise of module.exercises) {
          const exerciseRef = doc(collection(db, this.SIY_EXERCISES_COLLECTION));
          batch.set(exerciseRef, {
            ...exercise,
            moduleId: moduleRef.id,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now()
          });
          counts.exercises++;
        }
      }

      // Generate Learning Paths
      const learningPaths = this.generateSIYLearningPaths();
      for (const path of learningPaths) {
        const pathRef = doc(collection(db, this.SIY_LEARNING_PATHS_COLLECTION));
        batch.set(pathRef, {
          ...path,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        });
        counts.learningPaths++;
      }

      await batch.commit();

      return {
        success: true,
        message: 'SIY content populated successfully',
        counts
      };

    } catch (error) {
      console.error('Error populating SIY content:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        counts: { modules: 0, exercises: 0, learningPaths: 0 }
      };
    }
  }

  /**
   * ATTENTION TRAINING MODULES
   */
  
  private async generateAttentionTrainingModules(): Promise<SIYModule[]> {
    const modules: SIYModule[] = [];

    // 1. Mindfulness of Breathing
    modules.push({
      id: 'att-breathing-9point',
      title: 'Mindfulness of Breathing - 9 Point Meditation',
      description: 'Master the foundational practice of mindful breathing with systematic 9-point approach',
      category: 'siy-attention',
      subcategory: 'Mindfulness of Breathing',
      exercises: [
        {
          id: 'ex-breathing-setup',
          moduleId: 'att-breathing-9point',
          title: 'Setting Up Your Posture',
          description: 'Learn the optimal sitting posture for meditation practice',
          type: 'attention',
          duration: 5,
          instructions: [
            {
              id: 'inst-1',
              step: 1,
              title: 'Find Your Seat',
              content: 'Sit comfortably with your back straight but not rigid. Imagine a string gently pulling the crown of your head toward the ceiling.',
              duration: 60,
              type: 'setup',
              bodyPosture: 'Upright sitting, feet flat on floor'
            },
            {
              id: 'inst-2',
              step: 2,
              title: 'Position Your Hands',
              content: 'Rest your hands on your thighs or in your lap, whichever feels more natural and stable.',
              duration: 30,
              type: 'setup'
            },
            {
              id: 'inst-3',
              step: 3,
              title: 'Soften Your Eyes',
              content: 'Gently close your eyes or maintain a soft downward gaze. Let your facial muscles relax.',
              duration: 30,
              type: 'setup'
            }
          ],
          difficulty: 'pemula',
          order: 1,
          tags: ['posture', 'setup', 'foundation'],
          isOptional: false,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'ex-9point-breathing',
          moduleId: 'att-breathing-9point',
          title: '9-Point Breathing Practice',
          description: 'Experience the complete 9-point breathing meditation technique',
          type: 'breathing',
          duration: 15,
          instructions: [
            {
              id: 'inst-4',
              step: 1,
              title: 'Notice Natural Breathing',
              content: 'Begin by simply noticing your natural breath without trying to change it. Feel the sensation of breathing.',
              duration: 120,
              type: 'practice',
              breathingPattern: 'Natural rhythm'
            },
            {
              id: 'inst-5',
              step: 2,
              title: 'Focus on the Nostrils',
              content: 'Bring your attention to the sensation of air entering and leaving through your nostrils.',
              duration: 180,
              type: 'practice',
              breathingPattern: 'Nostril awareness'
            },
            {
              id: 'inst-6',
              step: 3,
              title: 'Follow the Breath Journey',
              content: 'Follow your breath from the nostrils down to your abdomen and back up. Notice the complete journey.',
              duration: 240,
              type: 'practice',
              breathingPattern: 'Full breath tracking'
            }
          ],
          reflectionPrompts: [
            'What did you notice about your breath that you hadn\'t observed before?',
            'Which point of focus felt most natural for you?',
            'How did your mind respond when you tried to stay focused on breathing?'
          ],
          difficulty: 'pemula',
          order: 2,
          tags: ['breathing', '9-point', 'mindfulness'],
          isOptional: false,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ],
      estimatedDuration: 20,
      objectives: [
        'Establish a stable meditation posture',
        'Develop basic breath awareness',
        'Learn to sustain attention on breathing',
        'Recognize when the mind wanders and gently return focus'
      ],
      prerequisites: [],
      difficulty: 'pemula',
      order: 1,
      isCore: true,
      tags: ['breathing', 'foundational', 'attention'],
      instructions: [
        'Find a quiet space where you won\'t be disturbed',
        'Set aside 20 minutes for this practice',
        'Have a comfortable cushion or chair available',
        'Turn off all notifications on your devices'
      ],
      tips: [
        'Don\'t worry if your mind wanders - this is completely normal',
        'The goal is not to stop thinking, but to notice when you\'ve stopped paying attention',
        'Be patient and kind with yourself as you learn',
        'Consistency is more important than perfection'
      ],
      scientificBackground: 'Research shows that mindfulness of breathing activates the prefrontal cortex and strengthens attention networks in the brain. Regular practice increases grey matter density in areas associated with attention and emotional regulation.',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // 2. Body Scan Meditation
    modules.push({
      id: 'att-body-scan',
      title: 'Systematic Body Scan for Attention',
      description: 'Develop focused attention through systematic body awareness practice',
      category: 'siy-attention',
      subcategory: 'Body Scan Meditation',
      exercises: [
        {
          id: 'ex-basic-body-scan',
          moduleId: 'att-body-scan',
          title: 'Progressive Body Scan',
          description: 'Learn to systematically scan your body from head to toe',
          type: 'body-scan',
          duration: 20,
          instructions: [
            {
              id: 'inst-7',
              step: 1,
              title: 'Start with Your Head',
              content: 'Begin at the top of your head. Notice any sensations - warmth, coolness, tension, or relaxation.',
              duration: 120,
              type: 'practice',
              visualCues: ['Crown of head', 'Forehead', 'Eyes', 'Cheeks']
            },
            {
              id: 'inst-8',
              step: 2,
              title: 'Move Through Your Face',
              content: 'Slowly move your attention through your face - forehead, eyes, cheeks, jaw. Notice without trying to change anything.',
              duration: 180,
              type: 'practice',
              visualCues: ['Jaw muscles', 'Tongue', 'Lips']
            },
            {
              id: 'inst-9',
              step: 3,
              title: 'Continue Down Your Body',
              content: 'Systematically scan down through neck, shoulders, arms, chest, abdomen, and legs. Take your time with each area.',
              duration: 900,
              type: 'practice',
              visualCues: ['Neck', 'Shoulders', 'Arms', 'Chest', 'Abdomen', 'Hips', 'Legs', 'Feet']
            }
          ],
          interactiveElements: [
            {
              id: 'elem-1',
              type: 'body-map',
              title: 'Mark Areas of Tension',
              description: 'Click on areas where you noticed tension or strong sensations',
              required: false
            }
          ],
          reflectionPrompts: [
            'Which parts of your body held the most tension?',
            'Did you discover any sensations you weren\'t aware of before?',
            'How did your attention change as you moved through different body parts?'
          ],
          difficulty: 'pemula',
          order: 1,
          tags: ['body-scan', 'attention', 'awareness'],
          isOptional: false,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ],
      estimatedDuration: 25,
      objectives: [
        'Develop systematic attention to physical sensations',
        'Learn to maintain sustained focus while moving attention',
        'Increase body awareness and presence',
        'Practice non-judgmental observation'
      ],
      prerequisites: ['att-breathing-9point'],
      difficulty: 'pemula',
      order: 2,
      isCore: true,
      tags: ['body-scan', 'attention', 'systematic'],
      instructions: [
        'Lie down comfortably or sit in a chair with back support',
        'Close your eyes and take a few deep breaths to settle',
        'Move your attention slowly and deliberately through each body part',
        'Don\'t try to change or fix anything - just observe'
      ],
      tips: [
        'If you don\'t feel anything in a body part, that\'s perfectly normal',
        'The goal is to practice paying attention, not to feel specific sensations',
        'When your mind wanders, gently guide it back to where you left off',
        'This practice can be very relaxing, but the main goal is attention training'
      ],
      scientificBackground: 'Body scan meditation activates the insula, a brain region critical for interoceptive awareness. Studies show it reduces cortisol levels and increases emotional regulation capacity.',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // 3. Walking Meditation
    modules.push({
      id: 'att-walking',
      title: 'Walking Meditation for Daily Integration',
      description: 'Learn to maintain mindful attention while walking and integrate practice into daily life',
      category: 'siy-attention',
      subcategory: 'Walking Meditation',
      exercises: [
        {
          id: 'ex-indoor-walking',
          moduleId: 'att-walking',
          title: 'Indoor Walking Practice',
          description: 'Practice mindful walking in a small indoor space',
          type: 'walking',
          duration: 15,
          instructions: [
            {
              id: 'inst-10',
              step: 1,
              title: 'Choose Your Path',
              content: 'Find a straight path about 10-20 steps long. This could be in a hallway or room.',
              duration: 60,
              type: 'setup'
            },
            {
              id: 'inst-11',
              step: 2,
              title: 'Begin Walking Slowly',
              content: 'Walk much slower than normal. Focus on the sensation of your feet touching the ground.',
              duration: 300,
              type: 'practice',
              visualCues: ['Lifting foot', 'Moving foot forward', 'Placing foot down', 'Shifting weight']
            },
            {
              id: 'inst-12',
              step: 3,
              title: 'Turn and Continue',
              content: 'When you reach the end, pause briefly, turn around mindfully, and continue walking.',
              duration: 540,
              type: 'practice'
            }
          ],
          difficulty: 'pemula',
          order: 1,
          tags: ['walking', 'indoor', 'movement'],
          isOptional: false,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'ex-outdoor-walking',
          moduleId: 'att-walking',
          title: 'Outdoor Walking Integration',
          description: 'Apply walking meditation principles in outdoor environments',
          type: 'walking',
          duration: 20,
          instructions: [
            {
              id: 'inst-13',
              step: 1,
              title: 'Find a Natural Setting',
              content: 'Choose a park, garden, or quiet outdoor area where you can walk without interruption.',
              duration: 120,
              type: 'setup'
            },
            {
              id: 'inst-14',
              step: 2,
              title: 'Coordinate with Nature',
              content: 'Walk at a natural pace while staying aware of your steps, breathing, and surroundings.',
              duration: 1080,
              type: 'practice',
              visualCues: ['Ground beneath feet', 'Sounds around you', 'Air on skin', 'Natural surroundings']
            }
          ],
          difficulty: 'menengah',
          order: 2,
          tags: ['walking', 'outdoor', 'nature', 'integration'],
          isOptional: false,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ],
      estimatedDuration: 35,
      objectives: [
        'Maintain mindful attention while in motion',
        'Integrate meditation into daily activities',
        'Develop awareness of body movement and coordination',
        'Practice bringing meditation off the cushion'
      ],
      prerequisites: ['att-breathing-9point', 'att-body-scan'],
      difficulty: 'menengah',
      order: 3,
      isCore: true,
      tags: ['walking', 'integration', 'movement'],
      instructions: [
        'Start with indoor practice before moving outdoors',
        'Walk much slower than your normal pace initially',
        'Keep your eyes open and aware of your surroundings',
        'Don\'t worry about looking unusual - focus on your practice'
      ],
      tips: [
        'Walking meditation can be easier for some people than sitting meditation',
        'Use this practice during daily walks, even short ones',
        'If you feel dizzy from walking slowly, take a break',
        'This is excellent for integrating mindfulness into busy schedules'
      ],
      scientificBackground: 'Walking meditation engages both motor cortex and attention networks, improving executive function and mind-body coordination. Research shows it reduces rumination and increases present-moment awareness.',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // 4. Mindful Listening
    modules.push({
      id: 'att-listening',
      title: 'Mindful Listening Exercises',
      description: 'Develop auditory attention and awareness through listening practices',
      category: 'siy-attention',
      subcategory: 'Mindful Listening',
      exercises: [
        {
          id: 'ex-sound-landscape',
          moduleId: 'att-listening',
          title: 'Sound Landscape Practice',
          description: 'Learn to listen to the full spectrum of sounds in your environment',
          type: 'listening',
          duration: 12,
          instructions: [
            {
              id: 'inst-15',
              step: 1,
              title: 'Settle into Listening',
              content: 'Sit comfortably and close your eyes. Instead of focusing on breathing, focus on listening.',
              duration: 60,
              type: 'setup'
            },
            {
              id: 'inst-16',
              step: 2,
              title: 'Notice All Sounds',
              content: 'Listen to all sounds around you - near and far, loud and quiet. Don\'t focus on any particular sound.',
              duration: 480,
              type: 'practice',
              visualCues: ['Sounds close to you', 'Sounds far away', 'Continuous sounds', 'Intermittent sounds']
            },
            {
              id: 'inst-17',
              step: 3,
              title: 'Return When Mind Wanders',
              content: 'When you notice your mind creating stories about sounds, gently return to just listening.',
              duration: 180,
              type: 'practice'
            }
          ],
          reflectionPrompts: [
            'What sounds did you notice that you normally wouldn\'t pay attention to?',
            'Did your mind create stories about the sounds you heard?',
            'How did listening meditation compare to breathing meditation for you?'
          ],
          difficulty: 'pemula',
          order: 1,
          tags: ['listening', 'environment', 'auditory'],
          isOptional: false,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ],
      estimatedDuration: 15,
      objectives: [
        'Develop auditory attention skills',
        'Learn to listen without creating mental stories',
        'Increase awareness of environmental sounds',
        'Practice open, receptive attention'
      ],
      prerequisites: ['att-breathing-9point'],
      difficulty: 'pemula',
      order: 4,
      isCore: false,
      tags: ['listening', 'auditory', 'environment'],
      instructions: [
        'Find a location with some ambient sound but not too much noise',
        'You can practice with eyes closed or with a soft gaze',
        'Don\'t try to identify or analyze sounds - just listen',
        'If it\'s too quiet, you can practice near an open window'
      ],
      tips: [
        'This practice can be done anywhere - on public transport, in parks, at home',
        'Listening meditation is particularly good for developing open awareness',
        'Don\'t worry if you can\'t hear much - silence is also something to listen to',
        'This can be very calming and grounding'
      ],
      scientificBackground: 'Auditory attention training enhances temporal lobe function and improves cognitive flexibility. Studies show listening meditation increases divergent thinking and reduces auditory processing disorders.',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // 5. Single-Pointed Attention
    modules.push({
      id: 'att-single-point',
      title: 'Single-Pointed Attention Development',
      description: 'Build concentration and focus through single-pointed attention practices',
      category: 'siy-attention',
      subcategory: 'Single-Pointed Attention',
      exercises: [
        {
          id: 'ex-breath-counting',
          moduleId: 'att-single-point',
          title: 'Breath Counting Practice',
          description: 'Develop concentration by counting breaths from 1 to 10',
          type: 'attention',
          duration: 15,
          instructions: [
            {
              id: 'inst-18',
              step: 1,
              title: 'Begin Counting Breaths',
              content: 'Count each exhale from 1 to 10, then start over. If you lose count, simply begin again at 1.',
              duration: 600,
              type: 'practice',
              breathingPattern: 'Count on exhale: 1, 2, 3... up to 10'
            },
            {
              id: 'inst-19',
              step: 2,
              title: 'Notice When Mind Wanders',
              content: 'When you notice you\'ve stopped counting or lost track, gently return to 1 without judgment.',
              duration: 300,
              type: 'practice'
            }
          ],
          interactiveElements: [
            {
              id: 'elem-2',
              type: 'slider',
              title: 'How often did you lose count?',
              description: 'Rate how frequently your mind wandered during the practice',
              min: 1,
              max: 10,
              required: false
            }
          ],
          difficulty: 'menengah',
          order: 1,
          tags: ['concentration', 'counting', 'focus'],
          isOptional: false,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ],
      estimatedDuration: 18,
      objectives: [
        'Develop sustained concentration',
        'Learn to notice mind-wandering quickly',
        'Build mental stamina and focus',
        'Practice returning attention without judgment'
      ],
      prerequisites: ['att-breathing-9point', 'att-body-scan'],
      difficulty: 'menengah',
      order: 5,
      isCore: true,
      tags: ['concentration', 'focus', 'counting'],
      instructions: [
        'Maintain the same posture as basic breathing meditation',
        'Count only on the exhale, not the inhale',
        'If you get to 10 successfully, start over at 1',
        'The goal is not to reach 10, but to notice when attention wanders'
      ],
      tips: [
        'Most people lose count frequently at first - this is completely normal',
        'The moment you notice you\'ve lost count is actually a moment of mindfulness',
        'Don\'t try to count higher than 10 - the practice is designed to be simple',
        'With practice, you\'ll notice mind-wandering sooner'
      ],
      scientificBackground: 'Concentration practices strengthen the anterior cingulate cortex and improve sustained attention capacity. Research shows counting meditation increases working memory and reduces mind-wandering.',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // 6. Meta-Attention
    modules.push({
      id: 'att-meta-attention',
      title: 'Meta-Attention: Attention to Attention',
      description: 'Develop awareness of attention itself - the highest level of attention training',
      category: 'siy-attention',
      subcategory: 'Meta-Attention',
      exercises: [
        {
          id: 'ex-attention-awareness',
          moduleId: 'att-meta-attention',
          title: 'Observing Your Attention',
          description: 'Learn to observe the quality and movement of your attention',
          type: 'meta-attention',
          duration: 20,
          instructions: [
            {
              id: 'inst-20',
              step: 1,
              title: 'Start with Breath Awareness',
              content: 'Begin with normal breath awareness, but this time also notice the quality of your attention itself.',
              duration: 300,
              type: 'practice',
              breathingPattern: 'Natural breathing with attention awareness'
            },
            {
              id: 'inst-21',
              step: 2,
              title: 'Observe Attention Qualities',
              content: 'Notice: Is your attention sharp or dull? Stable or restless? Narrow or wide? Just observe without trying to change.',
              duration: 600,
              type: 'practice',
              visualCues: ['Sharp vs dull attention', 'Stable vs restless', 'Narrow vs wide', 'Clear vs foggy']
            },
            {
              id: 'inst-22',
              step: 3,
              title: 'Watch Attention Move',
              content: 'Notice how your attention moves - when it wanders, how it returns, the moment you realize it has wandered.',
              duration: 300,
              type: 'practice'
            }
          ],
          reflectionPrompts: [
            'What did you notice about the quality of your attention today?',
            'How did it feel to observe your attention itself?',
            'Did you notice attention moving or changing during the practice?'
          ],
          difficulty: 'lanjutan',
          order: 1,
          tags: ['meta-attention', 'awareness', 'advanced'],
          isOptional: false,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ],
      estimatedDuration: 25,
      objectives: [
        'Develop meta-cognitive awareness',
        'Learn to observe the mind observing',
        'Understand the nature of attention itself',
        'Cultivate the highest level of mindfulness'
      ],
      prerequisites: ['att-breathing-9point', 'att-body-scan', 'att-single-point'],
      difficulty: 'lanjutan',
      order: 6,
      isCore: true,
      tags: ['meta-attention', 'advanced', 'metacognition'],
      instructions: [
        'This is an advanced practice - ensure you\'re comfortable with basic meditation first',
        'The goal is not to control attention but to observe it',
        'Notice the difference between being lost in thought and being aware that you\'re thinking',
        'This practice develops the "observer self"'
      ],
      tips: [
        'Meta-attention is subtle - don\'t worry if it seems elusive at first',
        'This practice can lead to profound insights about the nature of mind',
        'Some days attention will be clearer than others - just observe',
        'This is considered one of the most important practices in mindfulness'
      ],
      scientificBackground: 'Meta-attention practices activate the default mode network and increase metacognitive awareness. Research shows they improve cognitive flexibility and emotional regulation at the highest levels.',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    return modules;
  }

  /**
   * SELF-AWARENESS MODULES
   */
  
  private async generateSelfAwarenessModules(): Promise<SIYModule[]> {
    const modules: SIYModule[] = [];

    // 1. Emotional Granularity
    modules.push({
      id: 'awa-emotional-granularity',
      title: 'Emotional Granularity - Identifying Subtle Emotions',
      description: 'Develop precision in recognizing and naming emotions with greater nuance and accuracy',
      category: 'siy-awareness',
      subcategory: 'Emotional Granularity',
      exercises: [
        {
          id: 'ex-emotion-wheel',
          moduleId: 'awa-emotional-granularity',
          title: 'Emotion Wheel Exploration',
          description: 'Learn to identify specific emotions using the emotion wheel framework',
          type: 'emotional-body',
          duration: 15,
          instructions: [
            {
              id: 'inst-23',
              step: 1,
              title: 'Check In With Your Current State',
              content: 'Take a moment to scan your internal emotional landscape. What are you feeling right now?',
              duration: 120,
              type: 'practice'
            },
            {
              id: 'inst-24',
              step: 2,
              title: 'Move from General to Specific',
              content: 'Start with basic emotions (happy, sad, angry, afraid) then get more specific (content, melancholy, irritated, anxious).',
              duration: 300,
              type: 'practice'
            },
            {
              id: 'inst-25',
              step: 3,
              title: 'Notice Physical Sensations',
              content: 'For each emotion you identify, notice where you feel it in your body and what physical sensations accompany it.',
              duration: 480,
              type: 'practice'
            }
          ],
          interactiveElements: [
            {
              id: 'elem-3',
              type: 'emotion-wheel',
              title: 'Select Your Current Emotions',
              description: 'Choose the emotions that best describe your current state',
              required: true
            },
            {
              id: 'elem-4',
              type: 'text-input',
              title: 'Describe the Physical Sensations',
              description: 'Where in your body do you feel these emotions?',
              placeholder: 'I feel tension in my shoulders, warmth in my chest...',
              required: false
            }
          ],
          reflectionPrompts: [
            'How did it feel to name your emotions more specifically?',
            'What physical sensations did you notice with different emotions?',
            'Were you surprised by any of the emotions you discovered?'
          ],
          difficulty: 'pemula',
          order: 1,
          tags: ['emotions', 'granularity', 'awareness'],
          isOptional: false,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ],
      estimatedDuration: 20,
      objectives: [
        'Develop emotional vocabulary and precision',
        'Learn to distinguish between similar emotions',
        'Connect emotions to physical sensations',
        'Increase emotional self-awareness'
      ],
      prerequisites: ['att-breathing-9point', 'att-body-scan'],
      difficulty: 'pemula',
      order: 1,
      isCore: true,
      tags: ['emotions', 'granularity', 'self-awareness'],
      instructions: [
        'Be honest about what you\'re feeling - there are no right or wrong emotions',
        'Take your time to really explore the nuances',
        'Notice that emotions can be layered - you might feel multiple things at once',
        'Physical sensations are important clues to emotional states'
      ],
      tips: [
        'Emotional granularity improves with practice - be patient',
        'Use an emotion wheel or list to expand your emotional vocabulary',
        'Notice that naming emotions precisely can change how you feel about them',
        'This skill is fundamental to emotional intelligence'
      ],
      scientificBackground: 'Research shows that people with higher emotional granularity have better emotional regulation, less anxiety and depression, and more adaptive coping strategies. The practice activates the prefrontal cortex and improves emotional differentiation.',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // 2. Body Awareness for Emotional Recognition
    modules.push({
      id: 'awa-body-emotions',
      title: 'Body Awareness for Emotional Recognition',
      description: 'Learn to recognize emotions through bodily sensations and develop interoceptive awareness',
      category: 'siy-awareness',
      subcategory: 'Body Awareness',
      exercises: [
        {
          id: 'ex-emotion-body-map',
          moduleId: 'awa-body-emotions',
          title: 'Emotional Body Mapping',
          description: 'Create a personal map of how different emotions feel in your body',
          type: 'emotional-body',
          duration: 18,
          instructions: [
            {
              id: 'inst-26',
              step: 1,
              title: 'Recall a Recent Emotion',
              content: 'Think of a time recently when you felt a strong emotion. Don\'t try to change or analyze it, just recall it gently.',
              duration: 180,
              type: 'practice'
            },
            {
              id: 'inst-27',
              step: 2,
              title: 'Scan Your Body',
              content: 'As you hold this emotional memory, slowly scan your body. Where do you feel sensations? What do they feel like?',
              duration: 600,
              type: 'practice',
              visualCues: ['Chest area', 'Stomach', 'Shoulders', 'Neck', 'Face', 'Arms', 'Legs']
            },
            {
              id: 'inst-28',
              step: 3,
              title: 'Try Different Emotions',
              content: 'Repeat this process with different emotions: joy, sadness, anger, fear, love. Notice the unique body signature of each.',
              duration: 900,
              type: 'practice'
            }
          ],
          interactiveElements: [
            {
              id: 'elem-5',
              type: 'body-map',
              title: 'Mark Where You Feel Each Emotion',
              description: 'Click on body areas where you feel different emotions',
              required: true
            }
          ],
          difficulty: 'menengah',
          order: 1,
          tags: ['body-awareness', 'emotions', 'interoception'],
          isOptional: false,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ],
      estimatedDuration: 25,
      objectives: [
        'Develop interoceptive awareness',
        'Learn to recognize emotions through body sensations',
        'Create a personal emotional body map',
        'Understand the mind-body connection in emotions'
      ],
      prerequisites: ['att-body-scan', 'awa-emotional-granularity'],
      difficulty: 'menengah',
      order: 2,
      isCore: true,
      tags: ['body-awareness', 'emotions', 'interoception'],
      instructions: [
        'Work with emotions that feel manageable - don\'t choose overwhelming experiences',
        'If an emotion feels too intense, take a break and return to breathing',
        'Notice that different people feel emotions in different body areas',
        'The goal is awareness, not changing the emotions'
      ],
      tips: [
        'Some people are naturally more aware of body sensations than others',
        'Your emotional body map may change over time - that\'s normal',
        'This practice can help you catch emotions earlier, before they build up',
        'Body awareness is a key component of emotional intelligence'
      ],
      scientificBackground: 'The insula processes interoceptive signals and is crucial for emotional awareness. Studies show that people with better interoceptive awareness have improved emotional regulation and empathy.',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // 3. Trigger Identification and Pattern Recognition
    modules.push({
      id: 'awa-trigger-patterns',
      title: 'Trigger Identification and Pattern Recognition',
      description: 'Learn to identify your emotional triggers and recognize recurring patterns',
      category: 'siy-awareness',
      subcategory: 'Trigger Recognition',
      exercises: [
        {
          id: 'ex-trigger-mapping',
          moduleId: 'awa-trigger-patterns',
          title: 'Personal Trigger Mapping',
          description: 'Identify and map your personal emotional triggers',
          type: 'trigger-recognition',
          duration: 20,
          instructions: [
            {
              id: 'inst-33',
              step: 1,
              title: 'Reflect on Recent Reactions',
              content: 'Think of 3-4 times recently when you had a strong emotional reaction. What was happening just before you reacted?',
              duration: 300,
              type: 'reflection'
            },
            {
              id: 'inst-34',
              step: 2,
              title: 'Identify Common Themes',
              content: 'Look for patterns: Do certain people, situations, or words tend to trigger you? What are the common elements?',
              duration: 600,
              type: 'reflection'
            },
            {
              id: 'inst-35',
              step: 3,
              title: 'Explore Underlying Needs',
              content: 'For each trigger, ask: What need or value of mine felt threatened? What was I trying to protect?',
              duration: 600,
              type: 'reflection'
            }
          ],
          interactiveElements: [
            {
              id: 'elem-6',
              type: 'text-input',
              title: 'List Your Top 3 Triggers',
              description: 'What situations, people, or events most commonly trigger strong reactions in you?',
              placeholder: '1. Being interrupted during work...',
              required: true,
              validation: { required: true, minLength: 20 }
            },
            {
              id: 'elem-7',
              type: 'multiple-choice',
              title: 'What needs do these triggers threaten?',
              description: 'Select all that apply',
              options: ['Need for respect', 'Need for autonomy', 'Need for fairness', 'Need for safety', 'Need for understanding', 'Need for connection'],
              required: false
            }
          ],
          reflectionPrompts: [
            'What patterns did you notice in your triggers?',
            'How might understanding your triggers help you respond differently?',
            'What underlying needs or values do your triggers protect?'
          ],
          difficulty: 'menengah',
          order: 1,
          tags: ['triggers', 'patterns', 'self-awareness'],
          isOptional: false,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ],
      estimatedDuration: 25,
      objectives: [
        'Identify personal emotional triggers',
        'Recognize patterns in emotional reactions',
        'Understand the needs behind triggers',
        'Develop self-awareness of reactive patterns'
      ],
      prerequisites: ['awa-emotional-granularity', 'awa-body-emotions'],
      difficulty: 'menengah',
      order: 3,
      isCore: true,
      tags: ['triggers', 'patterns', 'self-awareness'],
      instructions: [
        'Be honest and gentle with yourself during this exploration',
        'Focus on understanding, not judging your reactions',
        'Consider both positive and negative emotional triggers',
        'Look for patterns across different areas of your life'
      ],
      tips: [
        'Triggers often point to our deepest values and needs',
        'Understanding triggers is the first step to transforming reactions',
        'Notice that triggers can change over time as you grow',
        'Share insights with trusted friends for additional perspective'
      ],
      scientificBackground: 'Research shows that trigger awareness activates the prefrontal cortex and creates space between stimulus and response. Studies demonstrate that people who understand their triggers have better emotional regulation and relationship satisfaction.',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // 4. Values Clarification
    modules.push({
      id: 'awa-values-clarification',
      title: 'Values Clarification Exercises',
      description: 'Discover and clarify your core values to guide authentic living',
      category: 'siy-awareness',
      subcategory: 'Values Clarification',
      exercises: [
        {
          id: 'ex-core-values',
          moduleId: 'awa-values-clarification',
          title: 'Discovering Your Core Values',
          description: 'Identify the values that are most important to you',
          type: 'values-clarification',
          duration: 25,
          instructions: [
            {
              id: 'inst-36',
              step: 1,
              title: 'Review Value Categories',
              content: 'Consider different life areas: relationships, work, personal growth, health, creativity, service, adventure, security.',
              duration: 300,
              type: 'reflection'
            },
            {
              id: 'inst-37',
              step: 2,
              title: 'Identify Peak Experiences',
              content: 'Think of times when you felt most fulfilled and alive. What values were you honoring in those moments?',
              duration: 600,
              type: 'reflection'
            },
            {
              id: 'inst-38',
              step: 3,
              title: 'Prioritize Your Top Values',
              content: 'From your list, select your top 5-7 core values. These should be the principles that guide your most important decisions.',
              duration: 600,
              type: 'reflection'
            }
          ],
          interactiveElements: [
            {
              id: 'elem-8',
              type: 'multiple-choice',
              title: 'Select Your Top 7 Values',
              description: 'Choose the values most important to you',
              options: ['Authenticity', 'Compassion', 'Creativity', 'Excellence', 'Freedom', 'Growth', 'Health', 'Honesty', 'Justice', 'Learning', 'Love', 'Security', 'Service', 'Wisdom'],
              required: true
            }
          ],
          reflectionPrompts: [
            'How do your identified values show up in your daily life?',
            'Which values do you feel you\'re honoring well? Which need more attention?',
            'How might conflicts between values create internal tension?'
          ],
          difficulty: 'menengah',
          order: 1,
          tags: ['values', 'clarification', 'authentic-living'],
          isOptional: false,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ],
      estimatedDuration: 30,
      objectives: [
        'Identify core personal values',
        'Understand how values guide decisions',
        'Recognize value conflicts and tensions',
        'Align actions with authentic values'
      ],
      prerequisites: ['awa-emotional-granularity'],
      difficulty: 'menengah',
      order: 4,
      isCore: true,
      tags: ['values', 'authenticity', 'self-discovery'],
      instructions: [
        'Be honest about what truly matters to you, not what you think should matter',
        'Consider how your values may have evolved over time',
        'Notice any conflicts between stated values and actual behavior',
        'Think about values in different contexts - work, relationships, personal life'
      ],
      tips: [
        'Values clarification is an ongoing process, not a one-time exercise',
        'Living according to your values increases life satisfaction and reduces anxiety',
        'Values conflicts often underlie difficult decisions',
        'Share your values with people close to you for accountability'
      ],
      scientificBackground: 'Values-based interventions activate regions associated with self-reference and moral reasoning. Research shows that people who live according to their values have greater well-being, resilience, and life satisfaction.',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // 5. Strengths and Blind Spots Assessment
    modules.push({
      id: 'awa-strengths-blindspots',
      title: 'Strengths and Blind Spots Assessment',
      description: 'Develop balanced self-awareness by recognizing both strengths and areas for growth',
      category: 'siy-awareness',
      subcategory: 'Strengths and Blind Spots',
      exercises: [
        {
          id: 'ex-360-self-assessment',
          moduleId: 'awa-strengths-blindspots',
          title: '360-Degree Self-Assessment',
          description: 'Assess yourself from multiple perspectives to identify strengths and blind spots',
          type: 'assessment',
          duration: 30,
          instructions: [
            {
              id: 'inst-39',
              step: 1,
              title: 'Identify Your Strengths',
              content: 'List what you consider your top strengths. What do you do well? What do others compliment you on?',
              duration: 600,
              type: 'reflection'
            },
            {
              id: 'inst-40',
              step: 2,
              title: 'Consider Multiple Perspectives',
              content: 'How might family, friends, colleagues, and strangers see you differently? What might they notice that you don\'t?',
              duration: 600,
              type: 'reflection'
            },
            {
              id: 'inst-41',
              step: 3,
              title: 'Explore Potential Blind Spots',
              content: 'What patterns of feedback do you receive? What situations repeatedly challenge you? What might you be missing about yourself?',
              duration: 600,
              type: 'reflection'
            }
          ],
          interactiveElements: [
            {
              id: 'elem-9',
              type: 'text-input',
              title: 'List Your Top 5 Strengths',
              description: 'What are you genuinely good at?',
              placeholder: '1. Listening carefully to others...',
              required: true
            },
            {
              id: 'elem-10',
              type: 'text-input',
              title: 'Potential Blind Spots',
              description: 'What might others see about you that you don\'t see yourself?',
              placeholder: 'I might not realize how...',
              required: false
            }
          ],
          reflectionPrompts: [
            'How do your strengths sometimes become weaknesses in certain situations?',
            'What blind spots might be limiting your effectiveness or relationships?',
            'How can you get more honest feedback about your blind spots?'
          ],
          difficulty: 'lanjutan',
          order: 1,
          tags: ['strengths', 'blind-spots', 'self-assessment'],
          isOptional: false,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ],
      estimatedDuration: 35,
      objectives: [
        'Develop realistic self-assessment skills',
        'Identify personal strengths and leverage them effectively',
        'Become aware of blind spots and areas for growth',
        'Integrate multiple perspectives of self'
      ],
      prerequisites: ['awa-emotional-granularity', 'awa-values-clarification'],
      difficulty: 'lanjutan',
      order: 5,
      isCore: true,
      tags: ['self-assessment', 'strengths', 'blind-spots'],
      instructions: [
        'Be both generous and honest in your self-assessment',
        'Consider asking trusted others for feedback to supplement this exercise',
        'Remember that blind spots exist precisely because we can\'t see them',
        'Focus on understanding rather than judging'
      ],
      tips: [
        'Strengths can become weaknesses when overused or misapplied',
        'Blind spots often develop around our greatest strengths',
        'Regular feedback from others is essential for uncovering blind spots',
        'The goal is balanced self-awareness, not self-criticism'
      ],
      scientificBackground: 'Research on self-awareness shows that people who have balanced views of their strengths and weaknesses are more effective leaders and have better relationships. The practice engages networks associated with self-reflection and theory of mind.',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // 6. Mindful Journaling
    modules.push({
      id: 'awa-mindful-journaling',
      title: 'Mindful Journaling for Self-Discovery',
      description: 'Use structured journaling practices to deepen self-awareness and insight',
      category: 'siy-awareness',
      subcategory: 'Mindful Journaling',
      exercises: [
        {
          id: 'ex-daily-awareness-journal',
          moduleId: 'awa-mindful-journaling',
          title: 'Daily Awareness Journaling',
          description: 'Develop a daily practice of mindful self-reflection through writing',
          type: 'journaling',
          duration: 15,
          instructions: [
            {
              id: 'inst-42',
              step: 1,
              title: 'Set Intention for Writing',
              content: 'Before writing, take three conscious breaths and set an intention to write with honesty and curiosity.',
              duration: 120,
              type: 'setup'
            },
            {
              id: 'inst-43',
              step: 2,
              title: 'Reflect on Today\'s Experiences',
              content: 'Write about: What did I notice about my emotions today? What triggered strong reactions? What am I grateful for?',
              duration: 600,
              type: 'practice'
            },
            {
              id: 'inst-44',
              step: 3,
              title: 'Identify Insights and Patterns',
              content: 'Look for patterns, insights, or lessons from today. What did I learn about myself?',
              duration: 360,
              type: 'reflection'
            }
          ],
          interactiveElements: [
            {
              id: 'elem-11',
              type: 'text-input',
              title: 'Today\'s Emotional Journey',
              description: 'Describe your emotional experiences today',
              placeholder: 'Today I noticed...',
              required: false,
              validation: { required: false, minLength: 50 }
            },
            {
              id: 'elem-12',
              type: 'scale',
              title: 'Overall Emotional Wellbeing Today',
              description: 'Rate your overall emotional state',
              min: 1,
              max: 10,
              required: false
            }
          ],
          reflectionPrompts: [
            'What patterns do you notice in your emotional responses?',
            'How has your self-awareness changed through regular journaling?',
            'What insights surprise you most about yourself?'
          ],
          difficulty: 'pemula',
          order: 1,
          tags: ['journaling', 'reflection', 'daily-practice'],
          isOptional: false,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ],
      estimatedDuration: 20,
      objectives: [
        'Establish a regular self-reflection practice',
        'Develop insight through written reflection',
        'Track emotional patterns over time',
        'Cultivate honest self-examination'
      ],
      prerequisites: ['awa-emotional-granularity'],
      difficulty: 'pemula',
      order: 6,
      isCore: false,
      tags: ['journaling', 'self-reflection', 'daily-practice'],
      instructions: [
        'Write without censoring - let thoughts flow naturally',
        'Focus on understanding rather than solving problems',
        'Review past entries periodically to notice patterns',
        'Keep your journal private to encourage honesty'
      ],
      tips: [
        'Even 5-10 minutes of daily journaling can be transformative',
        'Use prompts when you\'re not sure what to write about',
        'Notice resistance to journaling - what might that reveal?',
        'Journaling is a practice - be patient with yourself as you develop the habit'
      ],
      scientificBackground: 'Expressive writing research shows that regular journaling improves emotional regulation, reduces stress, and increases self-awareness. The practice activulates areas associated with emotional processing and narrative identity.',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    return modules;
  }

  /**
   * SELF-REGULATION MODULES
   */
  
  private async generateSelfRegulationModules(): Promise<SIYModule[]> {
    const modules: SIYModule[] = [];

    // 1. STOP Technique
    modules.push({
      id: 'reg-stop-technique',
      title: 'STOP Technique for Emotional Regulation',
      description: 'Master the STOP technique: Stop, Take a breath, Observe, Proceed mindfully',
      category: 'siy-regulation',
      subcategory: 'STOP Technique',
      exercises: [
        {
          id: 'ex-basic-stop',
          moduleId: 'reg-stop-technique',
          title: 'Learning the STOP Method',
          description: 'Practice the four steps of the STOP technique in a structured way',
          type: 'emotional-regulation',
          duration: 12,
          instructions: [
            {
              id: 'inst-29',
              step: 1,
              title: 'S - Stop',
              content: 'When you notice a strong emotion or reaction, literally say "STOP" to yourself. Pause whatever you\'re doing.',
              duration: 60,
              type: 'practice'
            },
            {
              id: 'inst-30',
              step: 2,
              title: 'T - Take a Breath',
              content: 'Take one conscious breath. Make it deeper and longer than normal. This activates your parasympathetic nervous system.',
              duration: 120,
              type: 'practice',
              breathingPattern: 'One deep, conscious breath'
            },
            {
              id: 'inst-31',
              step: 3,
              title: 'O - Observe',
              content: 'Notice what\'s happening right now. What are you feeling? What\'s happening in your body? What are you thinking?',
              duration: 180,
              type: 'practice'
            },
            {
              id: 'inst-32',
              step: 4,
              title: 'P - Proceed',
              content: 'Choose how to respond based on this awareness. You have options now that you didn\'t have when you were reactive.',
              duration: 120,
              type: 'practice'
            }
          ],
          reflectionPrompts: [
            'Think of a recent situation where STOP would have been helpful. How might it have changed the outcome?',
            'Which step of STOP feels most natural to you? Which is most challenging?',
            'How does taking that conscious breath change your internal state?'
          ],
          difficulty: 'pemula',
          order: 1,
          tags: ['stop-technique', 'emotional-regulation', 'practical'],
          isOptional: false,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ],
      estimatedDuration: 15,
      objectives: [
        'Learn the four steps of the STOP technique',
        'Practice creating space between stimulus and response',
        'Develop the habit of pausing before reacting',
        'Build emotional regulation skills for daily life'
      ],
      prerequisites: ['att-breathing-9point', 'awa-emotional-granularity'],
      difficulty: 'pemula',
      order: 1,
      isCore: true,
      tags: ['stop-technique', 'regulation', 'practical'],
      instructions: [
        'Practice STOP first in calm moments to build the skill',
        'Start with small irritations before using it for big emotions',
        'The more you practice, the more automatic it becomes',
        'Remember: the goal is not to eliminate emotions but to respond wisely'
      ],
      tips: [
        'STOP works best when practiced regularly, not just in crisis moments',
        'You can use STOP multiple times in the same situation',
        'Even if you forget to use STOP in the moment, you can use it afterwards to learn',
        'This technique is backed by neuroscience and widely used in therapy'
      ],
      scientificBackground: 'The STOP technique engages the prefrontal cortex and calms the amygdala. Research shows it reduces impulsive reactions and increases emotional regulation within seconds of practice.',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // 2. Siberian North Railroad Visualization
    modules.push({
      id: 'reg-siberian-railroad',
      title: 'Siberian North Railroad - Emotional Regulation Visualization',
      description: 'Use powerful visualization techniques to create space between emotions and reactions',
      category: 'siy-regulation',
      subcategory: 'Visualization Techniques',
      exercises: [
        {
          id: 'ex-railroad-visualization',
          moduleId: 'reg-siberian-railroad',
          title: 'The Siberian North Railroad Practice',
          description: 'Learn to observe emotions as passing trains on the Siberian North Railroad',
          type: 'visualization',
          duration: 18,
          instructions: [
            {
              id: 'inst-45',
              step: 1,
              title: 'Set the Scene',
              content: 'Imagine you are sitting on a bench at a remote train station on the Siberian North Railroad. It\'s peaceful and you have nowhere to go.',
              duration: 120,
              type: 'setup'
            },
            {
              id: 'inst-46',
              step: 2,
              title: 'Watch Emotions as Trains',
              content: 'As emotions arise, see them as different trains passing by. Some are passenger trains (pleasant emotions), some are freight trains (difficult emotions). You are the observer on the bench.',
              duration: 600,
              type: 'practice',
              visualCues: ['Train approaching', 'Train passing', 'Train disappearing', 'Silence between trains']
            },
            {
              id: 'inst-47',
              step: 3,
              title: 'Let Thoughts Pass',
              content: 'Don\'t board any trains. Let them all pass. Some trains are long, some short. Some loud, some quiet. But they all pass if you don\'t chase them.',
              duration: 480,
              type: 'practice'
            }
          ],
          reflectionPrompts: [
            'Which emotional "trains" were hardest to let pass by?',
            'How did it feel to observe emotions without getting caught up in them?',
            'What did you notice about the temporary nature of emotions?'
          ],
          difficulty: 'menengah',
          order: 1,
          tags: ['visualization', 'emotional-regulation', 'non-attachment'],
          isOptional: false,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ],
      estimatedDuration: 22,
      objectives: [
        'Develop the ability to observe emotions without being overwhelmed',
        'Learn to create psychological space from difficult emotions',
        'Understand the temporary nature of emotional states',
        'Practice non-attachment to emotional experiences'
      ],
      prerequisites: ['reg-stop-technique', 'awa-emotional-granularity'],
      difficulty: 'menengah',
      order: 2,
      isCore: true,
      tags: ['visualization', 'emotional-regulation', 'mindfulness'],
      instructions: [
        'Use your imagination fully - the more vivid the visualization, the more effective',
        'If you get caught up in an emotion, gently return to your bench',
        'Notice that you are the constant observer while emotions come and go',
        'Practice this during both calm and emotional moments'
      ],
      tips: [
        'This metaphor helps create healthy distance from overwhelming emotions',
        'Some people prefer different metaphors - clouds in the sky, leaves on a stream',
        'The key insight is that you are not your emotions - you are the awareness observing them',
        'This practice is particularly helpful for anxiety and rumination'
      ],
      scientificBackground: 'Visualization practices activate the prefrontal cortex and reduce amygdala reactivity. Research shows that metaphorical thinking about emotions increases emotional regulation and reduces emotional intensity.',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // 3. Dealing with Difficult Emotions Mindfully
    modules.push({
      id: 'reg-difficult-emotions',
      title: 'Dealing with Difficult Emotions Mindfully',
      description: 'Learn skillful ways to work with challenging emotions without being overwhelmed',
      category: 'siy-regulation',
      subcategory: 'Difficult Emotions',
      exercises: [
        {
          id: 'ex-rain-technique',
          moduleId: 'reg-difficult-emotions',
          title: 'RAIN Technique for Difficult Emotions',
          description: 'Apply the RAIN method: Recognize, Allow, Investigate, Non-attachment',
          type: 'emotional-regulation',
          duration: 20,
          instructions: [
            {
              id: 'inst-48',
              step: 1,
              title: 'R - Recognize',
              content: 'When a difficult emotion arises, pause and recognize what is happening. Name the emotion: "This is anger," "This is fear," "This is sadness."',
              duration: 180,
              type: 'practice'
            },
            {
              id: 'inst-49',
              step: 2,
              title: 'A - Allow',
              content: 'Allow the emotion to be present without trying to fix, change, or push it away. Say to yourself: "This is what I\'m feeling right now, and it\'s okay."',
              duration: 300,
              type: 'practice'
            },
            {
              id: 'inst-50',
              step: 3,
              title: 'I - Investigate',
              content: 'With kindness, investigate how this emotion feels in your body. Where do you sense it? What are the physical sensations? What thoughts accompany it?',
              duration: 480,
              type: 'practice'
            },
            {
              id: 'inst-51',
              step: 4,
              title: 'N - Non-attachment',
              content: 'Practice non-identification. You are not the emotion - you are the awareness experiencing it. Let it be present while knowing it will change.',
              duration: 240,
              type: 'practice'
            }
          ],
          interactiveElements: [
            {
              id: 'elem-13',
              type: 'text-input',
              title: 'Describe Your Experience with RAIN',
              description: 'What did you notice when applying RAIN to a difficult emotion?',
              placeholder: 'When I used RAIN with my anxiety, I noticed...',
              required: false
            }
          ],
          reflectionPrompts: [
            'Which step of RAIN felt most natural? Which was most challenging?',
            'How did the emotion change through the RAIN process?',
            'What did you learn about your relationship to difficult emotions?'
          ],
          difficulty: 'menengah',
          order: 1,
          tags: ['rain-technique', 'difficult-emotions', 'self-compassion'],
          isOptional: false,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ],
      estimatedDuration: 25,
      objectives: [
        'Learn to face difficult emotions with courage and compassion',
        'Develop tools for working skillfully with emotional pain',
        'Reduce avoidance and suppression of emotions',
        'Build emotional resilience and tolerance'
      ],
      prerequisites: ['reg-stop-technique', 'awa-body-emotions'],
      difficulty: 'menengah',
      order: 3,
      isCore: true,
      tags: ['difficult-emotions', 'rain-technique', 'emotional-resilience'],
      instructions: [
        'Start with mild to moderate emotions before working with intense ones',
        'Be patient - this skill develops over time with practice',
        'If emotions become overwhelming, return to basic breathing or seek support',
        'Remember that feeling emotions fully is how they transform and heal'
      ],
      tips: [
        'RAIN transforms our relationship to difficult emotions from resistance to acceptance',
        'This practice builds emotional tolerance and resilience over time',
        'Non-attachment doesn\'t mean not caring - it means not being consumed',
        'Some emotions may need professional support - know your limits'
      ],
      scientificBackground: 'RAIN-based interventions show significant effects on emotional regulation and psychological flexibility. Research demonstrates reduced rumination, anxiety, and depression with regular practice.',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // 4. Response Choice Practices
    modules.push({
      id: 'reg-response-choice',
      title: 'Choosing Your Response - Between Stimulus and Response',
      description: 'Develop the ability to choose your responses rather than react automatically',
      category: 'siy-regulation',
      subcategory: 'Response Choice',
      exercises: [
        {
          id: 'ex-sacred-pause',
          moduleId: 'reg-response-choice',
          title: 'The Sacred Pause Practice',
          description: 'Learn to create a moment of choice between stimulus and response',
          type: 'response-choice',
          duration: 15,
          instructions: [
            {
              id: 'inst-52',
              step: 1,
              title: 'Recognize the Trigger Moment',
              content: 'Notice when you feel triggered or about to react automatically. This moment of recognition is precious - it\'s where choice begins.',
              duration: 120,
              type: 'practice'
            },
            {
              id: 'inst-53',
              step: 2,
              title: 'Take the Sacred Pause',
              content: 'Instead of reacting immediately, pause. Take one conscious breath. In this space, you have options you didn\'t have while reactive.',
              duration: 180,
              type: 'practice',
              breathingPattern: 'One conscious breath as a pause'
            },
            {
              id: 'inst-54',
              step: 3,
              title: 'Choose Your Response',
              content: 'Ask yourself: "How do I want to respond to this situation?" Choose a response aligned with your values rather than your immediate impulse.',
              duration: 300,
              type: 'practice'
            }
          ],
          interactiveElements: [
            {
              id: 'elem-14',
              type: 'text-input',
              title: 'Situation Where You Want to Practice Response Choice',
              description: 'Describe a recurring situation where you\'d like to respond more skillfully',
              placeholder: 'When my colleague interrupts me in meetings, I usually...',
              required: false
            },
            {
              id: 'elem-15',
              type: 'text-input',
              title: 'Alternative Response',
              description: 'How would you like to respond differently in this situation?',
              placeholder: 'Instead, I could...',
              required: false
            }
          ],
          reflectionPrompts: [
            'Think of a recent situation where a pause would have changed your response. How might things have gone differently?',
            'What values do you want to guide your responses in challenging situations?',
            'How does it feel to know you have choice in how you respond?'
          ],
          difficulty: 'lanjutan',
          order: 1,
          tags: ['response-choice', 'sacred-pause', 'conscious-living'],
          isOptional: false,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ],
      estimatedDuration: 20,
      objectives: [
        'Develop the ability to pause before reacting',
        'Learn to respond from values rather than impulses',
        'Increase conscious choice in daily interactions',
        'Break automatic reaction patterns'
      ],
      prerequisites: ['reg-stop-technique', 'awa-values-clarification'],
      difficulty: 'lanjutan',
      order: 4,
      isCore: true,
      tags: ['response-choice', 'conscious-living', 'values-based-action'],
      instructions: [
        'Start practicing in low-stakes situations to build the skill',
        'The pause can be as short as one breath - it\'s about creating space',
        'Focus on responding from your best self rather than your reactive self',
        'Remember that choosing your response is a superpower'
      ],
      tips: [
        'Viktor Frankl said: "Between stimulus and response there is a space. In that space is our power to choose our response."',
        'The more you practice conscious pausing, the more automatic it becomes',
        'Even if you react first and pause later, you\'re still building the skill',
        'This practice transforms relationships and reduces regret'
      ],
      scientificBackground: 'Response flexibility research shows that the ability to pause and choose responses is linked to better emotional regulation, leadership effectiveness, and relationship satisfaction. This practice strengthens prefrontal cortex control over limbic reactivity.',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // 5. Building Resilience
    modules.push({
      id: 'reg-resilience',
      title: 'Building Emotional Resilience',
      description: 'Develop the capacity to bounce back from setbacks and maintain wellbeing during challenges',
      category: 'siy-regulation',
      subcategory: 'Resilience Building',
      exercises: [
        {
          id: 'ex-resilience-resources',
          moduleId: 'reg-resilience',
          title: 'Identifying Your Resilience Resources',
          description: 'Discover and strengthen your personal resources for resilience',
          type: 'resilience',
          duration: 25,
          instructions: [
            {
              id: 'inst-55',
              step: 1,
              title: 'Recall Past Resilience',
              content: 'Think of a time when you successfully navigated a difficult period. What internal and external resources helped you get through it?',
              duration: 600,
              type: 'reflection'
            },
            {
              id: 'inst-56',
              step: 2,
              title: 'Identify Current Resources',
              content: 'What resources do you have now? Consider: supportive relationships, coping skills, spiritual practices, physical health, meaningful activities.',
              duration: 600,
              type: 'reflection'
            },
            {
              id: 'inst-57',
              step: 3,
              title: 'Strengthen Your Resources',
              content: 'Choose one resilience resource to strengthen this week. How will you nurture this resource? What specific actions will you take?',
              duration: 300,
              type: 'reflection'
            }
          ],
          interactiveElements: [
            {
              id: 'elem-16',
              type: 'multiple-choice',
              title: 'Your Top Resilience Resources',
              description: 'Select your strongest resources for getting through difficult times',
              options: ['Supportive relationships', 'Physical exercise', 'Spiritual practice', 'Creative expression', 'Problem-solving skills', 'Sense of humor', 'Learning mindset', 'Self-compassion'],
              required: false
            },
            {
              id: 'elem-17',
              type: 'text-input',
              title: 'One Resource to Strengthen',
              description: 'Which resilience resource will you focus on developing this week?',
              placeholder: 'I will strengthen my...',
              required: false
            }
          ],
          reflectionPrompts: [
            'What patterns do you notice in how you\'ve handled past challenges?',
            'Which resilience resources feel strongest for you? Which need development?',
            'How can you proactively build resilience before you need it?'
          ],
          difficulty: 'menengah',
          order: 1,
          tags: ['resilience', 'resources', 'coping-skills'],
          isOptional: false,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ],
      estimatedDuration: 30,
      objectives: [
        'Identify personal resilience resources and strengths',
        'Develop strategies for building resilience proactively',
        'Learn to draw on internal and external resources during challenges',
        'Create a personal resilience toolkit'
      ],
      prerequisites: ['awa-strengths-blindspots', 'reg-difficult-emotions'],
      difficulty: 'menengah',
      order: 5,
      isCore: false,
      tags: ['resilience', 'coping-skills', 'wellbeing'],
      instructions: [
        'Resilience is built through practice, not just during crises',
        'Focus on building multiple types of resources - emotional, social, physical, spiritual',
        'Remember that resilience doesn\'t mean not feeling pain - it means bouncing back',
        'Small daily practices build cumulative resilience over time'
      ],
      tips: [
        'Resilience is like a muscle - it gets stronger with exercise',
        'Having multiple resilience resources prevents over-reliance on any one strategy',
        'Social connections are one of the strongest predictors of resilience',
        'Meaning-making helps transform suffering into growth'
      ],
      scientificBackground: 'Resilience research shows that people who actively build and maintain multiple coping resources have better outcomes during stress. Studies demonstrate that resilience can be developed through specific practices and interventions.',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // 6. Self-Compassion Practices
    modules.push({
      id: 'reg-self-compassion',
      title: 'Self-Compassion for Emotional Healing',
      description: 'Learn to treat yourself with kindness and understanding, especially during difficult times',
      category: 'siy-regulation',
      subcategory: 'Self-Compassion',
      exercises: [
        {
          id: 'ex-self-compassion-break',
          moduleId: 'reg-self-compassion',
          title: 'Self-Compassion Break Practice',
          description: 'Learn the three components of self-compassion: mindfulness, common humanity, and self-kindness',
          type: 'compassion',
          duration: 15,
          instructions: [
            {
              id: 'inst-58',
              step: 1,
              title: 'Acknowledge Your Suffering',
              content: 'Notice that you are experiencing difficulty or pain. Say to yourself: "This is a moment of suffering" or "This hurts."',
              duration: 120,
              type: 'practice'
            },
            {
              id: 'inst-59',
              step: 2,
              title: 'Remember Common Humanity',
              content: 'Recognize that suffering is part of the human experience. Say: "Suffering is part of life" or "I\'m not alone in this."',
              duration: 120,
              type: 'practice'
            },
            {
              id: 'inst-60',
              step: 3,
              title: 'Offer Yourself Kindness',
              content: 'Place your hands on your heart and offer yourself the same kindness you\'d give a good friend. Say: "May I be kind to myself" or "May I give myself the compassion I need."',
              duration: 180,
              type: 'practice'
            }
          ],
          reflectionPrompts: [
            'How did it feel to offer yourself compassion instead of criticism?',
            'Which aspect of self-compassion (mindfulness, common humanity, kindness) felt most natural? Most challenging?',
            'How might your life change if you treated yourself with more compassion?'
          ],
          difficulty: 'pemula',
          order: 1,
          tags: ['self-compassion', 'kindness', 'healing'],
          isOptional: false,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ],
      estimatedDuration: 20,
      objectives: [
        'Learn the three components of self-compassion',
        'Develop a kinder internal voice',
        'Reduce self-criticism and self-judgment',
        'Build emotional resilience through self-kindness'
      ],
      prerequisites: ['reg-difficult-emotions'],
      difficulty: 'pemula',
      order: 6,
      isCore: true,
      tags: ['self-compassion', 'kindness', 'healing'],
      instructions: [
        'Be patient with yourself as you learn self-compassion - it\'s often harder than being compassionate to others',
        'Notice your inner critic and gently challenge harsh self-talk',
        'Use physical touch (hand on heart) to activate the care system',
        'Remember that self-compassion is strength, not weakness'
      ],
      tips: [
        'Self-compassion is associated with greater emotional resilience and motivation',
        'Many people worry that self-compassion will make them lazy - research shows the opposite',
        'Treat yourself like you would treat your best friend going through the same situation',
        'Self-compassion reduces anxiety, depression, and stress while increasing happiness'
      ],
      scientificBackground: 'Research by Kristin Neff shows that self-compassion activates the care system and reduces cortisol levels. Studies demonstrate that people with higher self-compassion have better emotional regulation and psychological well-being.',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    return modules;
  }

  /**
   * LEARNING PATHS
   */
  
  private generateSIYLearningPaths(): SIYLearningPath[] {
    return [
      {
        id: 'path-complete-siy',
        title: 'Complete Search Inside Yourself Program',
        description: 'The full Search Inside Yourself curriculum for developing emotional intelligence through mindfulness',
        targetAudience: ['Beginners to mindfulness', 'Professionals seeking emotional intelligence', 'Anyone interested in self-development'],
        estimatedWeeks: 8,
        modules: [
          'att-breathing-9point',
          'att-body-scan', 
          'att-walking',
          'att-listening',
          'awa-emotional-granularity',
          'awa-body-emotions',
          'reg-stop-technique'
        ],
        prerequisites: [],
        outcomes: [
          'Sustained attention and focus',
          'Enhanced emotional awareness',
          'Improved emotional regulation',
          'Better self-understanding',
          'Increased resilience and wellbeing'
        ],
        difficulty: 'pemula',
        isRecommended: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'path-attention-mastery',
        title: 'Attention Training Mastery',
        description: 'Deep dive into attention training practices for maximum focus and concentration',
        targetAudience: ['People with focus challenges', 'Students', 'Knowledge workers'],
        estimatedWeeks: 4,
        modules: [
          'att-breathing-9point',
          'att-body-scan',
          'att-single-point',
          'att-meta-attention'
        ],
        prerequisites: [],
        outcomes: [
          'Dramatically improved focus and concentration',
          'Better working memory',
          'Reduced mind-wandering',
          'Enhanced cognitive performance'
        ],
        difficulty: 'menengah',
        isRecommended: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
  }

  /**
   * USER PROGRESS TRACKING
   */
  
  async getSIYUserProfile(userId: string): Promise<SIYUserProfile | null> {
    try {
      const docRef = doc(db, this.SIY_USER_PROFILES_COLLECTION, userId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          ...docSnap.data(),
          createdAt: docSnap.data().createdAt?.toDate(),
          updatedAt: docSnap.data().updatedAt?.toDate()
        } as SIYUserProfile;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching SIY user profile:', error);
      throw new Error('Failed to fetch SIY user profile');
    }
  }

  async updateSIYProgress(userId: string, exerciseId: string, moduleId: string, data: Partial<SIYProgressMetrics>): Promise<void> {
    try {
      const progressRef = doc(db, this.SIY_PROGRESS_COLLECTION, `${userId}_${exerciseId}`);
      await updateDoc(progressRef, {
        ...data,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error updating SIY progress:', error);
      throw new Error('Failed to update SIY progress');
    }
  }

  /**
   * EMPATHY DEVELOPMENT MODULES
   */
  
  private async generateEmpathyDevelopmentModules(): Promise<SIYModule[]> {
    const modules: SIYModule[] = [];

    // 1. Just Like Me Meditation
    modules.push({
      id: 'emp-just-like-me',
      title: 'Just Like Me - Meditasi Kemanusiaan Bersama',
      description: 'Mengembangkan empati melalui pengakuan kesamaan fundamental manusia',
      category: 'siy-empathy',
      subcategory: 'Just Like Me Meditation',
      exercises: [
        {
          id: 'ex-basic-just-like-me',
          moduleId: 'emp-just-like-me',
          title: 'Meditasi Just Like Me Dasar',
          description: 'Belajar melihat kesamaan dasar dengan orang lain',
          type: 'empathy',
          duration: 15,
          instructions: [
            {
              id: 'inst-jlm-1',
              step: 1,
              title: 'Pilih Seseorang dalam Pikiran',
              content: 'Visualisasikan seseorang yang Anda kenal - bisa teman, keluarga, atau bahkan orang asing. Bayangkan wajah mereka dengan jelas.',
              duration: 120,
              type: 'setup'
            },
            {
              id: 'inst-jlm-2',
              step: 2,
              title: 'Refleksikan Kesamaan Dasar',
              content: 'Dalam hati, katakan: "Orang ini memiliki perasaan, seperti saya. Orang ini pernah mengalami sakit fisik dan emosional, seperti saya. Orang ini pernah merasakan kebahagiaan dan kesedihan, seperti saya."',
              duration: 300,
              type: 'practice'
            },
            {
              id: 'inst-jlm-3',
              step: 3,
              title: 'Lanjutkan dengan Aspirasi',
              content: 'Lanjutkan: "Orang ini belajar tentang kehidupan, seperti saya. Orang ini ingin bahagia dan bebas dari penderitaan, seperti saya. Orang ini adalah manusia pembelajaran, seperti saya."',
              duration: 240,
              type: 'practice'
            },
            {
              id: 'inst-jlm-4',
              step: 4,
              title: 'Rasakan Koneksi',
              content: 'Rasakan bagaimana pengakuan kesamaan ini membuka hati Anda. Biarkan perasaan koneksi dan empati mengalir.',
              duration: 180,
              type: 'practice'
            }
          ],
          interactiveElements: [
            {
              id: 'elem-jlm-1',
              type: 'text-input',
              title: 'Siapa yang Anda visualisasikan?',
              description: 'Tuliskan nama atau deskripsi orang yang Anda pilih',
              placeholder: 'Rekan kerja saya, Maria...',
              required: false
            },
            {
              id: 'elem-jlm-2',
              type: 'scale',
              title: 'Seberapa kuat koneksi empati yang Anda rasakan?',
              description: 'Rate dari 1-10',
              min: 1,
              max: 10,
              required: false
            }
          ],
          reflectionPrompts: [
            'Bagaimana perasaan Anda saat mengakui kesamaan dengan orang tersebut?',
            'Apakah ada perbedaan dalam cara Anda melihat orang tersebut sebelum dan sesudah latihan?',
            'Kesamaan mana yang paling mengejutkan atau bermakna bagi Anda?'
          ],
          difficulty: 'pemula',
          order: 1,
          tags: ['empathy', 'common-humanity', 'connection'],
          isOptional: false,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'ex-difficult-person-jlm',
          moduleId: 'emp-just-like-me',
          title: 'Just Like Me untuk Orang yang Sulit',
          description: 'Menerapkan Just Like Me kepada orang yang menantang atau sulit',
          type: 'empathy',
          duration: 20,
          instructions: [
            {
              id: 'inst-jlm-5',
              step: 1,
              title: 'Pilih Orang yang Menantang',
              content: 'Visualisasikan seseorang yang membuat Anda merasa frustrasi, kesal, atau sulit berinteraksi. Mulai dengan yang tidak terlalu ekstrem.',
              duration: 180,
              type: 'setup'
            },
            {
              id: 'inst-jlm-6',
              step: 2,
              title: 'Akui Kemanusiaan Mereka',
              content: 'Meskipun sulit, akui: "Orang ini memiliki perasaan, seperti saya. Orang ini ingin bahagia, seperti saya. Orang ini pernah menjadi anak kecil yang polos, seperti saya."',
              duration: 360,
              type: 'practice'
            },
            {
              id: 'inst-jlm-7',
              step: 3,
              title: 'Lepaskan Penilaian',
              content: 'Tanpa membenarkan tindakan mereka yang menyakitkan, coba lepaskan penilaian dan buka ruang untuk memahami bahwa mereka juga manusia yang berjuang.',
              duration: 300,
              type: 'practice'
            }
          ],
          reflectionPrompts: [
            'Apa yang paling sulit dalam menerapkan Just Like Me kepada orang ini?',
            'Apakah Anda merasakan perubahan dalam perasaan terhadap orang tersebut?',
            'Bagaimana ini bisa mengubah cara Anda berinteraksi dengan mereka di masa depan?'
          ],
          difficulty: 'lanjutan',
          order: 2,
          tags: ['difficult-relationships', 'forgiveness', 'understanding'],
          isOptional: false,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ],
      estimatedDuration: 35,
      objectives: [
        'Mengembangkan pengakuan kemanusiaan bersama',
        'Mengurangi "othering" dan prasangka',
        'Membangun fondasi empati yang kuat',
        'Menerapkan empati bahkan pada orang yang sulit'
      ],
      prerequisites: ['att-breathing-9point', 'awa-emotional-granularity'],
      difficulty: 'pemula',
      order: 1,
      isCore: true,
      tags: ['empathy', 'common-humanity', 'connection'],
      instructions: [
        'Mulai dengan orang yang Anda suka atau netral sebelum mencoba orang yang sulit',
        'Fokus pada kesamaan fundamental, bukan perbedaan spesifik',
        'Jika muncul resistensi, itu normal - lanjutkan dengan lembut',
        'Praktik ini membangun empati kognitif dan afektif'
      ],
      tips: [
        'Just Like Me adalah fondasi dari semua praktik empati lainnya',
        'Mulai dengan 3-5 menit jika 15 menit terasa terlalu lama',
        'Visualisasi yang jelas akan memperkuat efek empati',
        'Praktik ini bisa diterapkan dalam situasi konflik sehari-hari'
      ],
      scientificBackground: 'Penelitian neuroimaging menunjukkan bahwa meditasi Just Like Me mengaktifkan jaringan empati di otak dan mengurangi aktivitas amygdala terhadap out-group. Studi menunjukkan peningkatan perilaku prososial dan penurunan bias implisit.',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // 2. Loving Kindness Meditation (Metta)
    modules.push({
      id: 'emp-loving-kindness',
      title: 'Loving Kindness - Meditasi Cinta Kasih',
      description: 'Mengembangkan cinta kasih universal melalui praktik metta tradisional dan variasi SIY',
      category: 'siy-empathy',
      subcategory: 'Loving Kindness Meditation',
      exercises: [
        {
          id: 'ex-traditional-metta',
          moduleId: 'emp-loving-kindness',
          title: 'Metta Tradisional dengan Adaptasi Indonesia',
          description: 'Praktik loving kindness dengan sentuhan budaya Indonesia',
          type: 'loving-kindness',
          duration: 25,
          instructions: [
            {
              id: 'inst-metta-1',
              step: 1,
              title: 'Mulai dengan Diri Sendiri',
              content: 'Letakkan tangan di jantung. Rasakan kehangatan dan katakan: "Semoga aku bahagia. Semoga aku sehat. Semoga aku damai. Semoga aku hidup dengan mudah."',
              duration: 300,
              type: 'practice',
              breathingPattern: 'Napas alami dengan tangan di jantung'
            },
            {
              id: 'inst-metta-2',
              step: 2,
              title: 'Untuk Orang Terkasih',
              content: 'Visualisasikan orang yang sangat Anda sayangi. Kirimkan cinta kasih: "Semoga engkau bahagia. Semoga engkau sehat. Semoga engkau damai. Semoga engkau hidup dengan mudah."',
              duration: 360,
              type: 'practice'
            },
            {
              id: 'inst-metta-3',
              step: 3,
              title: 'Untuk Orang Netral',
              content: 'Pilih orang yang tidak Anda kenal baik - tetangga, kasir, dll. Kirimkan cinta kasih yang sama: "Semoga engkau bahagia, sehat, damai, dan hidup dengan mudah."',
              duration: 360,
              type: 'practice'
            },
            {
              id: 'inst-metta-4',
              step: 4,
              title: 'Untuk Orang Sulit (dengan Hati-hati)',
              content: 'Pilih seseorang yang sedikit menyulitkan Anda. Mulai perlahan: "Semoga engkau bahagia." Jika sulit, kembali ke diri sendiri dulu.',
              duration: 300,
              type: 'practice'
            },
            {
              id: 'inst-metta-5',
              step: 5,
              title: 'Untuk Semua Makhluk',
              content: 'Luaskan ke seluruh Indonesia, lalu dunia: "Semoga semua makhluk bahagia. Semoga semua makhluk sehat. Semoga semua makhluk damai. Semoga semua makhluk hidup dengan mudah."',
              duration: 180,
              type: 'practice'
            }
          ],
          interactiveElements: [
            {
              id: 'elem-metta-1',
              type: 'multiple-choice',
              title: 'Mantra mana yang paling berkesan untuk Anda?',
              description: 'Pilih yang paling menyentuh hati',
              options: ['Semoga bahagia', 'Semoga sehat', 'Semoga damai', 'Semoga hidup dengan mudah'],
              required: false
            }
          ],
          difficulty: 'pemula',
          order: 1,
          tags: ['loving-kindness', 'metta', 'universal-love'],
          isOptional: false,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ],
      estimatedDuration: 30,
      objectives: [
        'Mengembangkan cinta kasih universal',
        'Mengurangi kemarahan dan kebencian',
        'Meningkatkan kebahagiaan dan wellbeing',
        'Membangun koneksi emosional dengan semua makhluk'
      ],
      prerequisites: ['emp-just-like-me'],
      difficulty: 'pemula',
      order: 2,
      isCore: true,
      tags: ['loving-kindness', 'compassion', 'universal-love'],
      instructions: [
        'Jika sulit merasakan cinta kasih untuk diri sendiri, mulai dengan orang terkasih',
        'Gunakan visualisasi dan ingatan positif untuk membantu',
        'Tidak perlu memaksakan perasaan - niat saja sudah cukup',
        'Praktik rutin akan memperdalam kemampuan ini'
      ],
      tips: [
        'Loving kindness adalah "gym" untuk otot empati dan compassion',
        'Efek akan terasa kumulatif setelah praktik rutin',
        'Bisa dipraktikkan dalam kehidupan sehari-hari saat bertemu orang',
        'Penelitian menunjukkan manfaat untuk kesehatan mental dan hubungan'
      ],
      scientificBackground: 'Meta-analisis menunjukkan bahwa loving kindness meditation meningkatkan emosi positif, mengurangi bias implisit, dan memperkuat koneksi sosial. Neuroimaging menunjukkan peningkatan aktivitas di area empati dan compassion.',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // 3. Perspective-Taking Exercises
    modules.push({
      id: 'emp-perspective-taking',
      title: 'Latihan Mengambil Perspektif',
      description: 'Mengembangkan kemampuan melihat situasi dari sudut pandang orang lain',
      category: 'siy-empathy',
      subcategory: 'Perspective-Taking',
      exercises: [
        {
          id: 'ex-story-perspectives',
          moduleId: 'emp-perspective-taking',
          title: 'Cerita dari Berbagai Sudut Pandang',
          description: 'Melihat situasi yang sama dari perspektif berbagai pihak',
          type: 'perspective-taking',
          duration: 20,
          instructions: [
            {
              id: 'inst-persp-1',
              step: 1,
              title: 'Pilih Situasi Interpersonal',
              content: 'Pikirkan situasi baru-baru ini di mana ada ketegangan atau konflik dengan orang lain. Bisa di rumah, kerja, atau sosial.',
              duration: 180,
              type: 'setup'
            },
            {
              id: 'inst-persp-2',
              step: 2,
              title: 'Ceritakan dari Perspektif Anda',
              content: 'Dalam hati, ceritakan situasi itu dari sudut pandang Anda. Apa yang Anda rasakan? Apa motivasi Anda? Apa kebutuhan yang tidak terpenuhi?',
              duration: 300,
              type: 'practice'
            },
            {
              id: 'inst-persp-3',
              step: 3,
              title: 'Beralih ke Perspektif Mereka',
              content: 'Sekarang, bayangkan Anda adalah orang tersebut. Apa yang mungkin mereka rasakan? Apa kebutuhan atau ketakutan mereka? Bagaimana mereka melihat situasi ini?',
              duration: 420,
              type: 'practice'
            },
            {
              id: 'inst-persp-4',
              step: 4,
              title: 'Perspektif Pengamat Netral',
              content: 'Bayangkan Anda adalah saksi netral yang bijaksana. Apa yang akan Anda lihat dari kedua belah pihak? Apa yang mungkin terlewatkan oleh masing-masing?',
              duration: 300,
              type: 'practice'
            }
          ],
          interactiveElements: [
            {
              id: 'elem-persp-1',
              type: 'text-input',
              title: 'Insight dari Perspektif Orang Lain',
              description: 'Apa yang Anda pelajari tentang perspektif mereka?',
              placeholder: 'Saya baru menyadari bahwa mereka mungkin merasa...',
              required: false
            }
          ],
          reflectionPrompts: [
            'Bagaimana cerita berubah ketika dilihat dari perspektif orang lain?',
            'Apa yang mengejutkan Anda tentang perspektif mereka?',
            'Bagaimana pemahaman ini bisa mengubah pendekatan Anda ke situasi serupa?'
          ],
          difficulty: 'menengah',
          order: 1,
          tags: ['perspective-taking', 'conflict-resolution', 'understanding'],
          isOptional: false,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ],
      estimatedDuration: 25,
      objectives: [
        'Mengembangkan kemampuan perspective-taking',
        'Mengurangi bias egocentric dalam konflik',
        'Meningkatkan pemahaman interpersonal',
        'Membangun fondasi untuk resolusi konflik'
      ],
      prerequisites: ['emp-just-like-me', 'awa-trigger-patterns'],
      difficulty: 'menengah',
      order: 3,
      isCore: true,
      tags: ['perspective-taking', 'empathy', 'conflict-resolution'],
      instructions: [
        'Mulai dengan situasi yang tidak terlalu emosional',
        'Jika terlalu sulit, kembali ke meditasi Just Like Me dulu',
        'Fokus pada pemahaman, bukan pembenaran',
        'Gunakan imajinasi untuk masuk ke dunia internal mereka'
      ],
      tips: [
        'Perspective-taking adalah keterampilan yang bisa dilatih',
        'Semakin sering dipraktikkan, semakin mudah dan otomatis',
        'Ini sangat efektif untuk mengurangi konflik interpersonal',
        'Bisa diterapkan dalam negosiasi dan leadership'
      ],
      scientificBackground: 'Penelitian menunjukkan bahwa perspective-taking mengurangi stereotyping dan meningkatkan perilaku altruistik. Aktivasi cortex prefrontal medial dan temporoparietal junction terlibat dalam kemampuan ini.',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Continue with remaining empathy modules...
    return modules;
  }

  /**
   * SOCIAL SKILLS & COMMUNICATION MODULES
   */
  
  private async generateSocialSkillsModules(): Promise<SIYModule[]> {
    const modules: SIYModule[] = [];

    // 1. Mindful Speaking
    modules.push({
      id: 'soc-mindful-speaking',
      title: 'Mindful Speaking - Berbicara dengan Kesadaran',
      description: 'Mengembangkan komunikasi yang sadar, autentik, dan konstruktif',
      category: 'siy-social',
      subcategory: 'Mindful Speaking',
      exercises: [
        {
          id: 'ex-conscious-communication',
          moduleId: 'soc-mindful-speaking',
          title: 'Komunikasi Sadar dengan Budaya Indonesia',
          description: 'Menerapkan prinsip mindful speaking dengan mempertimbangkan nilai-nilai budaya Indonesia',
          type: 'mindful-speaking',
          duration: 18,
          instructions: [
            {
              id: 'inst-ms-1',
              step: 1,
              title: 'Pause Sebelum Berbicara',
              content: 'Sebelum berbicara, ambil satu napas sadar. Tanyakan pada diri: "Apakah yang akan saya katakan benar, bermanfaat, dan baik? Apakah ini akan membangun atau merusak hubungan?"',
              duration: 240,
              type: 'practice'
            },
            {
              id: 'inst-ms-2',
              step: 2,
              title: 'Berbicara dari Hati',
              content: 'Berbicaralah dengan kejujuran yang lembut. Dalam budaya Indonesia, sampaikan pesan dengan cara yang tidak membuat orang kehilangan muka (tidak mempermalukan).',
              duration: 300,
              type: 'practice'
            },
            {
              id: 'inst-ms-3',
              step: 3,
              title: 'Dengarkan Respons',
              content: 'Setelah berbicara, dengarkan dengan sepenuh hati. Perhatikan tidak hanya kata-kata, tapi juga bahasa tubuh dan nada bicara lawan bicara.',
              duration: 420,
              type: 'practice'
            }
          ],
          interactiveElements: [
            {
              id: 'elem-ms-1',
              type: 'text-input',
              title: 'Situasi di mana Anda ingin menerapkan mindful speaking',
              description: 'Pikirkan situasi komunikasi yang sering menantang Anda',
              placeholder: 'Ketika memberikan feedback kepada junior...',
              required: false
            }
          ],
          reflectionPrompts: [
            'Bagaimana perasaan Anda ketika berbicara dengan lebih mindful?',
            'Apa tantangan terbesar dalam menerapkan mindful speaking?',
            'Bagaimana orang lain merespons cara komunikasi yang lebih sadar ini?'
          ],
          difficulty: 'menengah',
          order: 1,
          tags: ['mindful-speaking', 'communication', 'cultural-awareness'],
          isOptional: false,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ],
      estimatedDuration: 25,
      objectives: [
        'Mengembangkan komunikasi yang sadar dan autentik',
        'Mengurangi miscommunication dan konflik',
        'Membangun hubungan yang lebih dalam',
        'Menintegrasikan nilai budaya dalam komunikasi'
      ],
      prerequisites: ['att-breathing-9point', 'awa-emotional-granularity'],
      difficulty: 'menengah',
      order: 1,
      isCore: true,
      tags: ['communication', 'mindful-speaking', 'relationships'],
      instructions: [
        'Praktikkan dengan orang terdekat dulu sebelum situasi yang lebih formal',
        'Ingat prinsip "Basa-basi" dalam budaya Indonesia sebagai cara membangun rapport',
        'Perhatikan konteks hierarki dan usia dalam komunikasi',
        'Gunakan bahasa tubuh yang terbuka dan menghormati'
      ],
      tips: [
        'Mindful speaking mengurangi reaktivitas dan meningkatkan kualitas hubungan',
        'Dalam budaya Indonesia, waktu dan konteks sangat penting',
        'Praktik ini membantu dalam negosiasi dan resolusi konflik',
        'Mulai dengan komunikasi sehari-hari sebelum situasi yang lebih sulit'
      ],
      scientificBackground: 'Penelitian menunjukkan bahwa mindful communication meningkatkan kepuasan hubungan dan mengurangi konfliks. Aktivasi prefrontal cortex membantu regulasi emosi selama komunikasi.',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // 2. Difficult Conversations
    modules.push({
      id: 'soc-difficult-conversations',
      title: 'Navigasi Percakapan Sulit',
      description: 'Menghadapi percakapan yang menantang dengan mindfulness dan keterampilan komunikasi',
      category: 'siy-social',
      subcategory: 'Difficult Conversations',
      exercises: [
        {
          id: 'ex-difficult-conversation-prep',
          moduleId: 'soc-difficult-conversations',
          title: 'Persiapan Percakapan Sulit',
          description: 'Mempersiapkan diri secara mental dan emosional untuk percakapan yang menantang',
          type: 'difficult-conversations',
          duration: 22,
          instructions: [
            {
              id: 'inst-dc-1',
              step: 1,
              title: 'Klarifikasi Intensi Anda',
              content: 'Tanyakan: "Apa yang benar-benar saya inginkan dari percakapan ini? Apakah saya ingin menang, atau membangun pemahaman?"',
              duration: 300,
              type: 'setup'
            },
            {
              id: 'inst-dc-2',
              step: 2,
              title: 'Regulasi Emosi Diri',
              content: 'Gunakan teknik STOP. Pastikan Anda dalam keadaan tenang sebelum memulai percakapan.',
              duration: 240,
              type: 'practice'
            },
            {
              id: 'inst-dc-3',
              step: 3,
              title: 'Visualisasi Perspektif Mereka',
              content: 'Bayangkan bagaimana orang tersebut mungkin melihat situasi ini. Apa kebutuhan dan ketakutan mereka?',
              duration: 360,
              type: 'practice'
            },
            {
              id: 'inst-dc-4',
              step: 4,
              title: 'Rencanakan Pendekatan Konstruktif',
              content: 'Pikirkan cara memulai yang tidak defensif. Dalam budaya Indonesia, mulai dengan membangun rapport dan menunjukkan penghormatan.',
              duration: 420,
              type: 'practice'
            }
          ],
          interactiveElements: [
            {
              id: 'elem-dc-1',
              type: 'text-input',
              title: 'Percakapan sulit yang akan Anda hadapi',
              description: 'Ceritakan situasinya',
              placeholder: 'Saya perlu berbicara dengan atasan tentang...',
              required: false
            },
            {
              id: 'elem-dc-2',
              type: 'multiple-choice',
              title: 'Apa hasil yang Anda harapkan?',
              description: 'Pilih intensi utama Anda',
              options: ['Pemahaman mutual', 'Solusi konkret', 'Perbaikan hubungan', 'Klarifikasi ekspektasi'],
              required: false
            }
          ],
          reflectionPrompts: [
            'Bagaimana persiapan ini mengubah perasaan Anda tentang percakapan tersebut?',
            'Apa ketakutan terbesar Anda tentang percakapan ini?',
            'Bagaimana Anda bisa mendekati ini dengan compassion untuk kedua belah pihak?'
          ],
          difficulty: 'lanjutan',
          order: 1,
          tags: ['difficult-conversations', 'conflict-resolution', 'communication'],
          isOptional: false,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ],
      estimatedDuration: 30,
      objectives: [
        'Mengembangkan keterampilan navigasi percakapan sulit',
        'Mengurangi anxiety dan reaktivitas dalam konflik',
        'Meningkatkan kemampuan resolusi konflik',
        'Membangun hubungan yang lebih kuat melalui komunikasi yang jujur'
      ],
      prerequisites: ['soc-mindful-speaking', 'reg-stop-technique'],
      difficulty: 'lanjutan',
      order: 2,
      isCore: true,
      tags: ['difficult-conversations', 'conflict-resolution', 'communication'],
      instructions: [
        'Jangan memaksakan percakapan saat emosi sedang tinggi',
        'Dalam budaya Indonesia, berikan ruang untuk "saving face"',
        'Gunakan "I statements" daripada "You statements"',
        'Siap untuk mendengar hal-hal yang mungkin sulit diterima'
      ],
      tips: [
        'Percakapan sulit adalah kesempatan untuk memperdalam hubungan',
        'Fokus pada perilaku spesifik, bukan karakter personal',
        'Dalam konteks Indonesia, pertimbangkan timing dan setting yang tepat',
        'Kadang perlu beberapa percakapan untuk mencapai resolusi'
      ],
      scientificBackground: 'Penelitian menunjukkan bahwa persiapan mindful untuk percakapan sulit mengurangi cortisol dan meningkatkan outcomes positif. Regulasi emosi proaktif mengaktifkan prefrontal cortex.',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    return modules;
  }

  /**
   * HAPPINESS & COMPASSION TRAINING MODULES
   */
  
  private async generateHappinessCompassionModules(): Promise<SIYModule[]> {
    const modules: SIYModule[] = [];

    // 1. Three Easy Steps to Happiness (Meng's Framework)
    modules.push({
      id: 'hap-three-steps',
      title: 'Tiga Langkah Mudah Menuju Kebahagiaan',
      description: 'Framework Chade-Meng Tan untuk mengembangkan kebahagiaan berkelanjutan',
      category: 'siy-happiness',
      subcategory: 'Three Steps to Happiness',
      exercises: [
        {
          id: 'ex-happiness-framework',
          moduleId: 'hap-three-steps',
          title: 'Praktik Tiga Langkah Kebahagiaan',
          description: 'Menerapkan tiga langkah: inclining the mind toward joy, inviting happiness, dan creating conditions for happiness',
          type: 'happiness',
          duration: 20,
          instructions: [
            {
              id: 'inst-hf-1',
              step: 1,
              title: 'Langkah 1: Condong ke Kegembiraan',
              content: 'Selama 2 menit, aktif cari hal-hal kecil yang bisa disyukuri saat ini. Bisa secangkir teh hangat, sinar matahari, atau napas yang mengalir dengan lancar.',
              duration: 120,
              type: 'practice'
            },
            {
              id: 'inst-hf-2',
              step: 2,
              title: 'Langkah 2: Undang Kebahagiaan',
              content: 'Ingat momen kebahagiaan dari masa lalu. Hidupkan kembali memori itu dengan detail. Rasakan bagaimana kebahagiaan itu kembali muncul di tubuh Anda.',
              duration: 360,
              type: 'practice'
            },
            {
              id: 'inst-hf-3',
              step: 3,
              title: 'Langkah 3: Ciptakan Kondisi Kebahagiaan',
              content: 'Pikirkan satu tindakan kecil yang bisa Anda lakukan hari ini untuk menciptakan kebahagiaan - bagi diri sendiri atau orang lain. Komitmen untuk melakukannya.',
              duration: 300,
              type: 'practice'
            },
            {
              id: 'inst-hf-4',
              step: 4,
              title: 'Integrasikan dalam Keseharian',
              content: 'Rencanakan bagaimana mengintegrasikan ketiga langkah ini dalam rutinitas harian Anda. Kebahagiaan adalah keterampilan yang bisa dilatih.',
              duration: 180,
              type: 'reflection'
            }
          ],
          interactiveElements: [
            {
              id: 'elem-hf-1',
              type: 'text-input',
              title: 'Tindakan kebahagiaan yang akan Anda lakukan hari ini',
              description: 'Komitmen konkret untuk menciptakan kebahagiaan',
              placeholder: 'Saya akan menelepon teman lama untuk...',
              required: false
            },
            {
              id: 'elem-hf-2',
              type: 'scale',
              title: 'Level kebahagiaan Anda sekarang',
              description: 'Rate dari 1-10 setelah praktik',
              min: 1,
              max: 10,
              required: false
            }
          ],
          reflectionPrompts: [
            'Langkah mana yang paling mudah/sulit bagi Anda?',
            'Bagaimana perasaan Anda berubah selama latihan ini?',
            'Apa yang Anda pelajari tentang sifat kebahagiaan?'
          ],
          difficulty: 'pemula',
          order: 1,
          tags: ['happiness', 'joy', 'wellbeing'],
          isOptional: false,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ],
      estimatedDuration: 25,
      objectives: [
        'Memahami kebahagiaan sebagai keterampilan yang bisa dilatih',
        'Mengembangkan kemampuan menciptakan kebahagiaan secara sengaja',
        'Meningkatkan baseline kebahagiaan melalui praktik rutin',
        'Membangun sustainable well-being'
      ],
      prerequisites: ['att-breathing-9point'],
      difficulty: 'pemula',
      order: 1,
      isCore: true,
      tags: ['happiness', 'wellbeing', 'joy'],
      instructions: [
        'Praktik ini paling efektif jika dilakukan secara konsisten',
        'Mulai dengan ekspektasi yang realistis - perubahan kecil yang konsisten',
        'Kebahagiaan bukan tentang selalu merasa gembira, tapi tentang kepuasan hidup',
        'Bagikan kebahagiaan dengan orang lain untuk memperkuat efeknya'
      ],
      tips: [
        'Kebahagiaan adalah byproduct dari kehidupan yang bermakna',
        'Praktik ini berdasarkan neuroscience - otak bisa dilatih untuk lebih bahagia',
        'Dalam budaya Indonesia, kebahagiaan sering terkait dengan keharmonisan keluarga dan komunitas',
        'Kebahagiaan yang berkelanjutan datang dari dalam, bukan dari circumstances eksternal'
      ],
      scientificBackground: 'Penelitian positive psychology menunjukkan bahwa 50% kebahagiaan ditentukan genetik, 10% oleh circumstances, dan 40% oleh aktivitas yang kita pilih. Praktik ini melatih 40% yang bisa dikontrol.',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // 2. Gratitude and Appreciation
    modules.push({
      id: 'hap-gratitude',
      title: 'Praktik Syukur dan Apresiasi',
      description: 'Mengembangkan rasa syukur yang mendalam untuk meningkatkan kebahagiaan dan wellbeing',
      category: 'siy-happiness',
      subcategory: 'Gratitude Practice',
      exercises: [
        {
          id: 'ex-gratitude-meditation',
          moduleId: 'hap-gratitude',
          title: 'Meditasi Syukur dengan Nilai Indonesia',
          description: 'Praktik syukur yang mengintegrasikan nilai-nilai budaya Indonesia',
          type: 'gratitude',
          duration: 15,
          instructions: [
            {
              id: 'inst-gm-1',
              step: 1,
              title: 'Syukur untuk Tubuh dan Hidup',
              content: 'Mulai dengan bersyukur untuk napas, jantung yang berdetak, dan tubuh yang sehat. "Alhamdulillah untuk hidup yang diberikan."',
              duration: 180,
              type: 'practice'
            },
            {
              id: 'inst-gm-2',
              step: 2,
              title: 'Syukur untuk Keluarga dan Orang Terkasih',
              content: 'Rasakan syukur mendalam untuk keluarga, teman, dan orang-orang yang mendukung Anda. Dalam tradisi Indonesia, keluarga adalah segalanya.',
              duration: 240,
              type: 'practice'
            },
            {
              id: 'inst-gm-3',
              step: 3,
              title: 'Syukur untuk Kesempatan dan Tantangan',
              content: 'Bersyukur untuk kesempatan belajar dan tumbuh, bahkan dari tantangan. "Setiap kesulitan adalah kesempatan untuk berkembang."',
              duration: 180,
              type: 'practice'
            },
            {
              id: 'inst-gm-4',
              step: 4,
              title: 'Syukur untuk Indonesia dan Dunia',
              content: 'Luaskan rasa syukur untuk tanah air, alam Indonesia yang indah, dan kesempatan hidup di bumi ini.',
              duration: 120,
              type: 'practice'
            }
          ],
          interactiveElements: [
            {
              id: 'elem-gm-1',
              type: 'text-input',
              title: 'Tiga hal yang paling Anda syukuri hari ini',
              description: 'Tuliskan dengan spesifik',
              placeholder: '1. Keluarga yang sehat\n2. Pekerjaan yang bermakna\n3. Cuaca yang indah',
              required: false
            }
          ],
          reflectionPrompts: [
            'Bagaimana perasaan Anda setelah praktik syukur ini?',
            'Hal apa yang mengejutkan Anda saat merefleksikan hal-hal yang patut disyukuri?',
            'Bagaimana rasa syukur ini bisa mempengaruhi hari Anda?'
          ],
          difficulty: 'pemula',
          order: 1,
          tags: ['gratitude', 'appreciation', 'wellbeing'],
          isOptional: false,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ],
      estimatedDuration: 20,
      objectives: [
        'Mengembangkan rasa syukur yang konsisten dan mendalam',
        'Meningkatkan apresiasi terhadap kehidupan sehari-hari',
        'Membangun perspektif positif terhadap tantangan',
        'Memperkuat koneksi dengan nilai-nilai budaya Indonesia'
      ],
      prerequisites: ['hap-three-steps'],
      difficulty: 'pemula',
      order: 2,
      isCore: true,
      tags: ['gratitude', 'appreciation', 'cultural-values'],
      instructions: [
        'Praktik syukur paling efektif jika dilakukan di waktu yang sama setiap hari',
        'Cobalah menulis jurnal syukur sebagai pelengkap praktik ini',
        'Bagikan rasa syukur dengan orang lain - ini memperkuat efeknya',
        'Ingat bahwa syukur bukan tentang menyangkal kesulitan, tapi mengakui hal-hal baik'
      ],
      tips: [
        'Penelitian menunjukkan praktik syukur meningkatkan kebahagiaan hingga 25%',
        'Syukur adalah obat alami untuk depresi dan anxiety',
        'Dalam Islam dan budaya Indonesia, syukur adalah bentuk ibadah',
        'Fokus pada hal-hal kecil yang sering diabaikan akan memperdalam praktik ini'
      ],
      scientificBackground: 'Neuroimaging menunjukkan bahwa praktik syukur mengaktifkan area reward di otak dan meningkatkan produksi dopamine dan serotonin. Studi longitudinal menunjukkan efek jangka panjang pada wellbeing.',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    return modules;
  }

  /**
   * WORKPLACE APPLICATION MODULES
   */
  
  private async generateWorkplaceApplicationModules(): Promise<SIYModule[]> {
    const modules: SIYModule[] = [];

    // 1. Mindful Email and Communication
    modules.push({
      id: 'work-mindful-email',
      title: 'Komunikasi Digital yang Mindful',
      description: 'Menerapkan mindfulness dalam email, chat, dan komunikasi digital untuk mengurangi stress dan meningkatkan efektivitas',
      category: 'siy-workplace',
      subcategory: 'Digital Communication',
      exercises: [
        {
          id: 'ex-email-mindfulness',
          moduleId: 'work-mindful-email',
          title: 'Praktik Email Mindful',
          description: 'Transformasi cara Anda menulis, membaca, dan merespons email dengan kesadaran penuh',
          type: 'email-communication',
          duration: 12,
          instructions: [
            {
              id: 'inst-em-1',
              step: 1,
              title: 'Pause Sebelum Membuka Email',
              content: 'Sebelum membuka inbox, ambil 3 napas sadar. Set intentsi: "Saya akan merespons dengan bijaksana dan konstruktif."',
              duration: 60,
              type: 'setup'
            },
            {
              id: 'inst-em-2',
              step: 2,
              title: 'Baca dengan Perhatian Penuh',
              content: 'Baca setiap email dengan fokus. Jangan multitasking. Coba pahami niat pengirim, bukan hanya kata-katanya.',
              duration: 240,
              type: 'practice'
            },
            {
              id: 'inst-em-3',
              step: 3,
              title: 'Check Emotional State Sebelum Reply',
              content: 'Sebelum membalas, tanyakan: "Apa yang saya rasakan? Apakah saya perlu pause dulu?" Jika emosi tinggi, tunggu 24 jam.',
              duration: 120,
              type: 'practice'
            },
            {
              id: 'inst-em-4',
              step: 4,
              title: 'Tulis dengan Clarity dan Compassion',
              content: 'Tulis balasan yang jelas, ringkas, dan menghormati. Dalam budaya Indonesia, selalu awali dengan salam dan apresiasi.',
              duration: 300,
              type: 'practice'
            }
          ],
          interactiveElements: [
            {
              id: 'elem-em-1',
              type: 'text-input',
              title: 'Email yang menantang yang perlu Anda tangani',
              description: 'Ceritakan situasinya (tanpa nama spesifik)',
              placeholder: 'Email dari klien yang kecewa karena...',
              required: false
            }
          ],
          reflectionPrompts: [
            'Bagaimana email mindful mengubah pengalaman kerja Anda?',
            'Apa tantangan terbesar dalam menerapkan mindfulness pada komunikasi digital?',
            'Bagaimana orang lain merespons komunikasi digital Anda yang lebih mindful?'
          ],
          difficulty: 'menengah',
          order: 1,
          tags: ['email', 'digital-communication', 'workplace'],
          isOptional: false,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ],
      estimatedDuration: 15,
      objectives: [
        'Mengurangi stress dari komunikasi digital',
        'Meningkatkan clarity dan efektivitas komunikasi',
        'Mencegah miscommunication dan konflik digital',
        'Membangun relationships yang lebih baik melalui komunikasi digital'
      ],
      prerequisites: ['soc-mindful-speaking', 'reg-stop-technique'],
      difficulty: 'menengah',
      order: 1,
      isCore: true,
      tags: ['workplace', 'digital-communication', 'email'],
      instructions: [
        'Mulai dengan email yang tidak emosional untuk membangun habit',
        'Gunakan fitur draft untuk email yang sensitif',
        'Ingat bahwa email tidak menangkap nuance - gunakan video call untuk topik kompleks',
        'Dalam budaya Indonesia, relationship building melalui komunikasi digital tetap penting'
      ],
      tips: [
        'Email mindful mengurangi kesalahpahaman hingga 50%',
        'Gunakan "pause sebelum send" sebagai habit baru',
        'Response time yang sedikit lebih lama untuk quality lebih baik',
        'Email yang terlalu panjang often tidak dibaca - be concise'
      ],
      scientificBackground: 'Penelitian menunjukkan bahwa multitasking saat komunikasi digital mengurangi comprehension hingga 40%. Mindful communication meningkatkan psychological safety di tim.',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // 2. Mindful Meetings
    modules.push({
      id: 'work-mindful-meetings',
      title: 'Rapat Mindful dan Efektif',
      description: 'Mengubah rapat menjadi lebih produktif, engaging, dan meaningful melalui mindfulness',
      category: 'siy-workplace',
      subcategory: 'Mindful Meetings',
      exercises: [
        {
          id: 'ex-meeting-facilitation',
          moduleId: 'work-mindful-meetings',
          title: 'Memfasilitasi Rapat dengan Mindfulness',
          description: 'Teknik memimpin rapat yang lebih mindful dan produktif',
          type: 'mindful-meetings',
          duration: 15,
          instructions: [
            {
              id: 'inst-mf-1',
              step: 1,
              title: 'Opening Mindful',
              content: 'Mulai rapat dengan 1 menit mindful breathing bersama. "Mari kita mulai dengan hadir sepenuhnya." Ini membantu semua orang transition dan fokus.',
              duration: 240,
              type: 'practice'
            },
            {
              id: 'inst-mf-2',
              step: 2,
              title: 'Set Intention dan Tujuan yang Jelas',
              content: 'Sampaikan tujuan rapat dengan jelas. Tanyakan: "Apa yang kita ingin capai bersama?" Pastikan semua aligned.',
              duration: 180,
              type: 'practice'
            },
            {
              id: 'inst-mf-3',
              step: 3,
              title: 'Deep Listening dan Speaking',
              content: 'Encourage deep listening. Gunakan "talking stick" mindset - satu orang bicara, yang lain listening with full attention.',
              duration: 480,
              type: 'practice'
            },
            {
              id: 'inst-mf-4',
              step: 4,
              title: 'Mindful Closing',
              content: 'Akhiri dengan refleksi: "Apa insight terpenting dari rapat ini? Apa action items yang jelas?" Give appreciation untuk partisipasi.',
              duration: 180,
              type: 'practice'
            }
          ],
          interactiveElements: [
            {
              id: 'elem-mf-1',
              type: 'multiple-choice',
              title: 'Tantangan terbesar dalam rapat di tempat kerja Anda?',
              description: 'Pilih yang paling relevan',
              options: ['Peserta tidak fokus', 'Tidak ada keputusan jelas', 'Dominasi oleh beberapa orang', 'Terlalu panjang dan tidak efisien'],
              required: false
            }
          ],
          reflectionPrompts: [
            'Bagaimana rapat mindful mengubah dynamic tim Anda?',
            'Apa yang paling menantang dalam memfasilitasi rapat mindful?',
            'Bagaimana participants merespons approach yang lebih mindful ini?'
          ],
          difficulty: 'lanjutan',
          order: 1,
          tags: ['meetings', 'facilitation', 'leadership'],
          isOptional: false,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ],
      estimatedDuration: 20,
      objectives: [
        'Meningkatkan efektivitas dan produktivitas rapat',
        'Menciptakan psychological safety dalam diskusi tim',
        'Mengembangkan skills facilitation yang mindful',
        'Mengurangi meeting fatigue dan meningkatkan engagement'
      ],
      prerequisites: ['soc-mindful-speaking', 'emp-perspective-taking'],
      difficulty: 'lanjutan',
      order: 2,
      isCore: true,
      tags: ['meetings', 'leadership', 'facilitation'],
      instructions: [
        'Mulai dengan rapat tim kecil sebelum rapat besar',
        'Inform participants sebelumnya tentang approach mindful yang akan digunakan',
        'Prepare dengan baik - mindful tidak berarti unprepared',
        'Dalam kultur Indonesia, respect untuk hierarki tetap penting dalam rapat mindful'
      ],
      tips: [
        'Rapat mindful typically 30% lebih pendek tapi 50% lebih efektif',
        'Silent moments dalam rapat are powerful - don\'t fill every pause',
        'Model the behavior - jika leader mindful, tim akan follow',
        'Use technology mindfully - phones away, laptops closed when possible'
      ],
      scientificBackground: 'Penelitian menunjukkan bahwa opening mindful dalam rapat meningkatkan psychological safety dan creative thinking. Mindful facilitation mengurangi groupthink dan meningkatkan diverse perspectives.',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // 3. Stress Management at Work
    modules.push({
      id: 'work-stress-management',
      title: 'Manajemen Stres di Tempat Kerja',
      description: 'Teknik praktis untuk mengelola stres dan tekanan di lingkungan kerja dengan mindfulness',
      category: 'siy-workplace',
      subcategory: 'Stress Management',
      exercises: [
        {
          id: 'ex-workplace-stress-relief',
          moduleId: 'work-stress-management',
          title: 'Teknik Cepat Mengatasi Stres Kerja',
          description: 'Praktik 5 menit untuk mengatasi stres akut di tempat kerja',
          type: 'workplace-mindfulness',
          duration: 8,
          instructions: [
            {
              id: 'inst-ws-1',
              step: 1,
              title: 'Identifikasi Sumber Stres',
              content: 'Pause sejenak. Identifikasi apa yang membuat stres: deadline, konflik, beban kerja, atau ketidakpastian?',
              duration: 60,
              type: 'setup'
            },
            {
              id: 'inst-ws-2',
              step: 2,
              title: 'Napas Pereda Stres 4-7-8',
              content: 'Tarik napas selama 4 hitungan, tahan 7 hitungan, buang napas 8 hitungan. Ulangi 4 kali.',
              duration: 120,
              type: 'practice',
              breathingPattern: '4-7-8 breathing pattern'
            },
            {
              id: 'inst-ws-3',
              step: 3,
              title: 'Body Scan Cepat',
              content: 'Scan tubuh dari kepala ke kaki. Lepaskan ketegangan di bahu, rahang, dan perut. Dalam budaya kerja Indonesia, tetap terlihat profesional.',
              duration: 90,
              type: 'practice'
            },
            {
              id: 'inst-ws-4',
              step: 4,
              title: 'Reframe Situasi',
              content: 'Tanyakan: "Apa yang bisa saya kontrol? Apa pelajaran dari situasi ini? Bagaimana saya bisa merespons dengan bijak?"',
              duration: 90,
              type: 'reflection'
            }
          ],
          interactiveElements: [
            {
              id: 'elem-ws-1',
              type: 'scale',
              title: 'Level stres Anda sebelum praktik (1-10)',
              description: 'Rate tingkat stres Anda',
              min: 1,
              max: 10,
              required: false
            },
            {
              id: 'elem-ws-2',
              type: 'scale',
              title: 'Level stres Anda setelah praktik (1-10)',
              description: 'Rate tingkat stres Anda sekarang',
              min: 1,
              max: 10,
              required: false
            }
          ],
          reflectionPrompts: [
            'Teknik mana yang paling efektif untuk situasi stres Anda?',
            'Bagaimana Anda bisa mengintegrasikan ini dalam rutinitas kerja?',
            'Apa early warning signs stres yang perlu Anda waspadai?'
          ],
          difficulty: 'pemula',
          order: 1,
          tags: ['stress-management', 'workplace', 'quick-relief'],
          isOptional: false,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ],
      estimatedDuration: 12,
      objectives: [
        'Mengurangi level stres akut di tempat kerja',
        'Mengembangkan resiliensi terhadap tekanan kerja',
        'Meningkatkan clarity dalam pengambilan keputusan saat stres',
        'Mencegah burnout dan kelelahan kronis'
      ],
      prerequisites: ['att-breathing-9point', 'reg-stop-technique'],
      difficulty: 'pemula',
      order: 3,
      isCore: true,
      tags: ['workplace', 'stress-management', 'resilience'],
      instructions: [
        'Gunakan teknik ini secara preventif, tidak hanya saat stres tinggi',
        'Cari ruang privat jika memungkinkan, atau lakukan secara diskret',
        'Dalam budaya Indonesia, jaga profesionalisme sambil merawat diri',
        'Komunikasikan kebutuhan istirahat dengan supervisor jika diperlukan'
      ],
      tips: [
        'Stres adalah sinyal bahwa ada sesuatu yang perlu perhatian',
        'Mindfulness membantu merespons, bukan bereaksi terhadap stres',
        'Regular practice membuat teknik ini lebih efektif saat dibutuhkan',
        'Ingat bahwa mengurus kesehatan mental adalah tanggung jawab profesional'
      ],
      scientificBackground: 'Penelitian menunjukkan bahwa teknik mindfulness mengurangi kortisol dan mengaktifkan parasympathetic nervous system. Workplace mindfulness programs terbukti mengurangi burnout hingga 25%.',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // 4. Mindful Leadership Exercises
    modules.push({
      id: 'work-mindful-leadership',
      title: 'Latihan Kepemimpinan Mindful',
      description: 'Mengembangkan gaya kepemimpinan yang empati, autentik, dan efektif melalui mindfulness',
      category: 'siy-workplace',
      subcategory: 'Mindful Leadership',
      exercises: [
        {
          id: 'ex-mindful-leadership-presence',
          moduleId: 'work-mindful-leadership',
          title: 'Membangun Presence sebagai Pemimpin',
          description: 'Mengembangkan kehadiran yang tenang, fokus, dan inspiring sebagai pemimpin',
          type: 'leadership',
          duration: 15,
          instructions: [
            {
              id: 'inst-ml-1',
              step: 1,
              title: 'Grounding sebelum Memimpin',
              content: 'Sebelum meeting atau interaksi kepemimpinan, ambil 2 menit untuk grounding. Rasakan kaki di lantai, napas yang stabil.',
              duration: 120,
              type: 'setup'
            },
            {
              id: 'inst-ml-2',
              step: 2,
              title: 'Set Leadership Intention',
              content: 'Tanyakan: "Bagaimana saya ingin menunjukkan kepemimpinan hari ini? Apa yang tim butuhkan dari saya?" Set intensi yang jelas.',
              duration: 90,
              type: 'practice'
            },
            {
              id: 'inst-ml-3',
              step: 3,
              title: 'Mindful Listening sebagai Pemimpin',
              content: 'Saat berinteraksi dengan tim, dengarkan tidak hanya kata-kata, tapi juga emosi dan kebutuhan yang tidak terucap. Berikan space untuk diverse perspectives.',
              duration: 300,
              type: 'practice'
            },
            {
              id: 'inst-ml-4',
              step: 4,
              title: 'Responsive Leadership',
              content: 'Sebelum membuat keputusan atau memberikan feedback, pause sejenak. Respons dari tempat yang tenang dan wise, bukan reaktif.',
              duration: 180,
              type: 'practice'
            }
          ],
          interactiveElements: [
            {
              id: 'elem-ml-1',
              type: 'text-input',
              title: 'Tantangan kepemimpinan yang sedang Anda hadapi',
              description: 'Situasi yang membutuhkan mindful leadership approach',
              placeholder: 'Tim saya terlihat demotivasi karena...',
              required: false
            },
            {
              id: 'elem-ml-2',
              type: 'multiple-choice',
              title: 'Gaya kepemimpinan yang ingin Anda kembangkan',
              description: 'Aspek mana yang paling ingin diperkuat?',
              options: ['Empati dan pemahaman', 'Ketegasan yang bijak', 'Inspirasi dan visi', 'Authentic communication'],
              required: false
            }
          ],
          reflectionPrompts: [
            'Bagaimana mindfulness mengubah gaya kepemimpinan Anda?',
            'Apa reaksi tim terhadap leadership presence yang lebih mindful?',
            'Dalam konteks budaya Indonesia, bagaimana Anda menyeimbangkan authority dengan humility?'
          ],
          difficulty: 'menengah',
          order: 1,
          tags: ['leadership', 'presence', 'team-management'],
          isOptional: false,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ],
      estimatedDuration: 18,
      objectives: [
        'Mengembangkan presence yang kuat sebagai pemimpin',
        'Meningkatkan kemampuan decision-making yang wise',
        'Membangun trust dan psychological safety dalam tim',
        'Mengintegrasikan nilai-nilai kepemimpinan Indonesia dengan mindfulness'
      ],
      prerequisites: ['awa-emotional-granularity', 'soc-mindful-speaking'],
      difficulty: 'menengah',
      order: 4,
      isCore: true,
      tags: ['workplace', 'leadership', 'team-management'],
      instructions: [
        'Leadership mindfulness bukan tentang menjadi soft, tapi wise dan decisive',
        'Dalam budaya Indonesia, hormati hirarki sambil memberdayakan tim',
        'Model perilaku mindful untuk tim Anda',
        'Berikan feedback yang constructive dengan compassion'
      ],
      tips: [
        'Mindful leaders menciptakan space untuk orang lain berkembang',
        'Authenticity adalah kunci kepemimpinan yang sustainable',
        'Dalam konteks Indonesia, kepemimpinan yang melayani sangat dihargai',
        'Regular self-reflection membuat Anda menjadi pemimpin yang lebih baik'
      ],
      scientificBackground: 'Penelitian Google Project Oxygen menunjukkan bahwa emotional intelligence adalah predictor terkuat effective leadership. Mindful leadership meningkatkan employee engagement hingga 40%.',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // 5. Team Building with Emotional Intelligence
    modules.push({
      id: 'work-team-building-ei',
      title: 'Team Building dengan Kecerdasan Emosional',
      description: 'Membangun kohesi tim yang kuat melalui understanding emosional dan komunikasi yang empati',
      category: 'siy-workplace',
      subcategory: 'Team Emotional Intelligence',
      exercises: [
        {
          id: 'ex-team-emotional-sync',
          moduleId: 'work-team-building-ei',
          title: 'Sinkronisasi Emosional Tim',
          description: 'Praktik untuk membangun emotional awareness dan connection dalam tim',
          type: 'team-building',
          duration: 20,
          instructions: [
            {
              id: 'inst-te-1',
              step: 1,
              title: 'Team Emotional Check-in',
              content: 'Mulai meeting dengan emotional check-in. Setiap anggota share current emotional state dalam 1-2 kata. Tidak ada judgment, hanya awareness.',
              duration: 300,
              type: 'practice'
            },
            {
              id: 'inst-te-2',
              step: 2,
              title: 'Collective Breathing',
              content: 'Lakukan 3 napas bersama sebagai tim. Ini menciptakan physiological synchrony dan sense of unity.',
              duration: 90,
              type: 'practice',
              breathingPattern: 'Synchronized team breathing'
            },
            {
              id: 'inst-te-3',
              step: 3,
              title: 'Empathy Circle',
              content: 'Satu orang share challenge/success, yang lain practice mindful listening. Rotasi hingga semua berbagi. Fokus pada understanding, bukan solving.',
              duration: 600,
              type: 'practice'
            },
            {
              id: 'inst-te-4',
              step: 4,
              title: 'Collective Intention Setting',
              content: 'Sebagai tim, set intention untuk collaboration hari ini. Apa yang ingin kita wujudkan bersama? Bagaimana kita ingin bekerja sama?',
              duration: 180,
              type: 'practice'
            }
          ],
          interactiveElements: [
            {
              id: 'elem-te-1',
              type: 'multiple-choice',
              title: 'Dynamic tim Anda saat ini',
              description: 'Bagaimana kondisi emotional connection dalam tim?',
              options: ['Sangat connected', 'Cukup harmonis', 'Ada beberapa tension', 'Butuh improvement'],
              required: false
            },
            {
              id: 'elem-te-2',
              type: 'text-input',
              title: 'Goal team building yang ingin dicapai',
              description: 'Apa yang ingin diperbaiki dalam dynamic tim?',
              placeholder: 'Kami ingin lebih saling mendukung saat...',
              required: false
            }
          ],
          reflectionPrompts: [
            'Bagaimana emotional awareness mengubah dynamic tim Anda?',
            'Apa yang Anda pelajari tentang rekan kerja melalui exercise ini?',
            'Bagaimana Anda bisa maintain connection ini dalam pekerjaan sehari-hari?'
          ],
          difficulty: 'menengah',
          order: 1,
          tags: ['team-building', 'emotional-intelligence', 'collaboration'],
          isOptional: false,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ],
      estimatedDuration: 25,
      objectives: [
        'Meningkatkan emotional connection dalam tim',
        'Mengembangkan psychological safety',
        'Memperkuat komunikasi dan collaboration',
        'Membangun resiliensi tim dalam menghadapi challenges'
      ],
      prerequisites: ['emp-just-like-me', 'soc-mindful-speaking'],
      difficulty: 'menengah',
      order: 5,
      isCore: true,
      tags: ['workplace', 'team-building', 'emotional-intelligence'],
      instructions: [
        'Start small - tidak semua tim siap untuk deep emotional sharing',
        'Dalam budaya Indonesia, respect individual comfort levels',
        'Leader perlu model vulnerability dan authenticity',
        'Consistency lebih penting daripada intensity'
      ],
      tips: [
        'Team emotional intelligence adalah competitive advantage',
        'High-performing teams memiliki high emotional awareness',
        'Dalam konteks Indonesia, gotong royong adalah foundation natural',
        'Conflict yang dikelola dengan baik justru memperkuat tim'
      ],
      scientificBackground: 'Penelitian Daniel Goleman menunjukkan bahwa team IQ bergantung pada emotional intelligence anggotanya. Tim dengan high EI memiliki performance 20% lebih baik.',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // 6. Performance Optimization through Mindfulness
    modules.push({
      id: 'work-performance-optimization',
      title: 'Optimalisasi Performa melalui Mindfulness',
      description: 'Menggunakan mindfulness untuk meningkatkan fokus, kreativitas, dan efisiensi kerja',
      category: 'siy-workplace',
      subcategory: 'Performance Enhancement',
      exercises: [
        {
          id: 'ex-mindful-productivity',
          moduleId: 'work-performance-optimization',
          title: 'Produktivitas Mindful',
          description: 'Teknik mengoptimalkan performa kerja dengan awareness dan intentionality',
          type: 'performance-feedback',
          duration: 18,
          instructions: [
            {
              id: 'inst-mp-1',
              step: 1,
              title: 'Mindful Task Prioritization',
              content: 'Sebelum memulai hari kerja, duduk sejenak. List semua task, lalu prioritas berdasarkan impact dan urgency dengan full awareness.',
              duration: 300,
              type: 'setup'
            },
            {
              id: 'inst-mp-2',
              step: 2,
              title: 'Single-Tasking Practice',
              content: 'Pilih satu task prioritas tinggi. Commit untuk focus 100% tanpa distraction selama 25 menit (Pomodoro mindful).',
              duration: 1500,
              type: 'practice'
            },
            {
              id: 'inst-mp-3',
              step: 3,
              title: 'Mindful Transition',
              content: 'Antara tasks, ambil 2 menit mindful break. Napas 3x, stretch ringan, set intention untuk task berikutnya.',
              duration: 120,
              type: 'transition'
            },
            {
              id: 'inst-mp-4',
              step: 4,
              title: 'End-of-Day Reflection',
              content: 'Review hari kerja dengan awareness: Apa yang well-executed? Apa yang bisa diperbaiki? Apa yang akan difocus besok?',
              duration: 300,
              type: 'reflection'
            }
          ],
          interactiveElements: [
            {
              id: 'elem-mp-1',
              type: 'scale',
              title: 'Level focus Anda hari ini (1-10)',
              description: 'Seberapa focused Anda dalam bekerja?',
              min: 1,
              max: 10,
              required: false
            },
            {
              id: 'elem-mp-2',
              type: 'text-input',
              title: 'Distraction terbesar dalam bekerja',
              description: 'Apa yang paling sering mengganggu focus Anda?',
              placeholder: 'Email notifications, social media, thoughts about...',
              required: false
            }
          ],
          reflectionPrompts: [
            'Bagaimana single-tasking mengubah kualitas pekerjaan Anda?',
            'Apa pattern distraksi yang Anda notice?',
            'Bagaimana mindfulness mempengaruhi creativity dan problem-solving Anda?'
          ],
          difficulty: 'menengah',
          order: 1,
          tags: ['productivity', 'focus', 'performance'],
          isOptional: false,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ],
      estimatedDuration: 22,
      objectives: [
        'Meningkatkan fokus dan concentration dalam bekerja',
        'Mengurangi procrastination dan distraction',
        'Mengoptimalkan energy dan mental resources',
        'Mengembangkan sustainable work habits'
      ],
      prerequisites: ['att-single-point', 'att-meta-attention'],
      difficulty: 'menengah',
      order: 6,
      isCore: true,
      tags: ['workplace', 'productivity', 'performance', 'focus'],
      instructions: [
        'Start dengan session singkat - build habit gradually',
        'Gunakan technology mindfully - turn off non-essential notifications',
        'Dalam budaya Indonesia, balance individual focus dengan team collaboration',
        'Quality over quantity - better to do less but with full attention'
      ],
      tips: [
        'Mindful work bukan tentang bekerja lebih keras, tapi lebih smart',
        'Regular breaks actually increase productivity',
        'Awareness of mental energy patterns membantu optimize schedule',
        'Peak performance state adalah natural result dari mindful practice'
      ],
      scientificBackground: 'Neuroscience research menunjukkan bahwa mindfulness meningkatkan working memory dan cognitive flexibility. Perusahaan dengan mindfulness programs melaporkan 28% peningkatan productivity.',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    return modules;
  }
}

export const siyContentService = new SIYContentService();