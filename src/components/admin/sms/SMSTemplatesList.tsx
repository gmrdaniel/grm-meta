
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SMSTemplateForm } from "./SMSTemplateForm";
import { toast } from "sonner";

interface Template {
  id: string;
  name: string;
  message: string;
  project_id: string | null;
  created_at: string;
}

interface Project {
  id: string;
  name: string;
}

export function SMSTemplatesList() {
  const [page, setPage] = useState(1);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const pageSize = 10;

  const { data: templates, refetch } = useQuery<Template[]>({
    queryKey: ['sms_templates', page],
    queryFn: async () => {
      const start = (page - 1) * pageSize;
      const end = start + pageSize - 1;
      
      const { data, error } = await supabase
        .from('sms_templates')
        .select('*')
        .range(start, end)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const { data: projects } = useQuery<Project[]>({
    queryKey: ['projects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('id, name')
        .order('name');
      
      if (error) throw error;
      return data;
    }
  });

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('sms_templates')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error("Error al eliminar la plantilla");
      return;
    }

    toast.success("Plantilla eliminada exitosamente");
    refetch();
  };

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Proyecto</TableHead>
            <TableHead>Mensaje</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {templates?.map((template) => (
            <TableRow key={template.id}>
              <TableCell>{template.name}</TableCell>
              <TableCell>
                {projects?.find(p => p.id === template.project_id)?.name || '-'}
              </TableCell>
              <TableCell className="max-w-md truncate">{template.message}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setEditingTemplate(template)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleDelete(template.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="flex justify-end gap-2">
        <Button
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page === 1}
        >
          Anterior
        </Button>
        <Button
          onClick={() => setPage(p => p + 1)}
          disabled={!templates || templates.length < pageSize}
        >
          Siguiente
        </Button>
      </div>

      <Dialog open={!!editingTemplate} onOpenChange={() => setEditingTemplate(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Plantilla</DialogTitle>
          </DialogHeader>
          {editingTemplate && (
            <SMSTemplateForm
              initialData={editingTemplate}
              onSuccess={() => {
                setEditingTemplate(null);
                refetch();
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
