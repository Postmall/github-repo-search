import React, { useState, useEffect } from 'react';
import {
  Table, TableHead, TableBody, TableRow, TableCell,
  TableSortLabel, Button, TextField, Paper,
} from '@mui/material';
import { useSearchRepositoriesQuery } from '../api/githubApi';
import styles from './RepoSearch.module.scss';

export interface SortState {
  field: 'STARS' | 'FORKS' | 'UPDATED_AT';
  direction: 'ASC' | 'DESC';
}

/**
 * Компонент поиска репозиториев GitHub и отображения их в виде таблицы.
 */
export const RepoSearch: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedTerm, setDebouncedTerm] = useState(searchTerm);
  const [sort, setSort] = useState<SortState>({ field: 'STARS', direction: 'DESC' });
  const [afterCursor, setAfterCursor] = useState<string | null>(null);
  const [beforeCursor, setBeforeCursor] = useState<string | null>(null);
  const [selectedRepo, setSelectedRepo] = useState<any | null>(null);

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedTerm(searchTerm), 500);
    return () => clearTimeout(timeout);
  }, [searchTerm]);

  useEffect(() => {
    setAfterCursor(null);
    setBeforeCursor(null);
  }, [debouncedTerm, sort]);

  const isGoingForward = afterCursor !== null;

  const { data, error, isLoading } = useSearchRepositoriesQuery({
    search: debouncedTerm || 'react',
    first: isGoingForward ? 10 : undefined,
    after: isGoingForward ? afterCursor ?? undefined : undefined,
    last: !isGoingForward && beforeCursor ? 10 : undefined,
    before: !isGoingForward ? beforeCursor ?? undefined : undefined,
    orderBy: { field: sort.field, direction: sort.direction },
  });

  const handleSort = (field: SortState['field']) => {
    setSort((prev) => ({
      field,
      direction: prev.direction === 'ASC' ? 'DESC' : 'ASC',
    }));
    setAfterCursor(null);
    setBeforeCursor(null);
  };

  const handleNextPage = () => {
    if (data?.search?.pageInfo?.endCursor) {
      setAfterCursor(data.search.pageInfo.endCursor);
      setBeforeCursor(null);
    }
  };

  const handlePrevPage = () => {
    if (data?.search?.pageInfo?.startCursor) {
      setBeforeCursor(data.search.pageInfo.startCursor);
      setAfterCursor(null);
    }
  };

  return (
    <Paper className={styles.container}>
      <TextField
        fullWidth
        label="Поиск репозиториев GitHub"
        variant="outlined"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        margin="normal"
      />

      {isLoading && <p>Загрузка...</p>}
      {error && <p>Ошибка загрузки данных</p>}

      {data && data.search && data.search.edges?.length > 0 ? (
        <>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Название</TableCell>
                <TableCell>Язык</TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sort.field === 'FORKS'}
                    direction={sort.direction.toLowerCase() as 'asc' | 'desc'}
                    onClick={() => handleSort('FORKS')}
                  >
                    Форки
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sort.field === 'STARS'}
                    direction={sort.direction.toLowerCase() as 'asc' | 'desc'}
                    onClick={() => handleSort('STARS')}
                  >
                    Звёзды
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sort.field === 'UPDATED_AT'}
                    direction={sort.direction.toLowerCase() as 'asc' | 'desc'}
                    onClick={() => handleSort('UPDATED_AT')}
                  >
                    Обновлено
                  </TableSortLabel>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.search.edges.map(({ node }: { node: any }) => (
                <TableRow key={node.id} hover onClick={() => setSelectedRepo(node)}>
                  <TableCell>{node.name}</TableCell>
                  <TableCell>{node.primaryLanguage?.name || '-'}</TableCell>
                  <TableCell>{node.forkCount}</TableCell>
                  <TableCell>{node.stargazerCount}</TableCell>
                  <TableCell>{new Date(node.updatedAt).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className={styles.pagination}>
            <Button
              variant="contained"
              onClick={handlePrevPage}
              disabled={!data.search.pageInfo?.hasPreviousPage}
            >
              Назад
            </Button>
            <Button
              variant="contained"
              onClick={handleNextPage}
              disabled={!data.search.pageInfo?.hasNextPage}
            >
              Вперед
            </Button>
          </div>

          {selectedRepo && (
            <Paper className={styles.details}>
              <h3>Детали репозитория</h3>
              <p><strong>Название:</strong> {selectedRepo.name}</p>
              <p><strong>Описание:</strong> {selectedRepo.description || '—'}</p>
              <p><strong>Лицензия:</strong> {selectedRepo.licenseInfo?.name || '—'}</p>
            </Paper>
          )}
        </>
      ) : (
        !isLoading && <p>Нет данных для отображения</p>
      )}
    </Paper>
  );
};