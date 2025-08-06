// Claude Code Multiagent Task Management Types
// Comprehensive type definitions for multiagent task management system

import type { UserProfile } from './auth';
import type { MeditationSession, Course, SIYExercise } from './content';

// Core Task Management Types
export interface AgentTask {
  id: string;
  type: TaskType;
  status: TaskStatus;
  priority: TaskPriority;
  title: string;
  description: string;
  context: TaskContext;
  metadata: TaskMetadata;
  dependencies: string[]; // task IDs this task depends on
  assignedAgentId?: string;
  createdAt: Date;
  updatedAt: Date;
  scheduledAt?: Date;
  startedAt?: Date;
  completedAt?: Date;
  failedAt?: Date;
  result?: TaskResult;
  error?: TaskError;
  retryCount: number;
  maxRetries: number;
}

export type TaskType = 
  | 'content_generation'      // Generate meditation content
  | 'progress_analysis'       // Analyze user progress
  | 'recommendation'          // Generate recommendations
  | 'insight_generation'      // Generate insights from data
  | 'personalization'         // Personalize user experience
  | 'content_optimization'    // Optimize existing content
  | 'user_assessment'         // Conduct user assessments
  | 'habit_analysis'          // Analyze meditation habits
  | 'emotional_analysis'      // Analyze emotional patterns
  | 'siy_coaching'           // Search Inside Yourself coaching
  | 'cultural_adaptation'     // Adapt content for Indonesian culture
  | 'social_ei_analysis'      // Social emotional intelligence analysis
  | 'workplace_application'   // Workplace mindfulness application
  | 'session_optimization'    // Optimize session effectiveness
  | 'learning_path_creation'  // Create personalized learning paths
  | 'community_insights'      // Generate community insights
  | 'performance_analytics'   // Performance and usage analytics
  | 'content_moderation'      // Content moderation and quality
  | 'system_optimization'     // System performance optimization

// Task Metrics Interfaces
export interface TaskMetrics {
  total: number;
  byStatus: {
    pending: number;
    queued: number;
    in_progress: number;
    assigned: number;
    completed: number;
    failed: number;
    cancelled: number;
  };
  byPriority: {
    low: number;
    medium: number;
    high: number;
    urgent: number;
  };
  averageExecutionTime: number;
  executionTimes: number[];
  successRate: number;
  failureRate: number;
}

export type TaskStatus = 
  | 'pending'      // Task created, waiting to be assigned
  | 'queued'       // Task queued for processing
  | 'assigned'     // Task assigned to an agent
  | 'in_progress'  // Task currently being executed
  | 'paused'       // Task temporarily paused
  | 'completed'    // Task completed successfully
  | 'failed'       // Task failed with error
  | 'cancelled'    // Task cancelled by user/system
  | 'timeout'      // Task timed out
  | 'retrying';    // Task being retried after failure

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface TaskContext {
  userId?: string;
  sessionId?: string;
  courseId?: string;
  exerciseId?: string;
  moduleId?: string;
  userProfile?: Partial<UserProfile>;
  sessionData?: Partial<MeditationSession>;
  courseData?: Partial<Course>;
  exerciseData?: Partial<SIYExercise>;
  timeframe?: {
    start: Date;
    end: Date;
  };
  parameters: Record<string, unknown>;
  constraints: TaskConstraints;
}

export interface TaskConstraints {
  maxDuration?: number;        // Maximum execution time in milliseconds
  maxTokenUsage?: number;      // Maximum AI tokens to use
  maxRetries?: number;         // Maximum retry attempts
  requiresApproval?: boolean;  // Requires human approval before execution
  resourceLimits?: {
    memory: number;           // MB
    cpu: number;             // percentage
    bandwidth: number;       // MB/s
  };
  culturalSensitivity?: boolean; // Requires cultural context awareness
  privacyLevel?: 'public' | 'private' | 'anonymous';
}

