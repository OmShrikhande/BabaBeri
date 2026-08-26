import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AgencyDetail from './AgencyDetail';

/** Route wrapper: /sub-admins/:adminCode/:masterAgencyId/:agencyId → hosts via API */
const AgencyHostDetail = () => {
  const { agencyId } = useParams();
  const navigate = useNavigate();

  return (
    <AgencyDetail
      agencyId={agencyId}
      onBack={() => navigate(-1)}
    />
  );
};

export default AgencyHostDetail;
