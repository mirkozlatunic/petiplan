export type AminoAcidCode =
  | 'A' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'K' | 'L'
  | 'M' | 'N' | 'P' | 'Q' | 'R' | 'S' | 'T' | 'V' | 'W' | 'Y';

export type CostTier = 'common' | 'moderate' | 'expensive';

export type ScaleOption = '1g' | '5g' | '10g' | '50g' | '100g' | '500g' | '1kg' | 'custom';

export type Phase = 'synthesis' | 'cleavage' | 'purification' | 'lyophilization' | 'qc';

export type GmpStatus = 'non-gmp' | 'gmp';

export interface AminoAcidEntry {
  code: AminoAcidCode;
  name: string;
  tier: CostTier;
  count: number;
  costPerGram: number;
  gramsNeeded: number;
  subtotal: number;
}

export interface CustomMaterial {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  costPerUnit: number;
  subtotal: number;
}

export interface Machine {
  id: string;
  name: string;
  hourlyCost: number;
  hoursPerBatch: number;
  unitsAvailable: number;
  utilization: number;
  costPerBatch: number;
  linkedPhase?: Phase;
}

export interface LaborRole {
  id: string;
  name: string;
  hourlyRate: number;
  hoursPerBatch: number;
  headcount: number;
  costPerBatch: number;
  fte: number;
}

export interface PhaseConfig {
  phase: Phase;
  label: string;
  daysPerBatch: number;
  color: string;
  yieldPercent: number; // 0-100; percentage of product recovered after this phase
}

export interface PtmModification {
  id: string;
  name: string;
  costDelta: number;     // additional cost per batch ($)
  timeDeltaHours: number; // additional synthesis hours per batch
}

export interface CostSnapshot {
  timestamp: number;
  totalCost: number;
  materialsCost: number;
  machineCost: number;
  laborCost: number;
  costPerBatch: number;
  costPerGram: number;
}

export interface ProjectState {
  projectName: string;
  gmpStatus: GmpStatus;
  sequence: string;
  batchCount: number;
  scale: ScaleOption;
  customScaleGrams: number;
  startDate: string;
  targetEndDate: string;
  parsedAminoAcids: AminoAcidEntry[];
  couplingExcessFactor: number;
  resinCostPerGram: number;
  customMaterials: CustomMaterial[];
  otherMaterials: CustomMaterial[];
  machines: Machine[];
  laborRoles: LaborRole[];
  phases: PhaseConfig[];
  previousSnapshot: CostSnapshot | null;
  sellingPricePerGram: number;
  ptmModifications: PtmModification[];
}

export interface SavedProject {
  name: string;
  savedAt: string;
  state: ProjectState;
}

// ============================================================
// AUTH & CLOUD TYPES
// ============================================================

export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
}

export type OrgRole = 'owner' | 'admin' | 'member';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  createdBy: string;
  createdAt: string;
}

export interface OrgMember {
  id: string;
  orgId: string;
  userId: string;
  role: OrgRole;
  joinedAt: string;
  profile?: Pick<AuthUser, 'displayName' | 'email' | 'avatarUrl'>;
}

export type SharePermission = 'read' | 'edit';
export type OwnerType = 'user' | 'org';

export interface ProjectRecord {
  id: string;
  name: string;
  ownerType: OwnerType;
  ownerUserId: string | null;
  ownerOrgId: string | null;
  state: ProjectState;
  createdAt: string;
  updatedAt: string;
  myPermission?: SharePermission | 'owner';
}

export interface ProjectShare {
  id: string;
  projectId: string;
  sharedWith: string;
  permission: SharePermission;
  grantedBy: string;
  createdAt: string;
  profile?: Pick<AuthUser, 'displayName' | 'email' | 'avatarUrl'>;
}

export type InviteStatus = 'pending' | 'accepted' | 'revoked' | 'expired';

export interface Invitation {
  id: string;
  inviteType: 'org_member' | 'project_share';
  email: string;
  invitedBy: string;
  orgId: string | null;
  projectId: string | null;
  role: OrgRole | null;
  permission: SharePermission | null;
  token: string;
  status: InviteStatus;
  expiresAt: string;
  createdAt: string;
}