export interface TaskMetadata {
  source: 'user_request' | 'system_trigger' | 'scheduled' | 'dependency';
  triggerEvent?: string;
  parentTaskId?: string;
  batchId?: string;
  version: string;
  tags: string[];
  estimatedDuration?: number; // milliseconds
  requiredCapabilities: AgentCapability[];
  preferredAgentType?: AgentType;
  culturalContext?: 'indonesian' | 'global' | 'mixed';
  dataClassification?: 'public' | 'internal' | 'confidential' | 'personal';
}

export interface TaskResult {
  success: boolean;
  data: unknown;
  confidence?: number;        // 0-1 confidence score
  qualityScore?: number;      // 0-1 quality assessment
  insights?: string[];
  recommendations?: string[];
  metadata: {
    executionTime: number;    // milliseconds
    tokenUsage?: number;
    agentId: string;
    processingSteps: string[];
    resourceUsage?: {
      memory: number;
      cpu: number;
      bandwidth: number;
    };
  };
  validationResults?: ValidationResult[];
  culturalAdaptations?: string[];
}

export interface TaskError {
  code: string;
  message: string;
  details?: unknown;
  timestamp: Date;
  agentId?: string;
  retryable: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'network' | 'authentication' | 'validation' | 'processing' | 'timeout' | 'resource' | 'cultural' | 'ethical';
}

export interface ValidationResult {
  validator: string;
  passed: boolean;
  score?: number;
  feedback?: string;
  culturallyAppropriate?: boolean;
  ethicallyCompliant?: boolean;
}

// Agent Management Types
export interface Agent {
  id: string;
  name: string;
  type: AgentType;
  status: AgentStatus;
  capabilities: AgentCapability[];
  specializations: TaskType[];
  performance: AgentPerformance;
  configuration: AgentConfiguration;
  version: string;
  createdAt: Date;
  lastActiveAt: Date;
  currentLoad: number;        // 0-100 percentage
  maxConcurrentTasks: number;
  assignedTasks: string[];    // current task IDs
  completedTasks: number;
  failedTasks: number;
  averageExecutionTime: number; // milliseconds
  culturalExpertise?: string[]; // Cultural knowledge areas
}

export type AgentType = 
  | 'orchestrator'          // Main coordination agent
  | 'content_specialist'    // Content generation specialist
  | 'analytics_specialist'  // Data analysis specialist
  | 'personalization_agent' // User personalization agent
  | 'cultural_advisor'      // Indonesian cultural context advisor
  | 'siy_coach'            // Search Inside Yourself specialist
  | 'emotional_ai'         // Emotional intelligence specialist
  | 'performance_optimizer' // System performance specialist
  | 'quality_assurance'    // Content quality and validation
  | 'data_processor'       // Data processing and sync
  | 'notification_manager' // Smart notification management
  | 'insight_generator'    // Insight and pattern recognition
  | 'workflow_coordinator' // Multi-step workflow coordination
  | 'error_handler'        // Error recovery and handling
  | 'resource_manager';    // Resource allocation and optimization

export type AgentStatus = 
  | 'active'      // Agent is active and available
  | 'busy'        // Agent is currently processing tasks
  | 'idle'        // Agent is idle, available for tasks
  | 'maintenance' // Agent is under maintenance
  | 'error'       // Agent has encountered an error
  | 'offline'     // Agent is offline
  | 'overloaded'  // Agent is at capacity
  | 'degraded';   // Agent is running with reduced performance

export type AgentCapability = 
  | 'content_generation'
  | 'data_analysis'
  | 'machine_learning'
  | 'natural_language_processing'
  | 'cultural_awareness'
  | 'emotional_intelligence'
  | 'personalization'
  | 'real_time_processing'
  | 'batch_processing'
  | 'quality_validation'
  | 'error_recovery'
  | 'workflow_coordination'
  | 'resource_optimization'
  | 'security_compliance'
  | 'privacy_protection'
  | 'user_behavior_analysis'
  | 'social_skills'
  | 'performance_monitoring'
  | 'data_processing'
  | 'recommendation_engine'
  | 'notification_management'
  | 'multilingual_support'
  | 'meditation_expertise'
  | 'mindfulness_coaching'
  | 'habit_formation'
  | 'progress_tracking'
  | 'community_analysis'
  | 'recommendation_engine'
  | 'sentiment_analysis'
  | 'pattern_recognition'
  | 'predictive_analytics';

