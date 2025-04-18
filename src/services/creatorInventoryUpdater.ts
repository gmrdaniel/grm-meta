
export {
  generateExcelTemplate,
  processExcelFile
} from '@/utils/excel/creator-inventory';

export {
  updateCreatorsStatus
} from '@/services/creator-inventory-db';

export type {
  CreatorStatusUpdate,
  UpdateCreatorResult,
  NombreRealStatus
} from '@/types/creator-inventory';
