import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useCharity() {
  // This endpoint returns the charity data for the authenticated user.
  const { data, error, mutate } = useSWR("/api/charity", fetcher);
  return {
    charity: data,
    isLoading: !error && !data,
    isError: error,
    mutate,
  };
}
