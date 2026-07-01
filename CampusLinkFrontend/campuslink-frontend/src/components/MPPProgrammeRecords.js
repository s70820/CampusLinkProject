import React from 'react';
import MppLayout from './MppLayout';
import WorkflowProgrammeArchive from './WorkflowProgrammeArchive';
import { fetchMppReviewedProgrammes, cancelMppPublishedProgramme } from '../services/mppApi';

function MPPProgrammeRecords() {
  return (
    <WorkflowProgrammeArchive
      Layout={MppLayout}
      portalRole="MPP"
      eyebrow="MPP Portal"
      title="Programme Records"
      subtitle="Browse programmes already reviewed by MPP — approved, rejected, forwarded to HEPA, published, or completed."
      fetchProgrammes={fetchMppReviewedProgrammes}
      cancelPublishedProgramme={cancelMppPublishedProgramme}
    />
  );
}

export default MPPProgrammeRecords;
