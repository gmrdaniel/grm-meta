
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { createCreator, updateCreator } from "@/services/creatorService";
import { toast } from "sonner";
import { Creator } from "@/types/creator";

import { creatorFormSchema, CreatorFormValues } from "./form-schemas/creatorFormSchema";
import { FormHeader } from "./form/FormHeader";
import { FormSection } from "./form/FormSection";
import { PersonalInfoFields } from "./form/PersonalInfoFields";
import { TikTokFields } from "./form/TikTokFields";
import { YouTubeFields } from "./form/YouTubeFields";
import { OtherSocialFields } from "./form/OtherSocialFields";
import { StatusField } from "./form/StatusField";
import { FormActions } from "./form/FormActions";

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
        <PersonalInfoFields form={form} />

        <div className="space-y-4">
          <FormHeader title="Redes Sociales" />
          
          <FormSection title="TikTok">
            <TikTokFields form={form} />
          </FormSection>

          <FormSection title="YouTube">
            <YouTubeFields form={form} />
          </FormSection>

          <OtherSocialFields form={form} />
        </div>

        <StatusField form={form} />

        <FormActions 
          isSubmitting={isSubmitting} 
          isEditing={isEditing} 
          onCancel={onCancel} 
        />
      </form>
    </Form>
  );
}
