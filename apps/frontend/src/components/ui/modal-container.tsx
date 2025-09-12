'use client';

import React from 'react';

import { useModal } from '@/contexts/modal-context';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './dialog';

/**
 * ModalContainer Component
 * 
 * Component hiển thị tất cả modals từ ModalContext
 * Tự động render các modals với configuration tương ứng
 */
export function ModalContainer() {
  const { modals, closeModal } = useModal();

  return (
    <>
      {modals.map((modal) => (
        <Dialog
          key={modal.id}
          open={true}
          onOpenChange={(open) => {
            if (!open && modal.closable) {
              closeModal(modal.id);
            }
          }}
        >
          <DialogContent
            className={`
              ${modal.size === 'sm' ? 'max-w-sm' : ''}
              ${modal.size === 'md' ? 'max-w-lg' : ''}
              ${modal.size === 'lg' ? 'max-w-xl' : ''}
              ${modal.size === 'xl' ? 'max-w-2xl' : ''}
              ${modal.size === 'full' ? 'max-w-full h-full' : ''}
              ${modal.className || ''}
            `}
            hideCloseButton={!modal.closable}
          >
            <DialogHeader>
              <DialogTitle>{modal.title}</DialogTitle>
            </DialogHeader>
            
            <div className="py-4">
              {modal.content}
            </div>
            
            {modal.footer && (
              <DialogFooter>
                {modal.footer}
              </DialogFooter>
            )}
          </DialogContent>
        </Dialog>
      ))}
    </>
  );
}

