import React from 'react';
import {
  CButton,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CSpinner
} from '@coreui/react';

const DeleteConfirmModal = ({ visible, accName, onClose, onConfirm, isLoading }) => {
  return (
    <CModal 
      visible={visible} 
      onClose={onClose}
      backdrop="static"
      keyboard={true}
      alignment="center"
    >
      <CModalHeader>
        <CModalTitle>계정 삭제 확인</CModalTitle>
      </CModalHeader>
      <CModalBody>
        <p>
          <strong>{accName}</strong> 계정을 삭제하시겠습니까?
        </p>
        <p className="text-danger">
          <small>계정을 삭제하면 관련된 모든 정보가 함께 삭제되며 이 작업은 되돌릴 수 없습니다.</small>
        </p>
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" onClick={onClose}>
          취소
        </CButton>
        <CButton 
          color="danger" 
          onClick={onConfirm}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <CSpinner size="sm" className="me-2" />
              삭제 중...
            </>
          ) : '삭제 확인'}
        </CButton>
      </CModalFooter>
    </CModal>
  );
};

export default DeleteConfirmModal; 