"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  createMasterTopic,
  createTopic,
  deleteSelectedSubTopics,
  deleteSubTopic,
  fetchMasterTopic,
  fetchMasterTopics,
  updateSolution,
  updateSubTopic,
} from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import type {
  AddMasterTopicPayload,
  AddTopicPayload,
  UpdateSolutionPayload,
  UpdateSubTopicPayload,
} from "@/types";

export function useMasterTopics() {
  return useQuery({
    queryKey: queryKeys.masterTopics,
    queryFn: fetchMasterTopics,
  });
}

export function useMasterTopic(id: string) {
  return useQuery({
    queryKey: queryKeys.masterTopic(id),
    queryFn: () => fetchMasterTopic(id),
    enabled: Boolean(id),
  });
}

export function useCreateMasterTopic() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: AddMasterTopicPayload) => createMasterTopic(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.masterTopics });
    },
  });
}

export function useCreateTopic() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: FormData | AddTopicPayload) => createTopic(payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.masterTopics });
      const masterTopicId =
        variables instanceof FormData
          ? String(variables.get("masterTopicId") ?? "")
          : variables.masterTopicId;
      if (masterTopicId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.masterTopic(masterTopicId),
        });
      }
    },
  });
}

export function useUpdateSolution() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateSolutionPayload) => updateSolution(payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.masterTopic(variables.masterTopicId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.masterTopics });
    },
  });
}

export function useUpdateSubTopic() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateSubTopicPayload) => updateSubTopic(payload),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.masterTopics });
      queryClient.invalidateQueries({
        queryKey: queryKeys.masterTopic(result.masterTopicId),
      });
      if (result.previousMasterTopicId !== result.masterTopicId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.masterTopic(result.previousMasterTopicId),
        });
      }
    },
  });
}

export function useDeleteSubTopic() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      masterTopicId,
      topicId,
    }: {
      masterTopicId: string;
      topicId: string;
    }) => deleteSubTopic(masterTopicId, topicId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.masterTopics });
      queryClient.invalidateQueries({
        queryKey: queryKeys.masterTopic(variables.masterTopicId),
      });
    },
  });
}

export function useDeleteSelectedSubTopics() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      masterTopicId,
      topicIds,
    }: {
      masterTopicId: string;
      topicIds: string[];
    }) => deleteSelectedSubTopics(masterTopicId, topicIds),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.masterTopics });
      queryClient.invalidateQueries({
        queryKey: queryKeys.masterTopic(variables.masterTopicId),
      });
    },
  });
}
