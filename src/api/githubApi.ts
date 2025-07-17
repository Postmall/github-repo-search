import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const GITHUB_GRAPHQL_URL = 'https://api.github.com/graphql';
const token = process.env.REACT_APP_GITHUB_TOKEN;

/**
 * Формирует GraphQL-запрос для поиска репозиториев
 *
 * @param search Поисковый запрос
 * @param after Курсор для пагинации
 * @param first Количество репозиториев на странице
 * @param orderBy Объект сортировки
 * @returns Строка запроса GraphQL
 */
const buildGraphQLQuery = (
    search: string,
    after: string | null,
    first: number,
    orderBy: { field: string; direction: 'ASC' | 'DESC' }
): string => `
  query {
    search(
      query: "${search}",
      type: REPOSITORY,
      first: ${first},
      ${after ? `after: "${after}",` : ''}
      orderBy: {field: ${orderBy.field}, direction: ${orderBy.direction}}
    ) {
      repositoryCount
      pageInfo {
        endCursor
        hasNextPage
      }
      edges {
        cursor
        node {
          ... on Repository {
            id
            name
            description
            licenseInfo {
              name
            }
            forkCount
            stargazerCount
            primaryLanguage {
              name
            }
            updatedAt
            url
          }
        }
      }
    }
  }
`;

/**
 * RTK Query API для работы с GitHub GraphQL API
 */
export const githubApi = createApi({
    reducerPath: 'githubApi',
    baseQuery: fetchBaseQuery({
        baseUrl: GITHUB_GRAPHQL_URL,
        prepareHeaders: (headers) => {
            if (token) {
                headers.set('Authorization', `Bearer ${token}`);
            }
            headers.set('Content-Type', 'application/json');
            return headers;
        }
    }),
    endpoints: (builder) => ({
        searchRepositories: builder.query<any, {
            search: string;
            after?: string | null;
            first?: number;
            orderBy?: { field: string; direction: 'ASC' | 'DESC' };
        }>({
            query: ({ search, after = null, first = 10, orderBy = { field: 'STARS', direction: 'DESC' } }) => ({
                url: '', // важно!
                method: 'POST',
                body: {
                    query: buildGraphQLQuery(search, after, first, orderBy),
                },
            }),
        }),
    }),
});

export const { useSearchRepositoriesQuery } = githubApi;