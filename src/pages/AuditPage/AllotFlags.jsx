import { Button, Modal } from 'antd';
import React, { useState } from 'react';

const AllotFlag = ({remaining}) => {
  const [showAllotmodal, setShowAllotmodal] = useState(false);

  const handleOpenModal = () => {
    setShowAllotmodal(true);
  };

  const handleCloseModal = () => {
    setShowAllotmodal(false);
  };

  return (
    <div>
      <Button type='primary' onClick={handleOpenModal}>Allot Flags</Button>
      <Modal
        title="Allot Modal"
        open={showAllotmodal}
        onOk={handleCloseModal}
        onCancel={handleCloseModal}
      >
        <p className='text-danger'>
          Total Remaining flags: <span className='fw-bold'>{remaining}</span>
        </p>
      </Modal>
    </div>
  );
};

export default AllotFlag;
