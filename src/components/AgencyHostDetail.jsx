import React from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import AgencyDetail from './AgencyDetail';

/** Route wrapper: /sub-admins/:adminCode/:masterAgencyId/:agencyId → hosts via hosttoagnc */
const AgencyHostDetail = () => {
  const { masterAgencyId, agencyId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const hosttoagnc = location.state?.hosttoagnc || agencyId;

  return (
    <AgencyDetail
      hosttoagnc={hosttoagnc}
      agencyCode={location.state?.agencyCode || location.state?.agencyId || null}
      masterAgencyCode={location.state?.masterAgencyCode || masterAgencyId}
      onBack={() => navigate(-1)}
    />
  );
};

export default AgencyHostDetail;