export interface AgentConfiguration {
  modelSettings: {
    model: string;
    temperature: number;
    maxTokens: number;
    topP: number;
    frequencyPenalty: number;
    presencePenalty: number;
  };
  behaviorSettings: {
    responseStyle: 'concise' | 'detailed' | 'conversational';
    culturalSensitivity: number; // 0-1 scale
    creativityLevel: number;     // 0-1 scale
    conservativeness: number;    // 0-1 scale for content safety
  };
  resourceLimits: {
    maxMemoryUsage: number;      // MB
    maxCpuUsage: number;         // percentage
    maxExecutionTime: number;    // milliseconds
    maxConcurrentTasks: number;
  };
  specializedPrompts: Record<TaskType, string>;
  culturalGuidelines: string[];
  ethicalBoundaries: string[];
}

export interface AgentPerformance {
  averageResponseTime: number;    // milliseconds
  successRate: number;            // 0-1 percentage
  qualityScore: number;           // 0-1 average quality
  userSatisfactionScore: number;  // 0-1 user feedback
  efficiencyRating: number;       // 0-1 resource efficiency
  culturalAdaptationScore: number; // 0-1 cultural appropriateness
  lastEvaluated: Date;
  trends: {
    responseTime: number[];       // Recent response times
    successRate: number[];        // Recent success rates
    qualityScores: number[];      // Recent quality scores
  };
  competencyAreas: Record<TaskType, number>; // 0-1 competency per task type
}

// Task Orchestration Types
export interface TaskOrchestrator {
  id: string;
  status: 'active' | 'paused' | 'error';
  configuration: OrchestratorConfiguration;
  activeWorkflows: WorkflowExecution[];
  queuedTasks: string[];          // task IDs
  processingTasks: string[];      // task IDs
  completedTasks: string[];       // task IDs
  failedTasks: string[];          // task IDs
  performance: OrchestratorPerformance;
  lastUpdate: Date;
}

export interface OrchestratorConfiguration {
  maxConcurrentWorkflows: number;
  maxQueueSize: number;
  defaultTimeout: number;          // milliseconds
  retryStrategy: RetryStrategy;
  loadBalancingStrategy: 'round_robin' | 'least_loaded' | 'capability_based' | 'priority_based';
  failoverStrategy: 'retry' | 'delegate' | 'degrade' | 'fail';
  culturalValidationRequired: boolean;
  qualityThreshold: number;        // 0-1 minimum quality score
}

export interface RetryStrategy {
  maxRetries: number;
  backoffStrategy: 'linear' | 'exponential' | 'fixed';
  initialDelay: number;            // milliseconds
  maxDelay: number;                // milliseconds
  jitterEnabled: boolean;
}

export interface OrchestratorPerformance {
  totalTasksProcessed: number;
  averageProcessingTime: number;   // milliseconds
  throughputPerHour: number;
  errorRate: number;               // 0-1 percentage
  queueWaitTime: number;          // milliseconds average
  resourceUtilization: number;    // 0-1 percentage
}

