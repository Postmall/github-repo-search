import React, { useState } from 'react';
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableSortLabel,
  Pagination,
  TextField,
  Paper,
} from '@mui/material';
import { useSearchRepositoriesQuery } from '../api/githubApi'; // RTK Query хук, который ты написал

interface SortState {
  field: 'STARS' | 'FORKS' | 'UPDATED_AT';
  direction: 'ASC' | 'DESC';
}

export const RepoSearch: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<SortState>({ field: 'STARS', direction: 'DESC' });

  // Запрос через RTK Query
  const { data, error, isLoading } = useSearchRepositoriesQuery({
    search: searchTerm || 'react', // По умолчанию react, чтобы сразу что-то видеть
    first: 10,
    after: null, // Для упрощения пока без курсоров пагинации
    orderBy: { field: sort.field, direction: sort.direction },
  });

  // Обработчик сортировки
  const handleSort = (field: SortState['field']) => {
    setSort((prev) => ({
      field,
      direction: prev.direction === 'ASC' ? 'DESC' : 'ASC',
    }));
  };

  return (
    <Paper style={{ padding: 16 }}>
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

      {data && (
        <>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Название</TableCell>
                <TableCell>Язык</TableCell>
                <TableCell sortDirection={sort.field === 'FORKS' ? sort.direction.toLowerCase() : false}>
                  <TableSortLabel
                    active={sort.field === 'FORKS'}
                    direction={sort.direction.toLowerCase()}
                    onClick={() => handleSort('FORKS')}
                  >
                    Форки
                  </TableSortLabel>
                </TableCell>
                <TableCell sortDirection={sort.field === 'STARS' ? sort.direction.toLowerCase() : false}>
                  <TableSortLabel
                    active={sort.field === 'STARS'}
                    direction={sort.direction.toLowerCase()}
                    onClick={() => handleSort('STARS')}
                  >
                    Звёзды
                  </TableSortLabel>
                </TableCell>
                <TableCell sortDirection={sort.field === 'UPDATED_AT' ? sort.direction.toLowerCase() : false}>
                  <TableSortLabel
                    active={sort.field === 'UPDATED_AT'}
                    direction={sort.direction.toLowerCase()}
                    onClick={() => handleSort('UPDATED_AT')}
                  >
                    Обновлено
                  </TableSortLabel>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.search.edges.map(({ node }) => (
                <TableRow key={node.id} hover>
                  <TableCell>{node.name}</TableCell>
                  <TableCell>{node.primaryLanguage?.name || '-'}</TableCell>
                  <TableCell>{node.forkCount}</TableCell>
                  <TableCell>{node.stargazerCount}</TableCell>
                  <TableCell>{new Date(node.updatedAt).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Pagination
            count={Math.ceil(data.search.repositoryCount / 10)}
            page={page}
            onChange={(e, newPage) => setPage(newPage)}
            style={{ marginTop: 16 }}
          />
        </>
      )}
    </Paper>
  );
};