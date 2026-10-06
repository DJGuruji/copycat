import { useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { 
  PencilIcon, 
  TrashIcon, 
  XMarkIcon, 
  ClipboardIcon, 
  PlusIcon, 
  MagnifyingGlassIcon, 
  ExclamationTriangleIcon,
  EyeIcon,
  EyeSlashIcon,
  LockClosedIcon,
  ArrowTopRightOnSquareIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { Fragment } from 'react';

type ValueType = 'text' | 'password' | 'number' | 'link';

const VALUE_TYPES: { id: ValueType; label: string }[] = [
  { id: 'text', label: 'Text' },
  { id: 'password', label: 'Password' },
  { id: 'number', label: 'Number' },
  { id: 'link', label: 'Link' },
];

const TYPE_LABELS: Record<ValueType, string> = {
  text: 'Text',
  password: 'Pass',
  number: 'Num',
  link: 'Link',
};

function toExternalUrl(value: string) {
  const trimmed = value.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (/^[a-z][a-z0-9+.-]*:/i.test(trimmed)) return null;
  return `https://${trimmed}`;
}

interface Item {
  _id: string;
  key?: string;
  value?: string;
  valueType?: ValueType;
  encrypted?: boolean;
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

interface TodoDetailProps {
  todo: Todo;
  onUpdateTodo: (todo: Todo) => void;
}

export default function TodoDetail({ todo, onUpdateTodo }: TodoDetailProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<Item | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [itemToDelete, setItemToDelete] = useState<Item | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [visibleValues, setVisibleValues] = useState<Record<string, boolean>>({});
  const [formKey, setFormKey] = useState('');
  const [formValue, setFormValue] = useState('');
  const [formType, setFormType] = useState<ValueType>('text');
  const [formEncrypted, setFormEncrypted] = useState(true);
  const [showFormValue, setShowFormValue] = useState(false);

  const resetForm = (item?: Item | null) => {
    setFormKey(item?.key || '');
    setFormValue(item?.value || '');
    setFormType(item?.valueType || 'text');
    setFormEncrypted(item ? item.encrypted !== false : true);
    setShowFormValue(false);
  };

  const toggleValueVisibility = (itemId: string) => {
    setVisibleValues(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy text: ', err);
      toast.error('Failed to copy to clipboard');
    }
  };

  const handleAddItem = () => {
    setCurrentItem(null);
    setIsEditing(false);
    resetForm(null);
    setIsModalOpen(true);
  };

  const handleEditItem = (item: Item) => {
    setCurrentItem(item);
    setIsEditing(true);
    resetForm(item);
    setIsModalOpen(true);
  };

  const handleDeleteItem = (item: Item) => {
    setItemToDelete(item);
    setIsDeleteConfirmOpen(true);
  };

  const confirmDeleteItem = () => {
    if (itemToDelete) {
      const updatedTodo = {
        ...todo,
        items: todo.items.filter((item) => item._id !== itemToDelete._id),
      };
      onUpdateTodo(updatedTodo);
      setItemToDelete(null);
      setIsDeleteConfirmOpen(false);
      toast.success('Item deleted successfully');
    }
  };

  const cancelDeleteItem = () => {
    setItemToDelete(null);
    setIsDeleteConfirmOpen(false);
  };

  const handleSubmitItem = (formData: Item) => {
    let updatedItems;
    if (isEditing && currentItem) {
      updatedItems = todo.items.map((item) =>
        item._id === currentItem._id ? { ...item, ...formData } : item
      );
    } else {
      updatedItems = [...todo.items, formData];
    }

    onUpdateTodo({
      ...todo,
      items: updatedItems,
    });
    setIsModalOpen(false);
  };

  const filteredItems = todo.items.filter(item =>
  (item.key?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.value?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="px-4 py-4 sm:px-7 sm:py-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="font-display text-[22px] font-medium text-ink">
            {todo.title}
          </h1>
          <div className="flex items-center space-x-3 text-[12px] font-medium text-mute">
            <span className="font-mono">Created {new Date(todo.createdAt).toLocaleDateString()}</span>
            <span>•</span>
            <span>{todo.items.length} {todo.items.length === 1 ? 'item' : 'items'}</span>
          </div>
        </div>
        <button
          onClick={handleAddItem}
          className="inline-flex items-center justify-center rounded-[8px] bg-accent px-4 py-2 text-[13px] font-semibold text-on-brass border border-accent hover:bg-accent-hover hover:border-accent-hover hover:text-nav-hover-ink transition-colors"
        >
          <PlusIcon className="h-[17px] w-[17px] stroke-2 mr-2" />
          Add Item
        </button>
      </div>

      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-[17px] w-[17px] stroke-2 text-faint" />
        <input
          type="text"
          placeholder="Search items by key or value..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-10 py-2 bg-surface border border-line rounded-[8px] text-[13px] text-ink placeholder:text-faint focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent transition-colors"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-faint hover:text-ink transition-colors"
          >
            <XMarkIcon className="h-4 w-4 stroke-2" />
          </button>
        )}
      </div>

      <div className="rounded-[10px] border border-line bg-surface overflow-hidden shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-y border-line-soft bg-surface-2">
                <th className="px-4 py-2.5 text-[11.5px] font-semibold text-mute">Key</th>
                <th className="px-4 py-2.5 text-[11.5px] font-semibold text-mute">Value</th>
                <th className="px-4 py-2.5 text-right text-[11.5px] font-semibold text-mute">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-2">
              {filteredItems.map((item) => (
                <tr key={item._id} className="group hover:bg-canvas transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-[13px] font-medium text-ink truncate max-w-[200px]" title={item.key}>
                        {item.key || '-'}
                      </span>
                      {item.key && (
                        <button
                          onClick={() => copyToClipboard(item.key!)}
                          className="p-1 text-mute hover:text-accent transition-colors"
                          title="Copy key"
                        >
                          <ClipboardIcon className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-2">
                      <span className="shrink-0 rounded-[6px] bg-surface-2 px-1.5 py-0.5 text-[11px] font-semibold text-mute">
                        {TYPE_LABELS[item.valueType || 'text']}
                      </span>
                      {item.encrypted !== false && (
                        <LockClosedIcon className="h-3.5 w-3.5 shrink-0 stroke-2 text-faint" title="Encrypted" />
                      )}
                      {(item.valueType || 'text') === 'link' && item.value && toExternalUrl(item.value) ? (
                        <a
                          href={toExternalUrl(item.value)!}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 max-w-[300px] min-w-0 text-[13px] font-mono text-accent hover:text-accent-hover"
                          title={item.value}
                        >
                          <span className="truncate">{item.value}</span>
                          <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5 shrink-0 stroke-2" />
                        </a>
                      ) : (
                        <span
                          className="text-[13px] font-mono text-ink truncate max-w-[300px]"
                          title={(item.valueType || 'text') === 'password'
                            ? (visibleValues[item._id] ? item.value : undefined)
                            : item.value}
                        >
                          {(item.valueType || 'text') === 'password'
                            ? (visibleValues[item._id] ? (item.value || '-') : '••••••••')
                            : (item.value || '-')}
                        </span>
                      )}
                      <div className="flex items-center space-x-1">
                        {(item.valueType || 'text') === 'password' && (
                          <button
                            onClick={() => toggleValueVisibility(item._id)}
                            className="p-1 text-mute hover:text-accent transition-colors"
                            title={visibleValues[item._id] ? "Hide value" : "Show value"}
                          >
                            {visibleValues[item._id] ? (
                              <EyeSlashIcon className="h-3.5 w-3.5" />
                            ) : (
                              <EyeIcon className="h-3.5 w-3.5" />
                            )}
                          </button>
                        )}
                        {item.value && (
                          <button
                            onClick={() => copyToClipboard(item.value!)}
                            className="p-1 text-mute hover:text-accent transition-colors"
                            title="Copy value"
                          >
                            <ClipboardIcon className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <button
                        onClick={() => handleEditItem(item)}
                        className="inline-flex h-[34px] w-[34px] items-center justify-center rounded-[8px] bg-surface border border-line text-mute hover:bg-surface-2 transition-colors"
                      >
                        <PencilIcon className="h-[17px] w-[17px] stroke-2" />
                      </button>
                      <button
                        onClick={() => handleDeleteItem(item)}
                        className="inline-flex h-[34px] w-[34px] items-center justify-center rounded-[8px] bg-surface border border-line text-mute hover:bg-negative-soft hover:text-negative transition-colors"
                      >
                        <TrashIcon className="h-[17px] w-[17px] stroke-2" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className="p-3 bg-surface-2 rounded-full border border-line-soft">
                        <PlusIcon className="h-6 w-6 stroke-2 text-faint" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-[13.5px] font-semibold text-ink">
                          {searchQuery ? 'No items found.' : 'No items yet.'}
                        </p>
                        <p className="text-[12.5px] text-mute">
                          {searchQuery ? 'Try adjusting your search query.' : 'Click "Add Item" to populate this project.'}
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Transition appear show={isModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setIsModalOpen(false)}>
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
                <Dialog.Panel className="w-full max-w-md bg-surface rounded-[12px] p-6 border border-line shadow-modal">
                  <div className="mb-6">
                    <Dialog.Title as="h3" className="font-display text-[21px] font-medium text-ink">
                      {isEditing ? 'Edit Item' : 'Add Item'}
                    </Dialog.Title>
                    <p className="text-[13px] text-mute mt-1">
                      {isEditing ? 'Modify your item details below' : 'Store a new key-value pair in this project'}
                    </p>
                  </div>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      let value = formValue.trim();
                      if (formType === 'link' && value && !/^https?:\/\//i.test(value)) {
                        value = `https://${value}`;
                      }
                      const data: Item = {
                        _id: currentItem?._id || `temp_${Math.random().toString(36).substr(2, 9)}`,
                        key: formKey.trim(),
                        value,
                        valueType: formType,
                        encrypted: formEncrypted,
                        createdAt: currentItem?.createdAt || new Date().toISOString(),
                      };
                      handleSubmitItem(data);
                    }}
                    className="space-y-4"
                  >
                    <div className="space-y-2">
                      <label className="text-[12.5px] font-semibold leading-none text-ink">Key</label>
                      <input
                        type="text"
                        name="key"
                        value={formKey}
                        onChange={(e) => setFormKey(e.target.value)}
                        required
                        placeholder="e.g. API_URL, Primary Color"
                        className="flex h-10 w-full rounded-[8px] border border-line bg-surface px-3 py-2 text-[13px] text-ink placeholder:text-faint focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent focus-visible:border-accent"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[12.5px] font-semibold leading-none text-ink">Type</label>
                      <div className="grid grid-cols-4 gap-1 rounded-[8px] bg-surface-2 p-1">
                        {VALUE_TYPES.map((option) => (
                          <button
                            key={option.id}
                            type="button"
                            onClick={() => {
                              setFormType(option.id);
                              setShowFormValue(false);
                            }}
                            className={`rounded-[6px] px-2 py-1.5 text-[12px] font-semibold transition-colors ${
                              formType === option.id
                                ? 'bg-surface text-ink shadow-card'
                                : 'text-mute hover:text-ink'
                            }`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[12.5px] font-semibold leading-none text-ink">Value</label>
                      {formType === 'text' ? (
                        <textarea
                          name="value"
                          value={formValue}
                          onChange={(e) => setFormValue(e.target.value)}
                          required
                          placeholder="e.g. primary color, note"
                          className="flex min-h-[100px] w-full rounded-[8px] border border-line bg-surface px-3 py-2 text-[13px] text-ink placeholder:text-faint focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent focus-visible:border-accent resize-none"
                        />
                      ) : (
                        <div className="relative">
                          <input
                            name="value"
                            type={
                              formType === 'password' && !showFormValue
                                ? 'password'
                                : formType === 'number'
                                  ? 'number'
                                  : 'text'
                            }
                            step={formType === 'number' ? 'any' : undefined}
                            inputMode={formType === 'number' ? 'decimal' : undefined}
                            value={formValue}
                            onChange={(e) => setFormValue(e.target.value)}
                            required
                            placeholder={
                              formType === 'password'
                                ? 'Enter password'
                                : formType === 'number'
                                  ? 'e.g. 42'
                                  : 'https://example.com'
                            }
                            className="flex h-10 w-full rounded-[8px] border border-line bg-surface px-3 py-2 text-[13px] text-ink placeholder:text-faint focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent focus-visible:border-accent pr-10"
                          />
                          {formType === 'password' && (
                            <button
                              type="button"
                              onClick={() => setShowFormValue((prev) => !prev)}
                              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-mute hover:text-accent transition-colors"
                              title={showFormValue ? 'Hide value' : 'Show value'}
                            >
                              {showFormValue ? (
                                <EyeSlashIcon className="h-4 w-4" />
                              ) : (
                                <EyeIcon className="h-4 w-4" />
                              )}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                    <label className="flex items-center gap-2 text-[13px] text-mute cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={formEncrypted}
                        onChange={(e) => setFormEncrypted(e.target.checked)}
                        className="h-4 w-4 rounded border-line bg-surface accent-[var(--brass)]"
                      />
                      Encrypt this value
                    </label>
                    <div className="flex justify-end space-x-3 pt-6">
                      <button
                        type="button"
                        onClick={() => setIsModalOpen(false)}
                        className="inline-flex items-center justify-center rounded-[8px] text-[13px] font-semibold transition-colors border border-line bg-canvas text-ink-2 hover:bg-surface-2 hover:border-accent h-10 px-4 py-2"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="inline-flex items-center justify-center rounded-[8px] text-[13px] font-semibold bg-accent text-on-brass border border-accent hover:bg-accent-hover hover:border-accent-hover hover:text-nav-hover-ink h-10 px-4 py-2"
                      >
                        {isEditing ? 'Save Changes' : 'Add Item'}
                      </button>
                    </div>
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      <Transition appear show={isDeleteConfirmOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={cancelDeleteItem}>
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
                <Dialog.Panel className="w-full max-w-md bg-surface rounded-[12px] p-6 border border-line shadow-modal text-left">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-negative-soft">
                      <ExclamationTriangleIcon className="h-6 w-6 text-negative stroke-2" aria-hidden="true" />
                    </div>
                    <div>
                      <Dialog.Title as="h3" className="font-display text-[19px] font-medium text-ink">
                        Delete Item
                      </Dialog.Title>
                      <p className="text-[13px] text-mute mt-1">This action cannot be undone.</p>
                    </div>
                  </div>
                  
                  <p className="text-[13px] text-mute mb-8">
                    Are you sure you want to delete this item? It will be removed from <span className="text-ink font-medium">{todo.title}</span>.
                  </p>

                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={cancelDeleteItem}
                      className="inline-flex items-center justify-center rounded-[8px] text-[13px] font-semibold transition-colors border border-line bg-canvas text-ink-2 hover:bg-surface-2 hover:border-accent h-10 px-4 py-2"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={confirmDeleteItem}
                      className="inline-flex items-center justify-center rounded-[8px] text-[13px] font-semibold bg-negative text-on-bad hover:opacity-90 h-10 px-4 py-2 transition-opacity"
                    >
                      Delete
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}

