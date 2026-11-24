import React from 'react';

export default function SkeletonCard() {
  return (
    <div className="cb-movie-card p-2">
      <div className="cb-poster-wrap rounded cb-skeleton mb-3" />
      <div className="px-2 pb-2">
        <div className="cb-skeleton mb-2" style={{ height: '12px', width: '65%' }} />
        <div className="cb-skeleton mb-3" style={{ height: '18px', width: '88%' }} />
        <div className="cb-skeleton" style={{ height: '32px', width: '100%' }} />
      </div>
    </div>
  );
}
