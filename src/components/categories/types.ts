
export interface Category {
  id: string;
  name: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface CategoryFormData {
  name: string;
  status: 'active' | 'inactive';
}

export interface CategoriesTableProps {
  categories: Category[];
  isLoading: boolean;
  onEdit: (category: Category) => void;
  onStatusChange: (id: string, newStatus: 'active' | 'inactive') => void;
  pageCount: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export interface CategoryFormProps {
  initialData?: Category;
  isEditing: boolean;
  onSubmit: (data: CategoryFormData) => void;
  isSubmitting: boolean;
  onCancel: () => void;
}
