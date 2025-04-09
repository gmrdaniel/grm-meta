
import { useState, useEffect, useMemo } from "react";
import { EmailCreator } from "@/types/email-creator";
import { toast } from "sonner";
import * as XLSX from 'xlsx';

export type SortConfig = {
  key: string;
  direction: "asc" | "desc";
};

export const useEmailCreators = (creators: EmailCreator[]) => {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [viewTextCreator, setViewTextCreator] = useState<EmailCreator | null>(null);
  const [isViewTextDialogOpen, setIsViewTextDialogOpen] = useState(false);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: "created_at", direction: "desc" });

  // Reset selected items when creators list changes
  useEffect(() => {
    setSelectedItems([]);
  }, [creators]);

  const toggleSelectAll = () => {
    if (selectedItems.length === creators.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(creators.map(creator => creator.id));
    }
  };

  const toggleSelectItem = (id: string) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter(itemId => itemId !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  };

  const getSelectedCreators = (): EmailCreator[] => {
    return creators.filter(creator => selectedItems.includes(creator.id));
  };

  const handleViewText = (creator: EmailCreator) => {
    setViewTextCreator(creator);
    setIsViewTextDialogOpen(true);
  };

  const handleSortChange = (key: string) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Use the sorted data directly - don't filter it locally
  const filteredCreators = useMemo(() => {
    let result = [...creators];
    
    // Apply sorting
    if (sortConfig) {
      result.sort((a, b) => {
        if (sortConfig.key === 'created_at') {
          const aDate = new Date(a.created_at).getTime();
          const bDate = new Date(b.created_at).getTime();
          return sortConfig.direction === 'asc' ? aDate - bDate : bDate - aDate;
        }
        
        // If we add more sortable fields in the future
        const aValue = a[sortConfig.key as keyof EmailCreator];
        const bValue = b[sortConfig.key as keyof EmailCreator];
        
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortConfig.direction === 'asc'
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }
        
        return 0;
      });
    }
    
    return result;
  }, [creators, sortConfig]);

  const handleDownloadSelected = (format: 'xls' | 'csv') => {
    if (selectedItems.length === 0) {
      toast.error("Please select at least one record to download");
      return;
    }

    const selectedCreators = getSelectedCreators();
    
    const exportData = selectedCreators.map(creator => {
      let paragraphs: string[] = [];
      
      if (creator.prompt_output) {
        paragraphs = creator.prompt_output
          .split(/\n\s*\n/)
          .map(p => p.trim())
          .filter(p => p.length > 0);
      }
      
      const baseObject: Record<string, string> = {
        "Full_name": creator.full_name || "",
        "Email": creator.email || "",
        "meta_content_invitation": creator.link_invitation || "",
        "Source_file": creator.source_file || "Unknown",
      };
      
      for (let i = 1; i <= 11; i++) {
        const paragraphIndex = i - 1;
        if (paragraphIndex < paragraphs.length) {
          baseObject[`Paragraph ${i}`] = paragraphs[paragraphIndex].replace(/\n/g, ' ');
        } else {
          baseObject[`Paragraph ${i}`] = "";
        }
      }
      
      return baseObject;
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    
    if (format === 'csv') {
      const csv = XLSX.utils.sheet_to_csv(worksheet);
      
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const fileName = `email_creators_export_${new Date().toISOString().split("T")[0]}.csv`;
      
      link.href = URL.createObjectURL(blob);
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success(`${selectedCreators.length} records exported successfully as CSV`);
    } else {
      const columnWidths = [
        { wch: 25 },  // Full_name
        { wch: 30 },  // Email
        { wch: 35 },  // meta_content_invitation
        { wch: 25 },  // Source_file
      ];
      
      for (let i = 0; i < 11; i++) {
        columnWidths.push({ wch: 1000 }); // Setting extremely wide to avoid truncation
      }
      
      worksheet['!cols'] = columnWidths;

      for (let i = 0; i < exportData.length; i++) {
        for (let col = 3; col <= 13; col++) { // Paragraph columns (3-13)
          const cellRef = XLSX.utils.encode_cell({r: i+1, c: col});
          if (!worksheet[cellRef]) continue;
          
          if (!worksheet[cellRef].s) worksheet[cellRef].s = {};
          worksheet[cellRef].s.alignment = { wrapText: true, vertical: 'top' };
        }
      }

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "EmailCreators");

      const fileName = `email_creators_export_${new Date().toISOString().split("T")[0]}.xlsx`;
      
      XLSX.writeFile(workbook, fileName, { 
        bookType: 'xlsx', 
        bookSST: false,
        type: 'binary',
        cellStyles: true,
        compression: true
      });
      
      toast.success(`${selectedCreators.length} records exported successfully as Excel`);
    }
  };

  return {
    selectedItems,
    statusFilter,
    setStatusFilter,
    viewTextCreator,
    setViewTextCreator,
    isViewTextDialogOpen,
    setIsViewTextDialogOpen,
    filteredCreators,
    toggleSelectAll,
    toggleSelectItem,
    getSelectedCreators,
    handleViewText,
    handleDownloadSelected,
    sortConfig,
    handleSortChange
  };
};
