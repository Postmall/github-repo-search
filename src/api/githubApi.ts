import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

interface SearchRepositoriesArgs {
  search: string;
  first?: number;
  after?: string | null;
  last?: number;
  before?: string | null;
  orderBy?: {
    field: 'STARS' | 'FORKS' | 'UPDATED_AT';
    direction: 'ASC' | 'DESC';
  };
}

export const githubApi = createApi({
  reducerPath: 'githubApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'https://api.github.com/graphql',
    prepareHeaders: (headers) => {
      // Убедись, что у тебя в .env прописан REACT_APP_GITHUB_TOKEN с твоим токеном
      headers.set('Authorization', `Bearer ${process.env.REACT_APP_GITHUB_TOKEN}`);
      return headers;
    },
  }),
  endpoints: (builder) => ({
    searchRepositories: builder.query<any, SearchRepositoriesArgs>({
      query: ({ search, first, after, last, before, orderBy }) => ({
        url: '',
        method: 'POST',
        body: {
          query: `
            query SearchRepos(
              $search: String!,
              $first: Int,
              $after: String,
              $last: Int,
              $before: String,
              $orderBy: RepositoryOrder
            ) {
              search(
                query: $search,
                type: REPOSITORY,
                first: $first,
                after: $after,
                last: $last,
                before: $before,
                orderBy: $orderBy
              ) {
                repositoryCount
                edges {
                  node {
                    ... on Repository {
                      id
                      name
                      forkCount
                      stargazerCount
                      updatedAt
                      primaryLanguage {
                        name
                      }
                    }
                  }
                }
                pageInfo {
                  endCursor
                  startCursor
                  hasNextPage
                  hasPreviousPage
                }
              }
            }
          `,
          variables: {
            search,
            first,
            after,
            last,
            before,
            orderBy,
          },
        },
      }),
    }),
  }),
});

export const { useSearchRepositoriesQuery } = githubApi;