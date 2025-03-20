
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createCreator, updateCreator } from "@/services/creatorService";
import { toast } from "sonner";
import { Creator } from "@/types/creator";

// Schema validation
const creatorFormSchema = z.object({
  nombre: z.string().min(2, "El nombre es requerido"),
  apellido: z.string().min(2, "El apellido es requerido"),
  correo: z.string().email("Ingrese un correo electrónico válido"),
  usuario_tiktok: z.string().optional(),
  usuario_pinterest: z.string().optional(),
  page_facebook: z.string().optional(),
  lada_telefono: z.string().optional(),
  telefono: z.string().optional(),
  estatus: z.enum(["activo", "inactivo", "pendiente"]),
});

type CreatorFormValues = z.infer<typeof creatorFormSchema>;

interface CreatorFormProps {
  initialData?: Creator;
  onSuccess: () => void;
  onCancel?: () => void;
}

export function CreatorForm({ initialData, onSuccess, onCancel }: CreatorFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!initialData;

  const form = useForm<CreatorFormValues>({
    resolver: zodResolver(creatorFormSchema),
    defaultValues: {
      nombre: initialData?.nombre || "",
      apellido: initialData?.apellido || "",
      correo: initialData?.correo || "",
      usuario_tiktok: initialData?.usuario_tiktok || "",
      usuario_pinterest: initialData?.usuario_pinterest || "",
      page_facebook: initialData?.page_facebook || "",
      lada_telefono: initialData?.lada_telefono || "",
      telefono: initialData?.telefono || "",
      estatus: initialData?.estatus || "activo",
    },
  });

  const onSubmit = async (data: CreatorFormValues) => {
    setIsSubmitting(true);
    try {
      // Clean empty strings and convert them to null/undefined
      const formData = Object.fromEntries(
        Object.entries(data).map(([key, value]) => [
          key,
          value === "" ? undefined : value,
        ])
      );

      if (isEditing && initialData) {
        await updateCreator(initialData.id, formData as Partial<Creator>);
        toast.success("Creador actualizado correctamente");
      } else {
        await createCreator(formData as Omit<Creator, "id" | "fecha_creacion">);
        toast.success("Creador agregado correctamente");
        form.reset({
          nombre: "",
          apellido: "",
          correo: "",
          usuario_tiktok: "",
          usuario_pinterest: "",
          page_facebook: "",
          lada_telefono: "",
          telefono: "",
          estatus: "activo",
        });
      }
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || "Error al guardar el creador");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="nombre"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre *</FormLabel>
                <FormControl>
                  <Input placeholder="Nombre" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="apellido"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Apellido *</FormLabel>
                <FormControl>
                  <Input placeholder="Apellido" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="correo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Correo Electrónico *</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="correo@ejemplo.com"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="lada_telefono"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Lada Telefónica</FormLabel>
                <FormControl>
                  <Input placeholder="52" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="telefono"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Teléfono</FormLabel>
                <FormControl>
                  <Input placeholder="1234567890" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="usuario_tiktok"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Usuario TikTok</FormLabel>
                <FormControl>
                  <Input placeholder="@usuario" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="usuario_pinterest"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Usuario Pinterest</FormLabel>
                <FormControl>
                  <Input placeholder="@usuario" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="page_facebook"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Página de Facebook</FormLabel>
                <FormControl>
                  <Input
                    placeholder="https://facebook.com/pagina"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="estatus"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Estatus</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar estatus" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="activo">Activo</SelectItem>
                  <SelectItem value="inactivo">Inactivo</SelectItem>
                  <SelectItem value="pendiente">Pendiente</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
            >
              Cancelar
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-opacity-50 border-t-transparent rounded-full" />
                {isEditing ? "Actualizando..." : "Guardando..."}
              </>
            ) : (
              <>{isEditing ? "Actualizar Creador" : "Guardar Creador"}</>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
