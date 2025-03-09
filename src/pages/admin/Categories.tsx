
import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { CategoriesTable } from "@/components/categories/CategoriesTable";
import { CategoryForm } from "@/components/categories/CategoryForm";
import { Category } from "@/components/categories/types";
import { useCategories } from "@/hooks/useCategories";

const Categories = () => {
  const [activeTab, setActiveTab] = useState("list");
  const [editingCategory, setEditingCategory] = useState<Category | undefined>(undefined);
  
  const {
    categories,
    totalCount,
    pageCount,
    page,
    pageSize,
    isLoading,
    setPage,
    createCategory,
    updateCategory,
    updateCategoryStatus,
  } = useCategories();

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setActiveTab("create");
  };

  const handleCreateCategory = (data: any) => {
    createCategory.mutate(data, {
      onSuccess: () => {
        setActiveTab("list");
      },
    });
  };

  const handleUpdateCategory = (data: any) => {
    if (editingCategory) {
      updateCategory.mutate(
        { id: editingCategory.id, data },
        {
          onSuccess: () => {
            setEditingCategory(undefined);
            setActiveTab("list");
          },
        }
      );
    }
  };

  const handleCancelForm = () => {
    setEditingCategory(undefined);
    setActiveTab("list");
  };

  const handleStatusChange = (id: string, newStatus: 'active' | 'inactive') => {
    updateCategoryStatus.mutate({ id, status: newStatus });
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white shadow-sm rounded-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-medium">Categorías de Creadores</h2>
                {activeTab === "list" && (
                  <Button onClick={() => setActiveTab("create")}>
                    <Plus className="h-4 w-4 mr-2" />
                    Nueva Categoría
                  </Button>
                )}
              </div>

              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="space-y-4"
              >
                <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
                  <TabsTrigger value="list">Listado de Categorías</TabsTrigger>
                  <TabsTrigger value="create">
                    {editingCategory ? "Editar Categoría" : "Nueva Categoría"}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="list" className="space-y-4 mt-6">
                  <CategoriesTable
                    categories={categories}
                    isLoading={isLoading}
                    onEdit={handleEditCategory}
                    onStatusChange={handleStatusChange}
                    pageCount={pageCount}
                    page={page}
                    pageSize={pageSize}
                    onPageChange={setPage}
                  />
                </TabsContent>

                <TabsContent value="create" className="space-y-4 mt-6">
                  <CategoryForm
                    initialData={editingCategory}
                    isEditing={!!editingCategory}
                    onSubmit={
                      editingCategory ? handleUpdateCategory : handleCreateCategory
                    }
                    isSubmitting={
                      createCategory.isPending || updateCategory.isPending
                    }
                    onCancel={handleCancelForm}
                  />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Categories;
