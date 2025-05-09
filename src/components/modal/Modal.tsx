import * as Dialog from "@radix-ui/react-dialog";
import { ReactNode, useState } from "react";
import { Button } from "../ui/button";

interface ModalProps {
    children: ReactNode;
    options?: {
        title?: string;
        ButtonComponent?: JSX.Element;
    };
}

export const Modal = ({ children, options }: ModalProps) => {

    const { title, ButtonComponent } = options
    const [open, setOpen] = useState(false);

    return (
        <Dialog.Root open={open} onOpenChange={setOpen}>
            <Dialog.Trigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                    {title}
                </Button>
            </Dialog.Trigger>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/40 z-40" />
                <Dialog.Content className="fixed z-50 top-1/2 left-1/2 w-full max-w-md -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-lg">
                    {options?.title && (
                        <Dialog.Title className="text-lg font-semibold">{title}</Dialog.Title>
                    )}
                    <div className="text-sm text-gray-500 mb-4">{children}</div>

                    <div className="flex justify-end">
                        {ButtonComponent}
                        <Dialog.Close asChild>
                            <Button onClick={() => setOpen(false)}>Cerrar</Button>
                        </Dialog.Close>
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
};
