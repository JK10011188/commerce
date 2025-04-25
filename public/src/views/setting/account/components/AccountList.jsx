import React from 'react';
import {
  CButton,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilPencil, cilTrash } from '@coreui/icons';

const AccountList = ({ accounts, onEdit, onDelete }) => {
  return (
    <CTable hover responsive className="account-table">
      <CTableHead>
        <CTableRow>
          <CTableHeaderCell scope="col" className="text-center" width="60">#</CTableHeaderCell>
          <CTableHeaderCell scope="col">계정 이름</CTableHeaderCell>
          <CTableHeaderCell scope="col">쿠팡 정보</CTableHeaderCell>
          <CTableHeaderCell scope="col">네이버 정보</CTableHeaderCell>
          <CTableHeaderCell scope="col" className="text-center" width="130">관리</CTableHeaderCell>
        </CTableRow>
      </CTableHead>
      <CTableBody>
        {accounts.map((account, index) => (
          <CTableRow key={account.id}>
            <CTableDataCell className="text-center">{index + 1}</CTableDataCell>
            <CTableDataCell>
              <div className="fw-bold">{account.accName || account.name}</div>
            </CTableDataCell>
            <CTableDataCell>
              <div><small className="text-muted">쿠팡 로그인 ID:</small> {account.cp_id}</div>
              <div><small className="text-muted">쿠팡 업체 코드:</small> {account.cp_code}</div>
            </CTableDataCell>
            <CTableDataCell>
              <div><small className="text-muted">네이버 APP ID:</small> {account.n_id}</div>
            </CTableDataCell>
            <CTableDataCell>
              <div className="d-flex justify-content-center gap-2">
                <CButton color="info" size="sm" variant="ghost" onClick={() => onEdit(account)}>
                  <CIcon icon={cilPencil} />
                </CButton>
                <CButton color="danger" size="sm" variant="ghost" onClick={() => onDelete(account)}>
                  <CIcon icon={cilTrash} />
                </CButton>
              </div>
            </CTableDataCell>
          </CTableRow>
        ))}
      </CTableBody>
    </CTable>
  );
};

export default AccountList;