// Workflow Management Types
export interface WorkflowDefinition {
  id: string;
  name: string;
  description: string;
  version: string;
  steps: WorkflowStep[];
  triggers: WorkflowTrigger[];
  conditions: WorkflowCondition[];
  metadata: {
    category: string;
    tags: string[];
    estimatedDuration: number;
    complexity: 'simple' | 'medium' | 'complex';
    culturalSensitive: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkflowStep {
  id: string;
  name: string;
  type: 'task' | 'decision' | 'parallel' | 'wait' | 'approval';
  taskType?: TaskType;
  agentType?: AgentType;
  configuration: Record<string, unknown>;
  dependencies: string[];         // step IDs
  conditions?: WorkflowCondition[];
  timeout?: number;               // milliseconds
  retryPolicy?: RetryStrategy;
  onFailure: 'stop' | 'continue' | 'retry' | 'branch';
  culturalValidation?: boolean;
}

export interface WorkflowTrigger {
  id: string;
  type: 'manual' | 'scheduled' | 'event' | 'webhook' | 'user_action';
  condition: string;              // expression or event name
  parameters: Record<string, unknown>;
}

export interface WorkflowCondition {
  id: string;
  expression: string;             // boolean expression
  onTrue: string;                 // next step ID
  onFalse: string;                // next step ID
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  status: WorkflowStatus;
  currentStepId?: string;
  context: WorkflowContext;
  steps: WorkflowStepExecution[];
  startedAt: Date;
  completedAt?: Date;
  duration?: number;              // milliseconds
  result?: unknown;
  error?: WorkflowError;
}

export type WorkflowStatus = 
  | 'pending'
  | 'running'
  | 'paused'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'waiting_approval';

export interface WorkflowContext {
  userId?: string;
  sessionId?: string;
  triggerData: unknown;
  variables: Record<string, unknown>;
  culturalContext?: string;
  userPreferences?: Record<string, unknown>;
}

export interface WorkflowStepExecution {
  stepId: string;
  taskId?: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  startedAt?: Date;
  completedAt?: Date;
  result?: unknown;
  error?: string;
  retryCount: number;
}

export interface WorkflowError {
  stepId: string;
  taskId?: string;
  code: string;
  message: string;
  timestamp: Date;
  recoverable: boolean;
}

// Real-time Communication Types
export interface AgentMessage {
  id: string;
  senderId: string;
  receiverId: string;
  type: MessageType;
  content: unknown;
  timestamp: Date;
  priority: MessagePriority;
  requiresResponse: boolean;
  correlationId?: string;
  metadata: MessageMetadata;
}

export type MessageType = 
  | 'task_assignment'
  | 'task_update'
  | 'task_completion'
  | 'task_failure'
  | 'status_request'
  | 'status_response'
  | 'resource_request'
  | 'resource_response'
  | 'coordination_request'
  | 'coordination_response'
  | 'health_check'
  | 'error_notification'
  | 'configuration_update'
  | 'shutdown_notice'
  | 'cultural_consultation'
  | 'quality_validation'
  | 'workflow_event';

export type MessagePriority = 'low' | 'normal' | 'high' | 'urgent';

export interface MessageMetadata {
  source: string;
  destination: string;
  channel: string;
  encryption?: boolean;
  compression?: boolean;
  retryCount?: number;
  expiresAt?: Date;
}

// Analytics and Monitoring Types
export interface SystemMetrics {
  timestamp: Date;
  orchestrator: {
    activeTasks: number;
    queuedTasks: number;
    completedTasksPerHour: number;
    averageProcessingTime: number;
    errorRate: number;
  };
  agents: {
    totalAgents: number;
    activeAgents: number;
    averageLoad: number;
    healthScore: number;
  };
  resources: {
    memoryUsage: number;         // percentage
    cpuUsage: number;            // percentage
    networkLatency: number;      // milliseconds
    storageUsage: number;        // percentage
  };
  cultural: {
    adaptationRequests: number;
    validationFailures: number;
    culturalAccuracyScore: number;
  };
  quality: {
    averageQualityScore: number;
    validationPassRate: number;
    userSatisfactionScore: number;
  };
}

export interface TaskAnalytics {
  taskId: string;
  executionMetrics: {
    startTime: Date;
    endTime: Date;
    duration: number;
    tokenUsage?: number;
    resourceConsumption: {
      memory: number;
      cpu: number;
      network: number;
    };
  };
  qualityMetrics: {
    qualityScore: number;
    validationResults: ValidationResult[];
    userFeedback?: number;
    culturalAppropriatenessScore?: number;
  };
  performanceMetrics: {
    agentEfficiency: number;
    responseTime: number;
    throughput: number;
    errorCount: number;
  };
}

// Integration Types


export interface APIEndpoints {
  tasks: {
    create: string;
    update: string;
    get: string;
    list: string;
    cancel: string;
  };
  agents: {
    register: string;
    status: string;
    assign: string;
    performance: string;
  };
  workflows: {
    define: string;
    execute: string;
    monitor: string;
    control: string;
  };
  orchestrator: {
    health: string;
    metrics: string;
    configuration: string;
  };
}

// Event Types for Real-time Updates
export interface TaskEvent {
  type: 'created' | 'updated' | 'started' | 'completed' | 'failed' | 'cancelled';
  taskId: string;
  timestamp: Date;
  data: Partial<AgentTask>;
  agentId?: string;
  userId?: string;
}

export interface AgentEvent {
  type: 'registered' | 'status_changed' | 'task_assigned' | 'task_completed' | 'error' | 'offline';
  agentId: string;
  timestamp: Date;
  data: Partial<Agent>;
}

export interface WorkflowEvent {
  type: 'started' | 'step_completed' | 'completed' | 'failed' | 'paused' | 'resumed';
  workflowId: string;
  executionId: string;
  timestamp: Date;
  data: Partial<WorkflowExecution>;
}

// User Interface Types
export interface TaskManagementState {
  tasks: AgentTask[];
  agents: Agent[];
  workflows: WorkflowDefinition[];
  executions: WorkflowExecution[];
  metrics: SystemMetrics[];
  loading: boolean;
  error?: string;
  selectedTaskId?: string;
  selectedAgentId?: string;
  selectedWorkflowId?: string;
  filters: TaskFilters;
  sorting: TaskSorting;
}

export interface TaskFilters {
  status?: TaskStatus[];
  type?: TaskType[];
  priority?: TaskPriority[];
  agentId?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  culturalContext?: string;
  userId?: string;
}

export interface TaskSorting {
  field: 'createdAt' | 'updatedAt' | 'priority' | 'status' | 'type' | 'duration';
  direction: 'asc' | 'desc';
}

// Service Interfaces
export interface TaskService {
  createTask(task: Omit<AgentTask, 'id' | 'createdAt' | 'updatedAt'>): Promise<AgentTask>;
  updateTask(id: string, updates: Partial<AgentTask>): Promise<AgentTask>;
  getTask(id: string): Promise<AgentTask | null>;
  listTasks(filters?: TaskFilters, sorting?: TaskSorting): Promise<AgentTask[]>;
  cancelTask(id: string): Promise<void>;
  retryTask(id: string): Promise<AgentTask>;
  subscribeToTaskUpdates(callback: (event: TaskEvent) => void): () => void;
}

export interface AgentService {
  registerAgent(agent: Omit<Agent, 'id' | 'createdAt' | 'lastActiveAt'>): Promise<Agent>;
  updateAgentStatus(id: string, status: AgentStatus): Promise<void>;
  getAgent(id: string): Promise<Agent | null>;
  listAgents(type?: AgentType): Promise<Agent[]>;
  assignTask(agentId: string, taskId: string): Promise<void>;
  unassignTask(agentId: string, taskId: string): Promise<void>;
  getAgentPerformance(id: string): Promise<AgentPerformance>;
  subscribeToAgentUpdates(callback: (event: AgentEvent) => void): () => void;
}

export interface WorkflowService {
  createWorkflow(workflow: Omit<WorkflowDefinition, 'id' | 'createdAt' | 'updatedAt'>): Promise<WorkflowDefinition>;
  executeWorkflow(workflowId: string, context: WorkflowContext): Promise<WorkflowExecution>;
  pauseWorkflow(executionId: string): Promise<void>;
  resumeWorkflow(executionId: string): Promise<void>;
  cancelWorkflow(executionId: string): Promise<void>;
  getWorkflowStatus(executionId: string): Promise<WorkflowExecution>;
  subscribeToWorkflowUpdates(callback: (event: WorkflowEvent) => void): () => void;
}

export interface OrchestratorService {
  initialize(config: OrchestratorConfiguration): Promise<void>;
  start(): Promise<void>;
  stop(): Promise<void>;
  getHealth(): Promise<{ status: string; metrics: SystemMetrics }>;
  updateConfiguration(config: Partial<OrchestratorConfiguration>): Promise<void>;
  getMetrics(): Promise<SystemMetrics>;
  subscribeToMetrics(callback: (metrics: SystemMetrics) => void): () => void;
}