import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export interface AiMessage {
  id: string;
  role: 'USER' | 'ASSISTANT';
  content: string;
  createdAt: string;
}

export interface AiConversation {
  id: string;
  title: string;
  messages?: AiMessage[];
}

export function useConversations() {
  return useQuery({
    queryKey: ['ai-coach', 'conversations'],
    queryFn: () => apiClient.get<AiConversation[]>('/ai-coach/conversations'),
  });
}

export function useConversation(id: string | null) {
  return useQuery({
    queryKey: ['ai-coach', 'conversation', id],
    queryFn: () => apiClient.get<AiConversation>(`/ai-coach/conversations/${id}`),
    enabled: !!id,
  });
}

export function useStartConversation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => apiClient.post<AiConversation>('/ai-coach/conversations'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['ai-coach', 'conversations'] }),
  });
}

export function useAskCoach(conversationId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (question: string) =>
      apiClient.post<AiMessage>(`/ai-coach/conversations/${conversationId}/messages`, { question }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-coach', 'conversation', conversationId] });
      queryClient.invalidateQueries({ queryKey: ['ai-coach', 'conversations'] });
    },
  });
}
