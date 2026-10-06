'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { UserIcon, ArrowRightOnRectangleIcon, KeyIcon, Bars3Icon, TrashIcon, CodeBracketIcon } from '@heroicons/react/24/outline';
import { Dialog } from '@headlessui/react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

export default function Header() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deletePassword, setDeletePassword] = useState('');
  const [isProfileSidebarOpen, setIsProfileSidebarOpen] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  useEffect(() => {
    const handleSidebarToggle = (event: CustomEvent) => {
      setIsSidePanelOpen(event.detail.isOpen);
    };

    window.addEventListener('sidebarToggle', handleSidebarToggle as EventListener);
    
    return () => {
      window.removeEventListener('sidebarToggle', handleSidebarToggle as EventListener);
    };
  }, []);

  const handleSidebarToggle = () => {
    const newState = true;
    setIsSidePanelOpen(newState);
    
    window.dispatchEvent(new CustomEvent('openSidebar', { 
      detail: { isOpen: newState } 
    }));
  };

  const isMainPage = pathname === '/';

  const handleSignOut = () => {
    signOut({ callbackUrl: '/auth/signin' });
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters long');
      return;
    }

    try {
      setIsLoading(true);
      await axios.post('/api/auth/change-password', {
        currentPassword,
        newPassword
      });
      
      toast.success('Password changed successfully');
      setIsPasswordModalOpen(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to change password';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <header className="bg-nav border-b border-nav-line sticky top-0 z-40">
        <div className="px-4 sm:px-7">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              {isMainPage && isMobile && !isSidePanelOpen && (
                <button
                  onClick={handleSidebarToggle}
                  className="inline-flex h-[34px] w-[34px] items-center justify-center rounded-[8px] bg-nav-hover border border-nav-line text-nav-ink hover:bg-nav-strong transition-colors"
                  aria-label="Open sidebar"
                >
                  <Bars3Icon className="h-[17px] w-[17px] stroke-2" />
                </button>
              )}
              <div className="flex-shrink-0">
                <Link href="/" className="font-display text-[18px] font-medium text-accent">
                  CopyCat
                </Link>
              </div>
            </div>
            
            <div className="ml-4 flex items-center gap-2">
              {status === 'authenticated' ? (
                <div className="relative">
                  <button
                    onClick={() => setIsProfileSidebarOpen(true)}
                    className="flex items-center space-x-2 bg-nav-hover border border-nav-line py-1.5 px-3 rounded-[8px] text-nav-ink hover:bg-nav-strong transition-colors"
                  >
                    <UserIcon className="h-4 w-4 stroke-2 text-nav-ink" />
                    <span className="text-[13px] font-medium text-header-text">{session.user.name}</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link
                    href="/auth/signin"
                    className="text-[13px] font-medium text-header-muted hover:text-header-text px-3 py-2 rounded-[8px] transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/register"
                    className="bg-accent text-on-brass text-[13px] font-semibold px-4 py-2 rounded-[8px] border border-accent hover:bg-accent-hover hover:border-accent-hover hover:text-nav-hover-ink transition-colors"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Profile Sidebar */}
      <Dialog
        open={isProfileSidebarOpen}
        onClose={() => setIsProfileSidebarOpen(false)}
        className="fixed z-50 inset-0"
      >
        <div className="flex justify-end min-h-screen">
          <div className="overlay fixed inset-0" aria-hidden="true" />
          
          <div className="relative bg-surface w-full max-w-xs h-full p-6 shadow-card border-l border-line animate-slide-in-right">
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-display text-[19px] font-medium text-ink">Profile</h2>
              <button 
                onClick={() => setIsProfileSidebarOpen(false)}
                className="inline-flex h-[34px] w-[34px] items-center justify-center rounded-[8px] bg-canvas border border-line text-mute hover:bg-surface-2 transition-colors"
              >
                <ArrowRightOnRectangleIcon className="h-[17px] w-[17px] stroke-2 rotate-180" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="flex items-center space-x-3 p-4 bg-surface-2 rounded-[10px] border border-line-soft">
                <div className="h-10 w-10 rounded-full bg-accent flex items-center justify-center text-on-brass font-semibold">
                  {session?.user?.name?.[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13.5px] font-semibold text-ink truncate">{session?.user?.name}</p>
                  <p className="text-[12px] text-mute truncate">{session?.user?.email}</p>
                </div>
              </div>

              <div className="space-y-1">
                <button
                  onClick={() => {
                    setIsPasswordModalOpen(true);
                    setIsProfileSidebarOpen(false);
                  }}
                  className="flex w-full items-center px-3 py-2 text-[13.5px] font-medium text-ink hover:bg-surface-2 rounded-[7px] transition-colors group"
                >
                  <KeyIcon className="h-[17px] w-[17px] stroke-2 mr-3 text-mute group-hover:text-accent" />
                  Change Password
                </button>
                <button
                  onClick={handleSignOut}
                  className="flex w-full items-center px-3 py-2 text-[13.5px] font-medium text-ink hover:bg-surface-2 rounded-[7px] transition-colors group"
                >
                  <ArrowRightOnRectangleIcon className="h-[17px] w-[17px] stroke-2 mr-3 text-mute group-hover:text-ink" />
                  Sign Out
                </button>
                <a
                  href="https://krishnanaths.deno.dev"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center px-3 py-2 text-[13.5px] font-medium text-ink hover:bg-surface-2 rounded-[7px] transition-colors group mt-2"
                >
                  <CodeBracketIcon className="h-[17px] w-[17px] stroke-2 mr-3 text-mute group-hover:text-accent" />
                  Developer
                </a>
              </div>

              <div className="pt-6 border-t border-line-soft">
                <button
                  onClick={() => {
                    setIsDeleteModalOpen(true);
                    setIsProfileSidebarOpen(false);
                  }}
                  className="flex w-full items-center px-3 py-2 text-[13.5px] font-medium text-negative hover:bg-negative-soft rounded-[7px] transition-colors group"
                >
                  <TrashIcon className="h-[17px] w-[17px] stroke-2 mr-3" />
                  Delete Account
                </button>
              </div>
            </div>
            
            <div className="absolute bottom-6 left-6 right-6">
              <p className="text-[11.5px] text-faint text-center font-medium">
                CopyCat &copy; {new Date().getFullYear()}
              </p>
            </div>
          </div>
        </div>
      </Dialog>

      <Dialog
        open={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        className="fixed z-50 inset-0 overflow-y-auto"
      >
        <div className="flex items-center justify-center min-h-screen p-4">
          <div className="overlay fixed inset-0" aria-hidden="true" />

          <div className="relative bg-surface rounded-[12px] w-full max-w-md mx-4 p-6 shadow-modal border border-line">
            <div className="space-y-2 text-center mb-6">
              <h3 className="font-display text-[21px] font-medium text-ink">
                Change Password
              </h3>
              <p className="text-[13px] text-mute">Ensure your account is using a secure password</p>
            </div>
            
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="space-y-2">
                <label className="text-[12.5px] font-semibold leading-none text-ink">
                  Current Password
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="flex h-10 w-full rounded-[8px] border border-line bg-surface px-3 py-2 text-[13px] text-ink placeholder:text-faint focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent focus-visible:border-accent disabled:cursor-not-allowed disabled:opacity-50"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-[12.5px] font-semibold leading-none text-ink">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="flex h-10 w-full rounded-[8px] border border-line bg-surface px-3 py-2 text-[13px] text-ink placeholder:text-faint focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent focus-visible:border-accent disabled:cursor-not-allowed disabled:opacity-50"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-[12.5px] font-semibold leading-none text-ink">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="flex h-10 w-full rounded-[8px] border border-line bg-surface px-3 py-2 text-[13px] text-ink placeholder:text-faint focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent focus-visible:border-accent disabled:cursor-not-allowed disabled:opacity-50"
                  required
                />
              </div>
              
              <div className="flex justify-end space-x-3 pt-6">
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="inline-flex items-center justify-center rounded-[8px] text-[13px] font-semibold transition-colors border border-line bg-canvas text-ink-2 hover:bg-surface-2 hover:border-accent h-10 px-4 py-2 disabled:pointer-events-none disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="inline-flex items-center justify-center rounded-[8px] text-[13px] font-semibold bg-accent text-on-brass border border-accent hover:bg-accent-hover hover:border-accent-hover hover:text-nav-hover-ink h-10 px-4 py-2 disabled:pointer-events-none disabled:opacity-50"
                >
                  {isLoading ? 'Changing...' : 'Change Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </Dialog>

      <Dialog
        open={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        className="fixed z-50 inset-0 overflow-y-auto"
      >
        <div className="flex items-center justify-center min-h-screen p-4">
          <div className="overlay fixed inset-0" aria-hidden="true" />

          <div className="relative bg-surface rounded-[12px] w-full max-w-md mx-4 p-6 shadow-modal border border-line">
            <div className="space-y-4 text-center mb-8">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-negative-soft">
                <TrashIcon className="h-7 w-7 text-negative stroke-2" />
              </div>
              <div>
                <h3 className="font-display text-[21px] font-medium text-ink">
                  Delete Account
                </h3>
                <p className="text-[13px] text-mute mt-2">
                  This action is permanent and cannot be undone. All your projects, items, and settings will be permanently deleted.
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <p className="text-[12.5px] font-semibold text-mute text-center">
                  Type <span className="text-negative">DELETE</span> to confirm
                </p>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="DELETE"
                  className="flex h-11 w-full rounded-[8px] border border-line bg-surface px-4 py-2 text-center text-[13px] font-semibold text-negative placeholder:text-faint focus:outline-none focus:ring-1 focus:ring-negative transition-colors"
                />
              </div>

              <div className="space-y-2">
                <p className="text-[12.5px] font-semibold text-mute text-center">
                  Verify your password
                </p>
                <input
                  type="password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  placeholder="Enter your password"
                  className="flex h-11 w-full rounded-[8px] border border-line bg-surface px-4 py-2 text-center text-[13px] font-medium text-ink placeholder:text-faint focus:outline-none focus:ring-1 focus:ring-accent transition-colors"
                />
              </div>
            </div>
            
            <div className="flex flex-col space-y-3 pt-8">
              <button
                type="button"
                disabled={isLoading || deleteConfirmText !== 'DELETE' || !deletePassword}
                onClick={async () => {
                  try {
                    setIsLoading(true);
                    await axios.delete('/api/auth/delete-account', {
                      data: { password: deletePassword }
                    });
                    toast.success('Account deleted successfully');
                    signOut({ callbackUrl: '/auth/signin' });
                  } catch (error: any) {
                    toast.error(error.response?.data?.error || 'Failed to delete account');
                    setIsLoading(false);
                  }
                }}
                className="inline-flex items-center justify-center rounded-[8px] text-[13px] font-semibold transition-opacity bg-negative text-on-bad hover:opacity-90 h-11 px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Deleting...' : 'Permanently Delete My Account'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setDeleteConfirmText('');
                }}
                className="inline-flex items-center justify-center rounded-[8px] text-[13px] font-medium transition-colors text-mute hover:text-ink h-11 px-4 py-2"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </Dialog>
    </>
  );
}
 