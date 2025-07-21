import React, { useState, useEffect, useMemo } from 'react';
import {
  Table, TableHead, TableBody, TableRow, TableCell,
  TableSortLabel, Button, TextField, Paper,
} from '@mui/material';
import { useSearchRepositoriesQuery } from '../api/githubApi';
import styles from './RepoSearch.module.scss';

/**
 * Интерфейс для состояния сортировки таблицы
 */
export interface SortState {
  field: 'STARS' | 'FORKS' | 'UPDATED_AT';
  direction: 'ASC' | 'DESC';
}

/**
 * Интерфейс для узла репозитория из GraphQL ответа
 */
interface RepositoryNode {
  id: string;
  name: string;
  description: string | null;
  forkCount: number;
  stargazerCount: number;
  updatedAt: string;
  licenseInfo?: {
    name: string;
  } | null;
  primaryLanguage?: {
    name: string;
  } | null;
}

/**
 * Компонент для поиска и отображения репозиториев GitHub
 */
export const RepoSearch: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [submittedTerm, setSubmittedTerm] = useState('react');
  const [sort, setSort] = useState<SortState>({ field: 'STARS', direction: 'DESC' });
  const [afterCursor, setAfterCursor] = useState<string | null>(null);
  const [beforeCursor, setBeforeCursor] = useState<string | null>(null);
  const [selectedRepo, setSelectedRepo] = useState<RepositoryNode | null>(null);

  // Параметры для запроса
  const queryArgs = {
    search: submittedTerm,
    first: !beforeCursor ? 10 : undefined,
    after: !beforeCursor ? afterCursor ?? undefined : undefined,
    last: beforeCursor ? 10 : undefined,
    before: beforeCursor ?? undefined,
  };

  const { data, error, isLoading } = useSearchRepositoriesQuery(queryArgs);

  useEffect(() => {
    if (data) {
      console.log('Raw query data:', data);
    }
    if (error) {
      console.error('Error:', error);
    }
  }, [data, error]);

  /**
   * Обработчик нажатия кнопки поиска
   */
  const handleSearch = () => {
    const trimmed = searchTerm.trim();
    setSubmittedTerm(trimmed || 'react');
    setAfterCursor(null);
    setBeforeCursor(null);
    setSelectedRepo(null);
  };

  /**
   * Обработчик сортировки по столбцам
   * @param field - поле для сортировки
   */
  const handleSort = (field: SortState['field']) => {
    setSort((prev) => ({
      field,
      direction: prev.field === field && prev.direction === 'ASC' ? 'DESC' : 'ASC',
    }));
    setAfterCursor(null);
    setBeforeCursor(null);
  };

  /**
   * Переход к следующей странице
   */
  const handleNextPage = () => {
    if (data?.data?.search?.pageInfo?.endCursor) {
      setAfterCursor(data.data.search.pageInfo.endCursor);
      setBeforeCursor(null);
      setSelectedRepo(null);
    }
  };

  /**
   * Переход к предыдущей странице
   */
  const handlePrevPage = () => {
    if (data?.data?.search?.pageInfo?.startCursor) {
      setBeforeCursor(data.data.search.pageInfo.startCursor);
      setAfterCursor(null);
      setSelectedRepo(null);
    }
  };

  /**
   * Отсортированные репозитории (клиентская сортировка)
   */
  const sortedRepos = useMemo(() => {
    const edges = data?.data?.search?.edges ?? [];
    if (!edges.length) return [];

    const repos = [...edges];

    return repos.sort((a, b) => {
      const nodeA: RepositoryNode = a.node;
      const nodeB: RepositoryNode = b.node;

      switch (sort.field) {
        case 'STARS':
          return sort.direction === 'ASC'
            ? nodeA.stargazerCount - nodeB.stargazerCount
            : nodeB.stargazerCount - nodeA.stargazerCount;
        case 'FORKS':
          return sort.direction === 'ASC'
            ? nodeA.forkCount - nodeB.forkCount
            : nodeB.forkCount - nodeA.forkCount;
        case 'UPDATED_AT':
          return sort.direction === 'ASC'
            ? new Date(nodeA.updatedAt).getTime() - new Date(nodeB.updatedAt).getTime()
            : new Date(nodeB.updatedAt).getTime() - new Date(nodeA.updatedAt).getTime();
        default:
          return 0;
      }
    });
  }, [data, sort]);

  /**
   * Конвертация направления сортировки для MUI
   */
  const getDirection = (dir: 'ASC' | 'DESC'): 'asc' | 'desc' =>
    dir === 'ASC' ? 'asc' : 'desc';

  return (
    <Paper className={styles.container}>
      <TextField
        fullWidth
        label="Поиск репозиториев GitHub"
        variant="outlined"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleSearch();
        }}
        margin="normal"
      />
      <Button variant="contained" onClick={handleSearch} style={{ marginBottom: '16px' }}>
        Поиск
      </Button>

      {isLoading && <p>Загрузка...</p>}
      {error && <p>Ошибка загрузки данных</p>}

      {sortedRepos.length > 0 ? (
        <>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <TableSortLabel
                    active={sort.field === 'STARS'}
                    direction={getDirection(sort.direction)}
                    onClick={() => handleSort('STARS')}
                  >
                    Stars
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sort.field === 'FORKS'}
                    direction={getDirection(sort.direction)}
                    onClick={() => handleSort('FORKS')}
                  >
                    Forks
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sort.field === 'UPDATED_AT'}
                    direction={getDirection(sort.direction)}
                    onClick={() => handleSort('UPDATED_AT')}
                  >
                    Updated At
                  </TableSortLabel>
                </TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Language</TableCell>
                <TableCell>Description</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedRepos.map(({ node }: { node: RepositoryNode }) => (
                <TableRow
                  key={node.id}
                  onClick={() => setSelectedRepo(node)}
                  style={{ cursor: 'pointer' }}
                  hover
                  selected={selectedRepo?.id === node.id}
                >
                  <TableCell>{node.stargazerCount}</TableCell>
                  <TableCell>{node.forkCount}</TableCell>
                  <TableCell>{new Date(node.updatedAt).toLocaleDateString()}</TableCell>
                  <TableCell>{node.name}</TableCell>
                  <TableCell>{node.primaryLanguage?.name ?? '—'}</TableCell>
                  <TableCell>{node.description ?? '—'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div style={{ marginTop: 16 }}>
            <Button onClick={handlePrevPage} disabled={!data?.data?.search?.pageInfo?.hasPreviousPage}>
              Назад
            </Button>
            <Button
              onClick={handleNextPage}
              disabled={!data?.data?.search?.pageInfo?.hasNextPage}
              style={{ marginLeft: 8 }}
            >
              Вперед
            </Button>
          </div>

          {/* Отображение деталей выбранного репозитория */}
          {selectedRepo && (
            <Paper style={{ marginTop: 24, padding: 16, backgroundColor: '#f9f9f9' }}>
              <h3>{selectedRepo.name}</h3>
              <p><strong>Description:</strong> {selectedRepo.description ?? 'No description'}</p>
              <p><strong>License:</strong> {selectedRepo.licenseInfo?.name ?? 'No license info'}</p>
            </Paper>
          )}
        </>
      ) : (
        !isLoading && <p>Нет данных для отображения</p>
      )}
    </Paper>
  );
};