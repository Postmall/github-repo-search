import React, { useState } from 'react';
import { useSearchRepositoriesQuery } from './api/githubApi';

const App = () => {
  const [search, setSearch] = useState('react');

  const { data, error, isLoading } = useSearchRepositoriesQuery({
    search,
    first: 10,
    orderBy: { field: 'STARS', direction: 'DESC' },
  });

  return (
    <div style={{ padding: 20 }}>
      <h1>Поиск GitHub репозиториев</h1>
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Введите запрос"
        style={{ padding: 8, fontSize: 16 }}
      />
      {isLoading && <p>Загрузка...</p>}
      {error && <p>Ошибка при загрузке данных</p>}
      <ul>
        {data?.data?.search?.edges?.map((edge: any) => (
          <li key={edge.node.id}>
            <strong>{edge.node.name}</strong> — ⭐ {edge.node.stargazerCount}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default App;