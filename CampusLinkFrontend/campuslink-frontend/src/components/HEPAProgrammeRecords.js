import React from 'react';
import HepaLayout from './HepaLayout';
import WorkflowProgrammeArchive from './WorkflowProgrammeArchive';
import { fetchHepaReviewedProgrammes, cancelHepaPublishedProgramme } from '../services/hepaApi';

function HEPAProgrammeRecords() {
  return (
    <WorkflowProgrammeArchive
      Layout={HepaLayout}
      portalRole="HEPA"
      eyebrow="HEPA Portal"
      title="Programme Records"
      subtitle="Browse programmes that have completed HEPA review — approved, rejected, or already held on campus."
      fetchProgrammes={fetchHepaReviewedProgrammes}
      cancelPublishedProgramme={cancelHepaPublishedProgramme}
    />
  );
}

export default HEPAProgrammeRecords;
