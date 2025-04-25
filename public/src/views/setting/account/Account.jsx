import React, { useState } from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilUser, cilPlus } from '@coreui/icons'
import './Account.css'

// 기존 Context 대신 Zustand store와 커스텀 훅 사용
import { useAccountStore } from '../../../stores/useAccountStore'
import { useAccountActions } from '../../../hooks/useAccountActions'

// 서브 컴포넌트 임포트
import AccountModal from './components/AccountModal'
import DeleteConfirmModal from './components/DeleteConfirmModal'
import EmptyAccountView from './components/EmptyAccountView'
import AccountList from './components/AccountList'
import AlertMessage from './components/AlertMessage'
import LoadingSpinner from './components/LoadingSpinner'

const Account = () => {
  // Zustand store에서 상태 읽기
  const { accounts, isLoading, error } = useAccountStore();
  // 커스텀 훅에서 액션 함수 호출
  const { resetError, addAccount, updateAccount, deleteAccount } = useAccountActions();

  // 로컬 UI 상태
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [modal, setModal] = useState({ visible: false, mode: 'add', title: '계정 추가' });
  const [deleteModal, setDeleteModal] = useState({ visible: false, accountName: '' });
  const [alert, setAlert] = useState({ visible: false, color: 'success', message: '' });

  // 계정 추가 모달 열기
  const openAddModal = () => {
    setSelectedAccount({
      accName: null,
      cp_id: '',
      cp_code: '', 
      cp_ak: '',
      cp_sk: '',
      n_id: '',
      n_sk: ''
    });
    setModal({
      visible: true,
      mode: 'add',
      title: '새 계정 추가'
    });
  };

  // 계정 수정 모달 열기
  const openEditModal = (account) => {
    setSelectedAccount({ ...account });
    setModal({
      visible: true,
      mode: 'edit',
      title: '계정 정보 수정'
    });
  };

  // 모달 닫기
  const closeModal = () => {
    setModal(prev => ({ ...prev, visible: false }));
  };

  // 삭제 확인 모달 열기
  const openDeleteModal = (account) => {
    setDeleteModal({
      visible: true,
      accName: account.accName
    });
  };

  // 삭제 확인 모달 닫기
  const closeDeleteModal = () => {
    setDeleteModal({ visible: false, accName: '' });
  };

  // 계정 저장 (추가 또는 수정)
  const saveAccount = async () => {
    try {
      if (modal.mode === 'add') {
        await addAccount(selectedAccount);
        showAlert('success', '새 계정이 성공적으로 추가되었습니다.');
      } else {
        await updateAccount(selectedAccount);
        showAlert('success', '계정 정보가 성공적으로 수정되었습니다.');
      }
      closeModal();
    } catch (error) {
      console.error('계정 저장 실패:', error);
      showAlert('danger', modal.mode === 'add' ? '계정을 추가하는데 실패했습니다.' : '계정 정보를 수정하는데 실패했습니다.');
    }
  };

  // 계정 삭제
  const handleDeleteAccount = async () => {
    try {
      await deleteAccount(deleteModal.accName);
      showAlert('success', '계정이 성공적으로 삭제되었습니다.');
      closeDeleteModal();
    } catch (error) {
      console.error('계정 삭제 실패:', error);
      showAlert('danger', '계정을 삭제하는데 실패했습니다.');
    }
  };

  // 알림 메시지 표시
  const showAlert = (color, message) => {
    setAlert({ visible: true, color, message });
    setTimeout(() => {
      setAlert(prev => ({ ...prev, visible: false }));
    }, 3000);
  };

  // 계정 정보 변경 처리
  const handleAccountChange = (updatedAccount) => {
    setSelectedAccount(updatedAccount);
  };

  return (
    <CCard className="account-settings mb-4">
      <CCardHeader>
        <div className="d-flex justify-content-between align-items-center">
          <h4 className="mb-0 d-flex align-items-center">
            <CIcon icon={cilUser} size="lg" className="me-2" />
            계정 관리
          </h4>
          <div className="d-flex gap-2">
            <CButton color="primary" size="sm" onClick={openAddModal}>
              <CIcon icon={cilPlus} className="me-1" />
              새 계정 추가
            </CButton>
          </div>
        </div>
      </CCardHeader>
      <CCardBody>
        <AlertMessage 
          visible={alert.visible}
          color={alert.color}
          message={alert.message}
        />
        {error && (
          <AlertMessage 
            visible={true}
            color="danger"
            message={<><strong>오류 발생!</strong> {error}</>}
            onClose={resetError}
          />
        )}
        {isLoading && <LoadingSpinner />}
        {!isLoading && (accounts.length === 0 ? (
          <EmptyAccountView onAddAccount={openAddModal} />
        ) : (
          <AccountList accounts={accounts} onEdit={openEditModal} onDelete={openDeleteModal} />
        ))}
        <AccountModal 
          visible={modal.visible}
          title={modal.title}
          mode={modal.mode}
          account={selectedAccount}
          onClose={closeModal}
          onSave={saveAccount}
          onChange={handleAccountChange}
          isLoading={isLoading}
        />
        <DeleteConfirmModal
          visible={deleteModal.visible}
          accountName={deleteModal.accName}
          onClose={closeDeleteModal}
          onConfirm={handleDeleteAccount}
          isLoading={isLoading}
        />
      </CCardBody>
    </CCard>
  );
};

export default Account;
