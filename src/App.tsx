import React from 'react';
import { RepoSearch } from './components/RepoSearch';

const App: React.FC = () => {
  return (
    <div style={{ padding: 20 }}>
      <h1>Поиск GitHub репозиториев</h1>
      <RepoSearch />
    </div>
  );
};

export default App;