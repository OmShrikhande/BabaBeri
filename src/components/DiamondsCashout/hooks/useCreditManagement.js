import { useState, useCallback } from 'react';
import authService from '../../../services/authService';
import { INITIAL_CREDIT_FORM } from '../constants';

export const useCreditManagement = (addToast, onSuccess) => {
  const [creditForm, setCreditForm] = useState(INITIAL_CREDIT_FORM);
  const [editingCreditId, setEditingCreditId] = useState(null);
  const [creditModalOpen, setCreditModalOpen] = useState(false);
  const [submittingCredit, setSubmittingCredit] = useState(false);
  const [deletingCreditId, setDeletingCreditId] = useState(null);

  const resetCreditForm = useCallback(() => {
    setCreditForm(INITIAL_CREDIT_FORM);
    setEditingCreditId(null);
  }, []);

  const handleCreditFieldChange = useCallback((field, value) => {
    setCreditForm(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const openCreateCreditModal = useCallback(() => {
    resetCreditForm();
    setCreditModalOpen(true);
  }, [resetCreditForm]);

  const openEditCreditModal = useCallback((credit) => {
    setCreditForm({
      usercode: credit.usercode || '',
      diamonds: credit.diamonds?.toString() || '',
      amount: credit.amount?.toString() || '',
      status: credit.status || 'CREDIT',
      transactionId: credit.transactionId || '',
      paymentMethod: credit.paymentMethod || 'MANUAL',
      notes: credit.notes || ''
    });
    setEditingCreditId(credit.id);
    setCreditModalOpen(true);
  }, []);

  const closeCreditModal = useCallback(() => {
    setCreditModalOpen(false);
    resetCreditForm();
  }, [resetCreditForm]);

  const validateCreditPayload = useCallback(() => {
    const requiredFields = ['usercode', 'diamonds', 'status'];
    const missing = requiredFields.filter(field => {
      const value = creditForm[field];
      return value === undefined || value === null || String(value).trim() === '';
    });

    if (missing.length) {
      addToast(`Please fill: ${missing.join(', ')}`, 'error');
      return false;
    }

    if (Number.isNaN(Number(creditForm.diamonds))) {
      addToast('Diamonds amount must be a number', 'error');
      return false;
    }

    if (creditForm.amount && Number.isNaN(Number(creditForm.amount))) {
      addToast('Cash amount must be a number', 'error');
      return false;
    }

    return true;
  }, [creditForm, addToast]);

  const handleSubmitCredit = useCallback(async (event) => {
    event?.preventDefault?.();
    if (submittingCredit) {
      return;
    }

    if (!validateCreditPayload()) {
      return;
    }

    setSubmittingCredit(true);

    const payload = {
      usercode: creditForm.usercode.trim(),
      diamonds: Number(creditForm.diamonds),
      status: creditForm.status,
      amount: creditForm.amount ? Number(creditForm.amount) : undefined,
      transactionId: creditForm.transactionId?.trim() || undefined,
      paymentMethod: creditForm.paymentMethod || undefined,
      notes: creditForm.notes?.trim() || undefined,
      id: editingCreditId || undefined
    };

    try {
      const response = editingCreditId
        ? await authService.updateDiamondCredit?.(editingCreditId, payload)
        : await authService.saveDiamond(payload);

      if (response?.success) {
        addToast(response.message || 'Diamond credit saved successfully', 'success');
        closeCreditModal();
        onSuccess?.();
      } else {
        addToast(response?.error || 'Failed to save diamond credit', 'error');
      }
    } catch (error) {
      console.error('Error saving diamond credit:', error);
      addToast(error.message || 'Failed to save diamond credit', 'error');
    } finally {
      setSubmittingCredit(false);
    }
  }, [creditForm, editingCreditId, submittingCredit, validateCreditPayload, addToast, closeCreditModal, onSuccess]);

  const handleDeleteCredit = useCallback(async (creditId, onDeleteSuccess) => {
    if (!creditId) {
      return;
    }
    setDeletingCreditId(creditId);
    try {
      const response = await authService.deleteDiamondCredit?.(creditId);
      if (response?.success) {
        addToast('Credit record deleted', 'success');
        onDeleteSuccess?.();
      } else {
        addToast(response?.error || 'Failed to delete credit record', 'error');
      }
    } catch (error) {
      console.error('Error deleting credit record:', error);
      addToast(error.message || 'Failed to delete credit record', 'error');
    } finally {
      setDeletingCreditId(null);
    }
  }, [addToast]);

  return {
    creditForm,
    editingCreditId,
    creditModalOpen,
    submittingCredit,
    deletingCreditId,
    handleCreditFieldChange,
    openCreateCreditModal,
    openEditCreditModal,
    closeCreditModal,
    handleSubmitCredit,
    handleDeleteCredit
  };
};
