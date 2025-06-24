import { useEffect, useState } from "react";
import { Modal } from "../modal/Modal";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";
import { fetchInvitationsByRange } from "@/services/invitation";
import { DayPicker } from 'react-day-picker';
import * as Popover from '@radix-ui/react-popover';
import { exportToExcel } from "@/utils/exportToExcel";
import { Button } from "../ui/button";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { fetchProjects } from "@/services/project/projectService";
import { Project } from "@/types/project";

interface ButtonDownloadInvitationsProps {
    onClick: () => void
    exporting: boolean
}
const ButtonDownloadInvitations = ({ onClick, exporting }: ButtonDownloadInvitationsProps) => {

    return (<Button
        onClick={onClick}
        disabled={exporting}
        variant="outline"
        className="flex items-center gap-2 mr-4"
    >
        <Download size={16} />
        {exporting ? "Exporting..." : "Export Invitations"}
    </Button>)
}

export const ModalInvitationList = () => {

    const [currentProject, setCurrentProject] = useState<Project>(undefined)
    const [projectsList, setProjectsList] = useState<Project[]>([])
    const [dateSelected, setDateSelected] = useState<Date>(new Date());
    const [exporting, setExporting] = useState<boolean>(false)

    const handleDateSelected = (event) => {
        setDateSelected(new Date(event.target.value));
    };

    const generateXlsx = async () => {

        try {
            setExporting(true)
            const data = await fetchInvitationsByRange(currentProject.id, dateSelected)
            exportToExcel(data, 'invitations', dateSelected)
            setExporting(false)
        } catch (e) {
            toast.error("An error has occurred")
            setExporting(false)
        }
    }


    const initialFetch = async () => {
        const res = await fetchProjects()
        setProjectsList(res)
    }

    useEffect(() => {
        initialFetch()
    }, [])


    return (
        <>
            <Modal options={{ title: 'Export By Date', ButtonComponent: <ButtonDownloadInvitations onClick={generateXlsx} exporting={exporting} /> }}>
                <div className="mt-4 md:mt-0 flex flex-col">
                    <div className="flex flex-col w-full">
                        <label className="mb-2 mt-2 text-sm font-medium">See from: (*)</label>
                        <Select
                            onValueChange={(value) => {
                                const project = projectsList.find((project) => project.id === value);
                                setCurrentProject(project);
                            }}
                        >
                            <SelectTrigger className="w-full max-w-sm">
                                <SelectValue placeholder="Select Project" />
                            </SelectTrigger>
                            <SelectContent side="bottom" avoidCollisions={false}>
                                {projectsList.map((item) => (
                                    <SelectItem key={item.id} value={item.id}>
                                        {item.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="w-full">
                        <label className="mb-1 mt-3 block text-sm font-medium">From date: (*)</label>
                        <input
                            type="date"
                            onChange={handleDateSelected}
                            className="border px-2 py-2 rounded w-full max-w-sm"
                        />
                    </div>
                </div>
            </Modal>
        </>
    )
}