export const CRM_CLIENT_STATUSES = ['active', 'prospect', 'inactive'] as const
export type CrmClientStatus = (typeof CRM_CLIENT_STATUSES)[number]

export const PROJECT_STATUSES = [
  'not_started',
  'running',
  'on_hold',
  'review',
  'completed',
  'cancelled',
] as const
export type ProjectStatus = (typeof PROJECT_STATUSES)[number]

export const STAGE_STATUSES = ['pending', 'running', 'done', 'hold', 'skipped'] as const
export type StageStatus = (typeof STAGE_STATUSES)[number]

export const PRIORITIES = ['low', 'medium', 'high', 'urgent'] as const
export type Priority = (typeof PRIORITIES)[number]

export const PAYMENT_TYPES = ['advance', 'installment', 'final', 'refund'] as const
export type PaymentType = (typeof PAYMENT_TYPES)[number]

export interface CrmClient {
  id: string
  name: string
  company: string | null
  email: string | null
  phone: string | null
  whatsapp: string | null
  address: string | null
  website: string | null
  industry: string | null
  source: string | null
  status: CrmClientStatus
  notes: string | null
  lead_id: string | null
  portal_enabled: boolean
  has_password: boolean
  last_login_at: string | null
  created_at: string
  updated_at: string
  project_count: number
  active_projects: number
  total_value: number
  paid_amount: number
  due_amount: number
}

export interface ProjectStage {
  id: string
  name: string
  status: StageStatus
  started_at: string | null
  completed_at: string | null
  note: string | null
}

export interface CrmProject {
  id: string
  client_id: string
  title: string
  service_type: string
  description: string | null
  status: ProjectStatus
  priority: Priority
  stages: ProjectStage[]
  progress: number
  total_cost: number
  currency: string
  start_date: string | null
  deadline: string | null
  completed_at: string | null
  live_url: string | null
  staging_url: string | null
  client_note: string | null
  internal_notes?: string | null
  created_at: string
  updated_at: string
  client_name: string
  client_company: string | null
  paid_amount: number
  advance_amount: number
  due_amount: number
  current_stage: string | null
  current_stage_status: StageStatus | null
}

export interface CrmPayment {
  id: string
  project_id: string
  client_id: string
  amount: number
  currency: string
  type: PaymentType
  method: string
  paid_at: string
  reference: string | null
  note?: string | null
  created_at?: string
  project_title?: string
  client_name?: string
}

export interface CrmActivity {
  id: string
  client_id: string | null
  project_id: string | null
  type: string
  message: string
  visible_to_client?: boolean
  created_at: string
  project_title?: string | null
  client_name?: string | null
}

export const FILE_CATEGORIES = ['deliverable', 'client_asset'] as const
export type FileCategory = (typeof FILE_CATEGORIES)[number]

export interface CrmFile {
  id: string
  project_id: string
  client_id?: string
  category: FileCategory
  file_name: string
  url: string
  size: number
  mime: string
  note: string | null
  uploaded_by: 'admin' | 'client'
  created_at: string
  project_title?: string
}

export const APPROVAL_STATUSES = ['pending', 'approved', 'changes_requested'] as const
export type ApprovalStatus = (typeof APPROVAL_STATUSES)[number]

export interface StageApproval {
  id: string
  project_id: string
  client_id?: string
  stage_id: string
  stage_name: string
  round: number
  status: ApprovalStatus
  message: string | null
  client_comment: string | null
  requested_at: string
  resolved_at: string | null
  project_title?: string
}

export interface CrmClientDetail extends CrmClient {
  projects: CrmProject[]
  payments: CrmPayment[]
  activity: CrmActivity[]
}

export interface CrmProjectDetail extends CrmProject {
  payments: CrmPayment[]
  activity: CrmActivity[]
  files: CrmFile[]
  approvals: StageApproval[]
}

export interface CrmStats {
  clients_total: number
  clients_active: number
  projects_total: number
  projects_by_status: Record<ProjectStatus, number>
  projects_overdue: number
  total_value: number
  collected_total: number
  collected_month: number
  collected_today: number
  due_total: number
  monthly: { month: string; total: number }[]
  today: string
}

export interface PortalData {
  client: {
    id: string
    name: string
    company: string | null
    email: string | null
    phone: string | null
  }
  projects: CrmProject[]
  payments: CrmPayment[]
  activity: CrmActivity[]
  files: CrmFile[]
  approvals: StageApproval[]
}
