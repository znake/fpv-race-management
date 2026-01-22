import type { PilotInput } from '../lib/schemas'

export interface CSVRow {
  Name: string
  'Bild-URL': string
  Instagram?: string
}

export interface CSVImportResult {
  totalRows: number
  validRows: number
  pilots: PilotInput[]
  errors: CSVImportError[]
  duplicates: DuplicatePilot[]
}

export interface CSVImportError {
  row: number
  field: 'Name' | 'Bild-URL' | 'general'
  message: string
  value?: string
}

export interface DuplicatePilot {
  row: number
  name: string
  imageUrl?: string
  instagramHandle?: string
  existingPilot: { id: string; name: string; imageUrl?: string; instagramHandle?: string }
  action: 'pending' | 'skip' | 'merge'
}

export interface CSVImportState {
  isDragging: boolean
  isProcessing: boolean
  progress: number
  result: CSVImportResult | null
  selectedFile: File | null
}

export interface ImportProgress {
  current: number
  total: number
  stage: 'parsing' | 'validating' | 'importing' | 'complete'
  message: string
}

export type ImportStatus = 'idle' | 'parsing' | 'validating' | 'preview' | 'importing' | 'success' | 'error'