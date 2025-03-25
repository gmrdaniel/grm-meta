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
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { createCreator, updateCreator } from "@/services/creatorService";
import { toast } from "sonner";
import { Creator } from "@/types/creator";

const creatorFormSchema = z.object({
  nombre: z.string().min(2, "El nombre es requerido"),
  apellido: z.string().min(2, "El apellido es requerido"),
  correo: z.string().email("Ingrese un correo electrónico válido"),
  usuario_tiktok: z.string().min(1, "El usuario de TikTok es requerido"),
  secUid_tiktok: z.string().optional(),
  seguidores_tiktok: z.preprocess(
    (val) => (val === "" ? undefined : Number(val)),
    z.number().int().positive("Debe ser un número positivo").optional()
  ),
  elegible_tiktok: z.boolean().optional(),
  engagement_tiktok: z.preprocess(
    (val) => (val === "" ? undefined : Number(val)),
    z.number().positive("Debe ser un número positivo").optional()
  ),
  usuario_pinterest: z.string().optional(),
  seguidores_pinterest: z.preprocess(
    (val) => (val === "" ? undefined : Number(val)),
    z.number().int().positive("Debe ser un número positivo").optional()
  ),
  usuario_youtube: z.string().optional(),
  seguidores_youtube: z.preprocess(
    (val) => (val === "" ? undefined : Number(val)),
    z.number().int().positive("Debe ser un número positivo").optional()
  ),
  elegible_youtube: z.boolean().optional(),
  engagement_youtube: z.preprocess(
    (val) => (val === "" ? undefined : Number(val)),
    z.number().positive("Debe ser un número positivo").optional()
  ),
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
      secUid_tiktok: initialData?.secUid_tiktok || "",
      seguidores_tiktok: initialData?.seguidores_tiktok || undefined,
      elegible_tiktok: initialData?.elegible_tiktok || false,
      engagement_tiktok: initialData?.engagement_tiktok || undefined,
      usuario_pinterest: initialData?.usuario_pinterest || "",
      seguidores_pinterest: initialData?.seguidores_pinterest || undefined,
      usuario_youtube: initialData?.usuario_youtube || "",
      seguidores_youtube: initialData?.seguidores_youtube || undefined,
      elegible_youtube: initialData?.elegible_youtube || false,
      engagement_youtube: initialData?.engagement_youtube || undefined,
      page_facebook: initialData?.page_facebook || "",
      lada_telefono: initialData?.lada_telefono || "",
      telefono: initialData?.telefono || "",
      estatus: initialData?.estatus || "pendiente",
    },
  });

  const onSubmit = async (data: CreatorFormValues) => {
    setIsSubmitting(true);
    try {
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
          secUid_tiktok: "",
          seguidores_tiktok: undefined,
          elegible_tiktok: false,
          engagement_tiktok: undefined,
          usuario_pinterest: "",
          seguidores_pinterest: undefined,
          usuario_youtube: "",
          seguidores_youtube: undefined,
          elegible_youtube: false,
          engagement_youtube: undefined,
          page_facebook: "",
          lada_telefono: "",
          telefono: "",
          estatus: "pendiente",
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

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Redes Sociales</h3>
          
          <div className="rounded-md border p-4 space-y-4">
            <h4 className="font-medium">TikTok</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="usuario_tiktok"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Usuario TikTok *</FormLabel>
                    <FormControl>
                      <Input placeholder="@usuario" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="secUid_tiktok"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>TikTok Secure ID</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="MS4wLjABAAAAAxxxxx..." 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="seguidores_tiktok"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Seguidores TikTok</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="10000" 
                        {...field}
                        value={field.value || ''}
                        onChange={(e) => {
                          const value = e.target.value === '' ? undefined : parseInt(e.target.value);
                          field.onChange(value);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="elegible_tiktok"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 py-2">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Elegible TikTok</FormLabel>
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="engagement_tiktok"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Engagement TikTok (%)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="2.5" 
                        step="0.01"
                        {...field}
                        value={field.value || ''}
                        onChange={(e) => {
                          const value = e.target.value === '' ? undefined : parseFloat(e.target.value);
                          field.onChange(value);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="rounded-md border p-4 space-y-4">
            <h4 className="font-medium">YouTube</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="usuario_youtube"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Usuario YouTube</FormLabel>
                    <FormControl>
                      <Input placeholder="@usuario" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="seguidores_youtube"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Seguidores YouTube</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="10000" 
                        {...field}
                        value={field.value || ''}
                        onChange={(e) => {
                          const value = e.target.value === '' ? undefined : parseInt(e.target.value);
                          field.onChange(value);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="elegible_youtube"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 py-2">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Elegible YouTube</FormLabel>
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="engagement_youtube"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Engagement YouTube (%)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="2.5" 
                        step="0.01"
                        {...field}
                        value={field.value || ''}
                        onChange={(e) => {
                          const value = e.target.value === '' ? undefined : parseFloat(e.target.value);
                          field.onChange(value);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              name="seguidores_pinterest"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Seguidores Pinterest</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="10000" 
                      {...field}
                      value={field.value || ''}
                      onChange={(e) => {
                        const value = e.target.value === '' ? undefined : parseInt(e.target.value);
                        field.onChange(value);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

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
