import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

interface SearchRepositoriesArgs {
  search: string;
  first?: number;
  after?: string;
  last?: number;
  before?: string;
  // Убрали orderBy из интерфейса, т.к. он не поддерживается в search
}

export const githubApi = createApi({
  reducerPath: 'githubApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'https://api.github.com/graphql',
    prepareHeaders: (headers) => {
      const token = process.env.REACT_APP_GITHUB_TOKEN;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  }),
  endpoints: (builder) => ({
    searchRepositories: builder.query<any, SearchRepositoriesArgs>({
      query: ({ search, first, after, last, before }) => {
        const searchWithSort = search;

        return {
          url: '',
          method: 'POST',
          body: JSON.stringify({
            query: `
        query SearchRepos(
          $search: String!,
          $first: Int,
          $after: String,
          $last: Int,
          $before: String
        ) {
          search(
            query: $search,
            type: REPOSITORY,
            first: $first,
            after: $after,
            last: $last,
            before: $before
          ) {
            repositoryCount
            edges {
              node {
                ... on Repository {
                  id
                  name
                  description
                  forkCount
                  stargazerCount
                  updatedAt
                  licenseInfo {
                    name
                  }
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
              search: searchWithSort,
              first,
              after,
              last,
              before,
            },
          }),
        };
      },

    }),
  }),
});

export const { useSearchRepositoriesQuery } = githubApi;