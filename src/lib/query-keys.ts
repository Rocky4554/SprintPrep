export const queryKeys = {
  masterTopics: ["masterTopics"] as const,
  masterTopic: (id: string) => ["masterTopic", id] as const,
};
