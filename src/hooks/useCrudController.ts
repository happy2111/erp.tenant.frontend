import { useState, useCallback } from "react";
import { debounce } from "lodash";

export function useCrudController<T>() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const [createOpen, setCreateOpen] = useState(false);
  const [editItem, setEditItem] = useState<T | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const updateDebouncedSearch = useCallback(
    debounce((value: string) => {
      setDebouncedSearch(value);
      setPage(1);
    }, 400),
    []
  );
  const handleSearchChange = (value: string) => {
    setSearch(value); // Мгновенно обновляем текст в поле
    updateDebouncedSearch(value); // Планируем обновление данных
  };

  return {
    // Состояние поиска и пагинации
    search,
    debouncedSearch,
    setSearch: handleSearchChange,
    page,
    setPage,
    limit,

    // Диалоги
    createOpen,
    setCreateOpen,
    editItem,
    setEditItem,
    deleteId,
    setDeleteId,

    // Утилиты
    handleEdit: (row: T) => {
      setEditItem(row);
      setCreateOpen(true);
    },
    handleDeleteClick: (id: string) => {
      setDeleteId(id);
    },
  };
}