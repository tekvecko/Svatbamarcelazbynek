import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { z } from "zod";

export interface SiteMetadata {
  id: number;
  metaKey: string;
  metaValue: string | null;
  metaType: "string" | "number" | "boolean" | "json";
  description: string | null;
  category: string;
  isEditable: boolean;
  createdAt: string;
  updatedAt: string;
}

// Schema for creating metadata
const createMetadataSchema = z.object({
  metaKey: z.string().min(1),
  metaValue: z.string().optional(),
  metaType: z.enum(["string", "number", "boolean", "json"]).default("string"),
  description: z.string().optional(),
  category: z.string().default("general"),
  isEditable: z.boolean().default(true),
});

// Schema for updating metadata
const updateMetadataSchema = createMetadataSchema.partial();

export type CreateMetadataRequest = z.infer<typeof createMetadataSchema>;
export type UpdateMetadataRequest = z.infer<typeof updateMetadataSchema>;

export function useMetadata() {
  return useQuery<SiteMetadata[]>({
    queryKey: ['/api/metadata'],
    queryFn: async () => {
      const response = await fetch('/api/metadata');
      if (!response.ok) {
        throw new Error('Failed to fetch metadata');
      }
      return response.json();
    },
  });
}

export function useMetadataByKey(key: string) {
  return useQuery<SiteMetadata>({
    queryKey: ['/api/metadata', key],
    queryFn: async () => {
      const response = await fetch(`/api/metadata/${key}`);
      if (!response.ok) {
        throw new Error('Failed to fetch metadata');
      }
      return response.json();
    },
  });
}

export function useCreateMetadata() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CreateMetadataRequest) => {
      const response = await fetch('/api/metadata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to create metadata');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/metadata'] });
    },
  });
}

export function useUpdateMetadata() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ key, data }: { key: string; data: UpdateMetadataRequest }) => {
      const response = await fetch(`/api/metadata/${key}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to update metadata');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/metadata'] });
    },
  });
}

export function useDeleteMetadata() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (key: string) => {
      const response = await fetch(`/api/metadata/${key}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete metadata');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/metadata'] });
    },
  });
}