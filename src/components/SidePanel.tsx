import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, ExclamationTriangleIcon, PencilIcon, TrashIcon, PlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { Fragment } from 'react';

interface Item {
  _id: string;
  name?: string;
  notes?: string;
  points?: number;
  links?: string[];
  images?: string[];
  createdAt: string;
  targetDate?: string;
  status?: 'ETS' | 'IN_PROGRESS' | 'COMPLETED';
}

interface Todo {
  _id: string;
  title: string;
  items: Item[];
  user: string;
  createdAt: string;
  targetDate?: string;
}

interface SidePanelProps {
  todos: Todo[];
  onTodoClick: (todo: Todo) => void;
  onCreateTodo: (title: string, targetDate?: string) => void;
  onDeleteTodo: (id: string) => void;
  onUpdateTodo: (todo: Todo) => void;
  isMobile: boolean;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  isLoading?: boolean;
  selectedId?: string;
}

export default function SidePanel({
  todos,
  onTodoClick,
  onCreateTodo,
  onDeleteTodo,
  onUpdateTodo,
  isMobile,
  isOpen,
  setIsOpen,
  isLoading = false,
  selectedId,
}: SidePanelProps) {
  const { data: session } = useSession();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTodoTitle, setNewTodoTitle] = useState('');
  const [newTodoTargetDate, setNewTodoTargetDate] = useState('');
  const [todoToDelete, setTodoToDelete] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editTargetDate, setEditTargetDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTodoTitle.trim()) {
      onCreateTodo(newTodoTitle, newTodoTargetDate);
      setNewTodoTitle('');
      setNewTodoTargetDate('');
      setIsCreateModalOpen(false);
    }
  };

  const handleDeleteClick = (id: string) => {
    setTodoToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (todoToDelete) {
      onDeleteTodo(todoToDelete);
      setTodoToDelete(null);
      setIsDeleteModalOpen(false);
    }
  };

  const handleEditClick = (todo: Todo) => {
    setEditingTodo(todo);
    setEditTitle(todo.title);
    setEditTargetDate(todo.targetDate ? new Date(todo.targetDate).toISOString().split('T')[0] : '');
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTodo && editTitle.trim()) {
      const updatedTodo = {
        ...editingTodo,
        title: editTitle.trim(),
        targetDate: editTargetDate ? new Date(editTargetDate).toISOString() : undefined
      };
      onUpdateTodo(updatedTodo);
      setIsEditModalOpen(false);
      setEditingTodo(null);
      setEditTitle('');
      setEditTargetDate('');
    }
  };

  const filteredTodos = todos.filter(todo =>
    todo.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const panel = (
    <div className="flex h-full flex-col bg-nav text-nav-ink">
      <div className="p-4 border-b nav-divider">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-[11px] font-semibold text-nav-ink">Workspace</p>
            <h2 className="text-[14.5px] font-bold tracking-[-0.02em] text-nav-ink">
              Projects
            </h2>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex h-[34px] w-[34px] items-center justify-center rounded-[8px] bg-surface text-nav hover:bg-nav-hover transition-colors"
            title="Create Project"
          >
            <PlusIcon className="h-[17px] w-[17px] stroke-2" />
          </button>
        </div>
        
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-[17px] w-[17px] stroke-2 text-faint" />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-2 bg-surface border border-line rounded-[8px] text-[13px] text-ink placeholder:text-faint focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-faint hover:text-ink transition-colors"
            >
              <XMarkIcon className="h-4 w-4 stroke-2" />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-40 space-y-3">
            <div className="w-7 h-7 border-2 border-nav-hover border-t-nav-ink rounded-full animate-spin" />
            <p className="text-[12px] font-medium text-nav-ink">Loading...</p>
          </div>
        ) : (
          <div className="space-y-1">
            {filteredTodos.map((todo) => {
              const isActive = selectedId === todo._id;
              return (
              <div 
                key={todo._id} 
                className={`group relative flex items-center rounded-[7px] border border-transparent px-3 py-2 cursor-pointer transition-colors ${
                  isActive
                    ? 'bg-nav text-nav-ink shadow-[inset_3px_0_0_var(--nav-text)]'
                    : 'text-nav-ink hover:bg-nav-hover hover:text-nav'
                }`}
                onClick={() => onTodoClick(todo)}
              >
                <div className="flex-1 min-w-0 mr-2">
                  <h3 className="text-[13.5px] font-semibold truncate">
                    {todo.title}
                  </h3>
                  <p className="font-mono text-[11.5px] mt-0.5 opacity-80">
                    {new Date(todo.createdAt).toLocaleDateString()}
                  </p>
                </div>
                
                <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditClick(todo);
                    }}
                    className="p-1.5 rounded-[6px] text-current hover:bg-surface transition-colors"
                  >
                    <PencilIcon className="h-[17px] w-[17px] stroke-2" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteClick(todo._id);
                    }}
                    className="p-1.5 rounded-[6px] text-current hover:bg-negative-soft hover:text-negative transition-colors"
                  >
                    <TrashIcon className="h-[17px] w-[17px] stroke-2" />
                  </button>
                </div>
              </div>
              );
            })}
            
            {filteredTodos.length === 0 && !isLoading && (
              <div className="px-3 py-10 text-center">
                <div className="inline-flex p-3 rounded-full bg-nav-hover mb-3">
                  <MagnifyingGlassIcon className="h-[17px] w-[17px] stroke-2 text-nav" />
                </div>
                <p className="text-[13px] font-medium text-nav-ink">
                  {searchQuery ? 'No results found.' : 'No projects yet.'}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mt-auto border-t nav-divider p-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-nav-hover text-[12px] font-bold text-nav">
            {session?.user?.name?.[0]?.toUpperCase() || 'C'}
          </div>
          <div className="min-w-0">
            <p className="truncate text-[13px] font-semibold text-nav-ink">
              {session?.user?.name || 'CopyCat'}
            </p>
            <p className="truncate text-[11.5px] text-nav-ink opacity-80">
              {session?.user?.email || 'Workspace'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <>
        <Transition.Root show={isOpen} as={Fragment}>
          <Dialog as="div" className="relative z-50" onClose={setIsOpen}>
            <Transition.Child
              as={Fragment}
              enter="ease-in-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in-out duration-300"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="overlay fixed inset-0 transition-opacity" />
            </Transition.Child>

            <div className="fixed inset-0 overflow-hidden">
              <div className="absolute inset-0 overflow-hidden">
                <div className="pointer-events-none fixed inset-y-0 left-0 flex max-w-full">
                  <Transition.Child
                    as={Fragment}
                    enter="transform transition ease-in-out duration-300"
                    enterFrom="-translate-x-full"
                    enterTo="translate-x-0"
                    leave="transform transition ease-in-out duration-300"
                    leaveFrom="translate-x-0"
                    leaveTo="-translate-x-full"
                  >
                    <Dialog.Panel className="pointer-events-auto w-[232px]">
                      <div className="flex h-full flex-col bg-nav">
                        <div className="flex items-center justify-between p-4 border-b nav-divider">
                          <Dialog.Title className="text-[13px] font-semibold text-nav-ink">
                            Menu
                          </Dialog.Title>
                          <button 
                            onClick={() => setIsOpen(false)}
                            className="inline-flex h-[34px] w-[34px] items-center justify-center rounded-[8px] bg-nav text-nav-ink hover:bg-nav-hover hover:text-nav transition-colors"
                          >
                            <XMarkIcon className="h-[17px] w-[17px] stroke-2" />
                          </button>
                        </div>
                        <div className="flex-1 overflow-y-auto">
                          {panel}
                        </div>
                      </div>
                    </Dialog.Panel>
                  </Transition.Child>
                </div>
              </div>
            </div>
          </Dialog>
        </Transition.Root>

        <CreateTodoModal 
          isOpen={isCreateModalOpen}
          setIsOpen={setIsCreateModalOpen}
          title={newTodoTitle}
          setTitle={setNewTodoTitle}
          targetDate={newTodoTargetDate}
          setTargetDate={setNewTodoTargetDate}
          onSubmit={handleCreateSubmit}
        />

        <EditTodoModal
          isOpen={isEditModalOpen}
          setIsOpen={setIsEditModalOpen}
          title={editTitle}
          setTitle={setEditTitle}
          targetDate={editTargetDate}
          setTargetDate={setEditTargetDate}
          onSubmit={handleEditSubmit}
        />

        <DeleteConfirmationModal
          isOpen={isDeleteModalOpen}
          setIsOpen={setIsDeleteModalOpen}
          onConfirm={handleConfirmDelete}
        />
      </>
    );
  }

  return (
    <>
      <div className="w-[232px] h-full flex flex-col">{panel}</div>
      
      <CreateTodoModal 
        isOpen={isCreateModalOpen}
        setIsOpen={setIsCreateModalOpen}
        title={newTodoTitle}
        setTitle={setNewTodoTitle}
        targetDate={newTodoTargetDate}
        setTargetDate={setNewTodoTargetDate}
        onSubmit={handleCreateSubmit}
      />

      <EditTodoModal
        isOpen={isEditModalOpen}
        setIsOpen={setIsEditModalOpen}
        title={editTitle}
        setTitle={setEditTitle}
        targetDate={editTargetDate}
        setTargetDate={setEditTargetDate}
        onSubmit={handleEditSubmit}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        setIsOpen={setIsDeleteModalOpen}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}

function CreateTodoModal({
  isOpen,
  setIsOpen,
  title,
  setTitle,
  onSubmit
}: {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  title: string;
  setTitle: (title: string) => void;
  targetDate: string;
  setTargetDate: (date: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}) {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-[60]" onClose={() => setIsOpen(false)}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="overlay fixed inset-0" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md bg-surface rounded-[10px] p-6 border border-line shadow-card">
                <div className="mb-6">
                  <Dialog.Title as="h3" className="text-[21px] font-bold tracking-[-0.02em] text-ink">
                    Create New Project
                  </Dialog.Title>
                  <p className="text-[13px] text-mute mt-1">Organize your items into projects</p>
                </div>
                
                <form onSubmit={onSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="todoTitle" className="text-[12.5px] font-semibold leading-none text-ink">
                       Project Name
                    </label>
                    <input
                      type="text"
                      id="todoTitle"
                      className="flex h-10 w-full rounded-[8px] border border-line bg-surface px-3 py-2 text-[13px] text-ink placeholder:text-faint focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent focus-visible:border-accent"
                      placeholder="e.g. Work Assets, Personal Clips"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      autoFocus
                      required
                    />
                  </div>

                  <div className="flex justify-end space-x-3 pt-6">
                    <button
                      type="button"
                      className="inline-flex items-center justify-center rounded-[8px] text-[13px] font-semibold transition-colors border border-line bg-surface text-ink hover:bg-surface-2 h-10 px-4 py-2"
                      onClick={() => setIsOpen(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="inline-flex items-center justify-center rounded-[8px] text-[13px] font-semibold bg-accent text-nav-ink hover:bg-accent-hover h-10 px-4 py-2"
                    >
                      Create
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

function EditTodoModal({
  isOpen,
  setIsOpen,
  title,
  setTitle,
  onSubmit
}: {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  title: string;
  setTitle: (title: string) => void;
  targetDate: string;
  setTargetDate: (date: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}) {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-[60]" onClose={() => setIsOpen(false)}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="overlay fixed inset-0" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md bg-surface rounded-[10px] p-6 border border-line shadow-card text-left">
                <div className="mb-6">
                  <Dialog.Title as="h3" className="text-[21px] font-bold tracking-[-0.02em] text-ink">
                    Edit Project
                  </Dialog.Title>
                  <p className="text-[13px] text-mute mt-1">Make changes to your project details</p>
                </div>
                
                <form onSubmit={onSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="editTodoTitle" className="text-[12.5px] font-semibold leading-none text-ink">
                      Project Name
                    </label>
                    <input
                      type="text"
                      id="editTodoTitle"
                      className="flex h-10 w-full rounded-[8px] border border-line bg-surface px-3 py-2 text-[13px] text-ink placeholder:text-faint focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent focus-visible:border-accent"
                      placeholder="Enter project name"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      autoFocus
                      required
                    />
                  </div>

                  <div className="flex justify-end space-x-3 pt-6">
                    <button
                      type="button"
                      className="inline-flex items-center justify-center rounded-[8px] text-[13px] font-semibold transition-colors border border-line bg-surface text-ink hover:bg-surface-2 h-10 px-4 py-2"
                      onClick={() => setIsOpen(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="inline-flex items-center justify-center rounded-[8px] text-[13px] font-semibold bg-accent text-nav-ink hover:bg-accent-hover h-10 px-4 py-2"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

function DeleteConfirmationModal({
  isOpen,
  setIsOpen,
  onConfirm
}: {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onConfirm: () => void;
}) {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-[60]" onClose={() => setIsOpen(false)}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="overlay fixed inset-0" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md bg-surface rounded-[10px] p-6 border border-line shadow-card text-left">
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-negative-soft">
                    <ExclamationTriangleIcon className="h-6 w-6 text-negative stroke-2" aria-hidden="true" />
                  </div>
                  <div>
                    <Dialog.Title as="h3" className="text-[18px] font-bold tracking-[-0.02em] text-ink">
                      Delete Project
                    </Dialog.Title>
                    <p className="text-[13px] text-mute mt-1">This action cannot be undone.</p>
                  </div>
                </div>
                
                <p className="text-[13px] text-mute mb-8">
                  Are you sure you want to delete this project? All items inside will be permanently removed.
                </p>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    className="inline-flex items-center justify-center rounded-[8px] text-[13px] font-semibold transition-colors border border-line bg-surface text-ink hover:bg-surface-2 h-10 px-4 py-2"
                    onClick={() => setIsOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center justify-center rounded-[8px] text-[13px] font-semibold bg-negative text-nav-ink hover:opacity-90 h-10 px-4 py-2 transition-opacity"
                    onClick={onConfirm}
                  >
                    Delete Project
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

