
import { fetchProjects } from './project/projectService';

// Añadir esta función para exponer fetchProjects desde invitationService
export const getProjects = async () => {
  return await fetchProjects();
};

// This file is kept for backwards compatibility
// It re-exports all functions from the modular invitation service
export * from './invitation';
