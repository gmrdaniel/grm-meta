
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface ActionCardProps {
  title: string;
  description: string;
  buttonText: string;
  isLoading?: boolean;
  onClick: () => void;
}

const ActionCard = ({ title, description, buttonText, isLoading = false, onClick }: ActionCardProps) => (
  <Card>
    <CardHeader>
      <CardTitle>{title}</CardTitle>
      <CardDescription>{description}</CardDescription>
    </CardHeader>
    <CardFooter>
      <Button onClick={onClick} disabled={isLoading}>
        {isLoading ? 'Loading...' : buttonText}
      </Button>
    </CardFooter>
  </Card>
);

interface ActionCardsProps {
  loading: boolean;
  onExportFullSchema: () => void;
  onGenerateMigrations: () => void;
  onGetFunctionSQL: () => void;
}

const ActionCards = ({ 
  loading, 
  onExportFullSchema, 
  onGenerateMigrations, 
  onGetFunctionSQL 
}: ActionCardsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <ActionCard
        title="Full Schema Export"
        description="Export the complete database schema as SQL"
        buttonText="Export Schema"
        isLoading={loading}
        onClick={onExportFullSchema}
      />
      
      <ActionCard
        title="Table Migrations"
        description="Generate individual table migration scripts"
        buttonText="Generate Migrations"
        isLoading={loading}
        onClick={onGenerateMigrations}
      />
      
      <ActionCard
        title="Custom Functions"
        description="Generate SQL for required database functions"
        buttonText="Get Function SQL"
        onClick={onGetFunctionSQL}
      />
    </div>
  );
};

export default ActionCards;
